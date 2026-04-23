'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm md:hidden" onClick={onClose} />
      )}

      <div className={`fixed top-16 left-0 right-0 z-40 bg-white border-b border-neutral-200 shadow-xl transform transition-transform duration-300 md:hidden ${isOpen ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col gap-1">
          {[
            { label: 'Scooters', href: '/scooters' },
            { label: 'Why KJM', href: '/why-kjm' },
            { label: 'FAQ', href: '/faq' },
            { label: 'Tips & News', href: '/tips' },
          ].map(({ label, href }) => (
            <Link key={href} href={href} onClick={onClose} className="px-4 py-3 text-base font-medium text-neutral-700 hover:text-neutral-900 hover:bg-neutral-50 rounded-xl transition-colors">
              {label}
            </Link>
          ))}

          <div className="h-px bg-neutral-100 my-2" />

          <a
            href="https://wa.me/639752984845"
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="px-4 py-3 text-base font-medium text-success-600 hover:bg-success-50 rounded-xl transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-9.746 9.806c0 2.734.732 5.41 2.124 7.738L3.71 21.271l8.256-2.176c2.214 1.204 4.694 1.839 7.265 1.839 5.433 0 9.85-4.417 9.85-9.85 0-2.631-.997-5.107-2.81-6.977A9.833 9.833 0 0011.052 6.979z" />
            </svg>
            WhatsApp
          </a>

          <Link
            href="/booking"
            onClick={onClose}
            className="mt-2 px-4 py-3.5 bg-gradient-to-r from-primary-500 to-accent-500 text-white font-semibold rounded-xl text-center"
          >
            Book Now — From ₱499/day
          </Link>
        </div>
      </div>
    </>
  );
}
