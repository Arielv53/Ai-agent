import unittest
from datetime import datetime
from urllib.parse import quote
from flask import Flask
from flask_jwt_extended import JWTManager, create_access_token
from sqlalchemy import event
from server.extensions import db
from server.models import User, Catch, Comment, Like
from server.routes.catches import register_routes
from server.routes.social import register_routes as register_social


class FeedPaginationTests(unittest.TestCase):
    def setUp(self):
        self.app = Flask(__name__)
        self.app.config.update(TESTING=True, SQLALCHEMY_DATABASE_URI="sqlite://",
                               JWT_SECRET_KEY="test-secret-feed-pagination-long")
        db.init_app(self.app)
        JWTManager(self.app)
        register_routes(self.app)
        register_social(self.app)
        self.ctx = self.app.app_context()
        self.ctx.push()
        db.create_all()
        db.session.add_all([User(id=1, username="owner"), User(id=2, username="viewer")])
        for index in range(1, 26):
            db.session.add(Catch(id=index, user_id=1, is_public=True,
                                 date_caught=datetime(2026, 1, 1), created_at=datetime(2026, 1, 1), notes="private"))
        db.session.add(Catch(id=99, user_id=1, is_public=False))
        db.session.flush()
        for index in range(8):
            db.session.add(Comment(catch_id=25, user_id=2, content=str(index),
                                   timestamp=datetime(2026, 1, 1)))
        db.session.add(Like(catch_id=25, user_id=2))
        db.session.commit()
        self.client = self.app.test_client()
        self.headers = {"Authorization": "Bearer " + create_access_token(identity="2")}

    def tearDown(self):
        db.session.remove()
        db.drop_all()
        self.ctx.pop()

    def test_pages_are_bounded_and_stable_for_tied_dates(self):
        first = self.client.get("/feed?limit=10", headers=self.headers).json
        self.assertEqual([p["id"] for p in first["items"]], list(range(25, 15, -1)))
        self.assertTrue(first["items"][0]["liked"])
        self.assertEqual(first["items"][0]["likes_count"], 1)
        self.assertEqual(first["items"][0]["comments_count"], 8)
        self.assertEqual([c["content"] for c in first["items"][0]["comments_preview"]], ["7", "6", "5"])
        self.assertNotIn("notes", first["items"][0])
        # Inserting a newer post must not shift the next page.
        db.session.add(Catch(id=100, user_id=1, is_public=True, date_caught=datetime(2026, 2, 1), created_at=datetime(2026, 2, 1)))
        db.session.commit()
        second = self.client.get("/feed?limit=10&cursor=" + quote(first["next_cursor"])).json
        self.assertEqual([p["id"] for p in second["items"]], list(range(15, 5, -1)))
        last = self.client.get("/feed?limit=10&cursor=" + quote(second["next_cursor"])).json
        self.assertEqual([p["id"] for p in last["items"]], list(range(5, 0, -1)))
        self.assertIsNone(last["next_cursor"])
        self.assertEqual(len(self.client.get("/feed").json), 20)
        self.assertFalse(self.client.get("/feed?limit=1").json["items"][0]["liked"])

    def test_comments_continue_after_preview_with_correct_total(self):
        post = self.client.get("/feed?limit=1").json["items"][0]
        cursor = post["comments_next_cursor"]
        page = self.client.get("/catches/25/comments?limit=3&cursor=" + quote(cursor)).json
        self.assertEqual(page["total"], 8)
        self.assertEqual([c["content"] for c in page["items"]], ["4", "3", "2"])
        page = self.client.get("/catches/25/comments?limit=3&cursor=" + quote(page["next_cursor"])).json
        self.assertEqual([c["content"] for c in page["items"]], ["1", "0"])
        self.assertIsNone(page["next_cursor"])
        self.assertEqual(self.client.get("/catches/99/comments?limit=3").status_code, 404)

    def test_invalid_cursors_and_limits_are_rejected(self):
        for path in ["/feed", "/catches/25/comments"]:
            for query in ["limit=0", "limit=51", "limit=no", "cursor=garbage", "cursor=W10"]:
                self.assertEqual(self.client.get(path + "?" + query).status_code, 400)

    def test_feed_uses_two_queries_independent_of_page_size(self):
        def query_count(limit):
            statements = []
            def capture(conn, cursor, statement, parameters, context, executemany):
                statements.append(statement)
            db.session.remove()
            event.listen(db.engine, "before_cursor_execute", capture)
            try:
                response = self.client.get(f"/feed?limit={limit}", headers=self.headers)
                self.assertEqual(response.status_code, 200)
            finally:
                event.remove(db.engine, "before_cursor_execute", capture)
            return len(statements)
        self.assertEqual(query_count(1), 2)
        self.assertEqual(query_count(20), 2)

    def test_posting_time_is_independent_of_catch_date_and_immutable(self):
        from unittest.mock import patch
        import io
        with patch("server.routes.catches.cloudinary.uploader.upload",
                   return_value={"secure_url": "https://example.com/catch.jpg"}):
            response = self.client.post("/catches/upload", headers=self.headers, data={
                "file": (io.BytesIO(b"photo"), "catch.jpg"),
                "date_caught": "2025-01-01T12:00:00Z",
                "is_public": "true",
                "created_at": "2000-01-01T00:00:00Z",
            })
        self.assertEqual(response.status_code, 201)
        newest = Catch.query.order_by(Catch.id.desc()).first()
        self.assertEqual(newest.date_caught.year, 2025)
        self.assertLess(abs((datetime.utcnow() - newest.created_at).total_seconds()), 10)
        created = newest.created_at
        page = self.client.get("/feed?limit=1", headers=self.headers).json
        self.assertEqual(page["items"][0]["id"], newest.id)
        self.assertTrue(page["items"][0]["created_at"].endswith("Z"))
        response = self.client.patch(f"/catches/{newest.id}", headers=self.headers,
                                    json={"date_caught": "2024-01-01T12:00:00Z",
                                          "created_at": "2000-01-01T00:00:00Z"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(db.session.get(Catch, newest.id).created_at, created)
        self.assertEqual(response.json["created_at"], created.isoformat() + "Z")
