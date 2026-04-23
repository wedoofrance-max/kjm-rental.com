'use client';

import { useState } from 'react';
import { Icon } from '../../components/ui/Icon';

const faqs = [
  {
    category: 'Booking',
    icon: 'ph:calendar-fill',
    items: [
      { q: 'How do I book a scooter?', a: 'Browse our fleet, pick your model and dates, choose your delivery option, and submit. We confirm within minutes via WhatsApp. No account needed.' },
      { q: 'Can I book same-day?', a: "Yes! If you need a scooter today, message us on WhatsApp and we'll do our best to arrange same-day delivery." },
      { q: 'Do I need to create an account?', a: 'No account required. Just provide your name, phone number, and delivery address. We keep it simple.' },
      { q: 'Can I extend my rental while in Cebu?', a: "Absolutely. Just WhatsApp us before your return date and we'll extend it — subject to availability." },
      { q: 'Can I cancel my booking?', a: 'Yes, free cancellation up to 24 hours before pickup. Contact us on WhatsApp anytime.' },
    ],
  },
  {
    category: 'Requirements',
    icon: 'ph:identification-card-fill',
    items: [
      { q: 'Do I need a license to rent?', a: "Yes, a valid driver's license is required. International tourists can use an International Driving Permit (IDP) along with their home country license." },
      { q: 'What is the deposit requirement?', a: '2,500 PHP refundable cash deposit OR a passport copy. Your choice — we trust you.' },
      { q: 'What is the minimum age to rent?', a: 'You must be at least 18 years old and hold a valid license.' },
      { q: 'Can I bring a passenger?', a: 'Yes. Our scooters are built for two riders. We provide two helmets with every rental.' },
    ],
  },
  {
    category: 'Delivery & Pickup',
    icon: 'ph:map-pin-fill',
    items: [
      { q: 'Where do you deliver?', a: 'We deliver anywhere in Cebu City, Lapu-Lapu City, Mandaue, and surrounding areas — at no charge.' },
      { q: 'Do you do airport pickup?', a: 'Yes! We meet you at Mactan-Cebu International Airport (Terminal 1 or 2). Just let us know your flight details.' },
      { q: 'Can I pick up at your store?', a: 'Yes, our store is in Lapu-Lapu City with free parking. Address shared on confirmation.' },
    ],
  },
  {
    category: 'Payment',
    icon: 'ph:credit-card-fill',
    items: [
      { q: 'What payment methods do you accept?', a: 'Cash (PHP), GCash, Maya, and Visa/Mastercard. No online payment required to book — pay when we deliver.' },
      { q: 'Are there any hidden fees?', a: 'None. The daily rate is all-inclusive: insurance, helmet, maintenance, and delivery. What you see is what you pay.' },
      { q: 'Is the deposit refundable?', a: 'Yes, 100% refundable when you return the scooter in the same condition. Normal wear and tear is expected.' },
    ],
  },
  {
    category: 'During Your Rental',
    icon: 'ph:engine-fill',
    items: [
      { q: 'What happens if the scooter breaks down?', a: "Call or WhatsApp us immediately. We'll arrange a replacement or send a mechanic — usually within the hour. You won't be stranded." },
      { q: 'Can I take the scooter to other islands?', a: 'You can take it on ferries to nearby islands (Mactan, Olango). For farther destinations like Bohol, contact us first.' },
      { q: 'Is there a mileage limit?', a: 'No mileage limits. Ride as far as you want within the Philippines.' },
      { q: 'What fuel does the scooter use?', a: 'All our models use regular unleaded gasoline (RON 91 or 95). Gas stations are plentiful in Cebu.' },
    ],
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`border border-neutral-200 rounded-xl overflow-hidden ${open ? 'bg-neutral-50' : 'bg-white'}`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left font-semibold text-neutral-800 hover:bg-neutral-50 transition-colors gap-3"
      >
        <span className="text-sm leading-snug">{q}</span>
        {/* @ts-ignore */}
        <Icon
          icon="ph:caret-down-bold"
          width={16} height={16}
          className={`flex-shrink-0 text-neutral-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className="px-5 pb-4 text-neutral-500 text-sm leading-relaxed border-t border-neutral-100 pt-3">
          {a}
        </div>
      )}
    </div>
  );
}

export default function FAQPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="bg-neutral-50 min-h-screen">
      {/* Header */}
      <section className="bg-neutral-900 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">FAQ</h1>
          <p className="text-neutral-400 text-lg">
            Everything you need to know before renting.{' '}
            <a href="tel:+639752984845" className="text-primary-400 hover:text-primary-300 underline">
              Still have questions? Call us.
            </a>
          </p>
        </div>
      </section>

      {/* Multi-column FAQ grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {faqs.map((section) => (
            <div key={section.category}>
              {/* Category header */}
              <div className="flex items-center gap-2 mb-4">
                {/* @ts-ignore */}
                <Icon icon={section.icon} width={18} height={18} style={{ color: '#F97316' }} />
                <h2 className="text-xs font-bold text-primary-600 uppercase tracking-widest">{section.category}</h2>
              </div>
              <div className="space-y-2">
                {section.items.map((item) => (
                  <FAQItem key={item.q} q={item.q} a={item.a} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-7xl mx-auto">
          <div className="bg-neutral-900 rounded-2xl px-8 py-12 flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">Get Cebu travel tips in your inbox</h2>
              <p className="text-neutral-400 text-sm">Best routes, hidden spots, and exclusive discounts. No spam, ever.</p>
            </div>
            {submitted ? (
              <div className="flex items-center gap-2 text-success-400 font-semibold flex-shrink-0">
                {/* @ts-ignore */}
                <Icon icon="ph:check-circle-fill" width={20} height={20} />
                You're in! Check your inbox.
              </div>
            ) : (
              <form
                onSubmit={(e) => { e.preventDefault(); if (email) setSubmitted(true); }}
                className="flex gap-2 w-full md:w-auto"
              >
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="flex-1 md:w-64 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-primary-400 focus:bg-white/15"
                />
                <button
                  type="submit"
                  className="px-5 py-3 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-xl text-sm transition-colors flex-shrink-0"
                >
                  Subscribe
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
