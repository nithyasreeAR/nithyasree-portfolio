import pytest
from pydantic import ValidationError

from app.schemas.contact import ContactCreate


def test_valid_contact_is_trimmed():
    submission = ContactCreate(name="  Jane Smith ", email="jane@example.com", subject="  A role ", message="  Hello, I would like to talk.  ")
    assert submission.name == "Jane Smith"
    assert submission.subject == "A role"
    assert submission.message == "Hello, I would like to talk."


@pytest.mark.parametrize("overrides", [
    {"email": "invalid"},
    {"name": "x"},
    {"subject": "no"},
    {"message": "short"},
    {"name": "   "},
])
def test_invalid_contact_is_rejected(overrides):
    data = {"name": "Jane Smith", "email": "jane@example.com", "subject": "A role", "message": "Hello, I would like to talk."}
    data.update(overrides)
    with pytest.raises(ValidationError):
        ContactCreate(**data)
