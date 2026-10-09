import { useState, useEffect, useCallback } from 'react';
import { Activity, Users, Clock, Award, ChevronLeft, ChevronRight } from 'lucide-react';
import { translations } from '../data/translations';

const slides = [
  {
    image: '/kmc_building_clear.jpg',
    label: 'KMC Headquarters',
    caption: 'Kalmunai Municipal Council — Headquarters Building',
  },
  {
    image: '/slide_kalmunai_mosque.png',
    label: 'Kalmunai Mosque',
    caption: 'Kalmunai — Coastal Town with the Grand Mosque by the Sea',
  },
  {
    image: '/slide_kalmunai.jpg',
    label: 'Kalmunai City',
    caption: 'Kalmunai — Pearl of the Eastern Province',
  },
  {
    image: '/slide_islamic.jpg',
    label: 'Islamic Events',
    caption: 'Eid Coastal Gathering & Community Prayers — Kalmunai Beach',
  },
  {
    image: '/slide_president.jpg?v=2',
    label: 'Presidential Events',
    caption: 'President Dissanayake meets All Ceylon Jamiyyathul Ulama — Presidential Secretariat, 2026',
  },
  {
    image: '/slide_beach.jpg',
    label: 'Eastern Coast',
    caption: 'Eastern Province Coastline — Nature\'s Finest Shore',
  },
  {
    image: '/slide_harvest.jpg',
    label: 'Thai Pongal',
    caption: 'Thai Pongal — Harvest Festival of the Eastern Community',
  },
];

const SLIDE_INTERVAL = 5000;

export default function Hero({ lang }) {
  const t = translations[lang];
  const h = t.hero;
  const s = t.stats;

  const [current, setCurrent] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const goTo = useCallback((idx) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrent(idx);
      setIsTransitioning(false);
    }, 300);
  }, [isTransitioning]);

  const next = useCallback(() => goTo((current + 1) % slides.length), [current, goTo]);
  const prev = useCallback(() => goTo((current - 1 + slides.length) % slides.length), [current, goTo]);

  useEffect(() => {
    const timer = setInterval(next, SLIDE_INTERVAL);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <section className="relative overflow-hidden bg-[#09090b] text-white py-16 lg:py-24">

      {/* Slideshow Background */}
      {slides.map((slide, idx) => (
        <img
          key={slide.image}
          src={slide.image}
          alt={slide.label}
          className={`absolute inset-0 w-full h-full object-cover object-center pointer-events-none transition-opacity duration-1000 ${
            idx === current ? (isTransitioning ? 'opacity-0' : 'opacity-85') : 'opacity-0'
          }`}
          loading="eager"
        />
      ))}

      {/* Gradient overlays - adjusted for black & red aesthetic */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/60 via-40% to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent via-40% to-red-950/20 pointer-events-none" />

      {/* Slide Caption Badge */}
      <div className="absolute top-5 right-5 z-10">
        <span className="bg-black/70 backdrop-blur-md text-white text-xs font-semibold px-4 py-1.5 rounded-full border border-red-500/40 tracking-wide shadow-lg">
          📍 {slides[current].caption}
        </span>
      </div>

      {/* Prev / Next Arrows */}
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-black/60 hover:bg-red-600 backdrop-blur-md rounded-full border border-white/20 flex items-center justify-center transition-all shadow-lg"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-5 h-5 text-white" />
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-black/60 hover:bg-red-600 backdrop-blur-md rounded-full border border-white/20 flex items-center justify-center transition-all shadow-lg"
        aria-label="Next slide"
      >
        <ChevronRight className="w-5 h-5 text-white" />
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2">
        {slides.map((slide, idx) => (
          <button
            key={slide.label}
            onClick={() => goTo(idx)}
            aria-label={`Go to slide ${idx + 1}`}
            className={`transition-all duration-300 rounded-full ${idx === current
              ? 'w-8 h-2.5 bg-red-600 shadow-md shadow-red-600/50'
              : 'w-2.5 h-2.5 bg-white/40 hover:bg-white/70'
              }`}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Left Column: Text Content */}
        <div className="lg:col-span-12 space-y-8 text-center lg:text-left max-w-3xl">

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-tight">
            {h.titlePrefix} <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-red-500 via-red-400 to-white bg-clip-text text-transparent">
              {h.titleHighlight}
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-zinc-200 text-lg sm:text-xl lg:text-2xl leading-relaxed max-w-3xl mx-auto lg:mx-0 font-medium drop-shadow-sm">
            {h.subTitle}
          </p>

        </div>

        {/* Live Statistics Grid */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-black/75 backdrop-blur-md border border-zinc-800 hover:border-red-600/60 rounded-2xl p-6 text-center transition-all duration-300 shadow-xl group">
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-red-600/20 text-red-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Award className="w-6 h-6" />
            </div>
            <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-white">{s.resolutionRate}</div>
            <div className="text-sm sm:text-base text-zinc-300 font-semibold mt-2">{s.resolutionLabel}</div>
          </div>

          <div className="bg-black/75 backdrop-blur-md border border-zinc-800 hover:border-red-600/60 rounded-2xl p-6 text-center transition-all duration-300 shadow-xl group">
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-red-600/20 text-red-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Activity className="w-6 h-6" />
            </div>
            <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-white">{s.activeSensors}</div>
            <div className="text-sm sm:text-base text-zinc-300 font-semibold mt-2">{s.activeSensorsLabel}</div>
          </div>

          <div className="bg-black/75 backdrop-blur-md border border-zinc-800 hover:border-red-600/60 rounded-2xl p-6 text-center transition-all duration-300 shadow-xl group">
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-red-600/20 text-red-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Clock className="w-6 h-6" />
            </div>
            <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-white">{s.avgResponse}</div>
            <div className="text-sm sm:text-base text-zinc-300 font-semibold mt-2">{s.avgResponseLabel}</div>
          </div>

          <div className="bg-black/75 backdrop-blur-md border border-zinc-800 hover:border-red-600/60 rounded-2xl p-6 text-center transition-all duration-300 shadow-xl group">
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-red-600/20 text-red-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6" />
            </div>
            <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-white">{s.citizensServed}</div>
            <div className="text-sm sm:text-base text-zinc-300 font-semibold mt-2">{s.citizensServedLabel}</div>
          </div>
        </div>

      </div>
    </section>
  );
}
