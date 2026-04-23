import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Icon } from '../../../components/ui/Icon';
import { getPublicVehicle, getPublicVehicles } from '../../../lib/vehicles-live';
import { vehicleProductSchema } from '../../../lib/schema';

const BASE = 'https://kjm-motors.com';

export async function generateStaticParams() {
  const vehicles = await getPublicVehicles();
  return vehicles.map((v) => ({ slug: v.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const v = await getPublicVehicle(slug);
  if (!v) return {};
  return {
    title: `Rent ${v.brand} ${v.model} in Cebu — ₱${v.daily.toLocaleString('en-US')}/day`,
    description: `Rent a ${v.brand} ${v.model} (${v.engine}) in Cebu from ₱${v.daily.toLocaleString('en-US')}/day. ${v.description} Free delivery included.`,
    keywords: [`rent ${v.brand} ${v.model} cebu`, `${v.brand} ${v.model.toLowerCase()} scooter rental`, `${v.engine} scooter rental cebu`],
    alternates: { canonical: `${BASE}/scooters/${v.slug}` },
    openGraph: {
      title: `${v.brand} ${v.model} Scooter Rental Cebu — ₱${v.daily.toLocaleString('en-US')}/day`,
      description: v.description,
      url: `${BASE}/scooters/${v.slug}`,
      images: [{ url: v.image, alt: `${v.brand} ${v.model} scooter rental Cebu` }],
    },
  };
}

export default async function ScooterDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const vehicle = await getPublicVehicle(slug);
  if (!vehicle) notFound();

  const included = [
    { icon: 'ph:shield-check-fill', label: 'Insurance included' },
    { icon: 'ph:wrench-fill', label: 'Maintenance covered' },
    { icon: 'ph:chat-circle-dots-fill', label: '24/7 WhatsApp support' },
    { icon: 'ph:map-pin-fill', label: 'Free delivery' },
    { icon: 'ph:helmet-fill', label: 'Helmet included' },
    { icon: 'ph:gas-pump-fill', label: 'Full tank on pickup' },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(vehicleProductSchema(vehicle)) }}
      />
    <div className="bg-neutral-50 min-h-screen">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <nav className="flex items-center gap-2 text-sm text-neutral-500">
          <Link href="/" className="hover:text-neutral-700 transition-colors">Home</Link>
          <Icon icon="ph:caret-right-bold" width={12} height={12} />
          <Link href="/scooters" className="hover:text-neutral-700 transition-colors">Scooters</Link>
          <Icon icon="ph:caret-right-bold" width={12} height={12} />
          <span className="text-neutral-900 font-medium">{vehicle.brand} {vehicle.model}</span>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

          {/* Left: Image */}
          <div className="sticky top-24 self-start">
            <div className="relative aspect-[4/3] bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm">
              <Image
                src={vehicle.image}
                alt={`${vehicle.brand} ${vehicle.model}`}
                fill
                className="object-contain p-8"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
              {vehicle.badge && (
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1.5 bg-primary-500 text-white text-xs font-bold rounded-full">
                    {vehicle.badge}
                  </span>
                </div>
              )}
              <div className="absolute top-4 right-4">
                <span className="px-3 py-1.5 bg-neutral-900 text-white text-xs font-semibold rounded-full">
                  {vehicle.automatic ? 'Automatic' : 'Manual'}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Details */}
          <div>
            <div className="mb-2">
              <p className="text-sm font-semibold text-primary-600 uppercase tracking-wide">{vehicle.brand}</p>
              <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 mt-1">{vehicle.model}</h1>
              <p className="text-neutral-500 mt-1">{vehicle.engine} · {vehicle.year} Model</p>
            </div>

            <p className="text-neutral-600 leading-relaxed mt-4 mb-6">{vehicle.description}</p>

            {/* Pricing */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 mb-6">
              <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-4">Pricing</h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 rounded-xl bg-primary-50 border border-primary-200">
                  <p className="text-xs text-primary-600 font-medium mb-1">Per Day</p>
                  <p className="text-2xl font-bold text-neutral-900">₱{vehicle.daily.toLocaleString()}</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-neutral-50 border border-neutral-200">
                  <p className="text-xs text-neutral-500 font-medium mb-1">Per Week</p>
                  <p className="text-2xl font-bold text-neutral-900">₱{vehicle.weekly.toLocaleString()}</p>
                  <p className="text-xs text-primary-600 mt-0.5">Save {Math.round(100 - (vehicle.weekly / (vehicle.daily * 7)) * 100)}%</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-neutral-50 border border-neutral-200">
                  <p className="text-xs text-neutral-500 font-medium mb-1">Per Month</p>
                  <p className="text-2xl font-bold text-neutral-900">₱{vehicle.monthly.toLocaleString()}</p>
                  <p className="text-xs text-primary-600 mt-0.5">Save {Math.round(100 - (vehicle.monthly / (vehicle.daily * 30)) * 100)}%</p>
                </div>
              </div>
            </div>

            {/* Specs */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 mb-6">
              <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-4">Specs</h2>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: 'ph:engine-fill', label: 'Engine', value: vehicle.engine },
                  { icon: 'ph:lightning-fill', label: 'Top Speed', value: vehicle.topSpeed },
                  { icon: 'ph:drop-fill', label: 'Fuel Tank', value: vehicle.fuelTank },
                  { icon: 'ph:scales-fill', label: 'Weight', value: vehicle.weight },
                  { icon: 'ph:gear-fill', label: 'Transmission', value: vehicle.automatic ? 'Automatic' : 'Manual' },
                  { icon: 'ph:calendar-fill', label: 'Year', value: String(vehicle.year) },
                ].map((spec) => (
                  <div key={spec.label} className="flex items-center gap-3">
                    {/* @ts-ignore */}
                    <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
                      {/* @ts-ignore */}
                      <Icon icon={spec.icon} width={16} height={16} style={{ color: '#F97316' }} />
                    </div>
                    <div>
                      <p className="text-xs text-neutral-400">{spec.label}</p>
                      <p className="text-sm font-semibold text-neutral-800">{spec.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Features */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 mb-6">
              <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-4">Features</h2>
              <ul className="space-y-2">
                {vehicle.features.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm text-neutral-700">
                    {/* @ts-ignore */}
                    <Icon icon="ph:check-circle-fill" width={18} height={18} style={{ color: '#22C55E' }} />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* What's Included */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 mb-8">
              <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-4">What&apos;s Included</h2>
              <div className="grid grid-cols-2 gap-3">
                {included.map((item) => (
                  <div key={item.label} className="flex items-center gap-2 text-sm text-neutral-700">
                    {/* @ts-ignore */}
                    <Icon icon={item.icon} width={16} height={16} style={{ color: '#F97316' }} />
                    {item.label}
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href={`/booking?vehicle=${vehicle.slug}`}
                className="flex-1 text-center bg-neutral-900 text-white font-bold py-4 px-6 rounded-xl hover:bg-neutral-800 transition-colors text-base"
              >
                Book This Scooter — ₱{vehicle.daily.toLocaleString()}/day
              </Link>
              <a
                href="https://wa.me/639752984845"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-6 py-4 rounded-xl border-2 border-neutral-200 text-neutral-700 font-semibold hover:border-neutral-300 hover:bg-neutral-50 transition-all"
              >
                {/* @ts-ignore */}
                <Icon icon="logos:whatsapp-icon" width={20} height={20} />
                Ask on WhatsApp
              </a>
            </div>

            <p className="text-xs text-neutral-400 text-center mt-4">Free cancellation · No credit card required · Confirm via WhatsApp</p>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
