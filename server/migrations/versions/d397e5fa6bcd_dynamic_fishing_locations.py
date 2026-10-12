"""Create a dynamic, moderated fishing-location directory."""

from datetime import datetime
import re
import unicodedata

from alembic import op
import sqlalchemy as sa


revision = "d397e5fa6bcd"
down_revision = "c286d4e95abc"
branch_labels = None
depends_on = None


def normalize(value):
    value = unicodedata.normalize("NFKD", value or "")
    value = "".join(
        character
        for character in value
        if not unicodedata.combining(character)
    )
    value = re.sub(r"[^a-z0-9]+", " ", value.casefold())
    return " ".join(value.split())


def upgrade():
    with op.batch_alter_table("users") as batch:
        batch.add_column(sa.Column(
            "is_admin",
            sa.Boolean(),
            nullable=False,
            server_default=sa.false(),
        ))

    op.create_table(
        "fishing_locations",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(length=120), nullable=False),
        sa.Column("normalized_name", sa.String(length=120), nullable=False),
        sa.Column("city", sa.String(length=100), nullable=True),
        sa.Column(
            "normalized_city",
            sa.String(length=100),
            nullable=False,
            server_default="",
        ),
        sa.Column("state_or_region", sa.String(length=100), nullable=True),
        sa.Column("country", sa.String(length=100), nullable=True),
        sa.Column("latitude", sa.Float(), nullable=True),
        sa.Column("longitude", sa.Float(), nullable=True),
        sa.Column(
            "status",
            sa.String(length=20),
            nullable=False,
            server_default="candidate",
        ),
        sa.Column("created_by_id", sa.Integer(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.ForeignKeyConstraint(["created_by_id"], ["users.id"]),
        sa.UniqueConstraint(
            "normalized_name",
            "normalized_city",
            name="unique_fishing_location_name_city",
        ),
    )
    op.create_index(
        "idx_fishing_locations_status",
        "fishing_locations",
        ["status"],
    )

    with op.batch_alter_table("catches") as batch:
        batch.add_column(sa.Column("location_id", sa.Integer(), nullable=True))
        batch.create_foreign_key(
            "fk_catches_location_id",
            "fishing_locations",
            ["location_id"],
            ["id"],
        )
        batch.create_index("idx_catches_location_id", ["location_id"])

    with op.batch_alter_table("spot_groups") as batch:
        batch.add_column(sa.Column("location_id", sa.Integer(), nullable=True))
        batch.create_foreign_key(
            "fk_spot_groups_location_id",
            "fishing_locations",
            ["location_id"],
            ["id"],
        )
        batch.create_unique_constraint(
            "unique_spot_group_location",
            ["location_id"],
        )

    bind = op.get_bind()
    metadata = sa.MetaData()
    users = sa.Table("users", metadata, autoload_with=bind)
    catches = sa.Table("catches", metadata, autoload_with=bind)
    groups = sa.Table("spot_groups", metadata, autoload_with=bind)
    memberships = sa.Table("spot_group_members", metadata, autoload_with=bind)
    messages = sa.Table("spot_group_messages", metadata, autoload_with=bind)
    locations = sa.Table("fishing_locations", metadata, autoload_with=bind)
    location_ids = {}

    def ensure_location(name, city=None, country=None, status="candidate"):
        clean_name = " ".join((name or "").split())
        clean_city = " ".join((city or "").split()) or None
        clean_country = " ".join((country or "").split()) or None
        key = (normalize(clean_name), normalize(clean_city))

        if not key[0]:
            return None

        if key in location_ids:
            location_id = location_ids[key]

            if status == "active":
                bind.execute(
                    locations.update()
                    .where(locations.c.id == location_id)
                    .values(status="active")
                )

            return location_id

        result = bind.execute(locations.insert().values(
            name=clean_name,
            normalized_name=key[0],
            city=clean_city,
            normalized_city=key[1],
            country=clean_country,
            status=status,
            created_at=datetime.utcnow(),
        ))
        location_id = result.inserted_primary_key[0]
        location_ids[key] = location_id
        return location_id

    group_rows = bind.execute(sa.select(
        groups.c.id,
        groups.c.name,
        groups.c.city,
    )).mappings().all()

    for group in group_rows:
        location_id = ensure_location(
            group["name"],
            city=group["city"],
            status="active",
        )
        bind.execute(
            groups.update()
            .where(groups.c.id == group["id"])
            .values(location_id=location_id)
        )

    catch_rows = bind.execute(
        sa.select(
            catches.c.id,
            catches.c.location,
            users.c.city,
            users.c.country,
        ).select_from(
            catches.join(users, catches.c.user_id == users.c.id)
        ).where(
            catches.c.location.is_not(None),
            sa.func.trim(catches.c.location) != "",
        )
    ).mappings().all()

    for catch in catch_rows:
        location_id = ensure_location(
            catch["location"],
            city=catch["city"],
            country=catch["country"],
        )
        bind.execute(
            catches.update()
            .where(catches.c.id == catch["id"])
            .values(location_id=location_id)
        )

    activity_rows = bind.execute(
        sa.select(
            catches.c.location_id,
            sa.func.count(catches.c.id).label("catch_count"),
            sa.func.count(sa.distinct(catches.c.user_id)).label("angler_count"),
        ).where(
            catches.c.location_id.is_not(None)
        ).group_by(
            catches.c.location_id
        )
    ).mappings().all()
    activity = {
        row["location_id"]: (row["catch_count"], row["angler_count"])
        for row in activity_rows
    }

    for location_id, counts in activity.items():
        catch_count, angler_count = counts

        if catch_count >= 5 and angler_count >= 3:
            bind.execute(
                locations.update()
                .where(
                    locations.c.id == location_id,
                    locations.c.status == "candidate",
                )
                .values(status="pending")
            )

    for group in group_rows:
        member_count = bind.execute(
            sa.select(sa.func.count(memberships.c.id)).where(
                memberships.c.group_id == group["id"]
            )
        ).scalar_one()
        message_count = bind.execute(
            sa.select(sa.func.count(messages.c.id)).where(
                messages.c.group_id == group["id"]
            )
        ).scalar_one()
        location_id = bind.execute(
            sa.select(groups.c.location_id).where(groups.c.id == group["id"])
        ).scalar_one()
        catch_count = activity.get(location_id, (0, 0))[0]

        if member_count == 0 and message_count == 0 and catch_count == 0:
            bind.execute(groups.delete().where(groups.c.id == group["id"]))
            bind.execute(
                locations.update()
                .where(locations.c.id == location_id)
                .values(status="candidate")
            )


def downgrade():
    with op.batch_alter_table("spot_groups") as batch:
        batch.drop_constraint(
            "unique_spot_group_location",
            type_="unique",
        )
        batch.drop_constraint(
            "fk_spot_groups_location_id",
            type_="foreignkey",
        )
        batch.drop_column("location_id")

    with op.batch_alter_table("catches") as batch:
        batch.drop_index("idx_catches_location_id")
        batch.drop_constraint(
            "fk_catches_location_id",
            type_="foreignkey",
        )
        batch.drop_column("location_id")

    op.drop_index(
        "idx_fishing_locations_status",
        table_name="fishing_locations",
    )
    op.drop_table("fishing_locations")

    with op.batch_alter_table("users") as batch:
        batch.drop_column("is_admin")
