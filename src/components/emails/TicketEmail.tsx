import * as React from 'react';

interface TicketEmailProps {
  eventName: string;
  eventDate: string;
  eventLocation: string;
  ticketType: string;
  orderId: string;
  quantity: number;
  totalAmount: string;
  attendeeName: string;
  qrCode: string;
}

export function TicketEmail({
  eventName,
  eventDate,
  eventLocation,
  ticketType,
  orderId,
  quantity,
  totalAmount,
  attendeeName,
  qrCode,
}: TicketEmailProps) {
  return (
    <div style={{
      fontFamily: 'Arial, sans-serif',
      maxWidth: '600px',
      margin: '0 auto',
      padding: '20px',
      color: '#333',
    }}>
      <h1 style={{ color: '#2563eb', marginBottom: '20px' }}>🎟️ Your Ticket Confirmation</h1>
      <p>Hello {attendeeName},</p>
      <p>Thank you for your purchase! Here are your ticket details:</p>
      
      <div style={{
        background: '#f8f9fa',
        padding: '20px',
        borderRadius: '8px',
        margin: '20px 0',
        border: '1px solid #e5e7eb'
      }}>
        <h2 style={{ marginTop: 0 }}>{eventName}</h2>
        <p>📅 {eventDate}</p>
        <p>📍 {eventLocation}</p>
        <p>🎟️ {ticketType} Ticket</p>
        <p>Quantity: {quantity}</p>
        <p>Order #: {orderId}</p>
        <p>Total: {totalAmount}</p>
      </div>

      <div style={{ textAlign: 'center', margin: '30px 0' }}>
        <p>Scan this QR code at the event entrance:</p>
        <img 
          src={qrCode} 
          alt="Ticket QR Code" 
          style={{ 
            width: '200px', 
            height: '200px', 
            border: '1px solid #ddd', 
            padding: '10px',
            margin: '10px auto',
            display: 'block'
          }}
        />
      </div>

      <div style={{ 
        marginTop: '30px', 
        fontSize: '14px', 
        color: '#666',
        borderTop: '1px solid #e5e7eb',
        paddingTop: '20px'
      }}>
        <p>Need help? Contact our support team at support@yourdomain.com</p>
        <p>We look forward to seeing you at the event!</p>
      </div>
    </div>
  );
}
