'use client';

import { useEffect, useState } from 'react';
import { Icon } from '../ui/Icon';

interface KPIData {
  bookingsToday: number;
  revenueToday: number;
  activeRentals: number;
  pendingSignings: number;
}

export default function RealTimeKPI({
  bookings,
  isDark,
}: {
  bookings: Array<{
    createdAt: string;
    status: string;
    totalPrice?: number;
    finalPrice?: number;
  }>;
  isDark: boolean;
}) {
  const [kpiData, setKpiData] = useState<KPIData>({
    bookingsToday: 0,
    revenueToday: 0,
    activeRentals: 0,
    pendingSignings: 0,
  });

  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let bookingsToday = 0;
    let revenueToday = 0;
    let activeRentals = 0;
    let pendingSignings = 0;

    bookings.forEach((booking) => {
      const createdDate = new Date(booking.createdAt);
      createdDate.setHours(0, 0, 0, 0);

      // Bookings created today
      if (createdDate.getTime() === today.getTime()) {
        bookingsToday += 1;
        const price = booking.finalPrice ?? booking.totalPrice ?? 0;
        revenueToday += price;
      }

      // Active rentals (status === 'active')
      if (booking.status === 'active') {
        activeRentals += 1;
      }

      // Pending signings (status === 'pending')
      if (booking.status === 'pending') {
        pendingSignings += 1;
      }
    });

    setKpiData({
      bookingsToday,
      revenueToday,
      activeRentals,
      pendingSignings,
    });
  }, [bookings]);

  const kpis = [
    {
      label: 'Bookings Today',
      value: kpiData.bookingsToday,
      icon: 'ph:clipboard-bold',
      color: 'text-blue-400',
      bgColor: isDark ? 'bg-blue-900/20' : 'bg-blue-100',
    },
    {
      label: 'Revenue Today',
      value: `₱${kpiData.revenueToday.toLocaleString()}`,
      icon: 'ph:currency-php-bold',
      color: 'text-green-400',
      bgColor: isDark ? 'bg-green-900/20' : 'bg-green-100',
    },
    {
      label: 'Active Rentals',
      value: kpiData.activeRentals,
      icon: 'ph:car-bold',
      color: 'text-purple-400',
      bgColor: isDark ? 'bg-purple-900/20' : 'bg-purple-100',
    },
    {
      label: 'Pending Signings',
      value: kpiData.pendingSignings,
      icon: 'ph:hourglass-bold',
      color: 'text-orange-400',
      bgColor: isDark ? 'bg-orange-900/20' : 'bg-orange-100',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi) => (
        <div
          key={kpi.label}
          className={`rounded-lg p-4 ${isDark ? 'bg-neutral-800' : 'bg-neutral-50'}`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p
                className={`text-xs font-bold uppercase tracking-wider mb-1 ${
                  isDark ? 'text-neutral-400' : 'text-neutral-600'
                }`}
              >
                {kpi.label}
              </p>
              <p
                className={`text-2xl font-bold ${
                  isDark ? 'text-white' : 'text-neutral-900'
                }`}
              >
                {kpi.value}
              </p>
            </div>
            <div
              className={`text-3xl p-3 rounded-lg ${kpi.bgColor}`}
            >
              {/* @ts-ignore */}
              <Icon icon={kpi.icon} width={28} height={28} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
