import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const dateParam = request.nextUrl.searchParams.get('date');

    if (!dateParam) {
      return NextResponse.json(
        { error: 'Date parameter is required' },
        { status: 400 }
      );
    }

    const date = new Date(dateParam);

    // Validate that the date is in the future and not on a disabled day
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    if (isWeekend) {
      return NextResponse.json({ slots: [] });
    }

    // Fetch events for the selected date from Supabase
    const { data: events, error } = await supabase
      .from('events')
      .select('*')
      .eq('date', dateParam);

    if (error) {
      console.error('Error fetching events:', error);
      return NextResponse.json({ slots: [] });
    }

    if (!events || events.length === 0) {
      return NextResponse.json({ slots: [] });
    }

    // For each event, check how many bookings exist
    const availableSlots = await Promise.all(
      events.map(async (event) => {
        const { count } = await supabase
          .from('bookings')
          .select('*', { count: 'exact', head: true })
          .eq('event_id', event.id)
          .eq('payment_status', 'completed');

        const bookedSeats = count || 0;
        const availableSeats = event.total_seats - bookedSeats;

        // Only return the slot if there are available seats
        if (availableSeats > 0) {
          return {
            id: event.id,
            time: event.start_time,
            end: event.end_time,
            label: `${formatTime(event.start_time)} - ${formatTime(event.end_time)}`,
            availableSeats,
            totalSeats: event.total_seats,
            price: event.price,
            title: event.title,
            cafe_name: event.cafe_name,
            cafe_address: event.cafe_address,
            cafe_maps_link: event.cafe_maps_link,
          };
        }
        return null;
      })
    );

    // Filter out null values (fully booked slots)
    const filteredSlots = availableSlots.filter((slot) => slot !== null);

    return NextResponse.json({ slots: filteredSlots });
  } catch (error) {
    console.error('Error fetching slots:', error);
    return NextResponse.json(
      { error: 'Failed to fetch available slots' },
      { status: 500 }
    );
  }
}

// Helper function to format time from 24h to 12h format
function formatTime(time: string): string {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
}
