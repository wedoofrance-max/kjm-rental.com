import Link from 'next/link';
import Image from 'next/image';
import { Icon } from '../components/ui/Icon';
import { HeroSearch } from '../components/features/HeroSearch';
import { LOCATIONS } from '../lib/locations';
import { getPublicVehicles } from '../lib/vehicles-live';

const faqs = [
  { q: 'How do I book a scooter?', a: 'Select your scooter, pick your dates, choose delivery, and complete payment. Takes under 2 minutes. We confirm via WhatsApp.', image: '/models/honda-beat-110.jpeg', icon: 'ph:device-mobile-fill' },
  { q: 'What payment methods do you accept?', a: 'Maya / Visa Card, GCash, or Cash on Delivery. No online payment required to book.', image: '/models/honda-click-125.png', icon: 'ph:credit-card-fill' },
  { q: 'Can I cancel my booking?', a: 'Yes, free cancellation up to 24 hours before pickup. Contact us on WhatsApp anytime.', image: '/models/yamaha-aerox-v2-155.webp', icon: 'ph:calendar-x-fill' },
  { q: 'What is the deposit requirement?', a: '2,500 PHP refundable cash deposit OR a passport copy. Your choice.', image: '/models/honda-pcx-160.png', icon: 'ph:hand-coins-fill' },
  { q: 'Do I need a license to rent?', a: 'Yes, a valid driver\'s license is required (IDP accepted for tourists).', image: '/models/honda-adv-160.png', icon: 'ph:identification-card-fill' },
];

export default async function HomePage() {
  // TEMPORARY FIX: Database query hanging - commenting out getPublicVehicles() to test server responsiveness
  // const vehicles = await getPublicVehicles();
  const vehicles = [];
  return (
    <div className="bg-neutral-50">
      {/* Hero */}
      <section className="px-4 sm:px-6 lg:px-8 pt-6 pb-4">
        <div className="max-w-7xl mx-auto">
          <div className="relative overflow-hidden bg-black" style={{ minHeight: '540px', borderRadius: '14px' }}>
            <Image
              src="/hero-bg.png"
              alt=""
              fill
              className="object-cover object-center"
              priority
            />
            {/* Dark overlay — left side darker so text stays readable */}
            <div className="absolute inset-0" style={{ background: 'linear-gradient(100deg, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.55) 55%, rgba(0,0,0,0.20) 100%)' }} />

            <div className="relative z-10 px-8 sm:px-12 lg:px-16 py-16 flex flex-col justify-between h-full" style={{ minHeight: '540px' }}>
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 text-white/80 text-sm font-medium mb-6">
                  <span className="w-2 h-2 rounded-full bg-success-400 animate-pulse" />
                  Available now in Cebu &amp; Lapu-Lapu
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4">
                  Scooter Rental<br />
                  <span style={{ background: 'linear-gradient(135deg, #FB923C 0%, #F97316 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Cebu & Lapu-Lapu
                  </span>
                </h1>
                <p className="text-white/70 text-lg font-medium">
                  Rent a scooter in Cebu from ₱499/day — free hotel delivery &amp; airport pickup in Lapu-Lapu, Mactan &amp; Cebu City. No account needed.
                </p>
              </div>
              <HeroSearch />
            </div>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-8 mt-8 py-6 border-t border-b border-neutral-200">
            {[
              { icon: 'ph:users-fill', text: '240+ Happy Customers' },
              { icon: 'ph:star-fill', text: '4.8 Google Maps' },
              { icon: 'ph:shield-check-fill', text: 'No Hidden Fees' },
              { icon: 'ph:map-pin-fill', text: 'Delivery Included' },
              { icon: 'ph:hard-hat-fill', text: 'Helmets Included' },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-2 text-sm font-semibold text-neutral-600">
                {/* @ts-ignore */}
                <Icon icon={item.icon} width={18} height={18} style={{ color: '#22C55E' }} />
                {item.text}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vehicle Grid */}
      <section className="px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-neutral-900">Our Fleet</h2>
              <p className="text-neutral-500 mt-1">8 models · 2023–2026 · Insurance, Helmet &amp; Top Case included</p>
            </div>
            <Link href="/scooters" className="text-sm font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1">
              View all
              <Icon icon="ph:arrow-right-bold" width={16} height={16} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {vehicles.map((v) => (
              <Link
                key={v.slug}
                href={`/scooters/${v.slug}`}
                className="group bg-white rounded-2xl border border-neutral-200 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-150"
              >
                <div className="relative aspect-[4/3] bg-neutral-100 overflow-hidden">
                  <Image
                    src={v.image}
                    alt={`${v.brand} ${v.model}`}
                    fill
                    className="object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent group-hover:from-black/10 transition-all" />
                  <div className="absolute top-3 left-3 flex gap-2">
                    {v.badge && (
                      <span className="px-2.5 py-1 bg-primary-500 text-white text-xs font-bold rounded-full">
                        {v.badge}
                      </span>
                    )}
                    {v.automatic && (
                      <span className="px-2.5 py-1 bg-white/90 backdrop-blur-sm text-neutral-700 text-xs font-semibold rounded-full">
                        Auto
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-4">
                  <div className="mb-1">
                    <h3 className="font-bold text-neutral-900 text-base leading-tight">{v.brand} {v.model}</h3>
                  </div>
                  <p className="text-xs text-neutral-500 mb-3">{v.engine} · {v.automatic ? 'Automatic' : 'Manual'}</p>

                  <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
                    <div>
                      <span className="text-xl font-bold text-neutral-900">₱{v.daily.toLocaleString()}</span>
                      <span className="text-xs text-neutral-500 ml-1">/ day</span>
                    </div>
                    <span className="text-xs font-semibold text-primary-600 group-hover:underline flex items-center gap-1">
                      Rent Now
                      <Icon icon="ph:arrow-right-bold" width={12} height={12} />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Delivery Section */}
      <section className="bg-neutral-900 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-white mb-3">Free Delivery, Your Choice</h2>
            <p className="text-neutral-400">No delivery fees in Cebu &amp; Lapu-Lapu</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: 'ph:map-pin-fill', title: 'Pick up at store', desc: 'Come to our Lapu-Lapu City location. Free parking available.', tag: 'FREE' },
              { icon: 'ph:buildings-fill', title: 'Hotel Delivery', desc: 'We deliver to your hotel anywhere in Cebu & Lapu-Lapu.', tag: 'FREE' },
              { icon: 'ph:airplane-fill', title: 'Airport Pickup', desc: "We'll meet you at Mactan-Cebu International Airport.", tag: 'FREE' },
            ].map((item) => (
              <div key={item.title} className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center hover:bg-white/10 transition-colors">
                <div className="flex justify-center mb-4">
                  {/* @ts-ignore */}
                  <Icon icon={item.icon} width={48} height={48} style={{ color: 'rgba(255,255,255,0.8)' }} />
                </div>
                <div className="inline-block px-2.5 py-1 bg-success-500/20 text-success-400 text-xs font-bold rounded-full mb-3">
                  {item.tag}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                <p className="text-neutral-400 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Delivery Locations */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 bg-white border-b border-neutral-100">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-neutral-900">We Deliver Across Cebu</h2>
              <p className="text-neutral-500 text-sm mt-1">Free delivery to 17 locations — hotel, airport, or your address</p>
            </div>
            <Link href="/locations" className="text-sm font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1 shrink-0">
              {/* @ts-ignore */}
              View all <Icon icon="ph:arrow-right-bold" width={14} height={14} />
            </Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {LOCATIONS.map((loc) => (
              <Link
                key={loc.slug}
                href={`/locations/${loc.slug}`}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium border transition-colors ${
                  loc.type === 'pillar'
                    ? 'bg-primary-50 border-primary-200 text-primary-700 hover:bg-primary-100'
                    : 'bg-white border-neutral-200 text-neutral-600 hover:border-primary-200 hover:text-primary-600'
                }`}
              >
                {/* @ts-ignore */}
                <Icon icon="ph:map-pin-fill" width={12} height={12} />
                {loc.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why KJM */}
      <section id="why" className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-neutral-900 mb-3">Why KJM?</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: 'ph:lightning-fill', title: 'Fast Booking', desc: 'Book in under 2 minutes. No account needed.' },
              { icon: 'ph:credit-card-fill', title: 'Pay on Delivery', desc: 'No card required. Pay cash when we arrive.' },
              { icon: 'ph:chat-circle-dots-fill', title: '24/7 Support', desc: 'WhatsApp us anytime. Reply within 2 minutes.' },
              { icon: 'ph:map-pin-fill', title: '17 Delivery Zones', desc: 'Lapu-Lapu, Mactan Airport, Cebu City, IT Park, Mandaue & more.' },
            ].map((item) => (
              <div key={item.title} className="text-center p-6">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-50 to-accent-50 flex items-center justify-center">
                    {/* @ts-ignore */}
                    <Icon icon={item.icon} width={32} height={32} style={{ color: '#F97316' }} />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-neutral-900 mb-2">{item.title}</h3>
                <p className="text-neutral-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-16 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          <h2 className="text-3xl font-bold text-neutral-900 text-center">Frequently Asked Questions</h2>
        </div>
        <div className="space-y-2">
          {faqs.map((faq, i) => {
            const imageLeft = i % 2 === 0;
            return (
              <div key={faq.q} className={`flex flex-col ${imageLeft ? 'lg:flex-row' : 'lg:flex-row-reverse'} overflow-hidden`} style={{ minHeight: '260px' }}>
                {/* Image panel */}
                <div className="relative lg:w-2/5 flex-shrink-0" style={{ minHeight: '220px' }}>
                  <Image
                    src={faq.image}
                    alt={faq.q}
                    fill
                    className="object-cover object-center"
                    sizes="(max-width: 1024px) 100vw, 40vw"
                  />
                  <div className="absolute inset-0 bg-black/30" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    {/* @ts-ignore */}
                    <Icon icon={faq.icon} width={56} height={56} style={{ color: 'rgba(255,255,255,0.9)' }} />
                  </div>
                </div>
                {/* Text panel */}
                <div className="lg:w-3/5 bg-white flex flex-col justify-center px-10 py-10">
                  <p className="text-xs font-bold text-primary-500 uppercase tracking-widest mb-2">0{i + 1}</p>
                  <h3 className="text-xl font-bold text-neutral-900 mb-3">{faq.q}</h3>
                  <p className="text-neutral-500 leading-relaxed">{faq.a}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16" style={{ paddingLeft: '30px', paddingRight: '30px' }}>
        <div className="text-center">
          <div className="bg-gradient-to-r from-primary-500 to-accent-500 rounded-3xl p-16 text-white">
            <h2 className="text-3xl font-bold mb-4">Ready to Ride?</h2>
            <p className="text-white/80 text-lg mb-8">From ₱499/day · Free delivery · No hidden fees</p>
            <Link
              href="/scooters"
              className="inline-flex items-center gap-2 bg-white text-neutral-900 font-bold px-8 py-4 rounded-xl hover:bg-neutral-50 transition-colors text-lg"
            >
              Browse Scooters
              {/* @ts-ignore */}
              <Icon icon="ph:arrow-right-bold" width={20} height={20} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
