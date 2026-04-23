import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Icon } from '../../components/ui/Icon';
import { getPublicVehicles } from '../../lib/vehicles-live';
import { vehicleItemListSchema } from '../../lib/schema';

export const metadata: Metadata = {
  title: 'Scooter Rental Fleet Cebu — 8 Models from ₱499/day | KJM Motors',
  description: 'Browse our 8 scooter models available for rent in Cebu. Honda Beat, Click, PCX, Yamaha Nmax, Aerox, ADV and more. From ₱499/day with free delivery.',
  keywords: ['scooter rental cebu', 'rent scooter cebu', 'honda scooter rental cebu', 'yamaha nmax rental cebu'],
  alternates: { canonical: 'https://kjm-motors.com/scooters' },
};

export default async function ScootersPage() {
  const vehicles = await getPublicVehicles();
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(vehicleItemListSchema(vehicles)) }}
      />
    <div className="bg-neutral-50 min-h-screen">
      {/* Header */}
      <section className="bg-neutral-900 py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3">Our Fleet</h1>
          <p className="text-neutral-400 text-lg max-w-xl mx-auto">
            8 models · 2023–2026 · Insurance, Helmet &amp; Top Case included · Free delivery
          </p>
        </div>
      </section>

      {/* Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
                <div className="absolute top-3 left-3 flex gap-2">
                  {v.badge && (
                    <span className="px-2.5 py-1 bg-primary-500 text-white text-xs font-bold rounded-full">
                      {v.badge}
                    </span>
                  )}
                  <span className="px-2.5 py-1 bg-white/90 backdrop-blur-sm text-neutral-700 text-xs font-semibold rounded-full">
                    {v.automatic ? 'Auto' : 'Manual'}
                  </span>
                </div>
              </div>

              <div className="p-4">
                <h3 className="font-bold text-neutral-900 text-base leading-tight mb-1">{v.brand} {v.model}</h3>
                <p className="text-xs text-neutral-500 mb-3">{v.engine} · {v.year}</p>

                <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
                  <div>
                    <span className="text-xl font-bold text-neutral-900">₱{v.daily.toLocaleString()}</span>
                    <span className="text-xs text-neutral-500 ml-1">/ day</span>
                  </div>
                  <span className="text-xs font-semibold text-primary-600 group-hover:underline flex items-center gap-1">
                    View details
                    {/* @ts-ignore */}
                    <Icon icon="ph:arrow-right-bold" width={12} height={12} />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* What's Always Included */}
        <div className="mt-16 bg-white rounded-2xl border border-neutral-200 p-8">
          <h2 className="text-2xl font-bold text-neutral-900 mb-6 text-center">Every rental includes</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 text-center">
            {[
              { icon: 'ph:shield-check-fill', label: 'Insurance' },
              { icon: 'ph:wrench-fill', label: 'Maintenance' },
              { icon: 'ph:helmet-fill', label: 'Helmet' },
              { icon: 'ph:map-pin-fill', label: 'Free Delivery' },
              { icon: 'ph:gas-pump-fill', label: 'Full Tank' },
              { icon: 'ph:chat-circle-dots-fill', label: '24/7 Support' },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex justify-center mb-2">
                  {/* @ts-ignore */}
                  <Icon icon={item.icon} width={28} height={28} style={{ color: '#F97316' }} />
                </div>
                <p className="text-sm font-semibold text-neutral-700">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
    </>
  );
}
