from __future__ import with_statement
import logging
from util import facebook, bitly, pusherapp
import base64
from settings import *
from google.appengine.ext import webapp
import os
from google.appengine.ext.webapp import template
from google.appengine.api.images import *
from google.appengine.api import images
from google.appengine.ext.webapp import blobstore_handlers
from google.appengine.api import files
from google.appengine.api import mail
from models import *
from google.appengine.api import urlfetch
from util.sessions import Session
from time import time
import urllib
import cloudfiles

conn = cloudfiles.get_connection('ajamaica11', '8b5f9041ed187e62dca34caeccf1fd7c')
api = bitly.Api(login='ajamaica', apikey='R_2b7a35cb712cef5cf32276f919533034')


def CompressURL(url):
    apiurl = "http://api.bitly.com/v3/shorten?format=txt&login=" + 'ajamaica' + '&apiKey=' + 'R_2b7a35cb712cef5cf32276f919533034' + '&longUrl='
    quoted = urllib.quote_plus(url)
    shorturl = urllib.urlopen(apiurl + quoted).read()
    return shorturl


class BaseHandler(webapp.RequestHandler):

    @property
    def current_user(self):
        self.session = Session()
        if 'username' in self.session:
            userkey = self.session.get('username')
            user = User.get_by_key_name(userkey)
            user.put()
            return user

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
                                access_token=cookie["access_token"],
                                email=profile["email"],
                                source="facebook",
                                avatar= "http://graph.facebook.com/"+str(profile["id"]) +"/picture"
                                )

                    user.put()
                elif user.access_token != cookie["access_token"]:
                    graph = facebook.GraphAPI(cookie["access_token"])
                    profile = graph.get_object("me")

                    user.access_token = cookie["access_token"]
                    user.avatar = "http://graph.facebook.com/"+str(user.id) +"/picture"
                    #user.email=profile["email"]
                    user.put()
                self._current_user = user
        return self._current_user


class Save(BaseHandler):
    def post(self):
        foto = Foto()
        imgdata = base64.b64decode(self.request.get("imageData").replace('data:image/png;base64,', ''))
        img = Image(image_data=imgdata)

        foto.hint = 0

        import random

        name = 'blob_' + str(random.randrange(0, 100000))
        if(BLOBAPI):
            img = images.resize(imgdata, width=600, output_encoding=images.PNG)
            file_name = files.blobstore.create(mime_type='image/jpg', _blobinfo_uploaded_filename=name)
            with files.open(file_name, 'a') as f:
                f.write(str(img))
                # Finalize the file. Do this before attempting to read it.
            files.finalize(file_name)

            # Get the file's blob key
            blob_key = files.blobstore.get_blob_key(file_name)

            foto.imageblob = blob_key



        else:
            foto.image = images.resize(imgdata, width=500, output_encoding=images.PNG)

        foto.title = self.request.get('title')
        if not self.request.get('privacy'):
            foto.shared = False

        if self.current_user:
            try:
                foto.owner = self.current_user.key()
                cookie = facebook.get_user_from_cookie(
                    self.request.cookies, FACEBOOK_APP_ID, FACEBOOK_APP_SECRET)
                graph = facebook.GraphAPI(cookie["access_token"])
            except:
                pass
        published = conn.create_container('saved_pictures')
        published.make_public(2592000)
        try:
            name = str(time()) + '_saved_' + str(random.randrange(0, 100000))
            test_object = published.create_object(name)
            test_object.content_type = 'image/png'
            test_object.write(foto.image, verify=False)
            foto.published = test_object.public_uri()
        except:
            pass
        foto.put()

        if self.request.get('privacy'):
            mail.send_mail(sender="me@arturojamaica.com",
                           to="InstantRetro.5200@twitpic.com",
                           subject="New Photo : [ %s ] " % CompressURL(
                               ('http://www.instantretro.com/view/' + str(foto.key()))),
                           body="New Photo",
                           attachments=[('Uploaded.jpg', (foto.image))])

            mail.send_mail(sender="me@arturojamaica.com",
                           to="awhile270bugler@m.facebook.com",
                           subject="New Photo : %s" % CompressURL(
                               ('http://www.instantretro.com/view/' + str(foto.key()))),
                           body="New Photo",
                           attachments=[('Uploaded.jpg', (foto.image))])

        self.response.out.write('{"key" : "' + str(foto.key()) + '" }')


class Delete(webapp.RequestHandler):
    def post(self):
        key = self.request.get("key")
        foto = db.get(key)
        foto.delete()
        self.response.out.write('')
        return

    def get(self):
        key = self.request.get("key")
        foto = db.get(key)
        foto.delete()
        self.response.out.write('')
        return


class SocialNetwork(BaseHandler):
    def post(self):
        if self.request.get("connection_token"):
            token = self.request.get("connection_token")
            site_subdomain = 'intantretro'
            site_public_key = '943b33da-8775-4b38-9b90-b2f0ed77655d'
            site_private_key = 'b0d821f9-2278-4449-ade7-e660bc8affdb'

            site_domain = site_subdomain + '.api.oneall.com'
            resource_uri = 'https://' + site_domain + '/connections/' + token + '.json'

            from google.appengine.api import urlfetch
            import base64

            encoded = base64.b64encode(site_public_key + ':' + site_private_key)
            authstr = "Basic " + encoded

            url = resource_uri

            mheaders = {'Authorization': authstr, }

            result = urlfetch.fetch(url, deadline=20, headers=mheaders)

            if result.status_code == 200:
                from django.utils import simplejson

                json = simplejson.loads(result.content)
                data = json["response"]["result"]["data"]

                if data["plugin"]["key"] == 'social_login':
                    if data["plugin"]["data"]["status"] == 'success':
                        user_token = data["user"]["user_token"]
                        user = User.get_by_key_name(user_token)

                        if not user:
                            user = data["user"]
                            profile = user["identity"]
                            user = User(key_name=user_token,
                                        id=str(user["uuid"]),
                                        name=profile["name"]["formatted"],
                                        profile_url=profile["id"],
                                        source=profile["provider"],
                                        access_token=user_token,
                                        avatar = "http://www.instantretro.com/images/avatar.png",
                            )
                            try:
                                user.email = profile["emails"][0]["value"]
                            except:
                                pass
                            user.put()
                        else:
                            user.put()

                        self.session = Session()
                        try:
                            self.session.delete_item['username']
                        except:
                            pass
                        self.session['username'] = user_token
                        self.redirect('/')
            else:
                self.redirect('/?error')


class About(BaseHandler):
    def get(self):
        fotos = db.GqlQuery("SELECT * FROM Foto WHERE shared=True ORDER BY date DESC  LIMIT 0, 4")
        template_values = {'fotos': fotos, 'current_user': self.current_user}
        path = os.path.join(os.path.dirname(__file__), 'templates/aboutus.html')
        self.response.out.write(template.render(path, template_values))


class Face(BaseHandler):
    def get(self):
        self.current_user
        self.redirect("/")


class MainPage(BaseHandler):
    def get(self):
        fotos = db.GqlQuery("SELECT * FROM Foto WHERE shared=True ORDER BY date DESC  LIMIT 0, 4")
        template_values = {'fotos': fotos, 'current_user': self.current_user}
        path = os.path.join(os.path.dirname(__file__), 'templates/index.html')
        self.response.out.write(template.render(path, template_values))


class View(BaseHandler):
    def get(self, key):
        query = db.GqlQuery("SELECT * FROM Foto  ORDER BY date DESC  LIMIT 0, 25")
        fotos = list()
        fotos = filter(lambda q: q.shared, query)[:4]
        import random
        try:
            foto = db.get(key)

        except Exception, e:
            self.error(404)
            return
        foto.hint = foto.hint + 1

        try:
            if not foto.published:
                name = str(time()) + '_saved_' + str(random.randrange(0, 100000))
                test_object = published.create_object(name)
                test_object.content_type = 'image/png'
                test_object.write(foto.image, verify=False)
                foto.published = test_object.public_uri()
        except:
            pass
        foto.put()

        template_values = {
            'key': foto.key(),
            'hint': foto.hint,
            'mobile': foto.mobile,
            'url': CompressURL(('http://www.instantretro.com/view/' + str(foto.key()))),
            'image': urllib.quote('http://www.instantretro.com/upload/' + str(foto.key())),
            'title': foto.title,
            'fotos': fotos,
            'foto': foto,
            'current_user': self.current_user
        }
        path = os.path.join(os.path.dirname(__file__), 'templates/view.html')
        self.response.out.write(template.render(path, template_values))


class Back(webapp.RequestHandler):
    def get(self, key):
        foto = db.get(key)
        try:
            self.response.headers['Content-Type'] = "image/jpg"
            result = urlfetch.fetch(foto.rackspace, deadline=20)
            if result.status_code == 200:
                self.response.out.write((result.content))
        except:
            self.response.headers['Content-Type'] = "image/jpg"
            self.response.out.write(str(foto.image))


class SettingsHandler(BaseHandler):
    def post(self):
        import random
        if self.request.get("Filedata"):
            upload_files = self.request.get("Filedata")
            img = rescale(str(upload_files), 200,200)
            avatar = conn.create_container('avatars')
            avatar.make_public(2592000)

            name = str(time()) + 'avatar_' + str(random.randrange(0, 100000))
            test_object = avatar.create_object(name)
            test_object.content_type = 'image/png'
            test_object.write(img, verify=False)
            urlrack = test_object.public_uri()
            key = (self.request.get('key'))
            logging.info(key)
            user = User.get_by_key_name(key)
            user.avatar = urlrack
            user.put()
            self.response.out.write(urlrack)


    def get(self):
        
        if(self.current_user):
            template_values = {
                'current_user': self.current_user,
                'username' : self.current_user.user[0].name
            }
            path = os.path.join(os.path.dirname(__file__), 'templates/settings.html')
            self.response.out.write(template.render(path, template_values))
        else:
            self.error(400)
            return



class UploadHandler(blobstore_handlers.BlobstoreUploadHandler):
    def post(self):
        import random

        if self.request.get("webcam"):
            upload_files = base64.b64decode(self.request.get("Filedata").replace('data:image/png;base64,', ''))
        else:
            upload_files = self.request.get("Filedata")  # 'file' is file upload field in the form
        if(BLOBAPI):
            #logging.info(self.request)
            name = 'temp_' + str(random.randrange(0, 1000)) + "_" + self.request.get('Filename').encode('utf-8')
            try:
                img = images.resize(upload_files, width=800, output_encoding=images.PNG)
                file_name = files.blobstore.create(mime_type='image/jpg', _blobinfo_uploaded_filename=name)
                with files.open(file_name, 'a') as f:
                    f.write(str(img))
                    # Finalize the file. Do this before attempting to read it
            except:
                img2 = images.Image(upload_files)
                img = img2.resize(width=600, output_encoding=images.PNG)
                file_name = files.blobstore.create(mime_type='image/jpg', _blobinfo_uploaded_filename=name)
                with files.open(file_name, 'a') as f:
                    f.write(str(img))
                files.finalize(file_name)
                # Get the file's blob key
                blob_key = files.blobstore.get_blob_key(file_name)
                #blob_info = upload_files[0]
                self.response.out.write('/temp/%s' % blob_key)
        else:
            container = conn.create_container('pictures')
            container.make_public(2592000)
            try:
                name = str(time()) + 'temp_' + str(random.randrange(0, 100000))
                test_object = container.create_object(name)
                test_object.content_type = 'image/png'
                test_object.write(upload_files, verify=False)
                urlrack = test_object.public_uri()
                img = None
            except:
                urlrack=None
                img = images.resize(upload_files, width=600, output_encoding=images.PNG)
            tmp = Temporal(image=img, rackspace=urlrack)
            tmp.put()

            self.response.out.write('/back/%s' % tmp.key())


class ServeHandler(blobstore_handlers.BlobstoreDownloadHandler):
    def get(self, resource):
        resource = str(urllib.unquote(resource))
        blob_info = blobstore.BlobInfo.get(resource)

        self.send_blob(blob_info)


class Temp(webapp.RequestHandler):
    def get(self, nombre):
        img = db.get(nombre)

        try:
            img = images.Image(blob_key=img.imageblob.key())
            img.im_feeling_lucky()
            thumbnail = img.execute_transforms(output_encoding=images.JPEG)
            self.response.headers['Content-Type'] = 'image/jpeg'
            self.response.out.write(thumbnail)
        except:
            img.thumb = img.image
            self.response.headers['Content-Type'] = "image/jpg"
            self.response.out.write(str(img.thumb))


class Profile(BaseHandler):
    def get(self):
        if(self.current_user):
            usuario = db.get(self.current_user.key())
            query = usuario.owners
            template_values = {
                'fotos': query,
                'current_user': self.current_user
            }
            path = os.path.join(os.path.dirname(__file__), 'templates/profile.html')
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
    def get(self, nombre):
        img = db.get(nombre)

        try:
            img = images.Image(blob_key=img.imageblob.key())
            #img.resize(width=200, height=130)
            img.im_feeling_lucky()
            thumbnail = img.execute_transforms(output_encoding=images.JPEG)
            img.thumb = rescale(str(thumbnail), 300, 161)
            self.response.headers['Content-Type'] = 'image/jpeg'
            self.response.out.write((str(img.thumb)))
        except:
            img.thumb = rescale(str(img.image), 300, 161)
            self.response.headers['Content-Type'] = "image/jpg"
            self.response.out.write(str(img.thumb))


class Thumb2(webapp.RequestHandler):
    def get(self, nombre):
        img = db.get(nombre)

        try:
            img = images.Image(blob_key=img.imageblob.key())
            #img.resize(width=200, height=130)
            img.im_feeling_lucky()
            thumbnail = img.execute_transforms(output_encoding=images.JPEG)
            img.thumb = rescale(str(thumbnail), 95, 100)
            self.response.headers['Content-Type'] = 'image/jpeg'
            self.response.out.write((str(img.thumb)))
        except:
            img.thumb = rescale(str(img.image), 95, 100)
            self.response.headers['Content-Type'] = "image/jpg"
            self.response.out.write(str(img.thumb))


class Featured(webapp.RequestHandler):
    def get(self, nombre):
        img = db.get(nombre)
        try:
            img = images.Image(blob_key=img.imageblob.key())
            #img.resize(width=200, height=130)
            img.im_feeling_lucky()
            thumbnail = img.execute_transforms(output_encoding=images.JPEG, quality=60)
            img.thumb = rescale(str(thumbnail), 600, 250)
            self.response.headers['Content-Type'] = 'image/jpeg'
            self.response.out.write((str(img.thumb)))
        except:
            img.thumb = rescale(str(img.image), 600, 250)
            self.response.headers['Content-Type'] = "image/jpg"
            self.response.out.write(str(img.thumb))


class MobileGallery(webapp.RequestHandler):
    def get(self):
        query = db.GqlQuery(
            "SELECT * FROM Foto WHERE shared=True ORDER BY date DESC  LIMIT 50 OFFSET " + str(int(0) * 5) + "0")

        template_values = {
            'fotos': query,
            }

        path = os.path.join(os.path.dirname(__file__), 'remote/gallery.html')
        self.response.out.write(template.render(path, template_values))


class Mobile(webapp.RequestHandler):
    def post(self):
        upload_files = base64.b64decode(self.request.get("myPhoto").replace('data:image/png;base64,', ''))
        foto = Foto()
        foto.hint = 0
        foto.image = images.resize(upload_files, width=600, output_encoding=images.PNG)
        foto.title = self.request.get('message') or ""
        foto.shared = True
        foto.mobile = False
        try:
            foto.put()
        except Exception, e:
            foto.image = images.resize(upload_files, width=600, output_encoding=images.PNG)

        img = images.resize(upload_files, width=600, output_encoding=images.PNG)
        mail.send_mail(sender="me@arturojamaica.com",
                       to="awhile270bugler@m.facebook.com",
                       subject="Via: %s " % CompressURL(('http://www.instantretro.com/view/' + str(foto.key()))),
                       body="New Photo",
                       attachments=[('Uploaded.jpg', (img))])

        mail.send_mail(sender="me@arturojamaica.com",
                       to="ajamaica.1929@twitpic.com",
                       subject="New Photo : [ %s ] " % CompressURL(
                           ('http://www.instantretro.com/view/' + str(foto.key()))),
                       body="New Photo",
                       attachments=[('Uploaded.jpg', (img))])

        c = CompressURL('http://www.instantretro.com/view/' + str(foto.key()))
        self.response.out.write('<mediaurl>%s</mediaurl>' % c)


class Big(webapp.RequestHandler):
    def get(self, nombre):
        img = db.get(nombre)
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


class Gallery(BaseHandler):
    def get(self, page):
        if str(page) == '':
            page = 0
            primera = True
        query = db.GqlQuery(
            "SELECT * FROM Foto WHERE shared=True ORDER BY date DESC  LIMIT 50 OFFSET " + str(int(page) * 5) + "0")
        f = db.GqlQuery("SELECT * FROM Foto")
        c = f.count()
        hojas = int(c / 50)
        primera = False
        ultima = False

        if str(page) == '0':
            page = 0
            primera = True
        if str(page) == str(hojas):
            ultima = True
        template_values = {
            'primera': primera,
            'ultima': ultima,
            'fotos': query,
            'siguiente': int(page) + 1,
            'anterior': int(page) - 1,
            'current_user': self.current_user
        }
        path = os.path.join(os.path.dirname(__file__), 'templates/gallery.html')
        self.response.out.write(template.render(path, template_values))


class HomeHandler(BaseHandler):
    def get(self):
        view = self.request.get("view")
        query = db.GqlQuery("SELECT * FROM Foto WHERE shared=True ORDER BY date DESC  LIMIT 0, 5")
        if view != '':
            try:
                foto = db.get(view)
            except Exception, e:
                self.error(404)
                return
            template_values = {
                'key': foto.key(),
                'url': urllib.quote('http://apps.facebook.com/instantretro/?view=' + str(foto.key())),
                'image': urllib.quote('http://www.instantretro.com/upload/' + str(foto.key())),
                'title': foto.title,
                'fotos': query
            }
            path = os.path.join(os.path.dirname(__file__), 'templates/viewfb.html')
            self.response.out.write(template.render(path, template_values))
        else:
            path = os.path.join(os.path.dirname(__file__), "templates/indexfb.html")
            args = dict(current_user=self.current_user,
                        facebook_app_id=FACEBOOK_APP_ID, fotos=query)
            self.response.out.write(template.render(path, args))

    def post(self):
        view = self.request.get("view")
        query = db.GqlQuery("SELECT * FROM Foto WHERE shared=True ORDER BY date DESC  LIMIT 0, 5")
        if view != '':
            try:
                foto = db.get(view)
            except Exception, e:
                self.error(404)
                return
            template_values = {
                'key': foto.key(),
                'url': urllib.quote('http://apps.facebook.com/instantretro/?view=' + str(foto.key())),
                'image': urllib.quote('http://www.instantretro.com/upload/' + str(foto.key())),
                'title': foto.title,
                'fotos': query
            }
            path = os.path.join(os.path.dirname(__file__), 'templates/viewfb.html')
            self.response.out.write(template.render(path, template_values))
        else:
            path = os.path.join(os.path.dirname(__file__), "templates/indexfb.html")
            args = dict(current_user=self.current_user,
                        facebook_app_id=FACEBOOK_APP_ID, fotos=query)
            self.response.out.write(template.render(path, args))

class UserProfile(BaseHandler):
    
    def get(self, userkey):
        logging.info(userkey)
        user = User.get_by_key_name(userkey)
        shortlink = False
        if user:
            logging.info(user)
        else:
            short = Short.get_by_key_name(userkey)
            if short:
                user = short.user
                logging.info(user)
                shortlink = short.name
            else :
                logging.info(404)
                self.error(404)
                return

        query = user.owners
        path = os.path.join(os.path.dirname(__file__), "templates/profile_public.html")
        args = dict(current_user=self.current_user, profile_user = user, fotos = query, short = shortlink)
        self.response.out.write(template.render(path, args))
        
class WorkerPushRequestHandler(webapp.RequestHandler):
    pusher_app_id = '6352'
    pusher_api_key = '720b36ffab8354389606'
    pusher_secret = '4c40c4a6fb07da199b3b'

    def get(self, channel, event):
        pusher = pusherapp.Pusher(app_id=self.pusher_app_id,
                                  key=self.pusher_api_key, secret=self.pusher_secret)

        data = dict([(arg, self.request.get(arg)) for arg in self.request.arguments()])

        result = pusher[channel].trigger(event, data="sdfd")

        if result.status_code >= 200 and result.status_code <= 299:
            self.response.headers["Content-Type"] = "text/plain"
            self.response.out.write("OK")
        else:
            self.response.out.write(result.status_code)

    def post(self, channel, event):
        pusher = pusherapp.Pusher(app_id=self.pusher_app_id,
                                  key=self.pusher_api_key, secret=self.pusher_secret)

        data = dict([(arg, self.request.get(arg)) for arg in self.request.arguments()])

        result = pusher[channel].trigger(event, data=data)

        if result.status_code >= 200 and result.status_code <= 299:
            self.response.headers["Content-Type"] = "text/plain"
            self.response.out.write("OK")
        else:
            self.response.out.write(result.status_code)


class LogoutHandler(webapp.RequestHandler):
    def get(self):
        self.session = Session()
        del self.session['username']
        self.redirect('/')