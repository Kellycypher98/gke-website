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
    // Generate QR code with ticket details
    const qrData = JSON.stringify({
      orderId: ticket.orderId,
      email: ticket.attendeeEmail,
      event: ticket.eventName,
      timestamp: new Date().toISOString(),
    });

    const qrCode = await QRCode.toDataURL(qrData);
    
    // Send email with Resend using React component
    const { data, error } = await resend.emails.send({
      from: 'tickets@globalkontaktempire.com',
      to: ticket.attendeeEmail,
      subject: `Your Ticket Confirmation - ${ticket.eventName}`,
      react: TicketEmail({
        ...ticket,
        qrCode,
      }),
    });

    if (error) {
      console.error('Error sending ticket email:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Failed to send ticket email:', error);
    return { success: false, error };
  }
}
