import React from 'react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-neutral-900 text-neutral-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2.5 mb-4 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                <span className="text-white font-bold text-sm">K</span>
              </div>
              <span className="font-bold text-white text-lg">KJM</span>
            </Link>
            <p className="text-sm leading-relaxed text-white">
              Premium scooter rentals in Cebu. Fast, affordable, and eco-friendly.
            </p>
            <a
              href="https://wa.me/639752984845"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-sm text-success-400 hover:text-success-300 font-medium transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-9.746 9.806c0 2.734.732 5.41 2.124 7.738L3.71 21.271l8.256-2.176c2.214 1.204 4.694 1.839 7.265 1.839 5.433 0 9.85-4.417 9.85-9.85 0-2.631-.997-5.107-2.81-6.977A9.833 9.833 0 0011.052 6.979z" />
              </svg>
              +63 975 298 4845
            </a>
          </div>

          {/* Scooters */}
          <div>
            <h3 className="font-bold text-white text-sm uppercase tracking-wider mb-4">Fleet</h3>
            <ul className="space-y-2.5 text-sm">
              {['Honda Beat 110', 'Honda Click 125', 'Yamaha Aerox V2', 'Honda PCX 160', 'Yamaha Nmax V3', 'Honda ADV 160'].map((m) => (
                <li key={m}>
                  <Link href="/scooters" className="hover:text-white transition-colors">{m}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-bold text-white text-sm uppercase tracking-wider mb-4">Services</h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/scooters" className="hover:text-white transition-colors">Browse Scooters</Link></li>
              <li><Link href="/booking" className="hover:text-white transition-colors">Start Booking</Link></li>
              <li><Link href="/#why" className="hover:text-white transition-colors">Why KJM</Link></li>
              <li><Link href="/#faq" className="hover:text-white transition-colors">FAQ</Link></li>
            </ul>
          </div>

          {/* Locations */}
          <div>
            <h3 className="font-bold text-white text-sm uppercase tracking-wider mb-4">Locations</h3>
            <ul className="space-y-2.5 text-sm">
              {['Lapu-Lapu City', 'Mactan Airport', 'Cebu City', 'IT Park', 'Mandaue', 'Hotel Delivery'].map((l) => (
                <li key={l}><span className="hover:text-white transition-colors cursor-pointer">{l}</span></li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm">© 2026 KJM. All rights reserved.</p>
          <div className="flex items-center gap-6 text-sm">
            <a href="/" className="hover:text-white transition-colors">Privacy</a>
            <a href="/" className="hover:text-white transition-colors">Terms</a>
            <a href="/" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
