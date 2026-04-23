import type { MetadataRoute } from 'next';
import { vehicles } from '../lib/vehicles';
import { LOCATIONS } from '../lib/locations';

const BASE = 'https://kjm-motors.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE}/scooters`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE}/rent-scooter-cebu`, lastModified: now, changeFrequency: 'weekly', priority: 0.95 },
    { url: `${BASE}/rent-scooter-lapu-lapu`, lastModified: now, changeFrequency: 'weekly', priority: 0.85 },
    { url: `${BASE}/rent-scooter-mactan-airport`, lastModified: now, changeFrequency: 'weekly', priority: 0.80 },
    { url: `${BASE}/locations`, lastModified: now, changeFrequency: 'weekly', priority: 0.80 },
    { url: `${BASE}/booking`, lastModified: now, changeFrequency: 'weekly', priority: 0.70 },
    { url: `${BASE}/faq`, lastModified: now, changeFrequency: 'monthly', priority: 0.60 },
    { url: `${BASE}/why-kjm`, lastModified: now, changeFrequency: 'monthly', priority: 0.55 },
  ];

  const vehiclePages: MetadataRoute.Sitemap = vehicles.map((v) => ({
    url: `${BASE}/scooters/${v.slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.75,
  }));

  const locationPages: MetadataRoute.Sitemap = LOCATIONS.map((loc) => ({
    url: `${BASE}/locations/${loc.slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: loc.type === 'pillar' ? 0.70 : 0.55,
  }));

  return [...staticPages, ...vehiclePages, ...locationPages];
}
