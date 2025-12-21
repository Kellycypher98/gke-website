'use client';

import { useEffect, useState, use } from 'react';
import { Calendar, MapPin, Clock, Download, Share2, Smartphone } from 'lucide-react';
import { format } from 'date-fns';
import Image from 'next/image';

interface TicketData {
  orderId: string;
  eventName: string;
  eventDate: string;
  eventLocation: string;
  ticketType: string;
  attendeeName: string;
  price: string;
  quantity: number;
  qrCode: string;
  venue?: {
    name: string;
    address: string;
    city: string;
  };
  doorTime?: string;
  showTime?: string;
}

export default function WebTicketPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = use(params);
  const [ticket, setTicket] = useState<TicketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    async function fetchTicket() {
      try {
        const response = await fetch(`/api/tickets/${orderId}/details`);
        if (response.ok) {
          const data = await response.json();
          setTicket(data);
        }
      } catch (error) {
        console.error('Error fetching ticket:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchTicket();

    // Check if running as standalone (saved to home screen)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (!isStandalone) {
      setShowInstallPrompt(true);
    }
  }, [orderId]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: ticket?.eventName || 'Event Ticket',
          text: `My ticket for ${ticket?.eventName}`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    }
  };

  const handleDownloadPDF = () => {
    window.location.href = `/api/tickets/${orderId}/pdf`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-dark-900 to-dark-950 flex items-center justify-center">
        <div className="text-white">Loading ticket...</div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-dark-900 to-dark-950 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Ticket Not Found</h1>
          <p className="text-gray-400">This ticket doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-dark-900 to-dark-950 py-8 px-4">
      <div className="max-w-md mx-auto">
        {/* Install Prompt */}
        {showInstallPrompt && (
          <div className="mb-4 bg-primary-500/10 border border-primary-500/30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Smartphone className="w-5 h-5 text-primary-400 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-white text-sm mb-1">Save to Home Screen</h3>
                <p className="text-xs text-gray-300 mb-2">
                  Add this ticket to your home screen for quick access
                </p>
                <button
                  onClick={() => setShowInstallPrompt(false)}
                  className="text-xs text-primary-400 hover:text-primary-300"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Ticket Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-6 text-white">
            <div className="flex justify-between items-start mb-4">
              <div className="text-xs font-semibold opacity-90">GLOBAL KONTAKT EMPIRE</div>
              <div className="text-xs font-semibold opacity-90">EVENT TICKET</div>
            </div>
            <h1 className="text-2xl font-bold mb-2">{ticket.eventName}</h1>
          </div>

          {/* Event Details */}
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-3 text-gray-700">
              <Calendar className="w-5 h-5 text-primary-500" />
              <div>
                <div className="text-sm font-semibold">
                  {format(new Date(ticket.eventDate), 'EEEE, MMMM d, yyyy')}
                </div>
                {ticket.doorTime && (
                  <div className="text-xs text-gray-500">Doors: {ticket.doorTime}</div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 text-gray-700">
              <MapPin className="w-5 h-5 text-primary-500" />
              <div>
                <div className="text-sm font-semibold">
                  {ticket.venue?.name || ticket.eventLocation}
                </div>
                {ticket.venue && (
                  <div className="text-xs text-gray-500">
                    {ticket.venue.address}, {ticket.venue.city}
                  </div>
                )}
              </div>
            </div>

            {/* Ticket Info Pills */}
            <div className="flex flex-wrap gap-2 pt-2">
              <div className="px-3 py-1.5 bg-secondary-500 text-white text-xs font-semibold rounded-full">
                {ticket.ticketType.toUpperCase()}
              </div>
              {ticket.quantity > 1 && (
                <div className="px-3 py-1.5 bg-primary-500 text-white text-xs font-semibold rounded-full">
                  QTY: {ticket.quantity}
                </div>
              )}
              <div className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full">
                {ticket.price}
              </div>
            </div>

            {/* QR Code */}
            <div className="pt-4">
              <div className="bg-gray-50 rounded-xl p-6 text-center">
                <div className="inline-block p-4 bg-white rounded-lg shadow-sm">
                  {ticket.qrCode ? (
                    <Image
                      src={ticket.qrCode}
                      alt="Ticket QR Code"
                      width={200}
                      height={200}
                      className="w-48 h-48"
                    />
                  ) : (
                    <div className="w-48 h-48 bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400 text-sm">QR Code</span>
                    </div>
                  )}
                </div>
                <p className="text-xs font-semibold text-gray-700 mt-3">SCAN FOR ENTRY</p>
                <p className="text-xs text-gray-500 mt-1">Valid for this event only</p>
              </div>
            </div>

            {/* Attendee Info */}
            <div className="pt-4 border-t border-dashed border-gray-300">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-xs text-gray-500 font-semibold mb-1">TICKET HOLDER</div>
                <div className="text-sm font-bold text-gray-900">{ticket.attendeeName}</div>
                <div className="text-xs text-gray-500 mt-2">Order ID: {ticket.orderId}</div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <p className="text-xs text-gray-600 text-center">
              Please present this ticket at entry. No refunds or exchanges.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 space-y-3">
          <button
            onClick={handleDownloadPDF}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition-colors"
          >
            <Download className="w-5 h-5" />
            Download PDF Ticket
          </button>

          {typeof navigator !== 'undefined' && navigator.share && (
            <button
              onClick={handleShare}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-dark-700 hover:bg-dark-600 text-white rounded-lg font-medium transition-colors"
            >
              <Share2 className="w-5 h-5" />
              Share Ticket
            </button>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-dark-800/50 rounded-lg p-4 text-sm text-gray-300">
          <h3 className="font-semibold text-white mb-2">How to use this ticket:</h3>
          <ul className="space-y-1 text-xs">
            <li>• Save this page to your home screen for offline access</li>
            <li>• Show the QR code at the event entrance</li>
            <li>• Download the PDF for backup</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
