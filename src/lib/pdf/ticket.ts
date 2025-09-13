import QRCode from 'qrcode'

// Lazy dynamic import for pdfkit standalone
let PDFDocumentCtor: any
async function ensurePDFKit() {
  if (!PDFDocumentCtor) {
    try {
      const mod: any = await import('pdfkit/js/pdfkit.standalone.js')
      PDFDocumentCtor = mod?.default ?? mod
    } catch (error) {
      throw new Error('Failed to load PDFKit: ' + error)
    }
  }
}

export interface TicketPayload {
  eventName: string
  eventDate: string
  eventLocation: string
  ticketType: string
  orderId: string
  attendeeName: string
  priceText: string
  qrData?: string
  // New optional fields for enhanced design
  eventDescription?: string
  venue?: {
    name: string
    address: string
    city: string
  }
  doorTime?: string
  showTime?: string
  ageRestriction?: string
  genre?: string
}

export interface QROptions {
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H'
  margin?: number
  width?: number
  color?: {
    dark?: string
    light?: string
  }
}

export interface TicketDesignConfig {
  colors: {
    primary: string
    secondary: string
    accent: string
    text: string
    textLight: string
    background: string
  }
  fonts: {
    title: number
    subtitle: number
    body: number
    caption: number
  }
  spacing: {
    margin: number
    padding: number
  }
}

// Default design configuration
const DEFAULT_DESIGN: TicketDesignConfig = {
  colors: {
    primary: '#1E40AF',     // Blue
    secondary: '#1F2937',   // Dark gray
    accent: '#F59E0B',      // Amber
    text: '#111827',        // Almost black
    textLight: '#6B7280',   // Light gray
    background: '#FFFFFF'   // White
  },
  fonts: {
    title: 32,
    subtitle: 16,
    body: 12,
    caption: 10
  },
  spacing: {
    margin: 40,
    padding: 20
  }
}

/**
 * Generates a QR code as PNG buffer
 */
import { createHmac } from 'crypto';

// Generate a signature for the ticket data
function signTicketData(data: Record<string, any>): string {
  const secret = process.env.TICKET_SIGNING_SECRET || 'your-secret-key';
  const hmac = createHmac('sha256', secret);
  hmac.update(JSON.stringify(data));
  return hmac.digest('hex');
}

export async function generateTicketQRPNG(
  payload: TicketPayload, 
  options: QROptions = {}
): Promise<Buffer> {
  try {
    const ticketData = {
      orderId: payload.orderId,
      attendeeName: payload.attendeeName,
      eventName: payload.eventName,
      eventDate: payload.eventDate,
      ticketType: payload.ticketType,
      timestamp: new Date().toISOString(),
    };
    
    // Add signature to the payload
    const signedPayload = {
      ...ticketData,
      signature: signTicketData(ticketData)
    };
    
    const qrPayload = payload.qrData || JSON.stringify(signedPayload);

    const qrOptions = {
      errorCorrectionLevel: options.errorCorrectionLevel || 'M',
      margin: options.margin || 1,
      width: options.width || 300,
      color: {
        dark: options.color?.dark || '#000000',
        light: options.color?.light || '#FFFFFF'
      }
    }

    const dataUrl = await QRCode.toDataURL(qrPayload, qrOptions)
    const base64 = dataUrl.split(',')[1]
    return Buffer.from(base64, 'base64')
  } catch (error) {
    throw new Error('Failed to generate QR code: ' + error)
  }
}

/**
 * Generates a beautifully designed PDF ticket
 */
export async function generateTicketPDF(
  payload: TicketPayload,
  designConfig: Partial<TicketDesignConfig> = {},
  qrOptions: QROptions = {}
): Promise<Buffer> {
  await ensurePDFKit()

  const config = { ...DEFAULT_DESIGN, ...designConfig }
  
  try {
    const qrPng = await generateTicketQRPNG(payload, qrOptions)
    
    // Create document with custom page size for ticket
    const doc = new PDFDocumentCtor({ 
      autoFirstPage: false,
      bufferPages: true
    })
    
    const chunks: Buffer[] = []
    
    return await new Promise<Buffer>((resolve, reject) => {
      doc.on('data', (chunk: Buffer) => chunks.push(chunk))
      doc.on('error', reject)
      doc.on('end', () => resolve(Buffer.concat(chunks)))

      // Add ticket page
      doc.addPage({ 
        size: [420, 595], // Custom ticket size (A5-ish)
        margin: 0 
      })
      
      // Set default font
      try { 
        doc.font('Helvetica') 
      } catch (e) {
        console.warn('Font loading failed, using default')
      }
      
      renderTicket(doc, payload, config, qrPng)
      doc.end()
    })
  } catch (error) {
    throw new Error('Failed to generate PDF ticket: ' + error)
  }
}

/**
 * Renders the ticket design
 */
function renderTicket(
  doc: any, 
  payload: TicketPayload, 
  config: TicketDesignConfig,
  qrPng: Buffer
) {
  const { width, height } = doc.page
  const { margin, padding } = config.spacing
  
  // Background gradient effect
  renderBackground(doc, width, height, config)
  
  // Header section
  renderHeader(doc, payload, config, width)
  
  // Main content area
  renderMainContent(doc, payload, config, width, qrPng)
  
  // Footer
  renderFooter(doc, payload, config, width, height)
  
  // Decorative elements
  renderDecorations(doc, config, width, height)
}

function renderBackground(doc: any, width: number, height: number, config: TicketDesignConfig) {
  // Main background
  doc.rect(0, 0, width, height).fill(config.colors.background)
  
  // Header gradient band
  doc.rect(0, 0, width, 100)
     .fillAndStroke(config.colors.primary, config.colors.primary)
  
  // Accent stripe
  doc.rect(0, 95, width, 5).fill(config.colors.accent)
}

function renderHeader(doc: any, payload: TicketPayload, config: TicketDesignConfig, width: number) {
  const { margin } = config.spacing
  
  // Event category badge
  doc.fillColor('#FFFFFF')
     .fontSize(config.fonts.caption)
     .text('LIVE EVENT TICKET', margin, 25)
  
  // Event name
  doc.fillColor('#FFFFFF')
     .fontSize(config.fonts.title)
     .text(payload.eventName, margin, 45, { 
       width: width - margin * 2,
       align: 'left'
     })
}

function renderMainContent(doc: any, payload: TicketPayload, config: TicketDesignConfig, width: number, qrPng: Buffer) {
  const { margin, padding } = config.spacing
  let yPos = 130
  
  // Event details section
  doc.fillColor(config.colors.text)
     .fontSize(config.fonts.subtitle)
     .text('Event Details', margin, yPos)
  
  yPos += 30
  
  // Date and time
  doc.fillColor(config.colors.textLight)
     .fontSize(config.fonts.body)
  
  if (payload.doorTime || payload.showTime) {
    doc.text(`Date: ${payload.eventDate}`, margin, yPos)
    yPos += 18
    if (payload.doorTime) {
      doc.text(`Doors: ${payload.doorTime}`, margin, yPos)
      yPos += 18
    }
    if (payload.showTime) {
      doc.text(`Show: ${payload.showTime}`, margin, yPos)
      yPos += 18
    }
  } else {
    doc.text(`Date & Time: ${payload.eventDate}`, margin, yPos)
    yPos += 18
  }
  
  // Venue information
  if (payload.venue) {
    doc.text(`Venue: ${payload.venue.name}`, margin, yPos)
    yPos += 18
    doc.text(`Address: ${payload.venue.address}, ${payload.venue.city}`, margin, yPos)
    yPos += 18
  } else {
    doc.text(`Location: ${payload.eventLocation}`, margin, yPos)
    yPos += 18
  }
  
  // Additional info
  if (payload.genre) {
    doc.text(`Genre: ${payload.genre}`, margin, yPos)
    yPos += 18
  }
  
  if (payload.ageRestriction) {
    doc.text(`Age: ${payload.ageRestriction}`, margin, yPos)
    yPos += 18
  }
  
  yPos += 20
  
  // Ticket information pills
  renderTicketPills(doc, payload, config, margin, yPos)
  
  // QR Code section
  renderQRSection(doc, payload, config, width, qrPng)
  
  // Attendee information
  renderAttendeeSection(doc, payload, config, margin, 420)
}

function renderTicketPills(doc: any, payload: TicketPayload, config: TicketDesignConfig, x: number, y: number) {
  const pillHeight = 28
  let currentX = x
  
  // Ticket type pill
  const typeWidth = doc.widthOfString(payload.ticketType) + 24
  doc.roundedRect(currentX, y, typeWidth, pillHeight, 14)
     .fill(config.colors.secondary)
  doc.fillColor('#FFFFFF')
     .fontSize(config.fonts.body)
     .text(payload.ticketType, currentX + 12, y + 8)
  
  currentX += typeWidth + 12
  
  // Price pill
  const priceText = `${payload.priceText}`
  const priceWidth = doc.widthOfString(priceText) + 24
  doc.roundedRect(currentX, y, priceWidth, pillHeight, 14)
     .fill(config.colors.accent)
  doc.fillColor('#FFFFFF')
     .fontSize(config.fonts.body)
     .text(priceText, currentX + 12, y + 8)
}

function renderQRSection(doc: any, payload: TicketPayload, config: TicketDesignConfig, width: number, qrPng: Buffer) {
  const qrSize = 100
  const qrX = width - config.spacing.margin - qrSize
  const qrY = 280
  
  // QR Code background
  doc.roundedRect(qrX - 10, qrY - 10, qrSize + 20, qrSize + 20, 8)
     .fill('#FFFFFF')
     .stroke(config.colors.textLight)
  
  // QR Code image
  try {
    // Convert PNG buffer to data URL for reliable embedding
    const qrBase64 = qrPng.toString('base64')
    const qrDataUrl = `data:image/png;base64,${qrBase64}`
    doc.image(qrDataUrl, qrX, qrY, { width: qrSize, height: qrSize })
  } catch (error) {
    console.error('Failed to embed QR code:', error)
    // Fallback: draw placeholder
    doc.rect(qrX, qrY, qrSize, qrSize)
       .fill('#F3F4F6')
       .stroke(config.colors.textLight)
    doc.fillColor(config.colors.textLight)
       .fontSize(config.fonts.caption)
       .text('QR CODE', qrX + 25, qrY + 45)
  }
  
  // QR instructions
  doc.fillColor(config.colors.textLight)
     .fontSize(config.fonts.caption)
     .text('Scan for entry', qrX - 5, qrY + qrSize + 15, { 
       width: qrSize + 10,
       align: 'center'
     })
}

function renderAttendeeSection(doc: any, payload: TicketPayload, config: TicketDesignConfig, x: number, y: number) {
  // Dashed separator line
  doc.moveTo(x, y)
     .lineTo(doc.page.width - x, y)
     .dash(5, { space: 3 })
     .stroke(config.colors.textLight)
     .undash()
  
  y += 20
  
  // Attendee info
  doc.fillColor(config.colors.text)
     .fontSize(config.fonts.body)
     .text('Ticket Holder', x, y)
  
  doc.fillColor(config.colors.textLight)
     .fontSize(config.fonts.subtitle)
     .text(payload.attendeeName, x, y + 20)
  
  // Order ID
  doc.fontSize(config.fonts.caption)
     .text(`Order #${payload.orderId}`, x, y + 45)
}

function renderFooter(doc: any, payload: TicketPayload, config: TicketDesignConfig, width: number, height: number) {
  const footerY = height - 60
  
  // Terms reminder
  doc.fillColor(config.colors.textLight)
     .fontSize(config.fonts.caption)
     .text('Please present this ticket at entry. No refunds or exchanges.', 
           config.spacing.margin, footerY)
  
  // Branding
  doc.text('Generated by Global Kontakt Empire', 
           config.spacing.margin, footerY + 20)
}

function renderDecorations(doc: any, config: TicketDesignConfig, width: number, height: number) {
  // Corner decorations
  const cornerSize = 15
  
  // Top-left corner
  doc.circle(0, 0, cornerSize).fill(config.colors.accent)
  
  // Top-right corner  
  doc.circle(width, 0, cornerSize).fill(config.colors.accent)
  
  // Bottom perforation effect
  for (let i = 20; i < width - 20; i += 15) {
    doc.circle(i, height - 30, 2).fill(config.colors.textLight)
  }
}

/**
 * Utility function to create a ticket with preset themes
 */
export async function generateThemedTicket(
  payload: TicketPayload,
  theme: 'modern' | 'classic' | 'vibrant' | 'minimal' = 'modern'
): Promise<Buffer> {
  const themes = {
    modern: {
      colors: {
        primary: '#F59E0B',   // Golden yellow
        secondary: '#B45309', // Deep gold
        accent: '#FCD34D',    // Light gold
        text: '#451A03',      // Dark amber
        textLight: '#92400E', // Medium amber
        background: '#FFFBEB' // Cream white
      }
    },
    classic: {
      colors: {
        primary: '#D97706',   // Rich gold
        secondary: '#92400E', // Bronze gold
        accent: '#FBBF24',    // Bright yellow
        text: '#451A03',      // Dark amber
        textLight: '#A16207', // Medium gold
        background: '#FEF3C7' // Light golden cream
      }
    },
    vibrant: {
      colors: {
        primary: '#EAB308',   // Vivid yellow
        secondary: '#CA8A04', // Deep yellow
        accent: '#FDE047',    // Bright yellow
        text: '#422006',      // Very dark amber
        textLight: '#A16207', // Medium yellow
        background: '#FEFCE8' // Very light yellow
      }
    },
    minimal: {
      colors: {
        primary: '#B45309',   // Muted gold
        secondary: '#78350F', // Dark gold
        accent: '#D97706',    // Medium gold
        text: '#1C1917',      // Near black
        textLight: '#78716C', // Warm gray
        background: '#FFFFFF' // Pure white
      }
    }
  }
  
  return generateTicketPDF(payload, themes[theme])
}