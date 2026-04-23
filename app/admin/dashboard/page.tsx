'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '../../../components/ui/Icon';
import PageViewsAnalytics from '../../../components/admin/PageViewsAnalytics';
import CameraCapture from '../../../components/admin/CameraCapture';
import PromoCodesPanel from '../../../components/admin/PromoCodesPanel';
import DocumentsTab from '../../../components/admin/DocumentsTab';
import FinanceDashboard from '../../../components/admin/FinanceDashboard';
import BookingCalendar from '../../../components/admin/BookingCalendar';
import RealTimeKPI from '../../../components/admin/RealTimeKPI';
import ConversionFunnel from '../../../components/admin/ConversionFunnel';
import ContentAnalytics from '../../../components/admin/ContentAnalytics';
import AIAdvisor from '../../../components/admin/AIAdvisor';

// ─── Types ────────────────────────────────────────────────────────────────────

type Booking = {
  id: string;
  reference: string;
  status: string;
  pickupDate: string;
  returnDate: string;
  pickupLocation: string;
  pickupAddress?: string;
  totalPrice: number;
  depositPaid: boolean;
  createdAt: string;
  vehicle: { brand: string; model: string; engine: string };
  customer: { firstName: string; lastName: string; email: string; phone: string; nationality?: string };
  payment: { method: string; status: string } | null;
  fleetUnit?: { id: string; unitNumber: string; licensePlate: string };
};

type Vehicle = {
  id: string;
  brand: string;
  model: string;
  engine: string;
  type: string;
  dailyRate: number;
  weeklyRate: number;
  monthlyRate: number;
  topCase: boolean;
  visible: boolean;
  description?: string;
  fleetUnits?: FleetUnit[];
};

type FleetUnit = {
  id: string;
  vehicleId: string;
  unitNumber: string;
  licensePlate: string;
  status: string;
  currentKilometers: number;
  lastMaintenanceDate?: string;
  maintenanceKilometers?: number;
  orCrDocumentUrl?: string;
  orCrExpiry?: string;
  ltRegistrationExpiry?: string;
  insuranceExpiry?: string;
  vehicle?: { brand: string; model: string };
};

type BlockedDate = {
  id: string;
  vehicleId: string;
  date: string;
  reason?: string;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  pending:   { bg: 'bg-yellow-500/15', text: 'text-yellow-400', label: 'Pending' },
  confirmed: { bg: 'bg-blue-500/15',   text: 'text-blue-400',   label: 'Confirmed' },
  active:    { bg: 'bg-green-500/15',  text: 'text-green-400',  label: 'Active' },
  returned:  { bg: 'bg-neutral-500/15',text: 'text-neutral-400',label: 'Returned' },
  cancelled: { bg: 'bg-red-500/15',    text: 'text-red-400',    label: 'Cancelled' },
};

const PAYMENT_LABELS: Record<string, string> = {
  cash_on_delivery: 'Cash',
  gcash: 'GCash',
  maya: 'Maya',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function fmtDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function days(a: string, b: string) {
  return Math.ceil((new Date(b).getTime() - new Date(a).getTime()) / 86400000);
}

function daysUntilExpiry(expiryDate: string | undefined): number | null {
  if (!expiryDate) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);
  return Math.ceil((expiry.getTime() - today.getTime()) / 86400000);
}

function isDocumentExpiringSoon(expiryDate: string | undefined, daysThreshold: number = 30): boolean {
  const daysLeft = daysUntilExpiry(expiryDate);
  return daysLeft !== null && daysLeft <= daysThreshold && daysLeft >= 0;
}

function isDocumentExpired(expiryDate: string | undefined): boolean {
  const daysLeft = daysUntilExpiry(expiryDate);
  return daysLeft !== null && daysLeft < 0;
}

function toInputDate(d: Date) {
  return d.toISOString().split('T')[0];
}

// ─── Block Dates Panel ────────────────────────────────────────────────────────

function BlockDatesPanel({
  vehicle,
  onClose,
  isDark,
}: {
  vehicle: Vehicle;
  onClose: () => void;
  isDark: boolean;
}) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('maintenance');
  const [blocked, setBlocked] = useState<BlockedDate[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const today = toInputDate(new Date());

  useEffect(() => {
    fetchBlocked();
  }, [vehicle.id]);

  const fetchBlocked = async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/blocked-dates?vehicleId=${vehicle.id}`);
    setBlocked(await res.json());
    setLoading(false);
  };

  const handleBlock = async () => {
    setSaving(true);
    await fetch('/api/admin/blocked-dates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vehicleId: vehicle.id, startDate, endDate, reason }),
    });
    setStartDate('');
    setEndDate('');
    setReason('maintenance');
    fetchBlocked();
    setSaving(false);
  };

  const handleUnblock = async (date: string) => {
    await fetch('/api/admin/blocked-dates', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vehicleId: vehicle.id, startDate: date, endDate: date }),
    });
    fetchBlocked();
  };

  const groupedRanges = blocked.reduce<{ start: string; end: string; reason?: string }[]>((acc, b) => {
    const last = acc[acc.length - 1];
    const d = new Date(b.date);
    if (last) {
      const prevEnd = new Date(last.end);
      prevEnd.setDate(prevEnd.getDate() + 1);
      if (prevEnd.toISOString().split('T')[0] === d.toISOString().split('T')[0] && last.reason === b.reason) {
        last.end = b.date;
        return acc;
      }
    }
    acc.push({ start: b.date, end: b.date, reason: b.reason });
    return acc;
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className={`relative w-full max-w-sm ${isDark ? 'bg-neutral-900 border-l border-neutral-800' : 'bg-white border-l border-neutral-200'} h-full overflow-y-auto shadow-2xl`}>
        <div className={`flex items-center justify-between px-6 py-4 border-b ${isDark ? 'border-neutral-800 bg-neutral-900' : 'border-neutral-200 bg-white'} sticky top-0 z-10`}>
          <div>
            <p className="text-xs text-primary-400 font-bold uppercase tracking-wider">Block dates</p>
            <p className={`font-bold ${isDark ? 'text-white' : 'text-neutral-900'}`}>{vehicle.brand} {vehicle.model}</p>
          </div>
          <button onClick={onClose} className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-neutral-800 text-neutral-400' : 'hover:bg-neutral-100 text-neutral-600'}`}>
            {/* @ts-ignore */}
            <Icon icon="ph:x-bold" width={18} height={18} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <p className={`text-xs font-bold uppercase tracking-wider mb-3 ${isDark ? 'text-neutral-500' : 'text-neutral-600'}`}>Add blocked period</p>
            <div className="space-y-3">
              <div>
                <label className={`text-xs mb-1 block ${isDark ? 'text-neutral-500' : 'text-neutral-600'}`}>From</label>
                <input
                  type="date"
                  value={startDate}
                  min={today}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={`w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary-500 ${isDark ? 'bg-neutral-800 border border-neutral-700 text-white' : 'bg-neutral-50 border border-neutral-300 text-neutral-900'}`}
                />
              </div>
              <div>
                <label className={`text-xs mb-1 block ${isDark ? 'text-neutral-500' : 'text-neutral-600'}`}>To</label>
                <input
                  type="date"
                  value={endDate}
                  min={startDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className={`w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary-500 ${isDark ? 'bg-neutral-800 border border-neutral-700 text-white' : 'bg-neutral-50 border border-neutral-300 text-neutral-900'}`}
                />
              </div>
              <div>
                <label className={`text-xs mb-1 block ${isDark ? 'text-neutral-500' : 'text-neutral-600'}`}>Reason</label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className={`w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary-500 ${isDark ? 'bg-neutral-800 border border-neutral-700 text-white' : 'bg-neutral-50 border border-neutral-300 text-neutral-900'}`}
                >
                  <option value="maintenance">Maintenance</option>
                  <option value="reserved">Reserved / private use</option>
                  <option value="repair">Repair</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <button
                onClick={handleBlock}
                disabled={saving || !startDate || !endDate || endDate < startDate}
                className="w-full py-3 bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white text-sm font-bold rounded-xl transition-colors"
              >
                {saving ? 'Blocking…' : 'Block these dates'}
              </button>
            </div>
          </div>

          <div>
            <p className={`text-xs font-bold uppercase tracking-wider mb-3 ${isDark ? 'text-neutral-500' : 'text-neutral-600'}`}>Currently blocked</p>
            {loading ? (
              <p className={`text-sm ${isDark ? 'text-neutral-600' : 'text-neutral-500'}`}>Loading…</p>
            ) : groupedRanges.length === 0 ? (
              <p className={`text-sm ${isDark ? 'text-neutral-600' : 'text-neutral-500'}`}>No dates blocked.</p>
            ) : (
              <div className="space-y-2">
                {groupedRanges.map((r, i) => (
                  <div key={i} className={`flex items-center justify-between rounded-xl px-4 py-3 ${isDark ? 'bg-neutral-800' : 'bg-neutral-50'}`}>
                    <div>
                      <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-neutral-900'}`}>
                        {fmtDate(r.start)}{r.start !== r.end ? ` → ${fmtDate(r.end)}` : ''}
                      </p>
                      <p className={`text-xs capitalize ${isDark ? 'text-neutral-500' : 'text-neutral-600'}`}>{r.reason ?? 'maintenance'}</p>
                    </div>
                    <button
                      onClick={() => {
                        const dates = blocked.filter((b) => b.date >= r.start && b.date <= r.end);
                        dates.forEach((b) => handleUnblock(b.date));
                      }}
                      className="p-1.5 rounded-lg bg-red-500/15 hover:bg-red-500/30 text-red-400 transition-colors"
                    >
                      {/* @ts-ignore */}
                      <Icon icon="ph:trash-bold" width={14} height={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Vehicles Tab Content ─────────────────────────────────────────────────────

function VehiclesTab({
  vehicles,
  loading,
  onRefresh,
  isDark,
}: {
  vehicles: Vehicle[];
  loading: boolean;
  onRefresh: () => void;
  isDark: boolean;
}) {
  const [showNewForm, setShowNewForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchVehicles, setSearchVehicles] = useState('');
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    engine: '',
    type: 'Automatic',
    dailyRate: '',
    weeklyRate: '',
    monthlyRate: '',
    topCase: false,
    description: '',
  });
  const [saving, setSaving] = useState(false);

  const handleCreate = async () => {
    setSaving(true);
    const res = await fetch('/api/admin/vehicles-model', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    if (res.ok) {
      setFormData({ brand: '', model: '', engine: '', type: 'Automatic', dailyRate: '', weeklyRate: '', monthlyRate: '', topCase: false, description: '' });
      setShowNewForm(false);
      onRefresh();
    }
    setSaving(false);
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    setSaving(true);
    const res = await fetch(`/api/admin/vehicles-model/${editingId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    if (res.ok) {
      setEditingId(null);
      setFormData({ brand: '', model: '', engine: '', type: 'Automatic', dailyRate: '', weeklyRate: '', monthlyRate: '', topCase: false, description: '' });
      onRefresh();
    }
    setSaving(false);
  };

  const handleEdit = (v: Vehicle) => {
    setEditingId(v.id);
    setFormData({
      brand: v.brand,
      model: v.model,
      engine: v.engine,
      type: v.type,
      dailyRate: String(v.dailyRate),
      weeklyRate: String(v.weeklyRate),
      monthlyRate: String(v.monthlyRate),
      topCase: v.topCase,
      description: v.description || '',
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this vehicle model? All fleet units will be deleted.')) return;
    const res = await fetch(`/api/admin/vehicles-model/${id}`, { method: 'DELETE' });
    if (res.ok) onRefresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-neutral-900'}`}>Vehicle Models</h3>
          <p className={`text-sm mt-1 ${isDark ? 'text-neutral-500' : 'text-neutral-600'}`}>Manage the 8 scooter models in your catalog</p>
        </div>
        <button
          onClick={() => setShowNewForm(!showNewForm)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white text-sm font-bold rounded-xl transition-colors"
        >
          {/* @ts-ignore */}
          <Icon icon="ph:plus-bold" width={16} height={16} />
          New Model
        </button>
      </div>

      {/* Search Bar */}
      <input
        type="text"
        placeholder="🔍 Search vehicles... (brand, model, engine)"
        value={searchVehicles}
        onChange={(e) => setSearchVehicles(e.target.value.toLowerCase())}
        className={`w-full rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary-500 ${isDark ? 'bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500' : 'bg-white border border-neutral-300 text-neutral-900 placeholder-neutral-500'}`}
      />

      {showNewForm && (
        <div className={`${isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-neutral-50 border-neutral-200'} border rounded-2xl p-6`}>
          <p className={`text-xs font-bold uppercase tracking-wider mb-4 ${isDark ? 'text-neutral-500' : 'text-neutral-600'}`}>Add new vehicle model</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Brand (e.g., Honda)"
              value={formData.brand}
              onChange={(e) => setFormData({...formData, brand: e.target.value})}
              className={`rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary-500 ${isDark ? 'bg-neutral-800 border border-neutral-700 text-white' : 'bg-white border border-neutral-300 text-neutral-900'}`}
            />
            <input
              type="text"
              placeholder="Model (e.g., Click 125)"
              value={formData.model}
              onChange={(e) => setFormData({...formData, model: e.target.value})}
              className={`rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary-500 ${isDark ? 'bg-neutral-800 border border-neutral-700 text-white' : 'bg-white border border-neutral-300 text-neutral-900'}`}
            />
            <input
              type="text"
              placeholder="Engine (e.g., 125cc)"
              value={formData.engine}
              onChange={(e) => setFormData({...formData, engine: e.target.value})}
              className={`rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary-500 ${isDark ? 'bg-neutral-800 border border-neutral-700 text-white' : 'bg-white border border-neutral-300 text-neutral-900'}`}
            />
            <select
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value})}
              className={`rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary-500 ${isDark ? 'bg-neutral-800 border border-neutral-700 text-white' : 'bg-white border border-neutral-300 text-neutral-900'}`}
            >
              <option value="Automatic">Automatic</option>
              <option value="Manual">Manual</option>
            </select>
            <input
              type="number"
              placeholder="Daily rate (₱)"
              value={formData.dailyRate}
              onChange={(e) => setFormData({...formData, dailyRate: e.target.value})}
              className={`rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary-500 ${isDark ? 'bg-neutral-800 border border-neutral-700 text-white' : 'bg-white border border-neutral-300 text-neutral-900'}`}
            />
            <input
              type="number"
              placeholder="Weekly rate (₱)"
              value={formData.weeklyRate}
              onChange={(e) => setFormData({...formData, weeklyRate: e.target.value})}
              className={`rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary-500 ${isDark ? 'bg-neutral-800 border border-neutral-700 text-white' : 'bg-white border border-neutral-300 text-neutral-900'}`}
            />
            <input
              type="number"
              placeholder="Monthly rate (₱)"
              value={formData.monthlyRate}
              onChange={(e) => setFormData({...formData, monthlyRate: e.target.value})}
              className={`rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary-500 ${isDark ? 'bg-neutral-800 border border-neutral-700 text-white' : 'bg-white border border-neutral-300 text-neutral-900'}`}
            />
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.topCase}
                onChange={(e) => setFormData({...formData, topCase: e.target.checked})}
                className={`w-4 h-4 rounded ${isDark ? 'bg-neutral-800 border border-neutral-700' : 'bg-white border border-neutral-300'}`}
              />
              <span className={`text-sm ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>Has top case</span>
            </label>
          </div>
          <textarea
            placeholder="Description"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            className={`w-full mt-4 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary-500 ${isDark ? 'bg-neutral-800 border border-neutral-700 text-white' : 'bg-white border border-neutral-300 text-neutral-900'}`}
            rows={3}
          />
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleCreate}
              disabled={saving || !formData.brand || !formData.model || !formData.engine || !formData.dailyRate}
              className="px-6 py-2.5 bg-primary-500 hover:bg-primary-600 disabled:opacity-40 text-white text-sm font-bold rounded-xl transition-colors"
            >
              {saving ? 'Creating…' : 'Create Model'}
            </button>
            <button
              onClick={() => setShowNewForm(false)}
              className={`px-6 py-2.5 text-sm font-bold rounded-xl transition-colors ${isDark ? 'bg-neutral-800 hover:bg-neutral-700 text-white' : 'bg-neutral-200 hover:bg-neutral-300 text-neutral-900'}`}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className={`py-12 text-center ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`}>Loading vehicles…</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {vehicles
            .filter(v =>
              !searchVehicles ||
              v.brand.toLowerCase().includes(searchVehicles) ||
              v.model.toLowerCase().includes(searchVehicles) ||
              v.engine.toLowerCase().includes(searchVehicles)
            )
            .map((v) => (
            editingId === v.id ? (
              <div key={v.id} className={`border border-primary-500 rounded-2xl p-6 ${isDark ? 'bg-neutral-900' : 'bg-neutral-50'}`}>
                <p className="text-xs font-bold text-primary-400 uppercase tracking-wider mb-4">Editing {v.brand} {v.model}</p>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className={`text-xs font-semibold mb-1 block ${isDark ? 'text-neutral-500' : 'text-neutral-600'}`}>Brand</label>
                      <input
                        type="text"
                        value={formData.brand}
                        onChange={(e) => setFormData({...formData, brand: e.target.value})}
                        className={`w-full rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-500 ${isDark ? 'bg-neutral-800 border border-neutral-700 text-white' : 'bg-white border border-neutral-300 text-neutral-900'}`}
                      />
                    </div>
                    <div>
                      <label className={`text-xs font-semibold mb-1 block ${isDark ? 'text-neutral-500' : 'text-neutral-600'}`}>Model</label>
                      <input
                        type="text"
                        value={formData.model}
                        onChange={(e) => setFormData({...formData, model: e.target.value})}
                        className={`w-full rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-500 ${isDark ? 'bg-neutral-800 border border-neutral-700 text-white' : 'bg-white border border-neutral-300 text-neutral-900'}`}
                      />
                    </div>
                  </div>
                  <div>
                    <label className={`text-xs font-semibold mb-1 block ${isDark ? 'text-neutral-500' : 'text-neutral-600'}`}>Engine</label>
                    <input
                      type="text"
                      value={formData.engine}
                      onChange={(e) => setFormData({...formData, engine: e.target.value})}
                      className={`w-full rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-500 ${isDark ? 'bg-neutral-800 border border-neutral-700 text-white' : 'bg-white border border-neutral-300 text-neutral-900'}`}
                    />
                  </div>
                  <div>
                    <label className={`text-xs font-semibold mb-1 block ${isDark ? 'text-neutral-500' : 'text-neutral-600'}`}>Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value})}
                      className={`w-full rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-500 ${isDark ? 'bg-neutral-800 border border-neutral-700 text-white' : 'bg-white border border-neutral-300 text-neutral-900'}`}
                    >
                      <option value="Automatic">Automatic</option>
                      <option value="Manual">Manual</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className={`text-xs font-semibold mb-1 block ${isDark ? 'text-neutral-500' : 'text-neutral-600'}`}>Daily (₱)</label>
                      <input
                        type="number"
                        value={formData.dailyRate}
                        onChange={(e) => setFormData({...formData, dailyRate: e.target.value})}
                        className={`w-full rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-500 ${isDark ? 'bg-neutral-800 border border-neutral-700 text-white' : 'bg-white border border-neutral-300 text-neutral-900'}`}
                      />
                    </div>
                    <div>
                      <label className={`text-xs font-semibold mb-1 block ${isDark ? 'text-neutral-500' : 'text-neutral-600'}`}>Weekly (₱)</label>
                      <input
                        type="number"
                        value={formData.weeklyRate}
                        onChange={(e) => setFormData({...formData, weeklyRate: e.target.value})}
                        className={`w-full rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-500 ${isDark ? 'bg-neutral-800 border border-neutral-700 text-white' : 'bg-white border border-neutral-300 text-neutral-900'}`}
                      />
                    </div>
                    <div>
                      <label className={`text-xs font-semibold mb-1 block ${isDark ? 'text-neutral-500' : 'text-neutral-600'}`}>Monthly (₱)</label>
                      <input
                        type="number"
                        value={formData.monthlyRate}
                        onChange={(e) => setFormData({...formData, monthlyRate: e.target.value})}
                        className={`w-full rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-500 ${isDark ? 'bg-neutral-800 border border-neutral-700 text-white' : 'bg-white border border-neutral-300 text-neutral-900'}`}
                      />
                    </div>
                  </div>
                  <div>
                    <label className={`text-xs font-semibold mb-1 block ${isDark ? 'text-neutral-500' : 'text-neutral-600'}`}>Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className={`w-full rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-500 ${isDark ? 'bg-neutral-800 border border-neutral-700 text-white' : 'bg-white border border-neutral-300 text-neutral-900'}`}
                      rows={2}
                    />
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.topCase}
                      onChange={(e) => setFormData({...formData, topCase: e.target.checked})}
                      className={`w-4 h-4 rounded ${isDark ? 'bg-neutral-800 border border-neutral-700' : 'bg-white border border-neutral-300'}`}
                    />
                    <span className={`text-xs ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>Has top case</span>
                  </label>
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={handleSaveEdit}
                      disabled={saving}
                      className="flex-1 px-3 py-2 bg-primary-500 hover:bg-primary-600 disabled:opacity-40 text-white text-sm font-bold rounded-lg transition-colors"
                    >
                      {saving ? 'Saving…' : 'Save'}
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className={`flex-1 px-3 py-2 text-sm font-bold rounded-lg transition-colors ${isDark ? 'bg-neutral-800 hover:bg-neutral-700 text-white' : 'bg-neutral-200 hover:bg-neutral-300 text-neutral-900'}`}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div key={v.id} className={`border rounded-2xl p-6 transition-colors ${isDark ? 'bg-neutral-900 border-neutral-800 hover:border-neutral-600' : 'bg-neutral-50 border-neutral-200 hover:border-neutral-400'}`}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm font-bold text-primary-400">{v.brand}</p>
                    <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-neutral-900'}`}>{v.model}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(v)}
                      className="p-2 rounded-lg bg-blue-500/15 hover:bg-blue-500/30 text-blue-400 transition-colors"
                      title="Edit"
                    >
                      {/* @ts-ignore */}
                      <Icon icon="ph:pencil-bold" width={14} height={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(v.id)}
                      className="p-2 rounded-lg bg-red-500/15 hover:bg-red-500/30 text-red-400 transition-colors"
                      title="Delete"
                    >
                      {/* @ts-ignore */}
                      <Icon icon="ph:trash-bold" width={14} height={14} />
                    </button>
                  </div>
                </div>
                <div className={`space-y-2 text-sm ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>
                  <p>{v.engine} · {v.type}</p>
                  <p className="flex justify-between">
                    <span>Daily:</span>
                    <span className={`font-semibold ${isDark ? 'text-white' : 'text-neutral-900'}`}>₱{v.dailyRate.toLocaleString()}</span>
                  </p>
                  <p className="flex justify-between">
                    <span>Weekly:</span>
                    <span className={`font-semibold ${isDark ? 'text-white' : 'text-neutral-900'}`}>₱{v.weeklyRate.toLocaleString()}</span>
                  </p>
                  <p className="flex justify-between">
                    <span>Monthly:</span>
                    <span className={`font-semibold ${isDark ? 'text-white' : 'text-neutral-900'}`}>₱{v.monthlyRate.toLocaleString()}</span>
                  </p>
                  {v.topCase && <p className="text-green-400">✓ Has top case</p>}
                </div>
                <p className={`text-xs mt-3 font-mono ${isDark ? 'text-neutral-500' : 'text-neutral-600'}`}>{v.id}</p>
              </div>
            )
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Fleet Units Tab Content ──────────────────────────────────────────────────

function FleetTab({
  vehicles,
  bookings,
  loading,
  onRefresh,
  isDark,
}: {
  vehicles: Vehicle[];
  bookings: Booking[];
  loading: boolean;
  onRefresh: () => void;
  isDark: boolean;
}) {
  const [expandedVehicleId, setExpandedVehicleId] = useState<string | null>(null);
  const [editingUnit, setEditingUnit] = useState<FleetUnit | null>(null);
  const [editForm, setEditForm] = useState({ vehicleId: '', unitNumber: '', licensePlate: '', status: '', currentKilometers: '', lastMaintenanceDate: '', maintenanceKilometers: '', orCrExpiry: '', ltRegistrationExpiry: '', insuranceExpiry: '' });
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({ vehicleId: '', unitNumber: '', licensePlate: '', maintenanceKilometers: '', lastMaintenanceDate: '', orCrExpiry: '', ltRegistrationExpiry: '', insuranceExpiry: '' });
  const [savingUnit, setSavingUnit] = useState(false);
  const [deletingUnitId, setDeletingUnitId] = useState<string | null>(null);
  const [damageLogs, setDamageLogs] = useState<any[]>([]);
  const [loadingDamageLogs, setLoadingDamageLogs] = useState(false);
  const [viewingDamageLogs, setViewingDamageLogs] = useState<string | null>(null);
  const [creatingDamageLog, setCreatingDamageLog] = useState<string | null>(null);
  const [newDamageLogData, setNewDamageLogData] = useState({ damageType: 'scratch', location: '', description: '', severity: 'minor' });
  const [searchFleet, setSearchFleet] = useState('');

  // Helper to find if a unit is booked
  const getBookingForUnit = (unitId: string) => {
    return bookings.find(b => b.fleetUnit?.id === unitId && !['returned', 'cancelled'].includes(b.status));
  };

  const handleSaveUnit = async () => {
    if (!editingUnit) return;
    setSavingUnit(true);
    const res = await fetch(`/api/admin/fleet-units/${editingUnit.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        vehicleId: editForm.vehicleId || editingUnit.vehicleId,
        unitNumber: editForm.unitNumber || editingUnit.unitNumber,
        licensePlate: editForm.licensePlate || editingUnit.licensePlate,
        status: editForm.status || editingUnit.status,
        currentKilometers: editForm.currentKilometers ? parseInt(editForm.currentKilometers) : editingUnit.currentKilometers,
        lastMaintenanceDate: editForm.lastMaintenanceDate || null,
        maintenanceKilometers: editForm.maintenanceKilometers ? parseInt(editForm.maintenanceKilometers) : editingUnit.maintenanceKilometers || null,
        orCrExpiry: editForm.orCrExpiry || null,
        ltRegistrationExpiry: editForm.ltRegistrationExpiry || null,
        insuranceExpiry: editForm.insuranceExpiry || null,
      }),
    });
    if (res.ok) {
      setEditingUnit(null);
      setSavingUnit(false);
      onRefresh();
    } else {
      const err = await res.json();
      alert(err.error || 'Failed to save unit');
      setSavingUnit(false);
    }
  };

  const handleDeleteUnit = async (unitId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette unité? Cette action est irréversible.')) return;
    setDeletingUnitId(unitId);
    const res = await fetch(`/api/admin/fleet-units/${unitId}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      setDeletingUnitId(null);
      onRefresh();
    } else {
      alert('Failed to delete unit');
      setDeletingUnitId(null);
    }
  };

  const fetchDamageLogs = async (fleetUnitId: string) => {
    setLoadingDamageLogs(true);
    const res = await fetch(`/api/admin/damage-logs?fleetUnitId=${fleetUnitId}`);
    const data = await res.json();
    setDamageLogs(data.damageLogs || []);
    setLoadingDamageLogs(false);
  };

  const createNewDamageLog = async (fleetUnitId: string) => {
    const res = await fetch('/api/admin/damage-logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fleetUnitId,
        damageType: newDamageLogData.damageType,
        location: newDamageLogData.location,
        description: newDamageLogData.description,
        severity: newDamageLogData.severity,
        reportedDate: new Date().toISOString().split('T')[0],
      }),
    });

    if (res.ok) {
      const created = await res.json();
      setCreatingDamageLog(created.id);
      setNewDamageLogData({ damageType: 'scratch', location: '', description: '', severity: 'minor' });
    }
  };

  const handleAddUnit = async () => {
    if (!addForm.vehicleId || !addForm.unitNumber || !addForm.licensePlate) {
      alert('Please fill in all required fields');
      return;
    }
    setSavingUnit(true);
    const res = await fetch('/api/admin/fleet-units', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        vehicleId: addForm.vehicleId,
        unitNumber: addForm.unitNumber,
        licensePlate: addForm.licensePlate,
        maintenanceKilometers: addForm.maintenanceKilometers ? parseInt(addForm.maintenanceKilometers) : null,
        lastMaintenanceDate: addForm.lastMaintenanceDate || null,
        orCrExpiry: addForm.orCrExpiry || null,
        ltRegistrationExpiry: addForm.ltRegistrationExpiry || null,
        insuranceExpiry: addForm.insuranceExpiry || null,
      }),
    });
    if (res.ok) {
      setAddForm({ vehicleId: '', unitNumber: '', licensePlate: '', maintenanceKilometers: '', lastMaintenanceDate: '', orCrExpiry: '', ltRegistrationExpiry: '', insuranceExpiry: '' });
      setShowAddForm(false);
      onRefresh();
    } else {
      const err = await res.json();
      alert(err.error || 'Failed to add unit');
    }
    setSavingUnit(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-neutral-900'}`}>Fleet Units & Maintenance</h3>
          <p className={`text-sm mt-1 ${isDark ? 'text-neutral-500' : 'text-neutral-600'}`}>Track individual scooters, kilometers, and maintenance history</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white text-sm font-bold rounded-xl transition-colors"
        >
          {/* @ts-ignore */}
          <Icon icon="ph:plus-bold" width={16} height={16} />
          Add Unit
        </button>
      </div>

      {/* Search Bar */}
      <div>
        <input
          type="text"
          placeholder="🔍 Search fleet units... (unitNumber, plate, vehicle)"
          value={searchFleet}
          onChange={(e) => setSearchFleet(e.target.value.toLowerCase())}
          className={`w-full rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary-500 ${isDark ? 'bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500' : 'bg-white border border-neutral-300 text-neutral-900 placeholder-neutral-500'}`}
        />
      </div>

      {/* Documents Expiring Soon Alert */}
      {(() => {
        const expiringDocs: { unit: FleetUnit; docs: { type: string; days: number }[] }[] = [];
        vehicles.forEach((v) => {
          v.fleetUnits?.forEach((u) => {
            const docs: { type: string; days: number }[] = [];
            const orCrDays = daysUntilExpiry(u.orCrExpiry);
            const ltDays = daysUntilExpiry(u.ltRegistrationExpiry);
            const insDays = daysUntilExpiry(u.insuranceExpiry);

            if (orCrDays !== null && orCrDays <= 30) docs.push({ type: 'OR/CR', days: orCrDays });
            if (ltDays !== null && ltDays <= 30) docs.push({ type: 'LTO', days: ltDays });
            if (insDays !== null && insDays <= 30) docs.push({ type: 'Insurance', days: insDays });

            if (docs.length > 0) expiringDocs.push({ unit: u, docs });
          });
        });

        return expiringDocs.length > 0 ? (
          <div className="bg-red-500/15 border border-red-500/30 rounded-2xl p-4 space-y-2">
            <p className="text-sm font-bold text-red-400">🚨 DOCUMENTS EXPIRING SOON</p>
            {expiringDocs.map(({ unit, docs }) => (
              <p key={unit.id} className="text-xs text-red-400">
                <span className="font-semibold">{unit.unitNumber}</span> ({unit.licensePlate}): {docs.map((d) => `${d.type} in ${d.days} days`).join(', ')}
              </p>
            ))}
          </div>
        ) : null;
      })()}

      {showAddForm && (
        <div className={`${isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-neutral-50 border-neutral-200'} border rounded-2xl p-6`}>
          <p className={`text-xs font-bold uppercase tracking-wider mb-4 ${isDark ? 'text-neutral-500' : 'text-neutral-600'}`}>Add new fleet unit</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={`text-xs mb-1 block ${isDark ? 'text-neutral-500' : 'text-neutral-600'}`}>Vehicle Model *</label>
              <select
                value={addForm.vehicleId}
                onChange={(e) => setAddForm({...addForm, vehicleId: e.target.value})}
                className={`w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary-500 ${isDark ? 'bg-neutral-800 border border-neutral-700 text-white' : 'bg-white border border-neutral-300 text-neutral-900'}`}
              >
                <option value="">Select a model</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>{v.brand} {v.model} ({v.engine})</option>
                ))}
              </select>
            </div>
            <div>
              <label className={`text-xs mb-1 block ${isDark ? 'text-neutral-500' : 'text-neutral-600'}`}>Unit Number *</label>
              <input
                type="text"
                placeholder="e.g., KJM-033"
                value={addForm.unitNumber}
                onChange={(e) => setAddForm({...addForm, unitNumber: e.target.value})}
                className={`w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary-500 ${isDark ? 'bg-neutral-800 border border-neutral-700 text-white' : 'bg-white border border-neutral-300 text-neutral-900'}`}
              />
            </div>
            <div>
              <label className={`text-xs mb-1 block ${isDark ? 'text-neutral-500' : 'text-neutral-600'}`}>License Plate *</label>
              <input
                type="text"
                placeholder="e.g., PL-0033"
                value={addForm.licensePlate}
                onChange={(e) => setAddForm({...addForm, licensePlate: e.target.value})}
                className={`w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary-500 ${isDark ? 'bg-neutral-800 border border-neutral-700 text-white' : 'bg-white border border-neutral-300 text-neutral-900'}`}
              />
            </div>
            <div>
              <label className={`text-xs mb-1 block ${isDark ? 'text-neutral-500' : 'text-neutral-600'}`}>Maintenance Km Threshold</label>
              <input
                type="number"
                placeholder="e.g., 5000"
                value={addForm.maintenanceKilometers}
                onChange={(e) => setAddForm({...addForm, maintenanceKilometers: e.target.value})}
                className={`w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary-500 ${isDark ? 'bg-neutral-800 border border-neutral-700 text-white' : 'bg-white border border-neutral-300 text-neutral-900'}`}
              />
            </div>
            <div>
              <label className={`text-xs mb-1 block ${isDark ? 'text-neutral-500' : 'text-neutral-600'}`}>Last Maintenance Date</label>
              <input
                type="date"
                value={addForm.lastMaintenanceDate}
                onChange={(e) => setAddForm({...addForm, lastMaintenanceDate: e.target.value})}
                className={`w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary-500 ${isDark ? 'bg-neutral-800 border border-neutral-700 text-white' : 'bg-white border border-neutral-300 text-neutral-900'}`}
              />
            </div>
          </div>
          <div className={`border-t pt-4 mt-4 ${isDark ? 'border-neutral-800' : 'border-neutral-200'}`}>
            <p className={`text-xs font-bold mb-3 ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>📄 LEGAL DOCUMENTS (Philippines)</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={`text-xs mb-1 block ${isDark ? 'text-neutral-500' : 'text-neutral-600'}`}>OR/CR Expiry Date</label>
                <input
                  type="date"
                  value={addForm.orCrExpiry}
                  onChange={(e) => setAddForm({...addForm, orCrExpiry: e.target.value})}
                  className={`w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary-500 ${isDark ? 'bg-neutral-800 border border-neutral-700 text-white' : 'bg-white border border-neutral-300 text-neutral-900'}`}
                />
              </div>
              <div>
                <label className={`text-xs mb-1 block ${isDark ? 'text-neutral-500' : 'text-neutral-600'}`}>LTO Registration Expiry</label>
                <input
                  type="date"
                  value={addForm.ltRegistrationExpiry}
                  onChange={(e) => setAddForm({...addForm, ltRegistrationExpiry: e.target.value})}
                  className={`w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary-500 ${isDark ? 'bg-neutral-800 border border-neutral-700 text-white' : 'bg-white border border-neutral-300 text-neutral-900'}`}
                />
              </div>
              <div>
                <label className={`text-xs mb-1 block ${isDark ? 'text-neutral-500' : 'text-neutral-600'}`}>Insurance Expiry Date</label>
                <input
                  type="date"
                  value={addForm.insuranceExpiry}
                  onChange={(e) => setAddForm({...addForm, insuranceExpiry: e.target.value})}
                  className={`w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary-500 ${isDark ? 'bg-neutral-800 border border-neutral-700 text-white' : 'bg-white border border-neutral-300 text-neutral-900'}`}
                />
              </div>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleAddUnit}
              disabled={savingUnit || !addForm.vehicleId || !addForm.unitNumber || !addForm.licensePlate}
              className="px-6 py-2.5 bg-primary-500 hover:bg-primary-600 disabled:opacity-40 text-white text-sm font-bold rounded-xl transition-colors"
            >
              {savingUnit ? 'Adding…' : 'Add Unit'}
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className={`px-6 py-2.5 text-sm font-bold rounded-xl transition-colors ${isDark ? 'bg-neutral-800 hover:bg-neutral-700 text-white' : 'bg-neutral-200 hover:bg-neutral-300 text-neutral-900'}`}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className={`py-12 text-center ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`}>Loading fleet…</div>
      ) : (
        <div className="space-y-4">
          {vehicles
            .map((v) => ({
              ...v,
              fleetUnits: v.fleetUnits?.filter(u =>
                !searchFleet ||
                v.brand.toLowerCase().includes(searchFleet) ||
                v.model.toLowerCase().includes(searchFleet) ||
                u.unitNumber.toLowerCase().includes(searchFleet) ||
                u.licensePlate.toLowerCase().includes(searchFleet)
              )
            }))
            .filter(v => !searchFleet || v.fleetUnits?.length)
            .map((v) => (
            <div key={v.id} className={`border rounded-2xl overflow-hidden ${isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200'}`}>
              <button
                onClick={() => setExpandedVehicleId(expandedVehicleId === v.id ? null : v.id)}
                className={`w-full flex items-center justify-between p-4 transition-colors ${isDark ? 'hover:bg-neutral-800/50' : 'hover:bg-neutral-50'}`}
              >
                <div className="flex items-center gap-4 text-left">
                  <div>
                    <p className={`font-bold ${isDark ? 'text-white' : 'text-neutral-900'}`}>{v.brand} {v.model}</p>
                    <p className={`text-xs ${isDark ? 'text-neutral-500' : 'text-neutral-600'}`}>{v.engine} · {v.fleetUnits?.length || 0} units</p>
                  </div>
                </div>
                {/* @ts-ignore */}
                <Icon icon={expandedVehicleId === v.id ? 'ph:caret-up-bold' : 'ph:caret-down-bold'} width={16} height={16} />
              </button>

              {expandedVehicleId === v.id && (
                <div className={`border-t px-4 py-4 space-y-3 ${isDark ? 'border-neutral-800 bg-neutral-800/20' : 'border-neutral-200 bg-neutral-50'}`}>
                  {v.fleetUnits?.map((u) => (
                    <div key={u.id} className={`rounded-xl p-4 ${isDark ? 'bg-neutral-800' : 'bg-white border border-neutral-200'}`}>
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-mono text-sm font-bold text-primary-400">{u.unitNumber}</p>
                          <p className={`text-xs ${isDark ? 'text-neutral-500' : 'text-neutral-600'}`}>{u.licensePlate}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                            u.status === 'maintenance' ? 'bg-red-500/15 text-red-400' :
                            u.status === 'rented' ? 'bg-blue-500/15 text-blue-400' :
                            'bg-green-500/15 text-green-400'
                          }`}>
                            {u.status}
                          </span>
                          {(() => {
                            const booking = getBookingForUnit(u.id);
                            return booking ? (
                              <div className={`text-xs font-semibold px-2 py-1 rounded-lg ${isDark ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-100 text-blue-700'}`}>
                                📌 {booking.customer.firstName} {booking.customer.lastName.charAt(0)}.
                              </div>
                            ) : null;
                          })()}
                        </div>
                      </div>

                      {editingUnit?.id === u.id ? (
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className={`text-xs mb-1 block ${isDark ? 'text-neutral-500' : 'text-neutral-600'}`}>Vehicle Model</label>
                              <select
                                value={editForm.vehicleId}
                                onChange={(e) => setEditForm({...editForm, vehicleId: e.target.value})}
                                className={`w-full rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-500 ${isDark ? 'bg-neutral-700 border border-neutral-600 text-white' : 'bg-neutral-50 border border-neutral-300 text-neutral-900'}`}
                              >
                                {vehicles.map((v) => (
                                  <option key={v.id} value={v.id}>{v.brand} {v.model}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className={`text-xs mb-1 block ${isDark ? 'text-neutral-500' : 'text-neutral-600'}`}>Unit Number</label>
                              <input
                                type="text"
                                value={editForm.unitNumber}
                                onChange={(e) => setEditForm({...editForm, unitNumber: e.target.value})}
                                className={`w-full rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-500 ${isDark ? 'bg-neutral-700 border border-neutral-600 text-white' : 'bg-neutral-50 border border-neutral-300 text-neutral-900'}`}
                              />
                            </div>
                          </div>
                          <div>
                            <label className={`text-xs mb-1 block ${isDark ? 'text-neutral-500' : 'text-neutral-600'}`}>License Plate *</label>
                            <input
                              type="text"
                              placeholder="e.g., PL-0001"
                              value={editForm.licensePlate}
                              onChange={(e) => setEditForm({...editForm, licensePlate: e.target.value})}
                              className={`w-full rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-500 ${isDark ? 'bg-neutral-700 border border-neutral-600 text-white' : 'bg-neutral-50 border border-neutral-300 text-neutral-900'}`}
                            />
                          </div>
                          <div>
                            <label className={`text-xs mb-1 block ${isDark ? 'text-neutral-500' : 'text-neutral-600'}`}>Status</label>
                            <select
                              value={editForm.status}
                              onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                              className={`w-full rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-500 ${isDark ? 'bg-neutral-700 border border-neutral-600 text-white' : 'bg-neutral-50 border border-neutral-300 text-neutral-900'}`}
                            >
                              <option value="available">Available</option>
                              <option value="rented">Rented</option>
                              <option value="maintenance">Maintenance</option>
                            </select>
                          </div>
                          <div>
                            <label className={`text-xs mb-1 block ${isDark ? 'text-neutral-500' : 'text-neutral-600'}`}>Current Kilometers</label>
                            <input
                              type="number"
                              placeholder="0"
                              value={editForm.currentKilometers}
                              onChange={(e) => setEditForm({...editForm, currentKilometers: e.target.value})}
                              className={`w-full rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-500 ${isDark ? 'bg-neutral-700 border border-neutral-600 text-white' : 'bg-neutral-50 border border-neutral-300 text-neutral-900'}`}
                            />
                          </div>
                          <div>
                            <label className={`text-xs mb-1 block ${isDark ? 'text-neutral-500' : 'text-neutral-600'}`}>Last Maintenance Date</label>
                            <input
                              type="date"
                              value={editForm.lastMaintenanceDate}
                              onChange={(e) => setEditForm({...editForm, lastMaintenanceDate: e.target.value})}
                              className={`w-full rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-500 ${isDark ? 'bg-neutral-700 border border-neutral-600 text-white' : 'bg-neutral-50 border border-neutral-300 text-neutral-900'}`}
                            />
                          </div>
                          <div>
                            <label className={`text-xs mb-1 block ${isDark ? 'text-neutral-500' : 'text-neutral-600'}`}>Maintenance Km Threshold</label>
                            <input
                              type="number"
                              placeholder="e.g., 5000"
                              value={editForm.maintenanceKilometers}
                              onChange={(e) => setEditForm({...editForm, maintenanceKilometers: e.target.value})}
                              className={`w-full rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-500 ${isDark ? 'bg-neutral-700 border border-neutral-600 text-white' : 'bg-neutral-50 border border-neutral-300 text-neutral-900'}`}
                            />
                          </div>
                          <div className={`border-t pt-3 mt-3 ${isDark ? 'border-neutral-700' : 'border-neutral-200'}`}>
                            <p className={`text-xs font-bold mb-3 ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>📄 LEGAL DOCUMENTS (Philippines)</p>
                            <div>
                              <label className={`text-xs mb-1 block ${isDark ? 'text-neutral-500' : 'text-neutral-600'}`}>OR/CR Expiry Date</label>
                              <input
                                type="date"
                                value={editForm.orCrExpiry}
                                onChange={(e) => setEditForm({...editForm, orCrExpiry: e.target.value})}
                                className={`w-full rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-500 ${isDark ? 'bg-neutral-700 border border-neutral-600 text-white' : 'bg-neutral-50 border border-neutral-300 text-neutral-900'}`}
                              />
                            </div>
                            <div>
                              <label className={`text-xs mb-1 block ${isDark ? 'text-neutral-500' : 'text-neutral-600'}`}>LTO Registration Expiry</label>
                              <input
                                type="date"
                                value={editForm.ltRegistrationExpiry}
                                onChange={(e) => setEditForm({...editForm, ltRegistrationExpiry: e.target.value})}
                                className={`w-full rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-500 ${isDark ? 'bg-neutral-700 border border-neutral-600 text-white' : 'bg-neutral-50 border border-neutral-300 text-neutral-900'}`}
                              />
                            </div>
                            <div>
                              <label className={`text-xs mb-1 block ${isDark ? 'text-neutral-500' : 'text-neutral-600'}`}>Insurance Expiry Date</label>
                              <input
                                type="date"
                                value={editForm.insuranceExpiry}
                                onChange={(e) => setEditForm({...editForm, insuranceExpiry: e.target.value})}
                                className={`w-full rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-500 ${isDark ? 'bg-neutral-700 border border-neutral-600 text-white' : 'bg-neutral-50 border border-neutral-300 text-neutral-900'}`}
                              />
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={handleSaveUnit}
                              disabled={savingUnit}
                              className="flex-1 px-3 py-2 bg-primary-500 hover:bg-primary-600 disabled:opacity-40 text-white text-xs font-bold rounded-lg transition-colors"
                            >
                              {savingUnit ? 'Saving…' : 'Save'}
                            </button>
                            <button
                              onClick={() => handleDeleteUnit(u.id)}
                              disabled={deletingUnitId === u.id}
                              className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white text-xs font-bold rounded-lg transition-colors"
                            >
                              {deletingUnitId === u.id ? 'Deleting…' : 'Delete'}
                            </button>
                            <button
                              onClick={() => setEditingUnit(null)}
                              className={`flex-1 px-3 py-2 text-xs font-bold rounded-lg transition-colors ${isDark ? 'bg-neutral-700 hover:bg-neutral-600 text-white' : 'bg-neutral-200 hover:bg-neutral-300 text-neutral-900'}`}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className={`text-xs space-y-1 mb-3 ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>
                            <p>Kilometers: <span className={`font-semibold ${isDark ? 'text-white' : 'text-neutral-900'}`}>{u.currentKilometers}</span></p>
                            {u.maintenanceKilometers && <p>Maintenance threshold: <span className={`font-semibold ${isDark ? 'text-white' : 'text-neutral-900'}`}>{u.maintenanceKilometers} km</span></p>}
                            {u.lastMaintenanceDate && <p>Last maintenance: <span className={`${isDark ? 'text-white' : 'text-neutral-900'}`}>{fmtDate(u.lastMaintenanceDate)}</span></p>}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setEditingUnit(u);
                                setEditForm({
                                  vehicleId: u.vehicleId,
                                  unitNumber: u.unitNumber,
                                  licensePlate: u.licensePlate,
                                  status: u.status,
                                  currentKilometers: String(u.currentKilometers),
                                  lastMaintenanceDate: u.lastMaintenanceDate || '',
                                  maintenanceKilometers: String(u.maintenanceKilometers || ''),
                                  orCrExpiry: u.orCrExpiry || '',
                                  ltRegistrationExpiry: u.ltRegistrationExpiry || '',
                                  insuranceExpiry: u.insuranceExpiry || '',
                                });
                              }}
                              className="text-xs font-semibold text-primary-400 hover:text-primary-300"
                            >
                              Edit unit →
                            </button>
                            <button
                              onClick={() => {
                                if (viewingDamageLogs === u.id) {
                                  setViewingDamageLogs(null);
                                } else {
                                  setViewingDamageLogs(u.id);
                                  fetchDamageLogs(u.id);
                                }
                              }}
                              className="text-xs font-semibold text-orange-400 hover:text-orange-300"
                            >
                              📸 Damage History
                            </button>
                          </div>
                        </>
                      )}

                      {viewingDamageLogs === u.id && (
                        <div className={`border-t pt-3 mt-3 ${isDark ? 'border-neutral-700' : 'border-neutral-200'}`}>
                          <div className="flex items-center justify-between mb-3">
                            <p className={`text-xs font-bold ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>📸 DAMAGE HISTORY</p>
                            {!creatingDamageLog && (
                              <button
                                onClick={() => {
                                  // Show form to create new damage log
                                  setCreatingDamageLog('form-' + u.id);
                                }}
                                className="text-xs font-semibold px-2 py-1 rounded bg-primary-500 hover:bg-primary-600 text-white transition-colors"
                              >
                                + Add Damage Log
                              </button>
                            )}
                          </div>

                          {/* New Damage Log Form with Camera */}
                          {creatingDamageLog === 'form-' + u.id && (
                            <div className={`mb-4 p-3 rounded-lg space-y-3 ${isDark ? 'bg-neutral-800' : 'bg-neutral-50'}`}>
                              <p className={`text-xs font-semibold ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>Create New Damage Record</p>

                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className={`text-xs mb-1 block ${isDark ? 'text-neutral-500' : 'text-neutral-600'}`}>Type</label>
                                  <select
                                    value={newDamageLogData.damageType}
                                    onChange={(e) => setNewDamageLogData({...newDamageLogData, damageType: e.target.value})}
                                    className={`w-full px-2 py-1.5 rounded text-xs ${isDark ? 'bg-neutral-700 border border-neutral-600 text-white' : 'bg-white border border-neutral-300 text-neutral-900'}`}
                                  >
                                    <option value="scratch">Scratch</option>
                                    <option value="dent">Dent</option>
                                    <option value="crack">Crack</option>
                                    <option value="break">Break</option>
                                    <option value="other">Other</option>
                                  </select>
                                </div>
                                <div>
                                  <label className={`text-xs mb-1 block ${isDark ? 'text-neutral-500' : 'text-neutral-600'}`}>Severity</label>
                                  <select
                                    value={newDamageLogData.severity}
                                    onChange={(e) => setNewDamageLogData({...newDamageLogData, severity: e.target.value})}
                                    className={`w-full px-2 py-1.5 rounded text-xs ${isDark ? 'bg-neutral-700 border border-neutral-600 text-white' : 'bg-white border border-neutral-300 text-neutral-900'}`}
                                  >
                                    <option value="minor">Minor</option>
                                    <option value="major">Major</option>
                                    <option value="critical">Critical</option>
                                  </select>
                                </div>
                              </div>

                              <div>
                                <label className={`text-xs mb-1 block ${isDark ? 'text-neutral-500' : 'text-neutral-600'}`}>Location on scooter</label>
                                <input
                                  type="text"
                                  placeholder="e.g., Front panel, seat, handlebar"
                                  value={newDamageLogData.location}
                                  onChange={(e) => setNewDamageLogData({...newDamageLogData, location: e.target.value})}
                                  className={`w-full px-2 py-1.5 rounded text-xs ${isDark ? 'bg-neutral-700 border border-neutral-600 text-white placeholder-neutral-500' : 'bg-white border border-neutral-300 text-neutral-900 placeholder-neutral-400'}`}
                                />
                              </div>

                              <div>
                                <label className={`text-xs mb-1 block ${isDark ? 'text-neutral-500' : 'text-neutral-600'}`}>Description</label>
                                <textarea
                                  placeholder="Describe the damage in detail"
                                  value={newDamageLogData.description}
                                  onChange={(e) => setNewDamageLogData({...newDamageLogData, description: e.target.value})}
                                  className={`w-full px-2 py-1.5 rounded text-xs resize-none ${isDark ? 'bg-neutral-700 border border-neutral-600 text-white placeholder-neutral-500' : 'bg-white border border-neutral-300 text-neutral-900 placeholder-neutral-400'}`}
                                  rows={2}
                                />
                              </div>

                              <div className="flex gap-2">
                                <button
                                  onClick={() => createNewDamageLog(u.id)}
                                  disabled={!newDamageLogData.location || !newDamageLogData.description}
                                  className="flex-1 px-2 py-1.5 rounded text-xs font-bold bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white transition-colors"
                                >
                                  Create & Capture Photos
                                </button>
                                <button
                                  onClick={() => setCreatingDamageLog(null)}
                                  className="flex-1 px-2 py-1.5 rounded text-xs font-bold bg-neutral-700 hover:bg-neutral-600 text-white transition-colors"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Camera Capture Interface */}
                          {creatingDamageLog && creatingDamageLog !== 'form-' + u.id && (
                            <div className={`mb-4 p-3 rounded-lg ${isDark ? 'bg-neutral-800 border border-green-500/30' : 'bg-green-50 border border-green-200'}`}>
                              <div className="mb-3">
                                <p className={`text-xs font-bold ${isDark ? 'text-green-400' : 'text-green-700'}`}>📸 CAPTURE DAMAGE PHOTOS</p>
                                <p className={`text-xs mt-1 ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>Take up to 4 photos maximum per session. Photos will auto-cleanup every 20 captured.</p>
                              </div>
                              <CameraCapture
                                damageLogId={creatingDamageLog}
                                onPhotoCapture={(url) => {
                                  // Photo uploaded successfully
                                }}
                                isDark={isDark}
                                onSessionComplete={async () => {
                                  // Refresh damage logs after session completes
                                  await fetchDamageLogs(u.id);
                                  setCreatingDamageLog(null);
                                }}
                              />
                            </div>
                          )}

                          {loadingDamageLogs ? (
                            <p className={`text-xs ${isDark ? 'text-neutral-500' : 'text-neutral-500'}`}>Loading damage logs…</p>
                          ) : damageLogs.length === 0 ? (
                            <p className={`text-xs ${isDark ? 'text-neutral-500' : 'text-neutral-500'}`}>No damage records found for this unit.</p>
                          ) : (
                            <div className="space-y-2">
                              {damageLogs.map((log) => (
                                <div
                                  key={log.id}
                                  className={`rounded-lg p-3 text-xs ${
                                    log.severity === 'critical'
                                      ? isDark
                                        ? 'bg-red-500/20 border border-red-500/30'
                                        : 'bg-red-50 border border-red-200'
                                      : log.severity === 'major'
                                      ? isDark
                                        ? 'bg-orange-500/20 border border-orange-500/30'
                                        : 'bg-orange-50 border border-orange-200'
                                      : isDark
                                      ? 'bg-yellow-500/20 border border-yellow-500/30'
                                      : 'bg-yellow-50 border border-yellow-200'
                                  }`}
                                >
                                  <div className="flex items-start justify-between mb-1">
                                    <span
                                      className={`px-2 py-0.5 rounded text-xs font-bold ${
                                        log.severity === 'critical'
                                          ? 'bg-red-600 text-white'
                                          : log.severity === 'major'
                                          ? 'bg-orange-600 text-white'
                                          : 'bg-yellow-600 text-white'
                                      }`}
                                    >
                                      {log.severity}
                                    </span>
                                    <span
                                      className={`${
                                        log.status === 'repaired'
                                          ? 'text-green-500'
                                          : log.status === 'inspected'
                                          ? 'text-blue-500'
                                          : 'text-gray-500'
                                      }`}
                                    >
                                      {log.status}
                                    </span>
                                  </div>
                                  <p className={`font-semibold mb-1 ${isDark ? 'text-white' : 'text-neutral-900'}`}>
                                    {log.damageType} - {log.location}
                                  </p>
                                  <p className={`mb-1 ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>
                                    {log.description}
                                  </p>
                                  <p className={`text-xs ${isDark ? 'text-neutral-500' : 'text-neutral-600'}`}>
                                    Reported: {fmtDate(log.reportedDate)}
                                    {log.repairDate && ` • Repaired: ${fmtDate(log.repairDate)}`}
                                    {log.repairCost && ` • Cost: ₱${log.repairCost}`}
                                  </p>

                                  {log.photoUrls && (() => {
                                    try {
                                      const photos = JSON.parse(log.photoUrls);
                                      if (Array.isArray(photos) && photos.length > 0) {
                                        return (
                                          <div className="mt-2 space-y-1">
                                            <p className={`text-xs font-semibold ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>Photos ({photos.length})</p>
                                            <div className="flex gap-1 flex-wrap">
                                              {photos.map((photoUrl, idx) => (
                                                <a
                                                  key={idx}
                                                  href={photoUrl}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  className="relative w-12 h-12 rounded overflow-hidden border border-neutral-600 hover:opacity-80 transition-opacity"
                                                >
                                                  <img
                                                    src={photoUrl}
                                                    alt={`Damage photo ${idx + 1}`}
                                                    className="w-full h-full object-cover"
                                                  />
                                                </a>
                                              ))}
                                            </div>
                                          </div>
                                        );
                                      }
                                      return null;
                                    } catch (e) {
                                      return null;
                                    }
                                  })()}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const router = useRouter();
  const [tab, setTab] = useState<'bookings' | 'vehicles' | 'fleet' | 'documents' | 'finance' | 'marketing' | 'ai-advisor' | 'promotions'>('bookings');
  const [isDark, setIsDark] = useState(true);

  // Bookings state
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filter, setFilter] = useState('all');
  const [searchBookings, setSearchBookings] = useState('');
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [selected, setSelected] = useState<Booking | null>(null);
  const [showAddBooking, setShowAddBooking] = useState(false);
  const [creatingBooking, setCreatingBooking] = useState(false);
  const [manualBookingForm, setManualBookingForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    nationality: '',
    vehicleId: '',
    pickupDate: '',
    returnDate: '',
    pickupLocation: 'Hotel',
    pickupAddress: '',
    paymentMethod: 'cash_on_delivery',
  });

  // Vehicles state
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loadingVehicles, setLoadingVehicles] = useState(false);
  const [blockingVehicle, setBlockingVehicle] = useState<Vehicle | null>(null);

  // Alerts state
  const [documentAlerts, setDocumentAlerts] = useState<any[]>([]);
  const [loadingAlerts, setLoadingAlerts] = useState(false);
  const [vehicleViewStats, setVehicleViewStats] = useState<any>({});

  // Financial export state
  const [financialExportDates, setFinancialExportDates] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  const fetchBookings = useCallback(async () => {
    setLoadingBookings(true);
    const url = filter === 'all' ? '/api/admin/bookings' : `/api/admin/bookings?status=${filter}`;
    const res = await fetch(url);
    if (res.status === 401) { router.push('/admin'); return; }
    setBookings(await res.json());
    setLoadingBookings(false);
  }, [filter, router]);

  const fetchVehicles = useCallback(async () => {
    setLoadingVehicles(true);
    const res = await fetch('/api/admin/vehicles-model');
    if (res.status === 401) { router.push('/admin'); return; }
    const data = await res.json();
    setVehicles(data.vehicles || []);
    setLoadingVehicles(false);
  }, [router]);

  const fetchDocumentAlerts = useCallback(async () => {
    setLoadingAlerts(true);
    const res = await fetch('/api/admin/document-alerts?dismissed=false&daysThreshold=30');
    if (res.status === 401) { router.push('/admin'); return; }
    const data = await res.json();
    setDocumentAlerts(data.alerts || []);
    setLoadingAlerts(false);
  }, [router]);

  const checkDocumentAlerts = async () => {
    const res = await fetch('/api/admin/document-alerts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'check' }),
    });
    if (res.ok) {
      await fetchDocumentAlerts();
    }
  };

  const dismissAlert = async (alertId: string) => {
    const res = await fetch('/api/admin/document-alerts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'dismiss', alertIds: [alertId] }),
    });
    if (res.ok) {
      await fetchDocumentAlerts();
    }
  };

  const fetchVehicleStats = useCallback(async (vehicleId: string) => {
    const res = await fetch(`/api/admin/page-views?vehicleId=${vehicleId}&timeRange=24h`);
    if (res.ok) {
      const data = await res.json();
      setVehicleViewStats((prev: any) => ({ ...prev, [vehicleId]: data }));
    }
  }, []);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);
  useEffect(() => { fetchDocumentAlerts(); }, [fetchDocumentAlerts]);
  useEffect(() => { if ((tab === 'vehicles' || tab === 'fleet') && vehicles.length === 0) fetchVehicles(); }, [tab, vehicles.length, fetchVehicles]);

  const updateStatus = async (id: string, status: string) => {
    setUpdating(id);
    await fetch('/api/admin/bookings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    });
    await fetchBookings();
    setUpdating(null);
    if (selected?.id === id) setSelected((b) => b ? { ...b, status } : null);
  };

  const createManualBooking = async () => {
    if (!manualBookingForm.firstName || !manualBookingForm.lastName || !manualBookingForm.email || !manualBookingForm.vehicleId || !manualBookingForm.pickupDate || !manualBookingForm.returnDate) {
      alert('Please fill in all required fields');
      return;
    }
    setCreatingBooking(true);
    try {
      const res = await fetch('/api/admin/bookings/create-manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(manualBookingForm),
      });
      if (res.ok) {
        const data = await res.json();
        setManualBookingForm({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          nationality: '',
          vehicleId: '',
          pickupDate: '',
          returnDate: '',
          pickupLocation: 'Hotel',
          pickupAddress: '',
          paymentMethod: 'cash_on_delivery',
        });
        setShowAddBooking(false);
        await fetchBookings();
        alert('Booking created successfully! Reference: ' + data.reference);
      } else {
        const err = await res.json();
        alert('Error: ' + (err.error || 'Failed to create booking'));
      }
    } catch (err) {
      alert('Error creating booking: ' + err);
    }
    setCreatingBooking(false);
  };

  const logout = async () => {
    await fetch('/api/admin/login', { method: 'DELETE' });
    router.push('/admin');
  };

  const total = bookings.length;
  const pending = bookings.filter((b) => b.status === 'pending').length;
  const active = bookings.filter((b) => b.status === 'active').length;
  const revenue = bookings
    .filter((b) => !['cancelled'].includes(b.status))
    .reduce((s, b) => s + b.totalPrice, 0);

  const FILTERS = ['all', 'pending', 'confirmed', 'active', 'returned', 'cancelled'];

  return (
    <div className={`min-h-screen ${isDark ? 'bg-neutral-950 text-white' : 'bg-white text-neutral-900'}`}>
      <div className={`${isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-neutral-50 border-neutral-200'} border-b px-6 py-4 flex items-center justify-between`}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-orange-700 flex items-center justify-center">
            <span className="text-white font-bold text-sm">K</span>
          </div>
          <span className="font-bold text-lg">KJM Admin</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (tab === 'bookings') fetchBookings();
              else fetchVehicles();
            }}
            className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-neutral-800 text-neutral-400 hover:text-white' : 'hover:bg-neutral-200 text-neutral-600 hover:text-neutral-900'}`}
            title="Refresh"
          >
            {/* @ts-ignore */}
            <Icon icon="ph:arrows-clockwise-bold" width={18} height={18} />
          </button>
          <button
            onClick={async () => {
              try {
                const res = await fetch('/api/admin/notifications/check-expiry', {
                  method: 'POST',
                });
                if (res.ok) {
                  const data = await res.json();
                  alert(`Email alerts checked. Sent ${data.emailsSent.length} notification(s).`);
                  await fetchDocumentAlerts();
                }
              } catch (err) {
                alert('Failed to check alerts');
              }
            }}
            className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-neutral-800 text-neutral-400 hover:text-white' : 'hover:bg-neutral-200 text-neutral-600 hover:text-neutral-900'}`}
            title="Check & Send Document Expiry Alerts"
          >
            {/* @ts-ignore */}
            <Icon icon="ph:envelope-bold" width={18} height={18} />
          </button>
          <button
            onClick={() => setIsDark(!isDark)}
            className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-neutral-800 text-neutral-400 hover:text-white' : 'hover:bg-neutral-200 text-neutral-600 hover:text-neutral-900'}`}
            title={isDark ? 'Light mode' : 'Dark mode'}
          >
            {/* @ts-ignore */}
            <Icon icon={isDark ? 'ph:sun-bold' : 'ph:moon-bold'} width={18} height={18} />
          </button>
          <a href="/" target="_blank" className={`hidden sm:flex items-center gap-1.5 text-sm transition-colors ${isDark ? 'text-neutral-400 hover:text-white' : 'text-neutral-600 hover:text-neutral-900'}`}>
            {/* @ts-ignore */}
            <Icon icon="ph:arrow-square-out-bold" width={15} height={15} />
            View site
          </a>
          <button onClick={logout} className={`flex items-center gap-1.5 text-sm transition-colors ${isDark ? 'text-neutral-400 hover:text-red-400' : 'text-neutral-600 hover:text-red-600'}`}>
            {/* @ts-ignore */}
            <Icon icon="ph:sign-out-bold" width={15} height={15} />
            <span className="hidden sm:block">Sign out</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Bookings', value: total, icon: 'ph:calendar-check-fill', color: 'text-white' },
            { label: 'Pending', value: pending, icon: 'ph:clock-fill', color: 'text-yellow-400' },
            { label: 'Active Now', value: active, icon: 'ph:motorcycle-fill', color: 'text-green-400' },
            { label: 'Total Revenue', value: `₱${revenue.toLocaleString('en-US')}`, icon: 'ph:money-fill', color: 'text-primary-400' },
          ].map((s) => (
            <div key={s.label} className={`${isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-neutral-50 border-neutral-200'} border rounded-2xl p-5`}>
              <div className="flex items-center gap-2 mb-3">
                {/* @ts-ignore */}
                <Icon icon={s.icon} width={18} height={18} className={s.color} />
                <span className={`text-xs font-semibold ${isDark ? 'text-neutral-500' : 'text-neutral-600'} uppercase tracking-wider`}>{s.label}</span>
              </div>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Document Expiry Alerts */}
        {documentAlerts.length > 0 && (
          <div className={`mb-6 rounded-2xl border overflow-hidden ${
            documentAlerts.some(a => a.daysUntilExpiry < 0) || documentAlerts.some(a => a.daysUntilExpiry <= 7)
              ? isDark
                ? 'bg-red-500/10 border-red-500/30'
                : 'bg-red-50 border-red-200'
              : isDark
              ? 'bg-yellow-500/10 border-yellow-500/30'
              : 'bg-yellow-50 border-yellow-200'
          }`}>
            <div className="px-6 py-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`text-lg font-bold ${
                    documentAlerts.some(a => a.daysUntilExpiry < 0) || documentAlerts.some(a => a.daysUntilExpiry <= 7)
                      ? 'text-red-400'
                      : 'text-yellow-400'
                  }`}>🚨 DOCUMENT EXPIRY ALERTS</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    documentAlerts.some(a => a.daysUntilExpiry < 0) || documentAlerts.some(a => a.daysUntilExpiry <= 7)
                      ? isDark
                        ? 'bg-red-600 text-white'
                        : 'bg-red-600 text-white'
                      : isDark
                      ? 'bg-yellow-600 text-white'
                      : 'bg-yellow-600 text-white'
                  }`}>
                    {documentAlerts.length} alerts
                  </span>
                </div>
                <button
                  onClick={() => checkDocumentAlerts()}
                  className={`text-xs font-semibold px-3 py-1 rounded-lg transition-colors ${
                    isDark
                      ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white'
                      : 'bg-neutral-200 hover:bg-neutral-300 text-neutral-700'
                  }`}
                >
                  Refresh
                </button>
              </div>
              <div className="space-y-2">
                {documentAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`flex items-start justify-between p-3 rounded-lg ${
                      alert.daysUntilExpiry < 0
                        ? isDark
                          ? 'bg-red-900/40'
                          : 'bg-red-100'
                        : alert.daysUntilExpiry <= 7
                        ? isDark
                          ? 'bg-red-800/30'
                          : 'bg-red-50'
                        : isDark
                        ? 'bg-yellow-800/30'
                        : 'bg-yellow-50'
                    }`}
                  >
                    <div className="flex-1">
                      <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-neutral-900'}`}>
                        {alert.fleetUnit.unitNumber} ({alert.fleetUnit.licensePlate}) - {alert.documentType}
                      </p>
                      <p className={`text-xs ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>
                        {alert.fleetUnit.vehicle.brand} {alert.fleetUnit.vehicle.model}
                      </p>
                      <p className={`text-xs font-semibold mt-1 ${
                        alert.daysUntilExpiry < 0
                          ? 'text-red-400'
                          : alert.daysUntilExpiry <= 7
                          ? 'text-red-400'
                          : 'text-yellow-400'
                      }`}>
                        {alert.daysUntilExpiry < 0
                          ? `EXPIRED ${Math.abs(alert.daysUntilExpiry)} days ago`
                          : alert.daysUntilExpiry === 0
                          ? 'EXPIRES TODAY'
                          : `Expires in ${alert.daysUntilExpiry} days`}
                      </p>
                    </div>
                    <button
                      onClick={() => dismissAlert(alert.id)}
                      className={`ml-2 text-xs font-semibold px-2 py-1 rounded transition-colors ${
                        isDark
                          ? 'bg-neutral-700 hover:bg-neutral-600 text-neutral-300'
                          : 'bg-neutral-300 hover:bg-neutral-400 text-neutral-700'
                      }`}
                    >
                      Dismiss
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Analytics Widget */}
        <div className="mb-8">
          <PageViewsAnalytics isDark={isDark} />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {[
            { id: 'bookings', label: 'Bookings', icon: 'ph:calendar-bold' },
            { id: 'vehicles', label: 'Vehicles', icon: 'ph:car-bold' },
            { id: 'fleet', label: 'Fleet/Resources', icon: 'ph:motorcycle-bold' },
            { id: 'documents', label: 'Documents', icon: 'ph:file-bold' },
            { id: 'finance', label: 'Finance', icon: 'ph:chart-bar-bold' },
            { id: 'marketing', label: 'Marketing', icon: 'ph:chart-line-bold' },
            { id: 'ai-advisor', label: 'AI Advisor', icon: 'ph:sparkles-bold' },
            { id: 'promotions', label: 'Promotions', icon: 'ph:tag-bold' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as any)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-colors whitespace-nowrap ${
                tab === t.id
                  ? 'bg-primary-500 text-white'
                  : isDark
                    ? 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-600'
                    : 'bg-neutral-100 border border-neutral-300 text-neutral-600 hover:text-neutral-900 hover:border-neutral-400'
              }`}
            >
              {/* @ts-ignore */}
              <Icon icon={t.icon} width={16} height={16} />
              {t.label}
            </button>
          ))}
        </div>

        {/* Bookings Tab */}
        {tab === 'bookings' && (
          <>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-neutral-900'}`}>Bookings</h3>
                <p className={`text-sm mt-1 ${isDark ? 'text-neutral-500' : 'text-neutral-600'}`}>Manage all scooter rental bookings</p>
              </div>
              <button
                onClick={() => setShowAddBooking(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white text-sm font-bold rounded-xl transition-colors"
              >
                {/* @ts-ignore */}
                <Icon icon="ph:plus-bold" width={16} height={16} />
                Add Booking
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {FILTERS.map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize whitespace-nowrap transition-colors ${
                      filter === f
                        ? 'bg-primary-500 text-white'
                        : isDark
                          ? 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-600'
                          : 'bg-neutral-100 border border-neutral-300 text-neutral-600 hover:text-neutral-900 hover:border-neutral-400'
                    }`}
                  >
                    {f === 'all' ? 'All' : f}
                  </button>
                ))}
              </div>
              <input
                type="text"
                placeholder="🔍 Search bookings... (reference, customer, vehicle, plate)"
                value={searchBookings}
                onChange={(e) => setSearchBookings(e.target.value.toLowerCase())}
                className={`w-full rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary-500 ${isDark ? 'bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500' : 'bg-white border border-neutral-300 text-neutral-900 placeholder-neutral-500'}`}
              />
            </div>

            <div className={`${isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200'} border rounded-2xl overflow-hidden`}>
              {loadingBookings ? (
                <div className={`py-16 text-center ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`}>Loading…</div>
              ) : bookings.length === 0 ? (
                <div className={`py-16 text-center ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`}>No bookings found.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className={`border-b ${isDark ? 'border-neutral-800' : 'border-neutral-200'}`}>
                        {['Reference', 'Customer', 'Vehicle', 'Plate', 'Dates', 'Delivery', 'Payment', 'Total', 'Status', 'Actions'].map((h) => (
                          <th key={h} className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wider whitespace-nowrap ${isDark ? 'text-neutral-500' : 'text-neutral-600'}`}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${isDark ? 'divide-neutral-800' : 'divide-neutral-200'}`}>
                      {bookings
                        .filter(b => {
                          if (!searchBookings) return true;
                          return (
                            b.reference.toLowerCase().includes(searchBookings) ||
                            b.customer.firstName.toLowerCase().includes(searchBookings) ||
                            b.customer.lastName.toLowerCase().includes(searchBookings) ||
                            b.vehicle.brand.toLowerCase().includes(searchBookings) ||
                            b.vehicle.model.toLowerCase().includes(searchBookings) ||
                            b.fleetUnit?.licensePlate.toLowerCase().includes(searchBookings) ||
                            b.fleetUnit?.unitNumber.toLowerCase().includes(searchBookings)
                          );
                        })
                        .map((b) => {
                        const s = STATUS_STYLES[b.status] || STATUS_STYLES.pending;
                        const d = days(b.pickupDate, b.returnDate);
                        return (
                          <tr key={b.id} onClick={() => setSelected(b)} className={`cursor-pointer transition-colors ${isDark ? 'hover:bg-neutral-800/50' : 'hover:bg-neutral-50'}`}>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className="font-mono text-xs font-bold text-primary-400">{b.reference}</span>
                              <p className={`text-xs mt-0.5 ${isDark ? 'text-neutral-600' : 'text-neutral-500'}`}>{fmt(b.createdAt)}</p>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <p className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-neutral-900'}`}>{b.customer.firstName} {b.customer.lastName}</p>
                              <a href={`https://wa.me/${b.customer.phone.replace(/[^0-9]/g, '')}`} target="_blank" onClick={(e) => e.stopPropagation()} className="text-xs text-green-400 hover:text-green-300">
                                {b.customer.phone}
                              </a>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-neutral-900'}`}>{b.vehicle.brand} {b.vehicle.model}</p>
                              <p className={`text-xs ${isDark ? 'text-neutral-500' : 'text-neutral-600'}`}>{b.vehicle.engine}</p>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              {b.fleetUnit ? (
                                <>
                                  <p className={`text-sm font-bold text-yellow-400`}>{b.fleetUnit.licensePlate}</p>
                                  <p className={`text-xs ${isDark ? 'text-neutral-500' : 'text-neutral-600'}`}>{b.fleetUnit.unitNumber}</p>
                                </>
                              ) : (
                                <p className={`text-xs ${isDark ? 'text-neutral-600' : 'text-neutral-500'}`}>—</p>
                              )}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <p className={`text-xs font-medium ${isDark ? 'text-white' : 'text-neutral-900'}`}>{fmt(b.pickupDate)}</p>
                              <p className={`text-xs ${isDark ? 'text-neutral-500' : 'text-neutral-600'}`}>→ {fmt(b.returnDate)} · {d}d</p>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <p className={`text-xs capitalize ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>{b.pickupLocation}</p>
                              {b.pickupAddress && <p className={`text-xs max-w-[140px] truncate ${isDark ? 'text-neutral-600' : 'text-neutral-500'}`}>{b.pickupAddress}</p>}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className={`text-xs font-semibold ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>
                                {PAYMENT_LABELS[b.payment?.method ?? ''] ?? b.payment?.method ?? '—'}
                              </span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-neutral-900'}`}>₱{b.totalPrice.toLocaleString('en-US')}</span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${s.bg} ${s.text}`}>
                                {s.label}
                              </span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center gap-1">
                                {b.status === 'pending' && (
                                  <button onClick={() => updateStatus(b.id, 'confirmed')} disabled={updating === b.id} className="px-2.5 py-1 bg-blue-500/20 hover:bg-blue-500/40 text-blue-400 text-xs font-bold rounded-lg transition-colors disabled:opacity-50">Confirm</button>
                                )}
                                {b.status === 'confirmed' && (
                                  <button onClick={() => updateStatus(b.id, 'active')} disabled={updating === b.id} className="px-2.5 py-1 bg-green-500/20 hover:bg-green-500/40 text-green-400 text-xs font-bold rounded-lg transition-colors disabled:opacity-50">Activate</button>
                                )}
                                {b.status === 'active' && (
                                  <button onClick={() => updateStatus(b.id, 'returned')} disabled={updating === b.id} className="px-2.5 py-1 bg-neutral-500/20 hover:bg-neutral-500/40 text-neutral-300 text-xs font-bold rounded-lg transition-colors disabled:opacity-50">Returned</button>
                                )}
                                {!['returned', 'cancelled'].includes(b.status) && (
                                  <button onClick={() => updateStatus(b.id, 'cancelled')} disabled={updating === b.id} className="px-2.5 py-1 bg-red-500/20 hover:bg-red-500/40 text-red-400 text-xs font-bold rounded-lg transition-colors disabled:opacity-50">Cancel</button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {/* Vehicles Tab */}
        {tab === 'vehicles' && <VehiclesTab vehicles={vehicles} loading={loadingVehicles} onRefresh={fetchVehicles} isDark={isDark} />}

        {/* Fleet Tab */}
        {tab === 'fleet' && <FleetTab vehicles={vehicles} bookings={bookings} loading={loadingVehicles} onRefresh={fetchVehicles} isDark={isDark} />}

        {/* Documents Tab */}
        {tab === 'documents' && <DocumentsTab isDark={isDark} />}

        {/* Finance Dashboard */}
        {tab === 'finance' && <FinanceDashboard isDark={isDark} />}

        {/* Marketing Tab */}
        {tab === 'marketing' && (
          <div className="space-y-6">
            <div>
              <h3 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-neutral-900'}`}>📊 Marketing & Analytics</h3>
              <p className={`text-sm ${isDark ? 'text-neutral-500' : 'text-neutral-600'}`}>Track real-time engagement, conversion funnel, and content performance</p>
            </div>

            {/* Real-time KPI Cards */}
            <RealTimeKPI bookings={bookings} isDark={isDark} />

            {/* 3-Column Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Column 1: Booking Calendar */}
              <div className="lg:col-span-1">
                <BookingCalendar bookings={bookings} isDark={isDark} />
              </div>

              {/* Column 2: Conversion Funnel */}
              <div className="lg:col-span-1">
                <ConversionFunnel isDark={isDark} />
              </div>

              {/* Column 3: Page Views */}
              <div className="lg:col-span-1">
                <PageViewsAnalytics isDark={isDark} />
              </div>
            </div>

            {/* Content Analytics */}
            <ContentAnalytics isDark={isDark} />

            {/* Financial Export Section */}
            <div className={`rounded-lg p-6 ${isDark ? 'bg-neutral-800' : 'bg-neutral-50'}`}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {/* @ts-ignore */}
                    <Icon icon="ph:chart-bar-bold" width={24} height={24} className="text-primary-500" />
                    <h4 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-neutral-900'}`}>
                      Financial Statement Export
                    </h4>
                  </div>
                  <p className={`text-sm mt-1 ${isDark ? 'text-neutral-500' : 'text-neutral-600'}`}>
                    Export bookings data for accounting and tax purposes (CSV format)
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className={`block text-sm font-bold mb-2 ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>
                    From Date
                  </label>
                  <input
                    type="date"
                    value={financialExportDates.startDate}
                    onChange={(e) => setFinancialExportDates((prev) => ({ ...prev, startDate: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-neutral-700 border-neutral-600 text-white'
                        : 'bg-white border-neutral-300 text-neutral-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-bold mb-2 ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>
                    To Date
                  </label>
                  <input
                    type="date"
                    value={financialExportDates.endDate}
                    onChange={(e) => setFinancialExportDates((prev) => ({ ...prev, endDate: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-neutral-700 border-neutral-600 text-white'
                        : 'bg-white border-neutral-300 text-neutral-900'
                    }`}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <a
                  href={`/api/admin/reports/financial-export?startDate=${financialExportDates.startDate}&endDate=${financialExportDates.endDate}&format=csv`}
                  download
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-colors ${
                    isDark
                      ? 'bg-primary-600 hover:bg-primary-500 text-white'
                      : 'bg-primary-500 hover:bg-primary-600 text-white'
                  }`}
                >
                  {/* @ts-ignore */}
                  <Icon icon="ph:download-simple-bold" width={16} height={16} />
                  Download CSV
                </a>
                <a
                  href={`/api/admin/reports/financial-export?startDate=${financialExportDates.startDate}&endDate=${financialExportDates.endDate}&format=json`}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-colors ${
                    isDark
                      ? 'bg-neutral-700 hover:bg-neutral-600 text-white'
                      : 'bg-neutral-200 hover:bg-neutral-300 text-neutral-900'
                  }`}
                >
                  {/* @ts-ignore */}
                  <Icon icon="ph:download-simple-bold" width={16} height={16} />
                  JSON
                </a>
              </div>

              <p className={`text-xs mt-4 ${isDark ? 'text-neutral-500' : 'text-neutral-600'}`}>
                CSV includes: Booking reference, customer details, vehicle, dates, pricing breakdown, payment method, and status.
                Perfect for: Accounting, tax reports, invoice generation, financial analysis.
              </p>
            </div>
          </div>
        )}

        {/* AI Advisor Tab */}
        {tab === 'ai-advisor' && <AIAdvisor isDark={isDark} />}

        {/* Promotions Tab */}
        {tab === 'promotions' && (
          <PromoCodesPanel isDark={isDark} />
        )}
      </div>

      {/* Booking detail slide-over */}
      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSelected(null)} />
          <div className={`relative w-full max-w-md ${isDark ? 'bg-neutral-900 border-l border-neutral-800' : 'bg-white border-l border-neutral-200'} h-full overflow-y-auto shadow-2xl`}>
            <div className={`flex items-center justify-between px-6 py-4 border-b ${isDark ? 'border-neutral-800 bg-neutral-900' : 'border-neutral-200 bg-white'} sticky top-0 z-10`}>
              <div>
                <p className="text-xs font-bold text-primary-400">{selected.reference}</p>
                <p className={`font-bold ${isDark ? 'text-white' : 'text-neutral-900'}`}>{selected.customer.firstName} {selected.customer.lastName}</p>
              </div>
              <button onClick={() => setSelected(null)} className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-neutral-800 text-neutral-400' : 'hover:bg-neutral-100 text-neutral-600'}`}>
                {/* @ts-ignore */}
                <Icon icon="ph:x-bold" width={18} height={18} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <p className={`text-xs font-bold uppercase tracking-wider mb-3 ${isDark ? 'text-neutral-500' : 'text-neutral-600'}`}>Status</p>
                <div className="flex flex-wrap gap-2">
                  {['pending', 'confirmed', 'active', 'returned', 'cancelled'].map((s) => {
                    const style = STATUS_STYLES[s];
                    return (
                      <button
                        key={s}
                        onClick={() => updateStatus(selected.id, s)}
                        disabled={selected.status === s || updating === selected.id}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-colors
                          ${selected.status === s ? `${style.bg} ${style.text} ring-2 ring-offset-1 ${isDark ? 'ring-offset-neutral-900' : 'ring-offset-white'} ring-current` : isDark ? 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className={`text-xs font-bold uppercase tracking-wider mb-3 ${isDark ? 'text-neutral-500' : 'text-neutral-600'}`}>Rental</p>
                <div className={`rounded-xl p-4 space-y-3 ${isDark ? 'bg-neutral-800' : 'bg-neutral-50'}`}>
                  {[
                    { label: 'Vehicle', value: `${selected.vehicle.brand} ${selected.vehicle.model}` },
                    { label: 'Pickup', value: fmt(selected.pickupDate) },
                    { label: 'Return', value: fmt(selected.returnDate) },
                    { label: 'Duration', value: `${days(selected.pickupDate, selected.returnDate)} days` },
                    { label: 'Delivery', value: selected.pickupLocation },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between">
                      <span className={`text-xs ${isDark ? 'text-neutral-500' : 'text-neutral-600'}`}>{label}</span>
                      <span className={`text-sm font-semibold capitalize ${isDark ? 'text-white' : 'text-neutral-900'}`}>{value}</span>
                    </div>
                  ))}
                  {selected.fleetUnit && (
                    <div className="flex justify-between">
                      <span className={`text-xs ${isDark ? 'text-neutral-500' : 'text-neutral-600'}`}>Plate</span>
                      <span className={`text-sm font-bold text-yellow-400`}>{selected.fleetUnit.licensePlate}</span>
                    </div>
                  )}
                  {selected.fleetUnit && (
                    <div className="flex justify-between">
                      <span className={`text-xs ${isDark ? 'text-neutral-500' : 'text-neutral-600'}`}>Unit</span>
                      <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-neutral-900'}`}>{selected.fleetUnit.unitNumber}</span>
                    </div>
                  )}
                  {selected.pickupAddress && (
                    <div className="flex justify-between">
                      <span className={`text-xs ${isDark ? 'text-neutral-500' : 'text-neutral-600'}`}>Address</span>
                      <span className={`text-sm font-semibold text-right max-w-[200px] ${isDark ? 'text-white' : 'text-neutral-900'}`}>{selected.pickupAddress}</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <p className={`text-xs font-bold uppercase tracking-wider mb-3 ${isDark ? 'text-neutral-500' : 'text-neutral-600'}`}>Customer</p>
                <div className={`rounded-xl p-4 space-y-3 ${isDark ? 'bg-neutral-800' : 'bg-neutral-50'}`}>
                  <div className="flex justify-between">
                    <span className={`text-xs ${isDark ? 'text-neutral-500' : 'text-neutral-600'}`}>Name</span>
                    <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-neutral-900'}`}>{selected.customer.firstName} {selected.customer.lastName}</span>
                  </div>
                  {selected.customer.nationality && (
                    <div className="flex justify-between">
                      <span className={`text-xs ${isDark ? 'text-neutral-500' : 'text-neutral-600'}`}>Nationality</span>
                      <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-neutral-900'}`}>{selected.customer.nationality}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className={`text-xs ${isDark ? 'text-neutral-500' : 'text-neutral-600'}`}>Phone</span>
                    <a href={`https://wa.me/${selected.customer.phone.replace(/[^0-9]/g, '')}`} target="_blank" className="text-sm font-bold text-green-400 hover:text-green-300">
                      {selected.customer.phone}
                    </a>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`text-xs ${isDark ? 'text-neutral-500' : 'text-neutral-600'}`}>Email</span>
                    <a href={`mailto:${selected.customer.email}`} className="text-sm font-semibold text-blue-400 hover:text-blue-300">
                      {selected.customer.email}
                    </a>
                  </div>
                </div>
              </div>

              <div>
                <p className={`text-xs font-bold uppercase tracking-wider mb-3 ${isDark ? 'text-neutral-500' : 'text-neutral-600'}`}>Payment</p>
                <div className={`rounded-xl p-4 space-y-3 ${isDark ? 'bg-neutral-800' : 'bg-neutral-50'}`}>
                  <div className="flex justify-between">
                    <span className={`text-xs ${isDark ? 'text-neutral-500' : 'text-neutral-600'}`}>Method</span>
                    <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-neutral-900'}`}>{PAYMENT_LABELS[selected.payment?.method ?? ''] ?? '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={`text-xs ${isDark ? 'text-neutral-500' : 'text-neutral-600'}`}>Total rental</span>
                    <span className="text-sm font-bold text-primary-400">₱{selected.totalPrice.toLocaleString('en-US')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={`text-xs ${isDark ? 'text-neutral-500' : 'text-neutral-600'}`}>Deposit</span>
                    <span className={`text-sm font-bold ${selected.depositPaid ? 'text-green-400' : 'text-yellow-400'}`}>
                      {selected.depositPaid ? 'Passport copy ✓' : '₱2,500 cash on delivery'}
                    </span>
                  </div>
                </div>
              </div>

              <a
                href={`https://wa.me/${selected.customer.phone.replace(/[^0-9]/g, '')}?text=Hi ${selected.customer.firstName}! This is KJM Rental. Your booking ${selected.reference} is confirmed. We'll deliver your ${selected.vehicle.brand} ${selected.vehicle.model} on ${fmt(selected.pickupDate)}. See you soon!`}
                target="_blank"
                className="flex items-center justify-center gap-2 w-full py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl transition-colors"
              >
                {/* @ts-ignore */}
                <Icon icon="logos:whatsapp-icon" width={20} height={20} />
                WhatsApp {selected.customer.firstName}
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Add Booking Modal */}
      {showAddBooking && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className={`${isDark ? 'bg-neutral-900' : 'bg-white'} rounded-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-neutral-900'}`}>
                Add Booking Manually
              </h3>
              <button
                onClick={() => setShowAddBooking(false)}
                className={`text-2xl ${isDark ? 'text-neutral-400 hover:text-neutral-300' : 'text-neutral-400 hover:text-neutral-600'}`}
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`text-xs font-semibold mb-2 block ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>First Name *</label>
                  <input
                    type="text"
                    value={manualBookingForm.firstName}
                    onChange={(e) => setManualBookingForm({...manualBookingForm, firstName: e.target.value})}
                    className={`w-full rounded-lg px-3 py-2 text-sm focus:outline-none ${isDark ? 'bg-neutral-800 border border-neutral-700 text-white' : 'bg-white border border-neutral-300 text-neutral-900'}`}
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className={`text-xs font-semibold mb-2 block ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>Last Name *</label>
                  <input
                    type="text"
                    value={manualBookingForm.lastName}
                    onChange={(e) => setManualBookingForm({...manualBookingForm, lastName: e.target.value})}
                    className={`w-full rounded-lg px-3 py-2 text-sm focus:outline-none ${isDark ? 'bg-neutral-800 border border-neutral-700 text-white' : 'bg-white border border-neutral-300 text-neutral-900'}`}
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div>
                <label className={`text-xs font-semibold mb-2 block ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>Email *</label>
                <input
                  type="email"
                  value={manualBookingForm.email}
                  onChange={(e) => setManualBookingForm({...manualBookingForm, email: e.target.value})}
                  className={`w-full rounded-lg px-3 py-2 text-sm focus:outline-none ${isDark ? 'bg-neutral-800 border border-neutral-700 text-white' : 'bg-white border border-neutral-300 text-neutral-900'}`}
                  placeholder="john@example.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`text-xs font-semibold mb-2 block ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>Phone</label>
                  <input
                    type="text"
                    value={manualBookingForm.phone}
                    onChange={(e) => setManualBookingForm({...manualBookingForm, phone: e.target.value})}
                    className={`w-full rounded-lg px-3 py-2 text-sm focus:outline-none ${isDark ? 'bg-neutral-800 border border-neutral-700 text-white' : 'bg-white border border-neutral-300 text-neutral-900'}`}
                    placeholder="+63..."
                  />
                </div>
                <div>
                  <label className={`text-xs font-semibold mb-2 block ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>Nationality</label>
                  <input
                    type="text"
                    value={manualBookingForm.nationality}
                    onChange={(e) => setManualBookingForm({...manualBookingForm, nationality: e.target.value})}
                    className={`w-full rounded-lg px-3 py-2 text-sm focus:outline-none ${isDark ? 'bg-neutral-800 border border-neutral-700 text-white' : 'bg-white border border-neutral-300 text-neutral-900'}`}
                    placeholder="Filipino"
                  />
                </div>
              </div>

              <div>
                <label className={`text-xs font-semibold mb-2 block ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>Vehicle *</label>
                <select
                  value={manualBookingForm.vehicleId}
                  onChange={(e) => setManualBookingForm({...manualBookingForm, vehicleId: e.target.value})}
                  className={`w-full rounded-lg px-3 py-2 text-sm focus:outline-none ${isDark ? 'bg-neutral-800 border border-neutral-700 text-white' : 'bg-white border border-neutral-300 text-neutral-900'}`}
                >
                  <option value="">Select a vehicle</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>{v.brand} {v.model} ({v.engine})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`text-xs font-semibold mb-2 block ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>Pickup Date *</label>
                  <input
                    type="date"
                    value={manualBookingForm.pickupDate}
                    onChange={(e) => setManualBookingForm({...manualBookingForm, pickupDate: e.target.value})}
                    className={`w-full rounded-lg px-3 py-2 text-sm focus:outline-none ${isDark ? 'bg-neutral-800 border border-neutral-700 text-white' : 'bg-white border border-neutral-300 text-neutral-900'}`}
                  />
                </div>
                <div>
                  <label className={`text-xs font-semibold mb-2 block ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>Return Date *</label>
                  <input
                    type="date"
                    value={manualBookingForm.returnDate}
                    onChange={(e) => setManualBookingForm({...manualBookingForm, returnDate: e.target.value})}
                    className={`w-full rounded-lg px-3 py-2 text-sm focus:outline-none ${isDark ? 'bg-neutral-800 border border-neutral-700 text-white' : 'bg-white border border-neutral-300 text-neutral-900'}`}
                  />
                </div>
              </div>

              <div>
                <label className={`text-xs font-semibold mb-2 block ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>Pickup Location</label>
                <select
                  value={manualBookingForm.pickupLocation}
                  onChange={(e) => setManualBookingForm({...manualBookingForm, pickupLocation: e.target.value})}
                  className={`w-full rounded-lg px-3 py-2 text-sm focus:outline-none ${isDark ? 'bg-neutral-800 border border-neutral-700 text-white' : 'bg-white border border-neutral-300 text-neutral-900'}`}
                >
                  <option value="Hotel">Hotel</option>
                  <option value="Store">Store</option>
                  <option value="Airport">Airport</option>
                </select>
              </div>

              <div>
                <label className={`text-xs font-semibold mb-2 block ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>Pickup Address</label>
                <input
                  type="text"
                  value={manualBookingForm.pickupAddress}
                  onChange={(e) => setManualBookingForm({...manualBookingForm, pickupAddress: e.target.value})}
                  className={`w-full rounded-lg px-3 py-2 text-sm focus:outline-none ${isDark ? 'bg-neutral-800 border border-neutral-700 text-white' : 'bg-white border border-neutral-300 text-neutral-900'}`}
                  placeholder="e.g., Waterfront Cebu City Hotel"
                />
              </div>

              <div>
                <label className={`text-xs font-semibold mb-2 block ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>Payment Method</label>
                <select
                  value={manualBookingForm.paymentMethod}
                  onChange={(e) => setManualBookingForm({...manualBookingForm, paymentMethod: e.target.value})}
                  className={`w-full rounded-lg px-3 py-2 text-sm focus:outline-none ${isDark ? 'bg-neutral-800 border border-neutral-700 text-white' : 'bg-white border border-neutral-300 text-neutral-900'}`}
                >
                  <option value="cash_on_delivery">Cash on Delivery</option>
                  <option value="gcash">GCash</option>
                  <option value="maya">Maya</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4 border-t" style={{ borderColor: isDark ? '#404040' : '#e5e7eb' }}>
                <button
                  onClick={createManualBooking}
                  disabled={creatingBooking}
                  className="flex-1 px-4 py-3 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white text-sm font-bold rounded-lg transition-colors"
                >
                  {creatingBooking ? 'Creating…' : 'Create Booking'}
                </button>
                <button
                  onClick={() => setShowAddBooking(false)}
                  className={`flex-1 px-4 py-3 text-sm font-bold rounded-lg transition-colors ${isDark ? 'bg-neutral-800 hover:bg-neutral-700 text-white' : 'bg-neutral-200 hover:bg-neutral-300 text-neutral-900'}`}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Block dates panel */}
      {blockingVehicle && (
        <BlockDatesPanel vehicle={blockingVehicle} onClose={() => setBlockingVehicle(null)} isDark={isDark} />
      )}
    </div>
  );
}
