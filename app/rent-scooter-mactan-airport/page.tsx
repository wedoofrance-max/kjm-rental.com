import type { Metadata } from 'next';
import Link from 'next/link';
import { vehicles } from '../../lib/vehicles';
import { serviceSchema } from '../../lib/schema';

const BASE = 'https://kjm-motors.com';

export const metadata: Metadata = {
  title: 'Scooter Rental at Mactan Airport — Free Pickup | KJM Motors',
  description: 'Just landed at Mactan Airport? We meet you at arrivals with your scooter — completely free. No taxi, no waiting. From ₱499/day. Book before you fly.',
  keywords: ['rent scooter mactan airport', 'scooter rental near airport cebu', 'airport scooter pickup cebu', 'mactan motorcycle rental'],
  alternates: { canonical: `${BASE}/rent-scooter-mactan-airport` },
  openGraph: {
    title: 'Free Scooter Pickup at Mactan Airport | KJM Motors',
    description: 'We meet you at arrivals. No taxi queue, no waiting. Scooter ready in 30 minutes. From ₱499/day.',
    url: `${BASE}/rent-scooter-mactan-airport`,
  },
};

const FAQS = [
  {
    q: 'Is airport pickup really free?',
    a: 'Yes — 100% free. No delivery charge, no airport surcharge. We meet you inside the arrivals hall with your scooter ready.',
  },
  {
    q: 'How long does airport pickup take?',
    a: 'Once you book, we prepare your scooter and head to the airport. Average wait after landing: 20–30 minutes. Book before your flight lands for zero wait.',
  },
  {
    q: 'What if my flight is delayed?',
    a: 'No problem at all. Just message us on WhatsApp with your updated arrival time and we\'ll adjust. No cancellation fee for delays.',
  },
  {
    q: 'Where exactly do you meet at the airport?',
    a: "We meet you at the arrivals exit — both Terminal 1 and Terminal 2. Just message us when you land and we'll confirm the exact meeting point.",
  },
  {
    q: 'Can I return the scooter at the airport when I fly out?',
    a: 'Yes. We can arrange a scooter collection at the airport on your departure day. Just coordinate with us via WhatsApp 24 hours in advance.',
  },
  {
    q: 'What documents do I need for airport pickup?',
    a: "Bring: (1) a valid driver's license or International Driving Permit, (2) your passport, and (3) your booking confirmation. That's it — 5-minute handover and you're riding.",
  },
];

export default function RentScooterAirportPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            serviceSchema({
              url: `${BASE}/rent-scooter-mactan-airport`,
              name: 'Scooter Rental Mactan Airport - KJM Motors',
              description: 'Free scooter pickup at Mactan-Cebu International Airport. We meet you at arrivals. From ₱499/day.',
              location: 'Mactan-Cebu International Airport, Lapu-Lapu City',
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
            <div className="inline-flex items-center gap-2 bg-green-500/15 text-green-400 font-semibold text-sm px-4 py-2 rounded-full mb-4">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              Airport Pickup Available 6 AM – 11 PM Daily
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold mb-4 leading-tight">
              Scooter Rental at<br />
              <span className="text-primary-400">Mactan Airport</span>
            </h1>
            <p className="text-neutral-300 text-lg max-w-2xl mx-auto mb-4">
              Just landed? Skip the taxi queue — we meet you at arrivals with your scooter. Free pickup, 5-minute handover, and you&apos;re exploring Cebu.
            </p>
            <p className="text-neutral-500 text-sm mb-8">Book before your flight lands for zero waiting time.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/booking" className="px-8 py-4 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-xl transition-colors text-lg">
                Book Airport Pickup Now
              </Link>
              <a href="https://wa.me/639752984845?text=Hi KJM! I'm arriving at Mactan Airport and want to book a scooter." target="_blank" rel="noopener noreferrer" className="px-8 py-4 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-xl transition-colors">
                WhatsApp Your Flight Details
              </a>
            </div>
          </div>
        </section>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 space-y-16">

          {/* How it works */}
          <section>
            <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-6">How Airport Scooter Pickup Works</h2>
            <div className="space-y-4">
              {[
                { step: '1', title: 'Book Before You Fly', body: 'Complete your booking online (takes 2 minutes). Select Mactan Airport as your pickup location and enter your flight arrival time.', time: 'Before landing' },
                { step: '2', title: 'We Prepare Your Scooter', body: 'We fuel up, inspect, and prepare your chosen scooter. Our rider heads to the airport timed to your arrival.', time: 'While you fly' },
                { step: '3', title: 'We Meet You at Arrivals', body: 'Look for us at the arrivals exit. Message us on WhatsApp when you land for the exact meeting point (Terminal 1 or 2).', time: 'At landing' },
                { step: '4', title: '5-Minute Handover — You Ride', body: 'Quick document check, scooter inspection, helmet fitting. 5 minutes and you\'re free to explore Cebu on your terms.', time: '30 min after landing' },
              ].map((s) => (
                <div key={s.step} className="flex gap-5 bg-white border border-neutral-200 rounded-2xl p-5">
                  <div className="w-10 h-10 rounded-full bg-primary-500 text-white font-bold flex items-center justify-center shrink-0 text-lg">{s.step}</div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-bold text-neutral-900">{s.title}</h3>
                      <span className="text-xs text-neutral-500 bg-neutral-100 px-2 py-1 rounded-full ml-3 shrink-0">{s.time}</span>
                    </div>
                    <p className="text-neutral-600 text-sm">{s.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Popular routes */}
          <section>
            <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-6">Popular Routes from Mactan Airport</h2>
            <div className="space-y-3">
              {[
                { dest: 'Lapu-Lapu City Center', time: '10 min', note: 'Beaches, local food & Mactan Shrine' },
                { dest: 'Cebu City (IT Park, Ayala)', time: '30 min', note: 'Via Marcelo Fernan Bridge' },
                { dest: 'Mactan Beach Resorts', time: '15–20 min', note: 'Shangri-La, Crimson, Maribago' },
                { dest: 'Olango Island Ferry Terminal', time: '20 min', note: 'Island hopping departure point' },
                { dest: 'Cordova', time: '25 min', note: 'Quiet beaches & reef snorkeling' },
              ].map((r) => (
                <div key={r.dest} className="flex items-center justify-between bg-white border border-neutral-200 rounded-xl px-5 py-4">
                  <div>
                    <p className="font-medium text-neutral-900 text-sm">Airport → {r.dest}</p>
                    <p className="text-xs text-neutral-500">{r.note}</p>
                  </div>
                  <span className="text-primary-600 font-bold text-sm">{r.time}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Fleet */}
          <section>
            <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-6">Choose Your Airport Scooter</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {vehicles.map((v) => (
                <Link
                  key={v.slug}
                  href={`/scooters/${v.slug}`}
                  className="flex items-center justify-between bg-white border border-neutral-200 hover:border-primary-300 rounded-2xl p-5 transition-colors group"
                >
                  <div>
                    <p className="font-bold text-neutral-900 group-hover:text-primary-600 transition-colors">{v.brand} {v.model}</p>
                    <p className="text-sm text-neutral-500">{v.engine} · {v.automatic ? 'Automatic' : 'Manual'}</p>
                    {v.badge && <span className="text-xs bg-primary-50 text-primary-600 font-semibold px-2 py-0.5 rounded-full mt-1 inline-block">{v.badge}</span>}
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary-600">₱{v.daily.toLocaleString('en-US')}<span className="text-xs text-neutral-400">/day</span></p>
                    <p className="text-xs text-neutral-500">₱{v.weekly.toLocaleString('en-US')}/week</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Trust signals */}
          <section>
            <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-6">What You Need for Airport Pickup</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { item: "Driver's License or IDP", detail: 'Motorcycle category required. Most foreign licenses accepted.' },
                { item: 'Passport', detail: 'For identification. Can also serve as security deposit.' },
                { item: 'Security Deposit', detail: '₱2,500 cash or leave your passport copy. Fully refundable.' },
                { item: 'Booking Confirmation', detail: 'Email or WhatsApp screenshot of your booking reference.' },
              ].map((r) => (
                <div key={r.item} className="flex gap-4 bg-white border border-neutral-200 rounded-xl p-5">
                  <span className="text-green-500 font-bold text-lg mt-0.5">✓</span>
                  <div>
                    <p className="font-semibold text-neutral-900 text-sm">{r.item}</p>
                    <p className="text-xs text-neutral-500 mt-0.5">{r.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* FAQ */}
          <section>
            <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-6">FAQs — Airport Scooter Pickup</h2>
            <div className="space-y-4">
              {FAQS.map(({ q, a }) => (
                <div key={q} className="bg-white border border-neutral-200 rounded-2xl p-6">
                  <h3 className="font-bold text-neutral-900 mb-2">{q}</h3>
                  <p className="text-neutral-600 text-sm leading-relaxed">{a}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Related */}
          <section>
            <h2 className="text-xl font-bold text-neutral-900 mb-4">Explore More</h2>
            <div className="flex flex-wrap gap-3">
              {[
                { label: 'Rent in Cebu (all areas)', href: '/rent-scooter-cebu' },
                { label: 'Rent in Lapu-Lapu City', href: '/rent-scooter-lapu-lapu' },
                { label: 'Mactan Island Scooter', href: '/locations/mactan' },
                { label: 'View All Scooters', href: '/scooters' },
              ].map((l) => (
                <Link key={l.href} href={l.href} className="px-4 py-2 bg-white border border-neutral-200 hover:border-primary-300 text-sm font-medium text-neutral-700 hover:text-primary-600 rounded-xl transition-colors">
                  {l.label} →
                </Link>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="bg-neutral-900 text-white rounded-3xl p-10 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">Book Before You Board</h2>
            <p className="text-neutral-400 mb-6">Your scooter will be waiting. Free airport pickup, 5-minute handover, and you&apos;re exploring Cebu.</p>
            <Link href="/booking" className="inline-block px-10 py-4 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-xl transition-colors text-lg">
              Book Airport Pickup
            </Link>
          </section>
        </div>
      </div>
    </>
  );
}
