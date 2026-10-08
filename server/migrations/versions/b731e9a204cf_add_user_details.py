"""Add optional signup profile details.

Revision ID: b731e9a204cf
Revises: 99d6c4d505ec
"""
from alembic import op
import sqlalchemy as sa

revision = "b731e9a204cf"
down_revision = "99d6c4d505ec"
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table("users") as batch:
        for field in ("first_name", "last_name", "country", "city"):
            batch.add_column(sa.Column(field, sa.String(100), nullable=True))


def downgrade():
    with op.batch_alter_table("users") as batch:
        for field in ("city", "country", "last_name", "first_name"):
            batch.drop_column(field)
