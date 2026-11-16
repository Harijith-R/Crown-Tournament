import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion } from 'framer-motion';
import { ArrowRight, MapPin, ArrowUpRight, ChevronDown } from 'lucide-react';
import {
  TOURNAMENT_INFO,
  TOURNAMENT_STATS,
  TOURNAMENT_TIMELINE,
} from '../data/tournament';
import { CATEGORIES } from '../data/categories';
import { sceneController } from '../scene/animationController';

gsap.registerPlugin(ScrollTrigger);

export function HomePage() {
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    sceneController.setRouteMode('home');

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: pageRef.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.5,
        onUpdate: (self) => {
          sceneController.setScrollProgress(self.progress);
        },
      });
    }, pageRef);

    const refreshTimer = window.setTimeout(() => {
      ScrollTrigger.refresh();
    }, 300);

    // Track scroll position for clean route restoration
    const onScroll = () => {
      sceneController.savedScrollY.home = window.scrollY;
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      window.clearTimeout(refreshTimer);
      window.removeEventListener('scroll', onScroll);
      ctx.revert();
    };
  }, []);

  return (
    <div ref={pageRef} className="relative z-10 w-full overflow-x-hidden">
      {/* A. HERO */}
      <section className="relative flex min-h-screen items-center pt-20 pb-16">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="mb-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium tracking-[0.22em] text-[#F5D77A]">
                <span>{TOURNAMENT_INFO.title}</span>
                <span aria-hidden="true" className="text-[#D4AF37]/50">
                  ·
                </span>
                <span className="text-[#A1A1A1]">MEN&apos;S DOUBLES</span>
              </div>

              <h1 className="font-display text-balance text-4xl font-bold leading-[1.08] tracking-[0.04em] text-white sm:text-5xl lg:text-6xl">
                {TOURNAMENT_INFO.subtitle}
              </h1>

              <p className="mt-6 max-w-xl text-base leading-relaxed text-[#D0D0D0] sm:text-lg">
                {TOURNAMENT_INFO.heroIntro}
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-x-4 gap-y-2 border-y border-white/10 py-3.5 text-xs tracking-[0.15em] text-[#E5E5E5] sm:text-sm">
                <span className="font-semibold text-[#F5D77A]">
                  {TOURNAMENT_INFO.venueName}
                </span>
                <span aria-hidden="true" className="text-[#D4AF37]/50">
                  ·
                </span>
                <span className="font-mono-data text-white">
                  {TOURNAMENT_INFO.dateRange}
                </span>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  to="/fixtures-results"
                  className="inline-flex min-h-[46px] items-center gap-2.5 rounded-sm bg-[#D4AF37] px-6 py-3 text-xs font-bold tracking-[0.14em] text-[#090909] transition-colors duration-200 hover:bg-[#F5D77A] whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5D77A]"
                >
                  <span>FIXTURES &amp; RESULTS</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>

                <button
                  type="button"
                  onClick={() =>
                    document
                      .getElementById('tournament')
                      ?.scrollIntoView({ behavior: 'smooth' })
                  }
                  className="inline-flex min-h-[46px] items-center gap-2 rounded-sm border border-white/20 bg-[#151515]/85 px-5 py-3 text-xs font-medium tracking-[0.14em] text-white transition-colors duration-200 hover:border-[#D4AF37]/70 hover:text-[#F5D77A] whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <span>EXPLORE CHAMPIONSHIP</span>
                  <ChevronDown className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* B. TOURNAMENT INTRODUCTION */}
      <section
        id="tournament"
        className="scroll-mt-20 border-t border-white/10 py-24 sm:py-28"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-7">
              <p className="text-xs font-medium tracking-[0.22em] text-[#D4AF37]">
                01. THE CHAMPIONSHIP
              </p>
              <h2 className="mt-3 font-display text-balance text-3xl font-bold leading-tight tracking-[0.04em] text-white sm:text-4xl lg:text-5xl">
                MORE THAN A GAME. A BATTLE FOR GLORY.
              </h2>
            </div>
            <div className="lg:col-span-5">
              <p className="text-base leading-relaxed text-[#A1A1A1]">
                Crown Tournament 2026 is an exclusive men&apos;s doubles badminton championship featuring three competitive categories — Blue, Orange and Yellow. Built on skill, strategy and sportsmanship, the tournament brings the academy community together for an unforgettable battle towards the crown.
              </p>
            </div>
          </div>

          {/* 4-column stat strip */}
          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {TOURNAMENT_STATS.map((stat) => (
              <div
                key={stat.label}
                className="surface-panel rounded-sm p-6 transition-colors duration-200 hover:border-[#D4AF37]/45"
              >
                <p className="text-xs tracking-[0.16em] text-[#A1A1A1]">
                  {stat.label}
                </p>
                <p className="mt-3 font-display text-2xl font-bold tracking-wide text-[#F5D77A] sm:text-3xl font-mono-data">
                  {stat.value}
                </p>
                <p className="mt-2 text-sm text-[#A1A1A1] leading-relaxed">
                  {stat.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* C. CATEGORIES */}
      <section
        id="categories"
        className="scroll-mt-20 border-t border-white/10 py-24 sm:py-28"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-medium tracking-[0.22em] text-[#D4AF37]">
              02. COMPETITIVE TIERS
            </p>
            <h2 className="mt-3 font-display text-balance text-3xl font-bold tracking-[0.04em] text-white sm:text-4xl">
              THREE CATEGORIES. ONE CROWN.
            </h2>
            <p className="mt-4 text-base text-[#A1A1A1] leading-relaxed">
              Every category follows round-robin group competition before advancing its top qualifiers into single-elimination knockouts.
            </p>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {CATEGORIES.map((category) => (
              <div
                key={category.id}
                className={`surface-panel flex flex-col justify-between rounded-sm p-7 transition-colors duration-200 hover:border-[#D4AF37]/50 ${category.borderClass}`}
              >
                <div>
                  <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
                    <h3 className="font-display text-2xl font-bold tracking-[0.1em] text-white">
                      {category.name}
                    </h3>
                    <span className={`font-mono-data text-xs font-semibold tracking-[0.15em] ${category.textClass}`}>
                      {category.totalPairs} PAIRS
                    </span>
                  </div>

                  <p className="mt-5 text-sm leading-relaxed text-[#A1A1A1]">
                    {category.description}
                  </p>

                  <dl className="mt-6 space-y-3 border-t border-white/8 pt-5 text-sm">
                    <div className="flex items-baseline justify-between gap-4">
                      <dt className="text-[#A1A1A1]">Draw Size</dt>
                      <dd className="font-mono-data font-medium text-white">
                        {category.totalPairs} pairs
                      </dd>
                    </div>
                    <div className="flex items-baseline justify-between gap-4">
                      <dt className="text-[#A1A1A1]">Group Format</dt>
                      <dd className="text-right font-medium text-white">
                        {category.groupDistribution}
                      </dd>
                    </div>
                    <div className="pt-1">
                      <dt className="text-xs tracking-[0.14em] text-[#D4AF37]">
                        QUALIFICATION PATH
                      </dt>
                      <dd className="mt-1 text-sm font-medium text-[#F5D77A]">
                        {category.qualificationRule}
                      </dd>
                    </div>
                  </dl>
                </div>

                <div className="mt-8 pt-4 border-t border-white/8">
                  <Link
                    to={`/fixtures-results?category=${category.id}`}
                    className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.14em] text-[#F5D77A] hover:text-white transition-colors"
                  >
                    <span>VIEW {category.name} DRAW &amp; STANDINGS</span>
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* D. MATCH RULES */}
      <section
        id="rules"
        className="scroll-mt-20 border-t border-white/10 py-24 sm:py-28"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-6">
              <p className="text-xs font-medium tracking-[0.22em] text-[#D4AF37]">
                03. OFFICIAL REGULATIONS
              </p>
              <h2 className="mt-3 font-display text-balance text-3xl font-bold tracking-[0.04em] text-white sm:text-4xl">
                MATCH FORMAT &amp; SCORING RULES
              </h2>
              <p className="mt-4 text-base text-[#A1A1A1] leading-relaxed">
                Designed for relentless momentum—every fixture is decided in a single high-pressure 30-point rally game.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {TOURNAMENT_INFO.rulesSummary.map((rule) => (
                  <div
                    key={rule.label}
                    className="surface-panel rounded-sm px-5 py-4"
                  >
                    <p className="text-xs tracking-[0.15em] text-[#A1A1A1]">
                      {rule.label}
                    </p>
                    <p className="mt-1.5 text-base font-semibold text-white">
                      {rule.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="surface-panel-gold h-full rounded-sm p-7 sm:p-9">
                <p className="text-xs font-semibold tracking-[0.2em] text-[#F5D77A]">
                  GROUP STANDINGS TIE-BREAKERS
                </p>
                <h3 className="mt-2 font-display text-2xl font-bold text-white">
                  THREE-TIER RESOLUTION ORDER
                </h3>
                <p className="mt-3 text-sm text-[#A1A1A1] leading-relaxed">
                  When two or more pairs finish level on table points inside a group, qualification rankings are resolved strictly in the following order:
                </p>

                <ol className="mt-7 space-y-5">
                  {TOURNAMENT_INFO.tieBreakers.map((tb) => (
                    <li
                      key={tb.rank}
                      className="flex items-start gap-4 border-t border-[#D4AF37]/20 pt-5 first:border-t-0 first:pt-0"
                    >
                      <span className="font-mono-data flex h-8 w-8 shrink-0 items-center justify-center rounded-sm border border-[#D4AF37]/50 bg-[#D4AF37]/10 text-sm font-bold text-[#F5D77A]">
                        {tb.rank}
                      </span>
                      <div>
                        <p className="text-base font-semibold text-white">
                          {tb.title}
                        </p>
                        <p className="mt-1 text-sm text-[#A1A1A1] leading-relaxed">
                          {tb.description}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* E. TOURNAMENT JOURNEY */}
      <section className="border-t border-white/10 py-24 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-medium tracking-[0.22em] text-[#D4AF37]">
              04. QUALIFICATION PATHWAY
            </p>
            <h2 className="mt-3 font-display text-balance text-3xl font-bold tracking-[0.04em] text-white sm:text-4xl">
              THE CHAMPIONSHIP JOURNEY
            </h2>
          </div>

          {/* 4-Stage Horizontal Pathway */}
          <div className="mt-12 grid gap-4 md:grid-cols-4">
            {[
              {
                step: 'STAGE 01',
                title: 'GROUP STAGE',
                detail: 'Round-robin battles across Blue, Orange, and Yellow pools (28 Nov – 10 Dec).',
              },
              {
                step: 'STAGE 02',
                title: 'KNOCKOUTS',
                detail: 'Top 2 from every group advance—Quarter-finals for Orange, Semifinals for Blue & Yellow.',
              },
              {
                step: 'STAGE 03',
                title: 'FINALS',
                detail: 'Category championship deciders under prime evening lights on 13 December 2026.',
              },
              {
                step: 'STAGE 04',
                title: 'CHAMPIONS',
                detail: 'Coronation of the 2026 Crown Tournament Men’s Doubles titleholders.',
              },
            ].map((stage) => (
              <div key={stage.title} className="surface-panel rounded-sm p-6">
                <p className="font-mono-data text-xs tracking-[0.18em] text-[#D4AF37]">
                  {stage.step}
                </p>
                <h3 className="mt-3 font-display text-xl font-bold tracking-wider text-white">
                  {stage.title}
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-[#A1A1A1]">
                  {stage.detail}
                </p>
              </div>
            ))}
          </div>

          {/* Category-by-category visual qualification matrix */}
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            <div className="surface-panel-gold rounded-sm p-6">
              <p className="text-xs font-semibold tracking-[0.16em] text-blue-400">
                BLUE CATEGORY PATH
              </p>
              <p className="mt-2 font-mono-data text-sm text-white">
                2 Groups (4 each) → Top 2/Group (4) → Semifinals → Final
              </p>
            </div>
            <div className="surface-panel-gold rounded-sm p-6">
              <p className="text-xs font-semibold tracking-[0.16em] text-orange-400">
                ORANGE CATEGORY PATH
              </p>
              <p className="mt-2 font-mono-data text-sm text-white">
                4 Groups (5, 5, 4, 4) → Top 2/Group (8) → Quarter-finals → Semifinals → Final
              </p>
            </div>
            <div className="surface-panel-gold rounded-sm p-6">
              <p className="text-xs font-semibold tracking-[0.16em] text-yellow-300">
                YELLOW CATEGORY PATH
              </p>
              <p className="mt-2 font-mono-data text-sm text-white">
                2 Groups (5 each) → Top 2/Group (4) → Semifinals → Final
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* F. TOURNAMENT TIMELINE */}
      <section className="border-t border-white/10 py-24 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-medium tracking-[0.22em] text-[#D4AF37]">
              05. CHAMPIONSHIP CALENDAR
            </p>
            <h2 className="mt-3 font-display text-balance text-3xl font-bold tracking-[0.04em] text-white sm:text-4xl">
              TOURNAMENT TIMELINE
            </h2>
          </div>

          <div className="mt-12 divide-y divide-white/10 border-y border-white/10">
            {TOURNAMENT_TIMELINE.map((milestone) => (
              <div
                key={milestone.date}
                className="grid gap-3 py-5 sm:grid-cols-12 sm:items-center sm:gap-6"
              >
                <div className="sm:col-span-4 lg:col-span-3">
                  <span className="font-mono-data text-sm font-semibold text-[#F5D77A]">
                    {milestone.date}
                  </span>
                </div>
                <div className="sm:col-span-4 lg:col-span-4">
                  <h3 className="text-base font-semibold text-white">
                    {milestone.title}
                  </h3>
                </div>
                <div className="sm:col-span-4 lg:col-span-5">
                  <p className="text-sm text-[#A1A1A1] leading-relaxed">
                    {milestone.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* G. TOURNAMENT FORMAT & TRANSPARENCY */}
      <section className="border-t border-white/10 py-24 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-medium tracking-[0.22em] text-[#D4AF37]">
              06. DRAW INTEGRITY
            </p>
            <h2 className="mt-3 font-display text-balance text-3xl font-bold tracking-[0.04em] text-white sm:text-4xl">
              TWO-STAGE LOTS &amp; COMPLETE TRANSPARENCY
            </h2>
            <p className="mt-4 text-base text-[#A1A1A1] leading-relaxed">
              Every partnership and group placement is governed by an auditable two-stage lots process built to eliminate seeding bias. Proxy positions and match orders are locked publicly before the draw takes place.
            </p>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {TOURNAMENT_INFO.lotteryStages.map((item) => (
              <div key={item.stage} className="surface-panel rounded-sm p-7">
                <p className="font-mono-data text-xs font-semibold tracking-[0.2em] text-[#D4AF37]">
                  STAGE {item.stage}
                </p>
                <h3 className="mt-3 font-display text-xl font-bold text-white">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-[#A1A1A1]">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* H. VENUE */}
      <section className="border-t border-white/10 py-24 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="surface-panel-gold rounded-sm p-8 sm:p-12">
            <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
              <div className="lg:col-span-7">
                <p className="text-xs font-medium tracking-[0.22em] text-[#D4AF37]">
                  07. CHAMPIONSHIP ARENA
                </p>
                <h2 className="mt-3 font-display text-balance text-3xl font-bold tracking-[0.04em] text-white sm:text-4xl">
                  {TOURNAMENT_INFO.venueName}
                </h2>
                <p className="mt-4 text-base text-[#D0D0D0] leading-relaxed">
                  {TOURNAMENT_INFO.venueAddress}
                </p>

                <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs tracking-[0.1em] text-[#A1A1A1]">
                  {TOURNAMENT_INFO.venueHighlights.map((highlight, idx) => (
                    <span key={highlight} className="flex items-center gap-4">
                      {idx > 0 && (
                        <span aria-hidden="true" className="text-[#D4AF37]/50">
                          ·
                        </span>
                      )}
                      <span className="text-[#E5E5E5]">{highlight}</span>
                    </span>
                  ))}
                </div>

                <div className="mt-8">
                  <a
                    href={TOURNAMENT_INFO.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-[46px] items-center gap-2.5 rounded-sm bg-[#D4AF37] px-6 py-3 text-xs font-bold tracking-[0.14em] text-[#090909] transition-colors duration-200 hover:bg-[#F5D77A]"
                  >
                    <MapPin className="h-4 w-4" aria-hidden="true" />
                    <span>OPEN IN GOOGLE MAPS</span>
                    <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                  </a>
                </div>
              </div>

              {/* Minimalist badminton court architectural line-art */}
              <div className="lg:col-span-5">
                <div className="rounded-sm border border-[#D4AF37]/25 bg-[#090909]/80 p-6">
                  <svg
                    viewBox="0 0 340 190"
                    className="w-full h-auto"
                    aria-label="Championship Doubles Court Layout"
                  >
                    {/* Outer Doubles Boundary */}
                    <rect
                      x="20"
                      y="15"
                      width="300"
                      height="160"
                      fill="rgba(212,175,55,0.03)"
                      stroke="#D4AF37"
                      strokeWidth="1.5"
                    />
                    {/* Singles Sidelines */}
                    <line x1="20" y1="29" x2="320" y2="29" stroke="#D4AF37" strokeOpacity="0.45" strokeWidth="1" />
                    <line x1="20" y1="161" x2="320" y2="161" stroke="#D4AF37" strokeOpacity="0.45" strokeWidth="1" />
                    {/* Doubles Back Service Lines */}
                    <line x1="40" y1="15" x2="40" y2="175" stroke="#D4AF37" strokeOpacity="0.45" strokeWidth="1" />
                    <line x1="300" y1="15" x2="300" y2="175" stroke="#D4AF37" strokeOpacity="0.45" strokeWidth="1" />
                    {/* Short Service Lines */}
                    <line x1="126" y1="15" x2="126" y2="175" stroke="#D4AF37" strokeOpacity="0.65" strokeWidth="1.2" />
                    <line x1="214" y1="15" x2="214" y2="175" stroke="#D4AF37" strokeOpacity="0.65" strokeWidth="1.2" />
                    {/* Center Line */}
                    <line x1="20" y1="95" x2="126" y2="95" stroke="#D4AF37" strokeOpacity="0.55" strokeWidth="1" />
                    <line x1="214" y1="95" x2="320" y2="95" stroke="#D4AF37" strokeOpacity="0.55" strokeWidth="1" />
                    {/* Net Line */}
                    <line
                      x1="170"
                      y1="8"
                      x2="170"
                      y2="182"
                      stroke="#F5D77A"
                      strokeWidth="2.2"
                      strokeDasharray="4 3"
                    />
                  </svg>
                  <div className="mt-4 flex items-center justify-between text-xs text-[#A1A1A1]">
                    <span>KALOOR · KOCHI · KERALA</span>
                    <span className="font-mono-data text-[#F5D77A]">COURTS 1–5</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* I. FINAL SECTION — THE CROWN AWAITS */}
      <section className="relative flex min-h-[82vh] items-center justify-center border-t border-white/10 py-28 text-center">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-sm bg-[#090909]/60 px-6 py-10 sm:px-10">
            <p className="text-xs font-medium tracking-[0.26em] text-[#D4AF37]">
              28 NOVEMBER – 13 DECEMBER 2026
            </p>
            <h2 className="mt-4 font-display text-balance text-4xl font-bold tracking-[0.06em] text-white sm:text-5xl lg:text-6xl">
              THE CROWN AWAITS.
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-[#D0D0D0]">
              Follow every group fixture, live scoreline, tie-breaker calculation, and knockout path as pairs battle toward the 13 December finals.
            </p>
            <div className="mt-9 flex justify-center">
              <Link
                to="/fixtures-results"
                className="inline-flex min-h-[48px] items-center gap-2.5 rounded-sm bg-[#D4AF37] px-8 py-3.5 text-xs font-bold tracking-[0.16em] text-[#090909] transition-colors duration-200 hover:bg-[#F5D77A]"
              >
                <span>FIXTURES &amp; RESULTS</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
