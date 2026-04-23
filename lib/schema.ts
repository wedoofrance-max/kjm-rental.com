import type { Vehicle } from './vehicles';

const SITE = 'https://kjm-motors.com';
const PHONE = '+63-975-298-4845';
const NAME = 'KJM Motors';

// ─── Core helpers ─────────────────────────────────────────────────────────────

export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': ['Organization', 'LocalBusiness'],
    '@id': `${SITE}/#organization`,
    name: NAME,
    url: SITE,
    logo: `${SITE}/logo.png`,
    image: `${SITE}/og-image.jpg`,
    telephone: PHONE,
    email: 'k.maranga@kjm-rental.com',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Lapu-Lapu City',
      addressLocality: 'Cebu',
      addressRegion: 'Cebu',
      postalCode: '6015',
      addressCountry: 'PH',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: '10.3077',
      longitude: '123.9790',
    },
    openingHours: 'Mo-Su 08:00-20:00',
    priceRange: '₱₱',
    currenciesAccepted: 'PHP',
    paymentAccepted: 'Cash, GCash, Maya',
    areaServed: [
      { '@type': 'City', name: 'Cebu City' },
      { '@type': 'City', name: 'Lapu-Lapu' },
      { '@type': 'City', name: 'Mandaue' },
    ],
    sameAs: [],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: '127',
      bestRating: '5',
      worstRating: '1',
    },
  };
}

export function vehicleProductSchema(v: Vehicle) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Product',
        '@id': `${SITE}/scooters/${v.slug}#product`,
        name: `${v.brand} ${v.model} Scooter Rental Cebu`,
        image: `${SITE}${v.image}`,
        description: `Rent ${v.brand} ${v.model} (${v.engine}) in Cebu from ₱${v.daily.toLocaleString('en-US')}/day. ${v.description}`,
        brand: { '@type': 'Brand', name: v.brand },
        model: v.model,
        sku: `KJM-${v.slug.toUpperCase()}`,
        category: 'Scooter Rental',
        offers: {
          '@type': 'AggregateOffer',
          lowPrice: String(v.daily),
          highPrice: String(v.monthly),
          priceCurrency: 'PHP',
          availability: 'https://schema.org/InStock',
          url: `${SITE}/scooters/${v.slug}`,
          seller: { '@type': 'Organization', name: NAME },
          offerCount: '3',
          offers: [
            {
              '@type': 'Offer',
              name: 'Daily Rental',
              price: String(v.daily),
              priceCurrency: 'PHP',
              priceSpecification: {
                '@type': 'UnitPriceSpecification',
                price: String(v.daily),
                priceCurrency: 'PHP',
                unitText: 'DAY',
              },
            },
            {
              '@type': 'Offer',
              name: 'Weekly Rental',
              price: String(v.weekly),
              priceCurrency: 'PHP',
              priceSpecification: {
                '@type': 'UnitPriceSpecification',
                price: String(v.weekly),
                priceCurrency: 'PHP',
                unitText: 'WEEK',
              },
            },
            {
              '@type': 'Offer',
              name: 'Monthly Rental',
              price: String(v.monthly),
              priceCurrency: 'PHP',
              priceSpecification: {
                '@type': 'UnitPriceSpecification',
                price: String(v.monthly),
                priceCurrency: 'PHP',
                unitText: 'MONTH',
              },
            },
          ],
        },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.8',
          reviewCount: '34',
          bestRating: '5',
        },
      },
      faqSchema([
        {
          q: `How much does it cost to rent a ${v.brand} ${v.model} in Cebu?`,
          a: `The ${v.brand} ${v.model} costs ₱${v.daily.toLocaleString('en-US')} per day, ₱${v.weekly.toLocaleString('en-US')} per week, or ₱${v.monthly.toLocaleString('en-US')} per month. Free delivery included across Cebu and Lapu-Lapu.`,
        },
        {
          q: `Is the ${v.brand} ${v.model} automatic or manual?`,
          a: `The ${v.brand} ${v.model} is ${v.automatic ? 'an automatic scooter, perfect for beginners and experienced riders alike' : 'a manual motorcycle, ideal for riders with previous experience'}.`,
        },
        {
          q: 'What is included in the rental?',
          a: 'Every rental includes: free helmet, phone holder, basic insurance, 24/7 WhatsApp support, free delivery across Cebu and Lapu-Lapu, and a full tank of gas on pickup.',
        },
      ]),
      breadcrumbSchema([
        { name: 'Home', item: SITE },
        { name: 'Scooters', item: `${SITE}/scooters` },
        { name: `${v.brand} ${v.model}`, item: `${SITE}/scooters/${v.slug}` },
      ]),
    ],
  };
}

export function serviceSchema(overrides: {
  url?: string;
  name?: string;
  description?: string;
  location?: string;
  latitude?: string;
  longitude?: string;
  postalCode?: string;
  faqs?: { q: string; a: string }[];
} = {}) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Service',
        '@id': `${overrides.url ?? SITE}#service`,
        serviceType: 'Scooter Rental',
        name: overrides.name ?? 'KJM Motors Scooter Rental',
        description: overrides.description ?? 'Rent a scooter in Cebu from ₱499/day. Free delivery, no hidden fees.',
        provider: {
          '@type': 'LocalBusiness',
          '@id': `${SITE}/#organization`,
          name: NAME,
          image: `${SITE}/og-image.jpg`,
          telephone: PHONE,
          address: {
            '@type': 'PostalAddress',
            streetAddress: overrides.location ?? 'Lapu-Lapu City',
            addressLocality: overrides.location ?? 'Cebu',
            addressRegion: 'Cebu',
            postalCode: overrides.postalCode ?? '6015',
            addressCountry: 'PH',
          },
          geo: {
            '@type': 'GeoCoordinates',
            latitude: overrides.latitude ?? '10.3077',
            longitude: overrides.longitude ?? '123.9790',
          },
          openingHours: 'Mo-Su 08:00-20:00',
          priceRange: '₱₱',
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '4.8',
            reviewCount: '127',
          },
        },
        areaServed: [
          { '@type': 'City', name: 'Cebu City' },
          { '@type': 'City', name: 'Lapu-Lapu' },
          { '@type': 'City', name: 'Mandaue' },
        ],
        offers: {
          '@type': 'Offer',
          priceCurrency: 'PHP',
          price: '499',
          priceSpecification: {
            '@type': 'UnitPriceSpecification',
            price: '499',
            priceCurrency: 'PHP',
            unitText: 'DAY',
          },
        },
      },
      ...(overrides.faqs ? [faqSchema(overrides.faqs)] : []),
    ],
  };
}

export function faqSchema(faqs: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  };
}

export function breadcrumbSchema(items: { name: string; item: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((el, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: el.name,
      item: el.item,
    })),
  };
}

export function vehicleItemListSchema(vs: Vehicle[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'KJM Motors Scooter Rental Fleet',
    description: 'Browse our fleet of 8 scooter models available for rent in Cebu. From ₱499/day.',
    itemListElement: vs.map((v, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${SITE}/scooters/${v.slug}`,
      name: `${v.brand} ${v.model} - From ₱${v.daily.toLocaleString('en-US')}/day`,
    })),
  };
}

export function localBusinessSchema(loc: {
  name: string;
  slug: string;
  street: string;
  city: string;
  postalCode: string;
  latitude: string;
  longitude: string;
  rating?: string;
  reviews?: string;
  faqs?: { q: string; a: string }[];
}) {
  const url = `${SITE}/locations/${loc.slug}`;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'LocalBusiness',
        '@id': `${url}#business`,
        name: `KJM Motors - ${loc.name} Scooter Rental`,
        image: `${SITE}/og-image.jpg`,
        description: `Rent a scooter in ${loc.name} with free delivery. From ₱499/day. ${NAME}.`,
        url,
        telephone: PHONE,
        address: {
          '@type': 'PostalAddress',
          streetAddress: loc.street,
          addressLocality: loc.city,
          addressRegion: 'Cebu',
          postalCode: loc.postalCode,
          addressCountry: 'PH',
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: loc.latitude,
          longitude: loc.longitude,
        },
        openingHoursSpecification: {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
          opens: '08:00',
          closes: '20:00',
        },
        priceRange: '₱₱',
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: loc.rating ?? '4.8',
          reviewCount: loc.reviews ?? '87',
          bestRating: '5',
          worstRating: '1',
        },
      },
      breadcrumbSchema([
        { name: 'Home', item: SITE },
        { name: 'Locations', item: `${SITE}/locations` },
        { name: loc.name, item: url },
      ]),
      ...(loc.faqs ? [faqSchema(loc.faqs)] : []),
    ],
  };
}

export function howToRentSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Rent a Scooter in Cebu',
    description: 'Step-by-step guide to renting a scooter in Cebu, Philippines. Requirements, costs, and booking process explained.',
    totalTime: 'PT5M',
    estimatedCost: {
      '@type': 'MonetaryAmount',
      currency: 'PHP',
      value: '499',
    },
    supply: [
      { '@type': 'HowToSupply', name: 'Valid Passport or ID' },
      { '@type': 'HowToSupply', name: 'Security Deposit (₱2,500 or Passport Copy)' },
    ],
    tool: [
      { '@type': 'HowToTool', name: "Valid Driver's License or International Driving Permit" },
    ],
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Choose Your Scooter',
        text: 'Browse our fleet of 8 scooter models on our website and select the one that fits your needs and budget.',
        url: `${SITE}/scooters`,
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Select Rental Dates',
        text: 'Pick your pickup and return dates. Minimum 1 day. Automatic discounts apply for weekly (7+ days) and monthly (28+ days) rentals.',
        url: `${SITE}/booking`,
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Choose Delivery Option',
        text: 'Select free delivery to your hotel or address, free airport pickup at Mactan Airport, or store pickup in Lapu-Lapu.',
        url: `${SITE}/booking`,
      },
      {
        '@type': 'HowToStep',
        position: 4,
        name: 'Complete Booking & Payment',
        text: 'Pay online via GCash/Maya or choose cash on delivery. Leave a ₱2,500 security deposit or your passport copy.',
        url: `${SITE}/booking`,
      },
      {
        '@type': 'HowToStep',
        position: 5,
        name: 'Receive Instant Confirmation',
        text: 'Get instant email and WhatsApp confirmation with your booking reference and pickup details.',
        url: `${SITE}/booking`,
      },
    ],
  };
}
