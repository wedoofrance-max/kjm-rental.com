import React from 'react';

const messages = [
  '⚡ Free delivery in Cebu & Lapu-Lapu',
  '★ 500+ Happy Customers',
  '🏷️ Save 40% on monthly rentals',
  '✓ No hidden fees · No account needed',
  '✈️ Free Airport Pickup at Mactan',
  '⚡ Free delivery in Cebu & Lapu-Lapu',
  '★ 500+ Happy Customers',
  '🏷️ Save 40% on monthly rentals',
  '✓ No hidden fees · No account needed',
  '✈️ Free Airport Pickup at Mactan',
];

export function PromoTicker() {
  return (
    <div className="relative overflow-hidden py-3 bg-gradient-to-r from-primary-500 to-accent-500"
      style={{
        maskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
      }}
    >
      <div
        className="flex gap-14 whitespace-nowrap"
        style={{ animation: 'ticker 30s linear infinite', width: 'fit-content' }}
      >
        {messages.map((msg, i) => (
          <span key={i} className="text-white text-sm font-semibold flex-shrink-0 flex items-center gap-2">
            {msg}
            <span className="opacity-30 mx-2">·</span>
          </span>
        ))}
      </div>
      <style>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
