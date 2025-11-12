import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Fetch all upcoming events (today and future)
    const { data: events, error } = await supabase
      .from('events')
      .select('*')
      .gte('date', today)
      .order('date', { ascending: true })
      .order('start_time', { ascending: true });

    if (error) {
      console.error('Error fetching events:', error);
      return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
    }

    if (!events || events.length === 0) {
      return NextResponse.json({ events: [] });
    }

    // For each event, get booking count and calculate available seats
    const eventsWithAvailability = await Promise.all(
      events.map(async (event) => {
        const { count } = await supabase
          .from('bookings')
          .select('*', { count: 'exact', head: true })
          .eq('event_id', event.id)
          .eq('payment_status', 'completed');

        const bookedSeats = count || 0;
        const availableSeats = event.total_seats - bookedSeats;

        // Only return events with available seats
        if (availableSeats > 0) {
          return {
            id: event.id,
            title: event.title,
            date: event.date,
            start_time: event.start_time,
            end_time: event.end_time,
            availableSeats,
            totalSeats: event.total_seats,
            price: event.price,
            cafe_name: event.cafe_name,
            cafe_address: event.cafe_address,
            cafe_maps_link: event.cafe_maps_link,
          };
        }
        return null;
      })
    );

    // Filter out null values (fully booked events)
    const availableEvents = eventsWithAvailability.filter((event) => event !== null);

    return NextResponse.json({ events: availableEvents });
  } catch (error) {
    console.error('Error in GET /api/events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}
