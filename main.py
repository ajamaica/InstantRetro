FACEBOOK_APP_ID = "192870917425715"
FACEBOOK_APP_SECRET = "f0cc7231f8131b920fd986ea82850bb3"

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
  hint=db.IntegerProperty()
  shared=db.BooleanProperty(default = True)


class Save(webapp.RequestHandler):
  def post(self):
    
    foto=Foto()
    imgdata=base64.b64decode(self.request.get("imageData").replace('data:image/jpeg;base64,',''))
    img=Image(image_data= imgdata )
    foto.image=imgdata

    if not self.request.get('privacy') :
        foto.shared=False
    foto.title=self.request.get('title')
    foto.thumb=images.resize(imgdata,width=100,height=100)
    foto.big=images.resize(imgdata,600)
    foto.hint=0
    try:
        foto.put()
    except Exception, e:
        foto.image=images.resize(imgdata,width=600)
        foto.put()
    self.response.out.write ('{"key" : "'+str(foto.key())+'" }')

class Delete(webapp.RequestHandler):
    def post(self):
        key=self.request.get("key")
        foto=db.get(key)
        foto.delete()
        self.response.out.write('')
        return
class MainPage(webapp.RequestHandler):
  def get(self):
    query = db.GqlQuery("SELECT * FROM Foto  ORDER BY date DESC  LIMIT 0, 50")
    fotos = list()
    c=0
    for q in query:
        if q.shared:
            fotos.append(q)
            c=c+1
        if c==5:
            break
    template_values = { 'fotos' : fotos}

    path = os.path.join(os.path.dirname(__file__), 'index.html')
    self.response.out.write(template.render(path, template_values))

class View(webapp.RequestHandler):
    def get(self,key):
        query = db.GqlQuery("SELECT * FROM Foto  ORDER BY date DESC  LIMIT 0, 50")
        fotos = list()
        c=0
        for q in query:
            if q.shared:
                fotos.append(q)
                c=c+1
            if c==5:
                break
        try:
            foto=db.get(key)
            
        except Exception, e:
            self.error(404)
            return
        template_values = {
                           'key' :foto.key(),
                           'url': urllib.quote('http://www.instantretro.com/view/'+str(foto.key())),
                           'image':urllib.quote('http://www.instantretro.com/upload/'+str(foto.key())),
                           'title' :foto.title,
                           'fotos' : fotos
                          }
        path = os.path.join(os.path.dirname(__file__), 'view.html')
        self.response.out.write(template.render(path, template_values))
class Temp(webapp.RequestHandler):
  def post(self):
    temporal=Temporal()
    if (self.request.get("Filedata")!=None):
        temporal.image=self.request.get("Filedata")
        try:
            temporal.put()
        except Exception, e:
            temporal.image=images.resize(self.request.get("Filedata"),width=600)
            temporal.put()
    else:
        temporal.image=images.resize(self.request.body,width=600)
        temporal.put()
    self.response.out.write('/upload/'+str(temporal.key()))
  def get(self,nombre):
    img=db.get(nombre)
    self.response.headers['Content-Type'] = "image/jpg"
    self.response.out.write(str(img.image))
class Update(webapp.RequestHandler):
    def get(self):
        query = db.GqlQuery("SELECT * FROM Foto")
        for f in query:
            f.shared=True
            f.put()
        self.response.out.write('Done')
class Thumb(webapp.RequestHandler):
    def get(self,nombre):
	    img=db.get(nombre)
	    self.response.headers['Content-Type'] = "image/jpg"
	    self.response.out.write(str(img.thumb))
class Big(webapp.RequestHandler):
    def get(self,nombre):
	    img=db.get(nombre)
	    self.response.headers['Content-Type'] = "image/jpg"
	    self.response.out.write(str(img.big))
	
class Gallery(webapp.RequestHandler):
    def get(self,page):
        if str(page)=='' :
            page=0
            primera=True
        query = db.GqlQuery("SELECT * FROM Foto  ORDER BY date DESC  LIMIT 50 OFFSET "+str(int(page)*5)+"0")
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
                           'anterior' : int(page)-1
                          }
        path = os.path.join(os.path.dirname(__file__), 'gallery.html')
        self.response.out.write(template.render(path, template_values))

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
class HomeHandler(BaseHandler):
    def get(self):
        view=self.request.get("view")
        query = db.GqlQuery("SELECT * FROM Foto  ORDER BY date DESC  LIMIT 0, 5")
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
        query = db.GqlQuery("SELECT * FROM Foto  ORDER BY date DESC  LIMIT 0, 5")
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
class ApiGallery(webapp.RequestHandler):
    def get(self,page):
        query = db.GqlQuery("SELECT * FROM Foto ORDER BY date DESC  LIMIT 30 OFFSET "+str(page*3)+"0")
        query=query.filter("sared =", "True")
        f=db.GqlQuery("SELECT * FROM Foto")
        c=f.count()
        hojas= int(c/20)
        primera =False
        ultima =False
        if str(page)=='' :
            page=0
            primera=True
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
                           'anterior' : int(page)-1
                          }
        path = os.path.join(os.path.dirname(__file__), 'galleryapi.html')
        self.response.out.write(template.render(path, template_values))		
		
application = webapp.WSGIApplication([
  ('/', MainPage),
  ('/upload/', Temp),
  ('/save/', Save),
  ('/delete/', Delete),
  ('/view/(.*)', View),
  ('/upload/(.*)', Temp),
  ('/thumb/(.*)', Thumb),
  ('/big/(.*)', Big),
  ('/gallery/(.*)', Gallery),
  ('/facebook/', HomeHandler),
  ('/update/(.*)', ApiGallery)
], debug=True)


def main():
  run_wsgi_app(application)


if __name__ == '__main__':
  main()