import unittest

from flask import Flask
from flask_jwt_extended import JWTManager, create_access_token

from server.extensions import db
from server.location_service import (
    find_or_create_location,
    refresh_location_status,
)
from server.models import (
    Catch,
    FishingLocation,
    Notification,
    SpotGroup,
    SpotGroupMember,
    SpotGroupMessage,
    User,
)
from server.routes.spot_groups import register_routes


class SpotGroupTests(unittest.TestCase):
    def setUp(self):
        app = Flask(__name__)
        app.config.update(
            TESTING=True,
            SQLALCHEMY_DATABASE_URI="sqlite://",
            JWT_SECRET_KEY="spot-groups-test-secret",
        )
        db.init_app(app)
        JWTManager(app)
        register_routes(app)

        self.context = app.app_context()
        self.context.push()
        db.create_all()

        self.premium_user = User(
            username="premium-angler",
            is_premium=True,
            is_admin=True,
        )
        self.other_premium_user = User(
            username="other-angler",
            is_premium=True,
        )
        self.free_user = User(
            username="free-angler",
            is_premium=False,
        )
        self.location = FishingLocation(
            name="Coney Island Pier",
            normalized_name="coney island pier",
            city="Brooklyn, NY",
            normalized_city="brooklyn ny",
            status="active",
        )
        self.group = SpotGroup(
            name="Coney Island Pier",
            city="Brooklyn, NY",
            description="Local reports",
            location=self.location,
        )
        db.session.add_all([
            self.premium_user,
            self.other_premium_user,
            self.free_user,
            self.location,
            self.group,
        ])
        db.session.commit()

        self.client = app.test_client()
        self.premium_headers = self.auth_headers(self.premium_user.id)
        self.other_headers = self.auth_headers(self.other_premium_user.id)
        self.free_headers = self.auth_headers(self.free_user.id)

    def tearDown(self):
        db.session.remove()
        db.drop_all()
        self.context.pop()

    def auth_headers(self, user_id):
        token = create_access_token(identity=str(user_id))
        return {"Authorization": f"Bearer {token}"}

    def test_premium_access_is_enforced_by_server(self):
        self.assertEqual(
            self.client.get("/spot-groups").status_code,
            401,
        )

        response = self.client.get(
            "/spot-groups",
            headers=self.free_headers,
        )

        self.assertEqual(response.status_code, 403)
        self.assertEqual(response.json["code"], "PREMIUM_REQUIRED")

    def test_join_chat_preferences_and_leave_flow(self):
        group_path = f"/spot-groups/{self.group.id}"
        list_response = self.client.get(
            "/spot-groups",
            headers=self.premium_headers,
        )
        self.assertEqual(list_response.status_code, 200)
        self.assertFalse(list_response.json[0]["is_joined"])

        blocked_messages = self.client.get(
            group_path + "/messages",
            headers=self.premium_headers,
        )
        self.assertEqual(blocked_messages.status_code, 403)

        joined = self.client.post(
            group_path + "/membership",
            headers=self.premium_headers,
        )
        self.assertEqual(joined.status_code, 200)
        self.assertTrue(joined.json["is_joined"])
        self.assertEqual(joined.json["notification_level"], "all")

        posted = self.client.post(
            group_path + "/messages",
            headers=self.premium_headers,
            json={"content": "  Water is clearing up.  "},
        )
        self.assertEqual(posted.status_code, 201)
        self.assertEqual(posted.json["content"], "Water is clearing up.")
        self.assertEqual(posted.json["user"]["username"], "premium-angler")

        messages = self.client.get(
            group_path + "/messages",
            headers=self.premium_headers,
        )
        self.assertEqual(messages.status_code, 200)
        self.assertEqual(len(messages.json), 1)

        updated = self.client.patch(
            group_path + "/membership",
            headers=self.premium_headers,
            json={"notification_level": "mentions"},
        )
        self.assertEqual(updated.status_code, 200)
        self.assertEqual(updated.json["notification_level"], "mentions")

        left = self.client.delete(
            group_path + "/membership",
            headers=self.premium_headers,
        )
        self.assertEqual(left.status_code, 200)
        self.assertEqual(SpotGroupMember.query.count(), 0)
        self.assertEqual(SpotGroupMessage.query.count(), 1)

    def test_members_cannot_read_each_others_groups_without_joining(self):
        path = f"/spot-groups/{self.group.id}"
        self.client.post(
            path + "/membership",
            headers=self.premium_headers,
        )
        self.client.post(
            path + "/messages",
            headers=self.premium_headers,
            json={"content": "Current report"},
        )

        response = self.client.get(
            path + "/messages",
            headers=self.other_headers,
        )

        self.assertEqual(response.status_code, 403)

    def test_message_and_notification_validation(self):
        path = f"/spot-groups/{self.group.id}"
        self.client.post(
            path + "/membership",
            headers=self.premium_headers,
        )

        self.assertEqual(
            self.client.post(
                path + "/messages",
                headers=self.premium_headers,
                json={"content": "   "},
            ).status_code,
            400,
        )

    def test_notification_preferences_control_group_alerts(self):
        path = f"/spot-groups/{self.group.id}"
        self.client.post(
            path + "/membership",
            headers=self.premium_headers,
        )
        self.client.post(
            path + "/membership",
            headers=self.other_headers,
        )

        self.client.post(
            path + "/messages",
            headers=self.premium_headers,
            json={"content": "The tide just turned."},
        )
        self.assertEqual(Notification.query.count(), 1)
        notification = Notification.query.one()
        self.assertEqual(notification.recipient_id, self.other_premium_user.id)
        self.assertEqual(notification.type, "spot_group_message")
        self.assertEqual(notification.spot_group_id, self.group.id)

        self.client.patch(
            path + "/membership",
            headers=self.other_headers,
            json={"notification_level": "mentions"},
        )
        self.client.post(
            path + "/messages",
            headers=self.premium_headers,
            json={"content": "General update"},
        )
        self.assertEqual(Notification.query.count(), 1)

        self.client.post(
            path + "/messages",
            headers=self.premium_headers,
            json={"content": "@other-angler the fish are moving."},
        )
        self.assertEqual(Notification.query.count(), 2)

        self.client.patch(
            path + "/membership",
            headers=self.other_headers,
            json={"notification_level": "muted"},
        )
        self.client.post(
            path + "/messages",
            headers=self.premium_headers,
            json={"content": "@other-angler muted update"},
        )
        self.assertEqual(Notification.query.count(), 2)
        self.assertEqual(
            self.client.patch(
                path + "/membership",
                headers=self.premium_headers,
                json={"notification_level": "sometimes"},
            ).status_code,
            400,
        )

    def test_location_requests_are_moderated_before_becoming_groups(self):
        self.assertEqual(
            self.client.get(
                "/admin/spot-locations",
                headers=self.other_headers,
            ).status_code,
            403,
        )

        requested = self.client.post(
            "/spot-groups/requests",
            headers=self.other_headers,
            json={
                "name": "  Prospect   Park Lake ",
                "city": "Brooklyn, NY",
            },
        )
        self.assertEqual(requested.status_code, 202)
        self.assertEqual(requested.json["status"], "pending")

        pending_count = self.client.get(
            "/admin/spot-locations/pending-count",
            headers=self.premium_headers,
        )
        self.assertEqual(pending_count.status_code, 200)
        self.assertEqual(pending_count.json["count"], 1)

        pending = self.client.get(
            "/admin/spot-locations",
            headers=self.premium_headers,
        )
        self.assertEqual(pending.status_code, 200)
        self.assertEqual(len(pending.json), 1)

        approved = self.client.patch(
            f"/admin/spot-locations/{requested.json['id']}",
            headers=self.premium_headers,
            json={"status": "active"},
        )
        self.assertEqual(approved.status_code, 200)
        self.assertIsNotNone(approved.json["spot_group_id"])
        self.assertEqual(
            self.client.get(
                "/admin/spot-locations/pending-count",
                headers=self.premium_headers,
            ).json["count"],
            0,
        )

        groups = self.client.get(
            "/spot-groups",
            headers=self.other_headers,
        )
        self.assertEqual(
            [group["name"] for group in groups.json],
            ["Coney Island Pier", "Prospect Park Lake"],
        )

    def test_catch_locations_are_normalized_and_promoted_by_activity(self):
        location = find_or_create_location(
            "  Marine   Park  ",
            user=self.premium_user,
            city="Brooklyn",
        )
        duplicate = find_or_create_location(
            "marine park",
            user=self.other_premium_user,
            city="BROOKLYN",
        )
        self.assertEqual(location.id, duplicate.id)

        db.session.add_all([
            Catch(user_id=self.premium_user.id, location_id=location.id),
            Catch(user_id=self.premium_user.id, location_id=location.id),
            Catch(user_id=self.other_premium_user.id, location_id=location.id),
            Catch(user_id=self.other_premium_user.id, location_id=location.id),
            Catch(user_id=self.free_user.id, location_id=location.id),
        ])
        db.session.flush()
        refresh_location_status(location)
        db.session.commit()

        self.assertEqual(location.status, "pending")


if __name__ == "__main__":
    unittest.main()
