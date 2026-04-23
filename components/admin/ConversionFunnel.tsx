'use client';

import { useState, useEffect } from 'react';
import { Icon } from '../ui/Icon';

interface FunnelData {
  views: number;
  started: number;
  confirmed: number;
}

export default function ConversionFunnel({
  isDark,
}: {
  isDark: boolean;
}) {
  const [funnelData, setFunnelData] = useState<FunnelData>({
    views: 0,
    started: 0,
    confirmed: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFunnelData();
  }, []);

  const fetchFunnelData = async () => {
    setLoading(true);
    try {
      // Fetch page views
      const viewsRes = await fetch('/api/admin/page-views?timeRange=30d');
      const viewsData = await viewsRes.json();
      const totalViews = viewsData.totalViews || 0;

      // Fetch bookings
      const bookingsRes = await fetch('/api/admin/bookings');
      const bookings = await bookingsRes.json();

      const totalBookings = bookings.length;
      const confirmedBookings = bookings.filter(
        (b: any) => b.status === 'confirmed' || b.status === 'active' || b.status === 'returned'
      ).length;

      setFunnelData({
        views: totalViews,
        started: totalBookings,
        confirmed: confirmedBookings,
      });
    } catch (error) {
      console.error('Error fetching funnel data:', error);
    } finally {
      setLoading(false);
    }
  };

  const maxValue = Math.max(funnelData.views, funnelData.started, funnelData.confirmed);

  const conversionStarted = funnelData.views > 0
    ? Math.round((funnelData.started / funnelData.views) * 100)
    : 0;

  const conversionConfirmed = funnelData.started > 0
    ? Math.round((funnelData.confirmed / funnelData.started) * 100)
    : 0;

  const stages = [
    {
      name: 'Website Views',
      value: funnelData.views,
      description: 'People viewing scooters',
      color: '#3b82f6',
      bgColor: isDark ? 'bg-blue-900/20' : 'bg-blue-100',
    },
    {
      name: 'Booking Started',
      value: funnelData.started,
      description: `${conversionStarted}% conversion`,
      color: '#10b981',
      bgColor: isDark ? 'bg-green-900/20' : 'bg-green-100',
    },
    {
      name: 'Confirmed',
      value: funnelData.confirmed,
      description: `${conversionConfirmed}% of started`,
      color: '#f59e0b',
      bgColor: isDark ? 'bg-amber-900/20' : 'bg-amber-100',
    },
  ];

  if (loading) {
    return (
      <div className={`rounded-lg p-6 ${isDark ? 'bg-neutral-800' : 'bg-neutral-50'}`}>
        <h4 className={`font-bold text-lg mb-4 ${isDark ? 'text-white' : 'text-neutral-900'}`}>
          🔀 Conversion Funnel
        </h4>
        <p className={isDark ? 'text-neutral-500' : 'text-neutral-600'}>Loading...</p>
      </div>
    );
  }

  return (
    <div className={`rounded-lg p-6 ${isDark ? 'bg-neutral-800' : 'bg-neutral-50'}`}>
      <div className="flex items-center gap-2 mb-6">
        {/* @ts-ignore */}
        <Icon icon="ph:funnel-bold" width={24} height={24} className="text-primary-500" />
        <h4 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-neutral-900'}`}>
          Conversion Funnel (Last 30 days)
        </h4>
      </div>

      <div className="space-y-6">
        {stages.map((stage, idx) => {
          const width = maxValue > 0 ? (stage.value / maxValue) * 100 : 0;

          return (
            <div key={stage.name} className="space-y-2">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className={`font-bold text-sm ${isDark ? 'text-white' : 'text-neutral-900'}`}>
                    {idx + 1}. {stage.name}
                  </p>
                  <p className={`text-xs ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>
                    {stage.description}
                  </p>
                </div>
                <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-neutral-900'}`}>
                  {stage.value.toLocaleString()}
                </p>
              </div>

              {/* Bar */}
              <div
                className={`h-8 rounded-lg ${stage.bgColor} overflow-hidden relative`}
                style={{ width: '100%' }}
              >
                <div
                  className="h-full rounded-lg transition-all duration-500"
                  style={{
                    width: `${width}%`,
                    backgroundColor: stage.color,
                    opacity: 0.8,
                  }}
                />
              </div>

              {/* Conversion arrow */}
              {idx < stages.length - 1 && (
                <div className="flex justify-center py-1">
                  <span className={`text-xl ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`}>
                    ↓
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary stats */}
      <div className={`mt-6 pt-6 border-t ${isDark ? 'border-neutral-700' : 'border-neutral-200'}`}>
        <p className={`text-xs font-bold uppercase mb-3 ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>
          Overall Metrics
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className={`text-2xl font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
              {conversionStarted}%
            </p>
            <p className={`text-xs ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>
              Views → Started
            </p>
          </div>
          <div>
            <p className={`text-2xl font-bold ${isDark ? 'text-green-400' : 'text-green-600'}`}>
              {conversionConfirmed}%
            </p>
            <p className={`text-xs ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>
              Started → Confirmed
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
