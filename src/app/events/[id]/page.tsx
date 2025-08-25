import Link from 'next/link'

async function getEvent(id: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/events/${id}`, {
      // When running locally without base URL, this will hit a relative path
      cache: 'no-store',
    })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export default async function EventDetailPage({ params }: any) {
  const event = await getEvent(params.id)

  const title = event?.title || 'Event Details'
  const description = event?.description || 'Details will be announced soon.'
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    
    const weekday = weekdays[date.getDay()]
    const day = date.getDate()
    const month = months[date.getMonth()]
    const year = date.getFullYear()
    
    return `${weekday}, ${day} ${month} ${year}`
  }

  const date = event?.date ? formatDate(event.date) : 'TBA'
  const time = event?.time || 'TBA'
  const location = event?.location || 'TBA'
  const ticketTiers: Array<{ name: string; price: number; available?: number; currency?: string }> =
    event?.ticketTiers || []

  return (
    <div className="container-custom section-padding space-y-10">
      {/* Header */}
      <header className="space-y-3">
        <h1 className="text-3xl md:text-5xl font-heading font-semibold text-gradient">{title}</h1>
        <div className="flex flex-wrap gap-3 text-sm text-foreground/70">
          <span className="px-3 py-1 rounded-full border border-border bg-dark-800">{date}</span>
          <span className="px-3 py-1 rounded-full border border-border bg-dark-800">{time}</span>
          <span className="px-3 py-1 rounded-full border border-border bg-dark-800">{location}</span>
        </div>
      </header>

      {/* Content */}
      <section className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        {/* Description */}
        <div className="lg:col-span-3 space-y-4">
          <div className="card">
            <h2 className="text-2xl font-heading font-semibold mb-2">About this event</h2>
            <p className="text-foreground/85 leading-relaxed">{description}</p>
          </div>
        </div>

        {/* Visual Placeholder */}
        <aside className="lg:col-span-2">
          <div className="card aspect-[3/4] relative overflow-hidden">
            <div className="absolute inset-0 african-pattern-bg opacity-10" />
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 via-secondary-500/20 to-royal-500/20" />
            <div className="absolute inset-0 flex items-center justify-center text-center">
              <div>
                <div className="text-xs uppercase tracking-wider text-foreground/60">Event Image</div>
                <div className="mt-1 text-foreground/75">Placeholder — add image later</div>
              </div>
            </div>
          </div>
        </aside>
      </section>

      {/* Tickets */}
      <section className="space-y-4" id="tickets">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-heading font-semibold">Tickets</h3>
          <Link href={`/events/${params.id}/book`} className="btn-primary">Buy Tickets</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ticketTiers.length > 0 ? (
            ticketTiers.map((tier, i) => (
              <div key={i} className="card">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-lg font-medium">{tier.name}</div>
                    {typeof tier.available === 'number' ? (
                      <div className="text-sm text-foreground/65 mt-1">{tier.available} available</div>
                    ) : null}
                  </div>
                  <div className="text-right font-semibold">
                    {tier.currency || 'GBP'} {tier.price}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="md:col-span-2 lg:col-span-3 card">
              Ticket information will be available soon.
            </div>
          )}
        </div>
      </section>

      <div className="pt-2">
        <Link href="/events" className="btn-outline">Back to Events</Link>
      </div>
    </div>
  )
}




