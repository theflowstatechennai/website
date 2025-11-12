'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Clock, User, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Slot {
  id: string;
  time: string;
  end: string;
  label: string;
  availableSeats: number;
  totalSeats: number;
  price: number;
  title: string;
  cafe_name: string;
  cafe_address: string;
  cafe_maps_link: string;
}

interface BookingFormProps {
  onSubmit: (data: {
    name: string;
    email: string;
    phone?: string;
    date: string;
    slot: string;
    eventId: string;
    price: number;
  }) => Promise<void>;
  isLoading?: boolean;
}

export function BookingForm({ onSubmit, isLoading = false }: BookingFormProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const fetchSlots = async (date: string) => {
    setSlotsLoading(true);
    try {
      const response = await fetch(`/api/slots?date=${date}`);
      const data = await response.json();
      setSlots(data.slots || []);
    } catch (error) {
      console.error('Error fetching slots:', error);
      setSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleDateClick = (day: number) => {
    // Create date string directly to avoid timezone issues
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const dateStr = `${year}-${month}-${dayStr}`;

    setSelectedDate(dateStr);
    setSelectedSlot(null);
    fetchSlots(dateStr);
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    setSelectedDate(null);
    setSelectedSlot(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
    setSelectedDate(null);
    setSelectedSlot(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !selectedDate || !selectedSlot) {
      alert('Please fill in all fields and select a slot');
      return;
    }

    await onSubmit({
      name,
      email,
      phone: phone || undefined,
      date: selectedDate,
      slot: `${selectedDate} | ${selectedSlot.time}`,
      eventId: selectedSlot.id,
      price: selectedSlot.price,
    });
  };

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);

  const calendarDays = [];
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i);
  }

  const isDateInPast = selectedDate && new Date(selectedDate) < new Date();

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left: Calendar */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ChevronLeft size={20} />
            </button>
            <h3 className="text-lg font-semibold">{monthName}</h3>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((day, index) => {
              if (!day) {
                return <div key={`empty-${index}`} />;
              }

              const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
              const dateStr = date.toISOString().split('T')[0];
              const isToday = dateStr === new Date().toISOString().split('T')[0];
              const isSelected = selectedDate === dateStr;
              const isWeekend = date.getDay() === 0 || date.getDay() === 6;
              const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleDateClick(day)}
                  disabled={isWeekend || isPast}
                  className={`p-2 rounded-lg font-semibold transition ${
                    isWeekend || isPast
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : isSelected
                        ? 'bg-red-500 text-white'
                        : isToday
                          ? 'border-2 border-red-500 text-red-500'
                          : 'hover:bg-gray-100 text-gray-800'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          <p className="text-xs text-gray-500 mt-4">Available: Mon - Fri</p>
        </div>

        {/* Right: Details Form */}
        <div className="bg-white rounded-lg shadow-md p-6 flex flex-col">
          <h3 className="text-lg font-semibold mb-6">Session Details</h3>

          {/* User Name */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <User size={18} />
                Full Name
              </div>
            </label>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
            />
          </div>

          {/* Email */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <Mail size={18} />
                Email Address
              </div>
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@example.com"
            />
          </div>

          {/* Phone (Optional) */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number (Optional)
            </label>
            <Input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
            />
          </div>

          {/* Selected Date */}
          {selectedDate && (
            <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-gray-600">
                <Calendar size={16} className="inline mr-2" />
                Selected Date: <span className="font-semibold">{new Date(selectedDate).toLocaleDateString()}</span>
              </p>
            </div>
          )}

          {/* Time Slots */}
          {selectedDate && !isDateInPast && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <div className="flex items-center gap-2">
                  <Clock size={18} />
                  Select Time Slot
                </div>
              </label>

              {slotsLoading ? (
                <p className="text-gray-500 text-sm">Loading available slots...</p>
              ) : slots.length === 0 ? (
                <p className="text-red-500 text-sm">No slots available for this date</p>
              ) : (
                <div className="space-y-2">
                  {slots.map((slot) => (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => setSelectedSlot(slot)}
                      className={`w-full p-3 rounded-lg border-2 transition text-left ${
                        selectedSlot?.id === slot.id
                          ? 'border-red-500 bg-red-50'
                          : 'border-gray-200 hover:border-red-500'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-gray-800">{slot.label}</p>
                          <p className="text-sm text-gray-600">{slot.cafe_name}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-800">₹{slot.price}</p>
                          <p className="text-xs text-gray-500">{slot.availableSeats} seats left</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading || !selectedSlot}
            className="mt-auto w-full bg-red-500 hover:bg-red-600 text-white py-3 text-base h-auto"
          >
            {isLoading ? 'Processing...' : 'Book & Pay'}
          </Button>
        </div>
      </div>
    </form>
  );
}
