
import logging
import re
import smtplib
import ssl
from email.message import EmailMessage

import resend

from app.core.config import settings
from app.models import ContactSubmission

logger = logging.getLogger(__name__)


def send_contact_notification(submission: ContactSubmission) -> bool:
    """Send a contact notification through Resend or configured SMTP."""

    api_key = settings.resend_api_key.strip()

    if not api_key:
        logger.warning("Resend disabled: RESEND_API_KEY was not loaded by the backend")

    if api_key:
        if settings.resend_from_email.strip():
            if _send_with_resend(submission, api_key):
                return True
        else:
            logger.error("RESEND_FROM_EMAIL is not configured; Resend notification skipped")
    if all((settings.smtp_host, settings.smtp_username, settings.smtp_password, settings.smtp_from_email)):
        return _send_with_smtp(submission)

    logger.warning("No email provider delivered contact submission %s", submission.id)
    return False


def _message_text(submission: ContactSubmission) -> str:
    return (
        "A new message was submitted through your portfolio contact form.\n\n"
        f"Name: {submission.name}\n"
        f"Email: {submission.email}\n"
        f"Subject: {submission.subject}\n\n"
        "Message:\n"
        f"{submission.message}\n\n"
        f"Submission ID: {submission.id}\n"
    )


def _send_with_resend(submission: ContactSubmission, api_key: str) -> bool:
    payload = {
        "from": settings.resend_from_email,
        "to": [settings.contact_recipient_email],
        "reply_to": submission.email,
        "subject": f"Portfolio contact: {submission.subject}",
        "text": _message_text(submission),
    }

    # Match Resend's official Python SDK flow used by the standalone send.
    resend.api_key = api_key
    try:
        result = resend.Emails.send(payload)
        logger.info(
            "Contact submission %s email notification accepted by Resend (id=%s)",
            submission.id,
            result.get("id") if isinstance(result, dict) else "unknown",
        )
        return True

    except Exception as exc:
        error_type = _redact_resend_secrets(
            str(getattr(exc, "error_type", getattr(exc, "name", type(exc).__name__))),
            api_key,
        )
        error_message = getattr(exc, "message", str(exc))
        status_code = getattr(exc, "code", getattr(exc, "status_code", "unknown"))
        error_message = _redact_resend_secrets(str(error_message), api_key)
        logger.error(
            "Resend send failed for contact submission %s: status=%s, type=%s, message=%s",
            submission.id,
            status_code,
            error_type,
            error_message,
        )
        return False


def _redact_resend_secrets(message: str, api_key: str) -> str:
    message = message.replace(api_key, "[REDACTED_API_KEY]")
    message = re.sub(r"(?i)\bbearer\s+\S+", "Bearer [REDACTED]", message)
    message = re.sub(r"\bre_[A-Za-z0-9_-]+\b", "[REDACTED_API_KEY]", message)
    return " ".join(message.split())[:500]


def _send_with_smtp(submission: ContactSubmission) -> bool:
    message = EmailMessage()
    message["From"] = settings.smtp_from_email
    message["To"] = settings.contact_recipient_email
    message["Reply-To"] = submission.email
    message["Subject"] = f"Portfolio contact: {submission.subject}"
    message.set_content(_message_text(submission))

    try:
        context = ssl.create_default_context()
        with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=settings.smtp_timeout_seconds) as server:
            server.ehlo()
            if settings.smtp_use_tls:
                server.starttls(context=context)
                server.ehlo()
            server.login(settings.smtp_username, settings.smtp_password)
            server.send_message(message)
        logger.info("Contact submission %s email notification sent by SMTP", submission.id)
        return True
    except (smtplib.SMTPException, OSError, TimeoutError):
        logger.exception("Contact submission %s SMTP notification failed", submission.id)
        return False
