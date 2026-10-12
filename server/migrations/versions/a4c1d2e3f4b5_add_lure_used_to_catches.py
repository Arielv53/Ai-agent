"""Store bait and lure selections separately.

Recognizable lure values from the former combined bait_used field are moved
into lure_used so existing lure statistics remain useful.
"""
from alembic import op
import sqlalchemy as sa

revision = "a4c1d2e3f4b5"
down_revision = "e064b2d537fc"
branch_labels = None
depends_on = None

LEGACY_LURES = (
    "bucktail", "chatterbait", "crankbait", "deep-diving crankbait",
    "deep diving crankbait", "diamond jig", "football jig", "jerkbait",
    "ned rigged craw", "ned rigged plastic", "rooster tail", "roostertail",
    "soft plastic", "sp minnow", "spinnerbait", "spoon", "swimbait",
    "topwater plug",
)


def upgrade():
    op.add_column("catches", sa.Column("lure_used", sa.String(), nullable=True))
    catches = sa.table(
        "catches",
        sa.column("bait_used", sa.String()),
        sa.column("lure_used", sa.String()),
    )
    op.execute(
        catches.update()
        .where(sa.func.lower(sa.func.trim(catches.c.bait_used)).in_(LEGACY_LURES))
        .values(lure_used=catches.c.bait_used, bait_used=None)
    )


def downgrade():
    catches = sa.table(
        "catches",
        sa.column("bait_used", sa.String()),
        sa.column("lure_used", sa.String()),
    )
    op.execute(
        catches.update()
        .where(catches.c.bait_used.is_(None))
        .values(bait_used=catches.c.lure_used)
    )
    with op.batch_alter_table("catches") as batch:
        batch.drop_column("lure_used")
