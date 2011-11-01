from google.appengine.ext import db
from google.appengine.ext import blobstore

class User(db.Model):
    id = db.StringProperty(required=True)
    created = db.DateTimeProperty(auto_now_add=True)
    updated = db.DateTimeProperty(auto_now=True)
    name = db.StringProperty(required=True)
    profile_url = db.StringProperty(required=True)
    access_token = db.StringProperty(required=True)
    email = db.EmailProperty()
    user_id = db.IntegerProperty()
    user_token = db.StringProperty()
    source = db.StringProperty()
    avatar = db.StringProperty( default="http://www.instantretro.com/images/avatar.png" )

class Short(db.Model):
    user = db.ReferenceProperty(User, collection_name='user')
    name = db.StringProperty(required=True)
  
class Temporal(db.Model):
    image = db.BlobProperty()
    rackspace =  db.StringProperty(default = None)

class Foto(db.Model):
    title = db.StringProperty()
    rating = db.RatingProperty()
    date = db.DateTimeProperty(auto_now_add=True)
    image = db.BlobProperty()
    thumb = db.BlobProperty()
    big = db.BlobProperty()
    hint = db.IntegerProperty()
    shared = db.BooleanProperty(default = True)
    imageblob = blobstore.BlobReferenceProperty()
    mobile = db.BooleanProperty(default = False)
    published = db.StringProperty()
    owner = db.ReferenceProperty(User,
                                  collection_name='owners')