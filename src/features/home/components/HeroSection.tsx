'use client';

import Button from '@/components/buttons/Button';
import { useEffect, useState } from 'react';

const slides = [
  {
    title: 'Discover.\nGet Discovered.',
    description: 'Discover your next obsession, or become someone else’s.',
    image:
      'https://a-v2.sndcdn.com/assets/images/front-hero-artist-fan-534fb484.jpeg',
  },
  {
    title: 'It all starts with an upload.',
    description: 'From bedrooms to stadiums — define what’s next in music.',
    image:
      'https://a-v2.sndcdn.com/assets/images/front-hero-artist-db39c288.jpeg',
  },
  {
    title: 'Where every music scene lives.',
    description: 'Discover millions of tracks you can’t find anywhere else.',
    image:
      'https://a-v2.sndcdn.com/assets/images/front-hero-fan-7bdd78dc.jpeg',
  },
];

export default function HeroSection() {
  const [current, setCurrent] = useState(0);

  //  Auto slide
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative h-[500px] overflow-hidden rounded-2xl">
      
      {/* Slides wrapper */}
      <div
        className="flex h-full transition-transform duration-700 ease-in-out"
        style={{
          transform: `translateX(-${current * 100}%)`,
          width: `${slides.length * 100}%`,
        }}
      >
        {slides.map((slide, index) => (
          <div key={index} className="w-full h-full relative flex-shrink-0">
            
            {/* Background image */}
            <img
              src={slide.image}
              className="absolute inset-0 w-full h-full object-cover"
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-surface-overlay" />

            {/* Content */}
            <div className="relative z-10 flex flex-col justify-center h-full px-12 text-neutral-0 max-w-2xl">
              <h1 className="text-5xl font-bold whitespace-pre-line mb-4">
                {slide.title}
              </h1>
              <p className="text-lg mb-6">
                {slide.description}
              </p>

              <Button className="px-6 py-2 rounded w-fit" variant='ghost'>
                Get Started
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full ${
              i === current ? 'bg-neutral-0' : 'bg-neutral-500'
            }`}
          />
        ))}
      </div>
    </section>
  );
}