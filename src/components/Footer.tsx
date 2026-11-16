import { Link } from 'react-router-dom';
import { MapPin, ArrowUpRight } from 'lucide-react';
import { TOURNAMENT_INFO } from '../data/tournament';

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/10 bg-[#090909]/94">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-3 md:items-start">
          <div>
            <p className="font-display text-lg font-bold tracking-[0.18em] gold-gradient-text">
              {TOURNAMENT_INFO.title}
            </p>
            <p className="mt-2 text-sm text-[#A1A1A1] max-w-xs leading-relaxed">
              {TOURNAMENT_INFO.discipline}. Official championship portal for draws, rules, schedules, and standings.
            </p>
          </div>

          <div className="text-sm text-[#A1A1A1] space-y-1.5">
            <p className="font-medium text-white tracking-wide">
              {TOURNAMENT_INFO.venueName}
            </p>
            <p className="leading-relaxed">
              Kaloor, Kochi, Kerala, India
            </p>
            <p className="font-mono-data text-xs text-[#D4AF37] pt-1">
              {TOURNAMENT_INFO.dateRange}
            </p>
          </div>

          <div className="flex flex-col gap-3 md:items-end">
            <Link
              to="/fixtures-results"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[#F5D77A] hover:text-white transition-colors"
            >
              <span>Fixtures &amp; Results Dashboard</span>
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <a
              href={TOURNAMENT_INFO.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-[#A1A1A1] hover:text-[#F5D77A] transition-colors"
            >
              <MapPin className="h-4 w-4 text-[#D4AF37]" aria-hidden="true" />
              <span>Venue Directions on Google Maps</span>
            </a>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-white/8 pt-6 text-xs text-[#A1A1A1] sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Crown Tournament · Muthooth Badminton Academy, Kerala</p>
          <p>Men&apos;s Doubles Championship · 28 Nov – 13 Dec 2026</p>
        </div>
      </div>
    </footer>
  );
}
