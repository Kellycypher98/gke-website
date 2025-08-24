export const dynamic = 'force-static'

type GalleryItem = {
  id: string
  title: string
  subtitle?: string
}

const items: GalleryItem[] = [
  { id: 'afro-splash-1', title: 'Afro Splash Night', subtitle: 'Highlights' },
  { id: 'kente-banquet', title: 'Kente Banquet', subtitle: 'Moments' },
  { id: 'gbu-uk', title: 'GBU-UK Forum', subtitle: 'Speakers & Sessions' },
  { id: 'networking', title: 'Networking Mixer', subtitle: 'Connections' },
  { id: 'fashion', title: 'Fashion Showcase', subtitle: 'Design & Culture' },
  { id: 'performance', title: 'Live Performances', subtitle: 'Energy & Rhythm' },
]

export default function GalleryPage() {
  return (
    <div className="container-custom section-padding space-y-10">
      <header className="space-y-3">
        <h1 className="text-4xl md:text-5xl font-heading font-semibold text-gradient">Gallery</h1>
        <p className="text-foreground/80 max-w-3xl">
          Explore moments from our events. These are placeholders — replace with real images under
          <code className="mx-2 rounded bg-dark-800 px-2 py-0.5 border border-dark-700">/public/images/gallery</code>
          when available.
        </p>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((it) => (
          <article key={it.id} className="group relative overflow-hidden rounded-xl border border-dark-700 bg-dark-800">
            {/* Placeholder visual */}
            <div className="relative aspect-[4/3]">
              <div className="absolute inset-0 african-pattern-bg opacity-10" />
              <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 via-secondary-500/20 to-royal-500/20" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-xs uppercase tracking-wider text-foreground/60">Image Placeholder</div>
                  <div className="mt-1 text-foreground/70">Add file in /public/images/gallery</div>
                </div>
              </div>
            </div>

            {/* Caption */}
            <div className="p-4">
              <h3 className="text-lg font-heading font-semibold">{it.title}</h3>
              {it.subtitle ? (
                <p className="text-sm text-foreground/70 mt-1">{it.subtitle}</p>
              ) : null}
            </div>
          </article>
        ))}
      </section>
    </div>
  )
}





