"""Add private catch notes."""
from alembic import op
import sqlalchemy as sa

revision = "c842f0b315da"
down_revision = "b731e9a204cf"
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table("catches") as batch:
        batch.add_column(sa.Column("notes", sa.Text(), nullable=True))


def downgrade():
    with op.batch_alter_table("catches") as batch:
        batch.drop_column("notes")
