import dynamic from 'next/dynamic';
import { ComponentType } from 'react';

// Skeleton components for loading states
const SearchFiltersSkeleton = () => (
  <div className="space-y-6">
    <div className="h-8 bg-muted animate-pulse rounded"></div>
    <div className="space-y-3">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="h-6 bg-muted animate-pulse rounded"></div>
      ))}
    </div>
  </div>
);

const SearchBarSkeleton = () => (
  <div className="relative">
    <div className="h-12 bg-muted animate-pulse rounded-lg"></div>
  </div>
);

const AnalyticsDashboardSkeleton = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-32 bg-muted animate-pulse rounded-lg"></div>
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {[...Array(2)].map((_, i) => (
        <div key={i} className="h-64 bg-muted animate-pulse rounded-lg"></div>
      ))}
    </div>
  </div>
);

const LiveChatSkeleton = () => (
  <div className="fixed bottom-4 right-4 w-80 h-96 bg-muted animate-pulse rounded-lg"></div>
);

const PWAManagerSkeleton = () => null; // PWA manager doesn't need skeleton

// Dynamic imports with loading states
export const DynamicSearchFilters = dynamic(
  () => import('@/components/search/SearchFilters'),
  {
    loading: () => <SearchFiltersSkeleton />,
    ssr: false,
  }
);

export const DynamicSearchBar = dynamic(
  () => import('@/components/search/SearchBar'),
  {
    loading: () => <SearchBarSkeleton />,
    ssr: false,
  }
);

export const DynamicFilterSidebar = dynamic(
  () => import('@/components/search/FilterSidebar'),
  {
    loading: () => <SearchFiltersSkeleton />,
    ssr: false,
  }
);

export const DynamicAdvancedSearchResults = dynamic(
  () => import('@/components/search/AdvancedSearchResults'),
  {
    loading: () => (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(9)].map((_, i) => (
          <div key={i} className="h-64 bg-muted animate-pulse rounded-lg"></div>
        ))}
      </div>
    ),
    ssr: false,
  }
);

export const DynamicAnalyticsDashboard = dynamic(
  () => import('@/app/admin/analytics/page'),
  {
    loading: () => <AnalyticsDashboardSkeleton />,
    ssr: false,
  }
);

export const DynamicLiveChat = dynamic(
  () => import('@/components/realtime/LiveChat'),
  {
    loading: () => <LiveChatSkeleton />,
    ssr: false,
  }
);

export const DynamicPWAManager = dynamic(
  () => import('@/components/pwa/PWAManager'),
  {
    loading: () => <PWAManagerSkeleton />,
    ssr: false,
  }
);

// Chart components for analytics - heavy libraries
export const DynamicChart = dynamic(
  () => import('react-chartjs-2').then((mod) => mod.Chart),
  {
    loading: () => <div className="h-64 bg-muted animate-pulse rounded-lg"></div>,
    ssr: false,
  }
);

export const DynamicLine = dynamic(
  () => import('react-chartjs-2').then((mod) => mod.Line),
  {
    loading: () => <div className="h-64 bg-muted animate-pulse rounded-lg"></div>,
    ssr: false,
  }
);

export const DynamicBar = dynamic(
  () => import('react-chartjs-2').then((mod) => mod.Bar),
  {
    loading: () => <div className="h-64 bg-muted animate-pulse rounded-lg"></div>,
    ssr: false,
  }
);

export const DynamicDoughnut = dynamic(
  () => import('react-chartjs-2').then((mod) => mod.Doughnut),
  {
    loading: () => <div className="h-64 bg-muted animate-pulse rounded-lg"></div>,
    ssr: false,
  }
);

// Stripe components - only load when needed
export const DynamicPaymentElement = dynamic(
  () => import('@stripe/react-stripe-js').then((mod) => mod.PaymentElement),
  {
    loading: () => <div className="h-24 bg-muted animate-pulse rounded-lg"></div>,
    ssr: false,
  }
);

export const DynamicElements = dynamic(
  () => import('@stripe/react-stripe-js').then((mod) => mod.Elements),
  {
    ssr: false,
  }
) as ComponentType<any>;

// Framer Motion components - only load when needed for animations
export const DynamicAnimatePresence = dynamic(
  () => import('framer-motion').then((mod) => mod.AnimatePresence),
  {
    ssr: false,
  }
) as ComponentType<any>;

export const DynamicMotion = dynamic(
  () => import('framer-motion').then((mod) => mod.motion),
  {
    ssr: false,
  }
) as any;