import Link from 'next/link';
import Image from 'next/image';
import { Icon } from '../../components/ui/Icon';

const articles = [
  { slug: 'best-routes-cebu', tag: 'Routes', title: 'Best Scooter Routes in Cebu', excerpt: 'From Lapu-Lapu to Moalboal — discover the routes every rider should know. Includes road conditions, fuel stops, and ride times.', readTime: '5 min read', icon: 'ph:map-trifold-fill', image: '/tips/routes-cebu.jpg' },
  { slug: 'kawasan-falls-guide', tag: 'Destination', title: 'Getting to Kawasan Falls by Scooter', excerpt: "The 90km ride from Cebu City to Kawasan Falls is one of the best day trips you can do. Here's how to plan it right.", readTime: '4 min read', icon: 'ph:mountains-fill', image: '/tips/kawasan-falls.jpg' },
  { slug: 'osme\u00f1a-peak-guide', tag: 'Destination', title: 'Riding to Osmeña Peak', excerpt: "Cebu's highest point is worth the climb. We cover the road conditions, best time to go, and what to expect.", readTime: '3 min read', icon: 'ph:flag-fill', image: '/tips/osmena-peak.jpg' },
  { slug: 'cebu-traffic-tips', tag: 'Tips', title: 'Surviving Cebu City Traffic on a Scooter', excerpt: 'Cebu traffic can be intense. Learn the best times to ride, which roads to avoid, and local rules every tourist should know.', readTime: '4 min read', icon: 'ph:traffic-sign-fill', image: '/tips/cebu-traffic.jpg' },
  { slug: 'philippines-driving-license', tag: 'Legal', title: 'Driving in the Philippines as a Tourist', excerpt: 'Everything about licenses, IDPs, road rules, and what to do if you get pulled over. Stay legal, stay safe.', readTime: '6 min read', icon: 'ph:identification-card-fill', image: '/tips/driving-license.jpg' },
  { slug: 'packing-scooter-trip', tag: 'Tips', title: 'What to Pack for a Scooter Trip in Cebu', excerpt: 'Sunscreen, rain gear, phone mount — our checklist for a comfortable multi-day ride around the island.', readTime: '3 min read', icon: 'ph:backpack-fill', image: '/tips/packing.jpg' },
];

const tips = [
  { icon: 'ph:sun-fill', tip: 'Ride early morning (6–9am) to avoid heat and traffic' },
  { icon: 'ph:drop-fill', tip: 'Always carry water — Cebu heat is brutal even on two wheels' },
  { icon: 'ph:cloud-rain-fill', tip: 'Pack a rain jacket — afternoon showers hit fast and hard' },
  { icon: 'ph:gas-pump-fill', tip: 'Fill up whenever you can — rural areas have very few stations' },
  { icon: 'ph:phone-fill', tip: 'Download Maps.me — works fully offline in the Philippines' },
  { icon: 'ph:navigation-arrow-fill', tip: 'Use Waze in the city — it reroutes around Cebu traffic in real time' },
  { icon: 'ph:book-open-fill', tip: 'Always wear your helmet — it is the law and saves lives' },
  { icon: 'ph:lock-fill', tip: 'Always lock your scooter when parked — even for 2 minutes' },
  { icon: 'ph:moon-fill', tip: 'Avoid riding after dark in rural areas — potholes and no lighting' },
  { icon: 'ph:t-shirt-fill', tip: 'Wear sunscreen on your arms and neck — wind makes you forget the burn' },
  { icon: 'ph:horn-fill', tip: 'Use your horn freely — it is normal here and expected at junctions' },
  { icon: 'ph:dog-fill', tip: 'Watch for dogs on rural roads — they chase bikes and can cause falls' },
];

export default function TipsPage() {
  return (
    <div className="bg-neutral-50 min-h-screen">
      {/* Header */}
      <section className="bg-neutral-900 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">Tips & Travel Guides</h1>
          <p className="text-neutral-400 text-lg">Ride smarter around Cebu. Local knowledge from people who ride these roads daily.</p>
        </div>
      </section>

      {/* Quick Tips */}
      <section className="bg-white border-b border-neutral-200 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 mb-8">
            {/* @ts-ignore */}
            <Icon icon="ph:lightbulb-fill" width={20} height={20} style={{ color: '#F97316' }} />
            <h2 className="text-sm font-bold text-primary-600 uppercase tracking-widest">Quick Tips — Free & Essential</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {tips.map((t, i) => (
              <div key={t.tip} className="flex items-start gap-4 p-4 rounded-xl bg-neutral-50 border border-neutral-200 hover:border-primary-200 hover:bg-primary-50/30 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-primary-500 flex items-center justify-center flex-shrink-0">
                  {/* @ts-ignore */}
                  <Icon icon={t.icon} width={20} height={20} style={{ color: '#ffffff' }} />
                </div>
                <div>
                  <p className="text-xs font-bold text-primary-500 mb-0.5">Tip {String(i + 1).padStart(2, '0')}</p>
                  <p className="text-sm text-neutral-700 leading-snug font-medium">{t.tip}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Articles */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <h2 className="text-2xl font-bold text-neutral-900 mb-8">Travel Guides</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((a) => (
            <Link
              key={a.slug}
              href={`/tips/${a.slug}`}
              className="group bg-white rounded-2xl border border-neutral-200 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-150"
            >
              {/* Image */}
              <div className="relative aspect-[16/9] bg-neutral-100 overflow-hidden">
                <Image
                  src={a.image}
                  alt={a.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                <div className="absolute top-3 left-3 flex items-center justify-between w-[calc(100%-24px)]">
                  <span className="px-2.5 py-1 bg-primary-500 text-white text-xs font-bold rounded-full">{a.tag}</span>
                  <span className="text-xs text-white/80 font-medium bg-black/30 px-2 py-1 rounded-full">{a.readTime}</span>
                </div>
              </div>
              {/* Content */}
              <div className="p-5">
                <h3 className="font-bold text-neutral-900 text-base mb-2 group-hover:text-primary-600 transition-colors">{a.title}</h3>
                <p className="text-sm text-neutral-500 leading-relaxed">{a.excerpt}</p>
                <div className="mt-4 pt-4 border-t border-neutral-100">
                  <span className="text-sm font-semibold text-primary-600 flex items-center gap-1">
                    Read article
                    {/* @ts-ignore */}
                    <Icon icon="ph:arrow-right-bold" width={12} height={12} />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
