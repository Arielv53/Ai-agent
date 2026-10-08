"""Store posting time separately from the selected catch date.

Existing creation times are unknown; leave them null rather than inventing them.
"""
from alembic import op
import sqlalchemy as sa

revision = "e064b2d537fc"
down_revision = "d953a1c426eb"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column("catches", sa.Column("created_at", sa.DateTime(), nullable=True))
    op.create_index("idx_catches_public_created_id", "catches", ["is_public", "created_at", "id"])
    op.drop_index("idx_catches_public_date_id", table_name="catches")


def downgrade():
    op.create_index("idx_catches_public_date_id", "catches", ["is_public", "date_caught", "id"])
    op.drop_index("idx_catches_public_created_id", table_name="catches")
    with op.batch_alter_table("catches") as batch:
        batch.drop_column("created_at")
