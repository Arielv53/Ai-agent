import unittest
from flask import Flask
from flask_jwt_extended import JWTManager, create_access_token
from server.extensions import db
from server.models import User, Catch, Notification, Like, Comment
from server.routes.social import register_routes


class NotificationAuthTests(unittest.TestCase):
    def setUp(self):
        self.app = Flask(__name__)
        self.app.config.update(TESTING=True, SQLALCHEMY_DATABASE_URI='sqlite://',
                               JWT_SECRET_KEY='test-secret-for-notifications-only')
        db.init_app(self.app)
        JWTManager(self.app)
        register_routes(self.app)
        from server.routes.catches import register_routes as register_catches
        register_catches(self.app)
        from server.routes.stats import register_routes as register_stats
        register_stats(self.app)
        self.ctx = self.app.app_context()
        self.ctx.push()
        db.create_all()
        db.session.add_all([User(id=11, username='owner'), User(id=22, username='actor')])
        db.session.add(Catch(id=33, user_id=11, is_public=True))
        db.session.commit()
        self.client = self.app.test_client()
        self.owner = {'Authorization': 'Bearer ' + create_access_token(identity='11')}
        self.actor = {'Authorization': 'Bearer ' + create_access_token(identity='22')}

    def tearDown(self):
        db.session.remove()
        db.drop_all()
        self.ctx.pop()

    def test_auth_required(self):
        for path in ['/notifications', '/notifications/unread-count']:
            self.assertEqual(self.client.get(path + '?user_id=11').status_code, 401)
        for path in ['/notifications/mark-read', '/catches/33/like', '/catches/33/comments']:
            self.assertEqual(self.client.post(path, json={'user_id': 11}).status_code, 401)
        self.assertEqual(self.client.delete('/catches/33/unlike').status_code, 401)

    def test_like_notification_isolation_and_read(self):
        response = self.client.post('/catches/33/like', headers=self.actor, json={'user_id': 11})
        self.assertEqual(response.status_code, 201)
        self.assertEqual(Like.query.one().user_id, 22)
        self.client.post('/catches/33/like', headers=self.actor)
        self.assertEqual(Notification.query.count(), 1)
        self.assertEqual(self.client.get('/notifications?user_id=11', headers=self.actor).json, [])
        rows = self.client.get('/notifications', headers=self.owner).json
        self.assertEqual(rows[0]['actor_id'], 22)
        self.assertIn('actor_avatar_url', rows[0])
        self.assertTrue(rows[0]['created_at'].endswith('Z'))
        self.client.post('/notifications/mark-read', headers=self.actor, json={'user_id': 11})
        self.assertEqual(self.client.get('/notifications/unread-count', headers=self.owner).json['count'], 1)
        self.assertEqual(self.client.post('/notifications/mark-read', headers=self.owner).status_code, 200)
        self.assertEqual(self.client.get('/notifications/unread-count', headers=self.owner).json['count'], 0)
        self.assertEqual(self.client.delete('/catches/33/unlike', headers=self.actor).status_code, 200)
        self.assertEqual(Notification.query.count(), 0)

    def test_comments_and_self_actions(self):
        self.client.post('/catches/33/like', headers=self.owner)
        self.client.post('/catches/33/comments', headers=self.owner, json={'content': 'Mine'})
        self.assertEqual(Notification.query.count(), 0)
        self.assertEqual(self.client.post('/catches/33/comments', headers=self.actor,
                                         json={'content': ' Nice! ', 'user_id': 11}).status_code, 201)
        notification = Notification.query.one()
        self.assertEqual((notification.recipient_id, notification.actor_id, notification.type),
                         (11, 22, 'comment'))
        self.assertEqual(Comment.query.filter_by(user_id=22).one().content, 'Nice!')
        self.assertEqual(self.client.post('/catches/33/comments', headers=self.actor,
                                         json={'content': '  '}).status_code, 400)

    def test_comments_newest_first_and_posted_author(self):
        from datetime import datetime
        for index in range(5):
            db.session.add(Comment(user_id=22, catch_id=33, content=f'Comment {index}',
                                   timestamp=datetime(2026, 1, 1)))
        db.session.commit()
        response = self.client.get('/catches/33/comments')
        self.assertEqual(response.status_code, 200)
        self.assertEqual([row['content'] for row in response.json],
                         [f'Comment {index}' for index in reversed(range(5))])
        self.assertEqual(response.json[0]['user']['username'], 'actor')
        posted = self.client.post('/catches/33/comments', headers=self.owner,
                                  json={'content': 'My comment', 'user_id': 22})
        self.assertEqual(posted.status_code, 201)
        self.assertEqual(posted.json['user']['id'], 11)
        self.assertEqual(self.client.get('/catches/33/comments').json[0]['id'], posted.json['id'])

    def test_comment_validation_and_visibility(self):
        for body in [{'content': ''}, {'content': 123}, ['bad'], {'content': 'a' * 2001}]:
            self.assertEqual(self.client.post('/catches/33/comments', headers=self.actor,
                                              json=body).status_code, 400)
        self.assertEqual(self.client.get('/catches/999/comments').status_code, 404)
        catch = db.session.get(Catch, 33)
        catch.is_public = False
        db.session.commit()
        self.assertEqual(self.client.get('/catches/33/comments').status_code, 404)
        self.assertEqual(self.client.get('/catches/33/comments', headers=self.actor).status_code, 404)
        self.assertEqual(self.client.get('/catches/33/comments', headers=self.owner).status_code, 200)
        self.assertEqual(self.client.post('/catches/33/comments', headers=self.actor,
                                          json={'content': 'Hidden'}).status_code, 404)

    def test_single_post_data_and_private_access(self):
        self.client.post('/catches/33/like', headers=self.owner)
        response = self.client.get('/catches/33/post', headers=self.owner)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json['user_name'], 'owner')
        self.assertTrue(response.json['is_public'])
        self.assertEqual(response.json['likes_count'], 1)
        self.assertTrue(response.json['liked'])
        self.assertFalse(self.client.get('/catches/33/post', headers=self.actor).json['liked'])
        catch = db.session.get(Catch, 33)
        catch.is_public = False
        db.session.commit()
        self.assertEqual(self.client.get('/catches/33/post', headers=self.owner).status_code, 200)
        self.assertEqual(self.client.get('/catches/33/post', headers=self.actor).status_code, 404)
        self.assertEqual(self.client.get('/catches/33/post').status_code, 404)
        self.assertEqual(self.client.get('/catches/999/post', headers=self.owner).status_code, 404)

    def test_edit_and_delete_owner_only(self):
        for method in ('patch', 'delete'):
            self.assertEqual(getattr(self.client, method)('/catches/33').status_code, 401)
            self.assertEqual(getattr(self.client, method)('/catches/33', headers=self.actor).status_code, 403)
        response = self.client.patch('/catches/33', headers=self.owner,
            json={'species': 'Salmon', 'caption': '', 'water_temp': 0, 'weight': 12,
                  'user_id': 22, 'date_caught': '2026-09-20T12:00:00Z'})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json['species'], 'Salmon')
        self.assertEqual(response.json['water_temp'], 0)
        self.assertIsNone(response.json['caption'])
        self.assertEqual(response.json['user_id'], 11)
        self.assertTrue(db.session.get(Catch, 33).is_public)
        for body in ({'weight': -1}, {'water_temp': 'NaN'}, {'date_caught': 'invalid'}):
            self.assertEqual(self.client.patch('/catches/33', headers=self.owner, json=body).status_code, 400)
        self.client.post('/catches/33/like', headers=self.actor)
        self.client.post('/catches/33/comments', headers=self.actor, json={'content': 'Nice'})
        self.assertEqual(self.client.delete('/catches/33', headers=self.owner).status_code, 204)
        self.assertIsNone(db.session.get(Catch, 33))
        self.assertEqual(Like.query.count(), 0)
        self.assertEqual(Comment.query.count(), 0)
        self.assertEqual(Notification.query.count(), 0)

    def test_multipart_edit_preserves_photo(self):
        catch = db.session.get(Catch, 33)
        catch.image_url = 'https://example.com/original.jpg'
        db.session.commit()
        response = self.client.patch('/catches/33', headers=self.owner,
            data={'species': 'Trout', 'length': '', 'is_public': 'true'}, content_type='multipart/form-data')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json['image_url'], 'https://example.com/original.jpg')
        self.assertIsNone(response.json['length'])

    def test_productive_locations_month_and_account_scope(self):
        from datetime import datetime
        now = datetime.utcnow()
        current = datetime(now.year, now.month, 2)
        db.session.add_all([
            Catch(user_id=11, date_caught=current, location=' Jamaica Bay ', species='Bass', bait_used='Swimbait'),
            Catch(user_id=11, date_caught=current, location='jamaica   bay', species='Bass', bait_used='Swimbait'),
            Catch(user_id=11, date_caught=current, location='Lake', species='Trout'),
            Catch(user_id=11, date_caught=current, location='   '),
            Catch(user_id=22, date_caught=current, location='Other user'),
            Catch(user_id=11, date_caught=datetime(now.year - 1, now.month, 2), location='Last year'),
        ])
        db.session.commit()
        self.assertEqual(self.client.get('/stats/productive-locations').status_code, 401)
        response = self.client.get('/stats/productive-locations?user_id=22', headers=self.owner)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json['total_catches'], 5)
        top = response.json['locations'][0]
        self.assertEqual(top['count'], 2)
        self.assertEqual(top['share'], 40)
        self.assertEqual(top['species'], [{'name': 'Bass', 'count': 2}])
        self.assertEqual(top['bait'], [{'name': 'Swimbait', 'count': 2}])
        self.assertEqual(top['method'], [])
        self.assertEqual(top['days_fished'], 1)

    def test_productive_location_ties_and_empty(self):
        self.assertEqual(self.client.get('/stats/productive-locations', headers=self.actor).json['locations'], [])
        db.session.add_all([Catch(user_id=22, location='Bay'), Catch(user_id=22, location='Lake')])
        db.session.commit()
        locations = self.client.get('/stats/productive-locations', headers=self.actor).json['locations']
        self.assertEqual([row['name'] for row in locations], ['Bay', 'Lake'])
        self.assertTrue(all(row['share'] == 50 for row in locations))

    def test_monthly_snapshot_scope_and_comparison(self):
        from datetime import datetime
        from unittest.mock import patch
        db.session.query(Catch).delete()
        db.session.add_all([
            Catch(user_id=11, date_caught=datetime(2026, 1, 2), species='Bass'),
            Catch(user_id=11, date_caught=datetime(2026, 1, 3), species=' bass '),
            Catch(user_id=11, date_caught=datetime(2026, 1, 4), species=''),
            Catch(user_id=11, date_caught=datetime(2025, 12, 20), species='Trout'),
            Catch(user_id=11, date_caught=datetime(2025, 1, 2), species='Old'),
            Catch(user_id=22, date_caught=datetime(2026, 1, 2), species='Other'),
        ])
        db.session.commit()
        with patch('server.routes.stats.datetime') as clock:
            clock.utcnow.return_value = datetime(2026, 1, 20)
            clock.side_effect = datetime
            self.assertEqual(self.client.get('/stats/monthly-snapshot').status_code, 401)
            result = self.client.get('/stats/monthly-snapshot?user_id=22', headers=self.owner).json
            self.assertEqual(result, dict(total_catches=3, unique_species=1,
                                          previous_catches=1, change=2, change_percent=200))
            other = self.client.get('/stats/monthly-snapshot', headers=self.actor).json
            self.assertIsNone(other['change_percent'])
            self.assertEqual(other['total_catches'], 1)
            clock.utcnow.return_value = datetime(2026, 2, 20)
            result = self.client.get('/stats/monthly-snapshot', headers=self.owner).json
            self.assertEqual(result['change_percent'], -100)
            self.assertEqual(result['total_catches'], 0)

    def test_private_notes_owner_only_and_updates(self):
        response = self.client.patch('/catches/33', headers=self.owner, json={'notes': ' Secret spot '})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json['notes'], 'Secret spot')
        for path in ['/catches/33', '/catches/33/post']:
            self.assertEqual(self.client.get(path, headers=self.owner).json['notes'], 'Secret spot')
            self.assertNotIn('notes', self.client.get(path, headers=self.actor).json)
            self.assertNotIn('notes', self.client.get(path).json)
        self.assertNotIn('notes', self.client.get('/feed', headers=self.owner).json[0])
        self.assertNotIn('notes', self.client.get('/catches').json[0])
        self.client.patch('/catches/33', headers=self.owner, json={'species': 'Bass'})
        self.assertEqual(db.session.get(Catch, 33).notes, 'Secret spot')
        for value in [42, 'x' * 5001]:
            self.assertEqual(self.client.patch('/catches/33', headers=self.owner, json={'notes': value}).status_code, 400)
        self.assertEqual(self.client.patch('/catches/33', headers=self.actor, json={'notes': 'bad'}).status_code, 403)
        self.client.patch('/catches/33', headers=self.owner, data={'notes': ''}, content_type='multipart/form-data')
        self.assertIsNone(db.session.get(Catch, 33).notes)

    def test_create_notes_json_and_upload(self):
        from unittest.mock import patch
        import io
        response = self.client.post('/catches', headers=self.owner, json={'image_url': 'photo', 'notes': 'JSON note'})
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json['catch']['notes'], 'JSON note')
        with patch('server.routes.catches.cloudinary.uploader.upload', return_value={'secure_url': 'https://example.com/photo.jpg'}):
            response = self.client.post('/catches/upload', headers=self.owner, data={
                'file': (io.BytesIO(b'photo'), 'photo.jpg'), 'notes': 'Upload note', 'is_public': 'true',
            }, content_type='multipart/form-data')
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json['notes'], 'Upload note')

    def test_follow_notification(self):
        self.assertEqual(self.client.post('/follow', headers=self.actor,
                                         json={'following_id': 11}).status_code, 201)
        self.assertEqual(self.client.get('/notifications', headers=self.owner).json[0]['type'], 'follow')


if __name__ == '__main__':
    unittest.main()
