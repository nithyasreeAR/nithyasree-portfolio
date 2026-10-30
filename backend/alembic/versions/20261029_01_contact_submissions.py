"""Create the contact submissions table."""
from alembic import op
import sqlalchemy as sa

revision = "20261029_01"
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "contact_submissions",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("email", sa.String(length=254), nullable=False),
        sa.Column("subject", sa.String(length=150), nullable=False),
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("status", sa.String(length=24), server_default="received", nullable=False),
    )
    op.create_index("ix_contact_submissions_created_at", "contact_submissions", ["created_at"])


def downgrade():
    op.drop_index("ix_contact_submissions_created_at", table_name="contact_submissions")
    op.drop_table("contact_submissions")
