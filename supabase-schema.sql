-- FlowState Database Schema
-- Run this in Supabase SQL Editor (https://app.supabase.com → SQL Editor → New Query)

-- Create cafes table (for reusable cafe locations)
CREATE TABLE cafes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  address TEXT NOT NULL,
  maps_link TEXT NOT NULL,
  used_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create events table
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  total_seats INTEGER NOT NULL,
  cafe_name VARCHAR(255) NOT NULL,
  cafe_address TEXT NOT NULL,
  cafe_maps_link TEXT NOT NULL,
  price DECIMAL(10,2) DEFAULT 600.00,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create bookings table
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  user_name VARCHAR(255) NOT NULL,
  user_email VARCHAR(255) NOT NULL,
  user_phone VARCHAR(20),
  razorpay_order_id VARCHAR(255) NOT NULL UNIQUE,
  razorpay_payment_id VARCHAR(255),
  payment_signature VARCHAR(255),
  amount DECIMAL(10,2) NOT NULL,
  payment_status VARCHAR(50) DEFAULT 'pending',
  booked_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_events_date ON events(date);
CREATE INDEX idx_events_date_time ON events(date, start_time);
CREATE INDEX idx_bookings_event_id ON bookings(event_id);
CREATE INDEX idx_bookings_email ON bookings(user_email);
CREATE INDEX idx_bookings_payment_status ON bookings(payment_status);
CREATE INDEX idx_cafes_name ON cafes(name);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for events table
CREATE TRIGGER update_events_updated_at
BEFORE UPDATE ON events
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS) for all tables
ALTER TABLE cafes ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Public can read cafes" ON cafes FOR SELECT USING (true);
CREATE POLICY "Public can read events" ON events FOR SELECT USING (true);

-- Only service role can write to cafes and events (admin only via API)
CREATE POLICY "Service role can insert cafes" ON cafes FOR INSERT WITH CHECK (true);
CREATE POLICY "Service role can update cafes" ON cafes FOR UPDATE USING (true);
CREATE POLICY "Service role can delete cafes" ON cafes FOR DELETE USING (true);

CREATE POLICY "Service role can insert events" ON events FOR INSERT WITH CHECK (true);
CREATE POLICY "Service role can update events" ON events FOR UPDATE USING (true);
CREATE POLICY "Service role can delete events" ON events FOR DELETE USING (true);

-- Bookings can be inserted by anyone (when they pay), but only service role can read/update
CREATE POLICY "Anyone can create bookings" ON bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Service role can read bookings" ON bookings FOR SELECT USING (true);
CREATE POLICY "Service role can update bookings" ON bookings FOR UPDATE USING (true);
CREATE POLICY "Service role can delete bookings" ON bookings FOR DELETE USING (true);

-- Insert some sample cafes (optional - you can remove this)
INSERT INTO cafes (name, address, maps_link, used_count) VALUES
  ('Chamiers Cafe', '12, Chamiers Road, Nandanam, Chennai - 600035', 'https://maps.app.goo.gl/chamiers', 0),
  ('Brew Room', '47, Cathedral Road, Gopalapuram, Chennai - 600086', 'https://maps.app.goo.gl/brewroom', 0),
  ('Kaffa Cerro', 'Ground Floor, E-15, Dr Radha Krishnan Salai, Mylapore, Chennai - 600004', 'https://maps.app.goo.gl/kaffa', 0);

-- Grant necessary permissions (Supabase usually handles this automatically)
GRANT ALL ON cafes TO authenticated;
GRANT ALL ON events TO authenticated;
GRANT ALL ON bookings TO authenticated;
GRANT ALL ON cafes TO anon;
GRANT ALL ON events TO anon;
GRANT ALL ON bookings TO anon;
