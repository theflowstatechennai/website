'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

type Booking = {
  id: string;
  user_name: string;
  user_email: string;
  user_phone: string | null;
  amount: number;
  payment_status: string;
  razorpay_order_id: string;
  razorpay_payment_id: string | null;
  booked_at: string;
  events: {
    title: string;
    date: string;
    start_time: string;
    end_time: string;
    cafe_name: string;
  };
};

function BookingsContent() {
  const searchParams = useSearchParams();
  const eventId = searchParams.get('event_id');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, [eventId]);

  const fetchBookings = async () => {
    try {
      const url = eventId
        ? `/api/admin/bookings?event_id=${eventId}`
        : '/api/admin/bookings';

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setBookings(data.bookings);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Event', 'Date', 'Time', 'Cafe', 'Amount', 'Status', 'Booked At'];
    const rows = bookings.map((b) => [
      b.user_name,
      b.user_email,
      b.user_phone || 'N/A',
      b.events.title,
      new Date(b.events.date).toLocaleDateString('en-IN'),
      `${b.events.start_time} - ${b.events.end_time}`,
      b.events.cafe_name,
      `₹${b.amount}`,
      b.payment_status,
      new Date(b.booked_at).toLocaleString('en-IN'),
    ]);

    const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bookings-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#EDECE8]">
        <p className="text-[#415049]">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EDECE8]">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-[#415049]">
              {eventId ? 'Event Bookings' : 'All Bookings'}
            </h1>
            <div className="flex gap-3">
              {bookings.length > 0 && (
                <Button onClick={exportToCSV} variant="outline">
                  Export to CSV
                </Button>
              )}
              <Link href="/admin">
                <Button variant="outline">← Back to Dashboard</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {bookings.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No bookings yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Attendee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Event Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Booked At
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bookings.map((booking) => (
                    <tr key={booking.id}>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{booking.user_name}</div>
                        <div className="text-sm text-gray-500">{booking.user_email}</div>
                        {booking.user_phone && (
                          <div className="text-sm text-gray-500">{booking.user_phone}</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{booking.events.title}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(booking.events.date).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </div>
                        <div className="text-sm text-gray-500">
                          {booking.events.start_time} - {booking.events.end_time}
                        </div>
                        <div className="text-sm text-gray-500">{booking.events.cafe_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">₹{booking.amount}</div>
                        <div className="text-xs text-gray-500">{booking.razorpay_payment_id || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            booking.payment_status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : booking.payment_status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {booking.payment_status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(booking.booked_at).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function BookingsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#EDECE8]"><p>Loading...</p></div>}>
      <BookingsContent />
    </Suspense>
  );
}
