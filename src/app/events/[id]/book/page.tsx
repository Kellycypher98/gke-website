import Link from 'next/link'

export default function EventBookingPage({ params }: { params: { id: string } }) {
  return (
    <div className="container-custom section-padding space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-heading font-semibold">Book Tickets</h1>
        <p className="text-foreground/75">Event ID: {params.id}</p>
      </header>

      <div className="card">
        <p className="text-foreground/80">
          Ticketing flow coming soon. Connect your payment provider (Stripe, Paystack, etc.) and implement
          checkout here.
        </p>
      </div>

      <div className="flex gap-3">
        <Link href={`/events/${params.id}`} className="btn-outline">Back to Details</Link>
        <Link href="/events" className="btn-outline">Back to Events</Link>
      </div>
    </div>
  )
}





