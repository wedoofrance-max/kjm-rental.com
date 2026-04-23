'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export function HeroSearch() {
  const router = useRouter();
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);

  const fmt = (d: Date) => d.toISOString().split('T')[0];

  const [pickup, setPickup] = useState(fmt(tomorrow));
  const [returnDate, setReturnDate] = useState(fmt(nextWeek));
  const [delivery, setDelivery] = useState('hotel');

  const days = Math.max(1, Math.round((new Date(returnDate).getTime() - new Date(pickup).getTime()) / 86400000));

  const handleSearch = () => {
    router.push(`/scooters?pickup=${pickup}&return=${returnDate}&delivery=${delivery}`);
  };

  return (
    <div className="mt-8 bg-white rounded-2xl shadow-2xl shadow-black/30 p-5 max-w-3xl">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        {/* Pickup Date */}
        <div>
          <label className="block text-xs font-semibold text-neutral-500 mb-1.5 uppercase tracking-wide">Pickup Date</label>
          <input
            type="date"
            value={pickup}
            min={fmt(tomorrow)}
            onChange={(e) => setPickup(e.target.value)}
            className="w-full px-3 py-2.5 border border-neutral-200 rounded-xl text-neutral-900 text-sm font-semibold focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-500/15"
          />
        </div>

        {/* Return Date */}
        <div>
          <label className="block text-xs font-semibold text-neutral-500 mb-1.5 uppercase tracking-wide">Return Date</label>
          <input
            type="date"
            value={returnDate}
            min={pickup}
            onChange={(e) => setReturnDate(e.target.value)}
            className="w-full px-3 py-2.5 border border-neutral-200 rounded-xl text-neutral-900 text-sm font-semibold focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-500/15"
          />
        </div>

        {/* Delivery */}
        <div>
          <label className="block text-xs font-semibold text-neutral-500 mb-1.5 uppercase tracking-wide">Delivery</label>
          <select
            value={delivery}
            onChange={(e) => setDelivery(e.target.value)}
            className="w-full px-3 py-2.5 border border-neutral-200 rounded-xl text-neutral-900 text-sm font-semibold focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-500/15 bg-white"
          >
            <option value="hotel">Hotel Delivery (Free)</option>
            <option value="airport">Airport Pickup (Free)</option>
            <option value="store">Pick up at Store</option>
          </select>
        </div>
      </div>

      {/* Search Button + Duration */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleSearch}
          className="flex-1 sm:flex-none px-6 py-3 bg-neutral-900 text-white text-sm font-bold rounded-xl hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2"
        >
          Search Scooters
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
        <span className="text-sm text-neutral-500 font-medium" suppressHydrationWarning>
          {days} {days === 1 ? 'day' : 'days'} · <span className="text-neutral-700 font-semibold">from ₱{(499 * days).toLocaleString('en-US')}</span>
        </span>
      </div>

    </div>
  );
}
