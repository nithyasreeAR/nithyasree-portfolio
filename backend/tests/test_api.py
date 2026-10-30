from fastapi.testclient import TestClient
from sqlalchemy.exc import SQLAlchemyError

from app.db.session import get_db
from app.main import app


client = TestClient(app)


def test_health():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_invalid_contact_is_rejected():
    response = client.post("/api/contact", json={"name": "A", "email": "bad", "subject": "Hi", "message": "Short"})
    assert response.status_code == 422
    assert response.json()["detail"] == "Please check the submitted contact details."


def test_contact_is_persisted_and_email_status_is_reported(monkeypatch):
    monkeypatch.setattr("app.api.routes.send_contact_notification", lambda submission: True)
    class FakeDB:
        def add(self, submission):
            self.submission = submission

        def commit(self):
            self.submission.id = 42

        def refresh(self, submission):
            return None

    session = FakeDB()
    app.dependency_overrides[get_db] = lambda: session
    try:
        response = client.post("/api/contact", json={"name": "Jane Smith", "email": "jane@example.com", "subject": "A role", "message": "I would like to talk."})
        assert response.status_code == 201
        assert response.json() == {"message": "Your message was saved and an email notification was sent.", "id": 42, "email_sent": True}
        assert session.submission.name == "Jane Smith"
    finally:
        app.dependency_overrides.clear()


def test_saved_contact_reports_email_failure(monkeypatch):
    monkeypatch.setattr("app.api.routes.send_contact_notification", lambda submission: False)

    class FakeDB:
        def add(self, submission):
            self.submission = submission

        def commit(self):
            self.submission.id = 43

        def refresh(self, submission):
            return None

    app.dependency_overrides[get_db] = lambda: FakeDB()
    try:
        response = client.post("/api/contact", json={"name": "Jane Smith", "email": "jane@example.com", "subject": "A role", "message": "I would like to talk."})
        assert response.status_code == 201
        assert response.json()["email_sent"] is False
        assert "email notification could not be sent" in response.json()["message"]
    finally:
        app.dependency_overrides.clear()


def test_database_error_does_not_claim_success():
    class BrokenDB:
        def add(self, submission):
            pass

        def commit(self):
            raise SQLAlchemyError("database unavailable")

        def rollback(self):
            self.rolled_back = True

    session = BrokenDB()
    app.dependency_overrides[get_db] = lambda: session
    try:
        response = client.post("/api/contact", json={"name": "Jane Smith", "email": "jane@example.com", "subject": "A role", "message": "I would like to talk."})
        assert response.status_code == 503
        assert "could not be saved" in response.json()["detail"]
        assert session.rolled_back
    finally:
        app.dependency_overrides.clear()
