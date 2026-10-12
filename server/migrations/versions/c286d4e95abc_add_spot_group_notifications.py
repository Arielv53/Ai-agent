"""Link in-app notifications to premium spot groups."""

from alembic import op
import sqlalchemy as sa


revision = "c286d4e95abc"
down_revision = "f175c3d849ab"
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table("notifications") as batch:
        batch.add_column(sa.Column(
            "spot_group_id",
            sa.Integer(),
            nullable=True,
        ))
        batch.create_foreign_key(
            "fk_notifications_spot_group_id",
            "spot_groups",
            ["spot_group_id"],
            ["id"],
        )


def downgrade():
    with op.batch_alter_table("notifications") as batch:
        batch.drop_constraint(
            "fk_notifications_spot_group_id",
            type_="foreignkey",
        )
        batch.drop_column("spot_group_id")
