'use client';

import { useEffect, useState } from 'react';
import { TicketEmail } from '@/components/emails/TicketEmail';

export default function EmailPreviewPage() {
  const [emailHtml, setEmailHtml] = useState('');

  useEffect(() => {
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
      attendeeEmail: 'john.doe@example.com',
      qrCode: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiB2aWV3Qm94PSIwIDAgMjAwIDIwMCI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNmOGY5ZmEiLz48dGV4dCB4PSIxMDAiIHk9IjEwMCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBhbGlnbm1lbnQtYmFzZWxpbmU9Im1pZGRsZSI+R2xvYmFsIFRlY2ggQ29uZiAyMDIzPC90ZXh0Pjwvc3ZnPg==',
    };

    // Generate the email component with mock data
    const emailComponent = TicketEmail(previewData);
    setEmailHtml(emailComponent);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Email Template Preview</h1>
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h2 className="font-semibold text-lg mb-2">Preview Controls</h2>
            <p className="text-sm text-gray-600">
              This is a development preview of the email template. The actual email will be sent with real event and ticket data.
            </p>
          </div>
          
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-white p-8">
              <div dangerouslySetInnerHTML={{ __html: emailHtml }} />
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
            <p><strong>Note:</strong> In a real email, the QR code would be generated with the actual ticket data.</p>
            <p className="mt-2">To test the actual email sending, make a test purchase in development mode.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
