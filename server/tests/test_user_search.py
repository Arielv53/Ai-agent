import unittest
from flask import Flask
from flask_jwt_extended import JWTManager, create_access_token
from server.extensions import db
from server.models import User
from server.routes.social import register_routes


class UserSearchTests(unittest.TestCase):
    def setUp(self):
        app = Flask(__name__)
        app.config.update(TESTING=True, SQLALCHEMY_DATABASE_URI='sqlite://',
                          JWT_SECRET_KEY='user-search-test-secret-only-123456')
        db.init_app(app)
        JWTManager(app)
        register_routes(app)
        self.ctx = app.app_context()
        self.ctx.push()
        db.create_all()
        db.session.add_all([
            User(id=11, username='Ariel', profile_photo='https://example.com/avatar.jpg'),
            User(id=22, username='ariel_fisher'),
            User(id=33, username='Other'),
            User(id=44, username='100%fish'),
        ])
        db.session.commit()
        self.client = app.test_client()
        self.headers = {'Authorization': 'Bearer ' + create_access_token(identity='11')}

    def tearDown(self):
        db.session.remove()
        db.drop_all()
        self.ctx.pop()

    def search(self, query):
        return self.client.get('/users/search', query_string={'q': query}, headers=self.headers)

    def test_requires_authentication(self):
        self.assertEqual(self.client.get('/users/search?q=ariel').status_code, 401)

    def test_partial_case_insensitive_search_and_profile_fields(self):
        response = self.search('  ARIEL  ')
        self.assertEqual(response.status_code, 200)
        self.assertEqual([user['id'] for user in response.json], [11, 22])
        self.assertEqual(response.json[0], {
            'id': 11, 'username': 'Ariel', 'profile_photo': 'https://example.com/avatar.jpg'})
        self.assertEqual([user['id'] for user in self.search('riel').json], [11, 22])

    def test_empty_missing_and_unmatched_queries(self):
        self.assertEqual(self.search('  ').json, [])
        self.assertEqual(self.client.get('/users/search', headers=self.headers).json, [])
        self.assertEqual(self.search('unknown').json, [])
        self.assertEqual(self.search('a' * 101).status_code, 400)

    def test_wildcards_are_literal(self):
        self.assertEqual([user['id'] for user in self.search('_').json], [22])
        self.assertEqual([user['id'] for user in self.search('%').json], [44])
        self.assertEqual(self.search("' OR 1=1 --").json, [])

    def test_limit_keeps_exact_match_first(self):
        db.session.add_all([User(username=f'Ariel{i:03}') for i in range(60)])
        db.session.commit()
        rows = self.search('ariel').json
        self.assertEqual(len(rows), 50)
        self.assertEqual(rows[0]['id'], 11)


if __name__ == '__main__':
    unittest.main()
