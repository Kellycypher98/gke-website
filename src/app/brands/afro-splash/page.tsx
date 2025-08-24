import AfroSplashHero from '@/components/AfroSplashHero'

export const dynamic = 'force-static'

export default function AfroSplashPage() {
  return (
    <div className="container-custom section-padding space-y-10">
      <AfroSplashHero />

      <section className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        {/* Info */}
        <div className="lg:col-span-3 space-y-4">
          <h2 className="text-3xl md:text-4xl font-heading font-semibold">About Afro Splash</h2>
          <p className="text-foreground/90">
            Afro Splash is a celebration of Afrocentric culture, featuring live music, fashion, art, and a
            vibrant community. Expect high-energy performances, stunning visuals, and a memorable atmosphere
            that brings people together.
          </p>
          <p className="text-foreground/80">
            Join us for an unforgettable night of rhythm and color. More details including lineup, venue and
            schedule will be announced soon.
          </p>

          <div className="pt-2">
            <a
              href="#tickets"
              className="inline-block btn-primary"
            >
              Buy Tickets
            </a>
          </div>
        </div>

        {/* Flyer placeholder */}
        <aside className="lg:col-span-2">
          <div className="card aspect-[3/4] flex items-center justify-center text-center">
            <div>
              <div className="text-sm uppercase tracking-wider text-foreground/60">Event Flyer</div>
              <div className="mt-2 text-foreground/80">Placeholder — add official flyer image here</div>
            </div>
          </div>
        </aside>
      </section>

      {/* Tickets section anchor (placeholder) */}
      <section id="tickets" className="section-padding pt-4">
        <div className="card">
          <h3 className="text-2xl font-heading font-semibold">Tickets</h3>
          <p className="mt-2 text-foreground/80">
            Ticketing details coming soon. Connect payment provider to enable checkout.
          </p>
        </div>
      </section>
    </div>
  )
}





