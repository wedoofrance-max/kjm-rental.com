'use client';

import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Icon } from '../ui/Icon';

interface ContentData {
  vehicleId: string;
  title: string;
  description: string;
  views: number;
  uniqueSessions: number;
  detailViews: number;
  listingViews: number;
  bounceRate: number;
  lastViewed: string;
  conversionRate: number;
  avgViewsPerSession: number;
}

interface Summary {
  totalViews: number;
  totalUniqueSessions: number;
  totalDetailViews: number;
  totalListingViews: number;
  topContent: string;
  avgViewsPerSession: number;
  engagementRate: number;
}

export default function ContentAnalytics({ isDark }: { isDark: boolean }) {
  const [timeRange, setTimeRange] = useState('7d');
  const [data, setData] = useState<ContentData[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContentAnalytics();
  }, [timeRange]);

  const fetchContentAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/content-analytics?timeRange=${timeRange}`);
      const result = await res.json();
      setData(result.data || []);
      setSummary(result.summary);
    } catch (error) {
      console.error('Error fetching content analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`rounded-lg p-6 ${isDark ? 'bg-neutral-800' : 'bg-neutral-50'}`}>
        <p className={isDark ? 'text-neutral-500' : 'text-neutral-600'}>Loading content analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Time Range */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {/* @ts-ignore */}
            <Icon icon="ph:article-bold" width={24} height={24} className="text-primary-500" />
            <h4 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-neutral-900'}`}>
              Content Analytics
            </h4>
          </div>
          <p className={`text-sm mt-1 ${isDark ? 'text-neutral-500' : 'text-neutral-600'}`}>
            Which scooter guides and pages people are reading
          </p>
        </div>
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
      </div>

      {/* Summary KPIs */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className={`rounded-lg p-4 ${isDark ? 'bg-neutral-800' : 'bg-neutral-50'}`}>
            <p className={`text-xs ${isDark ? 'text-neutral-400' : 'text-neutral-600'} mb-1`}>
              Total Page Views
            </p>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-neutral-900'}`}>
              {summary.totalViews.toLocaleString()}
            </p>
          </div>
          <div className={`rounded-lg p-4 ${isDark ? 'bg-neutral-800' : 'bg-neutral-50'}`}>
            <p className={`text-xs ${isDark ? 'text-neutral-400' : 'text-neutral-600'} mb-1`}>
              Unique Visitors
            </p>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-neutral-900'}`}>
              {summary.totalUniqueSessions.toLocaleString()}
            </p>
          </div>
          <div className={`rounded-lg p-4 ${isDark ? 'bg-neutral-800' : 'bg-neutral-50'}`}>
            <p className={`text-xs ${isDark ? 'text-neutral-400' : 'text-neutral-600'} mb-1`}>
              Engagement Rate
            </p>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-neutral-900'}`}>
              {summary.engagementRate}%
            </p>
            <p className={`text-xs mt-1 ${isDark ? 'text-neutral-500' : 'text-neutral-600'}`}>
              Clicked to details
            </p>
          </div>
          <div className={`rounded-lg p-4 ${isDark ? 'bg-neutral-800' : 'bg-neutral-50'}`}>
            <p className={`text-xs ${isDark ? 'text-neutral-400' : 'text-neutral-600'} mb-1`}>
              Avg Views/Session
            </p>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-neutral-900'}`}>
              {summary.avgViewsPerSession.toFixed(1)}
            </p>
          </div>
        </div>
      )}

      {/* Content Performance Table */}
      <div className={`rounded-lg p-4 ${isDark ? 'bg-neutral-800' : 'bg-neutral-50'}`}>
        <h5 className={`font-bold mb-4 ${isDark ? 'text-white' : 'text-neutral-900'}`}>
          Content Performance
        </h5>
        {data.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={`border-b ${isDark ? 'border-neutral-700' : 'border-neutral-200'}`}>
                  <th className={`text-left px-3 py-2 font-bold ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>
                    Content Title
                  </th>
                  <th className={`text-left px-3 py-2 font-bold ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>
                    Views
                  </th>
                  <th className={`text-left px-3 py-2 font-bold ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>
                    Unique
                  </th>
                  <th className={`text-left px-3 py-2 font-bold ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>
                    Bounce %
                  </th>
                  <th className={`text-left px-3 py-2 font-bold ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>
                    Conversion
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-neutral-700' : 'divide-neutral-200'}`}>
                {data.map((content) => (
                  <tr key={content.vehicleId} className={`hover:${isDark ? 'bg-neutral-700' : 'bg-neutral-100'} transition-colors`}>
                    <td className="px-3 py-3">
                      <p className={`font-semibold ${isDark ? 'text-white' : 'text-neutral-900'}`}>
                        {content.title}
                      </p>
                      <p className={`text-xs ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>
                        {content.description}
                      </p>
                    </td>
                    <td className={`px-3 py-3 ${isDark ? 'text-white' : 'text-neutral-900'}`}>
                      {content.views.toLocaleString()}
                    </td>
                    <td className={`px-3 py-3 ${isDark ? 'text-white' : 'text-neutral-900'}`}>
                      {content.uniqueSessions}
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-bold ${
                          content.bounceRate > 70
                            ? isDark
                              ? 'bg-red-900/30 text-red-300'
                              : 'bg-red-100 text-red-700'
                            : content.bounceRate > 50
                            ? isDark
                              ? 'bg-yellow-900/30 text-yellow-300'
                              : 'bg-yellow-100 text-yellow-700'
                            : isDark
                            ? 'bg-green-900/30 text-green-300'
                            : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {content.bounceRate}%
                      </span>
                    </td>
                    <td className={`px-3 py-3 font-bold ${isDark ? 'text-primary-400' : 'text-primary-600'}`}>
                      {content.conversionRate}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className={`text-center py-8 ${isDark ? 'text-neutral-500' : 'text-neutral-600'}`}>
            No content views in this period
          </p>
        )}
      </div>

      {/* Tips for optimization */}
      <div className={`rounded-lg p-4 ${isDark ? 'bg-blue-900/20' : 'bg-blue-100'} border ${isDark ? 'border-blue-800' : 'border-blue-200'}`}>
        <p className={`font-bold mb-2 ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
          💡 Content Optimization Tips
        </p>
        <ul className={`text-sm space-y-1 ${isDark ? 'text-blue-200' : 'text-blue-600'}`}>
          <li>• High bounce rate? Improve clarity in scooter descriptions and add more images</li>
          <li>• Low conversion? Add stronger "Rent Now" CTAs and customer testimonials</li>
          <li>• Most popular content? Feature it more prominently on homepage</li>
          <li>• Track trends: Which vehicles get most clicks? Focus marketing on those</li>
        </ul>
      </div>
    </div>
  );
}
