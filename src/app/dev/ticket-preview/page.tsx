'use client'

import React, { useState } from 'react'

// Sample ticket data matching your TicketPayload interface
const sampleTickets = {
  concert: {
    eventName: "Summer Music Festival 2025",
    eventDate: "July 15, 2025 @ 7:00 PM",
    eventLocation: "Central Park Amphitheater",
    ticketType: "VIP",
    orderId: "ORD-2025-789456",
    attendeeName: "John Smith",
    priceText: "$150.00",
    quantity: 2,
    venue: {
      name: "Central Park Amphitheater",
      address: "1234 Park Avenue",
      city: "New York, NY"
    },
    doorTime: "6:00 PM",
    showTime: "7:30 PM",
    ageRestriction: "18+",
    genre: "Rock/Pop"
  },
  theater: {
    eventName: "The Phantom of the Opera",
    eventDate: "August 20, 2025 @ 8:00 PM",
    eventLocation: "Grand Theater",
    ticketType: "Premium",
    orderId: "ORD-2025-123789",
    attendeeName: "Sarah Johnson",
    priceText: "$89.50",
    quantity: 1,
    venue: {
      name: "Grand Theater",
      address: "567 Broadway",
      city: "New York, NY"
    },
    doorTime: "7:30 PM",
    showTime: "8:00 PM",
    ageRestriction: "All Ages",
    genre: "Musical Theater"
  },
  sports: {
    eventName: "Championship Finals 2025",
    eventDate: "September 10, 2025 @ 3:00 PM",
    eventLocation: "National Stadium",
    ticketType: "General Admission",
    orderId: "ORD-2025-456123",
    attendeeName: "Mike Davis",
    priceText: "$75.00",
    quantity: 4,
    venue: {
      name: "National Stadium",
      address: "789 Sports Complex Dr",
      city: "Los Angeles, CA"
    },
    doorTime: "2:00 PM",
    showTime: "3:00 PM",
    ageRestriction: "All Ages",
    genre: "Sports"
  }
}

const themes = {
  modern: {
    primary: '#EAB308',      // Brand primary (gold)
    secondary: '#10B981',    // Brand secondary (green)
    accent: '#EF4444',       // Brand accent (red)
    text: '#000000',         // Pure black
    textLight: '#1E293B',    // Dark slate
    background: '#FFFFFF'    // Pure white
  },
  classic: {
    primary: '#3B82F6',      // Royal blue
    secondary: '#EAB308',    // Brand primary (gold)
    accent: '#10B981',       // Brand secondary (green)
    text: '#000000',         // Pure black
    textLight: '#1E293B',    // Dark slate
    background: '#FFFFFF'    // Pure white
  },
  vibrant: {
    primary: '#EF4444',      // Brand accent (red)
    secondary: '#EAB308',    // Brand primary (gold)
    accent: '#10B981',       // Brand secondary (green)
    text: '#000000',         // Pure black
    textLight: '#1E293B',    // Dark slate
    background: '#FFFFFF'    // Pure white
  },
  minimal: {
    primary: '#0F172A',      // Dark background
    secondary: '#334155',    // Border color
    accent: '#EAB308',       // Brand primary (gold)
    text: '#000000',         // Pure black
    textLight: '#1E293B',    // Dark slate
    background: '#FFFFFF'    // Pure white
  }
}

export default function TicketPreviewPage() {
  const [selectedSample, setSelectedSample] = useState<keyof typeof sampleTickets>('concert')
  const [selectedTheme, setSelectedTheme] = useState<keyof typeof themes>('modern')
  const [viewMode, setViewMode] = useState<'preview' | 'pdf' | 'split'>('split')
  
  const ticket = sampleTickets[selectedSample]
  const colors = themes[selectedTheme]
  
  // Generate PDF URL with current settings
  const pdfUrl = `/api/test-pdf?theme=${selectedTheme}&sample=${selectedSample}`

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '2rem',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Controls */}
      <div style={{
        maxWidth: viewMode === 'split' ? '1400px' : '1200px',
        margin: '0 auto 2rem',
        background: 'white',
        padding: '1.5rem',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ margin: '0 0 1rem', fontSize: '1.75rem', color: '#1a1a1a' }}>
          🎫 Ticket PDF Preview Tool
        </h1>
        
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.875rem' }}>
              Sample Event
            </label>
            <select 
              value={selectedSample}
              onChange={(e) => setSelectedSample(e.target.value as keyof typeof sampleTickets)}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                border: '2px solid #e5e7eb',
                fontSize: '0.875rem'
              }}
            >
              <option value="concert">🎵 Concert</option>
              <option value="theater">🎭 Theater</option>
              <option value="sports">⚽ Sports</option>
            </select>
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.875rem' }}>
              Theme
            </label>
            <select 
              value={selectedTheme}
              onChange={(e) => setSelectedTheme(e.target.value as keyof typeof themes)}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                border: '2px solid #e5e7eb',
                fontSize: '0.875rem'
              }}
            >
              <option value="modern">✨ Modern Gold</option>
              <option value="classic">🏛️ Classic</option>
              <option value="vibrant">🌟 Vibrant</option>
              <option value="minimal">⚪ Minimal</option>
            </select>
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.875rem' }}>
              View Mode
            </label>
            <select 
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value as 'preview' | 'pdf' | 'split')}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                border: '2px solid #e5e7eb',
                fontSize: '0.875rem'
              }}
            >
              <option value="split">📊 Split View</option>
              <option value="preview">👁️ Preview Only</option>
              <option value="pdf">📄 PDF Only</option>
            </select>
          </div>
          
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'flex-end' }}>
            <a 
              href={pdfUrl}
              download={`ticket-${selectedTheme}-${selectedSample}.pdf`}
              style={{
                padding: '0.5rem 1.5rem',
                background: '#667eea',
                color: 'white',
                borderRadius: '6px',
                textDecoration: 'none',
                fontSize: '0.875rem',
                fontWeight: '600',
                display: 'inline-block'
              }}
            >
              ⬇️ Download PDF
            </a>
          </div>
        </div>
        
        <p style={{ margin: '0', fontSize: '0.875rem', color: '#6b7280' }}>
          💡 Preview mirrors your PDF design. Switch themes and samples to test different configurations!
        </p>
      </div>

      {/* Content Area */}
      <div style={{ 
        maxWidth: viewMode === 'split' ? '1400px' : '600px',
        margin: '0 auto',
        display: 'flex',
        gap: '2rem',
        flexWrap: viewMode === 'split' ? 'nowrap' : 'wrap',
        justifyContent: 'center'
      }}>
        {/* React Preview */}
        {(viewMode === 'preview' || viewMode === 'split') && (
          <div style={{ flex: viewMode === 'split' ? '1' : 'none' }}>
            <h2 style={{ 
              color: 'white', 
              fontSize: '1.25rem', 
              marginBottom: '1rem',
              textAlign: 'center',
              textShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }}>
              React Preview
            </h2>
            <div style={{ 
              perspective: '1000px',
              display: 'flex',
              justifyContent: 'center'
            }}>
              <TicketPreview ticket={ticket} colors={colors} />
            </div>
          </div>
        )}
        
        {/* PDF Preview */}
        {(viewMode === 'pdf' || viewMode === 'split') && (
          <div style={{ flex: viewMode === 'split' ? '1' : 'none' }}>
            <h2 style={{ 
              color: 'white', 
              fontSize: '1.25rem', 
              marginBottom: '1rem',
              textAlign: 'center',
              textShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }}>
              Actual PDF Output
            </h2>
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '1rem',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              height: '700px'
            }}>
              <iframe 
                src={pdfUrl}
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  borderRadius: '8px'
                }}
                title="PDF Preview"
              />
            </div>
          </div>
        )}
      </div>
      
      {/* Info panel */}
      <div style={{
        maxWidth: viewMode === 'split' ? '1400px' : '600px',
        margin: '2rem auto 0',
        background: 'white',
        padding: '1.5rem',
        borderRadius: '12px',
        fontSize: '0.875rem',
        color: '#374151'
      }}>
        <h3 style={{ margin: '0 0 1rem', fontSize: '1.125rem' }}>📋 How to Use</h3>
        <ul style={{ margin: 0, paddingLeft: '1.5rem', lineHeight: '1.8' }}>
          <li><strong>Sample Event:</strong> Switch between concert, theater, and sports events</li>
          <li><strong>Theme:</strong> Test all 4 themes (modern, classic, vibrant, minimal)</li>
          <li><strong>View Mode:</strong> Compare React preview with actual PDF output side-by-side</li>
          <li><strong>Download:</strong> Click the download button to save the current PDF configuration</li>
          <li><strong>Live Updates:</strong> Changes are reflected immediately in both preview and PDF</li>
        </ul>
      </div>
    </div>
  )
}

interface TicketPreviewProps {
  ticket: typeof sampleTickets.concert
  colors: typeof themes.modern
}

function TicketPreview({ ticket, colors }: TicketPreviewProps) {
  const [isHovered, setIsHovered] = useState(false)
  
  return (
    <div style={{
      width: '420px',
      height: '595px',
      background: colors.background,
      border: `2px solid ${colors.primary}`,
      borderRadius: '8px',
      boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      position: 'relative',
      overflow: 'hidden',
      transform: isHovered ? 'rotateY(0deg) rotateX(0deg)' : 'rotateY(-5deg) rotateX(5deg)',
      transition: 'transform 0.3s ease'
    }}
    onMouseEnter={() => setIsHovered(true)}
    onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header */}
      <div style={{
        background: colors.primary,
        height: '120px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Pattern overlay */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'repeating-linear-gradient(90deg, rgba(255,255,255,0.1) 0px, rgba(255,255,255,0.1) 1px, transparent 1px, transparent 20px)'
        }} />
        
        {/* Brand */}
        <div style={{ position: 'absolute', top: '15px', left: '30px', color: 'white', fontSize: '9px' }}>
          GLOBAL KONTAKT EMPIRE
        </div>
        <div style={{ position: 'absolute', top: '15px', right: '30px', color: 'white', fontSize: '9px' }}>
          EVENT TICKET
        </div>
        
        {/* Event name */}
        <div style={{
          position: 'absolute',
          top: '40px',
          left: '30px',
          right: '30px',
          color: 'white',
          fontSize: '24px',
          fontWeight: 'bold',
          lineHeight: '1.3'
        }}>
          {ticket.eventName}
        </div>
      </div>
      
      {/* Accent bar */}
      <div style={{ height: '5px', background: colors.accent }} />
      
      {/* Main content */}
      <div style={{ padding: '20px 30px', paddingTop: '15px' }}>
        {/* Event details */}
        <div>
          <div style={{ fontSize: '14px', fontWeight: 'bold', color: colors.text, marginBottom: '15px' }}>
            EVENT DETAILS
          </div>
          
          <div style={{ fontSize: '11px', color: colors.text, lineHeight: '1.7' }}>
            <div>• Date: {ticket.eventDate}</div>
            {ticket.doorTime && <div>• Doors: {ticket.doorTime}</div>}
            {ticket.showTime && <div>• Show: {ticket.showTime}</div>}
            {ticket.venue ? (
              <>
                <div>• Venue: {ticket.venue.name}</div>
                <div>• Address: {ticket.venue.address}, {ticket.venue.city}</div>
              </>
            ) : (
              <div>• Location: {ticket.eventLocation}</div>
            )}
            {ticket.genre && <div>• Genre: {ticket.genre}</div>}
            {ticket.ageRestriction && <div>• Age: {ticket.ageRestriction}</div>}
          </div>
          
          {/* Ticket pills */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '20px', flexWrap: 'wrap' }}>
            <div style={{
              background: colors.secondary,
              color: 'white',
              padding: '8px 15px',
              borderRadius: '16px',
              fontSize: '11px',
              fontWeight: 'bold',
              border: `1px solid ${colors.accent}`
            }}>
              {ticket.ticketType.toUpperCase()}
            </div>
            
            {ticket.quantity > 1 && (
              <div style={{
                background: colors.primary,
                color: 'white',
                padding: '8px 15px',
                borderRadius: '16px',
                fontSize: '11px',
                fontWeight: 'bold',
                border: `1px solid ${colors.accent}`
              }}>
                QTY: {ticket.quantity}
              </div>
            )}
            
            <div style={{
              background: colors.accent,
              color: colors.text,
              padding: '8px 15px',
              borderRadius: '16px',
              fontSize: '11px',
              fontWeight: 'bold',
              border: `1px solid ${colors.primary}`
            }}>
              {ticket.priceText}
            </div>
          </div>
        </div>
        
        {/* QR Code - centered below details */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginTop: '30px'
        }}>
          <div style={{
            background: '#F8F9FA',
            padding: '12px',
            borderRadius: '10px',
            border: `2px solid ${colors.primary}`,
            textAlign: 'center'
          }}>
            <div style={{
              width: '100px',
              height: '100px',
              background: 'white',
              border: '1px solid #e5e7eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '9px',
              color: '#9ca3af',
              marginBottom: '5px',
              borderRadius: '6px'
            }}>
              QR CODE
            </div>
            <div style={{ fontSize: '8px', fontWeight: 'bold', color: colors.text }}>
              SCAN FOR ENTRY
            </div>
            <div style={{ fontSize: '7px', color: colors.textLight, marginTop: '3px' }}>
              Valid for this event only
            </div>
          </div>
        </div>
      </div>
      
      {/* Attendee section */}
      <div style={{ position: 'absolute', bottom: '100px', left: '30px', right: '30px' }}>
        <div style={{
          borderTop: `1.5px dashed ${colors.primary}`,
          marginBottom: '25px'
        }} />
        
        <div style={{
          background: '#F8F9FA',
          padding: '15px',
          borderRadius: '8px',
          border: `1px solid ${colors.primary}`,
          display: 'inline-block'
        }}>
          <div style={{ fontSize: '9px', color: colors.textLight, fontWeight: 'bold' }}>
            TICKET HOLDER
          </div>
          <div style={{ fontSize: '14px', color: colors.text, fontWeight: 'bold', marginTop: '5px' }}>
            {ticket.attendeeName}
          </div>
          <div style={{ fontSize: '9px', color: colors.textLight, marginTop: '8px' }}>
            Order ID: {ticket.orderId}
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        background: '#F8F9FA',
        borderTop: `1px solid ${colors.primary}`,
        padding: '15px 30px',
        fontSize: '9px'
      }}>
        <div style={{ color: colors.textLight, marginBottom: '5px' }}>
          • Please present this ticket at entry. No refunds or exchanges.
        </div>
        <div style={{ color: colors.primary, fontWeight: 'bold', marginBottom: '5px' }}>
          Powered by Global Kontakt Empire
        </div>
        <div style={{ color: colors.textLight, fontSize: '8px' }}>
          This ticket contains security features and is valid only for the specified event.
        </div>
      </div>
      
      {/* Corner decorations */}
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        width: '20px',
        height: '20px',
        borderRadius: '50%',
        background: colors.accent,
        border: `2px solid ${colors.primary}`
      }} />
      <div style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        width: '20px',
        height: '20px',
        borderRadius: '50%',
        background: colors.accent,
        border: `2px solid ${colors.primary}`
      }} />
      <div style={{
        position: 'absolute',
        bottom: '10px',
        left: '10px',
        width: '20px',
        height: '20px',
        borderRadius: '50%',
        background: colors.secondary,
        border: `1px solid ${colors.primary}`
      }} />
      <div style={{
        position: 'absolute',
        bottom: '10px',
        right: '10px',
        width: '20px',
        height: '20px',
        borderRadius: '50%',
        background: colors.secondary,
        border: `1px solid ${colors.primary}`
      }} />
    </div>
  )
}
