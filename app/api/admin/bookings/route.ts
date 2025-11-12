import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

// GET all bookings
async function getBookings(request: NextRequest) {
  try {
    const eventId = request.nextUrl.searchParams.get('event_id');

    let query = supabaseAdmin
      .from('bookings')
      .select(`
        *,
        events (
          title,
          date,
          start_time,
          end_time,
          cafe_name
        )
      `)
      .order('booked_at', { ascending: false });

    if (eventId) {
      query = query.eq('event_id', eventId);
    }

    const { data: bookings, error } = await query;

    if (error) {
      console.error('Error fetching bookings:', error);
      return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
    }

    return NextResponse.json({ bookings });
  } catch (error) {
    console.error('Error in getBookings:', error);
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
  }
}

export const GET = requireAuth(getBookings);
