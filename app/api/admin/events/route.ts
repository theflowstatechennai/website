import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

// GET all events
async function getEvents(request: NextRequest) {
  try {
    const { data: events, error } = await supabaseAdmin
      .from('events')
      .select('*')
      .order('date', { ascending: true })
      .order('start_time', { ascending: true });

    if (error) {
      console.error('Error fetching events:', error);
      return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
    }

    // For each event, get booking count
    const eventsWithBookings = await Promise.all(
      (events || []).map(async (event) => {
        const { count } = await supabaseAdmin
          .from('bookings')
          .select('*', { count: 'exact', head: true })
          .eq('event_id', event.id)
          .eq('payment_status', 'completed');

        return {
          ...event,
          booked_seats: count || 0,
          available_seats: event.total_seats - (count || 0),
        };
      })
    );

    return NextResponse.json({ events: eventsWithBookings });
  } catch (error) {
    console.error('Error in getEvents:', error);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}

// POST - Create new event
async function createEvent(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      date,
      start_time,
      end_time,
      total_seats,
      cafe_name,
      cafe_address,
      cafe_maps_link,
      price,
    } = body;

    // Validate required fields
    if (!title || !date || !start_time || !end_time || !total_seats || !cafe_name || !cafe_address || !cafe_maps_link) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Insert event
    const { data: event, error } = await supabaseAdmin
      .from('events')
      .insert([
        {
          title,
          date,
          start_time,
          end_time,
          total_seats,
          cafe_name,
          cafe_address,
          cafe_maps_link,
          price: price || 600,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating event:', error);
      return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
    }

    // Check if cafe exists, if not create it
    const { data: existingCafe } = await supabaseAdmin
      .from('cafes')
      .select('*')
      .eq('name', cafe_name)
      .single();

    if (!existingCafe) {
      await supabaseAdmin.from('cafes').insert([
        {
          name: cafe_name,
          address: cafe_address,
          maps_link: cafe_maps_link,
          used_count: 1,
        },
      ]);
    } else {
      // Increment used_count
      await supabaseAdmin
        .from('cafes')
        .update({ used_count: existingCafe.used_count + 1 })
        .eq('id', existingCafe.id);
    }

    return NextResponse.json({ event });
  } catch (error) {
    console.error('Error in createEvent:', error);
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}

export const GET = requireAuth(getEvents);
export const POST = requireAuth(createEvent);
