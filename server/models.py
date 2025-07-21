from extensions import db

class Catch(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    species = db.Column(db.String(80), nullable=False)
    location = db.Column(db.String(120))
    weather = db.Column(db.String(120))
    tide = db.Column(db.String(120))
    date_caught = db.Column(db.Date)
    notes = db.Column(db.Text)
