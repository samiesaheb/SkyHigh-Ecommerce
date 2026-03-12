# Sky High Deployment Guide

## Environment Configuration

### Development
```bash
# Use development settings (default)
export DJANGO_SETTINGS_MODULE=skyhigh_backend.settings.development
python manage.py runserver
```

### Production Deployment

#### 1. Environment Variables
Create `.env.production` with:
```bash
# Required Production Variables
DJANGO_SECRET_KEY=your-super-secret-key-here-make-it-long-and-random
DB_NAME=skyhigh_production
DB_USER=skyhigh_user
DB_PASSWORD=your-secure-database-password
DB_HOST=your-db-host
DB_PORT=5432
REDIS_URL=redis://your-redis-host:6379/1

# Update these with your actual domains
ALLOWED_HOSTS=your-domain.com,www.your-domain.com,api.your-domain.com
CORS_ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com
CSRF_TRUSTED_ORIGINS=https://your-domain.com,https://www.your-domain.com

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password

# Stripe Keys
STRIPE_SECRET_KEY=sk_live_your_live_stripe_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_live_stripe_key
```

#### 2. Database Setup
```bash
# Install PostgreSQL and create database
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo -u postgres createdb skyhigh_production
sudo -u postgres createuser skyhigh_user
sudo -u postgres psql -c "ALTER USER skyhigh_user WITH PASSWORD 'your-secure-password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE skyhigh_production TO skyhigh_user;"
```

#### 3. Production Deployment
```bash
# Set production environment
export DJANGO_SETTINGS_MODULE=skyhigh_backend.settings.production

# Install dependencies
pip install -r requirements.txt
pip install psycopg2-binary gunicorn

# Run migrations
python manage.py migrate

# Collect static files
python manage.py collectstatic --noinput

# Create superuser
python manage.py createsuperuser

# Start with Gunicorn
gunicorn skyhigh_backend.wsgi:application --bind 0.0.0.0:8000
```

#### 4. Nginx Configuration
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    location /static/ {
        alias /path/to/your/staticfiles/;
    }
    
    location /media/ {
        alias /path/to/your/media/;
    }
}
```

## Security Checklist

- [ ] `DEBUG = False` in production
- [ ] Strong `SECRET_KEY` set
- [ ] Database credentials secured
- [ ] HTTPS enabled with SSL certificates
- [ ] Security headers configured
- [ ] Debug endpoints disabled
- [ ] Error logging configured
- [ ] Backup strategy implemented

## Monitoring

Logs are stored in `backend/logs/django.log` with rotation.
Monitor for:
- Application errors
- Security events
- Performance issues
- Database connectivity