"""Indexes for bounded feed and comment queries."""
from alembic import op

revision = "d953a1c426eb"
down_revision = "c842f0b315da"
branch_labels = None
depends_on = None

INDEXES = [
    ("idx_catches_public_date_id", "catches", ["is_public", "date_caught", "id"]),
    ("idx_comments_catch_date_id", "comments", ["catch_id", "timestamp", "id"]),
    ("idx_likes_catch_id", "likes", ["catch_id"]),
    ("idx_followers_pair", "followers", ["follower_id", "following_id"]),
]


def upgrade():
    for name, table, columns in INDEXES:
        op.create_index(name, table, columns)


def downgrade():
    for name, table, _ in reversed(INDEXES):
        op.drop_index(name, table_name=table)
