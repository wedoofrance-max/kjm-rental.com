'use client';

import { useEffect, useState } from 'react';
import { Icon } from '../ui/Icon';

interface Booking {
  id: string;
  reference: string;
  status: string;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  vehicle: {
    brand: string;
    model: string;
  };
  fleetUnit?: {
    unitNumber: string;
    licensePlate: string;
  };
  pickupDate: string;
  returnDate: string;
  totalPrice: number;
  finalPrice: number;
  contractSigned?: boolean;
  signedAt?: string;
}

export default function BookingsPanel({ isDark }: { isDark: boolean }) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, confirmed, active
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/bookings?limit=100');
      const data = await res.json();
      if (Array.isArray(data)) {
        setBookings(data);
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckStatus = async (booking: Booking) => {
    try {
      const res = await fetch(`/api/contracts/status?reference=${booking.reference}`);
      const data = await res.json();
      setSelectedBooking({
        ...booking,
        contractSigned: data.contractSigned,
        signedAt: data.signedAt,
      });
      setShowDetails(true);
    } catch (err) {
      console.error('Error checking status:', err);
    }
  };

  const filteredBookings = filter === 'all'
    ? bookings
    : bookings.filter(b => b.status === filter);

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    active: bookings.filter(b => b.status === 'active').length,
    unsigned: bookings.filter(b => b.status === 'pending').length, // All pending have unsigned contracts
  };

  return (
    <div className="space-y-6">
      {/* Header & Stats */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-neutral-900'}`}>
              📋 Bookings Management
            </h3>
            <p className={`text-sm mt-1 ${isDark ? 'text-neutral-500' : 'text-neutral-600'}`}>
              View all bookings and contract signing status
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { label: 'Total', value: stats.total, color: 'text-blue-400' },
            { label: 'Pending', value: stats.pending, color: 'text-yellow-400' },
            { label: 'Confirmed', value: stats.confirmed, color: 'text-green-400' },
            { label: 'Active', value: stats.active, color: 'text-purple-400' },
            { label: 'Unsigned', value: stats.unsigned, color: 'text-red-400' },
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

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-neutral-200">
        {['all', 'pending', 'confirmed', 'active'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-3 font-medium border-b-2 transition-colors capitalize ${
              filter === tab
                ? 'border-primary-500 text-primary-600'
                : isDark
                ? 'border-transparent text-neutral-400 hover:text-neutral-300'
                : 'border-transparent text-neutral-600 hover:text-neutral-900'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Bookings Table */}
      {loading ? (
        <p className={`text-sm ${isDark ? 'text-neutral-500' : 'text-neutral-600'}`}>Loading bookings...</p>
      ) : filteredBookings.length === 0 ? (
        <div className={`text-center py-8 rounded-lg ${isDark ? 'bg-neutral-800' : 'bg-neutral-50'}`}>
          <p className={`text-sm ${isDark ? 'text-neutral-500' : 'text-neutral-600'}`}>
            No bookings found
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className={`border-b ${isDark ? 'bg-neutral-800 border-neutral-700' : 'bg-neutral-50 border-neutral-200'}`}>
                <th className={`text-left px-4 py-3 font-semibold ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>Reference</th>
                <th className={`text-left px-4 py-3 font-semibold ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>Customer</th>
                <th className={`text-left px-4 py-3 font-semibold ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>Vehicle</th>
                <th className={`text-left px-4 py-3 font-semibold ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>Plate</th>
                <th className={`text-left px-4 py-3 font-semibold ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>Status</th>
                <th className={`text-left px-4 py-3 font-semibold ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>Contract</th>
                <th className={`text-center px-4 py-3 font-semibold ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((booking) => (
                <tr
                  key={booking.id}
                  className={`border-b ${isDark ? 'border-neutral-700 hover:bg-neutral-800' : 'border-neutral-200 hover:bg-neutral-50'}`}
                >
                  <td className={`px-4 py-3 font-mono font-bold text-primary-600`}>
                    {booking.reference}
                  </td>
                  <td className={`px-4 py-3 ${isDark ? 'text-neutral-300' : 'text-neutral-900'}`}>
                    <div className="font-medium">
                      {booking.customer.firstName} {booking.customer.lastName}
                    </div>
                    <div className={`text-xs ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>
                      {booking.customer.email}
                    </div>
                  </td>
                  <td className={`px-4 py-3 ${isDark ? 'text-neutral-300' : 'text-neutral-900'}`}>
                    {booking.vehicle.brand} {booking.vehicle.model}
                  </td>
                  <td className={`px-4 py-3 font-mono font-bold ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>
                    {booking.fleetUnit?.licensePlate || 'TBD'}
                  </td>
                  <td className={`px-4 py-3`}>
                    <span
                      className={`px-2 py-1 rounded text-xs font-bold ${
                        booking.status === 'pending'
                          ? isDark
                            ? 'bg-yellow-900 text-yellow-200'
                            : 'bg-yellow-100 text-yellow-700'
                          : booking.status === 'confirmed'
                          ? isDark
                            ? 'bg-green-900 text-green-200'
                            : 'bg-green-100 text-green-700'
                          : booking.status === 'active'
                          ? isDark
                            ? 'bg-blue-900 text-blue-200'
                            : 'bg-blue-100 text-blue-700'
                          : isDark
                          ? 'bg-neutral-700 text-neutral-200'
                          : 'bg-neutral-200 text-neutral-700'
                      }`}
                    >
                      {booking.status}
                    </span>
                  </td>
                  <td className={`px-4 py-3`}>
                    {booking.status === 'pending' ? (
                      <span className={`flex items-center gap-1 text-xs font-bold ${isDark ? 'text-red-300' : 'text-red-600'}`}>
                        {/* @ts-ignore */}
                        <Icon icon="ph:x-circle-fill" width={14} height={14} />
                        Pending
                      </span>
                    ) : (
                      <span className={`flex items-center gap-1 text-xs font-bold ${isDark ? 'text-green-300' : 'text-green-600'}`}>
                        {/* @ts-ignore */}
                        <Icon icon="ph:check-circle-fill" width={14} height={14} />
                        Signed
                      </span>
                    )}
                  </td>
                  <td className={`px-4 py-3 text-center`}>
                    <button
                      onClick={() => handleCheckStatus(booking)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                        isDark
                          ? 'bg-primary-600 hover:bg-primary-500 text-white'
                          : 'bg-primary-500 hover:bg-primary-600 text-white'
                      }`}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Details Modal */}
      {showDetails && selectedBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${isDark ? 'bg-neutral-900' : 'bg-white'} rounded-2xl max-w-md w-full p-6`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-neutral-900'}`}>
                Booking Details
              </h3>
              <button
                onClick={() => setShowDetails(false)}
                className={`text-2xl ${isDark ? 'text-neutral-400 hover:text-neutral-300' : 'text-neutral-400 hover:text-neutral-600'}`}
              >
                ×
              </button>
            </div>

            <div className={`space-y-3 mb-6 p-4 rounded-lg ${isDark ? 'bg-neutral-800' : 'bg-neutral-50'}`}>
              <div>
                <p className={`text-xs ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>Reference</p>
                <p className={`font-bold ${isDark ? 'text-white' : 'text-neutral-900'}`}>
                  {selectedBooking.reference}
                </p>
              </div>
              <div>
                <p className={`text-xs ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>Customer</p>
                <p className={`font-bold ${isDark ? 'text-white' : 'text-neutral-900'}`}>
                  {selectedBooking.customer.firstName} {selectedBooking.customer.lastName}
                </p>
              </div>
              <div>
                <p className={`text-xs ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>Vehicle</p>
                <p className={`font-bold ${isDark ? 'text-white' : 'text-neutral-900'}`}>
                  {selectedBooking.vehicle.brand} {selectedBooking.vehicle.model}
                </p>
              </div>
              <div>
                <p className={`text-xs ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>Plate Number</p>
                <p className={`font-bold text-yellow-500`}>
                  {selectedBooking.fleetUnit?.licensePlate || 'TBD'}
                </p>
              </div>
              <div>
                <p className={`text-xs ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>Contract Status</p>
                <p className={`font-bold flex items-center gap-2 ${
                  selectedBooking.contractSigned ? 'text-green-500' : 'text-red-500'
                }`}>
                  {selectedBooking.contractSigned ? (
                    <>
                      {/* @ts-ignore */}
                      <Icon icon="ph:check-circle-fill" width={16} height={16} />
                      Signed
                    </>
                  ) : (
                    <>
                      {/* @ts-ignore */}
                      <Icon icon="ph:x-circle-fill" width={16} height={16} />
                      Not Signed
                    </>
                  )}
                </p>
                {selectedBooking.signedAt && (
                  <p className={`text-xs mt-1 ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>
                    Signed: {new Date(selectedBooking.signedAt).toLocaleString()}
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={() => setShowDetails(false)}
              className={`w-full py-3 rounded-xl font-bold transition-colors ${
                isDark
                  ? 'bg-primary-600 hover:bg-primary-500 text-white'
                  : 'bg-primary-500 hover:bg-primary-600 text-white'
              }`}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
