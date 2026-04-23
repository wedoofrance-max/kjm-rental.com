'use client';

import { useState, useRef, useEffect } from 'react';

const languages = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'fil', label: 'Filipino', flag: '🇵🇭' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
];

export function LanguageSelector() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(languages[0]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={ref} className="relative hidden sm:block">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-neutral-100"
      >
        <span>{selected.flag}</span>
        <span>{selected.code.toUpperCase()}</span>
        <svg className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-neutral-200 rounded-xl shadow-lg py-1 z-50">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => { setSelected(lang); setOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-2 text-sm text-left transition-colors hover:bg-neutral-50 ${
                selected.code === lang.code ? 'font-semibold text-neutral-900' : 'text-neutral-600'
              }`}
            >
              <span>{lang.flag}</span>
              <span>{lang.label}</span>
              {selected.code === lang.code && (
                <svg className="w-3.5 h-3.5 ml-auto text-primary-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
