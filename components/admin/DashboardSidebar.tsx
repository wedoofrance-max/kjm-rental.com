'use client';

import { useState } from 'react';
import { Icon } from '../ui/Icon';

type TabType = 'bookings' | 'vehicles' | 'fleet' | 'documents' | 'finance' | 'ai-advisor' | 'marketing' | 'promotions';

interface DashboardSidebarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  isDark: boolean;
}

export default function DashboardSidebar({ activeTab, onTabChange, isDark }: DashboardSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems: Array<{
    id: TabType;
    label: string;
    icon: string;
    category: 'management' | 'analytics' | 'ai';
  }> = [
    // Management Section
    { id: 'bookings', label: 'Bookings', icon: 'ph:calendar-dots-bold', category: 'management' },
    { id: 'vehicles', label: 'Vehicles', icon: 'ph:car-bold', category: 'management' },
    { id: 'fleet', label: 'Fleet', icon: 'ph:motorcycle-bold', category: 'management' },
    { id: 'documents', label: 'Documents', icon: 'ph:folder-open-bold', category: 'management' },
    { id: 'promotions', label: 'Promotions', icon: 'ph:tag-bold', category: 'management' },
    // Analytics Section
    { id: 'finance', label: 'Finance', icon: 'ph:chart-line-bold', category: 'analytics' },
    { id: 'marketing', label: 'Marketing', icon: 'ph:megaphone-bold', category: 'analytics' },
    // AI Section
    { id: 'ai-advisor', label: 'AI Advisor', icon: 'ph:sparkles-bold', category: 'ai' },
  ];

  const getCategoryLabel = (category: 'management' | 'analytics' | 'ai') => {
    switch (category) {
      case 'management':
        return 'Business Management';
      case 'analytics':
        return 'Analytics & Reports';
      case 'ai':
        return 'AI Tools';
    }
  };

  // Group items by category
  const groupedItems = {
    management: menuItems.filter((item) => item.category === 'management'),
    analytics: menuItems.filter((item) => item.category === 'analytics'),
    ai: menuItems.filter((item) => item.category === 'ai'),
  };

  return (
    <aside
      className={`${
        isCollapsed ? 'w-20' : 'w-64'
      } h-screen flex flex-col transition-all duration-300 border-r ${
        isDark ? 'border-neutral-800 bg-neutral-900' : 'border-neutral-200 bg-neutral-50'
      }`}
    >
      {/* Header */}
      <div className={`p-4 border-b ${isDark ? 'border-neutral-800' : 'border-neutral-200'} flex items-center justify-between`}>
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            {/* @ts-ignore */}
            <Icon icon="ph:briefcase-bold" width={24} height={24} className="text-primary-600" />
            <h2 className={`font-bold text-sm whitespace-nowrap ${isDark ? 'text-white' : 'text-neutral-900'}`}>
              KJM Motors
            </h2>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`p-2 rounded-lg transition-colors ${
            isDark ? 'hover:bg-neutral-800 text-neutral-500' : 'hover:bg-neutral-200 text-neutral-600'
          }`}
          title={isCollapsed ? 'Expand' : 'Collapse'}
        >
          {/* @ts-ignore */}
          <Icon icon={isCollapsed ? 'ph:caret-right-bold' : 'ph:caret-left-bold'} width={18} height={18} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-2">
        {(Object.entries(groupedItems) as Array<[keyof typeof groupedItems, typeof menuItems]>).map(([category, items]) => (
          <div key={category}>
            {/* Category Label */}
            {!isCollapsed && (
              <p
                className={`px-3 py-2 text-xs font-bold uppercase tracking-wider mb-2 ${
                  isDark ? 'text-neutral-500' : 'text-neutral-600'
                }`}
              >
                {getCategoryLabel(category as 'management' | 'analytics' | 'ai')}
              </p>
            )}

            {/* Menu Items */}
            {items.map((item) => (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left ${
                  activeTab === item.id
                    ? isDark
                      ? 'bg-primary-600 text-white'
                      : 'bg-primary-500 text-white'
                    : isDark
                    ? 'text-neutral-300 hover:bg-neutral-800'
                    : 'text-neutral-700 hover:bg-neutral-200'
                }`}
                title={item.label}
              >
                {/* @ts-ignore */}
                <Icon icon={item.icon} width={20} height={20} className="flex-shrink-0" />
                {!isCollapsed && <span className="text-sm font-medium truncate">{item.label}</span>}
              </button>
            ))}

            {!isCollapsed && <div className="my-2" />}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div
        className={`p-4 border-t ${
          isDark ? 'border-neutral-800 text-neutral-500' : 'border-neutral-200 text-neutral-600'
        } text-xs text-center`}
      >
        {!isCollapsed && <p>Dashboard v2.1</p>}
      </div>
    </aside>
  );
}
