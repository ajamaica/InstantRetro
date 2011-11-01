from __future__ import with_statement
from google.appengine.ext.webapp.util import run_wsgi_app
from urls import application


def main():
    run_wsgi_app(application)

if __name__ == '__main__':
    main()