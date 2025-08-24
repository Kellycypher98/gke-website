# Global Kontakt Empire Ltd - Website

A modern, elegant, and culturally rich website for Global Kontakt Empire Ltd, an Afrocentric event hosting and business empowerment brand.

## 🌟 Features

### Frontend

- **Modern Design**: Luxurious dark theme with Afro-inspired accents
- **Responsive Layout**: Mobile-first design with smooth animations
- **Cultural Richness**: Celebrates Afrocentric heritage and business empowerment
- **Interactive Components**: Hover effects, smooth transitions, and engaging UI

### Pages

- **Homepage**: Hero banner, featured events, brand previews, gallery highlights
- **About Us**: Vision, mission, core values, and company journey
- **Events**: Comprehensive event listings with ticket information
- **Our Brands**: Dedicated sections for Afro Splash Night, Kente Banquet, and GBU-UK
- **Gallery**: Filterable media showcase
- **Blog/News**: Content management system
- **Contact**: Contact forms and business information

### Backend & E-Commerce

- **Event Management**: Create, update, delete events with ticket tiers
- **Secure Checkout**: Stripe integration for payment processing
- **User Management**: Registration, login, and account management
- **Ticket System**: QR code generation and email delivery
- **Admin Dashboard**: Comprehensive management interface
- **Newsletter System**: Email subscription management

## 🎨 Design System

### Color Palette

- **Primary**: Gold (#eab308) - Represents prosperity and success
- **Secondary**: Emerald (#10b981) - Symbolizes growth and harmony
- **Accent**: Red (#ef4444) - Represents passion and energy
- **Royal**: Blue (#3b82f6) - Signifies trust and professionalism
- **Dark**: Deep black/charcoal (#0f172a) - Base theme for elegance

### Typography

- **Headings**: Montserrat & Poppins (bold, modern)
- **Body**: Inter (clean, readable)
- **Cultural Elements**: African geometric patterns and textures

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- PostgreSQL database
- Stripe account (for payments)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd gke-website
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the root directory:

   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/gke_website"

   # NextAuth
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here"

   # Stripe
   STRIPE_PUBLISHABLE_KEY="pk_test_your_stripe_publishable_key"
   STRIPE_SECRET_KEY="sk_test_your_stripe_secret_key"
   STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret"

   # Email
   EMAIL_SERVER_HOST="smtp.gmail.com"
   EMAIL_SERVER_PORT=587
   EMAIL_SERVER_USER="your-email@gmail.com"
   EMAIL_SERVER_PASSWORD="your-app-password"
   ```

4. **Database Setup**

   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run the development server**

   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Project Structure

```
gke-website/
├── src/
│   ├── app/                 # Next.js 13+ app directory
│   │   ├── api/            # API routes
│   │   ├── about/          # About page
│   │   ├── events/         # Events pages
│   │   ├── brands/         # Brand pages
│   │   ├── gallery/        # Gallery page
│   │   ├── blog/           # Blog pages
│   │   ├── contact/        # Contact page
│   │   ├── admin/          # Admin dashboard
│   │   ├── globals.css     # Global styles
│   │   ├── layout.tsx      # Root layout
│   │   └── page.tsx        # Homepage
│   ├── components/         # Reusable components
│   │   ├── Navigation.tsx  # Main navigation
│   │   ├── Footer.tsx      # Site footer
│   │   ├── HeroSection.tsx # Homepage hero
│   │   ├── EventsList.tsx  # Events listing
│   │   └── ...            # Other components
│   ├── lib/               # Utility functions
│   ├── types/             # TypeScript types
│   └── styles/            # Additional styles
├── prisma/                # Database schema
├── public/                # Static assets
├── tailwind.config.ts     # Tailwind configuration
└── package.json           # Dependencies
```

## 🎯 Key Components

### Navigation

- Fixed header with transparent background
- Mobile-responsive menu
- Smooth scroll navigation
- Brand logo with gradient design

### Hero Section

- Rotating background images
- Animated statistics
- Call-to-action buttons
- African pattern overlays

### Events System

- Event listings with filters
- Ticket tier management
- Capacity tracking
- Booking system integration

### Brand Showcase

- Dedicated brand sections
- Feature highlights
- Statistics and achievements
- Call-to-action integration

## 🔧 Technology Stack

### Frontend

- **Next.js 13+**: React framework with app directory
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Framer Motion**: Animation library
- **Lucide React**: Icon library

### Backend

- **Prisma**: Database ORM
- **PostgreSQL**: Primary database
- **NextAuth.js**: Authentication
- **Stripe**: Payment processing
- **Nodemailer**: Email services

### Development

- **ESLint**: Code linting
- **Prettier**: Code formatting
- **TypeScript**: Static type checking

## 📱 Responsive Design

The website is built with a mobile-first approach:

- **Mobile**: Optimized for small screens
- **Tablet**: Responsive grid layouts
- **Desktop**: Full-featured experience
- **Touch-friendly**: Optimized for mobile interactions

## 🎨 Customization

### Colors

Modify the color palette in `tailwind.config.ts`:

```typescript
colors: {
  primary: { /* Gold variations */ },
  secondary: { /* Emerald variations */ },
  accent: { /* Red variations */ },
  royal: { /* Blue variations */ },
  dark: { /* Dark theme variations */ },
}
```

### Typography

Update fonts in `tailwind.config.ts`:

```typescript
fontFamily: {
  'heading': ['Montserrat', 'Poppins', 'sans-serif'],
  'body': ['Inter', 'system-ui', 'sans-serif'],
}
```

### Components

All components are modular and can be easily customized:

- Update component props
- Modify styling classes
- Add new features
- Integrate with external services

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository
2. Configure environment variables
3. Deploy automatically on push

### Other Platforms

- **Netlify**: Static site hosting
- **AWS**: Scalable cloud hosting
- **DigitalOcean**: VPS hosting
- **Heroku**: Platform-as-a-service

## 📊 Performance

- **Lighthouse Score**: 90+ on all metrics
- **Core Web Vitals**: Optimized for user experience
- **Image Optimization**: Next.js automatic optimization
- **Code Splitting**: Automatic bundle optimization
- **SEO Ready**: Meta tags and structured data

## 🔒 Security

- **Authentication**: Secure user management
- **Payment Security**: Stripe PCI compliance
- **Data Protection**: GDPR compliant
- **Input Validation**: Form security
- **HTTPS**: Secure connections

## 📈 Analytics & SEO

- **SEO Optimized**: Meta tags, structured data
- **Performance Monitoring**: Core Web Vitals
- **Search Engine Ready**: Sitemap generation
- **Social Media**: Open Graph tags
- **Accessibility**: WCAG compliance

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is proprietary software owned by Global Kontakt Empire Ltd.

## 🆘 Support

For support and questions:

- **Email**: info@globalkontaktempire.com
- **Phone**: +44 123 456 789
- **Website**: https://globalkontaktempire.com

## 🙏 Acknowledgments

- African cultural heritage and traditions
- Modern web development community
- Open source contributors
- Design inspiration from global cultures

---

**Built with ❤️ for Global Kontakt Empire Ltd**

_Experience Culture. Empower Business. Celebrate Life._
