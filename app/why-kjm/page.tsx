import { Icon } from '../../components/ui/Icon';
import Link from 'next/link';

const values = [
  {
    icon: 'ph:lightning-fill',
    title: 'Book in under 2 minutes',
    desc: 'No account, no endless forms. Pick your dates, confirm via WhatsApp, done. We designed the process for tourists with limited time.',
  },
  {
    icon: 'ph:hand-coins-fill',
    title: 'Pay when we arrive',
    desc: 'No card required online. Pay cash or GCash when we deliver. You only commit when the scooter is in front of you.',
  },
  {
    icon: 'ph:map-pin-fill',
    title: 'We come to you',
    desc: 'Free delivery to your hotel, resort, or Airbnb anywhere in Cebu & Lapu-Lapu. Airport pickup at Mactan-Cebu also at no charge.',
  },
  {
    icon: 'ph:shield-check-fill',
    title: 'Fully insured, maintained fleet',
    desc: 'Every scooter is insured, regularly serviced, and cleaned before delivery. If something goes wrong, we handle it — no hidden costs.',
  },
  {
    icon: 'ph:chat-circle-dots-fill',
    title: 'Real human support',
    desc: 'Message us on WhatsApp anytime. Our team responds within minutes — not chatbots, not ticket queues. Just fast, friendly help.',
  },
  {
    icon: 'ph:check-circle-fill',
    title: 'No hidden fees',
    desc: 'The price you see is the price you pay. Delivery is free. Helmets are included. Insurance is included. Period.',
  },
];

const stats = [
  { value: '240+', label: 'Happy customers' },
  { value: '4.8★', label: 'Average rating' },
  { value: '2 min', label: 'Average booking time' },
  { value: '0', label: 'Hidden fees' },
];

export default function WhyKJMPage() {
  return (
    <div className="bg-neutral-50 min-h-screen">
      {/* Hero */}
      <section className="bg-neutral-900 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">Why KJM?</h1>
          <p className="text-neutral-400 text-lg">
            We started KJM because renting a scooter in Cebu was needlessly complicated — too many deposits, too many forms, too many surprises on the bill. We fixed that.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b border-neutral-200 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
          {stats.map((s) => (
            <div key={s.label}>
              <p className="text-3xl font-bold text-neutral-900">{s.value}</p>
              <p className="text-sm text-neutral-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Values */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-neutral-900 mb-10 text-center">What makes us different</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((v) => (
              <div key={v.title} className="bg-white rounded-2xl border border-neutral-200 p-6">
                <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center mb-4">
                  {/* @ts-ignore */}
                  <Icon icon={v.icon} width={24} height={24} style={{ color: '#F97316' }} />
                </div>
                <h3 className="font-bold text-neutral-900 text-base mb-2">{v.title}</h3>
                <p className="text-neutral-500 text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-neutral-900 mb-3">Ready to explore Cebu?</h2>
          <p className="text-neutral-500 mb-8">From ₱499/day · Free delivery · No hidden fees</p>
          <Link
            href="/scooters"
            className="inline-flex items-center gap-2 bg-neutral-900 text-white font-bold px-8 py-4 rounded-xl hover:bg-neutral-800 transition-colors"
          >
            Browse Scooters
            {/* @ts-ignore */}
            <Icon icon="ph:arrow-right-bold" width={18} height={18} />
          </Link>
        </div>
      </section>
    </div>
  );
}
