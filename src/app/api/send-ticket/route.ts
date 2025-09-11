import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import QRCode from 'qrcode';
import { TicketEmail } from '@/components/emails/TicketEmail';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Generate QR code
    const qrData = JSON.stringify({
      orderId: body.orderId,
      email: body.attendeeEmail,
      event: body.eventName,
      timestamp: new Date().toISOString(),
    });
    
    const qrCode = await QRCode.toDataURL(qrData);
    
    // Send email
    const { data, error } = await resend.emails.send({
      from: 'tickets@globalkontaktempire.com',
      to: body.attendeeEmail,
      subject: `Your Ticket for ${body.eventName}`,
      react: TicketEmail({
        ...body,
        qrCode,
      }),
    });

    if (error) {
      console.error('Resend API Error:', error);
      return NextResponse.json({ error }, { status: 500 });
    }

    console.log('Ticket email sent successfully:', data);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error sending ticket email:', error);
    return NextResponse.json(
      { error: 'Failed to send ticket email' },
      { status: 500 }
    );
  }
}
