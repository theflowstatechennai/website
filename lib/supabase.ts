import { createClient } from '@supabase/supabase-js';

// Use dummy values during build time if env vars are missing
// Supabase requires valid URL format, so we provide a placeholder
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDUxOTIwMDAsImV4cCI6MTk2MDc2ODAwMH0.placeholder';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY0NTE5MjAwMCwiZXhwIjoxOTYwNzY4MDAwfQ.placeholder';

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
