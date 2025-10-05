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
  quantity?: number
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

// Default design configuration - Brand Theme
const DEFAULT_DESIGN: TicketDesignConfig = {
  colors: {
    primary: '#EAB308',      // Brand primary (--primary: 234, 179, 8)
    secondary: '#10B981',    // Brand secondary (--secondary: 16, 185, 129)
    accent: '#EF4444',       // Brand accent (--accent: 239, 68, 68)
    text: '#000000',         // Pure black for maximum readability
    textLight: '#1E293B',    // Dark slate for secondary text
    background: '#FFFFFF'    // Pure white background
  },
  fonts: {
    title: 28,
    subtitle: 14,
    body: 11,
    caption: 9
  },
  spacing: {
    margin: 30,
    padding: 15
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
  
  // Header section with gradient effect (increased height for longer event names)
  doc.rect(0, 0, width, 120)
     .fill(config.colors.primary)
  
  // Subtle pattern overlay
  for (let i = 0; i < width; i += 20) {
    doc.rect(i, 0, 1, 120).fill('#FFFFFF').opacity(0.1)
  }
  
  // Reset opacity to full
  doc.opacity(1)
  
  // Accent border
  doc.rect(0, 115, width, 5).fill(config.colors.accent)
  
  // Border frame
  doc.rect(0, 0, width, height)
     .stroke(config.colors.primary, 2)
}

function renderHeader(doc: any, payload: TicketPayload, config: TicketDesignConfig, width: number) {
  const { margin } = config.spacing
  
  // Brand logo area (placeholder)
  doc.fillColor('#FFFFFF')
     .fontSize(config.fonts.caption)
     .text('GLOBAL KONTAKT EMPIRE', margin, 15)
  
  // Event category badge
  doc.fillColor('#FFFFFF')
     .fontSize(config.fonts.caption)
     .text('EVENT TICKET', width - margin - 80, 15)
  
  // Event name with better typography and more space
  doc.fillColor('#FFFFFF')
     .fontSize(config.fonts.title)
     .font('Helvetica-Bold')
     .text(payload.eventName, margin, 40, { 
       width: width - margin * 2,
       align: 'left',
       lineGap: 4
     })
}

function renderMainContent(doc: any, payload: TicketPayload, config: TicketDesignConfig, width: number, qrPng: Buffer) {
  const { margin, padding } = config.spacing
  let yPos = 140
  
  // Event details section header
  doc.fillColor(config.colors.text)
     .fontSize(config.fonts.subtitle)
     .font('Helvetica-Bold')
     .text('EVENT DETAILS', margin, yPos)
  
  yPos += 25
  
  // Date and time with bullet points
  doc.fillColor(config.colors.text)
     .fontSize(config.fonts.body)
     .font('Helvetica')
  
  if (payload.doorTime || payload.showTime) {
    doc.text(`• Date: ${payload.eventDate}`, margin, yPos)
    yPos += 18
    if (payload.doorTime) {
      doc.text(`• Doors: ${payload.doorTime}`, margin, yPos)
      yPos += 18
    }
    if (payload.showTime) {
      doc.text(`• Show: ${payload.showTime}`, margin, yPos)
      yPos += 18
    }
  } else {
    doc.text(`• Date & Time: ${payload.eventDate}`, margin, yPos)
    yPos += 18
  }
  
  // Venue information with bullet points
  if (payload.venue) {
    doc.text(`• Venue: ${payload.venue.name}`, margin, yPos)
    yPos += 18
    doc.text(`• Address: ${payload.venue.address}, ${payload.venue.city}`, margin, yPos)
    yPos += 18
  } else {
    doc.text(`• Location: ${payload.eventLocation}`, margin, yPos)
    yPos += 18
  }
  
  // Additional info
  if (payload.genre) {
    doc.text(`• Genre: ${payload.genre}`, margin, yPos)
    yPos += 18
  }
  
  if (payload.ageRestriction) {
    doc.text(`• Age: ${payload.ageRestriction}`, margin, yPos)
    yPos += 18
  }
  
  yPos += 20
  
  // Ticket information pills
  renderTicketPills(doc, payload, config, margin, yPos)
  
  yPos += 50
  
  // QR Code section (centered below details)
  renderQRSection(doc, payload, config, width, qrPng, yPos)
  
  // Attendee information
  renderAttendeeSection(doc, payload, config, margin, 450)
}

function renderTicketPills(doc: any, payload: TicketPayload, config: TicketDesignConfig, x: number, y: number) {
  const pillHeight = 32
  let currentX = x
  
  // Ticket type pill with modern design
  const typeWidth = doc.widthOfString(payload.ticketType.toUpperCase()) + 30
  doc.roundedRect(currentX, y, typeWidth, pillHeight, 16)
     .fill(config.colors.secondary)
     .stroke(config.colors.accent, 1)
  
  doc.fillColor('#FFFFFF')
     .fontSize(config.fonts.body)
     .font('Helvetica-Bold')
     .text(payload.ticketType.toUpperCase(), currentX + 15, y + 10)
  
  currentX += typeWidth + 15
  
  // Quantity pill (if quantity > 1)
  if (payload.quantity && payload.quantity > 1) {
    const quantityText = `QTY: ${payload.quantity}`
    const quantityWidth = doc.widthOfString(quantityText) + 30
    doc.roundedRect(currentX, y, quantityWidth, pillHeight, 16)
       .fill(config.colors.primary)
       .stroke(config.colors.accent, 1)
    
    doc.fillColor('#FFFFFF')
       .fontSize(config.fonts.body)
       .font('Helvetica-Bold')
       .text(quantityText, currentX + 15, y + 10)
    
    currentX += quantityWidth + 15
  }
  
  // Price pill with enhanced styling
  const priceText = `${payload.priceText}`
  const priceWidth = doc.widthOfString(priceText) + 30
  doc.roundedRect(currentX, y, priceWidth, pillHeight, 16)
     .fill(config.colors.accent)
     .stroke(config.colors.primary, 1)
  
  doc.fillColor(config.colors.text)
     .fontSize(config.fonts.body)
     .font('Helvetica-Bold')
     .text(priceText, currentX + 15, y + 10)
}

function renderQRSection(doc: any, payload: TicketPayload, config: TicketDesignConfig, width: number, qrPng: Buffer, yPos: number) {
  const qrSize = 100
  const qrX = (width - qrSize) / 2  // Center horizontally
  const qrY = yPos
  
  // QR Code container with modern styling
  doc.roundedRect(qrX - 12, qrY - 12, qrSize + 24, qrSize + 42, 10)
     .fill('#FFFFFF')
     .stroke(config.colors.primary, 2)
  
  // Inner shadow effect
  doc.roundedRect(qrX - 10, qrY - 10, qrSize + 20, qrSize + 38, 8)
     .fill('#F8F9FA')
  
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
       .fill('#E5E7EB')
       .stroke(config.colors.textLight)
    doc.fillColor(config.colors.textLight)
       .fontSize(config.fonts.caption)
       .text('QR CODE', qrX + 35, qrY + 50)
  }
  
  // QR instructions with better styling
  doc.fillColor(config.colors.text)
     .fontSize(8)
     .font('Helvetica-Bold')
     .text('SCAN FOR ENTRY', qrX - 10, qrY + qrSize + 3, { 
       width: qrSize + 20,
       align: 'center'
     })
  
  // Security note
  doc.fillColor(config.colors.textLight)
     .fontSize(7)
     .text('Valid for this event only', qrX - 10, qrY + qrSize + 15, { 
       width: qrSize + 20,
       align: 'center'
     })
}

function renderAttendeeSection(doc: any, payload: TicketPayload, config: TicketDesignConfig, x: number, y: number) {
  // Modern separator with gradient effect
  doc.moveTo(x, y)
     .lineTo(doc.page.width - x, y)
     .dash(8, { space: 4 })
     .stroke(config.colors.primary, 1.5)
     .undash()
  
  y += 25
  
  // Attendee info section with background
  doc.roundedRect(x - 10, y - 5, 200, 60, 8)
     .fill('#F8F9FA')
     .stroke(config.colors.primary, 1)
  
  // Attendee label
  doc.fillColor(config.colors.textLight)
     .fontSize(config.fonts.caption)
     .font('Helvetica-Bold')
     .text('TICKET HOLDER', x, y)
  
  // Attendee name
  doc.fillColor(config.colors.text)
     .fontSize(config.fonts.subtitle)
     .font('Helvetica-Bold')
     .text(payload.attendeeName, x, y + 15)
  
  // Order ID with better formatting
  doc.fillColor(config.colors.textLight)
     .fontSize(config.fonts.caption)
     .text(`Order ID: ${payload.orderId}`, x, y + 35)
}

function renderFooter(doc: any, payload: TicketPayload, config: TicketDesignConfig, width: number, height: number) {
  const footerY = height - 50
  
  // Footer background
  doc.rect(0, footerY - 10, width, 50)
     .fill('#F8F9FA')
     .stroke(config.colors.primary, 1)
  
  // Terms reminder with better formatting
  doc.fillColor(config.colors.textLight)
     .fontSize(config.fonts.caption)
     .text('• Please present this ticket at entry. No refunds or exchanges.', 
           config.spacing.margin, footerY)
  
  // Branding with better styling
  doc.fillColor(config.colors.primary)
     .fontSize(config.fonts.caption)
     .font('Helvetica-Bold')
     .text('Powered by Global Kontakt Empire', 
           config.spacing.margin, footerY + 15)
  
  // Security features
  doc.fillColor(config.colors.textLight)
     .fontSize(8)
     .text('This ticket contains security features and is valid only for the specified event.', 
           config.spacing.margin, footerY + 30)
}

function renderDecorations(doc: any, config: TicketDesignConfig, width: number, height: number) {
  // Modern corner decorations
  const cornerSize = 20
  
  // Top-left corner with gradient effect
  doc.circle(cornerSize/2, cornerSize/2, cornerSize)
     .fill(config.colors.accent)
     .stroke(config.colors.primary, 2)
  
  // Top-right corner with gradient effect
  doc.circle(width - cornerSize/2, cornerSize/2, cornerSize)
     .fill(config.colors.accent)
     .stroke(config.colors.primary, 2)
  
  // Bottom-left corner
  doc.circle(cornerSize/2, height - cornerSize/2, cornerSize)
     .fill(config.colors.secondary)
     .stroke(config.colors.primary, 1)
  
  // Bottom-right corner
  doc.circle(width - cornerSize/2, height - cornerSize/2, cornerSize)
     .fill(config.colors.secondary)
     .stroke(config.colors.primary, 1)
  
  // Subtle pattern along the edges
  for (let i = 30; i < width - 30; i += 25) {
    doc.circle(i, 10, 1.5).fill(config.colors.primary).opacity(0.3)
    doc.circle(i, height - 10, 1.5).fill(config.colors.primary).opacity(0.3)
  }
  
  // Security pattern in corners
  for (let i = 0; i < 5; i++) {
    doc.rect(5 + i * 3, 5 + i * 3, 2, 2).fill(config.colors.textLight).opacity(0.2)
    doc.rect(width - 7 - i * 3, 5 + i * 3, 2, 2).fill(config.colors.textLight).opacity(0.2)
  }
  
  // Reset opacity to full for any subsequent rendering
  doc.opacity(1)
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
        primary: '#EAB308',      // Brand primary (gold)
        secondary: '#10B981',    // Brand secondary (green)
        accent: '#EF4444',       // Brand accent (red)
        text: '#000000',         // Pure black
        textLight: '#1E293B',    // Dark slate
        background: '#FFFFFF'    // Pure white
      }
    },
    classic: {
      colors: {
        primary: '#3B82F6',      // Royal blue (--royal: 59, 130, 246)
        secondary: '#EAB308',    // Brand primary (gold)
        accent: '#10B981',       // Brand secondary (green)
        text: '#000000',         // Pure black
        textLight: '#1E293B',    // Dark slate
        background: '#FFFFFF'    // Pure white
      }
    },
    vibrant: {
      colors: {
        primary: '#EF4444',      // Brand accent (red)
        secondary: '#EAB308',    // Brand primary (gold)
        accent: '#10B981',       // Brand secondary (green)
        text: '#000000',         // Pure black
        textLight: '#1E293B',    // Dark slate
        background: '#FFFFFF'    // Pure white
      }
    },
    minimal: {
      colors: {
        primary: '#0F172A',      // Dark background
        secondary: '#334155',    // Border color
        accent: '#EAB308',       // Brand primary (gold)
        text: '#000000',         // Pure black
        textLight: '#1E293B',    // Dark slate
        background: '#FFFFFF'    // Pure white
      }
    }
  }
  
  return generateTicketPDF(payload, themes[theme])
}