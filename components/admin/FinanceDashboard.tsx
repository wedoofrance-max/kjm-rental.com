'use client';

import { useEffect, useState } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Icon } from '../ui/Icon';

interface RevenueData {
  date: string;
  totalRevenue: number;
  depositCollected: number;
  finalPayments: number;
  bookingCount: number;
}

interface BookingData {
  date: string;
  pending: number;
  confirmed: number;
  active: number;
  returned: number;
  cancelled: number;
  total: number;
}

interface PaymentData {
  method: string;
  count: number;
  total: number;
  percentage: number;
}

interface VehicleData {
  vehicleId: string;
  name: string;
  count: number;
  revenue: number;
  averageBookingValue: number;
}

export default function FinanceDashboard({ isDark }: { isDark: boolean }) {
  const [timeRange, setTimeRange] = useState('7d');
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [revenueSummary, setRevenueSummary] = useState<any>(null);
  const [bookingData, setBookingData] = useState<BookingData[]>([]);
  const [bookingSummary, setBookingSummary] = useState<any>(null);
  const [paymentData, setPaymentData] = useState<PaymentData[]>([]);
  const [vehicleData, setVehicleData] = useState<VehicleData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [revenueRes, bookingRes, paymentRes, vehicleRes] = await Promise.all([
        fetch(`/api/admin/analytics/revenue?timeRange=${timeRange}`),
        fetch(`/api/admin/analytics/bookings?timeRange=${timeRange}`),
        fetch(`/api/admin/analytics/payment-methods?timeRange=${timeRange}`),
        fetch(`/api/admin/analytics/vehicle-revenue?timeRange=${timeRange}&limit=5`),
      ]);

      const revenue = await revenueRes.json();
      const bookings = await bookingRes.json();
      const payments = await paymentRes.json();
      const vehicles = await vehicleRes.json();

      setRevenueData(revenue.data || []);
      setRevenueSummary(revenue.summary);
      setBookingData(bookings.data || []);
      setBookingSummary(bookings.summary);
      setPaymentData(payments.data || []);
      setVehicleData(vehicles.data || []);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className={`text-center py-8 ${isDark ? 'text-neutral-500' : 'text-neutral-600'}`}>Loading analytics...</div>;
  }

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  const formatCurrency = (value: number) => `₱${(value / 1000).toFixed(0)}K`;
  const formatPercent = (value: number) => `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          {/* @ts-ignore */}
          <Icon icon="ph:chart-bar-bold" width={24} height={24} className="text-primary-500" />
          <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-neutral-900'}`}>
            Finance Dashboard
          </h3>
        </div>
        <p className={`text-sm mt-1 ${isDark ? 'text-neutral-500' : 'text-neutral-600'}`}>
          Real-time financial overview and analytics
        </p>
      </div>

      {/* Time Range Selector */}
      <div className="flex gap-2">
        {['24h', '7d', '30d'].map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`px-4 py-2 rounded-lg font-bold transition-colors ${
              timeRange === range
                ? isDark
                  ? 'bg-primary-600 text-white'
                  : 'bg-primary-500 text-white'
                : isDark
                ? 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
                : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300'
            }`}
          >
            {range === '24h' ? 'Last 24h' : range === '7d' ? 'Last 7 days' : 'Last 30 days'}
          </button>
        ))}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`rounded-lg p-4 ${isDark ? 'bg-neutral-800' : 'bg-neutral-50'}`}>
          <p className={`text-xs ${isDark ? 'text-neutral-400' : 'text-neutral-600'} mb-1`}>
            Total Revenue
          </p>
          <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-neutral-900'}`}>
            ₱{revenueSummary?.totalRevenue.toLocaleString() || 0}
          </p>
          {revenueSummary?.comparison && (
            <p
              className={`text-xs mt-2 font-bold ${
                revenueSummary.comparison.direction === 'up' ? 'text-green-500' : 'text-red-500'
              }`}
            >
              {formatPercent(revenueSummary.comparison.percentage)}
            </p>
          )}
        </div>

        <div className={`rounded-lg p-4 ${isDark ? 'bg-neutral-800' : 'bg-neutral-50'}`}>
          <p className={`text-xs ${isDark ? 'text-neutral-400' : 'text-neutral-600'} mb-1`}>
            Total Bookings
          </p>
          <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-neutral-900'}`}>
            {bookingSummary?.totalBookings || 0}
          </p>
          <p className={`text-xs mt-2 ${isDark ? 'text-neutral-500' : 'text-neutral-600'}`}>
            Conversion: {bookingSummary?.conversionRate || 0}%
          </p>
        </div>

        <div className={`rounded-lg p-4 ${isDark ? 'bg-neutral-800' : 'bg-neutral-50'}`}>
          <p className={`text-xs ${isDark ? 'text-neutral-400' : 'text-neutral-600'} mb-1`}>
            Avg. Booking Value
          </p>
          <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-neutral-900'}`}>
            ₱{revenueSummary?.totalRevenue && bookingSummary?.totalBookings
              ? Math.round(revenueSummary.totalRevenue / bookingSummary.totalBookings).toLocaleString()
              : 0}
          </p>
        </div>

        <div className={`rounded-lg p-4 ${isDark ? 'bg-neutral-800' : 'bg-neutral-50'}`}>
          <p className={`text-xs ${isDark ? 'text-neutral-400' : 'text-neutral-600'} mb-1`}>
            Deposit Collected
          </p>
          <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-neutral-900'}`}>
            ₱{revenueSummary?.depositCollected.toLocaleString() || 0}
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className={`rounded-lg p-4 ${isDark ? 'bg-neutral-800' : 'bg-neutral-50'}`}>
          <h4 className={`font-bold mb-4 ${isDark ? 'text-white' : 'text-neutral-900'}`}>
            Revenue Trend
          </h4>
          {revenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#4b5563' : '#e5e7eb'} />
                <XAxis
                  dataKey="date"
                  tick={{ fill: isDark ? '#9ca3af' : '#6b7280', fontSize: 12 }}
                  stroke={isDark ? '#4b5563' : '#e5e7eb'}
                />
                <YAxis
                  tickFormatter={(value) => formatCurrency(value)}
                  tick={{ fill: isDark ? '#9ca3af' : '#6b7280', fontSize: 12 }}
                  stroke={isDark ? '#4b5563' : '#e5e7eb'}
                />
                <Tooltip
                  formatter={(value) => [`₱${(value as number).toLocaleString()}`, 'Revenue']}
                  contentStyle={{
                    backgroundColor: isDark ? '#374151' : '#fff',
                    border: `1px solid ${isDark ? '#4b5563' : '#e5e7eb'}`,
                    borderRadius: '8px',
                    color: isDark ? '#fff' : '#000',
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="totalRevenue" stroke="#3b82f6" strokeWidth={2} name="Revenue" />
                <Line type="monotone" dataKey="depositCollected" stroke="#10b981" strokeWidth={2} name="Deposits" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className={`text-center py-8 ${isDark ? 'text-neutral-500' : 'text-neutral-600'}`}>
              No data available
            </p>
          )}
        </div>

        {/* Booking Status Chart */}
        <div className={`rounded-lg p-4 ${isDark ? 'bg-neutral-800' : 'bg-neutral-50'}`}>
          <h4 className={`font-bold mb-4 ${isDark ? 'text-white' : 'text-neutral-900'}`}>
            Booking Status Breakdown
          </h4>
          {bookingData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={bookingData}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#4b5563' : '#e5e7eb'} />
                <XAxis
                  dataKey="date"
                  tick={{ fill: isDark ? '#9ca3af' : '#6b7280', fontSize: 12 }}
                  stroke={isDark ? '#4b5563' : '#e5e7eb'}
                />
                <YAxis
                  tick={{ fill: isDark ? '#9ca3af' : '#6b7280', fontSize: 12 }}
                  stroke={isDark ? '#4b5563' : '#e5e7eb'}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#374151' : '#fff',
                    border: `1px solid ${isDark ? '#4b5563' : '#e5e7eb'}`,
                    borderRadius: '8px',
                    color: isDark ? '#fff' : '#000',
                  }}
                />
                <Legend />
                <Bar dataKey="pending" fill="#f59e0b" name="Pending" stackId="a" />
                <Bar dataKey="confirmed" fill="#10b981" name="Confirmed" stackId="a" />
                <Bar dataKey="active" fill="#3b82f6" name="Active" stackId="a" />
                <Bar dataKey="cancelled" fill="#ef4444" name="Cancelled" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className={`text-center py-8 ${isDark ? 'text-neutral-500' : 'text-neutral-600'}`}>
              No data available
            </p>
          )}
        </div>

        {/* Payment Methods */}
        <div className={`rounded-lg p-4 ${isDark ? 'bg-neutral-800' : 'bg-neutral-50'}`}>
          <h4 className={`font-bold mb-4 ${isDark ? 'text-white' : 'text-neutral-900'}`}>
            Payment Methods
          </h4>
          {paymentData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={paymentData}
                  dataKey="total"
                  nameKey="method"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={(entry) => {
                    const data = entry as any;
                    return `${data.method} (${data.percentage}%)`;
                  }}
                >
                  {paymentData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `₱${(value as number).toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className={`text-center py-8 ${isDark ? 'text-neutral-500' : 'text-neutral-600'}`}>
              No data available
            </p>
          )}
        </div>

        {/* Top Vehicles */}
        <div className={`rounded-lg p-4 ${isDark ? 'bg-neutral-800' : 'bg-neutral-50'}`}>
          <h4 className={`font-bold mb-4 ${isDark ? 'text-white' : 'text-neutral-900'}`}>
            Top Vehicles
          </h4>
          {vehicleData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={vehicleData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 200 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#4b5563' : '#e5e7eb'} />
                <XAxis type="number" tick={{ fill: isDark ? '#9ca3af' : '#6b7280', fontSize: 12 }} />
                <YAxis
                  dataKey="name"
                  type="category"
                  tick={{ fill: isDark ? '#9ca3af' : '#6b7280', fontSize: 12 }}
                  width={180}
                />
                <Tooltip formatter={(value) => `₱${(value as number).toLocaleString()}`} />
                <Bar dataKey="revenue" fill="#3b82f6" name="Revenue" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className={`text-center py-8 ${isDark ? 'text-neutral-500' : 'text-neutral-600'}`}>
              No data available
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
