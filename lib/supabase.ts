import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Client for frontend (uses anon key)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side client with service role key (bypasses RLS)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Type definitions for our tables
export type Event = {
  id: string;
  title: string;
  date: string;
  start_time: string;
  end_time: string;
  total_seats: number;
  cafe_name: string;
  cafe_address: string;
  cafe_maps_link: string;
  price: number;
  created_at: string;
  updated_at: string;
};

export type Booking = {
  id: string;
  event_id: string;
  user_name: string;
  user_email: string;
  user_phone: string | null;
  razorpay_order_id: string;
  razorpay_payment_id: string | null;
  payment_signature: string | null;
  amount: number;
  payment_status: 'pending' | 'completed' | 'failed';
  booked_at: string;
};

export type Cafe = {
  id: string;
  name: string;
  address: string;
  maps_link: string;
  used_count: number;
  created_at: string;
};
