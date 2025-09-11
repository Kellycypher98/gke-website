import { Resend } from 'resend';
import QRCode from 'qrcode';
import { TicketEmail } from '@/components/emails/TicketEmail';

const resend = new Resend(process.env.RESEND_API_KEY);

interface TicketDetails {
  eventName: string;
  eventDate: string;
  eventLocation: string;
  ticketType: string;
  orderId: string;
  quantity: number;
  totalAmount: string;
  attendeeName: string;
  attendeeEmail: string;
}

export async function sendTicketEmail(ticket: TicketDetails) {
  try {
    console.log('=== SENDING TICKET EMAIL ===');
    console.log('Recipient:', ticket.attendeeEmail);
    console.log('Resend API Key present:', !!process.env.RESEND_API_KEY);
    
    // Generate QR code with ticket details
    const qrData = JSON.stringify({
      orderId: ticket.orderId,
      email: ticket.attendeeEmail,
      event: ticket.eventName,
      timestamp: new Date().toISOString(),
    });

    console.log('Generating QR code...');
    const qrCode = await QRCode.toDataURL(qrData);
    
    console.log('Sending email via Resend...');
    const emailData = {
      from: 'tickets@globalkontaktempire.com',
      to: ticket.attendeeEmail,
      subject: `Your Ticket Confirmation - ${ticket.eventName}`,
      react: TicketEmail({
        ...ticket,
        qrCode,
      }),
    };
    
    console.log('Email data:', JSON.stringify({
      ...emailData,
      react: '[React Component]' // Don't log the entire component
    }, null, 2));
    
    const { data, error } = await resend.emails.send(emailData);

    if (error) {
      console.error('Resend API Error:', error);
      return { success: false, error };
    }

    console.log('Email sent successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Error in sendTicketEmail:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
    return { success: false, error };
  }
}
