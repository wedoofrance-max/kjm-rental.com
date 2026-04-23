'use client';

import { useState, useMemo } from 'react';
import { getDaysInMonth, getDay, formatISO, parseISO } from 'date-fns';
import { Icon } from '../ui/Icon';

interface CalendarBooking {
  date: string;
  count: number;
  bookings: Array<{ reference: string; customer: string; vehicle: string }>;
}

export default function BookingCalendar({
  bookings,
  isDark,
}: {
  bookings: Array<{
    pickupDate: string;
    reference: string;
    customer: { firstName: string; lastName: string };
    vehicle: { brand: string; model: string };
  }>;
  isDark: boolean;
}) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Calculate booking density by date
  const bookingsByDate = useMemo(() => {
    const map: Record<string, CalendarBooking> = {};

    bookings.forEach((booking) => {
      const date = booking.pickupDate.split('T')[0];
      if (!map[date]) {
        map[date] = { date, count: 0, bookings: [] };
      }
      map[date].count += 1;
      map[date].bookings.push({
        reference: booking.reference,
        customer: `${booking.customer.firstName} ${booking.customer.lastName}`,
        vehicle: `${booking.vehicle.brand} ${booking.vehicle.model}`,
      });
    });

    return map;
  }, [bookings]);

  const month = currentMonth.getMonth();
  const year = currentMonth.getFullYear();
  const daysInMonth = getDaysInMonth(new Date(year, month));
  const firstDayOfMonth = getDay(new Date(year, month, 1));

  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  // Get max bookings for color intensity
  const maxBookings = Math.max(...Object.values(bookingsByDate).map((b) => b.count), 1);

  const getBackgroundColor = (bookingCount: number) => {
    if (bookingCount === 0) return isDark ? 'bg-neutral-800' : 'bg-neutral-50';

    const intensity = bookingCount / maxBookings;
    if (intensity > 0.75) {
      return isDark ? 'bg-green-900/60' : 'bg-green-200';
    } else if (intensity > 0.5) {
      return isDark ? 'bg-green-900/40' : 'bg-green-100';
    } else if (intensity > 0.25) {
      return isDark ? 'bg-yellow-900/40' : 'bg-yellow-100';
    }
    return isDark ? 'bg-blue-900/30' : 'bg-blue-50';
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(year, month - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1));
  };

  const selectedDateData = selectedDate ? bookingsByDate[selectedDate] : null;
  const monthName = currentMonth.toLocaleString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className={`rounded-lg p-6 ${isDark ? 'bg-neutral-800' : 'bg-neutral-50'}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          {/* @ts-ignore */}
          <Icon icon="ph:calendar-blank-bold" width={24} height={24} className="text-primary-500" />
          <h4 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-neutral-900'}`}>
            Booking Calendar
          </h4>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handlePrevMonth}
            className={`px-3 py-2 rounded-lg font-bold ${
              isDark
                ? 'bg-neutral-700 hover:bg-neutral-600 text-white'
                : 'bg-neutral-200 hover:bg-neutral-300 text-neutral-900'
            }`}
          >
            ← Prev
          </button>
          <span className={`px-4 py-2 rounded-lg font-bold ${isDark ? 'bg-neutral-700 text-white' : 'bg-neutral-200 text-neutral-900'}`}>
            {monthName}
          </span>
          <button
            onClick={handleNextMonth}
            className={`px-3 py-2 rounded-lg font-bold ${
              isDark
                ? 'bg-neutral-700 hover:bg-neutral-600 text-white'
                : 'bg-neutral-200 hover:bg-neutral-300 text-neutral-900'
            }`}
          >
            Next →
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-6">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div
            key={day}
            className={`text-center font-bold text-sm py-2 ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}
          >
            {day}
          </div>
        ))}

        {days.map((day, idx) => {
          const dateStr = day ? `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` : '';
          const bookingData = day ? bookingsByDate[dateStr] : null;
          const isSelected = selectedDate === dateStr;

          return (
            <button
              key={idx}
              onClick={() => day && setSelectedDate(isSelected ? null : dateStr)}
              className={`aspect-square rounded-lg p-1 text-xs font-bold transition-all ${
                day
                  ? `${getBackgroundColor(bookingData?.count ?? 0)} ${
                      isSelected
                        ? isDark
                          ? 'ring-2 ring-primary-500 text-white'
                          : 'ring-2 ring-primary-500 text-neutral-900'
                        : isDark
                        ? 'text-white hover:ring-1 hover:ring-primary-400'
                        : 'text-neutral-900 hover:ring-1 hover:ring-primary-400'
                    }`
                  : ''
              }`}
            >
              {day && (
                <div className="flex flex-col items-center justify-center h-full">
                  <span>{day}</span>
                  {bookingData && bookingData.count > 0 && (
                    <span className={`text-[10px] font-bold ${isDark ? 'text-primary-300' : 'text-primary-600'}`}>
                      {bookingData.count}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex gap-4 mb-6 text-xs">
        <div className="flex items-center gap-2">
          <div className={`w-4 h-4 rounded ${isDark ? 'bg-blue-900/30' : 'bg-blue-50'}`} />
          <span className={isDark ? 'text-neutral-400' : 'text-neutral-600'}>1-2</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-4 h-4 rounded ${isDark ? 'bg-yellow-900/40' : 'bg-yellow-100'}`} />
          <span className={isDark ? 'text-neutral-400' : 'text-neutral-600'}>3-4</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-4 h-4 rounded ${isDark ? 'bg-green-900/40' : 'bg-green-100'}`} />
          <span className={isDark ? 'text-neutral-400' : 'text-neutral-600'}>5-6</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-4 h-4 rounded ${isDark ? 'bg-green-900/60' : 'bg-green-200'}`} />
          <span className={isDark ? 'text-neutral-400' : 'text-neutral-600'}>7+</span>
        </div>
      </div>

      {/* Selected Date Details */}
      {selectedDateData && (
        <div className={`rounded-lg p-4 ${isDark ? 'bg-neutral-700' : 'bg-white'}`}>
          <h5 className={`font-bold mb-3 ${isDark ? 'text-white' : 'text-neutral-900'}`}>
            {new Date(selectedDateData.date + 'T00:00:00').toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'short',
              day: 'numeric',
            })}
            ({selectedDateData.count} booking{selectedDateData.count !== 1 ? 's' : ''})
          </h5>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {selectedDateData.bookings.map((booking, idx) => (
              <div key={idx} className={`text-xs p-2 rounded ${isDark ? 'bg-neutral-600' : 'bg-neutral-50'}`}>
                <p className={`font-mono font-bold ${isDark ? 'text-primary-300' : 'text-primary-600'}`}>
                  {booking.reference}
                </p>
                <p className={isDark ? 'text-neutral-300' : 'text-neutral-700'}>{booking.customer}</p>
                <p className={isDark ? 'text-neutral-400' : 'text-neutral-600'}>{booking.vehicle}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
