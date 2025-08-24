import { Metadata } from 'next'
import EventsList from '@/components/EventsList'
import EventsHero from '@/components/EventsHero'

export const metadata: Metadata = {
  title: 'Events - Global Kontakt Empire Ltd',
  description: 'Discover our upcoming Afrocentric events, cultural celebrations, and business empowerment programs. Book your tickets today!',
}

const EventsPage = () => {
  return (
    <div className="min-h-screen">
      <EventsHero />
      <EventsList />
    </div>
  )
}

export default EventsPage






