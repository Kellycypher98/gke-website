import { NextResponse } from 'next/server';
import { TicketEmail } from '@/components/emails/TicketEmail';

// This is for development preview only
// In production, you might want to protect this route

export async function GET() {
  // Mock data for preview
  const previewData = {
    eventName: 'Global Tech Conference 2023',
    eventDate: new Date('2023-12-15T19:00:00').toISOString(),
    eventLocation: 'Convention Center, New York',
    ticketType: 'VIP Pass',
    orderId: 'ORD-123456',
    quantity: 2,
    totalAmount: '$299.98',
    attendeeName: 'John Doe',
    qrCode: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiB2aWV3Qm94PSIwIDAgMjAwIDIwMCI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNmOGY5ZmEiLz48dGV4dCB4PSIxMDAiIHk9IjEwMCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBhbGlnbm1lbnQtYmFzZWxpbmU9Im1pZGRsZSI+R2xvYmFsIFRlY2ggQ29uZiAyMDIzPC90ZXh0Pjwvc3ZnPg==',
  };

  return new Response(
    `<!DOCTYPE html>
    <html>
      <head>
        <title>Email Preview</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body class="bg-gray-100 p-8">
        <div class="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow">
          <h1 class="text-2xl font-bold mb-6">Email Template Preview</h1>
          <div class="border border-gray-200 rounded-lg p-4">
            ${TicketEmail(previewData)}
          </div>
        </div>
      </body>
    </html>`,
    {
      headers: {
        'Content-Type': 'text/html',
      },
    }
  );
}
