
import json
import logging
import os
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from app.core.config import settings
from app.models import ContactSubmission

logger = logging.getLogger(__name__)


def send_contact_notification(submission: ContactSubmission) -> bool:
    """Send a contact notification using the Resend API."""

    api_key = os.getenv("RESEND_API_KEY", "").strip()

    if not api_key:
        logger.warning("Resend API key is not configured")
        return False

    payload = {
        "from": "Portfolio Contact <onboarding@resend.dev>",
        "to": [settings.contact_recipient_email],
        "reply_to": submission.email,
        "subject": f"Portfolio contact: {submission.subject}",
        "text": (
            "A new message was submitted through your portfolio contact form.\n\n"
            f"Name: {submission.name}\n"
            f"Email: {submission.email}\n"
            f"Subject: {submission.subject}\n\n"
            "Message:\n"
            f"{submission.message}\n\n"
            f"Submission ID: {submission.id}\n"
        ),
    }

    request = Request(
        "https://api.resend.com/emails",
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )

    try:
        with urlopen(request, timeout=20) as response:
            if response.status not in (200, 201):
                logger.error(
                    "Resend returned unexpected status %s",
                    response.status,
                )
                return False

        logger.info(
            "Contact submission %s email notification sent",
            submission.id,
        )
        return True

    except HTTPError as exc:
        logger.error(
            "Resend API rejected contact submission %s: HTTP %s",
            submission.id,
            exc.code,
        )
        return False

    except (URLError, OSError, TimeoutError):
        logger.exception(
            "Contact submission %s was saved, but its email notification failed",
            submission.id,
        )
        return False
