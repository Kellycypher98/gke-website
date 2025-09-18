import { Metadata } from 'next'
import { Users, Target, Heart, Globe, Award, Star, Lightbulb, Shield } from 'lucide-react'

export const metadata: Metadata = {
  title: 'About Us - Global Kontakt Empire Ltd',
  description: 'Discover our vision, mission, and core values. Learn about our commitment to Afrocentric culture, business empowerment, and community building.',
}

const AboutPage = () => {
  const coreValues = [
    {
      icon: Heart,
      title: 'Cultural Pride',
      description: 'We celebrate and preserve the rich heritage of African and Afro-Caribbean cultures, fostering pride and understanding across communities.',
      color: 'primary',
    },
    {
      icon: Target,
      title: 'Business Excellence',
      description: 'We empower entrepreneurs and businesses to achieve their highest potential through innovative programs and strategic partnerships.',
      color: 'secondary',
    },
    {
      icon: Users,
      title: 'Community First',
      description: 'Building strong, supportive communities where individuals can thrive, connect, and grow together.',
      color: 'royal',
    },
    {
      icon: Globe,
      title: 'Global Impact',
      description: 'Creating connections that span continents, bringing together cultures and businesses from around the world.',
      color: 'accent',
    },
    {
      icon: Lightbulb,
      title: 'Innovation',
      description: 'Continuously evolving and adapting to meet the changing needs of our community and the global marketplace.',
      color: 'primary',
    },
    {
      icon: Shield,
      title: 'Integrity',
      description: 'Operating with honesty, transparency, and ethical practices in all our business relationships and community interactions.',
      color: 'secondary',
    },
  ]

  
  const team = [
    {
      name: 'Kwabena Owusu-Ansah',
      role: 'Event Manager & Media Personality',
      image: '/images/team/KOA.jpg',
      bio: 'Kwabena Owusu-Ansah, popularly known as Kobby, is an accomplished event manager and organiser with a proven track record of successfully executing high-profile events for organisations such as Men of Vision UK (MOV) and Esteemed Club UK. With extensive experience across both the UK and Ghana, he has played a pivotal role behind the scenes of numerous impactful events. Kobby is also a seasoned radio and television presenter, widely recognised by his iconic moniker, "The Pilot of the Airwaves." His dynamic presence and versatility have made him a respected name in the media and events industries. Currently, Kobby brings his expertise to the Ministry of Justice (MOJ) in the UK, further expanding his professional portfolio and influence.'
    },
    {
      name: 'Leonora Buckman',
      role: 'Creative Entrepreneur & Arts Advocate',
      image: '/images/team/Leonora-buckman.jpg',
      bio: 'Leonora Buckman is a distinguished leader and creative entrepreneur whose work bridges the arts, culture, and social empowerment. She currently serves as President of Women in the Arts, Ghana and as a Board Member for Creative Arts in Ghana, championing female creativity and leadership in the arts sector. A multi-talented professional, she is a Child Psychologist, Makeup Artist, and the CEO of Crowning Image Beauty Parlour as well as CEO of Aronoel Royal Empire, an initiative empowering creative aged persons. She is also the originator of PLUMP BEAUTIFUL, a movement celebrating and empowering plus-size women. Her international experience includes representing the Council of Ghanaians in the Netherlands (RECOGIN), working as a Political Analyst on Recogin Radio in Amsterdam, coordinating projects for Women in Positive Social Action, directing the Kente Festival in Amsterdam, and managing Wiseway Crèche & Day Care. With a career defined by creativity, leadership, and service, Leonora Buckman continues to inspire and empower women while promoting arts and culture across borders.'
    },
    {
      name: 'Samuel Osei Buabeng (DJ Lord Sega)',
      role: 'Broadcaster & Media Entrepreneur',
      image: '/images/team/Lord-sega.jpg',
      bio: 'Samuel Osei Buabeng (Deejay Lord Sega) is a veteran broadcaster and DJ with a distinguished career spanning Ghana and the United Kingdom. A graduate of the University of Ghana and University of Bedfordshire (Luton), he began his broadcasting journey with Voice of Legon, which later evolved into Radio Univers. Now based in the UK, Lord Sega is a prominent presenter on Rainbow Radio and the founder of Afrobeats Radio, his own platform dedicated to promoting African music and culture. He also owns Sega Media Services, a company that builds, maintains, and provides technical support to radio stations around the world. In addition to his media ventures, he currently works with the National Health Service (NHS). Widely regarded as one of the finest DJs in the UK, Lord Sega continues to shape and influence the global Afrobeat soundscape through his talent and innovation.'
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-32 bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 overflow-hidden">
        <div className="absolute inset-0 african-pattern-bg opacity-5" />
        <div className="container-custom relative z-10 text-center">
          <h1 className="text-5xl md:text-7xl font-heading font-bold text-white mb-6">
            About{' '}
            <span className="text-gradient">Global Kontakt Empire</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
            We are more than an event company. We are a movement dedicated to celebrating 
            Afrocentric culture, empowering businesses, and building bridges between communities.
          </p>
        </div>
      </section>

      <section className="section-padding bg-dark-900">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-4">
              Meet Our Team
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Dedicated professionals passionate about culture, business, and community building.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <div
                key={member.name}
                className="text-center group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="relative mb-6">
                  <div className="w-32 h-32 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full mx-auto overflow-hidden">
                    <div
                      className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                      style={{
                        backgroundImage: `url(${member.image})`,
                      }}
                    />
                  </div>
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-primary-500 text-dark-900 px-3 py-1 rounded-full text-xs font-semibold">
                    {member.role}
                  </div>
                </div>
                <h3 className="text-xl font-heading font-semibold text-white mb-2">
                  {member.name}
                </h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  {member.bio}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* Vision & Mission */}
      <section className="section-padding bg-dark-800">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Vision */}
            <div className="text-center lg:text-left">
              <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mx-auto lg:mx-0 mb-6">
                <Target className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-6">
                Our Vision
              </h2>
              <p className="text-xl text-gray-300 leading-relaxed">
                To be the leading global platform that celebrates Afrocentric culture, 
                empowers entrepreneurs, and creates meaningful connections that transcend 
                borders and generations. We envision a world where cultural heritage is 
                celebrated, businesses thrive, and communities flourish together.
              </p>
            </div>

            {/* Mission */}
            <div className="text-center lg:text-left">
              <div className="w-20 h-20 bg-gradient-to-br from-secondary-500 to-royal-500 rounded-full flex items-center justify-center mx-auto lg:mx-0 mb-6">
                <Heart className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-6">
                Our Mission
              </h2>
              <p className="text-xl text-gray-300 leading-relaxed">
                To create exceptional cultural experiences, foster business growth, and 
                build inclusive communities through innovative events, educational programs, 
                and strategic partnerships that honor our heritage while embracing the future.
              </p>
            </div>
          </div>
        </div>
      </section>



      

      {/* Core Values */}
      <section className="section-padding bg-dark-900">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-4">
              Our Core Values
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              These fundamental principles guide everything we do, from event planning 
              to business development and community engagement.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {coreValues.map((value, index) => (
              <div
                key={value.title}
                className="group text-center p-8 bg-dark-800 rounded-2xl border border-dark-700 hover:border-primary-500/50 transition-all duration-500 transform hover:-translate-y-2"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`w-16 h-16 bg-${value.color}-500/20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <value.icon className={`w-8 h-8 text-${value.color}-500`} />
                </div>
                <h3 className="text-xl font-heading font-semibold text-white mb-4">
                  {value.title}
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      
      {/* Call to Action */}
      <section className="section-padding bg-gradient-to-br from-primary-500 to-secondary-500">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-dark-900 mb-6">
            Join Our Mission
          </h2>
          <p className="text-xl text-dark-900/90 mb-8 max-w-3xl mx-auto">
            Be part of our journey as we continue to celebrate culture, empower businesses, 
            and build stronger communities together.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <a href="/events" className="bg-dark-900 text-white font-semibold py-3 px-8 rounded-lg hover:bg-dark-800 transition-colors">
              Explore Events
            </a>
            <a href="/contact" className="border-2 border-dark-900 text-dark-900 font-semibold py-3 px-8 rounded-lg hover:bg-dark-900 hover:text-white transition-colors">
              Get in Touch
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}

export default AboutPage






