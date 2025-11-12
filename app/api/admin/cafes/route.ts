import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

// GET all cafes (for dropdown)
async function getCafes(request: NextRequest) {
  try {
    const { data: cafes, error } = await supabaseAdmin
      .from('cafes')
      .select('*')
      .order('used_count', { ascending: false });

    if (error) {
      console.error('Error fetching cafes:', error);
      return NextResponse.json({ error: 'Failed to fetch cafes' }, { status: 500 });
    }

    return NextResponse.json({ cafes });
  } catch (error) {
    console.error('Error in getCafes:', error);
    return NextResponse.json({ error: 'Failed to fetch cafes' }, { status: 500 });
  }
}

export const GET = requireAuth(getCafes);
