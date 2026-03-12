# Sky High Mobile App

A React Native mobile app for Sky High e-commerce platform built with Expo.

## Features

- 🔐 User Authentication (Login/Register with JWT)
- 🛍️ Product Catalog with Search
- 🛒 Shopping Cart Management
- 💳 Checkout Process
- 👤 User Profile Management
- 📦 Order History
- 📱 iOS/Android Compatible via Expo Go

## Tech Stack

- **Framework**: React Native with Expo
- **Navigation**: React Navigation
- **State Management**: React Context API
- **Authentication**: JWT Tokens with Secure Storage
- **HTTP Client**: Axios
- **Backend API**: Django REST Framework

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- Expo Go app on your iOS/Android device
- Django backend running on network-accessible IP

## Setup Instructions

### 1. Install Dependencies

```bash
cd mobile
npm install
```

### 2. Configure API Endpoint

Update the API URL in `app.json`:

```json
{
  "expo": {
    "extra": {
      "apiUrl": "http://YOUR_COMPUTER_IP:8000"
    }
  }
}
```

Replace `YOUR_COMPUTER_IP` with your actual IP address (not localhost).

### 3. Start the Backend

Ensure your Django backend is running and accessible from your mobile device:

```bash
cd ../backend
python manage.py runserver 0.0.0.0:8000
```

### 4. Start the Mobile App

```bash
npm start
```

This will open the Expo Dev Tools in your browser with a QR code.

### 5. Run on Device

- Download Expo Go from the App Store (iOS) or Play Store (Android)
- Scan the QR code with Expo Go app
- The app will load on your device

## Project Structure

```
mobile/
├── src/
│   ├── components/          # Reusable UI components
│   ├── context/            # React Context providers
│   │   ├── AuthContext.tsx # Authentication state
│   │   └── CartContext.tsx # Shopping cart state
│   ├── navigation/         # Navigation configuration
│   ├── screens/           # App screens
│   │   ├── auth/         # Login/Register screens
│   │   ├── HomeScreen.tsx
│   │   ├── ProductsScreen.tsx
│   │   ├── CartScreen.tsx
│   │   └── ProfileScreen.tsx
│   ├── services/         # API services
│   └── types/           # TypeScript type definitions
├── App.tsx             # Root component
└── app.json           # Expo configuration
```

## API Endpoints

The mobile app uses the following Django API endpoints:

- `POST /mobile/auth/jwt/create/` - Login
- `POST /mobile/accounts/register/` - Register
- `GET /mobile/accounts/user/` - Get user info
- `GET /mobile/products/` - List products
- `GET /mobile/products/brands/` - List brands
- `POST /mobile/orders/` - Create order
- `GET /mobile/orders/` - List user orders

## Key Features

### Authentication
- JWT-based authentication with secure token storage
- Automatic token refresh
- Form validation and error handling

### Shopping Experience
- Product browsing with search functionality
- Add to cart with quantity management
- Persistent cart using AsyncStorage
- Checkout with shipping information

### User Experience
- Native iOS/Android look and feel
- Tab-based navigation
- Pull-to-refresh functionality
- Loading states and error handling
- Responsive design for different screen sizes

## Development Notes

- Uses Expo managed workflow for easy development
- Compatible with Expo Go for testing
- TypeScript for type safety
- Follows React Native best practices
- Responsive design patterns

## Troubleshooting

### Cannot Connect to API
- Ensure Django is running with `0.0.0.0:8000`
- Update `apiUrl` in `app.json` with correct IP
- Check firewall settings
- Ensure mobile device is on same network

### App Won't Load
- Check Expo CLI version is latest
- Clear Expo cache: `expo start --clear`
- Restart Metro bundler
- Check for JavaScript errors in terminal

### Authentication Issues
- Verify JWT tokens are properly configured in Django
- Check Django CORS settings include mobile IP ranges
- Ensure secure token storage is working

## Building for Production

To build standalone apps:

```bash
# Build for iOS (requires macOS)
expo build:ios

# Build for Android
expo build:android
```

Note: Building standalone apps requires Expo account and may need additional configuration.