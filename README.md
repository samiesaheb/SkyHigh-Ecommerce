# 🛍️ Sky High E-commerce Platform

A full-stack cosmetics e-commerce platform for **Sky High International Co., Ltd.**, built with Django backend and Next.js frontend. Designed for both B2B (OEM/private label) and B2C customers with comprehensive product management, user experience, and analytics features.

---

## 🚀 Core Features

### 🛒 **E-Commerce Functionality**
- **Product Catalog**: Complete product browsing with brand-based categories (Facial Care, Body & Skin Care, Hair Care, Geometry)
- **Advanced Filtering**: Sort by name (A-Z, Z-A), price (low-high, high-low), newest/oldest with smart zero-price handling
- **Intelligent Search**: Live search with autocomplete, product suggestions, and smart category mapping
- **Shopping Cart**: Full cart management with quantity controls, image previews, and session persistence
- **Wishlist System**: Save favorite products with user-specific wishlist management
- **Checkout Process**: Complete order placement with shipping details and order confirmation

### 🔐 **User Management & Authentication**
- **User Registration & Login**: Secure authentication with email-based accounts
- **User Profiles**: Comprehensive user profile management with edit capabilities
- **Password Management**: Secure password change and forgot password functionality
- **Order History**: Complete order tracking and history for registered users
- **Guest Checkout**: Allow non-registered users to place orders

### 📊 **Admin & Analytics Dashboard**
- **Sales Overview**: Comprehensive sales analytics with revenue tracking
- **Daily Sales Reports**: Day-by-day sales performance analysis  
- **Top Products Analytics**: Best-selling products identification and metrics
- **Brand Performance**: Individual brand sales performance and insights
- **Customer Insights**: User behavior and demographic analytics
- **Product Management**: Full CRUD operations for products, brands, and inventory
- **Order Management**: Order processing, status updates, and fulfillment tracking

### ⭐ **Product Reviews & Ratings**
- **Customer Reviews**: 5-star rating system with detailed review comments
- **Verified Purchase Reviews**: Mark reviews from actual purchasers
- **Helpful Review Voting**: Community-driven review helpfulness rating
- **Review Management**: Admin approval system for review moderation
- **Brand-Specific Reviews**: Specialized review system for Geometry brand products

### 🎨 **User Experience & Design**
- **Responsive Design**: Mobile-first approach with seamless desktop experience
- **Smooth Animations**: Loading transitions, hover effects, and micro-interactions
- **Search Overlay**: Advanced search interface with keyboard navigation
- **Error Handling**: Comprehensive error states with user-friendly messages
- **Loading States**: Skeleton loaders and progress indicators throughout
- **Toast Notifications**: Real-time feedback for user actions
- **Enhanced Cart UI**: Improved shopping bag dropdown with intuitive remove buttons

### 🔍 **Advanced Search & Discovery**
- **Live Product Search**: Real-time search with product suggestions
- **Category Intelligence**: Smart mapping of search terms to product categories
- **Brand-Based Filtering**: Filter products by cosmetic categories (Facial Care, Hair Care, etc.)
- **Price Range Filtering**: Custom price range selection with min/max inputs
- **Stock Availability**: Filter by in-stock products only
- **Search Suggestions**: Autocomplete with product images and brand information

### ⚡ **Performance & Optimization**
- **Core Web Vitals Monitoring**: Real-time performance tracking with Web Vitals v5
- **Dynamic Component Loading**: Code splitting for heavy components to reduce initial bundle size
- **Advanced Bundle Optimization**: Strategic chunk splitting by library type (React, Stripe, Charts)
- **Turbopack Development**: Lightning-fast development builds with Turbopack
- **Image Optimization**: Next.js Image component with AVIF/WebP formats and caching
- **Performance Analytics**: Automatic tracking of LCP, CLS, INP, FCP, and TTFB metrics
- **Bundle Analysis**: Built-in webpack bundle analyzer for optimization insights

### 📱 **Pages & Navigation**
- **Homepage**: Hero section with featured products and category showcases
- **Product Listing**: Grid view with infinite scroll and comprehensive filtering
- **Product Details**: Detailed product pages with reviews, specifications, and related products
- **Cart Page**: Full cart management with quantity updates and checkout flow
- **Checkout**: Multi-step checkout process with shipping and billing information
- **User Dashboard**: Profile management, order history, and account settings
- **Brand Pages**: Dedicated pages for each cosmetic brand/category
- **Legal Pages**: Privacy Policy, Terms & Conditions, and company information
- **Contact & About**: Company information and contact details
- **Thank You**: Order confirmation and success pages

---

## 🧱 Tech Stack

| Layer         | Technology                       |
|--------------|----------------------------------|
| **Frontend**     | Next.js 15.5.3, React 19, TypeScript 5, Tailwind CSS 4, ShadCN UI Components |
| **Backend**      | Django 5.2.5, Django Rest Framework, Python 3.11 |
| **Database**     | SQLite (Development) / PostgreSQL (Production) |
| **Authentication** | Django Session Authentication, Custom User Models, Google OAuth |
| **UI/UX**        | Responsive Design, Framer Motion, Lucide Icons, PWA Support |
| **State Management** | React Context API, Custom Hooks |
| **File Handling** | Django Media Files, Next.js Image Optimization |
| **API Architecture** | RESTful APIs, JSON Serialization |
| **Configuration** | Split Settings (Development/Testing/Production) |
| **Task Queue** | Celery with Redis/RabbitMQ |
| **Performance** | Web Vitals v5, Bundle Optimization, Turbopack |
| **Testing** | Jest, Playwright, MSW, Testing Library |
| **Payments** | Stripe Integration |

---

## ⚙️ Architecture & Configuration

### Backend Architecture
- **Split Settings Configuration**: Separate settings files for different environments (development, testing, production)
- **Apps Organization**: Django apps organized in `/apps/` directory for better modularity
- **Environment Management**: Environment-specific variable files in `/config/env/`
- **API Structure**: Dedicated API configurations with mobile-specific endpoints

### Frontend Architecture
- **Feature-Based Components**: Components organized by functionality (auth, cart, search, etc.)
- **Dynamic Imports**: Code splitting for heavy components with loading states
- **Performance Monitoring**: Real-time Web Vitals tracking and analytics
- **Bundle Optimization**: Strategic chunk splitting and tree shaking
- **Profile System**: Complete user profile management with consistent UI/UX
- **Responsive Design**: Mobile-first approach with seamless desktop experience
- **Full-Width Hero**: Edge-to-edge hero sections for maximum visual impact
- **PWA Ready**: Progressive Web App capabilities with offline support

### Settings Configuration
The project uses a sophisticated split settings system:
- **`base.py`**: Common settings shared across all environments
- **`development.py`**: Development-specific configurations with debug tools
- **`production.py`**: Production-optimized settings with security enhancements
- **`testing.py`**: Testing environment with optimized database and logging

See `backend/README_SETTINGS.md` for detailed configuration instructions.

---

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 18+ 
- npm or yarn

### 1. Clone the repository
```bash
git clone <your-repository-url>
cd skyhigh
```

### 2. Backend Setup (Django)
```bash
cd backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp config/env/.env.development .env

# Run database migrations
python manage.py migrate

# Collect static files
python manage.py collectstatic

# Create superuser (optional)
python manage.py createsuperuser

# Start development server
python manage.py runserver
```

### 3. Frontend Setup (Next.js)
```bash
cd frontend
npm install

# Development with Turbopack (recommended)
npm run dev

# Alternative development modes
npm run dev:web     # Web-optimized mode
npm run dev:mobile  # Mobile-optimized mode
```

### 4. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Admin Panel**: http://localhost:8000/admin

### 5. Performance Monitoring (Optional)
```bash
# Frontend performance analysis
cd frontend
npm run build:analyze        # Bundle analysis
npm run build:performance    # Production build with analysis

# Monitor Web Vitals in development
# Check browser console for real-time performance metrics
```

---

## 📦 Project Structure

```
skyhigh/
├── backend/                    # Django backend
│   ├── skyhigh_backend/       # Main project configuration
│   │   ├── settings/          # Split settings configuration
│   │   │   ├── base.py        # Common settings
│   │   │   ├── development.py # Development environment
│   │   │   ├── production.py  # Production environment
│   │   │   └── testing.py     # Testing environment
│   │   ├── urls.py            # URL routing
│   │   ├── mobile_urls.py     # Mobile API URLs
│   │   ├── celery.py          # Celery configuration
│   │   ├── asgi.py            # ASGI application
│   │   └── wsgi.py            # WSGI application
│   ├── apps/                  # Django applications (organized)
│   │   ├── accounts/          # User authentication & profiles
│   │   ├── cart/              # Shopping cart functionality
│   │   ├── core/              # Core utilities & analytics dashboard
│   │   ├── inventory/         # Stock management & tracking
│   │   ├── notifications/     # Email/SMS notification system
│   │   ├── orders/            # Order processing & analytics
│   │   ├── products/          # Product management & search
│   │   ├── reviews/           # Product reviews & ratings
│   │   └── wishlist/          # User wishlist functionality
│   ├── config/                # Configuration files
│   │   └── env/               # Environment variable templates
│   │       ├── .env.example   # Base environment variables
│   │       ├── .env.development # Development variables
│   │       ├── .env.testing   # Testing variables
│   │       └── .env.production # Production template
│   ├── api/                   # API-specific configurations
│   ├── scripts/               # Utility scripts for maintenance
│   ├── data/                  # JSON fixtures and data files
│   ├── static/                # Static files (logos, icons, CSS, JS)
│   │   ├── images/            # Logo files and static images
│   │   ├── icons/             # SVG icons and favicons
│   │   ├── css/               # Custom stylesheets
│   │   └── js/                # Admin JavaScript files
│   ├── media/                 # User uploads & product images
│   ├── logs/                  # Application logs
│   ├── templates/             # Django templates
│   ├── venv/                  # Virtual environment
│   ├── manage.py              # Django management script
│   └── README_SETTINGS.md     # Settings configuration guide
├── frontend/                  # Next.js frontend  
│   ├── src/
│   │   ├── app/              # Next.js app router pages
│   │   │   ├── profile/      # User profile pages (overview, edit, orders, change-password)
│   │   │   ├── products/     # Product catalog and details
│   │   │   ├── cart/         # Shopping cart
│   │   │   ├── checkout/     # Checkout process
│   │   │   ├── account/      # Authentication pages
│   │   │   └── ...           # Other application pages
│   │   ├── components/       # Feature-organized UI components
│   │   │   ├── auth/         # Authentication components
│   │   │   ├── cart/         # Shopping cart components
│   │   │   ├── common/       # Shared/common components (Toast, etc.)
│   │   │   ├── error/        # Error handling components
│   │   │   ├── layout/       # Layout components (Header, Footer, Navigation)
│   │   │   ├── reviews/      # Review and rating components
│   │   │   ├── search/       # Search functionality components
│   │   │   ├── ui/           # ShadCN UI components
│   │   │   └── wishlist/     # Wishlist components
│   │   ├── hooks/            # Custom React hooks
│   │   ├── lib/              # Utilities and configurations
│   │   └── types/            # TypeScript type definitions
│   ├── public/               # Static assets
│   ├── package.json          # Dependencies and scripts
│   ├── tailwind.config.js    # Tailwind CSS configuration
│   ├── next.config.ts        # Next.js configuration
│   └── tsconfig.json         # TypeScript configuration
└── mobile/                   # React Native mobile app (separate)
```

---

## 🗄️ Database Schema

### Core Models
- **Products**: Product information, pricing, images, and brand relationships
- **Brands**: Cosmetic categories (Facial Care, Body & Skin Care, Hair Care, Geometry)
- **Orders**: Customer orders with shipping details and order items
- **Users**: Customer accounts with profiles and authentication
- **Reviews**: Product reviews with ratings and helpful voting system
- **Cart**: Shopping cart with session persistence and guest support

---

## 🔒 Security Features

- **CSRF Protection**: Cross-Site Request Forgery protection on all forms
- **Session Security**: Secure session management with automatic cleanup
- **Password Security**: Secure password hashing and validation
- **Input Validation**: Comprehensive input sanitization and validation
- **Permission Controls**: Role-based access control for admin features
- **File Upload Security**: Secure image upload with type validation

---

## ✨ Recently Implemented

- **Performance Optimization**: Core Web Vitals monitoring, bundle optimization, and dynamic imports ✅
- **Payment Integration**: Stripe payment processing (partial implementation) ✅
- **Enhanced UX**: Improved cart UI with intuitive remove buttons ✅
- **PWA Support**: Progressive Web App capabilities ✅

## 🚀 Planned Features

- **Inventory Management**: Real-time stock tracking and low-stock alerts
- **Email Notifications**: Order confirmations and shipping updates
- **Multi-language Support**: Thai and English language options
- **Advanced Analytics**: Detailed business intelligence dashboard
- **Mobile App**: React Native companion app for iOS and Android (in progress)
- **API Rate Limiting**: Enhanced API security and performance
- **SEO Optimization**: Enhanced search engine optimization

---

## 🏢 About Sky High International

Sky High International Co., Ltd. is a Thailand-based OEM/private label cosmetics manufacturer, specializing in skincare, body care, and hair care products for global clients. This platform serves as their digital storefront and B2B portal.

**Product Categories:**
- **Facial Care**: Cleansers, serums, moisturizers, and anti-aging products
- **Body & Skin Care**: Soaps, lotions, and specialized skin treatments  
- **Hair Care**: Shampoos, conditioners, and hair treatment products
- **Geometry**: Premium beauty and cosmetic product line

[Learn more about Sky High International →](https://skyhigh-inter.com)

---

## 📚 Additional Documentation

- **[Settings Configuration](backend/README_SETTINGS.md)** - Detailed guide to the split settings system
- **[Deployment Guide](DEPLOYMENT.md)** - Production deployment instructions and best practices
- **[Testing Guide](TESTING_GUIDE.md)** - Comprehensive testing documentation and coverage reports
- **[Performance Guide](frontend/PERFORMANCE_GUIDE.md)** - Performance optimization strategies and Web Vitals monitoring
- **[Web Vitals Fix](frontend/WEB_VITALS_FIX.md)** - Resolution of Web Vitals v5 import issues and API changes

---

## 📄 License

This project is proprietary software developed for Sky High International Co., Ltd.

---

## 🤝 Contributing

This is a private commercial project. For inquiries about the codebase or potential collaboration, please contact the development team.

---

*Built with ❤️ for Sky High International Co., Ltd.*
