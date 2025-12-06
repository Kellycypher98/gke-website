import { NextResponse } from 'next/server';
import { generateTicketPDF } from '@/lib/pdf/ticket';
import { sendTicketEmail } from '@/lib/email';

interface BatchTicketData {
  email: string;
  name: string;
  amount: number;
  quantity: number;
  eventName: string;
  eventDate: string;
  eventLocation: string;
  ticketType: string;
  orderId: string;
}

export async function POST(request: Request) {
  try {
    // Verify API key if needed
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.ADMIN_API_KEY}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const batchData: BatchTicketData[] = await request.json();
    
    if (!Array.isArray(batchData) || batchData.length === 0) {
      return NextResponse.json(
        { error: 'No ticket data provided' },
        { status: 400 }
      );
    }

    const results = [];
    
    for (const ticketData of batchData) {
      try {
        // Generate PDF ticket
        const pdfBuffer = await generateTicketPDF({
          eventName: ticketData.eventName,
          eventDate: ticketData.eventDate,
          eventLocation: ticketData.eventLocation,
          ticketType: ticketData.ticketType,
          orderId: ticketData.orderId,
          attendeeName: ticketData.name,
          priceText: `$${(ticketData.amount / 100).toFixed(2)}`,
          quantity: ticketData.quantity,
          qrData: JSON.stringify({
            orderId: ticketData.orderId,
            email: ticketData.email,
            event: ticketData.eventName,
            timestamp: new Date().toISOString(),
          }),
        });

        // Send email with ticket
        await sendTicketEmail({
          eventName: ticketData.eventName,
          eventDate: ticketData.eventDate,
          eventLocation: ticketData.eventLocation,
          ticketType: ticketData.ticketType,
          orderId: ticketData.orderId,
          quantity: ticketData.quantity,
          totalAmount: `$${(ticketData.amount / 100).toFixed(2)}`,
          attendeeName: ticketData.name,
          attendeeEmail: ticketData.email,
        });

        results.push({
          email: ticketData.email,
          status: 'success',
          message: 'Ticket sent successfully',
        });
      } catch (error) {
        console.error(`Error processing ticket for ${ticketData.email}:`, error);
        results.push({
          email: ticketData.email,
          status: 'error',
          message: error instanceof Error ? error.message : 'Failed to process ticket',
        });
      }
    }

    return NextResponse.json({
      success: true,
      processed: results.length,
      results,
    });
  } catch (error) {
    console.error('Batch ticket processing error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
