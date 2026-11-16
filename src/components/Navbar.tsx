import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, ArrowUpRight } from 'lucide-react';

const SECTION_LINKS = [
  { label: 'HOME', target: 'top' },
  { label: 'TOURNAMENT', target: 'tournament' },
  { label: 'CATEGORIES', target: 'categories' },
  { label: 'RULES', target: 'rules' },
] as const;

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isFixturesRoute = location.pathname.startsWith('/fixtures-results');

  const handleSectionNav = (target: string) => {
    setMobileOpen(false);

    const scrollToTarget = () => {
      if (target === 'top') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      const el = document.getElementById(target);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    };

    if (isFixturesRoute) {
      navigate('/');
      window.setTimeout(scrollToTarget, 120);
    } else {
      scrollToTarget();
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-[#090909]/92 border-b border-white/10">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Single-element Wordmark */}
        <Link
          to="/"
          onClick={() => handleSectionNav('top')}
          className="font-display text-base sm:text-lg font-bold tracking-[0.18em] gold-gradient-text whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]"
        >
          CROWN 2026
        </Link>

        {/* Zone 2: Clean single-line navigation links */}
        <nav aria-label="Primary navigation" className="hidden lg:flex items-center gap-7">
          {SECTION_LINKS.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => handleSectionNav(item.target)}
              className={`relative py-1 text-xs font-medium tracking-[0.16em] transition-colors duration-200 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] ${
                !isFixturesRoute && item.target === 'top'
                  ? 'text-[#F5D77A]'
                  : 'text-[#A1A1A1] hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Zone 3: Single Primary Action + Mobile Menu Trigger */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            to="/fixtures-results"
            onClick={() => setMobileOpen(false)}
            className={`inline-flex items-center gap-1.5 rounded-sm px-4 py-2 text-xs font-semibold tracking-[0.12em] transition-all duration-200 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5D77A] ${
              isFixturesRoute
                ? 'bg-[#D4AF37] text-[#090909]'
                : 'border border-[#D4AF37]/60 bg-[#D4AF37]/12 text-[#F5D77A] hover:bg-[#D4AF37] hover:text-[#090909]'
            }`}
          >
            <span>FIXTURES &amp; RESULTS</span>
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>

          <button
            type="button"
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((prev) => !prev)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-sm border border-white/12 text-white lg:hidden hover:border-[#D4AF37]/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileOpen && (
        <div className="border-t border-white/10 bg-[#090909]/96 px-4 py-4 lg:hidden">
          <nav aria-label="Mobile navigation" className="flex flex-col gap-1">
            {SECTION_LINKS.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => handleSectionNav(item.target)}
                className="flex min-h-[44px] w-full items-center justify-between px-3 text-left text-xs font-medium tracking-[0.16em] text-[#E5E5E5] hover:bg-white/5 hover:text-[#F5D77A]"
              >
                <span>{item.label}</span>
              </button>
            ))}
            <Link
              to="/fixtures-results"
              onClick={() => setMobileOpen(false)}
              className="mt-2 flex min-h-[44px] w-full items-center justify-between rounded-sm border border-[#D4AF37]/50 bg-[#D4AF37]/15 px-3 text-xs font-semibold tracking-[0.14em] text-[#F5D77A]"
            >
              <span>FIXTURES &amp; RESULTS</span>
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
