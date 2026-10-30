import logging
import smtplib
import ssl
from email.message import EmailMessage

from app.core.config import settings
from app.models import ContactSubmission

logger = logging.getLogger(__name__)


def send_contact_notification(submission: ContactSubmission) -> bool:
    """Send a notification to the portfolio owner; return False when SMTP is unavailable."""
    required = (settings.smtp_host, settings.smtp_username, settings.smtp_password, settings.smtp_from_email)
    if not all(required):
        logger.warning("Contact email notification is not configured")
        return False

    message = EmailMessage()
    message["Subject"] = f"Portfolio contact: {submission.subject}"
    message["From"] = settings.smtp_from_email
    message["To"] = settings.contact_recipient_email
    message["Reply-To"] = submission.email
    message.set_content(
        "A new message was submitted through your portfolio contact form.\n\n"
        f"Name: {submission.name}\n"
        f"Email: {submission.email}\n"
        f"Subject: {submission.subject}\n\n"
        "Message:\n"
        f"{submission.message}\n\n"
        f"Submission ID: {submission.id}\n"
    )

    try:
        with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=settings.smtp_timeout_seconds) as client:
            if settings.smtp_use_tls:
                client.starttls(context=ssl.create_default_context())
            client.login(settings.smtp_username, settings.smtp_password)
            client.send_message(message)
    except (OSError, smtplib.SMTPException):
        logger.exception("Contact submission %s was saved, but its email notification failed", submission.id)
        return False
    return True
