'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Icon } from '../ui/Icon';
import { LanguageSelector } from '../ui/LanguageSelector';
import { MobileMenu } from './MobileMenu';

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <nav
        className={`fixed top-0 w-full z-40 transition-all duration-300 ${
          scrolled
            ? 'bg-white/98 backdrop-blur-xl border-b border-neutral-200 shadow-sm'
            : 'bg-white/95 backdrop-blur-xl border-b border-neutral-100'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-sm">K</span>
              </div>
              <span className="font-bold text-lg text-neutral-900 font-primary">
                KJM
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {[
                { label: 'Scooters', href: '/scooters' },
                { label: 'Why KJM', href: '/why-kjm' },
                { label: 'FAQ', href: '/faq' },
                { label: 'Tips & News', href: '/tips' },
              ].map(({ label, href }) => (
                <Link key={href} href={href} className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors relative group py-1">
                  {label}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary-500 to-accent-500 group-hover:w-full transition-all duration-300" />
                </Link>
              ))}
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-3">
              {/* Language Selector */}
              <LanguageSelector />

              {/* WhatsApp */}
              <a
                href="https://wa.me/639752984845"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110"
                title="WhatsApp"
              >
                {/* @ts-ignore */}
                <Icon icon="logos:whatsapp-icon" width={28} height={28} />
              </a>

              {/* Book CTA */}
              <Link
                href="/booking"
                className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-neutral-900 text-white text-sm font-semibold hover:bg-neutral-800 transition-colors"
              >
                Book Now
              </Link>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden w-9 h-9 rounded-lg flex items-center justify-center text-neutral-600 hover:bg-neutral-100 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d={mobileMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      {/* Spacer */}
      <div className="h-16" />
    </>
  );
}
