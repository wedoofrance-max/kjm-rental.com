import type { Metadata } from "next";
import { headers } from "next/headers";
import "../styles/globals.css";
import { ToastContainer } from "../components/ui/Toast";
import { Navbar } from "../components/layout";
import { Footer } from "../components/layout";
import { organizationSchema } from "../lib/schema";

const BASE = 'https://kjm-motors.com';

export const metadata: Metadata = {
  metadataBase: new URL(BASE),
  title: {
    default: 'KJM Motors | Scooter Rental Cebu from ₱499/day',
    template: '%s | KJM Motors Cebu',
  },
  description: 'Rent a scooter in Cebu from ₱499/day. Free delivery to your hotel or the airport. 8 models, no hidden fees, pay on delivery. Book in 2 minutes.',
  keywords: [
    'scooter rental cebu', 'rent scooter cebu', 'motorcycle rental cebu',
    'rent scooter lapu-lapu', 'scooter rental mactan airport',
    'cheap scooter rental cebu', 'scooter hire cebu philippines',
  ],
  authors: [{ name: 'KJM Motors' }],
  creator: 'KJM Motors',
  publisher: 'KJM Motors',
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  openGraph: {
    type: 'website',
    locale: 'en_PH',
    url: BASE,
    siteName: 'KJM Motors',
    title: 'KJM Motors | Scooter Rental Cebu from ₱499/day',
    description: 'Rent a scooter in Cebu from ₱499/day. Free delivery to your hotel or Mactan Airport. 8 models available.',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'KJM Motors Scooter Rental Cebu' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KJM Motors | Scooter Rental Cebu from ₱499/day',
    description: 'Rent a scooter in Cebu from ₱499/day. Free delivery. 8 models available.',
    images: ['/og-image.jpg'],
  },
  alternates: { canonical: BASE },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* TEMPORARY: Disabled external font loads to debug request hang */}
        {/* <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet" /> */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema()) }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-neutral-50 text-neutral-900">
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
        <ToastContainer />
      </body>
    </html>
  );
}
