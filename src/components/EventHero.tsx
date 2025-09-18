import Image from 'next/image';

interface EventHeroProps {
  title: string;
  date: string;
  time: string;
  location: string;
  image?: string;
}

export default function EventHero({ title, date, time, location, image }: EventHeroProps) {
  return (
    <div className="relative w-full h-[60vh] min-h-[400px] max-h-[800px] overflow-hidden rounded-xl">
      {image ? (
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover"
          priority
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900 to-secondary-900" />
      )}
      
      <div className="absolute inset-0 bg-black/60 flex items-center">
        <div className="container-custom text-white">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold font-heading mb-4">
            {title}
          </h1>
          
          <div className="flex flex-wrap gap-6 mt-8 text-lg">
            <div className="flex items-center space-x-2">
              <CalendarIcon className="w-6 h-6 text-primary-400" />
              <span>{date}</span>
            </div>
            <div className="flex items-center space-x-2">
              <ClockIcon className="w-6 h-6 text-primary-400" />
              <span>{time}</span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPinIcon className="w-6 h-6 text-primary-400" />
              <span>{location}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

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

function ClockIcon(props: React.SVGProps<SVGSVGElement>) {
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
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
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
