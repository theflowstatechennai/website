import nodemailer from 'nodemailer';
import { createReadStream } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { writeFileSync, unlinkSync } from 'fs';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Helper function to generate iCalendar format
function generateICS(params: {
  title: string;
  startTime: Date;
  endTime: Date;
  attendeeEmail: string;
  organizer: string;
  description: string;
  location?: string;
}): string {
  const formatDate = (date: Date) => {
    return date.toISOString().replace(/[:-]/g, '').split('.')[0] + 'Z';
  };

  const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//FlowState//EN
CALSCALE:GREGORIAN
METHOD:REQUEST
BEGIN:VEVENT
UID:${Date.now()}@flowstate.com
DTSTAMP:${formatDate(new Date())}
DTSTART:${formatDate(params.startTime)}
DTEND:${formatDate(params.endTime)}
SUMMARY:${params.title}
DESCRIPTION:${params.description}${params.location ? `\nLOCATION:${params.location}` : ''}
ORGANIZER;CN=FlowState:mailto:${params.organizer}
ATTENDEE;RSVP=TRUE:mailto:${params.attendeeEmail}
STATUS:CONFIRMED
SEQUENCE:0
END:VEVENT
END:VCALENDAR`;

  return ics;
}

export async function sendPaymentConfirmation(params: {
  to: string;
  userName: string;
  sessionTime: string;
  orderId: string;
  amount: string;
}) {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #ff4757; color: white; padding: 20px; border-radius: 5px; }
          .content { padding: 20px; background-color: #f5f5f5; margin: 20px 0; border-radius: 5px; }
          .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #ddd; }
          .footer { text-align: center; color: #999; font-size: 12px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Payment Confirmation</h1>
          </div>
          <div class="content">
            <p>Hi ${params.userName},</p>
            <p>Thank you for booking a session! Your payment has been confirmed.</p>

            <h3>Session Details</h3>
            <div class="detail-row">
              <span><strong>Session Time:</strong></span>
              <span>${params.sessionTime}</span>
            </div>
            <div class="detail-row">
              <span><strong>Order ID:</strong></span>
              <span>${params.orderId}</span>
            </div>
            <div class="detail-row">
              <span><strong>Amount Paid:</strong></span>
              <span>₹${params.amount}</span>
            </div>

            <p>You will receive a separate Google Calendar invite shortly. Please check your email and accept the invitation.</p>

            <p>If you have any questions, feel free to reach out.</p>

            <p>Thank you!</p>
          </div>
          <div class="footer">
            <p>This is an automated email. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: params.to,
      subject: 'Payment Confirmation - Session Booked',
      html: htmlContent,
    });
  } catch (error) {
    console.error('Error sending payment confirmation email:', error);
    throw error;
  }
}

export async function sendPaymentConfirmationWithCalendar(params: {
  to: string;
  userName: string;
  sessionTime: string;
  orderId: string;
  amount: string | number;
  startTime: Date;
  endTime: Date;
  cafeName: string;
  cafeAddress: string;
  cafeMapsLink: string;
}) {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #7F654E; color: white; padding: 20px; border-radius: 5px; }
          .content { padding: 20px; background-color: #f5f5f5; margin: 20px 0; border-radius: 5px; }
          .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #ddd; }
          .footer { text-align: center; color: #999; font-size: 12px; margin-top: 20px; }
          .calendar-notice { background-color: #e8f5e9; padding: 15px; border-left: 4px solid #4caf50; margin: 15px 0; }
          .location-box { background-color: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 15px 0; }
          .map-button { display: inline-block; background-color: #7F654E; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>FlowState Session Confirmed ✓</h1>
          </div>
          <div class="content">
            <p>Hi ${params.userName},</p>
            <p>Thank you for booking a FlowState session! Your payment has been confirmed.</p>

            <h3>Session Details</h3>
            <div class="detail-row">
              <span><strong>Session Time:</strong></span>
              <span>${params.sessionTime}</span>
            </div>
            <div class="detail-row">
              <span><strong>Order ID:</strong></span>
              <span>${params.orderId}</span>
            </div>
            <div class="detail-row">
              <span><strong>Amount Paid:</strong></span>
              <span>₹${params.amount}</span>
            </div>

            <div class="location-box">
              <strong>📍 Cafe Location</strong>
              <p style="margin: 10px 0 5px 0;"><strong>${params.cafeName}</strong></p>
              <p style="margin: 5px 0;">${params.cafeAddress}</p>
              <a href="${params.cafeMapsLink}" class="map-button" target="_blank">Open in Google Maps</a>
            </div>

            <div class="calendar-notice">
              <strong>📅 Calendar Invite Attached</strong>
              <p>A calendar invite with the cafe location is attached to this email. Click "Accept" to add this session to your calendar.</p>
            </div>

            <p>We look forward to seeing you at the session!</p>
            <p>If you have any questions, feel free to reach out.</p>
            <p>Thank you!</p>
          </div>
          <div class="footer">
            <p>This is an automated email. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    const icsContent = generateICS({
      title: 'FlowState Session',
      startTime: params.startTime,
      endTime: params.endTime,
      attendeeEmail: params.to,
      organizer: process.env.EMAIL_USER || 'noreply@flowstate.com',
      description: `FlowState Coworking Session\n\nLocation: ${params.cafeName}\n${params.cafeAddress}\n\nGoogle Maps: ${params.cafeMapsLink}\n\nAmount: ₹${params.amount}\nOrder ID: ${params.orderId}`,
      location: `${params.cafeName}, ${params.cafeAddress}`,
    });

    // Create temporary ICS file
    const icsFileName = `session-${Date.now()}.ics`;
    const icsPath = join(tmpdir(), icsFileName);
    writeFileSync(icsPath, icsContent);

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: params.to,
      subject: 'Payment Confirmation - Session Booked',
      html: htmlContent,
      attachments: [
        {
          filename: 'session-invite.ics',
          content: icsContent,
          contentType: 'text/calendar; method=REQUEST',
        },
      ],
    });

    // Clean up temp file
    try {
      unlinkSync(icsPath);
    } catch (e) {
      // Ignore cleanup errors
    }
  } catch (error) {
    console.error('Error sending payment confirmation email:', error);
    throw error;
  }
}

export async function sendSessionReminder(params: {
  to: string;
  userName: string;
  sessionTime: string;
}) {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #ff4757; color: white; padding: 20px; border-radius: 5px; }
          .content { padding: 20px; background-color: #f5f5f5; margin: 20px 0; border-radius: 5px; }
          .footer { text-align: center; color: #999; font-size: 12px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Session Reminder</h1>
          </div>
          <div class="content">
            <p>Hi ${params.userName},</p>
            <p>This is a reminder about your upcoming session.</p>

            <h3>Session Details</h3>
            <p><strong>Session Time:</strong> ${params.sessionTime}</p>

            <p>Please make sure you're ready 5 minutes before the session starts.</p>

            <p>Thank you!</p>
          </div>
          <div class="footer">
            <p>This is an automated email. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: params.to,
      subject: 'Reminder: Your Session is Coming Up',
      html: htmlContent,
    });
  } catch (error) {
    console.error('Error sending session reminder email:', error);
    throw error;
  }
}
