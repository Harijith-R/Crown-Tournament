import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Eye, Trophy, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { CATEGORIES, CATEGORY_MAP } from '../data/categories';
import { OFFICIAL_PAIRS, DEMO_PAIRS } from '../data/pairs';
import { OFFICIAL_GROUPS, DEMO_GROUPS } from '../data/groups';
import { OFFICIAL_FIXTURES, DEMO_FIXTURES } from '../data/fixtures';
import { OFFICIAL_RESULTS, DEMO_RESULTS } from '../data/results';
import { OFFICIAL_FIXTURES_PUBLISHED } from '../data/tournament';
import {
  calculateGroupStandings,
  calculateMatchStatistics,
  determineMatchWinner,
  generateKnockoutParticipants,
} from '../engine/standings';
import type { CategoryId, GroupId, MatchStatus } from '../types/tournament';
import { sceneController } from '../scene/animationController';

type DashboardSection = 'fixtures' | 'standings' | 'brackets' | 'results';

const STATUS_STYLES: Record<MatchStatus, { label: string; className: string }> = {
  upcoming: {
    label: 'Upcoming',
    className: 'text-[#D0D0D0] border-white/15 bg-white/5',
  },
  live: {
    label: 'Live',
    className: 'text-[#F5D77A] border-[#D4AF37]/60 bg-[#D4AF37]/15',
  },
  completed: {
    label: 'Completed',
    className: 'text-emerald-300 border-emerald-500/40 bg-emerald-500/10',
  },
  postponed: {
    label: 'Postponed',
    className: 'text-amber-300 border-amber-500/40 bg-amber-500/10',
  },
};

export function FixturesResultsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCatParam = searchParams.get('category') as CategoryId | null;
  const validInitialCat: CategoryId =
    initialCatParam && (initialCatParam === 'blue' || initialCatParam === 'orange' || initialCatParam === 'yellow')
      ? initialCatParam
      : 'blue';

  const [selectedCategory, setSelectedCategory] = useState<CategoryId>(validInitialCat);
  const [selectedGroup, setSelectedGroup] = useState<'ALL' | GroupId>('ALL');
  const [standingsGroup, setStandingsGroup] = useState<GroupId>('A');
  const [statusFilter, setStatusFilter] = useState<'all' | MatchStatus>('all');
  const [activeView, setActiveView] = useState<DashboardSection>('fixtures');
  const [demoMode, setDemoMode] = useState(false);

  useEffect(() => {
    sceneController.setRouteMode('fixtures');
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, []);

  useEffect(() => {
    const paramCat = searchParams.get('category') as CategoryId | null;
    if (paramCat && (paramCat === 'blue' || paramCat === 'orange' || paramCat === 'yellow')) {
      setSelectedCategory(paramCat);
    }
  }, [searchParams]);

  const categoryConfig = CATEGORY_MAP[selectedCategory];

  // Ensure group selection stays valid when switching between Orange (A-D) and Blue/Yellow (A-B)
  useEffect(() => {
    if (selectedGroup !== 'ALL' && !categoryConfig.groups.includes(selectedGroup)) {
      setSelectedGroup('ALL');
    }
    if (!categoryConfig.groups.includes(standingsGroup)) {
      setStandingsGroup(categoryConfig.groups[0]);
    }
  }, [categoryConfig, selectedGroup, standingsGroup]);

  const handleCategoryChange = (catId: CategoryId) => {
    setSelectedCategory(catId);
    setSearchParams({ category: catId }, { replace: true });
  };

  const usingDemoData = !OFFICIAL_FIXTURES_PUBLISHED && demoMode;
  const hasMatchData = OFFICIAL_FIXTURES_PUBLISHED || usingDemoData;

  const activePairs = usingDemoData ? DEMO_PAIRS : OFFICIAL_PAIRS;
  const activeGroups = usingDemoData ? DEMO_GROUPS : OFFICIAL_GROUPS;
  const activeFixtures = usingDemoData ? DEMO_FIXTURES : OFFICIAL_FIXTURES;
  const activeResults = usingDemoData ? DEMO_RESULTS : OFFICIAL_RESULTS;

  const pairMap = useMemo(
    () => new Map(activePairs.map((p) => [p.id, p])),
    [activePairs]
  );

  const resultMap = useMemo(
    () => new Map(activeResults.map((r) => [r.fixtureId, r])),
    [activeResults]
  );

  const categoryFixtures = useMemo(
    () =>
      activeFixtures.filter(
        (f) =>
          f.categoryId === selectedCategory &&
          (selectedGroup === 'ALL' || f.groupId === selectedGroup)
      ),
    [activeFixtures, selectedCategory, selectedGroup]
  );

  const filteredFixtures = useMemo(
    () =>
      categoryFixtures.filter(
        (f) => statusFilter === 'all' || f.status === statusFilter
      ),
    [categoryFixtures, statusFilter]
  );

  const completedResultsFixtures = useMemo(
    () => categoryFixtures.filter((f) => f.status === 'completed'),
    [categoryFixtures]
  );

  const categoryStats = useMemo(
    () =>
      calculateMatchStatistics(
        activeFixtures.filter((f) => f.categoryId === selectedCategory),
        activeResults
      ),
    [activeFixtures, activeResults, selectedCategory]
  );

  const currentGroupStandings = useMemo(
    () =>
      calculateGroupStandings(
        selectedCategory,
        standingsGroup,
        activePairs,
        activeFixtures,
        activeResults,
        categoryConfig.qualifiersPerGroup
      ),
    [
      selectedCategory,
      standingsGroup,
      activePairs,
      activeFixtures,
      activeResults,
      categoryConfig.qualifiersPerGroup,
    ]
  );

  const knockoutBracket = useMemo(
    () =>
      generateKnockoutParticipants(
        categoryConfig,
        activePairs,
        activeFixtures,
        activeResults,
        hasMatchData
      ),
    [categoryConfig, activePairs, activeFixtures, activeResults, hasMatchData]
  );

  const currentGroupMeta = activeGroups.find(
    (g) => g.categoryId === selectedCategory && g.groupId === standingsGroup
  );

  return (
    <div className="relative z-10 min-h-screen pt-24 pb-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="border-b border-white/10 pb-8"
        >
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-medium tracking-[0.16em] text-[#A1A1A1] hover:text-[#F5D77A] transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            <span>BACK TO CHAMPIONSHIP HOME</span>
          </Link>

          <div className="mt-5 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-medium tracking-[0.22em] text-[#D4AF37]">
                CROWN TOURNAMENT 2026
              </p>
              <h1 className="mt-2 font-display text-3xl font-bold tracking-[0.05em] text-white sm:text-4xl lg:text-5xl">
                FIXTURES &amp; RESULTS
              </h1>
              <p className="mt-2 text-base text-[#A1A1A1]">
                Every Match Counts. Every Point Matters.
              </p>
            </div>

            {/* Official vs Demo Preview Toggle */}
            {!OFFICIAL_FIXTURES_PUBLISHED && (
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setDemoMode((prev) => !prev)}
                  className={`inline-flex min-h-[42px] items-center gap-2 rounded-sm border px-4 py-2 text-xs font-semibold tracking-[0.12em] transition-colors duration-200 cursor-pointer whitespace-nowrap shrink-0 ${
                    demoMode
                      ? 'border-[#D4AF37] bg-[#D4AF37] text-[#090909]'
                      : 'border-[#D4AF37]/50 bg-[#D4AF37]/10 text-[#F5D77A] hover:bg-[#D4AF37]/20'
                  }`}
                >
                  <Eye className="h-4 w-4" aria-hidden="true" />
                  <span>{demoMode ? 'EXIT DEMO PREVIEW' : 'PREVIEW DEMO DATA'}</span>
                </button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Official Pre-Publication Banner OR Demo Disclaimer */}
        {!hasMatchData ? (
          <div className="mt-8 surface-panel-gold rounded-sm p-6 sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-4">
                <Calendar className="h-6 w-6 shrink-0 text-[#F5D77A] mt-0.5" aria-hidden="true" />
                <div>
                  <h2 className="font-display text-lg font-bold tracking-[0.08em] text-[#F5D77A] sm:text-xl">
                    OFFICIAL FIXTURES WILL BE PUBLISHED SOON.
                  </h2>
                  <p className="mt-1.5 text-sm text-[#D0D0D0] leading-relaxed max-w-2xl">
                    Doubles pairings and group positions will be locked during the two-stage lots on 18 November 2026 ahead of opening play on 28 November 2026. You may inspect category group structures and knockout brackets below, or toggle Demo Preview to test live standings calculations.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDemoMode(true)}
                className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-sm border border-[#D4AF37]/60 bg-[#151515] px-4 py-2 text-xs font-semibold tracking-[0.12em] text-[#F5D77A] hover:bg-[#D4AF37] hover:text-[#090909] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span>LOAD DEMO PREVIEW</span>
              </button>
            </div>
          </div>
        ) : usingDemoData ? (
          <div className="mt-8 rounded-sm border border-amber-500/45 bg-amber-950/35 px-5 py-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <ShieldAlert className="h-5 w-5 shrink-0 text-amber-300" aria-hidden="true" />
                <p className="text-xs font-semibold tracking-[0.12em] text-amber-200 sm:text-sm">
                  DEMONSTRATION DATA ACTIVE — SAMPLE PAIRS &amp; SCORES FOR STANDINGS PREVIEW ONLY. OFFICIAL FIXTURES WILL BE PUBLISHED SOON.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDemoMode(false)}
                className="text-xs font-semibold tracking-[0.12em] text-amber-300 underline hover:text-white self-start sm:self-center cursor-pointer whitespace-nowrap shrink-0"
              >
                Return to Official Mode
              </button>
            </div>
          </div>
        ) : null}

        {/* A. Category Selection Tabs */}
        <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div
            role="tablist"
            aria-label="Tournament Categories"
            className="inline-flex flex-wrap gap-2 rounded-sm border border-white/10 bg-[#151515]/90 p-1.5"
          >
            {CATEGORIES.map((cat) => {
              const active = cat.id === selectedCategory;
              return (
                <button
                  key={cat.id}
                  role="tab"
                  aria-selected={active}
                  type="button"
                  onClick={() => handleCategoryChange(cat.id)}
                  className={`flex min-h-[40px] items-center gap-2 rounded-sm px-4 py-2 text-xs font-semibold tracking-[0.14em] transition-all duration-200 cursor-pointer whitespace-nowrap shrink-0 ${
                    active
                      ? 'bg-[#D4AF37] text-[#090909]'
                      : 'text-[#A1A1A1] hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span>{cat.name}</span>
                  <span
                    className={`font-mono-data text-[11px] ${
                      active ? 'text-[#090909]/80' : cat.textClass
                    }`}
                  >
                    {cat.totalPairs}P
                  </span>
                </button>
              );
            })}
          </div>

          {/* Dashboard Section Switcher */}
          <div className="inline-flex flex-wrap gap-1.5 rounded-sm border border-white/10 bg-[#151515]/90 p-1.5">
            {(
              [
                { id: 'fixtures', label: 'Fixtures' },
                { id: 'standings', label: 'Group Standings' },
                { id: 'brackets', label: 'Knockout Brackets' },
                { id: 'results', label: 'Completed Results' },
              ] as const
            ).map((tab) => {
              const active = activeView === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveView(tab.id)}
                  className={`min-h-[40px] rounded-sm px-3.5 py-2 text-xs font-medium tracking-[0.1em] transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    active
                      ? 'bg-white/12 text-[#F5D77A] border border-[#D4AF37]/40'
                      : 'text-[#A1A1A1] hover:text-white border border-transparent'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Category Overview Strip */}
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="surface-panel rounded-sm px-5 py-4">
            <p className="text-xs tracking-[0.14em] text-[#A1A1A1]">ACTIVE TIER</p>
            <p className="mt-1 font-display text-lg font-bold text-white">
              {categoryConfig.tierLabel}
            </p>
            <p className="mt-0.5 text-xs text-[#A1A1A1]">{categoryConfig.groupDistribution}</p>
          </div>
          <div className="surface-panel rounded-sm px-5 py-4">
            <p className="text-xs tracking-[0.14em] text-[#A1A1A1]">QUALIFICATION</p>
            <p className="mt-1 text-sm font-semibold text-[#F5D77A]">
              {categoryConfig.qualificationRule}
            </p>
          </div>
          <div className="surface-panel rounded-sm px-5 py-4">
            <p className="text-xs tracking-[0.14em] text-[#A1A1A1]">MATCH PROGRESS</p>
            <p className="mt-1 font-mono-data text-lg font-semibold text-white">
              {hasMatchData
                ? `${categoryStats.completedMatches} / ${categoryStats.totalMatches} Played`
                : 'Awaiting Draw'}
            </p>
            {hasMatchData && (
              <p className="mt-0.5 text-xs text-[#A1A1A1]">
                {categoryStats.liveMatches} Live · {categoryStats.upcomingMatches} Upcoming · {categoryStats.postponedMatches} Postponed
              </p>
            )}
          </div>
          <div className="surface-panel rounded-sm px-5 py-4">
            <p className="text-xs tracking-[0.14em] text-[#A1A1A1]">KNOCKOUT STAGES</p>
            <p className="mt-1 text-sm font-semibold text-white">
              {categoryConfig.knockoutRounds.join(' → ')}
            </p>
          </div>
        </div>

        {/* C. FIXTURES TABLE */}
        {activeView === 'fixtures' && (
          <section className="mt-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              {/* Group Filter */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs tracking-[0.14em] text-[#A1A1A1] mr-1">GROUP:</span>
                <button
                  type="button"
                  onClick={() => setSelectedGroup('ALL')}
                  className={`min-h-[36px] rounded-sm border px-3 py-1.5 text-xs font-medium tracking-wider cursor-pointer transition-colors ${
                    selectedGroup === 'ALL'
                      ? 'border-[#D4AF37] bg-[#D4AF37]/15 text-[#F5D77A]'
                      : 'border-white/10 bg-[#151515] text-[#A1A1A1] hover:text-white'
                  }`}
                >
                  All Groups
                </button>
                {categoryConfig.groups.map((grp) => (
                  <button
                    key={grp}
                    type="button"
                    onClick={() => setSelectedGroup(grp)}
                    className={`min-h-[36px] rounded-sm border px-3 py-1.5 text-xs font-medium tracking-wider cursor-pointer transition-colors ${
                      selectedGroup === grp
                        ? 'border-[#D4AF37] bg-[#D4AF37]/15 text-[#F5D77A]'
                        : 'border-white/10 bg-[#151515] text-[#A1A1A1] hover:text-white'
                    }`}
                  >
                    Group {grp}
                  </button>
                ))}
              </div>

              {/* Status Filter */}
              <div className="flex flex-wrap items-center gap-1.5">
                {(['all', 'upcoming', 'live', 'completed', 'postponed'] as const).map(
                  (status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setStatusFilter(status)}
                      className={`min-h-[36px] rounded-sm border px-3 py-1.5 text-xs capitalize tracking-wide cursor-pointer transition-colors ${
                        statusFilter === status
                          ? 'border-[#D4AF37]/70 bg-white/10 text-white'
                          : 'border-white/10 bg-[#151515] text-[#A1A1A1] hover:text-white'
                      }`}
                    >
                      {status}
                    </button>
                  )
                )}
              </div>
            </div>

            <div className="mt-4 surface-panel overflow-hidden rounded-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[780px] border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/10 bg-[#111111] text-xs font-semibold tracking-[0.12em] text-[#A1A1A1]">
                      <th className="px-4 py-3.5">Match #</th>
                      <th className="px-4 py-3.5">Pair 1</th>
                      <th className="px-4 py-3.5 text-center">Score</th>
                      <th className="px-4 py-3.5">Pair 2</th>
                      <th className="px-4 py-3.5">Date</th>
                      <th className="px-4 py-3.5">Time</th>
                      <th className="px-4 py-3.5">Court</th>
                      <th className="px-4 py-3.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/8">
                    {!hasMatchData ? (
                      <tr>
                        <td colSpan={8} className="px-6 py-14 text-center">
                          <p className="font-display text-base font-semibold tracking-[0.12em] text-[#F5D77A]">
                            OFFICIAL FIXTURES WILL BE PUBLISHED SOON.
                          </p>
                          <p className="mt-2 text-xs text-[#A1A1A1]">
                            Fixtures for {categoryConfig.tierLabel} ({categoryConfig.groupDistribution}) will appear here once the 18 November 2026 lots conclude.
                          </p>
                        </td>
                      </tr>
                    ) : filteredFixtures.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-6 py-10 text-center text-sm text-[#A1A1A1]">
                          No fixtures match the selected group and status filter.
                        </td>
                      </tr>
                    ) : (
                      filteredFixtures.map((fixture) => {
                        const pair1 = pairMap.get(fixture.pair1Id);
                        const pair2 = pairMap.get(fixture.pair2Id);
                        const res = resultMap.get(fixture.id);
                        const winnerId = determineMatchWinner(fixture, res);
                        const badge = STATUS_STYLES[fixture.status];

                        return (
                          <tr
                            key={fixture.id}
                            className="transition-colors hover:bg-white/[0.03]"
                          >
                            <td className="px-4 py-3.5 font-mono-data text-xs font-semibold text-[#F5D77A] whitespace-nowrap">
                              {fixture.matchNumber}
                            </td>
                            <td
                              className={`px-4 py-3.5 font-medium whitespace-nowrap ${
                                winnerId === fixture.pair1Id ? 'text-[#F5D77A]' : 'text-white'
                              }`}
                            >
                              {pair1?.displayName ?? fixture.pair1Id}
                              {pair1 && (
                                <span className="ml-2 font-mono-data text-[11px] text-[#A1A1A1]">
                                  {pair1.pairCode}
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3.5 text-center font-mono-data text-sm font-semibold text-white whitespace-nowrap">
                              {res ? `${res.pair1Score} – ${res.pair2Score}` : 'vs'}
                            </td>
                            <td
                              className={`px-4 py-3.5 font-medium whitespace-nowrap ${
                                winnerId === fixture.pair2Id ? 'text-[#F5D77A]' : 'text-white'
                              }`}
                            >
                              {pair2?.displayName ?? fixture.pair2Id}
                              {pair2 && (
                                <span className="ml-2 font-mono-data text-[11px] text-[#A1A1A1]">
                                  {pair2.pairCode}
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3.5 font-mono-data text-xs text-[#D0D0D0] whitespace-nowrap">
                              {fixture.date}
                            </td>
                            <td className="px-4 py-3.5 font-mono-data text-xs text-[#D0D0D0] whitespace-nowrap">
                              {fixture.time}
                            </td>
                            <td className="px-4 py-3.5 text-xs text-[#D0D0D0] whitespace-nowrap">
                              {fixture.court}
                            </td>
                            <td className="px-4 py-3.5 whitespace-nowrap">
                              <span
                                className={`inline-block rounded-sm border px-2.5 py-0.5 text-[11px] font-medium tracking-wide ${badge.className}`}
                              >
                                {badge.label}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* D. GROUP STANDINGS */}
        {activeView === 'standings' && (
          <section className="mt-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs tracking-[0.14em] text-[#A1A1A1] mr-1">
                  SELECT GROUP:
                </span>
                {categoryConfig.groups.map((grp) => (
                  <button
                    key={grp}
                    type="button"
                    onClick={() => setStandingsGroup(grp)}
                    className={`min-h-[38px] rounded-sm border px-4 py-1.5 text-xs font-semibold tracking-wider cursor-pointer transition-colors ${
                      standingsGroup === grp
                        ? 'border-[#D4AF37] bg-[#D4AF37] text-[#090909]'
                        : 'border-white/10 bg-[#151515] text-[#A1A1A1] hover:text-white'
                    }`}
                  >
                    Group {grp}
                  </button>
                ))}
              </div>

              <p className="text-xs text-[#A1A1A1]">
                {currentGroupMeta
                  ? `${currentGroupMeta.name} (${currentGroupMeta.capacity} pairs) · Top ${categoryConfig.qualifiersPerGroup} Qualify`
                  : ''}
              </p>
            </div>

            <div className="mt-4 surface-panel overflow-hidden rounded-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[820px] border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/10 bg-[#111111] text-xs font-semibold tracking-[0.1em] text-[#A1A1A1]">
                      <th className="px-4 py-3.5">Pos</th>
                      <th className="px-4 py-3.5">Pair</th>
                      <th className="px-4 py-3.5 text-right">Played</th>
                      <th className="px-4 py-3.5 text-right">Won</th>
                      <th className="px-4 py-3.5 text-right">Lost</th>
                      <th className="px-4 py-3.5 text-right">Points For</th>
                      <th className="px-4 py-3.5 text-right">Points Against</th>
                      <th className="px-4 py-3.5 text-right">Difference</th>
                      <th className="px-4 py-3.5 text-right">Table Points</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/8">
                    {!hasMatchData ? (
                      <tr>
                        <td colSpan={9} className="px-6 py-14 text-center">
                          <p className="font-display text-base font-semibold tracking-[0.12em] text-[#F5D77A]">
                            OFFICIAL FIXTURES WILL BE PUBLISHED SOON.
                          </p>
                          <p className="mt-2 text-xs text-[#A1A1A1]">
                            Group {standingsGroup} ({categoryConfig.tierLabel}) accommodates {currentGroupMeta?.capacity ?? 4} doubles pairs. Standings calculate automatically as matches complete.
                          </p>
                        </td>
                      </tr>
                    ) : (
                      currentGroupStandings.map((row) => (
                        <tr
                          key={row.pairId}
                          className={
                            row.qualified
                              ? 'bg-[#D4AF37]/[0.08] transition-colors hover:bg-[#D4AF37]/[0.12]'
                              : 'transition-colors hover:bg-white/[0.03]'
                          }
                        >
                          <td className="px-4 py-3.5 font-mono-data text-sm font-bold whitespace-nowrap">
                            <span
                              className={
                                row.qualified ? 'text-[#F5D77A]' : 'text-[#A1A1A1]'
                              }
                            >
                              {row.position}
                            </span>
                            {row.qualified && (
                              <span className="ml-2 text-[10px] font-semibold tracking-wider text-[#F5D77A]">
                                QUALIFIER
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3.5 font-medium text-white whitespace-nowrap">
                            <span>{row.pairName}</span>
                            <span className="ml-2 font-mono-data text-xs text-[#A1A1A1]">
                              {row.pairCode}
                            </span>
                            {row.tieBreakerApplied && (
                              <span className="ml-2 text-[11px] text-[#D4AF37]">
                                ({row.tieBreakerApplied.replace('-', ' ')})
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3.5 text-right font-mono-data text-[#D0D0D0]">
                            {row.played}
                          </td>
                          <td className="px-4 py-3.5 text-right font-mono-data text-white">
                            {row.won}
                          </td>
                          <td className="px-4 py-3.5 text-right font-mono-data text-[#A1A1A1]">
                            {row.lost}
                          </td>
                          <td className="px-4 py-3.5 text-right font-mono-data text-[#D0D0D0]">
                            {row.pointsFor}
                          </td>
                          <td className="px-4 py-3.5 text-right font-mono-data text-[#D0D0D0]">
                            {row.pointsAgainst}
                          </td>
                          <td
                            className={`px-4 py-3.5 text-right font-mono-data font-medium ${
                              row.difference > 0
                                ? 'text-emerald-300'
                                : row.difference < 0
                                  ? 'text-rose-300'
                                  : 'text-[#A1A1A1]'
                            }`}
                          >
                            {row.difference > 0 ? `+${row.difference}` : row.difference}
                          </td>
                          <td className="px-4 py-3.5 text-right font-mono-data text-base font-bold text-[#F5D77A]">
                            {row.tablePoints}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="border-t border-white/10 bg-[#111111] px-4 py-3 text-xs text-[#A1A1A1] flex flex-wrap items-center justify-between gap-2">
                <span>
                  Scoring: Win = 2 pts · Loss = 0 pts · Top 2 pairs qualify
                </span>
                <span>
                  Tie-breakers: 1. Head-to-head · 2. Point difference · 3. Total points scored
                </span>
              </div>
            </div>
          </section>
        )}

        {/* E. KNOCKOUT BRACKETS */}
        {activeView === 'brackets' && (
          <section className="mt-8">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-display text-xl font-bold tracking-wider text-white">
                {categoryConfig.name} KNOCKOUT BRACKET
              </h2>
              <span className="text-xs text-[#A1A1A1]">
                {categoryConfig.knockoutRounds.join(' → ')}
              </span>
            </div>

            <div className="overflow-x-auto pb-2">
              <div
                className={`grid gap-6 ${
                  categoryConfig.id === 'orange'
                    ? 'min-w-[840px] grid-cols-3'
                    : 'min-w-[600px] grid-cols-2'
                }`}
              >
                {categoryConfig.knockoutRounds.map((roundName) => {
                  const slots = knockoutBracket[roundName] ?? [];
                  return (
                    <div key={roundName} className="flex flex-col gap-4">
                      <div className="border-b border-[#D4AF37]/35 pb-2">
                        <p className="font-display text-sm font-bold tracking-[0.14em] text-[#F5D77A]">
                          {roundName.toUpperCase()}
                        </p>
                      </div>

                      <div className="flex flex-1 flex-col justify-around gap-4">
                        {slots.map((slot) => (
                          <div
                            key={slot.id}
                            className="surface-panel-gold rounded-sm p-4"
                          >
                            <div className="flex items-center justify-between text-[11px] font-mono-data text-[#D4AF37]">
                              <span>{slot.matchLabel}</span>
                              <span>
                                {slot.date} · {slot.time}
                              </span>
                            </div>

                            <div className="mt-3 space-y-2">
                              <div className="flex items-center justify-between border-b border-white/10 pb-2 text-sm">
                                <span className="font-medium text-white truncate pr-2">
                                  {slot.pair1Name}
                                </span>
                                <span className="font-mono-data text-xs text-[#A1A1A1]">
                                  {slot.pair1Score ?? '—'}
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-sm">
                                <span className="font-medium text-white truncate pr-2">
                                  {slot.pair2Name}
                                </span>
                                <span className="font-mono-data text-xs text-[#A1A1A1]">
                                  {slot.pair2Score ?? '—'}
                                </span>
                              </div>
                            </div>

                            <div className="mt-3 flex items-center justify-between text-[11px] text-[#A1A1A1]">
                              <span>{slot.court}</span>
                              <span>
                                {slot.pair1Label} vs {slot.pair2Label}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* F. COMPLETED RESULTS */}
        {activeView === 'results' && (
          <section className="mt-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs tracking-[0.14em] text-[#A1A1A1] mr-1">GROUP:</span>
                <button
                  type="button"
                  onClick={() => setSelectedGroup('ALL')}
                  className={`min-h-[36px] rounded-sm border px-3 py-1.5 text-xs font-medium tracking-wider cursor-pointer transition-colors ${
                    selectedGroup === 'ALL'
                      ? 'border-[#D4AF37] bg-[#D4AF37]/15 text-[#F5D77A]'
                      : 'border-white/10 bg-[#151515] text-[#A1A1A1] hover:text-white'
                  }`}
                >
                  All Groups
                </button>
                {categoryConfig.groups.map((grp) => (
                  <button
                    key={grp}
                    type="button"
                    onClick={() => setSelectedGroup(grp)}
                    className={`min-h-[36px] rounded-sm border px-3 py-1.5 text-xs font-medium tracking-wider cursor-pointer transition-colors ${
                      selectedGroup === grp
                        ? 'border-[#D4AF37] bg-[#D4AF37]/15 text-[#F5D77A]'
                        : 'border-white/10 bg-[#151515] text-[#A1A1A1] hover:text-white'
                    }`}
                  >
                    Group {grp}
                  </button>
                ))}
              </div>
              <p className="font-mono-data text-xs text-[#A1A1A1]">
                {hasMatchData
                  ? `${completedResultsFixtures.length} Completed Matches`
                  : '0 Official Results'}
              </p>
            </div>

            {!hasMatchData ? (
              <div className="mt-4 surface-panel rounded-sm px-6 py-14 text-center">
                <Trophy className="mx-auto h-7 w-7 text-[#D4AF37]/70" aria-hidden="true" />
                <p className="mt-3 font-display text-base font-semibold tracking-[0.12em] text-[#F5D77A]">
                  OFFICIAL FIXTURES WILL BE PUBLISHED SOON.
                </p>
                <p className="mt-2 text-xs text-[#A1A1A1]">
                  Completed match scorecards and winning pairs will appear here once tournament play commences on 28 November 2026.
                </p>
              </div>
            ) : completedResultsFixtures.length === 0 ? (
              <div className="mt-4 surface-panel rounded-sm px-6 py-10 text-center text-sm text-[#A1A1A1]">
                No completed matches recorded yet for this selection.
              </div>
            ) : (
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {completedResultsFixtures.map((fixture) => {
                  const pair1 = pairMap.get(fixture.pair1Id);
                  const pair2 = pairMap.get(fixture.pair2Id);
                  const res = resultMap.get(fixture.id);
                  const winnerId = determineMatchWinner(fixture, res);
                  const winnerPair = winnerId ? pairMap.get(winnerId) : undefined;
                  const margin = res ? Math.abs(res.pair1Score - res.pair2Score) : 0;

                  return (
                    <div key={fixture.id} className="surface-panel rounded-sm p-5">
                      <div className="flex items-center justify-between text-xs text-[#A1A1A1] border-b border-white/8 pb-3">
                        <span className="font-mono-data font-semibold text-[#F5D77A]">
                          {fixture.matchNumber} · Group {fixture.groupId}
                        </span>
                        <span className="font-mono-data">
                          {fixture.date} · {fixture.time} · {fixture.court}
                        </span>
                      </div>

                      <div className="mt-4 space-y-2.5">
                        <div className="flex items-center justify-between gap-4">
                          <span
                            className={`text-sm font-semibold ${
                              winnerId === fixture.pair1Id ? 'text-[#F5D77A]' : 'text-white/80'
                            }`}
                          >
                            {pair1?.displayName ?? fixture.pair1Id}
                          </span>
                          <span
                            className={`font-mono-data text-lg font-bold ${
                              winnerId === fixture.pair1Id ? 'text-[#F5D77A]' : 'text-[#A1A1A1]'
                            }`}
                          >
                            {res?.pair1Score ?? '—'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span
                            className={`text-sm font-semibold ${
                              winnerId === fixture.pair2Id ? 'text-[#F5D77A]' : 'text-white/80'
                            }`}
                          >
                            {pair2?.displayName ?? fixture.pair2Id}
                          </span>
                          <span
                            className={`font-mono-data text-lg font-bold ${
                              winnerId === fixture.pair2Id ? 'text-[#F5D77A]' : 'text-[#A1A1A1]'
                            }`}
                          >
                            {res?.pair2Score ?? '—'}
                          </span>
                        </div>
                      </div>

                      {winnerPair && (
                        <div className="mt-4 flex items-center justify-between border-t border-white/8 pt-3 text-xs">
                          <span className="inline-flex items-center gap-1.5 text-emerald-300 font-medium">
                            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                            Winner: {winnerPair.displayName}
                          </span>
                          <span className="font-mono-data text-[#A1A1A1]">
                            Won by {margin} pts
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
