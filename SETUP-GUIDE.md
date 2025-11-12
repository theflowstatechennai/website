# FlowState Admin Panel Setup Guide

This guide will walk you through setting up the admin panel for your FlowState website with event management and booking system.

## What's New

- ✅ **Admin Panel** with password authentication
- ✅ **Event Management** - Create, view, and delete events
- ✅ **Booking Management** - View all bookings with attendee details
- ✅ **Database Integration** - Supabase PostgreSQL database
- ✅ **Cafe Management** - Reusable cafe locations
- ✅ **Enhanced Emails** - Calendar invites with cafe location and Google Maps link
- ✅ **Seat Limiting** - Control capacity for each event
- ✅ **Dynamic Pricing** - Set different prices for different events

---

## Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign in
2. Click **"New Project"**
3. Fill in the details:
   - **Name**: `flowstate` (or any name you prefer)
   - **Database Password**: Generate a strong password and save it
   - **Region**: Choose closest to India (Singapore or Mumbai if available)
4. Click **"Create new project"** (takes ~2 minutes to provision)

---

## Step 2: Get Supabase Credentials

Once your project is created:

1. Go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key** (under "Project API keys")
   - **service_role key** (under "Project API keys" - this is secret!)

---

## Step 3: Run Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click **"New Query"**
3. Copy the entire contents of `supabase-schema.sql` (in your project root)
4. Paste it into the SQL Editor
5. Click **"Run"** or press `Ctrl/Cmd + Enter`
6. You should see a success message

This creates:
- `cafes` table - Stores cafe locations
- `events` table - Stores all events
- `bookings` table - Stores all bookings
- Proper indexes for performance
- Row Level Security (RLS) policies

---

## Step 4: Update Environment Variables

Update your `.env.local` file with the Supabase credentials and admin password:

```bash
# Existing variables...
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REFRESH_TOKEN=your_google_refresh_token
GOOGLE_CALENDAR_ID=your_google_calendar_id

NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret

EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_specific_password
EMAIL_FROM=your_email@gmail.com

NEXT_PUBLIC_APP_NAME=FlowState
NEXT_PUBLIC_APP_URL=http://localhost:3000

# NEW: Add these Supabase credentials
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# NEW: Set your admin password
ADMIN_PASSWORD=your_secure_admin_password
```

**Important**:
- Replace all placeholder values with your actual credentials
- Keep `SUPABASE_SERVICE_ROLE_KEY` and `ADMIN_PASSWORD` secret!
- Use a strong admin password

---

## Step 5: Test the Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Visit [http://localhost:3000](http://localhost:3000) - your main site should load

3. Visit [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

4. Enter the password you set in `ADMIN_PASSWORD`

5. You should see the admin dashboard!

---

## Admin Panel Features

### Dashboard (`/admin`)
- View all events (upcoming and past)
- See statistics: total events, upcoming events, total bookings
- Quick access to create events and view bookings
- Delete events (with confirmation)

### Create Event (`/admin/events/new`)
- Set event title (e.g., "FlowState Session")
- Choose date and time (start/end)
- Set total seats capacity
- Set price (default ₹600)
- Add cafe details:
  - Either select from previously used cafes (dropdown)
  - Or add new cafe (name, address, Google Maps link)

### View Bookings (`/admin/bookings`)
- See all bookings across all events
- Filter by specific event
- View attendee details: name, email, phone
- See payment status and booking time
- Export bookings to CSV

---

## How It Works for Users

1. **User visits your website**
2. **Selects a date** from the calendar (weekdays only)
3. **Sees available events** for that date with:
   - Time slot
   - Cafe name
   - Price
   - Available seats
4. **Fills in details**: Name, Email, Phone (optional)
5. **Clicks "Book & Pay"** → Razorpay payment modal opens
6. **Completes payment** (UPI, Card, NetBanking, Wallet)
7. **Receives confirmation email** with:
   - Session details
   - Cafe name and address
   - Google Maps link to cafe
   - Calendar invite (.ics file) with location
8. **Booking saved to database** - visible in admin panel

---

## Admin Workflow

### Creating an Event

1. Log in to `/admin/login`
2. Click **"+ Create Event"**
3. Fill in the form:
   ```
   Title: FlowState Session
   Date: 2024-12-15
   Start Time: 10:00
   End Time: 13:00
   Total Seats: 8
   Price: 600

   Cafe: (select existing or add new)
   - Name: Chamiers Cafe
   - Address: 12, Chamiers Road, Nandanam, Chennai - 600035
   - Maps Link: https://maps.app.goo.gl/xxxxx
   ```
4. Click **"Create Event"**
5. Event is now live! Users can book it.

### Viewing Bookings

1. From dashboard, click **"View All Bookings"** or click **"View Bookings"** for a specific event
2. See all attendees with their details
3. Export to CSV for offline use

### Managing Capacity

- If an event has 8 total seats and 5 people have booked:
  - Users will see "3 seats left"
  - Once all 8 seats are booked, the event disappears from available slots

---

## Database Structure

### Events Table
```sql
- id (UUID)
- title (e.g., "FlowState Session")
- date (2024-12-15)
- start_time (10:00)
- end_time (13:00)
- total_seats (8)
- cafe_name
- cafe_address
- cafe_maps_link
- price (600.00)
- created_at, updated_at
```

### Bookings Table
```sql
- id (UUID)
- event_id (references events)
- user_name
- user_email
- user_phone
- razorpay_order_id
- razorpay_payment_id
- payment_signature
- amount
- payment_status (pending/completed/failed)
- booked_at
```

### Cafes Table
```sql
- id (UUID)
- name
- address
- maps_link
- used_count (how many times used)
- created_at
```

---

## Email Template Updates

Users now receive emails with:
- FlowState branding (brown color scheme)
- Cafe location prominently displayed
- **"Open in Google Maps"** button
- Calendar invite (.ics) with:
  - Event title
  - Start and end time
  - Location field (cafe name + address)
  - Description with all details including Maps link

---

## Security

- Admin routes protected by middleware (`/admin/*` requires authentication)
- Session-based authentication (24-hour validity)
- Password stored in environment variable only
- API routes require authentication (admin only)
- Row Level Security (RLS) enabled on Supabase tables
- Service role key used for admin operations
- Public can only read events, not create/edit/delete

---

## Common Issues & Solutions

### Issue: "Unauthorized" when accessing admin panel
**Solution**: Make sure `ADMIN_PASSWORD` is set in `.env.local` and you're using the correct password

### Issue: Events not showing up for users
**Solution**:
1. Check that the event date is in the future
2. Verify event was created successfully in Supabase dashboard
3. Check that total_seats > 0

### Issue: Bookings not saving
**Solution**:
1. Verify Supabase credentials are correct
2. Check browser console for errors
3. Verify Razorpay payment was successful

### Issue: Email not sending
**Solution**:
1. Verify EMAIL_USER and EMAIL_PASSWORD are correct
2. For Gmail, use App-Specific Password (not regular password)
3. Check spam folder

---

## Future Enhancements (Optional)

Consider adding these features later:
- **Recurring events** (e.g., every Monday 10-1 PM)
- **Event editing** (currently can only create/delete)
- **Booking cancellation/refunds**
- **Attendance tracking** (mark who attended)
- **Email reminders** (auto-send 1 day before event)
- **Multiple admins** with different permissions
- **Analytics dashboard** (revenue, attendance rates, etc.)
- **Waitlist** (when event is full)
- **User accounts** (users can view their booking history)

---

## Support

If you encounter any issues:
1. Check browser console for error messages
2. Check Supabase logs (in Supabase dashboard)
3. Verify all environment variables are set correctly
4. Ensure database schema was run successfully

---

## Next Steps

1. ✅ Set up Supabase and run database schema
2. ✅ Update `.env.local` with all credentials
3. ✅ Test admin login
4. ✅ Create a test event
5. ✅ Make a test booking (use test mode for Razorpay)
6. ✅ Verify email is sent with calendar invite
7. ✅ Check booking appears in admin panel
8. 🚀 Go live!

---

Good luck! Your FlowState admin panel is now ready to use. 🎉
