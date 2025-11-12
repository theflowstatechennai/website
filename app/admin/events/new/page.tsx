'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

type Cafe = {
  id: string;
  name: string;
  address: string;
  maps_link: string;
};

export default function NewEventPage() {
  const router = useRouter();
  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [loading, setLoading] = useState(false);
  const [useExistingCafe, setUseExistingCafe] = useState(false);
  const [selectedCafe, setSelectedCafe] = useState<Cafe | null>(null);

  const [formData, setFormData] = useState({
    title: 'FlowState Session',
    date: '',
    start_time: '10:00',
    end_time: '13:00',
    total_seats: 8,
    cafe_name: '',
    cafe_address: '',
    cafe_maps_link: '',
    price: 600,
  });

  useEffect(() => {
    fetchCafes();
  }, []);

  const fetchCafes = async () => {
    try {
      const response = await fetch('/api/admin/cafes');
      if (response.ok) {
        const data = await response.json();
        setCafes(data.cafes);
      }
    } catch (error) {
      console.error('Error fetching cafes:', error);
    }
  };

  const handleCafeSelect = (cafeId: string) => {
    const cafe = cafes.find((c) => c.id === cafeId);
    if (cafe) {
      setSelectedCafe(cafe);
      setFormData({
        ...formData,
        cafe_name: cafe.name,
        cafe_address: cafe.address,
        cafe_maps_link: cafe.maps_link,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/admin/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to create event');
      }

      router.push('/admin');
    } catch (error) {
      console.error('Error creating event:', error);
      alert('Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#EDECE8]">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-[#415049]">Create New Event</h1>
            <Link href="/admin">
              <Button variant="outline">← Back to Dashboard</Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Event Title */}
            <div>
              <label className="block text-sm font-medium text-[#415049] mb-2">
                Event Title
              </label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-[#415049] mb-2">
                Date
              </label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>

            {/* Time Range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#415049] mb-2">
                  Start Time
                </label>
                <Input
                  type="time"
                  value={formData.start_time}
                  onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#415049] mb-2">
                  End Time
                </label>
                <Input
                  type="time"
                  value={formData.end_time}
                  onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Total Seats and Price */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#415049] mb-2">
                  Total Seats
                </label>
                <Input
                  type="number"
                  min="1"
                  value={formData.total_seats}
                  onChange={(e) => setFormData({ ...formData, total_seats: parseInt(e.target.value) })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#415049] mb-2">
                  Price (₹)
                </label>
                <Input
                  type="number"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  required
                />
              </div>
            </div>

            {/* Cafe Selection Toggle */}
            {cafes.length > 0 && (
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="useExisting"
                  checked={useExistingCafe}
                  onChange={(e) => {
                    setUseExistingCafe(e.target.checked);
                    if (!e.target.checked) {
                      setFormData({
                        ...formData,
                        cafe_name: '',
                        cafe_address: '',
                        cafe_maps_link: '',
                      });
                    }
                  }}
                  className="rounded"
                />
                <label htmlFor="useExisting" className="text-sm text-[#415049]">
                  Use existing cafe
                </label>
              </div>
            )}

            {/* Existing Cafe Dropdown */}
            {useExistingCafe && cafes.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-[#415049] mb-2">
                  Select Cafe
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  onChange={(e) => handleCafeSelect(e.target.value)}
                  value={selectedCafe?.id || ''}
                >
                  <option value="">-- Select a cafe --</option>
                  {cafes.map((cafe) => (
                    <option key={cafe.id} value={cafe.id}>
                      {cafe.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* New Cafe Details */}
            {!useExistingCafe && (
              <>
                <div>
                  <label className="block text-sm font-medium text-[#415049] mb-2">
                    Cafe Name
                  </label>
                  <Input
                    value={formData.cafe_name}
                    onChange={(e) => setFormData({ ...formData, cafe_name: e.target.value })}
                    placeholder="e.g., Chamiers Cafe"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#415049] mb-2">
                    Cafe Address
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows={3}
                    value={formData.cafe_address}
                    onChange={(e) => setFormData({ ...formData, cafe_address: e.target.value })}
                    placeholder="Full address"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#415049] mb-2">
                    Google Maps Link
                  </label>
                  <Input
                    type="url"
                    value={formData.cafe_maps_link}
                    onChange={(e) => setFormData({ ...formData, cafe_maps_link: e.target.value })}
                    placeholder="https://maps.app.goo.gl/..."
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This link will be included in the calendar invite
                  </p>
                </div>
              </>
            )}

            {/* Submit Button */}
            <div className="flex justify-end gap-3 pt-4">
              <Link href="/admin">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={loading}
                className="bg-[#7F654E] hover:bg-[#6a5441]"
              >
                {loading ? 'Creating...' : 'Create Event'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
