import { NextRequest, NextResponse } from 'next/server';
import { verifyPaymentSignature } from '@/lib/razorpay';
import { sendPaymentConfirmationWithCalendar } from '@/lib/email';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      orderId,
      paymentId,
      signature,
      userName,
      userEmail,
      userPhone,
      sessionTime,
      amount,
      eventId,
    } = body;

    if (
      !orderId ||
      !paymentId ||
      !signature ||
      !userName ||
      !userEmail ||
      !sessionTime ||
      !amount ||
      !eventId
    ) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify payment signature
    const isSignatureValid = verifyPaymentSignature({
      orderId,
      paymentId,
      signature,
    });

    if (!isSignatureValid) {
      return NextResponse.json(
        { error: 'Invalid payment signature' },
        { status: 400 }
      );
    }

    // Get event details from database
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (eventError || !event) {
      console.error('Error fetching event:', eventError);
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Check if event is fully booked
    const { count } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', eventId)
      .eq('payment_status', 'completed');

    if (count && count >= event.total_seats) {
      return NextResponse.json(
        { error: 'Event is fully booked' },
        { status: 400 }
      );
    }

    // Save booking to database
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert([
        {
          event_id: eventId,
          user_name: userName,
          user_email: userEmail,
          user_phone: userPhone || null,
          razorpay_order_id: orderId,
          razorpay_payment_id: paymentId,
          payment_signature: signature,
          amount,
          payment_status: 'completed',
        },
      ])
      .select()
      .single();

    if (bookingError) {
      console.error('Error creating booking:', bookingError);
      return NextResponse.json(
        { error: 'Failed to save booking' },
        { status: 500 }
      );
    }

    // Parse session time and create calendar event
    const [dateStr, timeStr] = sessionTime.split(' | ');
    const sessionDate = new Date(dateStr);
    const [startHour, startMin] = timeStr.split(':').slice(0, 2);

    const startTime = new Date(sessionDate);
    startTime.setHours(parseInt(startHour), parseInt(startMin), 0);

    const [endHour, endMin] = event.end_time.split(':');
    const endTime = new Date(sessionDate);
    endTime.setHours(parseInt(endHour), parseInt(endMin), 0);

    // Send payment confirmation email with calendar invite
    await sendPaymentConfirmationWithCalendar({
      to: userEmail,
      userName,
      sessionTime,
      orderId,
      amount,
      startTime,
      endTime,
      cafeName: event.cafe_name,
      cafeAddress: event.cafe_address,
      cafeMapsLink: event.cafe_maps_link,
    });

    return NextResponse.json({
      success: true,
      message: 'Payment verified and session booked successfully',
      booking,
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    );
  }
}
