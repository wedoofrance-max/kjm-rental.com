import type { Metadata } from 'next';
import Link from 'next/link';
import { vehicles } from '../../lib/vehicles';
import { serviceSchema } from '../../lib/schema';

const BASE = 'https://kjm-motors.com';

export const metadata: Metadata = {
  title: 'Rent a Scooter in Lapu-Lapu City from ₱499/day | KJM Motors',
  description: 'Rent a scooter in Lapu-Lapu City with free delivery anywhere in the city. Our main base is here — fastest delivery, biggest selection. From ₱499/day.',
  keywords: ['rent scooter lapu-lapu', 'scooter rental lapu-lapu', 'motorcycle rental lapu-lapu', 'lapu-lapu scooter hire'],
  alternates: { canonical: `${BASE}/rent-scooter-lapu-lapu` },
  openGraph: {
    title: 'Rent a Scooter in Lapu-Lapu City from ₱499/day',
    description: 'Our main hub is in Lapu-Lapu — fastest delivery, biggest selection. Free delivery anywhere in the city.',
    url: `${BASE}/rent-scooter-lapu-lapu`,
  },
};

const FAQS = [
  {
    q: 'Where is KJM Motors based in Lapu-Lapu?',
    a: 'Our main base is in Lapu-Lapu City, which means we have the fastest delivery times and the largest scooter selection for this area. Typical delivery: 20–35 minutes.',
  },
  {
    q: 'Can I pick up my scooter at Mactan Airport?',
    a: "Yes! Free airport pickup at Mactan-Cebu International Airport is available. We meet you at arrivals. See our dedicated airport page for details.",
  },
  {
    q: 'Can I use the scooter to visit Mactan Island beaches?',
    a: "Absolutely — Lapu-Lapu City is on Mactan Island. You're minutes from Shangrila Resort, Maribago Beach, and the island-hopping operators at Mactan Shrine.",
  },
  {
    q: "Is a driver's license required?",
    a: "Yes. A valid motorcycle driver's license or International Driving Permit (IDP) is required. Tourists can use their home country license for up to 90 days.",
  },
  {
    q: 'How do I return the scooter at the end of my rental?',
    a: 'We pick up the scooter from you — just message us your location via WhatsApp and we\'ll arrange collection at your convenience.',
  },
];

export default function RentScooterLapuLapuPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            serviceSchema({
              url: `${BASE}/rent-scooter-lapu-lapu`,
              name: 'Scooter Rental Lapu-Lapu City - KJM Motors',
              description: 'Rent a scooter in Lapu-Lapu City from ₱499/day. Our main base for fastest delivery and biggest selection.',
              location: 'Lapu-Lapu City',
              latitude: '10.3077',
              longitude: '123.9790',
              postalCode: '6015',
              faqs: FAQS,
            })
          ),
        }}
      />

      <div className="bg-neutral-50 min-h-screen">
        {/* Hero */}
        <section className="bg-neutral-900 text-white py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-primary-400 font-semibold text-sm uppercase tracking-wider mb-3">Lapu-Lapu City · Our Main Hub</p>
            <h1 className="text-3xl sm:text-5xl font-extrabold mb-4 leading-tight">
              Rent a Scooter in<br />
              <span className="text-primary-400">Lapu-Lapu City</span>
            </h1>
            <p className="text-neutral-300 text-lg max-w-2xl mx-auto mb-8">
              Our home base is in Lapu-Lapu — that means the fastest delivery (20–35 min), the widest scooter selection, and the most flexibility. From ₱499/day, free delivery.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/booking" className="px-8 py-4 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-xl transition-colors text-lg">
                Book Now — Free Delivery
              </Link>
              <Link href="/rent-scooter-mactan-airport" className="px-8 py-4 bg-neutral-800 hover:bg-neutral-700 text-white font-semibold rounded-xl transition-colors">
                Airport Pickup →
              </Link>
            </div>
          </div>
        </section>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 space-y-16">

          {/* Why Lapu-Lapu */}
          <section>
            <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-6">Why Rent a Scooter in Lapu-Lapu City?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { title: 'Airport at Your Doorstep', body: 'Mactan-Cebu International Airport is in Lapu-Lapu. Pick up your scooter as you land and start exploring immediately — no taxi, no waiting.' },
                { title: 'Beach Resort Access', body: "Shangri-La Mactan, Crimson Resort, Maribago Blue Water — Lapu-Lapu's resorts are all reachable by scooter in under 20 minutes." },
                { title: 'Fastest Delivery', body: 'Our main depot is here. Deliveries average 20–35 minutes anywhere in Lapu-Lapu City — faster than anywhere else in Cebu.' },
                { title: 'Gateway to Island Hopping', body: 'Olango Island ferries, Mactan Shrine boat operators, and Cordova beaches are all accessible from Lapu-Lapu without leaving Mactan Island.' },
              ].map((c) => (
                <div key={c.title} className="bg-white border border-neutral-200 rounded-2xl p-6">
                  <h3 className="font-bold text-lg text-neutral-900 mb-2">{c.title}</h3>
                  <p className="text-neutral-600 text-sm leading-relaxed">{c.body}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Popular routes */}
          <section>
            <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-6">Popular Routes from Lapu-Lapu</h2>
            <div className="space-y-3">
              {[
                { from: 'Lapu-Lapu City Center', to: 'Mactan Airport', time: '10 min', note: 'Drop off a friend or return your scooter' },
                { from: 'Lapu-Lapu', to: 'Cebu City', time: '35 min', note: 'Via Marcelo Fernan Bridge' },
                { from: 'Lapu-Lapu', to: 'Shangri-La Resort', time: '15 min', note: 'Beachfront dining & snorkeling' },
                { from: 'Lapu-Lapu', to: 'Olango Island Ferry', time: '20 min', note: 'Island hopping start point' },
                { from: 'Lapu-Lapu', to: 'Cordova', time: '20 min', note: 'Quieter beaches on the south side' },
              ].map((r) => (
                <div key={r.from + r.to} className="flex items-center justify-between bg-white border border-neutral-200 rounded-xl px-5 py-4">
                  <div>
                    <p className="font-medium text-neutral-900 text-sm">{r.from} → {r.to}</p>
                    <p className="text-xs text-neutral-500">{r.note}</p>
                  </div>
                  <span className="text-primary-600 font-bold text-sm">{r.time}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Fleet */}
          <section>
            <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-6">Available Scooters in Lapu-Lapu</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              {vehicles.map((v) => (
                <Link
                  key={v.slug}
                  href={`/scooters/${v.slug}`}
                  className="flex items-center justify-between bg-white border border-neutral-200 hover:border-primary-300 rounded-2xl p-5 transition-colors group"
                >
                  <div>
                    <p className="font-bold text-neutral-900 group-hover:text-primary-600 transition-colors">{v.brand} {v.model}</p>
                    <p className="text-sm text-neutral-500">{v.engine} · {v.automatic ? 'Automatic' : 'Manual'}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary-600">₱{v.daily.toLocaleString('en-US')}<span className="text-xs text-neutral-400">/day</span></p>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Related links */}
          <section>
            <h2 className="text-xl font-bold text-neutral-900 mb-4">Nearby Areas We Serve</h2>
            <div className="flex flex-wrap gap-3">
              {[
                { label: 'Mactan Airport Pickup', href: '/rent-scooter-mactan-airport' },
                { label: 'Mactan Island', href: '/locations/mactan' },
                { label: 'Cordova', href: '/locations/cordova' },
                { label: 'Cebu City', href: '/locations/cebu-city' },
                { label: 'All Locations', href: '/locations' },
              ].map((l) => (
                <Link key={l.href} href={l.href} className="px-4 py-2 bg-white border border-neutral-200 hover:border-primary-300 text-sm font-medium text-neutral-700 hover:text-primary-600 rounded-xl transition-colors">
                  {l.label} →
                </Link>
              ))}
            </div>
          </section>

          {/* FAQ */}
          <section>
            <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-6">FAQs — Lapu-Lapu Scooter Rental</h2>
            <div className="space-y-4">
              {FAQS.map(({ q, a }) => (
                <div key={q} className="bg-white border border-neutral-200 rounded-2xl p-6">
                  <h3 className="font-bold text-neutral-900 mb-2">{q}</h3>
                  <p className="text-neutral-600 text-sm leading-relaxed">{a}</p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="bg-neutral-900 text-white rounded-3xl p-10 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">Your Scooter is Ready in Lapu-Lapu</h2>
            <p className="text-neutral-400 mb-6">Book now and we&apos;ll deliver in 20–35 minutes. Free cancellation up to 24 hours before pickup.</p>
            <Link href="/booking" className="inline-block px-10 py-4 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-xl transition-colors text-lg">
              Reserve Now — Free Delivery
            </Link>
          </section>
        </div>
      </div>
    </>
  );
}
