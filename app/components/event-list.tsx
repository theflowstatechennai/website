'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Users, IndianRupee } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Event {
  id: string;
  title: string;
  date: string;
  start_time: string;
  end_time: string;
  availableSeats: number;
  totalSeats: number;
  price: number;
  cafe_name: string;
  cafe_address: string;
  cafe_maps_link: string;
}

interface EventListProps {
  onBook: (data: {
    name: string;
    email: string;
    phone?: string;
    eventId: string;
    price: number;
    date: string;
    slot: string;
  }) => Promise<void>;
  isLoading?: boolean;
}

export function EventList({ onBook, isLoading = false }: EventListProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events');
      const data = await response.json();
      const fetchedEvents = data.events || [];
      setEvents(fetchedEvents);

      // Auto-select the first available date
      if (fetchedEvents.length > 0) {
        setSelectedDate(fetchedEvents[0].date);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatDatePill = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Check if it's today or tomorrow
    if (date.toDateString() === today.toDateString()) {
      return {
        day: 'Today',
        date: date.getDate().toString(),
        month: date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()
      };
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return {
        day: 'Tomorrow',
        date: date.getDate().toString(),
        month: date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()
      };
    } else {
      return {
        day: date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
        date: date.getDate().toString(),
        month: date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()
      };
    }
  };

  const handleBookClick = (event: Event) => {
    setSelectedEvent(event);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !selectedEvent) {
      alert('Please fill in all required fields');
      return;
    }

    const slot = `${selectedEvent.date} | ${selectedEvent.start_time}`;

    await onBook({
      name,
      email,
      phone: phone || undefined,
      eventId: selectedEvent.id,
      price: selectedEvent.price,
      date: selectedEvent.date,
      slot,
    });

    // Reset form
    setName('');
    setEmail('');
    setPhone('');
    setSelectedEvent(null);
  };

  const handleCancel = () => {
    setSelectedEvent(null);
    setName('');
    setEmail('');
    setPhone('');
  };

  // Group events by date
  const groupedEvents = events.reduce((acc, event) => {
    const date = event.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(event);
    return acc;
  }, {} as Record<string, Event[]>);

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-lg" style={{ color: '#415049' }}>Loading available sessions...</p>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-lg mb-2" style={{ color: '#415049' }}>No upcoming sessions available.</p>
        <p className="text-sm" style={{ color: '#7F654E' }}>Check back soon for new sessions!</p>
      </div>
    );
  }

  // If an event is selected, show the booking form
  if (selectedEvent) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h3 className="text-2xl font-bold mb-4" style={{ color: '#415049' }}>
            Booking Details
          </h3>

          <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: '#F5F5F0' }}>
            <p className="font-semibold mb-2" style={{ color: '#415049' }}>{formatDate(selectedEvent.date)}</p>
            <p className="text-sm mb-1" style={{ color: '#7F654E' }}>
              🕐 {formatTime(selectedEvent.start_time)} - {formatTime(selectedEvent.end_time)}
            </p>
            <p className="text-sm mb-1" style={{ color: '#7F654E' }}>
              📍 {selectedEvent.cafe_name}
            </p>
            <p className="text-sm mb-1" style={{ color: '#7F654E' }}>
              💰 ₹{selectedEvent.price}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#415049' }}>
                Full Name *
              </label>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#415049' }}>
                Email Address *
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#415049' }}>
                Phone Number (Optional)
              </label>
              <Input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                onClick={handleCancel}
                variant="outline"
                className="flex-1"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1"
                style={{ backgroundColor: '#7F654E' }}
              >
                {isLoading ? 'Processing...' : `Pay ₹${selectedEvent.price}`}
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Get unique dates
  const uniqueDates = Array.from(new Set(events.map(e => e.date))).sort();

  // Filter events by selected date
  const filteredEvents = selectedDate ? events.filter(e => e.date === selectedDate) : [];

  // Show event list
  return (
    <div className="max-w-4xl mx-auto">
      {/* Date Selector - BookMyShow Style */}
      <div className="mb-8 flex justify-center">
        <div className="flex gap-3">
          {uniqueDates.map((date) => {
            const datePill = formatDatePill(date);
            const isSelected = selectedDate === date;

            return (
              <button
                key={date}
                onClick={() => setSelectedDate(date)}
                className="flex flex-col items-center px-6 py-4 rounded-lg min-w-[100px] transition-all"
                style={{
                  backgroundColor: isSelected ? '#7F654E' : 'white',
                  color: isSelected ? 'white' : '#415049',
                  border: isSelected ? 'none' : '1px solid #E5E5E0'
                }}
              >
                <span className="text-xs font-medium mb-1">{datePill.day}</span>
                <span className="text-2xl font-bold">{datePill.date}</span>
                <span className="text-xs mt-1">{datePill.month}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sessions for selected date */}
      <div className="grid gap-4 md:grid-cols-2">
        {filteredEvents.map((event) => (
          <div
            key={event.id}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Clock size={18} style={{ color: '#7F654E' }} />
                  <span className="font-semibold" style={{ color: '#415049' }}>
                    {formatTime(event.start_time)} - {formatTime(event.end_time)}
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <MapPin size={18} style={{ color: '#7F654E' }} />
                  <span className="text-sm" style={{ color: '#7F654E' }}>
                    {event.cafe_name}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold" style={{ color: '#415049' }}>
                  ₹{event.price}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <Users size={18} style={{ color: '#7F654E' }} />
              <span className="text-sm" style={{ color: '#7F654E' }}>
                {event.availableSeats} seats left
              </span>
            </div>

            <Button
              onClick={() => handleBookClick(event)}
              className="w-full"
              style={{ backgroundColor: '#7F654E' }}
            >
              Book Now
            </Button>
          </div>
        ))}
      </div>

      {filteredEvents.length === 0 && selectedDate && (
        <div className="text-center py-12">
          <p className="text-lg" style={{ color: '#415049' }}>No sessions available for this date.</p>
        </div>
      )}
    </div>
  );
}
