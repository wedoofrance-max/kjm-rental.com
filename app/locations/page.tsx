import type { Metadata } from 'next';
import Link from 'next/link';
import { LOCATIONS } from '../../lib/locations';

const BASE = 'https://kjm-motors.com';

export const metadata: Metadata = {
  title: 'Scooter Rental Locations Across Cebu | KJM Motors',
  description: 'KJM Motors delivers scooters free to 17 locations across Cebu: Lapu-Lapu, Cebu City, IT Park, Mactan Airport, Mandaue, Talisay, and more. From ₱499/day.',
  keywords: ['scooter rental cebu locations', 'scooter delivery cebu', 'rent scooter near me cebu'],
  alternates: { canonical: `${BASE}/locations` },
  openGraph: {
    title: 'Scooter Rental Across 17 Cebu Locations | KJM Motors',
    description: 'Free delivery to 17 locations across Metro Cebu. Lapu-Lapu, Cebu City, Mandaue, IT Park, Mactan Airport and more.',
    url: `${BASE}/locations`,
  },
};

const pillar = LOCATIONS.filter((l) => l.type === 'pillar');
const secondary = LOCATIONS.filter((l) => l.type === 'secondary');

export default function LocationsPage() {
  return (
    <div className="bg-neutral-50 min-h-screen">
      {/* Hero */}
      <section className="bg-neutral-900 text-white py-14 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-primary-400 font-semibold text-sm uppercase tracking-wider mb-3">Free Delivery</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-4">We Deliver to 17 Locations Across Cebu</h1>
          <p className="text-neutral-300 max-w-xl mx-auto">
            No matter where you&apos;re staying — Mactan Airport, Cebu City, IT Park, a beach resort, or a residential area — we bring your scooter to you. Free.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">

        {/* Pillar locations */}
        <h2 className="text-xl font-bold text-neutral-900 mb-4">Main Service Areas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
          {pillar.map((loc) => (
            <Link
              key={loc.slug}
              href={`/locations/${loc.slug}`}
              className="bg-white border border-neutral-200 hover:border-primary-300 rounded-2xl p-6 transition-colors group"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-bold text-neutral-900 group-hover:text-primary-600 transition-colors">{loc.name}</h3>
                <span className="text-xs bg-primary-50 text-primary-600 font-semibold px-2 py-0.5 rounded-full">Primary area</span>
              </div>
              <p className="text-sm text-neutral-600 mb-3">{loc.tagline}</p>
              <p className="text-xs text-neutral-500">{loc.deliveryNote}</p>
              <p className="text-primary-600 text-sm font-semibold mt-3">View details →</p>
            </Link>
          ))}
        </div>

        {/* Secondary locations */}
        <h2 className="text-xl font-bold text-neutral-900 mb-4">All Delivery Zones</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-12">
          {secondary.map((loc) => (
            <Link
              key={loc.slug}
              href={`/locations/${loc.slug}`}
              className="bg-white border border-neutral-200 hover:border-primary-300 rounded-xl p-4 transition-colors group"
            >
              <p className="font-semibold text-neutral-900 group-hover:text-primary-600 transition-colors text-sm">{loc.name}</p>
              <p className="text-xs text-neutral-500 mt-0.5">{loc.deliveryNote.split(' in ')[0]}</p>
            </Link>
          ))}
        </div>

        {/* Special pages */}
        <div className="bg-neutral-900 text-white rounded-2xl p-8">
          <h2 className="font-bold text-xl mb-4">Quick Links</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { title: 'Rent in Cebu (overview)', href: '/rent-scooter-cebu', note: 'All areas, all models' },
              { title: 'Rent in Lapu-Lapu', href: '/rent-scooter-lapu-lapu', note: 'Fastest delivery — our hub' },
              { title: 'Mactan Airport Pickup', href: '/rent-scooter-mactan-airport', note: 'We meet you at arrivals' },
            ].map((l) => (
              <Link key={l.href} href={l.href} className="bg-neutral-800 hover:bg-neutral-700 rounded-xl p-4 transition-colors">
                <p className="font-semibold text-sm">{l.title}</p>
                <p className="text-neutral-400 text-xs mt-0.5">{l.note}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
