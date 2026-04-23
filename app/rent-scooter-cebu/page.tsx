import type { Metadata } from 'next';
import Link from 'next/link';
import { vehicles } from '../../lib/vehicles';
import { serviceSchema, faqSchema } from '../../lib/schema';

const BASE = 'https://kjm-motors.com';

export const metadata: Metadata = {
  title: 'Rent a Scooter in Cebu from ₱499/day | KJM Motors',
  description: 'Rent a scooter in Cebu starting at ₱499/day. Free delivery to your hotel, Mactan Airport, or anywhere in Cebu. 8 models, no hidden fees, book in 2 minutes.',
  keywords: ['rent scooter cebu', 'scooter rental cebu', 'motorcycle rental cebu', 'cheap scooter cebu', 'cebu scooter hire'],
  alternates: { canonical: `${BASE}/rent-scooter-cebu` },
  openGraph: {
    title: 'Rent a Scooter in Cebu from ₱499/day',
    description: 'Free delivery to your hotel or Mactan Airport. 8 scooter models available. Pay on delivery.',
    url: `${BASE}/rent-scooter-cebu`,
  },
};

const FAQS = [
  {
    q: 'Do I need a license to rent a scooter in Cebu?',
    a: "Yes — a valid driver's license (motorcycle category) or an International Driving Permit (IDP) is required. Tourists from most countries can use their home country license for up to 90 days.",
  },
  {
    q: 'What is the minimum rental period?',
    a: 'The minimum rental period is 1 day. We also offer weekly rates (7–27 days) and monthly rates (28+ days) with significant discounts.',
  },
  {
    q: 'Can tourists rent scooters in Cebu?',
    a: 'Absolutely. Thousands of tourists rent scooters in Cebu every month. You just need a valid passport, a driver\'s license, and a ₱2,500 security deposit (or you can leave your passport copy instead).',
  },
  {
    q: 'Is free delivery really free?',
    a: 'Yes — delivery is completely free anywhere in Cebu City, Lapu-Lapu, Mandaue, and Mactan. No hidden charges.',
  },
  {
    q: 'What happens if the scooter breaks down?',
    a: '24/7 WhatsApp support is included in every rental. If you have a mechanical issue, we will either fix it on-site or bring you a replacement scooter at no extra cost.',
  },
  {
    q: 'Can I rent a scooter by the month in Cebu?',
    a: 'Yes! Monthly rentals (28+ days) are our best-value option. For example, a Honda Beat rents for just ₱8,500/month — far cheaper than daily Grab rides.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept GCash, Maya (PayMaya), and cash on delivery. No credit card needed.',
  },
];

export default function RentScooterCebuPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            serviceSchema({
              url: `${BASE}/rent-scooter-cebu`,
              name: 'Scooter Rental Cebu - KJM Motors',
              description: 'Rent a scooter in Cebu from ₱499/day. Free delivery to your hotel or airport. 8 models available.',
              faqs: FAQS,
            })
          ),
        }}
      />

      <div className="bg-neutral-50 min-h-screen">
        {/* Hero */}
        <section className="bg-neutral-900 text-white py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-primary-400 font-semibold text-sm uppercase tracking-wider mb-3">Cebu Scooter Rental</p>
            <h1 className="text-3xl sm:text-5xl font-extrabold mb-4 leading-tight">
              Rent a Scooter in Cebu<br />
              <span className="text-primary-400">from ₱499/day</span>
            </h1>
            <p className="text-neutral-300 text-lg max-w-2xl mx-auto mb-8">
              Free delivery to your hotel, Mactan Airport, or anywhere in Cebu. 8 scooter models, no hidden fees, pay on delivery. Book in under 2 minutes.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/booking" className="px-8 py-4 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-xl transition-colors text-lg">
                Book Your Scooter Now
              </Link>
              <Link href="/scooters" className="px-8 py-4 bg-neutral-800 hover:bg-neutral-700 text-white font-semibold rounded-xl transition-colors">
                View All Scooters
              </Link>
            </div>
          </div>
        </section>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 space-y-20">

          {/* Why rent in Cebu */}
          <section>
            <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-6">Why Rent a Scooter in Cebu?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              {[
                { title: 'Beat the Traffic', body: 'Cebu City traffic is infamous. A scooter lets you filter through jams that would trap a car for 45 minutes — getting you from IT Park to the airport in half the time.' },
                { title: 'Save on Transport', body: 'A daily Grab round-trip easily costs ₱400–600. A scooter rental at ₱499/day gives you unlimited trips, all day, anywhere.' },
                { title: 'Explore Hidden Spots', body: 'Buses don\'t go to Kawasan Falls, hidden coves, or mountain viewpoints. A scooter gives you access to every corner of Cebu island.' },
                { title: 'Free Delivery', body: 'We deliver your scooter to your hotel, Airbnb, or Mactan Airport — completely free. No need to find our office.' },
              ].map((c) => (
                <div key={c.title} className="bg-white border border-neutral-200 rounded-2xl p-6">
                  <h3 className="font-bold text-lg text-neutral-900 mb-2">{c.title}</h3>
                  <p className="text-neutral-600 text-sm leading-relaxed">{c.body}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Fleet */}
          <section>
            <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2">Our Scooter Rental Fleet in Cebu</h2>
            <p className="text-neutral-600 mb-8">8 well-maintained models — from budget automatics to premium touring scooters.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
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
                    <p className="text-xs text-neutral-500">₱{v.weekly.toLocaleString('en-US')}/week</p>
                  </div>
                </Link>
              ))}
            </div>
            <Link href="/scooters" className="inline-flex items-center text-primary-600 font-semibold hover:text-primary-700 transition-colors">
              View all scooters with specs →
            </Link>
          </section>

          {/* Pricing */}
          <section>
            <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-4">Scooter Rental Prices in Cebu</h2>
            <p className="text-neutral-600 mb-6">Transparent pricing with automatic discounts for longer rentals. No surprise fees.</p>
            <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-neutral-50 border-b border-neutral-200">
                      <th className="px-5 py-3 text-left font-semibold text-neutral-700">Scooter</th>
                      <th className="px-5 py-3 text-left font-semibold text-neutral-700">Daily (1–6d)</th>
                      <th className="px-5 py-3 text-left font-semibold text-neutral-700">Weekly (7–27d)</th>
                      <th className="px-5 py-3 text-left font-semibold text-neutral-700">Monthly (28d+)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {vehicles.map((v) => (
                      <tr key={v.slug} className="hover:bg-neutral-50 transition-colors">
                        <td className="px-5 py-3 font-medium text-neutral-900">
                          <Link href={`/scooters/${v.slug}`} className="hover:text-primary-600 transition-colors">
                            {v.brand} {v.model}
                          </Link>
                        </td>
                        <td className="px-5 py-3 text-neutral-700">₱{v.daily.toLocaleString('en-US')}</td>
                        <td className="px-5 py-3 text-green-700 font-medium">₱{v.weekly.toLocaleString('en-US')}</td>
                        <td className="px-5 py-3 text-primary-600 font-bold">₱{v.monthly.toLocaleString('en-US')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <p className="text-xs text-neutral-500 mt-3">All prices include free delivery, helmet, phone holder, and basic insurance.</p>
          </section>

          {/* How to rent */}
          <section>
            <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-6">How to Rent a Scooter in Cebu</h2>
            <div className="space-y-4">
              {[
                { step: '1', title: 'Choose Your Scooter', body: 'Browse our fleet and select the model that fits your budget and riding style.', link: '/scooters', cta: 'Browse fleet' },
                { step: '2', title: 'Select Your Dates', body: 'Pick your pickup and return dates. Discounts apply automatically for weekly and monthly rentals.', link: '/booking', cta: 'Start booking' },
                { step: '3', title: 'Choose Delivery', body: 'Free delivery to your hotel, Mactan Airport, or store pickup in Lapu-Lapu — your choice.', link: '/booking', cta: null },
                { step: '4', title: 'Pay & Ride', body: 'Pay via GCash, Maya, or cash on delivery. Leave your ₱2,500 deposit or passport copy. Enjoy Cebu!', link: null, cta: null },
              ].map((s) => (
                <div key={s.step} className="flex gap-5 bg-white border border-neutral-200 rounded-2xl p-5">
                  <div className="w-10 h-10 rounded-full bg-primary-500 text-white font-bold flex items-center justify-center shrink-0 text-lg">{s.step}</div>
                  <div>
                    <h3 className="font-bold text-neutral-900 mb-1">{s.title}</h3>
                    <p className="text-neutral-600 text-sm">{s.body}</p>
                    {s.link && s.cta && (
                      <Link href={s.link} className="text-primary-600 text-sm font-semibold hover:text-primary-700 mt-1 inline-block">{s.cta} →</Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Delivery zones */}
          <section>
            <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-6">Free Delivery Zones in Cebu</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { area: 'Mactan Airport', note: 'Meet at arrivals', slug: '/rent-scooter-mactan-airport' },
                { area: 'Lapu-Lapu City', note: 'Our main hub', slug: '/locations/lapu-lapu' },
                { area: 'Cebu City', note: 'All areas', slug: '/locations/cebu-city' },
                { area: 'IT Park', note: 'Business hub', slug: '/locations/it-park' },
                { area: 'Mandaue City', note: '30–45 min', slug: '/locations/mandaue' },
                { area: 'Cordova', note: '40–55 min', slug: '/locations/cordova' },
              ].map((d) => (
                <Link key={d.area} href={d.slug} className="bg-white border border-neutral-200 hover:border-primary-300 rounded-xl p-4 transition-colors">
                  <p className="font-semibold text-neutral-900 text-sm">{d.area}</p>
                  <p className="text-xs text-neutral-500">{d.note}</p>
                </Link>
              ))}
            </div>
            <p className="text-sm text-neutral-600 mt-4">
              Also delivering to: <Link href="/locations/talisay" className="text-primary-600 hover:underline">Talisay</Link>, <Link href="/locations/consolacion" className="text-primary-600 hover:underline">Consolacion</Link>, <Link href="/locations/liloan" className="text-primary-600 hover:underline">Liloan</Link>, <Link href="/locations/banilad" className="text-primary-600 hover:underline">Banilad</Link>, and more.{' '}
              <Link href="/locations" className="text-primary-600 hover:underline font-semibold">View all locations →</Link>
            </p>
          </section>

          {/* What's included */}
          <section>
            <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-6">What&apos;s Included in Your Rental</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                'Free helmet', 'Free phone holder', 'Basic insurance', 'Free delivery', '24/7 WhatsApp support', 'Full tank on pickup',
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 bg-white border border-neutral-200 rounded-xl p-4">
                  <span className="text-green-500 font-bold text-lg">✓</span>
                  <span className="text-sm font-medium text-neutral-800">{item}</span>
                </div>
              ))}
            </div>
          </section>

          {/* FAQ */}
          <section>
            <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-6">Frequently Asked Questions — Cebu Scooter Rental</h2>
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
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">Ready to Explore Cebu?</h2>
            <p className="text-neutral-400 mb-6">Reserve your scooter in 2 minutes. Free cancellation up to 24 hours before pickup.</p>
            <Link href="/booking" className="inline-block px-10 py-4 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-xl transition-colors text-lg">
              Book Your Scooter Now
            </Link>
          </section>
        </div>
      </div>
    </>
  );
}
