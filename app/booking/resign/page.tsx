'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Icon } from '../../../components/ui/Icon';
import ContractSigner from '../../../components/booking/ContractSigner';

interface BookingData {
  reference: string;
  customer: { firstName: string; lastName: string; email: string; phone: string };
  vehicle: { brand: string; model: string };
  pickupDate: string;
  returnDate: string;
  totalPrice: number;
  finalPrice: number;
}

function ResignContent() {
  const searchParams = useSearchParams();
  const reference = searchParams.get('reference');
  const [booking, setBooking] = useState<BookingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (!reference) {
      setError('Missing booking reference');
      setLoading(false);
      return;
    }

    fetch(`/api/bookings/details?reference=${reference}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.booking) {
          setBooking(data.booking);
        } else {
          setError(data.error || 'Booking not found');
        }
      })
      .catch(() => setError('Failed to load booking'))
      .finally(() => setLoading(false));
  }, [reference]);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <p className="text-neutral-500">Loading booking...</p>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <Icon icon="ph:warning-fill" width={32} height={32} style={{ color: '#dc2626' }} />
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">Unable to load contract</h1>
          <p className="text-neutral-500 mb-6">{error || 'This booking could not be found'}</p>
          <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 text-white font-bold rounded-xl hover:bg-primary-600">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-success-100 flex items-center justify-center mx-auto mb-6">
            <Icon icon="ph:check-circle-fill" width={48} height={48} style={{ color: '#22C55E' }} />
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">✅ Contract Re-Signed!</h1>
          <p className="text-neutral-500 mb-6">Your renewed rental agreement has been signed successfully.</p>
          <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 mb-6">
            <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1">Reference</p>
            <p className="text-xl font-bold text-primary-600">{booking.reference}</p>
          </div>
          <a href={`https://wa.me/639752984845?text=Hi! I just re-signed contract for ${booking.reference}`} target="_blank" className="block w-full py-3 bg-success-500 text-white font-bold rounded-xl hover:bg-success-600 mb-3">
            Message us on WhatsApp
          </a>
          <Link href="/" className="block w-full py-3 border-2 border-neutral-200 text-neutral-700 font-bold rounded-xl hover:bg-neutral-50">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

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
            <Icon icon="ph:phone-fill" width={16} height={16} />
            +63 975 298 4845
          </a>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Renewal Notice */}
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-5 mb-6">
          <div className="flex items-start gap-3">
            <Icon icon="ph:warning-fill" width={24} height={24} style={{ color: '#d97706', flexShrink: 0, marginTop: 2 }} />
            <div>
              <h2 className="font-bold text-yellow-900 mb-1">Contract Renewal Required</h2>
              <p className="text-sm text-yellow-800">
                Your rental has been extended to <strong>{new Date(booking.returnDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>.
                Please review and re-sign the updated contract to confirm the renewal.
              </p>
            </div>
          </div>
        </div>

        {/* Updated booking details */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-6 mb-6">
          <h3 className="font-bold text-neutral-900 mb-4">Updated Rental Details</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-neutral-500">Reference</span>
              <span className="font-mono font-bold text-primary-600">{booking.reference}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Vehicle</span>
              <span className="font-semibold text-neutral-900">{booking.vehicle.brand} {booking.vehicle.model}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Pickup</span>
              <span className="font-semibold text-neutral-900">{new Date(booking.pickupDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">New Return</span>
              <span className="font-semibold text-success-600">{new Date(booking.returnDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-neutral-200 mt-2">
              <span className="font-bold text-neutral-900">New Total</span>
              <span className="font-bold text-primary-600">₱{(booking.finalPrice || booking.totalPrice).toLocaleString('en-US')}</span>
            </div>
          </div>
        </div>

        {/* Contract Signing */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-6">
          <ContractSigner
            bookingReference={booking.reference}
            customerName={`${booking.customer.firstName} ${booking.customer.lastName}`}
            customerEmail={booking.customer.email}
            vehicleModel={`${booking.vehicle.brand} ${booking.vehicle.model}`}
            pickupDate={booking.pickupDate}
            returnDate={booking.returnDate}
            onComplete={() => setCompleted(true)}
            onBack={() => window.history.back()}
          />
        </div>
      </div>
    </div>
  );
}

export default function ResignPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-neutral-50 flex items-center justify-center"><p className="text-neutral-500">Loading…</p></div>}>
      <ResignContent />
    </Suspense>
  );
}
