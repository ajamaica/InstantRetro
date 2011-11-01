Thu Apr 30 18:19:24 EDT 2009

Installing and using the sessions.py code for the Google Application
Engine.

This code should be available from:

http://www.appenginelearn.com/downloads/util.zip

This file should be unzipped and placed in a sub-directory of your 
application named "util".  It should look as follows.

$ ls -l
total 24
-rw-r-----@ 1 csev  staff   147 Nov 15 12:42 app.yaml
-rwxr-x---  1 csev  staff  2484 Nov 17 12:31 index.py
-rw-r--r--  1 csev  staff   471 Nov 18 05:01 index.yaml
drwxr-xr-x  3 csev  staff   102 Nov 16 12:13 static
drwxr-xr-x  7 csev  staff   238 Nov 17 15:34 templates
drwxr-xr-x  5 csev  staff   170 Nov 18 09:51 util
$ cd util
$ ls -l
total 8
-rw-r--r--@ 1 csev  staff     0 Nov 17 10:30 __init__.py
-rw-r--r--@ 1 csev  staff  2880 Nov 18 04:55 sessions.py
$ 

Using The Session

Session is quite simple - you must create the session before any
output is sent to the browser in case the creation of the session 
needs to set any cookies.  Once you have a session you can 
generally treat it like a Python dictionary:

  def post(self):
    self.session = Session()

    self.session['username'] = 'csev'

    if 'username' in self.session:
       logging.info(...)

    x = self.session['username']

    del self.session['username']

    y = self.session.get('shoppingcart',None)

    self.session.delete_item('username')

The last delete_item() is a convienence method that does not raise 
an error when the key is not found in the session.

Note: This should only be used for development or servers intended
not to scale.  Since this code only uses memcache at some point your 
servers will run out of memory and perform badly.  You should
find a session implementation that is more suitable for scalable 
production applications such as:

   http://code.google.com/p/gaeutilities/

Note: As of GAE Utilities 1.2.2 the delete_item() method is supported.
As such, you should be able to drop in GAE utilities 1.2.2 or later as
a replacement for this session. 

Earlier versions of this code used the delete() convienence method.

