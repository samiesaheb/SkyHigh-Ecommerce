# Sky High Frontend

Next.js 15.5.3 frontend for the Sky High e-commerce platform, built with React 19, TypeScript 5, and Tailwind CSS 4.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm, yarn, pnpm, or bun

### Development
```bash
npm run dev          # Standard development with Turbopack
npm run dev:mobile   # Mobile-optimized development
npm run dev:web      # Web-optimized development
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

### Building
```bash
npm run build                # Standard production build
npm run build:production     # Optimized production build
npm run build:analyze        # Build with bundle analysis
npm run build:performance    # Production build with performance analysis
npm run build:turbo          # Build with Turbopack
npm run build:webpack        # Build with webpack (for analysis)
```

### Testing
```bash
npm test                # Unit tests with Jest
npm run test:watch      # Watch mode
npm run test:coverage   # Coverage report
npm run test:e2e        # End-to-end tests with Playwright
npm run test:e2e:ui     # E2E tests with UI
npm run test:all        # All tests
```

## 🏗 Architecture

### Performance Optimizations
- **Core Web Vitals Monitoring**: Real-time tracking of LCP, CLS, INP, FCP, TTFB
- **Dynamic Imports**: Code splitting for heavy components
- **Bundle Optimization**: Strategic chunk splitting by library type
- **Image Optimization**: AVIF/WebP formats with Next.js Image component

### Key Features
- **Responsive Design**: Mobile-first with seamless desktop experience
- **PWA Support**: Progressive Web App capabilities
- **Real-time Search**: Live product search with autocomplete
- **Shopping Cart**: Advanced cart management with dropdowns
- **User Authentication**: Google OAuth integration
- **Payment Processing**: Stripe integration
- **Analytics**: Google Analytics 4 with custom events

### Component Structure
```
src/
├── app/                    # Next.js app router pages
├── components/
│   ├── auth/              # Authentication components
│   ├── cart/              # Shopping cart components
│   ├── search/            # Search functionality
│   ├── ui/                # ShadCN UI components
│   ├── dynamic/           # Dynamic imports with loading states
│   └── ...
├── lib/                   # Utilities and configurations
│   ├── vitals.ts         # Web Vitals monitoring
│   ├── cache.ts          # Caching utilities
│   └── ...
└── types/                 # TypeScript definitions
```

## 📊 Performance

### Bundle Analysis
Run `npm run build:analyze` to see detailed bundle composition and optimization opportunities.

### Web Vitals Monitoring
- **Development**: Console logging of all metrics
- **Production**: Automatic reporting to Google Analytics and backend

### Performance Targets
- **LCP**: < 2.5s (Good)
- **CLS**: < 0.1 (Good)
- **INP**: < 200ms (Good)
- **FCP**: < 1.8s (Good)
- **TTFB**: < 800ms (Good)

## 🛠 Development

### Code Quality
- **TypeScript**: Strict mode enabled
- **ESLint**: Enforced during builds
- **Testing**: Jest + Testing Library + Playwright

### Environment Variables
- Copy `.env.development` to `.env.local` for development
- See `.env.example` for required variables

## 📚 Documentation

- **[Performance Guide](PERFORMANCE_GUIDE.md)** - Optimization strategies and monitoring
- **[Web Vitals Fix](WEB_VITALS_FIX.md)** - Web Vitals v5 migration guide

## 🔗 Related

- [Main Project Repository](../) - Full-stack Sky High platform
- [Backend API](../backend/) - Django REST API
- [Mobile App](../mobile/) - React Native companion app

---

Built with ❤️ using Next.js 15, React 19, and modern web technologies.