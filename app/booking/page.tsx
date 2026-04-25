'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Icon } from '../../components/ui/Icon';
import ContractSigner from '../../components/booking/ContractSigner';
import { vehicles } from '../../lib/vehicles';
import { calcPrice, daysBetween, validateEmail, validatePhoneNumber, validatePickupDate, validateReturnDate } from '../../lib/booking-utils';

// ─── Step indicator ──────────────────────────────────────────────────────────
function StepBar({ step }: { step: number }) {
  const labels = ['Vehicle & Dates', 'Delivery', 'Your Details', 'Payment', 'Contract'];
  return (
    <div className="flex items-center gap-0">
      {labels.map((label, i) => {
        const n = i + 1;
        const done = step > n;
        const active = step === n;
        return (
          <div key={label} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors
                ${done ? 'bg-success-500 text-white' : active ? 'bg-primary-500 text-white' : 'bg-neutral-200 text-neutral-500'}`}>
                {done
                  ? <Icon icon="ph:check-bold" width={14} height={14} />
                  : n}
              </div>
              <span className={`text-xs mt-1 hidden sm:block font-medium ${active ? 'text-primary-600' : done ? 'text-success-600' : 'text-neutral-400'}`}>
                {label}
              </span>
            </div>
            {i < labels.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 mb-4 sm:mb-5 rounded ${done ? 'bg-success-400' : 'bg-neutral-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Price breakdown sidebar ─────────────────────────────────────────────────
function PriceSidebar({
  vehicle, days, vehicleId, pickupDate, returnDate, promoCode,
}: {
  vehicle: typeof vehicles[0] | null;
  days: number;
  vehicleId: string;
  pickupDate: string;
  returnDate: string;
  promoCode: string | null;
}) {
  const [pricing, setPricing] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Fetch real-time pricing with promo code
  useEffect(() => {
    if (!vehicle || !pickupDate || !returnDate || !vehicleId) return;

    const fetchPricing = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          vehicleId,
          pickupDate,
          returnDate,
          ...(promoCode && { promoCode }),
        });
        const res = await fetch(`/api/pricing?${params}`);
        const data = await res.json();
        setPricing(data);
      } catch (err) {
        console.error('Error fetching pricing:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPricing();
  }, [vehicle, vehicleId, pickupDate, returnDate, promoCode]);

  if (!vehicle) return null;

  const finalPrice = pricing?.finalPrice || 0;
  const basePrice = pricing?.basePrice || 0;
  const autoDiscount = pricing?.autoDiscount || 0;
  const promoDiscount = pricing?.promoDiscount || 0;

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 p-5 sticky top-24">
      <div className="flex items-center gap-3 mb-4 pb-4 border-b border-neutral-100">
        <div className="relative w-20 h-14 rounded-lg overflow-hidden bg-neutral-100 flex-shrink-0">
          <Image src={vehicle.image} alt={vehicle.model} fill className="object-contain p-1" />
        </div>
        <div>
          <p className="font-bold text-neutral-900 text-sm">{vehicle.brand} {vehicle.model}</p>
          <p className="text-xs text-neutral-500">{vehicle.engine} · {vehicle.automatic ? 'Auto' : 'Manual'}</p>
        </div>
      </div>

      <div className="space-y-2 text-sm mb-4">
        <div className="flex justify-between">
          <span className="text-neutral-500">Duration</span>
          <span className="font-semibold text-neutral-800">{days} day{days !== 1 ? 's' : ''}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-neutral-500">Base price</span>
          <span className="font-semibold text-neutral-800">₱{basePrice.toLocaleString('en-US')}</span>
        </div>

        {/* Auto discount (7+ nights) */}
        {autoDiscount > 0 && (
          <div className="flex justify-between items-center pt-1 border-t border-neutral-100">
            <span className="text-neutral-500">Weekend Free (7+ nights)</span>
            <div className="flex items-center gap-1">
              <span className="font-semibold text-success-600">-₱{autoDiscount.toLocaleString('en-US')}</span>
              <span className="text-xs text-success-600">✓</span>
            </div>
          </div>
        )}

        {/* Promo discount */}
        {promoDiscount > 0 && (
          <div className="flex justify-between items-center">
            <span className="text-neutral-500">Promo code {promoCode}</span>
            <div className="flex items-center gap-1">
              <span className="font-semibold text-success-600">-₱{promoDiscount.toLocaleString('en-US')}</span>
              <span className="text-xs text-success-600">✓</span>
            </div>
          </div>
        )}

        <div className="flex justify-between">
          <span className="text-neutral-500">Delivery</span>
          <span className="font-semibold text-success-600">FREE</span>
        </div>
        <div className="flex justify-between">
          <span className="text-neutral-500">Insurance</span>
          <span className="font-semibold text-success-600">Included</span>
        </div>
        <div className="flex justify-between">
          <span className="text-neutral-500">Helmets</span>
          <span className="font-semibold text-success-600">Included</span>
        </div>
      </div>

      <div className="border-t border-neutral-100 pt-3">
        <div className="flex justify-between items-center">
          <span className="font-bold text-neutral-900">Total</span>
          <span className="text-2xl font-bold text-primary-600">
            {loading ? '…' : `₱${finalPrice.toLocaleString('en-US')}`}
          </span>
        </div>
        <p className="text-xs text-neutral-400 mt-1">+ ₱2,500 refundable deposit on delivery</p>
      </div>

      <div className="mt-4 pt-4 border-t border-neutral-100 flex items-center gap-2 text-xs text-neutral-500">
        {/* @ts-ignore */}
        <Icon icon="ph:whatsapp-logo-fill" width={16} height={16} style={{ color: '#22C55E' }} />
        <span>Questions? <a href="tel:+639752984845" className="text-primary-600 font-medium">Call us</a></span>
      </div>
    </div>
  );
}

// ─── Step 1: Vehicle + Dates ─────────────────────────────────────────────────
function Step1({
  selectedSlug, setSelectedSlug, pickupDate, setPickupDate, returnDate, setReturnDate, onNext,
  availability, checkingAvailability, promoCode, setPromoCode, promoValid, setPromoValid, promoError, setPromoError,
}: {
  selectedSlug: string; setSelectedSlug: (s: string) => void;
  pickupDate: string; setPickupDate: (d: string) => void;
  returnDate: string; setReturnDate: (d: string) => void;
  onNext: () => void;
  availability: Record<string, boolean>;
  checkingAvailability: boolean;
  promoCode: string;
  setPromoCode: (c: string) => void;
  promoValid: boolean;
  setPromoValid: (v: boolean) => void;
  promoError: string;
  setPromoError: (e: string) => void;
}) {
  const today = new Date().toISOString().split('T')[0];
  const datesSet = pickupDate && returnDate && returnDate > pickupDate;
  const selectedAvailable = !datesSet || availability[selectedSlug] !== false;
  const canNext = selectedSlug && datesSet && !checkingAvailability && selectedAvailable;
  const [validatingPromo, setValidatingPromo] = useState(false);

  const handleValidatePromo = async () => {
    if (!promoCode || !datesSet || !selectedSlug) return;

    setValidatingPromo(true);
    setPromoError('');

    try {
      const days = daysBetween(pickupDate, returnDate);
      const vehicleId = `vehicle-${vehicles.findIndex((v) => v.slug === selectedSlug) + 1}`;

      if (!validatePickupDate(pickupDate)) {
        setPromoError('Pickup date cannot be in the past');
        setPromoValid(false);
        return;
      }

      if (!validateReturnDate(pickupDate, returnDate)) {
        setPromoError('Return date must be after pickup date');
        setPromoValid(false);
        return;
      }

      const res = await fetch('/api/promo-codes/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoCode.toUpperCase(), days, vehicleId }),
      });

      const data = await res.json();

      if (data.valid) {
        setPromoValid(true);
        setPromoError('');
      } else {
        setPromoValid(false);
        setPromoError(data.error || 'Invalid promo code');
      }
    } catch (err) {
      setPromoError('Error validating promo code');
      setPromoValid(false);
    } finally {
      setValidatingPromo(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-neutral-900 mb-6">Choose your scooter & dates</h2>

      {/* Date pickers — first so availability can be shown on cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-2">Pickup Date</label>
          <input
            type="date"
            min={today}
            value={pickupDate}
            onChange={(e) => {
              setPickupDate(e.target.value);
              if (returnDate && returnDate <= e.target.value) setReturnDate('');
              setPromoValid(false);
              setPromoError('');
            }}
            className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-neutral-900 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 bg-white"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-2">Return Date</label>
          <input
            type="date"
            min={pickupDate || today}
            value={returnDate}
            onChange={(e) => {
              setReturnDate(e.target.value);
              setPromoValid(false);
              setPromoError('');
            }}
            className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-neutral-900 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 bg-white"
          />
        </div>
      </div>

      {/* Promo code field */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-neutral-700 mb-2">Promo Code (optional)</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={promoCode}
            onChange={(e) => {
              setPromoCode(e.target.value.toUpperCase());
              setPromoValid(false);
              setPromoError('');
            }}
            placeholder="Enter promo code"
            className={`flex-1 px-4 py-3 rounded-xl border text-neutral-900 focus:outline-none focus:ring-2 transition-colors ${
              promoError
                ? 'border-red-300 focus:border-red-400 focus:ring-red-100 bg-red-50'
                : promoValid
                ? 'border-success-300 focus:border-success-400 focus:ring-success-100 bg-success-50'
                : 'border-neutral-200 focus:border-primary-400 focus:ring-primary-100 bg-white'
            }`}
          />
          <button
            onClick={handleValidatePromo}
            disabled={!promoCode || validatingPromo || !datesSet || !selectedSlug}
            className="px-4 py-3 bg-primary-500 hover:bg-primary-600 disabled:bg-neutral-200 disabled:text-neutral-400 text-white font-medium rounded-xl transition-colors"
          >
            {validatingPromo ? '...' : 'Check'}
          </button>
        </div>
        {promoError && (
          <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
            {/* @ts-ignore */}
            <Icon icon="ph:warning-fill" width={14} height={14} />
            {promoError}
          </p>
        )}
        {promoValid && (
          <p className="text-xs text-success-600 mt-2 flex items-center gap-1">
            {/* @ts-ignore */}
            <Icon icon="ph:check-circle-fill" width={14} height={14} />
            Promo code valid!
          </p>
        )}
      </div>

      {/* Availability status bar */}
      {datesSet && (
        <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium mb-5 ${
          checkingAvailability
            ? 'bg-neutral-100 text-neutral-500'
            : 'bg-neutral-50 text-neutral-600'
        }`}>
          {checkingAvailability ? (
            <>
              {/* @ts-ignore */}
              <Icon icon="ph:spinner-gap-bold" width={16} height={16} className="animate-spin" />
              Checking availability…
            </>
          ) : (
            <>
              {/* @ts-ignore */}
              <Icon icon="ph:check-circle-fill" width={16} height={16} style={{ color: '#22C55E' }} />
              Availability updated for your dates
            </>
          )}
        </div>
      )}

      {/* Vehicle grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
        {vehicles.map((v) => {
          const vehicleId = `vehicle-${vehicles.indexOf(v) + 1}`;
          const avail = !datesSet ? null : availability[v.slug];
          const unavailable = avail === false;

          return (
            <button
              key={v.slug}
              onClick={() => !unavailable && setSelectedSlug(v.slug)}
              disabled={unavailable}
              className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all relative ${
                unavailable
                  ? 'border-neutral-100 bg-neutral-50 opacity-50 cursor-not-allowed'
                  : selectedSlug === v.slug
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-neutral-200 bg-white hover:border-primary-200'
              }`}
            >
              <div className="relative w-16 h-12 rounded-lg overflow-hidden bg-neutral-100 flex-shrink-0">
                <Image src={v.image} alt={v.model} fill className="object-contain p-1" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-neutral-900 truncate">{v.brand} {v.model}</p>
                <p className="text-xs text-neutral-500">{v.engine} · {v.automatic ? 'Auto' : 'Manual'}</p>
                {datesSet && !checkingAvailability && (
                  <p className={`text-xs font-semibold mt-0.5 ${unavailable ? 'text-red-500' : 'text-green-600'}`}>
                    {unavailable ? 'Unavailable' : '✓ Available'}
                  </p>
                )}
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-bold text-neutral-900">₱{v.daily.toLocaleString('en-US')}</p>
                <p className="text-xs text-neutral-400">/day</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Unavailable warning */}
      {datesSet && !checkingAvailability && selectedSlug && !selectedAvailable && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
          {/* @ts-ignore */}
          <Icon icon="ph:warning-fill" width={18} height={18} style={{ color: '#ef4444', flexShrink: 0, marginTop: 1 }} />
          <p className="text-sm text-red-700 font-medium">
            This scooter is fully booked for your dates. Please choose another model or change your dates.
          </p>
        </div>
      )}

      <button
        onClick={onNext}
        disabled={!canNext}
        className="w-full py-4 bg-primary-500 hover:bg-primary-600 disabled:bg-neutral-200 disabled:text-neutral-400 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
      >
        Continue to Delivery
        {/* @ts-ignore */}
        <Icon icon="ph:arrow-right-bold" width={16} height={16} />
      </button>
    </div>
  );
}

// ─── Step 2: Delivery ────────────────────────────────────────────────────────
function Step2({
  deliveryType, setDeliveryType, address, setAddress, onNext, onBack,
}: {
  deliveryType: string; setDeliveryType: (t: string) => void;
  address: string; setAddress: (a: string) => void;
  onNext: () => void; onBack: () => void;
}) {
  const options = [
    { key: 'hotel', icon: 'ph:buildings-fill', label: 'Hotel / Accommodation', desc: 'We deliver to your door anywhere in Cebu & Lapu-Lapu' },
    { key: 'airport', icon: 'ph:airplane-landing-fill', label: 'Airport Pickup', desc: 'Meet at Mactan-Cebu International Airport (MCIA)' },
    { key: 'store', icon: 'ph:map-pin-fill', label: 'Pick up at our store', desc: 'Lapu-Lapu City · Free parking available' },
  ];

  const needsAddress = deliveryType === 'hotel' || deliveryType === 'airport';
  const canNext = deliveryType && (!needsAddress || address.trim().length > 3);

  return (
    <div>
      <h2 className="text-xl font-bold text-neutral-900 mb-6">How should we deliver your scooter?</h2>

      <div className="space-y-3 mb-6">
        {options.map((opt) => (
          <button
            key={opt.key}
            onClick={() => setDeliveryType(opt.key)}
            className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all ${
              deliveryType === opt.key
                ? 'border-primary-500 bg-primary-50'
                : 'border-neutral-200 bg-white hover:border-primary-200'
            }`}
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
              deliveryType === opt.key ? 'bg-primary-500' : 'bg-neutral-100'
            }`}>
              {/* @ts-ignore */}
              <Icon icon={opt.icon} width={22} height={22} style={{ color: deliveryType === opt.key ? '#fff' : '#F97316' }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-bold text-neutral-900 text-sm">{opt.label}</p>
                <span className="px-2 py-0.5 bg-success-100 text-success-700 text-xs font-bold rounded-full">FREE</span>
              </div>
              <p className="text-xs text-neutral-500 mt-0.5">{opt.desc}</p>
            </div>
          </button>
        ))}
      </div>

      {needsAddress && (
        <div className="mb-6">
          <label className="block text-sm font-semibold text-neutral-700 mb-2">
            {deliveryType === 'hotel' ? 'Hotel / Address' : 'Flight number or arrival time'}
          </label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder={deliveryType === 'hotel' ? 'e.g. Waterfront Hotel, Lahug, Cebu City' : 'e.g. PR 2819, arriving 14:30'}
            className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-neutral-900 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 bg-white"
          />
        </div>
      )}

      <div className="flex gap-3">
        <button onClick={onBack} className="flex-1 py-4 border-2 border-neutral-200 text-neutral-700 font-bold rounded-xl hover:bg-neutral-50 transition-colors">
          Back
        </button>
        <button
          onClick={onNext}
          disabled={!canNext}
          className="flex-[2] py-4 bg-primary-500 hover:bg-primary-600 disabled:bg-neutral-200 disabled:text-neutral-400 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          Continue
          {/* @ts-ignore */}
          <Icon icon="ph:arrow-right-bold" width={16} height={16} />
        </button>
      </div>
    </div>
  );
}

// ─── Step 3: Customer details ────────────────────────────────────────────────
function Step3({
  form, setForm, onNext, onBack,
}: {
  form: Record<string, string>;
  setForm: (f: Record<string, string>) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const set = (k: string, v: string) => setForm({ ...form, [k]: v });
  const emailValid = !form.email || validateEmail(form.email);
  const phoneValid = !form.phone || validatePhoneNumber(form.phone);
  const canNext = form.firstName && form.lastName && form.email && form.phone && emailValid && phoneValid;

  return (
    <div>
      <h2 className="text-xl font-bold text-neutral-900 mb-6">Your details</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-2">First name *</label>
          <input
            value={form.firstName || ''}
            onChange={(e) => set('firstName', e.target.value)}
            placeholder="John"
            className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-neutral-900 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 bg-white"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-2">Last name *</label>
          <input
            value={form.lastName || ''}
            onChange={(e) => set('lastName', e.target.value)}
            placeholder="Doe"
            className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-neutral-900 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 bg-white"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-2">Email *</label>
          <input
            type="email"
            value={form.email || ''}
            onChange={(e) => set('email', e.target.value)}
            placeholder="john@example.com"
            className={`w-full px-4 py-3 rounded-xl border text-neutral-900 focus:outline-none focus:ring-2 transition-colors ${
              form.email && !emailValid
                ? 'border-red-300 focus:border-red-400 focus:ring-red-100 bg-red-50'
                : form.email && emailValid
                ? 'border-success-300 focus:border-success-400 focus:ring-success-100 bg-success-50'
                : 'border-neutral-200 focus:border-primary-400 focus:ring-primary-100 bg-white'
            }`}
          />
          {form.email && !emailValid && (
            <p className="text-xs text-red-600 mt-1">Invalid email format</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-2">Phone / WhatsApp *</label>
          <input
            type="tel"
            value={form.phone || ''}
            onChange={(e) => set('phone', e.target.value)}
            placeholder="+63 917 123 4567 or +1 555 123 4567"
            className={`w-full px-4 py-3 rounded-xl border text-neutral-900 focus:outline-none focus:ring-2 transition-colors ${
              form.phone && !phoneValid
                ? 'border-red-300 focus:border-red-400 focus:ring-red-100 bg-red-50'
                : form.phone && phoneValid
                ? 'border-success-300 focus:border-success-400 focus:ring-success-100 bg-success-50'
                : 'border-neutral-200 focus:border-primary-400 focus:ring-primary-100 bg-white'
            }`}
          />
          {form.phone && !phoneValid && (
            <p className="text-xs text-red-600 mt-1">Phone number must be 10-15 digits</p>
          )}
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-semibold text-neutral-700 mb-2">Nationality</label>
        <input
          value={form.nationality || ''}
          onChange={(e) => set('nationality', e.target.value)}
          placeholder="French, German, Australian…"
          className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-neutral-900 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 bg-white"
        />
      </div>

      {/* Deposit notice */}
      <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 mb-6 flex items-start gap-3">
        {/* @ts-ignore */}
        <Icon icon="ph:info-fill" width={20} height={20} style={{ color: '#F97316', flexShrink: 0, marginTop: 1 }} />
        <div>
          <p className="text-sm font-semibold text-neutral-800 mb-1">Deposit on delivery</p>
          <p className="text-sm text-neutral-500">We collect a ₱2,500 refundable deposit when we deliver — either cash or a passport copy. You choose on the spot.</p>
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={onBack} className="flex-1 py-4 border-2 border-neutral-200 text-neutral-700 font-bold rounded-xl hover:bg-neutral-50 transition-colors">
          Back
        </button>
        <button
          onClick={onNext}
          disabled={!canNext}
          className="flex-[2] py-4 bg-primary-500 hover:bg-primary-600 disabled:bg-neutral-200 disabled:text-neutral-400 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          Continue to Payment
          {/* @ts-ignore */}
          <Icon icon="ph:arrow-right-bold" width={16} height={16} />
        </button>
      </div>
    </div>
  );
}

// ─── Step 4: Payment + Confirm ───────────────────────────────────────────────
function Step4({
  paymentMethod, setPaymentMethod, onBack, onSubmit, submitting,
  vehicle, days, total, form, deliveryType, pickupDate, returnDate,
}: {
  paymentMethod: string; setPaymentMethod: (m: string) => void;
  onBack: () => void; onSubmit: () => void; submitting: boolean;
  vehicle: typeof vehicles[0] | null; days: number; total: number;
  form: Record<string, string>; deliveryType: string;
  pickupDate: string; returnDate: string;
}) {
  const methods = [
    { key: 'cash_on_delivery', icon: 'ph:money-fill', label: 'Cash on Delivery', desc: 'Pay in PHP when we deliver or you pick up' },
    { key: 'gcash', icon: 'ph:device-mobile-fill', label: 'GCash', desc: 'We send you a QR code after confirmation' },
    { key: 'maya', icon: 'ph:credit-card-fill', label: 'Maya / Visa Card', desc: 'Pay link sent via WhatsApp after confirmation' },
  ];

  const deliveryLabel = deliveryType === 'hotel' ? 'Hotel delivery' : deliveryType === 'airport' ? 'Airport pickup' : 'Store pickup';

  return (
    <div>
      <h2 className="text-xl font-bold text-neutral-900 mb-6">Payment method</h2>

      <div className="space-y-3 mb-8">
        {methods.map((m) => (
          <button
            key={m.key}
            onClick={() => setPaymentMethod(m.key)}
            className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all ${
              paymentMethod === m.key
                ? 'border-primary-500 bg-primary-50'
                : 'border-neutral-200 bg-white hover:border-primary-200'
            }`}
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
              paymentMethod === m.key ? 'bg-primary-500' : 'bg-neutral-100'
            }`}>
              {/* @ts-ignore */}
              <Icon icon={m.icon} width={22} height={22} style={{ color: paymentMethod === m.key ? '#fff' : '#F97316' }} />
            </div>
            <div>
              <p className="font-bold text-neutral-900 text-sm">{m.label}</p>
              <p className="text-xs text-neutral-500 mt-0.5">{m.desc}</p>
            </div>
            {paymentMethod === m.key && (
              <div className="ml-auto">
                {/* @ts-ignore */}
                <Icon icon="ph:check-circle-fill" width={22} height={22} style={{ color: '#F97316' }} />
              </div>
            )}
          </button>
        ))}
      </div>

      {/* GCash QR Code */}
      {paymentMethod === 'gcash' && (
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border-2 border-blue-300 p-6 mb-6">
          <div className="text-center mb-4">
            <p className="text-sm font-bold text-blue-900 mb-2">💳 GCash Payment</p>
            <p className="text-xs text-blue-700">Scan the QR code to pay</p>
          </div>
          <div className="bg-white rounded-xl p-6 flex flex-col items-center mb-4">
            <Image
              src="/gcash-qr.jpg"
              alt="GCash QR Code"
              width={280}
              height={320}
              className="rounded-lg"
              priority
            />
          </div>
          <div className="bg-white/80 rounded-lg p-3 text-center text-xs text-neutral-700 space-y-1">
            <p className="font-semibold text-blue-900">KJM Motors GCash</p>
            <p>Mobile: 0975 298 4845</p>
            <p className="text-neutral-500">Transfer fees may apply</p>
          </div>
        </div>
      )}

      {/* Booking summary */}
      <div className="bg-neutral-50 rounded-xl border border-neutral-200 p-4 mb-6">
        <p className="text-sm font-bold text-neutral-800 mb-3">Booking summary</p>
        <div className="space-y-1.5 text-sm text-neutral-600">
          <div className="flex justify-between"><span>Vehicle</span><span className="font-medium text-neutral-900">{vehicle?.brand} {vehicle?.model}</span></div>
          <div className="flex justify-between"><span>Pickup</span><span className="font-medium text-neutral-900">{pickupDate}</span></div>
          <div className="flex justify-between"><span>Return</span><span className="font-medium text-neutral-900">{returnDate}</span></div>
          <div className="flex justify-between"><span>Duration</span><span className="font-medium text-neutral-900">{days} days</span></div>
          <div className="flex justify-between"><span>Delivery</span><span className="font-medium text-neutral-900">{deliveryLabel}</span></div>
          <div className="flex justify-between"><span>Name</span><span className="font-medium text-neutral-900">{form.firstName} {form.lastName}</span></div>
          <div className="flex justify-between pt-2 border-t border-neutral-200 mt-2">
            <span className="font-bold text-neutral-900">Total</span>
            <span className="font-bold text-primary-600">₱{total.toLocaleString('en-US')}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={onBack} className="flex-1 py-4 border-2 border-neutral-200 text-neutral-700 font-bold rounded-xl hover:bg-neutral-50 transition-colors">
          Back
        </button>
        <button
          onClick={onSubmit}
          disabled={!paymentMethod || submitting}
          className="flex-[2] py-4 bg-primary-500 hover:bg-primary-600 disabled:bg-neutral-200 disabled:text-neutral-400 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          {submitting ? 'Confirming…' : 'Confirm Booking'}
          {!submitting && <Icon icon="ph:check-bold" width={16} height={16} />}
        </button>
      </div>
    </div>
  );
}

// ─── Confirmation screen ─────────────────────────────────────────────────────
function Confirmation({ reference, vehicle, total }: { reference: string; vehicle: typeof vehicles[0] | null; total: number }) {
  const [downloading, setDownloading] = useState(false);

  const handleDownloadContract = async () => {
    setDownloading(true);
    try {
      const response = await fetch(`/api/contracts/download?reference=${reference}&format=html`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `KJM-Contract-${reference}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Error downloading contract:', err);
      alert('Failed to download contract');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="text-center py-8">
      <div className="w-20 h-20 rounded-full bg-success-100 flex items-center justify-center mx-auto mb-6">
        {/* @ts-ignore */}
        <Icon icon="ph:check-circle-fill" width={48} height={48} style={{ color: '#22C55E' }} />
      </div>
      <h2 className="text-2xl font-bold text-neutral-900 mb-2">🎉 Booking Confirmed!</h2>
      <p className="text-neutral-500 mb-6">Your rental agreement has been signed and your booking is confirmed.</p>

      <div className="bg-neutral-50 rounded-2xl border border-neutral-200 p-6 mb-6 text-left max-w-sm mx-auto">
        <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1">Booking Reference</p>
        <p className="text-2xl font-bold text-primary-600 mb-4">{reference}</p>
        {vehicle && (
          <>
            <p className="text-sm text-neutral-500 mb-1">Vehicle</p>
            <p className="font-semibold text-neutral-900 mb-3">{vehicle.brand} {vehicle.model}</p>
          </>
        )}
        <p className="text-sm text-neutral-500 mb-1">Total</p>
        <p className="font-bold text-neutral-900">₱{total.toLocaleString('en-US')} + ₱2,500 deposit</p>

        <div className="mt-4 pt-4 border-t border-neutral-200">
          <p className="text-xs text-success-600 font-semibold">✓ Contract Signed</p>
          <p className="text-xs text-success-600 font-semibold">✓ Documents Uploaded</p>
        </div>
      </div>

      <div className="space-y-3 max-w-sm mx-auto">
        <button
          onClick={handleDownloadContract}
          disabled={downloading}
          className="w-full inline-flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 disabled:bg-neutral-200 disabled:text-neutral-400 text-white font-bold px-8 py-4 rounded-xl transition-colors"
        >
          {/* @ts-ignore */}
          <Icon icon={downloading ? 'ph:spinner-gap-bold' : 'ph:download-simple-bold'} width={20} height={20} className={downloading ? 'animate-spin' : ''} />
          {downloading ? 'Downloading...' : 'Download Contract'}
        </button>

        <a
          href={`https://wa.me/639752984845?text=Hi! My booking reference is ${reference}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full inline-flex items-center justify-center gap-2 bg-success-500 hover:bg-success-600 text-white font-bold px-8 py-4 rounded-xl transition-colors"
        >
          {/* @ts-ignore */}
          <Icon icon="logos:whatsapp-icon" width={22} height={22} />
          Message us on WhatsApp
        </a>

        <Link href="/" className="w-full inline-flex items-center justify-center gap-2 bg-white border-2 border-neutral-200 text-neutral-700 font-bold px-8 py-4 rounded-xl hover:bg-neutral-50 transition-colors">
          Back to Home
        </Link>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
function BookingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [selectedSlug, setSelectedSlug] = useState(searchParams.get('vehicle') || '');
  const [pickupDate, setPickupDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [promoValid, setPromoValid] = useState(false);
  const [promoError, setPromoError] = useState('');
  const [deliveryType, setDeliveryType] = useState('');
  const [address, setAddress] = useState('');
  const [form, setForm] = useState<Record<string, string>>({});
  const [paymentMethod, setPaymentMethod] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [reference, setReference] = useState('');
  const [availability, setAvailability] = useState<Record<string, boolean>>({});
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [pricing, setPricing] = useState<any>(null);

  // Check all vehicles whenever dates change
  useEffect(() => {
    if (!pickupDate || !returnDate || returnDate <= pickupDate) {
      setAvailability({});
      return;
    }
    let cancelled = false;
    setCheckingAvailability(true);
    Promise.all(
      vehicles.map(async (v, i) => {
        const vehicleId = `vehicle-${i + 1}`;
        const res = await fetch(`/api/availability?vehicleId=${vehicleId}&pickupDate=${pickupDate}&returnDate=${returnDate}`);
        const data = await res.json();
        return { slug: v.slug, available: data.available as boolean };
      })
    ).then((results) => {
      if (cancelled) return;
      const map: Record<string, boolean> = {};
      results.forEach(({ slug, available }) => { map[slug] = available; });
      setAvailability(map);
      setCheckingAvailability(false);
    }).catch(() => { if (!cancelled) setCheckingAvailability(false); });
    return () => { cancelled = true; };
  }, [pickupDate, returnDate]);

  const vehicle = vehicles.find((v) => v.slug === selectedSlug) || null;
  const days = pickupDate && returnDate ? daysBetween(pickupDate, returnDate) : 1;
  const vehicleId = vehicle ? `vehicle-${vehicles.findIndex((v) => v.slug === selectedSlug) + 1}` : '';

  // Use pricing from API if available, otherwise fallback to local calculation
  const total = pricing?.finalPrice || (vehicle ? calcPrice(vehicle.daily, vehicle.weekly, vehicle.monthly, days) : 0);

  const handleSubmit = async () => {
    if (!vehicle) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicleId,
          pickupDate,
          returnDate,
          pickupLocation: deliveryType,
          pickupAddress: address,
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone,
          nationality: form.nationality,
          paymentMethod,
          totalPrice: total,
          depositMethod: 'cash',
          promoCode: promoCode || null,
        }),
      });
      const data = await res.json();
      if (data.reference) {
        setReference(data.reference);
        setStep(5); // Go to contract signing
      }
    } catch {
      alert('Something went wrong. Please try again or call us directly.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-neutral-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200 px-4 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">K</span>
            </div>
            <span className="font-bold text-neutral-900">KJM</span>
          </Link>
          <a href="tel:+639752984845" className="flex items-center gap-1.5 text-sm font-medium text-neutral-600 hover:text-primary-600">
            {/* @ts-ignore */}
            <Icon icon="ph:phone-fill" width={16} height={16} />
            +63 975 298 4845
          </a>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {step < 6 && (
          <div className="mb-8">
            <StepBar step={step} />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 sm:p-8">
              {step === 1 && (
                <Step1
                  selectedSlug={selectedSlug} setSelectedSlug={setSelectedSlug}
                  pickupDate={pickupDate} setPickupDate={setPickupDate}
                  returnDate={returnDate} setReturnDate={setReturnDate}
                  onNext={() => setStep(2)}
                  availability={availability}
                  checkingAvailability={checkingAvailability}
                  promoCode={promoCode} setPromoCode={setPromoCode}
                  promoValid={promoValid} setPromoValid={setPromoValid}
                  promoError={promoError} setPromoError={setPromoError}
                />
              )}
              {step === 2 && (
                <Step2
                  deliveryType={deliveryType} setDeliveryType={setDeliveryType}
                  address={address} setAddress={setAddress}
                  onNext={() => setStep(3)} onBack={() => setStep(1)}
                />
              )}
              {step === 3 && (
                <Step3
                  form={form} setForm={setForm}
                  onNext={() => setStep(4)} onBack={() => setStep(2)}
                />
              )}
              {step === 4 && (
                <Step4
                  paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod}
                  onBack={() => setStep(3)} onSubmit={handleSubmit} submitting={submitting}
                  vehicle={vehicle} days={days} total={total}
                  form={form} deliveryType={deliveryType}
                  pickupDate={pickupDate} returnDate={returnDate}
                />
              )}
              {step === 5 && reference && vehicle && (
                <ContractSigner
                  bookingReference={reference}
                  customerName={`${form.firstName} ${form.lastName}`}
                  customerEmail={form.email}
                  vehicleModel={`${vehicle.brand} ${vehicle.model}`}
                  pickupDate={pickupDate}
                  returnDate={returnDate}
                  onComplete={() => setStep(6)}
                  onBack={() => setStep(4)}
                />
              )}
              {step === 6 && (
                <Confirmation reference={reference} vehicle={vehicle} total={total} />
              )}
            </div>
          </div>

          {/* Sidebar */}
          {step < 5 && vehicle && (
            <div className="lg:col-span-1">
              <PriceSidebar
                vehicle={vehicle}
                days={days}
                vehicleId={vehicleId}
                pickupDate={pickupDate}
                returnDate={returnDate}
                promoCode={promoCode}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-neutral-50 flex items-center justify-center"><p className="text-neutral-500">Loading…</p></div>}>
      <BookingContent />
    </Suspense>
  );
}
