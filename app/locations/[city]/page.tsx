import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { LOCATIONS, getLocation } from '../../../lib/locations';
import { localBusinessSchema } from '../../../lib/schema';
import { vehicles } from '../../../lib/vehicles';

const BASE = 'https://kjm-motors.com';

export function generateStaticParams() {
  return LOCATIONS.map((l) => ({ city: l.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ city: string }> }): Promise<Metadata> {
  const { city } = await params;
  const loc = getLocation(city);
  if (!loc) return {};
  return {
    title: `Scooter Rental ${loc.name} — Free Delivery | KJM Motors`,
    description: `Rent a scooter in ${loc.name} from ₱499/day. ${loc.tagline}. ${loc.deliveryNote} Book in 2 minutes.`,
    keywords: [loc.keyword, `scooter rental ${loc.name.toLowerCase()}`, `motorcycle rental ${loc.name.toLowerCase()}`],
    alternates: { canonical: `${BASE}/locations/${loc.slug}` },
    openGraph: {
      title: `Scooter Rental ${loc.name} — Free Delivery | KJM Motors`,
      description: `${loc.tagline}. ${loc.intro.substring(0, 120)}...`,
      url: `${BASE}/locations/${loc.slug}`,
    },
  };
}

const SHARED_FAQS = (locName: string) => [
  {
    q: `Do you deliver scooters to ${locName}?`,
    a: `Yes — free delivery to ${locName} with every booking. No surcharge, no hidden fees.`,
  },
  {
    q: "What documents do I need?",
    a: "A valid driver's license (motorcycle category) or International Driving Permit, plus your passport or valid ID. Security deposit: ₱2,500 cash or leave your passport copy.",
  },
  {
    q: 'What is included in the rental?',
    a: 'Free helmet, phone holder, basic insurance, 24/7 WhatsApp support, free delivery, and a full tank on pickup. No hidden fees.',
  },
  {
    q: 'Can I pay cash on delivery?',
    a: 'Yes. We accept GCash, Maya (PayMaya), and cash on delivery. No credit card needed.',
  },
];

export default async function CityLocationPage({ params }: { params: Promise<{ city: string }> }) {
  const { city } = await params;
  const loc = getLocation(city);
  if (!loc) notFound();

  const faqs = SHARED_FAQS(loc.name);
  const neighborLocations = LOCATIONS.filter((l) => loc.neighbors.includes(l.slug));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            localBusinessSchema({
              name: loc.name,
              slug: loc.slug,
              street: loc.street,
              city: loc.city,
              postalCode: loc.postalCode,
              latitude: loc.latitude,
              longitude: loc.longitude,
              rating: loc.rating,
              reviews: loc.reviews,
              faqs,
            })
          ),
        }}
      />

      <div className="bg-neutral-50 min-h-screen">
        {/* Breadcrumb */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <nav className="flex items-center gap-2 text-sm text-neutral-500">
            <Link href="/" className="hover:text-neutral-700 transition-colors">Home</Link>
            <span>/</span>
            <Link href="/locations" className="hover:text-neutral-700 transition-colors">Locations</Link>
            <span>/</span>
            <span className="text-neutral-900 font-medium">{loc.name}</span>
          </nav>
        </div>

        {/* Hero */}
        <section className="bg-neutral-900 text-white py-14 px-4">
          <div className="max-w-4xl mx-auto">
            <p className="text-primary-400 font-semibold text-sm uppercase tracking-wider mb-3">Cebu Scooter Rental · {loc.name}</p>
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-4 leading-tight">
              Rent a Scooter in {loc.name}<br />
              <span className="text-primary-400">Free Delivery · From ₱499/day</span>
            </h1>
            <p className="text-neutral-300 text-base max-w-2xl mb-8">{loc.intro}</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/booking" className="px-8 py-4 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-xl transition-colors">
                Book Now — Free Delivery to {loc.name}
              </Link>
              <a href="https://wa.me/639752984845" target="_blank" rel="noopener noreferrer" className="px-8 py-4 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-xl transition-colors">
                WhatsApp Us
              </a>
            </div>
          </div>
        </section>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-14">

          {/* Delivery info */}
          <section>
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">Free Delivery in {loc.name}</h2>
            <div className="bg-white border border-neutral-200 rounded-2xl p-6">
              <p className="text-neutral-700 leading-relaxed">{loc.deliveryNote}</p>
              <div className="mt-4 pt-4 border-t border-neutral-100 grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary-600">₱0</p>
                  <p className="text-xs text-neutral-500 mt-1">Delivery fee</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">Free</p>
                  <p className="text-xs text-neutral-500 mt-1">Helmet & holder</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-neutral-900">24/7</p>
                  <p className="text-xs text-neutral-500 mt-1">WhatsApp support</p>
                </div>
              </div>
            </div>
          </section>

          {/* Popular routes */}
          {loc.routes.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-neutral-900 mb-4">Popular Routes from {loc.name}</h2>
              <div className="space-y-3">
                {loc.routes.map((r) => (
                  <div key={r.to} className="flex items-center justify-between bg-white border border-neutral-200 rounded-xl px-5 py-4">
                    <p className="font-medium text-neutral-900 text-sm">{r.from} → {r.to}</p>
                    <span className="text-primary-600 font-bold text-sm">{r.time}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Fleet */}
          <section>
            <h2 className="text-2xl font-bold text-neutral-900 mb-2">Available Scooters</h2>
            <p className="text-neutral-600 text-sm mb-5">All models available for delivery to {loc.name}.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {vehicles.slice(0, loc.type === 'pillar' ? 8 : 4).map((v) => (
                <Link
                  key={v.slug}
                  href={`/scooters/${v.slug}`}
                  className="flex items-center justify-between bg-white border border-neutral-200 hover:border-primary-300 rounded-2xl p-5 transition-colors group"
                >
                  <div>
                    <p className="font-bold text-neutral-900 group-hover:text-primary-600 transition-colors text-sm">{v.brand} {v.model}</p>
                    <p className="text-xs text-neutral-500">{v.engine} · {v.automatic ? 'Automatic' : 'Manual'}</p>
                  </div>
                  <p className="font-bold text-primary-600 text-sm">₱{v.daily.toLocaleString('en-US')}<span className="text-xs text-neutral-400">/day</span></p>
                </Link>
              ))}
            </div>
            {loc.type === 'secondary' && (
              <Link href="/scooters" className="inline-flex items-center text-primary-600 font-semibold hover:text-primary-700 transition-colors mt-4 text-sm">
                View all 8 scooter models →
              </Link>
            )}
          </section>

          {/* Nearby attractions */}
          {loc.attractions.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-neutral-900 mb-4">Nearby Attractions in {loc.name}</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {loc.attractions.map((a) => (
                  <div key={a} className="bg-white border border-neutral-200 rounded-xl px-4 py-3 text-sm font-medium text-neutral-700">
                    {a}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Pricing */}
          <section>
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">Pricing for {loc.name} Rentals</h2>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Daily (1–6 days)', from: 499, to: 900, note: 'Best for short trips' },
                { label: 'Weekly (7–27 days)', from: 2500, to: 5500, note: 'Save up to 25%' },
                { label: 'Monthly (28+ days)', from: 8500, to: 15000, note: 'Best value — save 40%' },
              ].map((p) => (
                <div key={p.label} className="bg-white border border-neutral-200 rounded-2xl p-5 text-center">
                  <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">{p.label}</p>
                  <p className="text-xl font-bold text-neutral-900">₱{p.from.toLocaleString('en-US')}</p>
                  <p className="text-xs text-neutral-500">to ₱{p.to.toLocaleString('en-US')}</p>
                  <p className="text-xs text-primary-600 font-semibold mt-2">{p.note}</p>
                </div>
              ))}
            </div>
          </section>

          {/* FAQ */}
          <section>
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">FAQs — {loc.name} Scooter Rental</h2>
            <div className="space-y-4">
              {faqs.map(({ q, a }) => (
                <div key={q} className="bg-white border border-neutral-200 rounded-2xl p-5">
                  <h3 className="font-bold text-neutral-900 mb-1 text-sm">{q}</h3>
                  <p className="text-neutral-600 text-sm leading-relaxed">{a}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Neighbor links */}
          {neighborLocations.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-neutral-900 mb-3">Also Serving Nearby Areas</h2>
              <div className="flex flex-wrap gap-3">
                {neighborLocations.map((n) => (
                  <Link key={n.slug} href={`/locations/${n.slug}`} className="px-4 py-2 bg-white border border-neutral-200 hover:border-primary-300 text-sm font-medium text-neutral-700 hover:text-primary-600 rounded-xl transition-colors">
                    {n.name} →
                  </Link>
                ))}
                <Link href="/locations" className="px-4 py-2 bg-primary-50 border border-primary-200 text-sm font-semibold text-primary-700 rounded-xl transition-colors hover:bg-primary-100">
                  All 17 locations →
                </Link>
              </div>
            </section>
          )}

          {/* CTA */}
          <section className="bg-neutral-900 text-white rounded-3xl p-10 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">Book Your {loc.name} Scooter</h2>
            <p className="text-neutral-400 mb-6">Free delivery, free helmet, no hidden fees. Book in under 2 minutes.</p>
            <Link href="/booking" className="inline-block px-10 py-4 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-xl transition-colors text-lg">
              Reserve Now — Free Delivery
            </Link>
          </section>
        </div>
      </div>
    </>
  );
}
