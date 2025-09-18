import { notFound } from 'next/navigation';
import Image from 'next/image';
import { format } from 'date-fns';
import { getEventBySlug } from '@/lib/events';
import EventHero from '@/components/EventHero';
import dynamic from 'next/dynamic';

// Dynamically import the GalleryHighlights component with SSR disabled
const GalleryHighlights = dynamic<{}>(
  () => import('@/components/GalleryHighlights').then((mod) => mod.default),
  { ssr: false }
);

export const dynamic = 'force-dynamic';

export default async function AfroSplashPage() {
  const event = await getEventBySlug('afro-splash');

  if (!event) {
    notFound();
  }

  const eventDate = new Date(event.first_event_date);
  const formattedDate = format(eventDate, 'EEEE, MMMM d, yyyy');
  const formattedTime = format(new Date(`1970-01-01T${event.time_start}`), 'h:mm a');
  const location = [event.location, event.city, event.country].filter(Boolean).join(', ');

  return (
    <div className="space-y-10">
      <EventHero 
        title={event.title}
        date={formattedDate}
        time={formattedTime}
        location={location}
        image={event.image}
      />

      <div className="container-custom section-padding space-y-10">
        <section className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
          {/* Event Info */}
          <div className="lg:col-span-3 space-y-6">
            <div className="prose prose-invert max-w-none">
              <h2 className="text-3xl md:text-4xl font-heading font-semibold">About {event.title}</h2>
              <div 
                className="mt-4 text-foreground/90 space-y-4" 
                dangerouslySetInnerHTML={{ __html: event.description }} 
              />
              
              {event.content && (
                <div 
                  className="mt-6 text-foreground/80" 
                  dangerouslySetInnerHTML={{ __html: event.content }} 
                />
              )}
            </div>

            {/* Gallery Section */}
            <div className="mt-16">
              <h2 className="text-3xl md:text-4xl font-heading font-semibold mb-8">Event Gallery</h2>
              <GalleryHighlights />
            </div>

            <div className="pt-2">
              <a
                href="#tickets"
                className="inline-block btn-primary"
              >
                Get Tickets
              </a>
            </div>

            {/* Event Details */}
            <div className="mt-8 space-y-4">
              <h3 className="text-2xl font-heading font-semibold">Event Details</h3>
              <div className="space-y-2">
                <div className="flex items-start space-x-3">
                  <CalendarIcon className="w-5 h-5 mt-0.5 text-primary-500 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Date & Time</p>
                    <p className="text-foreground/80">
                      {formattedDate} at {formattedTime}
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <MapPinIcon className="w-5 h-5 mt-0.5 text-primary-500 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Location</p>
                    <p className="text-foreground/80">
                      {event.location}
                      {event.address && (
                        <span className="block text-foreground/60">{event.address}</span>
                      )}
                      {event.city && event.country && (
                        <span className="block text-foreground/60">
                          {event.city}, {event.country}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Event Flyer */}
          <aside className="lg:col-span-2">
            <div className="card overflow-hidden">
              {event.image ? (
                <div className="relative aspect-[2/3] w-full">
                  <Image
                    src={event.image}
                    alt={`${event.title} Event Flyer`}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              ) : (
                <div className="aspect-[2/3] flex items-center justify-center text-center p-6">
                  <div>
                    <div className="text-sm uppercase tracking-wider text-foreground/60">Event Flyer</div>
                    <div className="mt-2 text-foreground/80">No flyer available</div>
                  </div>
                </div>
              )}
            </div>
          </aside>
        </section>

        {/* Tickets Section */}
        <section id="tickets" className="section-padding pt-4">
          <div className="card">
            <h3 className="text-2xl font-heading font-semibold">Tickets</h3>
            
            {event.ticket_prices ? (
              <div className="mt-6 space-y-4">
                {Object.entries(event.ticket_prices).map(([tier, price]) => (
                  <div key={tier} className="flex items-center justify-between p-4 bg-dark-800 rounded-lg">
                    <div>
                      <h4 className="font-medium capitalize">{tier.replace('_', ' ')}</h4>
                      <p className="text-sm text-foreground/60">Available until {formattedDate}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-semibold">
                        {event.currency || 'GHS'} {String(price)}
                      </p>
                      <button className="mt-2 px-4 py-2 bg-primary-500 text-dark-900 rounded-md font-medium hover:bg-primary-400 transition-colors">
                        Buy Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-foreground/80">
                Ticket information will be available soon. Please check back later or contact us for more details.
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

// Icons
function CalendarIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  );
}

function MapPinIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}
