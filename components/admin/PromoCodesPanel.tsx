'use client';

import { useEffect, useState } from 'react';
import { Icon } from '../ui/Icon';

interface PromoCode {
  id: string;
  code: string;
  type: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_DAYS';
  value: number;
  minNights: number | null;
  maxUsage: number | null;
  usageCount: number;
  expiresAt: string;
  isActive: boolean;
  createdAt: string;
  daysLeft?: number;
  isExpired?: boolean;
}

export default function PromoCodesPanel({ isDark }: { isDark: boolean }) {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, active: 0, expired: 0, totalUsages: 0 });
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    code: '',
    type: 'PERCENTAGE',
    value: '',
    minNights: '',
    maxUsage: '',
    expiresAt: getDefaultExpiryDate(),
  });

  function getDefaultExpiryDate(): string {
    const date = new Date();
    date.setDate(date.getDate() + 7); // Default 7 days
    return date.toISOString().split('T')[0];
  }

  const fetchPromoCodes = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/promo-codes?active=true');
      const data = await res.json();
      setPromoCodes(data.promoCodes || []);
      setStats(data.stats || {});
    } catch (err) {
      console.error('Error fetching promo codes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromoCodes();
  }, []);

  const handleCreateCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch('/api/admin/promo-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: formData.code.toUpperCase(),
          type: formData.type,
          value: parseInt(formData.value),
          minNights: formData.minNights ? parseInt(formData.minNights) : null,
          maxUsage: formData.maxUsage ? parseInt(formData.maxUsage) : null,
          expiresAt: formData.expiresAt,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert(`✅ Code "${data.promoCode.code}" created successfully!`);
        setFormData({
          code: '',
          type: 'PERCENTAGE',
          value: '',
          minNights: '',
          maxUsage: '',
          expiresAt: getDefaultExpiryDate(),
        });
        setShowForm(false);
        await fetchPromoCodes();
      } else {
        alert(`❌ Error: ${data.error}`);
      }
    } catch (err) {
      alert('Failed to create promo code');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      const res = await fetch(`/api/admin/promo-codes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
      });

      if (res.ok) {
        await fetchPromoCodes();
      }
    } catch (err) {
      console.error('Error toggling promo code:', err);
    }
  };

  const handleDeleteCode = async (id: string, code: string) => {
    if (!confirm(`Delete promo code "${code}"? This cannot be undone.`)) return;

    try {
      const res = await fetch(`/api/admin/promo-codes/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        alert(`✅ Code "${code}" deactivated`);
        await fetchPromoCodes();
      }
    } catch (err) {
      console.error('Error deleting code:', err);
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'PERCENTAGE':
        return '%';
      case 'FIXED_AMOUNT':
        return '₱';
      case 'FREE_DAYS':
        return 'days';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Stats */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-neutral-900'}`}>
              🎟️ Promo Codes
            </h3>
            <p className={`text-sm mt-1 ${isDark ? 'text-neutral-500' : 'text-neutral-600'}`}>
              Create and manage promotional codes (valid up to 30 days)
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white text-sm font-bold rounded-xl transition-colors"
          >
            {/* @ts-ignore */}
            <Icon icon="ph:plus-bold" width={16} height={16} />
            New Code
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Total', value: stats.total, color: 'text-blue-400' },
            { label: 'Active', value: stats.active, color: 'text-green-400' },
            { label: 'Expired', value: stats.expired, color: 'text-red-400' },
            { label: 'Total Uses', value: stats.totalUsages, color: 'text-orange-400' },
          ].map((stat) => (
            <div key={stat.label} className={`rounded-lg p-3 ${isDark ? 'bg-neutral-800' : 'bg-neutral-50'}`}>
              <p className={`text-xs ${isDark ? 'text-neutral-500' : 'text-neutral-600'} mb-1`}>
                {stat.label}
              </p>
              <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className={`${isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-neutral-50 border-neutral-200'} border rounded-2xl p-6`}>
          <p className={`text-xs font-bold uppercase tracking-wider mb-4 ${isDark ? 'text-neutral-500' : 'text-neutral-600'}`}>
            Create New Promo Code
          </p>

          <form onSubmit={handleCreateCode} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Code */}
              <div>
                <label className={`text-xs mb-1 block ${isDark ? 'text-neutral-500' : 'text-neutral-600'}`}>
                  Code * (e.g., SUMMER20)
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="SUMMER20"
                  required
                  className={`w-full px-3 py-2 rounded-lg text-sm ${isDark ? 'bg-neutral-800 border border-neutral-700 text-white' : 'bg-white border border-neutral-300 text-neutral-900'}`}
                />
              </div>

              {/* Type */}
              <div>
                <label className={`text-xs mb-1 block ${isDark ? 'text-neutral-500' : 'text-neutral-600'}`}>
                  Discount Type *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg text-sm ${isDark ? 'bg-neutral-800 border border-neutral-700 text-white' : 'bg-white border border-neutral-300 text-neutral-900'}`}
                >
                  <option value="PERCENTAGE">Percentage (%)</option>
                  <option value="FIXED_AMOUNT">Fixed Amount (₱)</option>
                  <option value="FREE_DAYS">Free Days</option>
                </select>
              </div>

              {/* Value */}
              <div>
                <label className={`text-xs mb-1 block ${isDark ? 'text-neutral-500' : 'text-neutral-600'}`}>
                  Value * (e.g., 10 for 10%, 500 for ₱500, 2 for 2 days)
                </label>
                <input
                  type="number"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  placeholder="10"
                  required
                  className={`w-full px-3 py-2 rounded-lg text-sm ${isDark ? 'bg-neutral-800 border border-neutral-700 text-white' : 'bg-white border border-neutral-300 text-neutral-900'}`}
                />
              </div>

              {/* Min Nights */}
              <div>
                <label className={`text-xs mb-1 block ${isDark ? 'text-neutral-500' : 'text-neutral-600'}`}>
                  Min Nights (optional)
                </label>
                <input
                  type="number"
                  value={formData.minNights}
                  onChange={(e) => setFormData({ ...formData, minNights: e.target.value })}
                  placeholder="7"
                  className={`w-full px-3 py-2 rounded-lg text-sm ${isDark ? 'bg-neutral-800 border border-neutral-700 text-white' : 'bg-white border border-neutral-300 text-neutral-900'}`}
                />
              </div>

              {/* Max Usage */}
              <div>
                <label className={`text-xs mb-1 block ${isDark ? 'text-neutral-500' : 'text-neutral-600'}`}>
                  Max Usage (optional, null = unlimited)
                </label>
                <input
                  type="number"
                  value={formData.maxUsage}
                  onChange={(e) => setFormData({ ...formData, maxUsage: e.target.value })}
                  placeholder="100"
                  className={`w-full px-3 py-2 rounded-lg text-sm ${isDark ? 'bg-neutral-800 border border-neutral-700 text-white' : 'bg-white border border-neutral-300 text-neutral-900'}`}
                />
              </div>

              {/* Expires At */}
              <div>
                <label className={`text-xs mb-1 block ${isDark ? 'text-neutral-500' : 'text-neutral-600'}`}>
                  Expires At * (max 30 days from today)
                </label>
                <input
                  type="date"
                  value={formData.expiresAt}
                  onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                  required
                  className={`w-full px-3 py-2 rounded-lg text-sm ${isDark ? 'bg-neutral-800 border border-neutral-700 text-white' : 'bg-white border border-neutral-300 text-neutral-900'}`}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-2.5 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white text-sm font-bold rounded-lg transition-colors"
              >
                {saving ? 'Creating...' : 'Create Code'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 py-2.5 bg-neutral-700 hover:bg-neutral-600 text-white text-sm font-bold rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Codes List */}
      {loading ? (
        <p className={`text-sm ${isDark ? 'text-neutral-500' : 'text-neutral-600'}`}>Loading codes...</p>
      ) : promoCodes.length === 0 ? (
        <div className={`text-center py-8 rounded-lg ${isDark ? 'bg-neutral-800' : 'bg-neutral-50'}`}>
          <p className={`text-sm ${isDark ? 'text-neutral-500' : 'text-neutral-600'}`}>
            No promo codes yet. Create one to get started! 🚀
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {promoCodes.map((code) => (
            <div
              key={code.id}
              className={`rounded-lg p-4 flex items-center justify-between ${
                code.isExpired
                  ? isDark
                    ? 'bg-red-500/10 border border-red-500/20'
                    : 'bg-red-50 border border-red-200'
                  : isDark
                  ? 'bg-neutral-800 border border-neutral-700'
                  : 'bg-neutral-50 border border-neutral-300'
              }`}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`font-mono font-bold text-lg ${isDark ? 'text-white' : 'text-neutral-900'}`}>
                    {code.code}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    code.type === 'PERCENTAGE'
                      ? isDark ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-700'
                      : code.type === 'FIXED_AMOUNT'
                      ? isDark ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-700'
                      : isDark ? 'bg-orange-900 text-orange-200' : 'bg-orange-100 text-orange-700'
                  }`}>
                    {code.value}{getTypeLabel(code.type)}
                  </span>
                  {code.isExpired && (
                    <span className="px-2 py-1 rounded text-xs font-bold bg-red-600 text-white">
                      EXPIRED
                    </span>
                  )}
                  {!code.isActive && (
                    <span className="px-2 py-1 rounded text-xs font-bold bg-neutral-600 text-white">
                      INACTIVE
                    </span>
                  )}
                </div>

                <p className={`text-xs ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>
                  {code.minNights && `Min ${code.minNights} nights • `}
                  Used {code.usageCount}/{code.maxUsage || '∞'} •
                  {code.daysLeft! > 0 ? ` ${code.daysLeft} days left` : ' Expired'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleActive(code.id, code.isActive)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    code.isActive
                      ? isDark
                        ? 'bg-green-600 hover:bg-green-500 text-white'
                        : 'bg-green-500 hover:bg-green-600 text-white'
                      : isDark
                      ? 'bg-neutral-700 hover:bg-neutral-600 text-neutral-300'
                      : 'bg-neutral-300 hover:bg-neutral-400 text-neutral-700'
                  }`}
                >
                  {code.isActive ? 'Active' : 'Inactive'}
                </button>

                <button
                  onClick={() => handleDeleteCode(code.id, code.code)}
                  className="px-2 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-colors"
                >
                  {/* @ts-ignore */}
                  <Icon icon="ph:trash-bold" width={14} height={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
