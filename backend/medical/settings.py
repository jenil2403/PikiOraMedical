
import os
from pathlib import Path

import dj_database_url


# Project directory
BASE_DIR = Path(__file__).resolve().parent.parent


# Security settings
DEBUG = os.environ.get('DEBUG', 'True').lower() == 'true'

if DEBUG:
    SECRET_KEY = os.environ.get(
        'SECRET_KEY', 'local-development-key-not-for-production'
    )
else:
    SECRET_KEY = os.environ['SECRET_KEY']


ALLOWED_HOSTS = [
    'localhost',
    '127.0.0.1',
]

# Render backend hostname
RENDER_EXTERNAL_HOSTNAME = os.environ.get(
    'RENDER_EXTERNAL_HOSTNAME'
)

if RENDER_EXTERNAL_HOSTNAME:
    ALLOWED_HOSTS.append(RENDER_EXTERNAL_HOSTNAME)


# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    'rest_framework',
    'rest_framework.authtoken',
    'corsheaders',
    'appointments',
]


# Middleware configuration
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]


ROOT_URLCONF = 'medical.urls'


TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]


WSGI_APPLICATION = 'medical.wsgi.application'


# Database configuration
# PostgreSQL on Render and SQLite locally

if os.environ.get('DATABASE_URL'):
    DATABASES = {
        'default': dj_database_url.config(
            conn_max_age=600
        )
    }

elif DEBUG:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }

else:
    raise RuntimeError('DATABASE_URL is required in production.')


# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalisation
LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'Pacific/Auckland'

USE_I18N = True

USE_TZ = True


# Static files
STATIC_URL = '/static/'

STATIC_ROOT = BASE_DIR / 'staticfiles'


STORAGES = {
    'default': {
        'BACKEND': 'django.core.files.storage.FileSystemStorage',
    },
    'staticfiles': {
        'BACKEND': 'whitenoise.storage.CompressedManifestStaticFilesStorage',
    },
}


DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'


# React frontend connections
CORS_ALLOWED_ORIGINS = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
]


# Production frontend URL
FRONTEND_URL = os.environ.get('FRONTEND_URL')

if FRONTEND_URL:
    CORS_ALLOWED_ORIGINS.append(
        FRONTEND_URL.rstrip('/')
    )


# Trusted origins
CSRF_TRUSTED_ORIGINS = []

if RENDER_EXTERNAL_HOSTNAME:
    CSRF_TRUSTED_ORIGINS.append(
        f'https://{RENDER_EXTERNAL_HOSTNAME}'
    )


# REST API authentication
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
    ],
}


# Production security
if not DEBUG:
    SECURE_PROXY_SSL_HEADER = (
        'HTTP_X_FORWARDED_PROTO', 'https'
    )

    SECURE_SSL_REDIRECT = True

    SESSION_COOKIE_SECURE = True

    CSRF_COOKIE_SECURE = True

    SECURE_CONTENT_TYPE_NOSNIFF = True
