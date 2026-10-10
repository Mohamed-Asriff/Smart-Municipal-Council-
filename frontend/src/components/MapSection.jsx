import React from 'react';
import { MapPin, Phone, Mail, Clock, Navigation } from 'lucide-react';

export default function MapSection({ lang }) {
  // Kalmunai Municipal Council coordinates
  const mapSrc =
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15859.27082506693!2d81.8209!3d7.4082!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae5349b15540e7f%3A0x4ae0a09cc71748!2sKalmunai%2C%20Sri%20Lanka!5e0!3m2!1sen!2slk!4v1700000000000!5m2!1sen!2slk';

  const contactInfo = [
    {
      icon: MapPin,
      label: 'Address',
      value: 'Kalmunai Municipal Council,\nAmparai District, Eastern Province,\nSri Lanka',
    },
    {
      icon: Phone,
      label: 'Hotline',
      value: '+94 67 222 2001',
    },
    {
      icon: Mail,
      label: 'Email',
      value: 'info@kalmunaimc.lk',
    },
    {
      icon: Clock,
      label: 'Office Hours',
      value: 'Mon – Fri: 8:30 AM – 4:30 PM\nSat: 8:30 AM – 1:00 PM',
    },
  ];

  return (
    <section className="bg-zinc-50 py-20 px-4 sm:px-6 lg:px-8 border-t border-zinc-200">
      <div className="max-w-7xl mx-auto">

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-14">
          <span className="text-sm font-extrabold uppercase tracking-widest text-red-600 bg-red-50 px-3.5 py-1.5 rounded-full border border-red-200">
            Find Us
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-zinc-950 tracking-tight">
            Kalmunai Zone Map
          </h2>
          <p className="text-zinc-600 text-lg sm:text-xl font-normal">
            Locate the Kalmunai Municipal Council and get directions to our offices.
          </p>
        </div>

        {/* Map + Info Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 rounded-3xl overflow-hidden shadow-2xl border border-zinc-300">

          {/* Info Panel */}
          <div className="bg-gradient-to-br from-black via-zinc-950 to-red-950 text-white p-10 flex flex-col justify-between lg:col-span-1 border-r border-zinc-800">
            <div>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-950/60">
                  <Navigation className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-red-400 text-xs font-semibold uppercase tracking-widest">Municipal Council</p>
                  <h3 className="text-xl font-extrabold leading-tight">Kalmunai</h3>
                </div>
              </div>

              <div className="space-y-6">
                {contactInfo.map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-start gap-4">
                    <div className="w-9 h-9 bg-zinc-900 border border-zinc-800 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                      <Icon className="w-4 h-4 text-red-500" />
                    </div>
                    <div>
                      <p className="text-red-400 text-xs font-bold uppercase tracking-wider mb-0.5">{label}</p>
                      <p className="text-zinc-200 text-sm font-medium leading-relaxed whitespace-pre-line">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Directions Button */}
            <a
              href="https://maps.google.com/?q=Kalmunai+Municipal+Council+Sri+Lanka"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-10 inline-flex items-center justify-center gap-2 bg-red-600 text-white font-bold text-sm px-6 py-3 rounded-xl hover:bg-red-500 transition-colors shadow-lg shadow-red-950/50"
            >
              <Navigation className="w-4 h-4" />
              Get Directions
            </a>
          </div>

          {/* Google Map Embed */}
          <div className="lg:col-span-2 min-h-[420px]">
            <iframe
              title="Kalmunai Zone Map"
              src={mapSrc}
              width="100%"
              height="100%"
              style={{ minHeight: '420px', border: 0, display: 'block' }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

        </div>
      </div>
    </section>
  );
}
