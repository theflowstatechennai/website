import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

// DELETE - Delete event
async function deleteEvent(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const { error } = await supabaseAdmin
      .from('events')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting event:', error);
      return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in deleteEvent:', error);
    return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 });
  }
}

// PUT - Update event
async function updateEvent(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    const { data: event, error } = await supabaseAdmin
      .from('events')
      .update(body)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating event:', error);
      return NextResponse.json({ error: 'Failed to update event' }, { status: 500 });
    }

    return NextResponse.json({ event });
  } catch (error) {
    console.error('Error in updateEvent:', error);
    return NextResponse.json({ error: 'Failed to update event' }, { status: 500 });
  }
}

export const DELETE = requireAuth(deleteEvent);
export const PUT = requireAuth(updateEvent);
