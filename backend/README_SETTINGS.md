# Django Settings Configuration

This project uses a split settings configuration for better organization and environment management.

## Settings Structure

```
backend/
├── skyhigh_backend/settings/
│   ├── __init__.py
│   ├── base.py          # Common settings for all environments
│   ├── development.py   # Development-specific settings
│   ├── production.py    # Production-specific settings
│   └── testing.py       # Testing-specific settings
├── config/env/          # Environment variable files
│   ├── .env.development # Development environment variables
│   ├── .env.testing     # Testing environment variables
│   ├── .env.production  # Production environment template
│   └── .env.example     # Example/default environment variables
└── .env                 # Active environment file (git-ignored)
```

## Usage

### Development (default)
```bash
python manage.py runserver
# Uses skyhigh_backend.settings.development automatically
```

### Testing
```bash
DJANGO_SETTINGS_MODULE=skyhigh_backend.settings.testing python manage.py test
```

### Production
```bash
DJANGO_SETTINGS_MODULE=skyhigh_backend.settings.production python manage.py check --deploy
```

## Environment Files

- **`.env`** - Your active environment file (create from .env.development for local dev)
- **`config/env/.env.development`** - Development environment variables
- **`config/env/.env.testing`** - Testing environment variables  
- **`config/env/.env.production`** - Production environment template (copy and customize)
- **`config/env/.env.example`** - Base/example environment variables

## Environment Loading Order

1. `base.py` loads `config/env/.env.example` (base defaults)
2. Environment-specific settings load their respective env files (override=True)
3. Root `.env` file can provide local overrides

## Security Notes

- Never commit actual `.env` files with sensitive data
- Production environment variables should be set via your hosting platform
- The `.env.production` file is a template - copy it to create your actual production config