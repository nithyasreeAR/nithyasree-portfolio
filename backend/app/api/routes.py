import logging
from collections import defaultdict, deque
from threading import Lock
from time import monotonic

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models import ContactSubmission
from app.schemas.contact import ContactAccepted, ContactCreate
from app.services.email import send_contact_notification

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api")
_rate_lock = Lock()
_contact_attempts: dict[str, deque[float]] = defaultdict(deque)
_rate_window_seconds = 60
_rate_limit = 5


@router.get("/health")
def health():
    return {"status": "ok"}


@router.post("/contact", response_model=ContactAccepted, status_code=201)
def submit_contact(payload: ContactCreate, request: Request, db: Session = Depends(get_db)) -> ContactAccepted:
    client_ip = request.client.host if request.client else "unknown"
    now = monotonic()
    with _rate_lock:
        attempts = _contact_attempts[client_ip]
        while attempts and now - attempts[0] >= _rate_window_seconds:
            attempts.popleft()
        if len(attempts) >= _rate_limit:
            raise HTTPException(status_code=429, detail="Too many messages. Please try again in a minute.")
        attempts.append(now)
    submission = ContactSubmission(**payload.model_dump())
    try:
        db.add(submission)
        db.commit()
        db.refresh(submission)
    except SQLAlchemyError as error:
        db.rollback()
        logger.exception("Contact submission could not be persisted")
        raise HTTPException(status_code=503, detail="The message could not be saved. Please email me directly.") from error
    email_sent = send_contact_notification(submission)
    return ContactAccepted(
        message="Your message was saved and an email notification was sent." if email_sent else "Your message was saved, but the email notification could not be sent.",
        id=submission.id,
        email_sent=email_sent,
    )
