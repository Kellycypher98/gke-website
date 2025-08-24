'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type Slide = {
  id: number
  heading: string
  subheading: string
}

const SLIDE_CHANGE_MS = 4500

export default function AfroSplashHero() {
  const slides: Slide[] = useMemo(
    () => [
      { id: 1, heading: 'Afro Splash', subheading: 'Vibrant rhythms. Bold culture.' },
      { id: 2, heading: 'Experience the Night', subheading: 'Music • Fashion • Art • Community' },
      { id: 3, heading: 'Celebrate Together', subheading: 'Energy, color and connection' },
    ],
    []
  )

  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length)
    }, SLIDE_CHANGE_MS)
    return () => clearInterval(timer)
  }, [slides.length])

  const goPrev = () => setActiveIndex((prev) => (prev - 1 + slides.length) % slides.length)
  const goNext = () => setActiveIndex((prev) => (prev + 1) % slides.length)

  return (
    <section className="relative overflow-hidden">
      <div className="relative h-[55vh] min-h-[360px] w-full rounded-none sm:rounded-2xl bg-dark-800 border border-dark-700">
        {/* Placeholder carousel area (replace with real images later) */}
        <div className="absolute inset-0">
          <AnimatePresence mode="wait">
            {slides.map((slide, index) =>
              index === activeIndex ? (
                <motion.div
                  key={slide.id}
                  initial={{ opacity: 0, scale: 1.02 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.6 }}
                  className="absolute inset-0"
                >
                  <div
                    className="h-full w-full flex items-center justify-center text-center px-6"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 via-secondary-500/20 to-royal-500/20" />
                    <div className="absolute inset-0 african-pattern-bg opacity-10" />
                    <div className="relative z-10 max-w-4xl mx-auto">
                      <h1 className="text-4xl md:text-6xl font-heading font-bold text-gradient drop-shadow-lg">
                        {slide.heading}
                      </h1>
                      <p className="mt-4 text-lg md:text-2xl text-foreground/90">
                        {slide.subheading}
                      </p>
                      <p className="mt-6 text-sm text-foreground/70">
                        Hero image carousel placeholder — add event images later.
                      </p>
                    </div>
                  </div>
                </motion.div>
              ) : null
            )}
          </AnimatePresence>
        </div>

        {/* Controls */}
        <div className="absolute inset-x-0 bottom-4 flex items-center justify-center gap-3 z-20">
          <button
            aria-label="Previous slide"
            onClick={goPrev}
            className="px-3 py-1.5 rounded-full bg-dark-900/70 hover:bg-dark-900 text-foreground text-sm border border-border"
          >
            Prev
          </button>
          <div className="flex items-center gap-2">
            {slides.map((_, i) => (
              <span
                key={i}
                className={
                  'h-2 w-2 rounded-full transition-colors ' +
                  (i === activeIndex ? 'bg-primary-500' : 'bg-foreground/30')
                }
              />
            ))}
          </div>
          <button
            aria-label="Next slide"
            onClick={goNext}
            className="px-3 py-1.5 rounded-full bg-dark-900/70 hover:bg-dark-900 text-foreground text-sm border border-border"
          >
            Next
          </button>
        </div>
      </div>
    </section>
  )
}





