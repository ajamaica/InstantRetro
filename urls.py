import settings
from views import *

application = webapp.WSGIApplication([
    ('/', MainPage),
    ('/settings/', SettingsHandler),
    ('/fb/', Face),
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
    ('/thumb2/(.*)', Thumb2),
    ('/worker/push/(.*)/(.*)', WorkerPushRequestHandler),
    ('/profile/', Profile),
    ('/big/(.*)', Big),
    ('/featured/(.*)', Featured),
    ('/gallery/(.*)', Gallery),
    ('/facebook/', HomeHandler),
    ('/remote/upload/', Mobile),
    ('/remote/gallery/', MobileGallery),
    ('/new', SocialNetwork),
    ('/logout/', LogoutHandler),
    ('/(.*)', UserProfile),

], debug=DEBUG)