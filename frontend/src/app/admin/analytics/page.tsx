"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { fetchWithSession } from "@/lib/fetchWithSession";
import { API_CONFIG } from "@/lib/config";
import AdminGuard from "@/components/auth/AdminGuard";

// Dynamic imports for Chart.js components to reduce initial bundle size
const Line = dynamic(() => import("react-chartjs-2").then(mod => ({ default: mod.Line })), {
  loading: () => <div className="h-80 bg-muted/20 animate-pulse rounded-lg flex items-center justify-center">
    <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full"></div>
  </div>,
  ssr: false
});

const Bar = dynamic(() => import("react-chartjs-2").then(mod => ({ default: mod.Bar })), {
  loading: () => <div className="h-80 bg-muted/20 animate-pulse rounded-lg flex items-center justify-center">
    <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full"></div>
  </div>,
  ssr: false
});

// Dynamically register Chart.js components only when needed
const registerChartComponents = async () => {
  const {
    Chart: ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend
  } = await import("chart.js");

  ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend
  );
};

interface SalesOverview {
  total_revenue: number;
  total_orders: number;
  average_order_value: number;
  period_days: number;
}

interface DailySalesData {
  date: string;
  revenue: number;
  orders: number;
}

interface TopProduct {
  name: string;
  product_id: number;
  quantity?: number;
  revenue?: number;
}

interface BrandPerformance {
  brand_name: string;
  brand_id: number;
  quantity: number;
  revenue: number;
  orders: number;
}

interface CustomerInsights {
  total_customers: number;
  geographic_distribution: Array<{
    country: string;
    orders: number;
  }>;
}

interface FinancialSummary {
  total_revenue: number;
  total_cost: number;
  total_profit: number;
  profit_margin: number;
  revenue_growth: number;
  previous_period_revenue: number;
}

export default function AnalyticsDashboard() {
  const [salesOverview, setSalesOverview] = useState<SalesOverview | null>(null);
  const [dailySales, setDailySales] = useState<DailySalesData[]>([]);
  const [topProducts, setTopProducts] = useState<{by_quantity: TopProduct[], by_revenue: TopProduct[]}>({by_quantity: [], by_revenue: []});
  const [brandPerformance, setBrandPerformance] = useState<BrandPerformance[]>([]);
  const [customerInsights, setCustomerInsights] = useState<CustomerInsights | null>(null);
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    // Register Chart.js components and load data
    registerChartComponents().then(() => {
      loadAnalyticsData();
    });
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(() => {
      loadAnalyticsData(true);
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const loadAnalyticsData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      // Load all analytics data
      const [overviewRes, dailyRes, productsRes, brandsRes, customerRes, financialRes] = await Promise.all([
        fetchWithSession(`${API_CONFIG.BASE_URL}/api/orders/analytics/sales-overview/`),
        fetchWithSession(`${API_CONFIG.BASE_URL}/api/orders/analytics/daily-sales/?days=14`),
        fetchWithSession(`${API_CONFIG.BASE_URL}/api/orders/analytics/top-products/?limit=5`),
        fetchWithSession(`${API_CONFIG.BASE_URL}/api/orders/analytics/brand-performance/`),
        fetchWithSession(`${API_CONFIG.BASE_URL}/api/orders/analytics/customer-insights/`),
        fetchWithSession(`${API_CONFIG.BASE_URL}/api/orders/analytics/financial-summary/`)
      ]);

      if (overviewRes.ok) setSalesOverview(await overviewRes.json());
      if (dailyRes.ok) setDailySales(await dailyRes.json());
      if (productsRes.ok) setTopProducts(await productsRes.json());
      if (brandsRes.ok) setBrandPerformance(await brandsRes.json());
      if (customerRes.ok) setCustomerInsights(await customerRes.json());
      if (financialRes.ok) setFinancialSummary(await financialRes.json());

      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    loadAnalyticsData(true);
  };

  // Chart configurations
  const dailySalesChartData = {
    labels: dailySales.map(d => new Date(d.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Revenue (฿)',
        data: dailySales.map(d => d.revenue),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.3,
      },
    ],
  };

  const topProductsChartData = {
    labels: topProducts.by_revenue.map(p => p.name.length > 20 ? p.name.substring(0, 20) + '...' : p.name),
    datasets: [
      {
        label: 'Revenue (฿)',
        data: topProducts.by_revenue.map(p => p.revenue || 0),
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',
          'rgba(245, 101, 101, 0.8)',
          'rgba(252, 165, 165, 0.8)',
          'rgba(254, 202, 202, 0.8)',
          'rgba(254, 226, 226, 0.8)',
        ],
      },
    ],
  };

  const brandPerformanceChartData = {
    labels: brandPerformance.map(b => b.brand_name),
    datasets: [
      {
        label: 'Revenue (฿)',
        data: brandPerformance.map(b => b.revenue),
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
      },
    ],
  };

  const customerDistributionChartData = {
    labels: customerInsights?.geographic_distribution.slice(0, 5).map(c => c.country) || [],
    datasets: [
      {
        label: 'Orders',
        data: customerInsights?.geographic_distribution.slice(0, 5).map(c => c.orders) || [],
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',
          'rgba(245, 101, 101, 0.8)',
          'rgba(252, 165, 165, 0.8)',
          'rgba(254, 202, 202, 0.8)',
          'rgba(254, 226, 226, 0.8)',
        ],
      },
    ],
  };

  if (loading) {
    return (
      <div className="container section-container">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container section-container">
        <div className="text-center text-red-600">
          <p>Error loading analytics: {error}</p>
          <button 
            onClick={() => loadAnalyticsData()}
            className="btn-primary mt-4"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <AdminGuard>
      <div className="container section-container">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-4xl font-light">Sky High Business Intelligence Dashboard</h1>
          <div className="flex items-center gap-4">
            {lastUpdated && (
              <span className="text-sm text-muted-foreground">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
            <button
              onClick={handleRefresh}
              disabled={refreshing || loading}
              className="btn-primary flex items-center gap-2"
            >
              <div className={`w-4 h-4 border-2 border-white border-t-transparent rounded-full ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>
      
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {salesOverview && (
          <>
            <div className="bg-card p-6 border border-border">
              <h3 className="text-sm font-light text-muted-foreground mb-2">Total Revenue</h3>
              <p className="text-2xl font-light">฿{salesOverview.total_revenue.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-1">Last {salesOverview.period_days} days</p>
            </div>
            
            <div className="bg-card p-6 border border-border">
              <h3 className="text-sm font-light text-muted-foreground mb-2">Total Orders</h3>
              <p className="text-2xl font-light">{salesOverview.total_orders.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-1">Last {salesOverview.period_days} days</p>
            </div>
            
            <div className="bg-card p-6 border border-border">
              <h3 className="text-sm font-light text-muted-foreground mb-2">Average Order Value</h3>
              <p className="text-2xl font-light">฿{salesOverview.average_order_value.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground mt-1">Last {salesOverview.period_days} days</p>
            </div>
          </>
        )}
        
        {customerInsights && (
          <div className="bg-card p-6 border border-border">
            <h3 className="text-sm font-light text-muted-foreground mb-2">Total Customers</h3>
            <p className="text-2xl font-light">{customerInsights.total_customers.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">Active customers</p>
          </div>
        )}
      </div>

      {/* Financial Summary Cards */}
      {financialSummary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-card p-6 border border-border">
            <h3 className="text-sm font-light text-muted-foreground mb-2">Total Profit</h3>
            <p className="text-2xl font-light text-green-600">฿{financialSummary.total_profit.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">{financialSummary.profit_margin.toFixed(1)}% margin</p>
          </div>
          
          <div className="bg-card p-6 border border-border">
            <h3 className="text-sm font-light text-muted-foreground mb-2">Total Cost</h3>
            <p className="text-2xl font-light text-red-600">฿{financialSummary.total_cost.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">Operating costs</p>
          </div>
          
          <div className="bg-card p-6 border border-border">
            <h3 className="text-sm font-light text-muted-foreground mb-2">Revenue Growth</h3>
            <p className={`text-2xl font-light ${financialSummary.revenue_growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {financialSummary.revenue_growth >= 0 ? '+' : ''}{financialSummary.revenue_growth.toFixed(1)}%
            </p>
            <p className="text-xs text-muted-foreground mt-1">vs previous period</p>
          </div>
          
          <div className="bg-card p-6 border border-border">
            <h3 className="text-sm font-light text-muted-foreground mb-2">Previous Revenue</h3>
            <p className="text-2xl font-light">฿{financialSummary.previous_period_revenue.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">Previous period</p>
          </div>
        </div>
      )}

      {/* Daily Sales Chart */}
      {dailySales.length > 0 && (
        <div className="bg-card p-8 border border-border mb-12">
          <h2 className="text-2xl font-light mb-8">Daily Sales (Last 14 Days)</h2>
          <div className="h-80">
            <Line 
              data={dailySalesChartData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top' as const,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                  },
                },
              }}
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Top Products by Revenue */}
        {topProducts.by_revenue.length > 0 && (
          <div className="bg-card p-8 border border-border">
            <h2 className="text-2xl font-light mb-8">Top Products by Revenue</h2>
            <div className="h-80">
              <Bar 
                data={topProductsChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false,
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                    },
                  },
                }}
              />
            </div>
          </div>
        )}

        {/* Brand Performance */}
        {brandPerformance.length > 0 && (
          <div className="bg-card p-8 border border-border">
            <h2 className="text-2xl font-light mb-8">Brand Performance</h2>
            <div className="h-80">
              <Bar 
                data={brandPerformanceChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false,
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                    },
                  },
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Customer Insights Section */}
      {customerInsights && customerInsights.geographic_distribution.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div className="bg-card p-8 border border-border">
            <h2 className="text-2xl font-light mb-8">Customer Geographic Distribution</h2>
            <div className="h-80">
              <Bar 
                data={customerDistributionChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false,
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                    },
                  },
                }}
              />
            </div>
          </div>
          
          <div className="bg-card p-8 border border-border">
            <h2 className="text-2xl font-light mb-8">Geographic Summary</h2>
            <div className="space-y-4">
              {customerInsights.geographic_distribution.slice(0, 8).map((country, index) => (
                <div key={country.country} className="flex justify-between items-center py-2 border-b border-border last:border-b-0">
                  <span className="font-light">{index + 1}. {country.country}</span>
                  <span className="text-muted-foreground">{country.orders} orders</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Top Products List */}
      {topProducts.by_quantity.length > 0 && (
        <div className="bg-card p-8 border border-border mt-12">
          <h2 className="text-2xl font-light mb-8">Top Products by Quantity</h2>
          <div className="space-y-4">
            {topProducts.by_quantity.map((product, index) => (
              <div key={product.product_id} className="flex justify-between items-center py-2 border-b border-border last:border-b-0">
                <span className="font-light">{index + 1}. {product.name}</span>
                <span className="text-muted-foreground">{product.quantity} sold</span>
              </div>
            ))}
          </div>
        </div>
      )}
      </div>
    </AdminGuard>
  );
}