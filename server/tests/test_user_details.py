import unittest
from flask import Flask
from flask_jwt_extended import JWTManager, create_access_token
from server.extensions import db
from server.models import User
from server.routes.auth import register_routes as auth_routes
from server.routes.user import register_routes as user_routes

class UserDetailsTests(unittest.TestCase):
    def setUp(self):
        app = Flask(__name__)
        app.config.update(TESTING=True, SQLALCHEMY_DATABASE_URI='sqlite://', JWT_SECRET_KEY='signup-details-test-secret-123456')
        db.init_app(app)
        JWTManager(app)
        auth_routes(app)
        user_routes(app)
        self.ctx = app.app_context()
        self.ctx.push()
        db.create_all()
        self.client = app.test_client()

    def tearDown(self):
        db.session.remove()
        db.drop_all()
        db.engine.dispose()
        self.ctx.pop()

    def test_signup_login_profile_update_round_trip(self):
        details = dict(first_name=' Ariel ', last_name='Smith', country='United States', city='New York')
        response = self.client.post('/signup', json=dict(username='angler', **details))
        self.assertEqual(response.status_code, 201)
        account = response.json['user']
        self.assertEqual(account['first_name'], 'Ariel')
        headers = {'Authorization': 'Bearer ' + response.json['access_token']}
        path = f"/users/{account['id']}"
        self.assertEqual(self.client.post('/login', json={'username': 'angler'}).json['user']['city'], 'New York')
        self.assertEqual(self.client.get(path + '/profile', headers=headers).json['last_name'], 'Smith')
        self.assertNotIn('last_name', self.client.get(path + '/profile').json)
        updated = self.client.patch(path, headers=headers, json={'city': ' Boston ', 'country': ''})
        self.assertEqual(updated.status_code, 200)
        self.assertEqual(updated.json['city'], 'Boston')
        self.assertIsNone(updated.json['country'])
        self.assertEqual(updated.json['first_name'], 'Ariel')
        self.assertEqual(self.client.patch(path, json={'city': 'X'}).status_code, 401)
        other = {'Authorization': 'Bearer ' + create_access_token(identity='999')}
        self.assertEqual(self.client.patch(path, headers=other, json={'city': 'X'}).status_code, 403)

    def test_photo_upload_and_failure_preserve_saved_photos(self):
        import io
        from unittest.mock import patch
        account = self.client.post('/signup', json={'username': 'photos'}).json
        headers = {'Authorization': 'Bearer ' + account['access_token']}
        path = f"/users/{account['user']['id']}"
        with patch('server.routes.user.cloudinary.uploader.upload', side_effect=[
            {'secure_url': 'https://cdn.example/avatar.jpg', 'public_id': 'avatar'},
            {'secure_url': 'https://cdn.example/cover.jpg', 'public_id': 'cover'},
        ]) as upload:
            response = self.client.patch(path, headers=headers, data={
                'profile_photo': (io.BytesIO(b'avatar'), 'avatar.jpg'),
                'cover_photo': (io.BytesIO(b'cover'), 'cover.jpg'),
                'city': 'Boston',
            }, content_type='multipart/form-data')
            self.assertEqual(response.status_code, 200)
            self.assertEqual(upload.call_count, 2)
        self.assertEqual(response.json['profile_photo'], 'https://cdn.example/avatar.jpg')
        self.assertEqual(response.json['cover_photo'], 'https://cdn.example/cover.jpg')
        response = self.client.patch(path, headers=headers, json={'city': 'New York'})
        self.assertEqual(response.json['profile_photo'], 'https://cdn.example/avatar.jpg')
        for uri in ['file:///tmp/picture.jpg', 'content://photos/1', 'blob:123']:
            self.assertEqual(self.client.patch(path, headers=headers, json={'profile_photo': uri}).status_code, 400)
        with patch('server.routes.user.cloudinary.uploader.upload', side_effect=[
            {'secure_url': 'https://cdn.example/new.jpg', 'public_id': 'new'}, RuntimeError('upload failed')
        ]), patch('server.routes.user.cloudinary.uploader.destroy') as destroy:
            response = self.client.patch(path, headers=headers, data={
                'profile_photo': (io.BytesIO(b'a'), 'avatar.jpg'),
                'cover_photo': (io.BytesIO(b'b'), 'cover.jpg'),
                'city': 'Should not save',
            }, content_type='multipart/form-data')
            self.assertEqual(response.status_code, 502)
            destroy.assert_called_once_with('new', resource_type='image')
        saved = self.client.get(path + '/profile', headers=headers).json
        self.assertEqual(saved['profile_photo'], 'https://cdn.example/avatar.jpg')
        self.assertEqual(saved['cover_photo'], 'https://cdn.example/cover.jpg')
        self.assertEqual(saved['city'], 'New York')
        with patch('server.routes.user.cloudinary.uploader.upload') as upload:
            other = {'Authorization': 'Bearer ' + create_access_token(identity='999')}
            self.assertEqual(self.client.patch(path, headers=other, data={
                'profile_photo': (io.BytesIO(b'a'), 'avatar.jpg')}, content_type='multipart/form-data').status_code, 403)
            upload.assert_not_called()

    def test_optional_and_invalid_fields(self):
        response = self.client.post('/signup', json={'username': 'legacy'})
        self.assertEqual(response.status_code, 201)
        self.assertIsNone(response.json['user']['city'])
        headers = {'Authorization': 'Bearer ' + response.json['access_token']}
        for details in [{'first_name': 4}, {'country': ['US']}, {'city': 'x' * 101}]:
            self.assertEqual(self.client.post('/signup', json=dict(username='bad', **details)).status_code, 400)
            self.assertEqual(self.client.patch('/users/1', headers=headers, json=details).status_code, 400)
        self.assertEqual(User.query.count(), 1)

if __name__ == '__main__':
    unittest.main()
