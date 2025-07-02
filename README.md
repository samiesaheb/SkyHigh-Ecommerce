# 🛍️ Sky High E-commerce Platform

A full-stack cosmetics e-commerce platform for **Sky High International Co., Ltd.**, built with a Django backend and React frontend using ShadCN UI. Designed for both B2B (OEM/private label) and B2C customers.

---

## 🚀 Features

- 🧴 Product catalog with brand/category filters
- 🛒 Cart system with quantity controls and image previews
- 🔍 Live product search with keyboard navigation
- 🔐 User authentication (login/signup)
- 🧑‍💼 Admin dashboard for managing products, brands, orders, users
- 📦 Order placement & session syncing
- 🌐 Responsive UI styled with Tailwind CSS + ShadCN UI
- 🔗 REST API backend built with Django & Django Rest Framework

---

## 🧱 Tech Stack

| Layer         | Tech                             |
|--------------|----------------------------------|
| Frontend     | React, Vite, TypeScript, Tailwind CSS, ShadCN UI |
| Backend      | Django, Django Rest Framework    |
| Database     | PostgreSQL                        |
| Auth         | Django allauth / DRF JWT (depending on setup) |
| Deployment   | GitHub + (to be deployed on Railway / Render / Vercel) |

---

## 🧪 Setup Instructions

### 1. Clone the repo
```bash
git clone https://github.com/samiesaheb/SkyHigh-Ecommerce.git
cd SkyHigh-Ecommerce
```

### 2. Backend (Django)
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### 3. Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```

---

## 📦 Folder Structure

```
SkyHigh-Ecommerce/
├── backend/
│   ├── manage.py
│   ├── skyhigh/
│   └── ...
├── frontend/
│   ├── src/
│   ├── index.html
│   └── ...
```

---

## ✨ Coming Soon

- Stripe payment integration
- ERP & logistics microservice (Rust)
- Chatbot assistant for product selection
- Internationalization (i18n)

---

## 🏢 About Sky High International

> Sky High International Co., Ltd. is a Thailand-based OEM/private label cosmetics manufacturer, developing skincare, body care, and hair care products for global clients. [Learn more →](https://skyhigh-inter.com)
