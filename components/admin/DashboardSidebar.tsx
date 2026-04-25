'use client';

import { useState, useEffect } from 'react';
import { Icon } from '../ui/Icon';

interface SidebarTab {
  id: string;
  label: string;
  icon: string;
}

export default function DashboardSidebar({
  tabs,
  activeTab,
  onTabChange,
  isDark,
}: {
  tabs: SidebarTab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  isDark: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`lg:hidden fixed bottom-6 right-6 z-40 p-3 rounded-full shadow-lg transition-all ${
          isDark
            ? 'bg-primary-500 hover:bg-primary-600 text-white'
            : 'bg-primary-500 hover:bg-primary-600 text-white'
        }`}
      >
        {/* @ts-ignore */}
        <Icon icon={isOpen ? 'ph:x-bold' : 'ph:list-bold'} width={24} height={24} />
      </button>

      {/* Sidebar Overlay (Mobile) */}
      {isOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black/50 lg:hidden z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-screen z-40 transition-all duration-300 ${
          isMobile
            ? isOpen ? 'w-64' : 'w-0'
            : isOpen ? 'w-64' : 'w-20'
        } ${isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200'} border-r overflow-hidden`}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className={`p-4 border-b ${isDark ? 'border-neutral-800' : 'border-neutral-200'}`}>
            <div className="flex items-center justify-between">
              {isOpen && (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">K</span>
                  </div>
                  <span className={`font-bold text-sm ${isDark ? 'text-white' : 'text-neutral-900'}`}>KJM</span>
                </div>
              )}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className={`p-1.5 rounded-lg transition-colors hidden lg:block ${
                  isDark
                    ? 'hover:bg-neutral-800 text-neutral-400 hover:text-white'
                    : 'hover:bg-neutral-100 text-neutral-600 hover:text-neutral-900'
                }`}
              >
                {/* @ts-ignore */}
                <Icon icon={isOpen ? 'ph:caret-left-bold' : 'ph:caret-right-bold'} width={18} height={18} />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-3 space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  onTabChange(tab.id);
                  if (window.innerWidth < 1024) setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-semibold whitespace-nowrap lg:whitespace-normal ${
                  activeTab === tab.id
                    ? isDark
                      ? 'bg-primary-500 text-white shadow-lg'
                      : 'bg-primary-500 text-white shadow-lg'
                    : isDark
                    ? 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                }`}
                title={!isOpen ? tab.label : undefined}
              >
                {/* @ts-ignore */}
                <Icon icon={tab.icon} width={20} height={20} className="flex-shrink-0" />
                {isOpen && <span>{tab.label}</span>}
              </button>
            ))}
          </nav>

          {/* Footer */}
          <div className={`p-3 border-t ${isDark ? 'border-neutral-800' : 'border-neutral-200'}`}>
            <button
              className={`w-full flex items-center justify-center lg:justify-start gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                isDark
                  ? 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              {/* @ts-ignore */}
              <Icon icon="ph:gear-bold" width={18} height={18} />
              {isOpen && 'Settings'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
