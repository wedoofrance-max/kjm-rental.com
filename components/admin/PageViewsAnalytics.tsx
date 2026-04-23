'use client';

import { useEffect, useState } from 'react';
import { Icon } from '../ui/Icon';

interface ChartData {
  date: string;
  listing: number;
  detail: number;
  total: number;
}

interface AnalyticsData {
  success: boolean;
  timeRange: string;
  summary: {
    totalViews: number;
    listingViews: number;
    detailViews: number;
    dailyAverage: number;
  };
  chartData: ChartData[];
  topVehicles: Array<{ vehicleId: string; viewCount: number }>;
}

export default function PageViewsAnalytics({
  isDark,
}: {
  isDark: boolean;
}) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('7d');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/analytics/page-views?timeRange=${timeRange}`);
      if (res.ok) {
        const analyticsData = await res.json();
        setData(analyticsData);
      }
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <div className={`${isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200'} border rounded-2xl p-6`}>
        <p className={`text-sm ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>Loading analytics...</p>
      </div>
    );
  }

  const maxTotal = Math.max(...data.chartData.map((d) => d.total), 1);

  return (
    <div className={`${isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200'} border rounded-2xl p-6 space-y-6`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-neutral-900'}`}>
            📊 Page View Analytics
          </h3>
          <p className={`text-xs mt-1 ${isDark ? 'text-neutral-500' : 'text-neutral-600'}`}>
            Real-time tracking of scooter page views and engagement
          </p>
        </div>
        <div className="flex gap-2">
          {['24h', '7d', '30d'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                timeRange === range
                  ? 'bg-primary-500 text-white'
                  : isDark
                  ? 'bg-neutral-800 text-neutral-400 hover:text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:text-neutral-900'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Views', value: data.summary.totalViews, color: 'text-primary-400' },
          { label: 'Listing Views', value: data.summary.listingViews, color: 'text-blue-400' },
          { label: 'Detail Views', value: data.summary.detailViews, color: 'text-green-400' },
          { label: 'Avg/Day', value: data.summary.dailyAverage, color: 'text-orange-400' },
        ].map((stat) => (
          <div
            key={stat.label}
            className={`rounded-lg p-3 ${isDark ? 'bg-neutral-800/50' : 'bg-neutral-50'}`}
          >
            <p className={`text-xs ${isDark ? 'text-neutral-500' : 'text-neutral-600'} mb-1`}>
              {stat.label}
            </p>
            <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="space-y-3">
        <p className={`text-xs font-semibold ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>
          Daily Views
        </p>
        <div className="space-y-1">
          {data.chartData.map((day) => (
            <div key={day.date} className="flex items-center gap-2">
              <span className={`text-xs min-w-16 ${isDark ? 'text-neutral-500' : 'text-neutral-600'}`}>
                {new Date(day.date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
              <div className="flex-1 h-8 bg-neutral-800/30 rounded flex items-center relative overflow-hidden">
                {/* Detail views */}
                <div
                  className="h-full bg-gradient-to-r from-green-600 to-green-500 transition-all"
                  style={{
                    width: `${(day.detail / maxTotal) * 100}%`,
                  }}
                  title={`Detail: ${day.detail}`}
                />
                {/* Listing views */}
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-blue-500 transition-all"
                  style={{
                    width: `${(day.listing / maxTotal) * 100}%`,
                  }}
                  title={`Listing: ${day.listing}`}
                />
                <span className={`ml-2 text-xs font-bold ${isDark ? 'text-white' : 'text-neutral-900'}`}>
                  {day.total}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-green-500" />
          <span className={isDark ? 'text-neutral-400' : 'text-neutral-600'}>Detail Page</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-blue-500" />
          <span className={isDark ? 'text-neutral-400' : 'text-neutral-600'}>Listing Page</span>
        </div>
      </div>

      {/* Refresh button */}
      <button
        onClick={fetchAnalytics}
        className={`w-full py-2 rounded-lg text-xs font-semibold transition-colors ${
          isDark
            ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300'
            : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
        }`}
      >
        🔄 Refresh
      </button>
    </div>
  );
}
