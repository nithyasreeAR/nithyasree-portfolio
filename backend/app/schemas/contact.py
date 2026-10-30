from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


def clean_text(value: str) -> str:
    cleaned = " ".join(value.split())
    if any(ord(char) < 32 and char not in "\t\n\r" for char in cleaned):
        raise ValueError("Control characters are not allowed.")
    return cleaned


class ContactCreate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)
    website: str = Field(default="", max_length=200, exclude=True)
    name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    subject: str = Field(min_length=3, max_length=150)
    message: str = Field(min_length=10, max_length=5000)

    @field_validator("name", "subject", "message")
    @classmethod
    def sanitize_text(cls, value: str) -> str:
        return clean_text(value)

    @field_validator("website")
    @classmethod
    def reject_honeypot(cls, value: str) -> str:
        if value.strip():
            raise ValueError("Invalid submission.")
        return value


class ContactAccepted(BaseModel):
    message: str
    id: int
    email_sent: bool
