from __future__ import with_statement
import logging
import facebook
import cgi
import datetime
import urllib
import wsgiref.handlers
import base64
from google.appengine.ext import db
from google.appengine.api import users
from google.appengine.ext import webapp
from google.appengine.ext.webapp.util import run_wsgi_app
import os
from google.appengine.ext.webapp import template
from google.appengine.api.images import *
from google.appengine.api import images
import urllib
import bitly
from google.appengine.ext.webapp import blobstore_handlers
from google.appengine.ext import blobstore
from google.appengine.api import files
from google.appengine.api import mail


FACEBOOK_APP_ID = "192870917425715"
FACEBOOK_APP_SECRET = "404fe003145dacf484b440e7d2241b71"
BLOBAPI = False

api = bitly.Api(login='ajamaica', apikey='R_2b7a35cb712cef5cf32276f919533034') 


import urllib

def CompressURL(url):
    """Compress the URL using to.ly"""
    apiurl = "http://api.bitly.com/v3/shorten?format=txt&login="+'ajamaica'+'&apiKey='+'R_2b7a35cb712cef5cf32276f919533034'+'&longUrl='
    quoted = urllib.quote_plus(url)
    shorturl = urllib.urlopen(apiurl + quoted).read()
    return shorturl


class User(db.Model):
    id = db.StringProperty(required=True)
    created = db.DateTimeProperty(auto_now_add=True)
    updated = db.DateTimeProperty(auto_now=True)
    name = db.StringProperty(required=True)
    profile_url = db.StringProperty(required=True)
    access_token = db.StringProperty(required=True)


class Temporal(db.Model):
  image = db.BlobProperty()

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
  owner = db.ReferenceProperty(User,
                                  collection_name='owners')

    
class Save(webapp.RequestHandler):
    
    def current_user(self):
        if not hasattr(self, "_current_user"):
            self._current_user = None
            cookie = facebook.get_user_from_cookie(
                self.request.cookies, FACEBOOK_APP_ID, FACEBOOK_APP_SECRET)
            if cookie:
                # Store a local instance of the user data so we don't need
                # a round-trip to Facebook on every request
                user = User.get_by_key_name(cookie["uid"])
                if not user:
                    graph = facebook.GraphAPI(cookie["access_token"])
                    profile = graph.get_object("me")
                    user = User(key_name=str(profile["id"]),
                                id=str(profile["id"]),
                                name=profile["name"],
                                profile_url=profile["link"],
                                access_token=cookie["access_token"])
                    user.put()
                elif user.access_token != cookie["access_token"]:
                    user.access_token = cookie["access_token"]
                    user.put()
                self._current_user = user
        return self._current_user
        
    def post(self):
    
        foto=Foto()
        imgdata=base64.b64decode(self.request.get("imageData").replace('data:image/png;base64,',''))
        img=Image(image_data = imgdata )

        foto.hint=0
        
        import random
        name='blob_' + str(random.randrange(0, 100000))
        if(BLOBAPI):
            img = images.resize(imgdata,width=600,output_encoding=images.PNG)
            file_name = files.blobstore.create(mime_type='image/jpg', _blobinfo_uploaded_filename=name )
            with files.open(file_name, 'a') as f:
                f.write(str(img))
            # Finalize the file. Do this before attempting to read it.
            files.finalize(file_name)

            # Get the file's blob key
            blob_key = files.blobstore.get_blob_key(file_name)
        
            foto.imageblob = blob_key
        
        
            
        else:
            img = images.resize(imgdata,width=600,output_encoding=images.PNG)
            foto.image=images.resize(imgdata,width=500,output_encoding=images.PNG)
        
        foto.title=self.request.get('title')
        if not self.request.get('privacy') :
            foto.shared=False
        if self.current_user() :
            
            
            foto.owner = self.current_user().key()
            #foto.put()
            cookie = facebook.get_user_from_cookie(
                self.request.cookies, FACEBOOK_APP_ID, FACEBOOK_APP_SECRET)
            graph = facebook.GraphAPI(cookie["access_token"])
            #graph.put_wall_post( 'me', 'feed', message="My retro photo",source= ( 'http://www.instantretro.com/view/'+str(foto.key()) )  )
            
        
        try:
            foto.put()
        except Exception, e:
            #foto.thumb=images.resize(imgdata,width=200,height=130,output_encoding=images.PNG)
            try:
                #foto.image=images.resize(imgdata,width=500,output_encoding=images.PNG)
                foto.put()
            except Exception, e:
                #foto.image=images.resize(imgdata,width=400,output_encoding=images.PNG)
                foto.put()
        
        if self.request.get('privacy') :
            
            mail.send_mail(sender="me@arturojamaica.com",
                            to="858cucosh@tumblr.com",
                            subject="Via: [ %s ] " % CompressURL(('http://www.instantretro.com/view/'+str(foto.key()))),
                            body="New Photo",
                            attachments=[('Uploaded.jpg', (img))])
            
            mail.send_mail(sender="me@arturojamaica.com",
                            to="InstantRetro.5200@twitpic.com",
                            subject="New Photo : [ %s ] " % CompressURL(('http://www.instantretro.com/view/'+str(foto.key()))),
                            body="New Photo",
                            attachments=[('Uploaded.jpg', (img))])

            mail.send_mail(sender="me@arturojamaica.com",
                            to="curds745widely@m.facebook.com",
                            subject="New Photo : %s" % CompressURL(('http://www.instantretro.com/view/'+str(foto.key()))),
                            body="New Photo",
                            attachments=[('Uploaded.jpg', (img))])
        
        self.response.out.write ('{"key" : "'+str(foto.key())+'" }')

class Delete(webapp.RequestHandler):
    def post(self):
        key=self.request.get("key")
        foto=db.get(key)
        foto.delete()
        self.response.out.write('')
        return
        
    def get(self):
        key=self.request.get("key")
        foto=db.get(key)
        foto.delete()
        self.response.out.write('')
        return


class BaseHandler(webapp.RequestHandler):
    """Provides access to the active Facebook user in self.current_user

    The property is lazy-loaded on first access, using the cookie saved
    by the Facebook JavaScript SDK to determine the user ID of the active
    user. See http://developers.facebook.com/docs/authentication/ for
    more information.
    """
    @property
    def current_user(self):
        if not hasattr(self, "_current_user"):
            self._current_user = None
            cookie = facebook.get_user_from_cookie(
                self.request.cookies, FACEBOOK_APP_ID, FACEBOOK_APP_SECRET)
            if cookie:
                # Store a local instance of the user data so we don't need
                # a round-trip to Facebook on every request
                user = User.get_by_key_name(cookie["uid"])
                if not user:
                    graph = facebook.GraphAPI(cookie["access_token"])
                    profile = graph.get_object("me")
                    user = User(key_name=str(profile["id"]),
                                id=str(profile["id"]),
                                name=profile["name"],
                                profile_url=profile["link"],
                                access_token=cookie["access_token"])
                    user.put()
                elif user.access_token != cookie["access_token"]:
                    user.access_token = cookie["access_token"]
                    user.put()
                self._current_user = user
        return self._current_user
        

class About(webapp.RequestHandler):

    def current_user(self):
        if not hasattr(self, "_current_user"):
            self._current_user = None
            cookie = facebook.get_user_from_cookie(
                self.request.cookies, FACEBOOK_APP_ID, FACEBOOK_APP_SECRET)
            if cookie:
                # Store a local instance of the user data so we don't need
                # a round-trip to Facebook on every request
                user = User.get_by_key_name(cookie["uid"])
                if not user:
                    graph = facebook.GraphAPI(cookie["access_token"])
                    profile = graph.get_object("me")
                    user = User(key_name=str(profile["id"]),
                                id=str(profile["id"]),
                                name=profile["name"],
                                profile_url=profile["link"],
                                access_token=cookie["access_token"])
                    user.put()
                elif user.access_token != cookie["access_token"]:
                    user.access_token = cookie["access_token"]
                    user.put()
                self._current_user = user
        return self._current_user

    def get(self):
            fotos = db.GqlQuery("SELECT * FROM Foto WHERE shared=True ORDER BY date DESC  LIMIT 0, 4")
            template_values = { 'fotos' : fotos, 'current_user' :  self.current_user() }
            path = os.path.join(os.path.dirname(__file__), 'aboutus.html')
            self.response.out.write(template.render(path, template_values))



class MainPage(webapp.RequestHandler):
    
    def current_user(self):
        if not hasattr(self, "_current_user"):
            self._current_user = None
            cookie = facebook.get_user_from_cookie(
                self.request.cookies, FACEBOOK_APP_ID, FACEBOOK_APP_SECRET)
            if cookie:
                # Store a local instance of the user data so we don't need
                # a round-trip to Facebook on every request
                user = User.get_by_key_name(cookie["uid"])
                if not user:
                    graph = facebook.GraphAPI(cookie["access_token"])
                    profile = graph.get_object("me")
                    user = User(key_name=str(profile["id"]),
                                id=str(profile["id"]),
                                name=profile["name"],
                                profile_url=profile["link"],
                                access_token=cookie["access_token"])
                    user.put()
                elif user.access_token != cookie["access_token"]:
                    user.access_token = cookie["access_token"]
                    user.put()
                self._current_user = user
        return self._current_user
        
    def get(self):
            fotos = db.GqlQuery("SELECT * FROM Foto WHERE shared=True ORDER BY date DESC  LIMIT 0, 4")
            template_values = { 'fotos' : fotos, 'current_user' :  self.current_user() }
            path = os.path.join(os.path.dirname(__file__), 'index.html')
            self.response.out.write(template.render(path, template_values))

class View(webapp.RequestHandler):
    def current_user(self):
           if not hasattr(self, "_current_user"):
               self._current_user = None
               cookie = facebook.get_user_from_cookie(
                   self.request.cookies, FACEBOOK_APP_ID, FACEBOOK_APP_SECRET)
               if cookie:
                   # Store a local instance of the user data so we don't need
                   # a round-trip to Facebook on every request
                   user = User.get_by_key_name(cookie["uid"])
                   if not user:
                       graph = facebook.GraphAPI(cookie["access_token"])
                       profile = graph.get_object("me")
                       user = User(key_name=str(profile["id"]),
                                   id=str(profile["id"]),
                                   name=profile["name"],
                                   profile_url=profile["link"],
                                   access_token=cookie["access_token"])
                       user.put()
                   elif user.access_token != cookie["access_token"]:
                       user.access_token = cookie["access_token"]
                       user.put()
                   self._current_user = user
           return self._current_user
           
    def get(self,key):
        query = db.GqlQuery("SELECT * FROM Foto  ORDER BY date DESC  LIMIT 0, 25")
        fotos = list()
        fotos = filter(lambda q: q.shared, query)[:4]
        try:
            foto=db.get(key)
            
        except Exception, e:
            self.error(404)
            return
        foto.hint=foto.hint +1
        foto.put()
        template_values = {
                           'key' :foto.key(),
                           'hint' :foto.hint,
                           'mobile' :foto.mobile,
                           'url': CompressURL( ('http://www.instantretro.com/view/'+str(foto.key())) ),
                           'image':urllib.quote('http://www.instantretro.com/upload/'+str(foto.key())),
                           'title' :foto.title,
                           'fotos' : fotos,
                           'current_user' :  self.current_user() 
                          }
        path = os.path.join(os.path.dirname(__file__), 'view.html')
        self.response.out.write(template.render(path, template_values))
        
class Back(webapp.RequestHandler):
    def get(self,key):
        foto=db.get(key)
        self.response.headers['Content-Type'] = "image/jpg"
        self.response.out.write(str(foto.image))
        
class UploadHandler(blobstore_handlers.BlobstoreUploadHandler):
    def post(self):
        upload_files = self.request.get("Filedata")  # 'file' is file upload field in the form
        if(BLOBAPI):
            logging.info(self.request)
            import random
            name='temp_' + str(random.randrange(0, 1000))+"_" + self.request.get('Filename').encode('utf-8')
            try:
                img = images.resize(upload_files,width=800,output_encoding=images.PNG)
                file_name = files.blobstore.create(mime_type='image/jpg', _blobinfo_uploaded_filename=name )
                with files.open(file_name, 'a') as f:
                    f.write(str(img))
                    # Finalize the file. Do this before attempting to read it
            except:
                img2 = images.Image(upload_files)
                img = img2.resize(width=600,output_encoding=images.PNG)
                file_name = files.blobstore.create(mime_type='image/jpg', _blobinfo_uploaded_filename=name )
                with files.open(file_name, 'a') as f:
                    f.write(str(img))
                files.finalize(file_name)
                # Get the file's blob key
                blob_key = files.blobstore.get_blob_key(file_name)
                #blob_info = upload_files[0]
                self.response.out.write('/temp/%s' % blob_key)
        else:
            img = images.resize(upload_files,width=600,output_encoding=images.PNG)
            tmp = Temporal(image=img)
            tmp.put()
            self.response.out.write('/back/%s' % tmp.key())
            
        
class ServeHandler(blobstore_handlers.BlobstoreDownloadHandler):
    def get(self, resource):
        resource = str(urllib.unquote(resource))
        blob_info = blobstore.BlobInfo.get(resource)
        
        self.send_blob(blob_info)


class Temp(webapp.RequestHandler):
    def get(self,nombre):
        img=db.get(nombre)
        
        try:
            img = images.Image(blob_key=img.imageblob.key())
            img.im_feeling_lucky()
            thumbnail = img.execute_transforms(output_encoding=images.JPEG)
            self.response.headers['Content-Type'] = 'image/jpeg'
            self.response.out.write(thumbnail)
        except:
            img.thumb=img.image
            self.response.headers['Content-Type'] = "image/jpg"
            self.response.out.write(str(img.thumb))

class Profile(webapp.RequestHandler):
    def current_user(self):
           if not hasattr(self, "_current_user"):
               self._current_user = None
               cookie = facebook.get_user_from_cookie(
                   self.request.cookies, FACEBOOK_APP_ID, FACEBOOK_APP_SECRET)
               if cookie:
                   # Store a local instance of the user data so we don't need
                   # a round-trip to Facebook on every request
                   user = User.get_by_key_name(cookie["uid"])
                   if not user:
                       graph = facebook.GraphAPI(cookie["access_token"])
                       profile = graph.get_object("me")
                       user = User(key_name=str(profile["id"]),
                                   id=str(profile["id"]),
                                   name=profile["name"],
                                   profile_url=profile["link"],
                                   access_token=cookie["access_token"])
                       user.put()
                   elif user.access_token != cookie["access_token"]:
                       user.access_token = cookie["access_token"]
                       user.put()
                   self._current_user = user
           return self._current_user
       
    def get(self):
        
        if(self.current_user()):
            usuario = db.get(self.current_user().key())
            query = usuario.owners
            template_values = {
                                'fotos' : query,
                                'current_user' :  self.current_user() 
                              }
            path = os.path.join(os.path.dirname(__file__), 'profile.html')
            self.response.out.write(template.render(path, template_values))

def rescale(img_data, width, height, halign='middle', valign='middle'):
  """Resize then optionally crop a given image.

  Attributes:
    img_data: The image data
    width: The desired width
    height: The desired height
    halign: Acts like photoshop's 'Canvas Size' function, horizontally
            aligning the crop to left, middle or right
    valign: Verticallly aligns the crop to top, middle or bottom

  """
  image = images.Image(img_data)

  desired_wh_ratio = float(width) / float(height)
  wh_ratio = float(image.width) / float(image.height)

  if desired_wh_ratio > wh_ratio:
    # resize to width, then crop to height
    image.resize(width=width)
    image.execute_transforms()
    trim_y = (float(image.height - height) / 2) / image.height
    if valign == 'top':
      image.crop(0.0, 0.0, 1.0, 1 - (2 * trim_y))
    elif valign == 'bottom':
      image.crop(0.0, (2 * trim_y), 1.0, 1.0)
    else:
      image.crop(0.0, trim_y, 1.0, 1 - trim_y)
  else:
    # resize to height, then crop to width
    image.resize(height=height)
    image.execute_transforms()
    trim_x = (float(image.width - width) / 2) / image.width
    if halign == 'left':
      image.crop(0.0, 0.0, 1 - (2 * trim_x), 1.0)
    elif halign == 'right':
      image.crop((2 * trim_x), 0.0, 1.0, 1.0)
    else:
      image.crop(trim_x, 0.0, 1 - trim_x, 1.0)

  return image.execute_transforms()
      
class Thumb(webapp.RequestHandler):
    def get(self,nombre):
        img=db.get(nombre)
        
        try:
            img = images.Image(blob_key=img.imageblob.key())
            #img.resize(width=200, height=130)
            img.im_feeling_lucky()
            thumbnail = img.execute_transforms(output_encoding=images.JPEG)
            img.thumb=rescale(str(thumbnail),200,130)
            self.response.headers['Content-Type'] = 'image/jpeg'
            self.response.out.write((str(img.thumb)))
        except:
            img.thumb=rescale(str(img.image),200,130)
            self.response.headers['Content-Type'] = "image/jpg"
            self.response.out.write(str(img.thumb))
    
class Featured(webapp.RequestHandler):
    def get(self,nombre):
        img=db.get(nombre)            
        try:
            img = images.Image(blob_key=img.imageblob.key())
            #img.resize(width=200, height=130)
            img.im_feeling_lucky()
            thumbnail = img.execute_transforms(output_encoding=images.JPEG,quality=60)
            img.thumb=rescale(str(thumbnail),600,250)
            self.response.headers['Content-Type'] = 'image/jpeg'
            self.response.out.write((str(img.thumb)))
        except:
            img.thumb=rescale(str(img.image),600,250)
            self.response.headers['Content-Type'] = "image/jpg"
            self.response.out.write(str(img.thumb))
            
class Mobile(webapp.RequestHandler):
    def post(self):
        upload_files = self.request.get("media")
        
        foto=Foto()
        foto.hint=0
        foto.image=images.resize(upload_files,width=600,output_encoding=images.PNG)
        foto.title=self.request.get('message')
        foto.shared=False
        foto.mobile=True
        try:
            foto.put()
        except Exception, e:
            foto.image=images.resize(upload_files,width=600,output_encoding=images.PNG)
            
        
        c =  CompressURL('http://www.instantretro.com/view/' + str(foto.key() ) )
        logging.info(c)
        self.response.out.write('<mediaurl>%s</mediaurl>' % c )
    
class Big(webapp.RequestHandler):
    def get(self,nombre):
        img=db.get(nombre)            
        try:
            img = images.Image(blob_key=img.imageblob.key())
            img.resize(width=600)
            img.im_feeling_lucky()
            thumbnail = img.execute_transforms(output_encoding=images.JPEG)
            self.response.headers['Content-Type'] = 'image/jpeg'
            self.response.out.write(thumbnail)
        except:
            img = images.Image(img.image)
            img.resize(width=600)
            img.im_feeling_lucky()
            thumbnail = img.execute_transforms(output_encoding=images.JPEG)
            self.response.headers['Content-Type'] = "image/jpg"
            self.response.out.write(str(thumbnail))
	        
	
class Gallery(webapp.RequestHandler):
    def current_user(self):
           if not hasattr(self, "_current_user"):
               self._current_user = None
               cookie = facebook.get_user_from_cookie(
                   self.request.cookies, FACEBOOK_APP_ID, FACEBOOK_APP_SECRET)
               if cookie:
                   # Store a local instance of the user data so we don't need
                   # a round-trip to Facebook on every request
                   user = User.get_by_key_name(cookie["uid"])
                   if not user:
                       graph = facebook.GraphAPI(cookie["access_token"])
                       profile = graph.get_object("me")
                       user = User(key_name=str(profile["id"]),
                                   id=str(profile["id"]),
                                   name=profile["name"],
                                   profile_url=profile["link"],
                                   access_token=cookie["access_token"])
                       user.put()
                   elif user.access_token != cookie["access_token"]:
                       user.access_token = cookie["access_token"]
                       user.put()
                   self._current_user = user
           return self._current_user
    def get(self,page):
        if str(page)=='' :
            page=0
            primera=True
        query = db.GqlQuery("SELECT * FROM Foto WHERE shared=True ORDER BY date DESC  LIMIT 50 OFFSET "+str(int(page)*5)+"0")
        f=db.GqlQuery("SELECT * FROM Foto")
        c=f.count()
        hojas= int(c/50)
        primera =False
        ultima =False
        
        if str(page)=='0' :
            page=0
            primera=True
        if str(page)==str(hojas):
            ultima=True
        template_values = {
                           'primera' : primera,
                           'ultima' : ultima,
                           'fotos' : query,
                           'siguiente' : int(page)+1,
                           'anterior' : int(page)-1,
                            'current_user' :  self.current_user() 
                          }
        path = os.path.join(os.path.dirname(__file__), 'gallery.html')
        self.response.out.write(template.render(path, template_values))



        

class HomeHandler(BaseHandler):
    def get(self):
        view=self.request.get("view")
        query = db.GqlQuery("SELECT * FROM Foto WHERE shared=True ORDER BY date DESC  LIMIT 0, 5")
        if view!='':
            try:
                foto=db.get(view)
            except Exception, e:
                self.error(404)
                return
            template_values = {
                           'key' :foto.key(),
                           'url': urllib.quote('http://apps.facebook.com/instantretro/?view='+str(foto.key())),
                           'image':urllib.quote('http://www.instantretro.com/upload/'+str(foto.key())),
                           'title' :foto.title,
                           'fotos' : query
                          }
            path = os.path.join(os.path.dirname(__file__), 'viewfb.html')
            self.response.out.write(template.render(path, template_values))
        else:
            path = os.path.join(os.path.dirname(__file__), "indexfb.html")
            args = dict(current_user=self.current_user,
                        facebook_app_id=FACEBOOK_APP_ID,fotos=query)
            self.response.out.write(template.render(path, args))

    def post(self):
        view=self.request.get("view")
        query = db.GqlQuery("SELECT * FROM Foto WHERE shared=True ORDER BY date DESC  LIMIT 0, 5")
        if view!='':
            try:
                foto=db.get(view)
            except Exception, e:
                self.error(404)
                return
            template_values = {
                           'key' :foto.key(),
                           'url': urllib.quote('http://apps.facebook.com/instantretro/?view='+str(foto.key())),
                           'image':urllib.quote('http://www.instantretro.com/upload/'+str(foto.key())),
                           'title' :foto.title,
                           'fotos' : query
                          }
            path = os.path.join(os.path.dirname(__file__), 'viewfb.html')
            self.response.out.write(template.render(path, template_values))
        else:
            path = os.path.join(os.path.dirname(__file__), "indexfb.html")
            args = dict(current_user=self.current_user,
                        facebook_app_id=FACEBOOK_APP_ID,fotos=query)
            self.response.out.write(template.render(path, args))

application = webapp.WSGIApplication([
  ('/', MainPage),
  ('/about/', About),
  ('/upload/', Temp),
  ('/save/', Save),
  ('/delete/', Delete),
  ('/view/(.*)', View),
  ('/back/(.*)', Back),
  ('/upload/(.*)', Temp),
  ('/upload2/', UploadHandler),
  ('/temp/(.*)', ServeHandler),
  ('/thumb/(.*)', Thumb),
  ('/profile/', Profile),
  ('/big/(.*)', Big),  
  ('/featured/(.*)', Featured),
  ('/gallery/(.*)', Gallery),
  ('/facebook/', HomeHandler),
  ('/mobile/twitter', Mobile),
  
], debug=False)


def main():
  run_wsgi_app(application)


if __name__ == '__main__':
  main()