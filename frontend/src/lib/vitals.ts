import { onCLS, onINP, onFCP, onLCP, onTTFB, Metric } from 'web-vitals';

// Types for Core Web Vitals reporting
interface VitalReport {
  id: string;
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  navigationType: string;
  timestamp: number;
  url: string;
  userAgent: string;
}

// Configuration for thresholds
const VITALS_CONFIG = {
  CLS: { good: 0.1, poor: 0.25 },
  INP: { good: 200, poor: 500 }, // Interaction to Next Paint (replaces FID)
  FCP: { good: 1800, poor: 3000 },
  LCP: { good: 2500, poor: 4000 },
  TTFB: { good: 800, poor: 1800 },
};

// Helper function to determine rating
function getRating(metric: Metric): 'good' | 'needs-improvement' | 'poor' {
  const config = VITALS_CONFIG[metric.name as keyof typeof VITALS_CONFIG];
  if (!config) return 'good';

  if (metric.value <= config.good) return 'good';
  if (metric.value <= config.poor) return 'needs-improvement';
  return 'poor';
}

// Send vitals to analytics endpoint
async function sendToAnalytics(report: VitalReport) {
  try {
    // Send to Google Analytics 4 if available
    if (typeof gtag !== 'undefined') {
      gtag('event', report.name, {
        event_category: 'Web Vitals',
        event_label: report.id,
        value: Math.round(report.name === 'CLS' ? report.value * 1000 : report.value),
        custom_map: {
          metric_id: 'dimension1',
          metric_value: 'metric1',
          metric_delta: 'metric2',
        },
      });
    }

    // Send to backend analytics endpoint
    if (process.env.NODE_ENV === 'production') {
      await fetch('/api/analytics/vitals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(report),
      }).catch((error) => {
        console.warn('Failed to send vitals to backend:', error);
      });
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔍 Core Web Vitals - ${report.name}:`, {
        value: report.value,
        rating: report.rating,
        delta: report.delta,
        url: report.url,
      });
    }
  } catch (error) {
    console.warn('Error sending vitals:', error);
  }
}

// Main reporting function
function reportWebVitals(metric: Metric) {
  const report: VitalReport = {
    id: metric.id,
    name: metric.name,
    value: metric.value,
    rating: getRating(metric),
    delta: metric.delta,
    navigationType: metric.navigationType || 'unknown',
    timestamp: Date.now(),
    url: window.location.href,
    userAgent: navigator.userAgent,
  };

  sendToAnalytics(report);
}

// Initialize Core Web Vitals tracking
export function initWebVitals() {
  try {
    onCLS(reportWebVitals);
    onINP(reportWebVitals); // Replaces FID
    onFCP(reportWebVitals);
    onLCP(reportWebVitals);
    onTTFB(reportWebVitals);
  } catch (error) {
    console.warn('Failed to initialize Web Vitals:', error);
  }
}

// Performance observer for additional metrics
export function initPerformanceObserver() {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
    return;
  }

  try {
    // Monitor long tasks (for potential performance issues)
    const longTaskObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.duration > 50) { // Tasks longer than 50ms
          console.warn('Long task detected:', {
            duration: entry.duration,
            startTime: entry.startTime,
            name: entry.name,
          });

          // Send to analytics in production
          if (process.env.NODE_ENV === 'production' && typeof gtag !== 'undefined') {
            gtag('event', 'long_task', {
              event_category: 'Performance',
              event_label: 'Long Task',
              value: Math.round(entry.duration),
            });
          }
        }
      });
    });

    longTaskObserver.observe({ entryTypes: ['longtask'] });

    // Monitor navigation timing
    const navigationObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        const navigationEntry = entry as PerformanceNavigationTiming;

        // Calculate additional metrics
        const metrics = {
          domContentLoaded: navigationEntry.domContentLoadedEventEnd - navigationEntry.navigationStart,
          loadComplete: navigationEntry.loadEventEnd - navigationEntry.navigationStart,
          domainLookup: navigationEntry.domainLookupEnd - navigationEntry.domainLookupStart,
          tcpConnect: navigationEntry.connectEnd - navigationEntry.connectStart,
          serverResponse: navigationEntry.responseEnd - navigationEntry.requestStart,
        };

        // Log in development
        if (process.env.NODE_ENV === 'development') {
          console.log('📊 Navigation Metrics:', metrics);
        }

        // Send critical metrics to analytics
        if (process.env.NODE_ENV === 'production' && typeof gtag !== 'undefined') {
          Object.entries(metrics).forEach(([key, value]) => {
            if (value > 0) {
              gtag('event', key, {
                event_category: 'Navigation Timing',
                value: Math.round(value),
              });
            }
          });
        }
      });
    });

    navigationObserver.observe({ entryTypes: ['navigation'] });

    // Monitor resource loading performance
    const resourceObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        const resourceEntry = entry as PerformanceResourceTiming;

        // Alert on slow resources (> 1s)
        if (resourceEntry.duration > 1000) {
          console.warn('Slow resource detected:', {
            name: resourceEntry.name,
            duration: resourceEntry.duration,
            transferSize: resourceEntry.transferSize,
          });

          if (process.env.NODE_ENV === 'production' && typeof gtag !== 'undefined') {
            gtag('event', 'slow_resource', {
              event_category: 'Performance',
              event_label: resourceEntry.name,
              value: Math.round(resourceEntry.duration),
            });
          }
        }
      });
    });

    resourceObserver.observe({ entryTypes: ['resource'] });

  } catch (error) {
    console.warn('Failed to initialize Performance Observer:', error);
  }
}

// Utility function to measure custom metrics
export function measureCustomMetric(name: string, fn: () => void | Promise<void>) {
  const startTime = performance.now();

  const finish = () => {
    const duration = performance.now() - startTime;

    if (process.env.NODE_ENV === 'development') {
      console.log(`⚡ Custom Metric - ${name}: ${duration.toFixed(2)}ms`);
    }

    if (process.env.NODE_ENV === 'production' && typeof gtag !== 'undefined') {
      gtag('event', 'custom_metric', {
        event_category: 'Performance',
        event_label: name,
        value: Math.round(duration),
      });
    }
  };

  try {
    const result = fn();

    if (result instanceof Promise) {
      return result.finally(finish);
    } else {
      finish();
      return result;
    }
  } catch (error) {
    finish();
    throw error;
  }
}

// Export the main initialization function
export default function setupWebVitals() {
  if (typeof window !== 'undefined') {
    // Initialize immediately
    initWebVitals();

    // Initialize performance observer after load
    if (document.readyState === 'complete') {
      initPerformanceObserver();
    } else {
      window.addEventListener('load', initPerformanceObserver);
    }
  }
}

// Global type declaration for gtag
declare global {
  function gtag(...args: unknown[]): void;
}