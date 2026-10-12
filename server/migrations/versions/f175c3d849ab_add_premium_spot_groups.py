"""Add premium entitlements and location-based spot groups."""

from alembic import op
import sqlalchemy as sa


revision = "f175c3d849ab"
down_revision = "a4c1d2e3f4b5"
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table("users") as batch:
        batch.add_column(sa.Column(
            "is_premium",
            sa.Boolean(),
            nullable=False,
            server_default=sa.false(),
        ))

    op.create_table(
        "spot_groups",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(length=120), nullable=False),
        sa.Column("city", sa.String(length=100), nullable=False),
        sa.Column("description", sa.String(length=300), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.UniqueConstraint("name"),
    )
    op.create_table(
        "spot_group_members",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("group_id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column(
            "notification_level",
            sa.String(length=20),
            nullable=False,
            server_default="all",
        ),
        sa.Column(
            "joined_at",
            sa.DateTime(),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.ForeignKeyConstraint(["group_id"], ["spot_groups.id"]),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.UniqueConstraint(
            "group_id",
            "user_id",
            name="unique_spot_group_member",
        ),
    )
    op.create_index(
        "idx_spot_group_members_user",
        "spot_group_members",
        ["user_id"],
    )
    op.create_table(
        "spot_group_messages",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("group_id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("content", sa.String(length=1000), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.ForeignKeyConstraint(["group_id"], ["spot_groups.id"]),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
    )
    op.create_index(
        "idx_spot_group_messages_group_created",
        "spot_group_messages",
        ["group_id", "created_at", "id"],
    )

    groups = sa.table(
        "spot_groups",
        sa.column("name", sa.String()),
        sa.column("city", sa.String()),
        sa.column("description", sa.String()),
    )
    op.bulk_insert(groups, [
        {
            "name": "Coney Island Pier",
            "city": "Brooklyn, NY",
            "description": "Saltwater reports, conditions, and advice from Coney Island anglers.",
        },
        {
            "name": "Prospect Park Lake",
            "city": "Brooklyn, NY",
            "description": "Freshwater reports and local knowledge for Prospect Park Lake.",
        },
        {
            "name": "Canarsie Pier",
            "city": "Brooklyn, NY",
            "description": "Share tide, bait, and bite updates with Canarsie Pier anglers.",
        },
    ])


def downgrade():
    op.drop_index(
        "idx_spot_group_messages_group_created",
        table_name="spot_group_messages",
    )
    op.drop_table("spot_group_messages")
    op.drop_index(
        "idx_spot_group_members_user",
        table_name="spot_group_members",
    )
    op.drop_table("spot_group_members")
    op.drop_table("spot_groups")

    with op.batch_alter_table("users") as batch:
        batch.drop_column("is_premium")
