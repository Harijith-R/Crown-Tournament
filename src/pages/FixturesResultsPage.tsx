import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  RotateCcw,
  Trophy,
} from 'lucide-react';
import { CATEGORIES, CATEGORY_MAP } from '../data/categories';
import { OFFICIAL_PAIRS } from '../data/pairs';
import { OFFICIAL_GROUPS } from '../data/groups';
import {
  OFFICIAL_FIXTURES,
  OFFICIAL_FIXTURE_DATES,
  OFFICIAL_MATCH_COURTS,
} from '../data/fixtures';
import { OFFICIAL_RESULTS } from '../data/results';
import {
  COMMITTEE_AUTHORITY_STATEMENT,
  STAGE_SCORING_CONFIG,
  TOURNAMENT_INFO,
} from '../data/tournament';
import {
  calculateGroupStandings,
  calculateMatchStatistics,
  determineMatchWinner,
  generateKnockoutParticipants,
  isCompletedMatchStatus,
  sortFixturesChronologically,
} from '../engine/standings';
import type {
  CategoryId,
  GroupId,
  MatchStatus,
  OfficialCourt,
} from '../types/tournament';
import { sceneController } from '../scene/animationController';

type DashboardSection = 'fixtures' | 'teams' | 'standings' | 'brackets' | 'results';
type CategoryFilter = 'ALL' | CategoryId;

const ALL_GROUPS: GroupId[] = ['A', 'B', 'C', 'D'];

const STATUS_FILTER_OPTIONS: Array<'ALL' | MatchStatus> = [
  'ALL',
  'To Be Played',
  'Postponed',
  'Played',
  'Rescheduled',
  'Cancelled',
  'Walkover',
];

const STATUS_STYLES: Record<MatchStatus, { label: string; className: string }> = {
  'To Be Played': {
    label: 'To Be Played',
    className: 'text-[#D0D0D0] border-white/15 bg-white/[0.04]',
  },
  Postponed: {
    label: 'Postponed',
    className: 'text-amber-200 border-amber-400/70 bg-amber-500/20 font-semibold',
  },
  Played: {
    label: 'Played',
    className: 'text-emerald-300 border-emerald-500/45 bg-emerald-500/12',
  },
  Rescheduled: {
    label: 'Rescheduled',
    className: 'text-sky-200 border-sky-400/50 bg-sky-500/12',
  },
  Cancelled: {
    label: 'Cancelled',
    className: 'text-rose-200 border-rose-500/50 bg-rose-500/12',
  },
  Walkover: {
    label: 'Walkover',
    className: 'text-emerald-200 border-emerald-400/45 bg-emerald-500/10',
  },
};

function isValidCategoryParam(value: string | null): value is CategoryId {
  return value === 'blue' || value === 'orange' || value === 'yellow';
}

export function FixturesResultsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCatParam = searchParams.get('category');
  const initialCategory: CategoryFilter = isValidCategoryParam(initialCatParam)
    ? initialCatParam
    : 'ALL';

  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>(initialCategory);
  const [specificCategory, setSpecificCategory] = useState<CategoryId>(
    initialCategory === 'ALL' ? 'blue' : initialCategory
  );
  const [selectedGroup, setSelectedGroup] = useState<'ALL' | GroupId>('ALL');
  const [selectedDate, setSelectedDate] = useState<'ALL' | string>('ALL');
  const [selectedCourt, setSelectedCourt] = useState<'ALL' | OfficialCourt>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | MatchStatus>('ALL');
  const [standingsGroup, setStandingsGroup] = useState<GroupId>('A');
  const [activeView, setActiveView] = useState<DashboardSection>('fixtures');

  useEffect(() => {
    sceneController.setRouteMode('fixtures');
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, []);

  useEffect(() => {
    const paramCat = searchParams.get('category');
    if (isValidCategoryParam(paramCat)) {
      setSelectedCategory(paramCat);
      setSpecificCategory(paramCat);
    }
  }, [searchParams]);

  const activeSpecificConfig = CATEGORY_MAP[specificCategory];

  const availableGroupsForFilter: GroupId[] = useMemo(() => {
    if (selectedCategory === 'ALL') return ALL_GROUPS;
    return CATEGORY_MAP[selectedCategory].groups;
  }, [selectedCategory]);

  // Keep group selections valid when switching categories
  useEffect(() => {
    if (selectedGroup !== 'ALL' && !availableGroupsForFilter.includes(selectedGroup)) {
      setSelectedGroup('ALL');
    }
  }, [availableGroupsForFilter, selectedGroup]);

  useEffect(() => {
    if (!activeSpecificConfig.groups.includes(standingsGroup)) {
      setStandingsGroup(activeSpecificConfig.groups[0]);
    }
  }, [activeSpecificConfig, standingsGroup]);

  const handleCategoryChange = (cat: CategoryFilter) => {
    setSelectedCategory(cat);
    if (cat === 'ALL') {
      setSearchParams({}, { replace: true });
    } else {
      setSpecificCategory(cat);
      setSearchParams({ category: cat }, { replace: true });
    }
  };

  const handleSpecificCategoryChange = (cat: CategoryId) => {
    setSpecificCategory(cat);
    if (selectedCategory !== 'ALL') {
      setSelectedCategory(cat);
      setSearchParams({ category: cat }, { replace: true });
    }
  };

  const resetFixtureFilters = () => {
    setSelectedCategory('ALL');
    setSelectedGroup('ALL');
    setSelectedDate('ALL');
    setSelectedCourt('ALL');
    setStatusFilter('ALL');
    setSearchParams({}, { replace: true });
  };

  const hasActiveFilters =
    selectedCategory !== 'ALL' ||
    selectedGroup !== 'ALL' ||
    selectedDate !== 'ALL' ||
    selectedCourt !== 'ALL' ||
    statusFilter !== 'ALL';

  const pairMap = useMemo(
    () => new Map(OFFICIAL_PAIRS.map((p) => [p.id, p])),
    []
  );

  const resultMap = useMemo(
    () => new Map(OFFICIAL_RESULTS.map((r) => [r.fixtureId, r])),
    []
  );

  const sortedOfficialFixtures = useMemo(
    () => sortFixturesChronologically(OFFICIAL_FIXTURES),
    []
  );

  const dateOptions = useMemo(() => {
    const dayByDate = new Map<string, string>();
    for (const f of sortedOfficialFixtures) {
      if (!dayByDate.has(f.date)) dayByDate.set(f.date, f.day);
    }
    return OFFICIAL_FIXTURE_DATES.map((date) => ({
      date,
      day: dayByDate.get(date) ?? '',
    }));
  }, [sortedOfficialFixtures]);

  const overallStats = useMemo(
    () => calculateMatchStatistics(sortedOfficialFixtures, OFFICIAL_RESULTS),
    [sortedOfficialFixtures]
  );

  const filteredFixtures = useMemo(
    () =>
      sortedOfficialFixtures.filter((f) => {
        if (selectedCategory !== 'ALL' && f.categoryId !== selectedCategory) return false;
        if (selectedGroup !== 'ALL' && f.groupId !== selectedGroup) return false;
        if (selectedDate !== 'ALL' && f.date !== selectedDate) return false;
        if (selectedCourt !== 'ALL' && f.court !== selectedCourt) return false;
        if (statusFilter !== 'ALL' && f.status !== statusFilter) return false;
        return true;
      }),
    [
      sortedOfficialFixtures,
      selectedCategory,
      selectedGroup,
      selectedDate,
      selectedCourt,
      statusFilter,
    ]
  );

  const completedResultsFixtures = useMemo(
    () =>
      sortedOfficialFixtures.filter((f) => {
        if (!isCompletedMatchStatus(f.status)) return false;
        if (selectedCategory !== 'ALL' && f.categoryId !== selectedCategory) return false;
        if (selectedGroup !== 'ALL' && f.groupId !== selectedGroup) return false;
        return true;
      }),
    [sortedOfficialFixtures, selectedCategory, selectedGroup]
  );

  const currentGroupStandings = useMemo(
    () =>
      calculateGroupStandings(
        specificCategory,
        standingsGroup,
        OFFICIAL_PAIRS,
        sortedOfficialFixtures,
        OFFICIAL_RESULTS,
        activeSpecificConfig.qualifiersPerGroup
      ),
    [
      specificCategory,
      standingsGroup,
      sortedOfficialFixtures,
      activeSpecificConfig.qualifiersPerGroup,
    ]
  );

  const knockoutBracket = useMemo(
    () =>
      generateKnockoutParticipants(
        activeSpecificConfig,
        OFFICIAL_PAIRS,
        sortedOfficialFixtures,
        OFFICIAL_RESULTS
      ),
    [activeSpecificConfig, sortedOfficialFixtures]
  );

  const currentStandingsGroupMeta = OFFICIAL_GROUPS.find(
    (g) => g.categoryId === specificCategory && g.groupId === standingsGroup
  );

  const visibleTeamCategories = useMemo(
    () =>
      selectedCategory === 'ALL'
        ? CATEGORIES
        : [CATEGORY_MAP[selectedCategory]],
    [selectedCategory]
  );

  return (
    <div className="relative z-10 min-h-screen pt-24 pb-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="border-b border-white/10 pb-8"
        >
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-medium tracking-[0.16em] text-[#A1A1A1] hover:text-[#F5D77A] transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            <span>BACK TO CHAMPIONSHIP HOME</span>
          </Link>

          <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-medium tracking-[0.22em] text-[#D4AF37]">
                {TOURNAMENT_INFO.title} · {TOURNAMENT_INFO.venueName}
              </p>
              <h1 className="mt-2 font-display text-3xl font-bold tracking-[0.05em] text-white sm:text-4xl lg:text-5xl">
                FIXTURES, GROUPS &amp; STANDINGS
              </h1>
              <p className="mt-2 text-sm sm:text-base text-[#A1A1A1]">
                {TOURNAMENT_INFO.dateRange} · Official Matches on Courts 3, 4 &amp; 5 (Courts 1 &amp; 2 warm-up only, subject to availability)
              </p>
            </div>
          </div>
        </motion.div>

        {/* Tournament Overview Strip */}
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="surface-panel rounded-sm px-5 py-4">
            <p className="text-xs tracking-[0.14em] text-[#A1A1A1]">CONFIRMED PAIRS</p>
            <p className="mt-1 font-mono-data text-xl font-bold text-[#F5D77A]">
              {OFFICIAL_PAIRS.length} Pairs
            </p>
            <p className="mt-1 text-xs text-[#A1A1A1]">
              <span className="text-blue-400">8 Blue</span> ·{' '}
              <span className="text-orange-400">17 Orange</span> ·{' '}
              <span className="text-yellow-300">9 Yellow</span>
            </p>
          </div>
          <div className="surface-panel rounded-sm px-5 py-4">
            <p className="text-xs tracking-[0.14em] text-[#A1A1A1]">GROUP-STAGE FIXTURES</p>
            <p className="mt-1 font-mono-data text-xl font-bold text-white">
              {overallStats.totalMatches} Matches
            </p>
            <p className="mt-1 text-xs text-[#A1A1A1]">
              <span className="text-blue-400">12 Blue</span> ·{' '}
              <span className="text-orange-400">28 Orange</span> ·{' '}
              <span className="text-yellow-300">16 Yellow</span>
            </p>
          </div>
          <div className="surface-panel rounded-sm px-5 py-4">
            <p className="text-xs tracking-[0.14em] text-[#A1A1A1]">SCHEDULE STATUS</p>
            <p className="mt-1 font-mono-data text-xl font-bold text-white">
              {overallStats.toBePlayedMatches} To Be Played
            </p>
            <p className="mt-1 text-xs text-[#A1A1A1]">
              <span className="text-amber-300 font-medium">
                {overallStats.postponedMatches} Postponed
              </span>{' '}
              · {overallStats.completedMatches} Played
            </p>
          </div>
          <div className="surface-panel rounded-sm px-5 py-4">
            <p className="text-xs tracking-[0.14em] text-[#A1A1A1]">FINALS &amp; SCORING</p>
            <p className="mt-1 text-sm font-semibold text-white">
              13 Dec 2026 (Relay After Finals)
            </p>
            <p className="mt-1 text-xs text-[#A1A1A1]">
              Group: {STAGE_SCORING_CONFIG.groupStagePoints} pts · Knockouts &amp; Finals: {STAGE_SCORING_CONFIG.knockoutStagePoints} pts
            </p>
          </div>
        </div>

        {/* Category Filter Tabs + View Switcher */}
        <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div
            role="tablist"
            aria-label="Filter by Category"
            className="inline-flex flex-wrap gap-1.5 rounded-sm border border-white/10 bg-[#151515]/90 p-1.5"
          >
            <button
              role="tab"
              aria-selected={selectedCategory === 'ALL'}
              type="button"
              onClick={() => handleCategoryChange('ALL')}
              className={`flex min-h-[40px] items-center gap-2 rounded-sm px-3.5 py-2 text-xs font-semibold tracking-[0.12em] transition-colors duration-200 cursor-pointer whitespace-nowrap shrink-0 ${
                selectedCategory === 'ALL'
                  ? 'bg-[#D4AF37] text-[#090909]'
                  : 'text-[#A1A1A1] hover:text-white hover:bg-white/5'
              }`}
            >
              <span>ALL CATEGORIES</span>
              <span
                className={`font-mono-data text-[11px] ${
                  selectedCategory === 'ALL' ? 'text-[#090909]/80' : 'text-[#F5D77A]'
                }`}
              >
                {OFFICIAL_FIXTURES.length}
              </span>
            </button>

            {CATEGORIES.map((cat) => {
              const active = cat.id === selectedCategory;
              return (
                <button
                  key={cat.id}
                  role="tab"
                  aria-selected={active}
                  type="button"
                  onClick={() => handleCategoryChange(cat.id)}
                  className={`flex min-h-[40px] items-center gap-2 rounded-sm px-3.5 py-2 text-xs font-semibold tracking-[0.12em] transition-colors duration-200 cursor-pointer whitespace-nowrap shrink-0 ${
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
                    {cat.totalFixtures}
                  </span>
                </button>
              );
            })}
          </div>

          <div
            role="tablist"
            aria-label="Dashboard Views"
            className="inline-flex flex-wrap gap-1.5 rounded-sm border border-white/10 bg-[#151515]/90 p-1.5"
          >
            {(
              [
                { id: 'fixtures', label: 'Fixtures' },
                { id: 'teams', label: 'Groups & Teams' },
                { id: 'standings', label: 'Group Standings' },
                { id: 'brackets', label: 'Knockout Brackets' },
                { id: 'results', label: 'Completed Results' },
              ] as const
            ).map((tab) => {
              const active = activeView === tab.id;
              return (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={active}
                  type="button"
                  onClick={() => setActiveView(tab.id)}
                  className={`min-h-[40px] rounded-sm px-3.5 py-2 text-xs font-medium tracking-[0.08em] transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    active
                      ? 'bg-white/12 text-[#F5D77A] border border-[#D4AF37]/45'
                      : 'text-[#A1A1A1] hover:text-white border border-transparent'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* VIEW 1: FIXTURES (ALL 56 OFFICIAL FIXTURES) */}
        {activeView === 'fixtures' && (
          <section className="mt-8">
            {/* Multi-Facet Filter Bar */}
            <div className="surface-panel rounded-sm p-4 sm:p-5">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-12 lg:items-end">
                {/* Group Filter */}
                <div className="lg:col-span-4">
                  <p className="mb-2 text-[11px] font-medium tracking-[0.14em] text-[#A1A1A1]">
                    GROUP
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => setSelectedGroup('ALL')}
                      className={`min-h-[38px] rounded-sm border px-3 py-1.5 text-xs font-medium cursor-pointer transition-colors whitespace-nowrap shrink-0 ${
                        selectedGroup === 'ALL'
                          ? 'border-[#D4AF37] bg-[#D4AF37]/15 text-[#F5D77A]'
                          : 'border-white/10 bg-[#0F0F0F] text-[#A1A1A1] hover:text-white'
                      }`}
                    >
                      All
                    </button>
                    {availableGroupsForFilter.map((grp) => (
                      <button
                        key={grp}
                        type="button"
                        onClick={() => setSelectedGroup(grp)}
                        className={`min-h-[38px] rounded-sm border px-3 py-1.5 text-xs font-medium cursor-pointer transition-colors whitespace-nowrap shrink-0 ${
                          selectedGroup === grp
                            ? 'border-[#D4AF37] bg-[#D4AF37]/15 text-[#F5D77A]'
                            : 'border-white/10 bg-[#0F0F0F] text-[#A1A1A1] hover:text-white'
                        }`}
                      >
                        Group {grp}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date Filter */}
                <div className="lg:col-span-3">
                  <label
                    htmlFor="fixture-date-filter"
                    className="mb-2 block text-[11px] font-medium tracking-[0.14em] text-[#A1A1A1]"
                  >
                    DATE
                  </label>
                  <select
                    id="fixture-date-filter"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="min-h-[38px] w-full rounded-sm border border-white/15 bg-[#0F0F0F] px-3 py-1.5 text-xs text-white focus:border-[#D4AF37] focus:outline-none"
                  >
                    <option value="ALL">All Match Dates ({dateOptions.length} days)</option>
                    {dateOptions.map(({ date, day }) => (
                      <option key={date} value={date}>
                        {date} ({day})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Court Filter */}
                <div className="lg:col-span-3">
                  <p className="mb-2 text-[11px] font-medium tracking-[0.14em] text-[#A1A1A1]">
                    COURT
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => setSelectedCourt('ALL')}
                      className={`min-h-[38px] rounded-sm border px-2.5 py-1.5 text-xs font-medium cursor-pointer transition-colors whitespace-nowrap shrink-0 ${
                        selectedCourt === 'ALL'
                          ? 'border-[#D4AF37] bg-[#D4AF37]/15 text-[#F5D77A]'
                          : 'border-white/10 bg-[#0F0F0F] text-[#A1A1A1] hover:text-white'
                      }`}
                    >
                      All
                    </button>
                    {OFFICIAL_MATCH_COURTS.map((court) => (
                      <button
                        key={court}
                        type="button"
                        onClick={() => setSelectedCourt(court)}
                        className={`min-h-[38px] rounded-sm border px-2.5 py-1.5 text-xs font-medium cursor-pointer transition-colors whitespace-nowrap shrink-0 ${
                          selectedCourt === court
                            ? 'border-[#D4AF37] bg-[#D4AF37]/15 text-[#F5D77A]'
                            : 'border-white/10 bg-[#0F0F0F] text-[#A1A1A1] hover:text-white'
                        }`}
                      >
                        {court.replace('Court ', 'C')}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Status Filter */}
                <div className="lg:col-span-2">
                  <label
                    htmlFor="fixture-status-filter"
                    className="mb-2 block text-[11px] font-medium tracking-[0.14em] text-[#A1A1A1]"
                  >
                    STATUS
                  </label>
                  <select
                    id="fixture-status-filter"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as 'ALL' | MatchStatus)}
                    className="min-h-[38px] w-full rounded-sm border border-white/15 bg-[#0F0F0F] px-3 py-1.5 text-xs text-white focus:border-[#D4AF37] focus:outline-none"
                  >
                    {STATUS_FILTER_OPTIONS.map((st) => (
                      <option key={st} value={st}>
                        {st === 'ALL' ? 'All Statuses' : st}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-white/8 pt-3 text-xs text-[#A1A1A1]">
                <span className="font-mono-data">
                  Showing <strong className="text-white">{filteredFixtures.length}</strong> of{' '}
                  <strong className="text-white">{sortedOfficialFixtures.length}</strong> official fixtures
                </span>

                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={resetFixtureFilters}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-[#F5D77A] hover:text-white transition-colors cursor-pointer"
                  >
                    <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Reset Filters</span>
                  </button>
                )}
              </div>
            </div>

            {/* Desktop Full-Column Table */}
            <div className="mt-5 hidden lg:block surface-panel overflow-hidden rounded-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1040px] border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/10 bg-[#111111] text-[11px] font-semibold tracking-[0.12em] text-[#A1A1A1]">
                      <th className="px-3.5 py-3.5">Date</th>
                      <th className="px-3.5 py-3.5">Day</th>
                      <th className="px-3.5 py-3.5">Court</th>
                      <th className="px-3.5 py-3.5">Category</th>
                      <th className="px-3.5 py-3.5">Group</th>
                      <th className="px-3.5 py-3.5">Stage</th>
                      <th className="px-3.5 py-3.5">Match</th>
                      <th className="px-3.5 py-3.5 text-center">Score</th>
                      <th className="px-3.5 py-3.5">Winner</th>
                      <th className="px-3.5 py-3.5">Status</th>
                      <th className="px-3.5 py-3.5">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/8">
                    {filteredFixtures.length === 0 ? (
                      <tr>
                        <td colSpan={11} className="px-6 py-12 text-center text-sm text-[#A1A1A1]">
                          No fixtures match the active filters.
                        </td>
                      </tr>
                    ) : (
                      filteredFixtures.map((fixture) => {
                        const cat = CATEGORY_MAP[fixture.categoryId];
                        const pair1 = pairMap.get(fixture.pair1Id);
                        const pair2 = pairMap.get(fixture.pair2Id);
                        const res = resultMap.get(fixture.id);
                        const winnerId = determineMatchWinner(fixture, res);
                        const winnerPair = winnerId ? pairMap.get(winnerId) : undefined;
                        const statusMeta = STATUS_STYLES[fixture.status];
                        const isPostponed = fixture.status === 'Postponed';

                        const scoreDisplay = res
                          ? `${res.pair1Score} – ${res.pair2Score}`
                          : fixture.score || '—';
                        const winnerDisplay = winnerPair?.displayName ?? (fixture.winner || '—');

                        return (
                          <tr
                            key={fixture.id}
                            className={
                              isPostponed
                                ? 'bg-amber-500/[0.08] transition-colors hover:bg-amber-500/[0.13]'
                                : 'transition-colors hover:bg-white/[0.03]'
                            }
                          >
                            <td className="px-3.5 py-3 font-mono-data text-xs text-white whitespace-nowrap">
                              {fixture.date}
                            </td>
                            <td className="px-3.5 py-3 text-xs text-[#D0D0D0] whitespace-nowrap">
                              {fixture.day}
                            </td>
                            <td className="px-3.5 py-3 font-mono-data text-xs font-medium text-[#F5D77A] whitespace-nowrap">
                              {fixture.court}
                            </td>
                            <td className={`px-3.5 py-3 text-xs font-semibold tracking-wide whitespace-nowrap ${cat.textClass}`}>
                              {cat.name}
                            </td>
                            <td className="px-3.5 py-3 font-mono-data text-xs text-white whitespace-nowrap">
                              Group {fixture.groupId}
                            </td>
                            <td className="px-3.5 py-3 text-xs text-[#A1A1A1] whitespace-nowrap">
                              {fixture.stageLabel}
                            </td>
                            <td className="px-3.5 py-3 text-sm text-white">
                              <span className={winnerId === fixture.pair1Id ? 'font-semibold text-[#F5D77A]' : 'font-medium'}>
                                {pair1?.displayName ?? fixture.pair1Id}
                              </span>
                              <span className="mx-2 text-xs text-[#A1A1A1]">vs</span>
                              <span className={winnerId === fixture.pair2Id ? 'font-semibold text-[#F5D77A]' : 'font-medium'}>
                                {pair2?.displayName ?? fixture.pair2Id}
                              </span>
                            </td>
                            <td className="px-3.5 py-3 text-center font-mono-data text-xs text-[#D0D0D0] whitespace-nowrap">
                              {scoreDisplay}
                            </td>
                            <td className="px-3.5 py-3 text-xs text-[#D0D0D0] whitespace-nowrap">
                              {winnerDisplay}
                            </td>
                            <td className="px-3.5 py-3 whitespace-nowrap">
                              <span
                                className={`inline-flex items-center gap-1.5 rounded-sm border px-2 py-0.5 text-[11px] tracking-wide ${statusMeta.className}`}
                              >
                                {isPostponed && (
                                  <AlertTriangle className="h-3 w-3 shrink-0" aria-hidden="true" />
                                )}
                                <span>{statusMeta.label}</span>
                              </span>
                            </td>
                            <td className="px-3.5 py-3 text-xs text-[#A1A1A1]">
                              {fixture.remarks || '—'}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile & Tablet Stacked Fixture Cards */}
            <div className="mt-5 space-y-3 lg:hidden">
              {filteredFixtures.length === 0 ? (
                <div className="surface-panel rounded-sm px-6 py-10 text-center text-sm text-[#A1A1A1]">
                  No fixtures match the active filters.
                </div>
              ) : (
                filteredFixtures.map((fixture) => {
                  const cat = CATEGORY_MAP[fixture.categoryId];
                  const pair1 = pairMap.get(fixture.pair1Id);
                  const pair2 = pairMap.get(fixture.pair2Id);
                  const res = resultMap.get(fixture.id);
                  const winnerId = determineMatchWinner(fixture, res);
                  const winnerPair = winnerId ? pairMap.get(winnerId) : undefined;
                  const statusMeta = STATUS_STYLES[fixture.status];
                  const isPostponed = fixture.status === 'Postponed';

                  return (
                    <article
                      key={fixture.id}
                      className={`rounded-sm border p-4 ${
                        isPostponed
                          ? 'border-amber-400/55 bg-amber-950/25'
                          : 'border-white/10 bg-[#151515]/92'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono-data">
                          <span className="font-semibold text-white">{fixture.date}</span>
                          <span className="text-[#A1A1A1]">· {fixture.day}</span>
                          <span className="text-[#F5D77A] font-semibold">· {fixture.court}</span>
                        </div>
                        <span
                          className={`inline-flex items-center gap-1 rounded-sm border px-2 py-0.5 text-[11px] tracking-wide ${statusMeta.className}`}
                        >
                          {isPostponed && (
                            <AlertTriangle className="h-3 w-3 shrink-0" aria-hidden="true" />
                          )}
                          <span>{statusMeta.label}</span>
                        </span>
                      </div>

                      <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs">
                        <span className={`font-semibold tracking-wider ${cat.textClass}`}>
                          {cat.name}
                        </span>
                        <span className="text-[#A1A1A1]" aria-hidden="true">·</span>
                        <span className="font-mono-data text-white">Group {fixture.groupId}</span>
                        <span className="text-[#A1A1A1]" aria-hidden="true">·</span>
                        <span className="text-[#A1A1A1]">{fixture.stageLabel}</span>
                      </div>

                      <div className="mt-3 border-t border-white/8 pt-3 text-sm leading-snug text-white">
                        <p className={winnerId === fixture.pair1Id ? 'font-semibold text-[#F5D77A]' : 'font-semibold'}>
                          {pair1?.displayName ?? fixture.pair1Id}{' '}
                          <span className="font-mono-data text-[11px] font-normal text-[#A1A1A1]">
                            ({fixture.pair1Id})
                          </span>
                        </p>
                        <p className="my-0.5 text-[11px] uppercase tracking-widest text-[#A1A1A1]">vs</p>
                        <p className={winnerId === fixture.pair2Id ? 'font-semibold text-[#F5D77A]' : 'font-semibold'}>
                          {pair2?.displayName ?? fixture.pair2Id}{' '}
                          <span className="font-mono-data text-[11px] font-normal text-[#A1A1A1]">
                            ({fixture.pair2Id})
                          </span>
                        </p>
                      </div>

                      {(res || fixture.score || winnerPair || fixture.winner || fixture.remarks) && (
                        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-white/8 pt-2.5 text-xs text-[#D0D0D0]">
                          <span>
                            Score:{' '}
                            <strong className="font-mono-data text-white">
                              {res ? `${res.pair1Score} – ${res.pair2Score}` : fixture.score || '—'}
                            </strong>
                          </span>
                          {(winnerPair || fixture.winner) && (
                            <span className="text-emerald-300">
                              Winner: {winnerPair?.displayName ?? fixture.winner}
                            </span>
                          )}
                          {fixture.remarks && (
                            <span className="w-full text-[#A1A1A1]">
                              Remarks: {fixture.remarks}
                            </span>
                          )}
                        </div>
                      )}
                    </article>
                  );
                })
              )}
            </div>
          </section>
        )}

        {/* VIEW 2: GROUPS & TEAMS (ALL 34 CONFIRMED PAIRS) */}
        {activeView === 'teams' && (
          <section className="mt-8 space-y-10">
            {visibleTeamCategories.map((cat) => (
              <div key={cat.id}>
                <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-white/10 pb-3">
                  <div className="flex items-baseline gap-3">
                    <h2 className={`font-display text-2xl font-bold tracking-[0.08em] ${cat.textClass}`}>
                      {cat.tierLabel.toUpperCase()}
                    </h2>
                    <span className="font-mono-data text-xs text-[#D0D0D0]">
                      {cat.totalPairs} Pairs · {cat.totalFixtures} Fixtures
                    </span>
                  </div>
                  <span className="text-xs text-[#A1A1A1]">
                    {cat.groupDistribution}
                  </span>
                </div>

                <div
                  className={`mt-5 grid gap-5 ${
                    cat.groups.length === 4 ? 'md:grid-cols-2' : 'md:grid-cols-2'
                  }`}
                >
                  {cat.groups.map((grp) => {
                    const groupPairs = OFFICIAL_PAIRS.filter(
                      (p) => p.categoryId === cat.id && p.groupId === grp
                    ).sort((a, b) => a.seedPosition - b.seedPosition);

                    return (
                      <div
                        key={`${cat.id}-${grp}`}
                        className={`surface-panel rounded-sm p-5 ${cat.borderClass}`}
                      >
                        <div className="flex items-center justify-between border-b border-white/10 pb-3">
                          <h3 className="font-display text-base font-bold tracking-[0.1em] text-white">
                            GROUP {grp}
                          </h3>
                          <span className={`font-mono-data text-xs font-semibold ${cat.textClass}`}>
                            {cat.name} · {groupPairs.length} PAIRS
                          </span>
                        </div>

                        <ul className="mt-3 divide-y divide-white/8">
                          {groupPairs.map((pair) => (
                            <li
                              key={pair.id}
                              className="flex items-center justify-between gap-3 py-2.5 text-sm"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <span className="font-mono-data text-xs font-bold text-[#F5D77A] w-9 shrink-0">
                                  {pair.id}
                                </span>
                                <span className="font-medium text-white truncate">
                                  {pair.displayName}
                                </span>
                              </div>
                              <span className={`text-[11px] font-medium tracking-wider whitespace-nowrap shrink-0 ${cat.textClass}`}>
                                {cat.name}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </section>
        )}

        {/* VIEW 3: GROUP STANDINGS */}
        {activeView === 'standings' && (
          <section className="mt-8">
            {/* Category & Group Controls */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-3">
                {selectedCategory === 'ALL' && (
                  <div className="flex items-center gap-1.5 border-r border-white/10 pr-3">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => handleSpecificCategoryChange(cat.id)}
                        className={`min-h-[38px] rounded-sm border px-3 py-1.5 text-xs font-semibold tracking-wider cursor-pointer transition-colors ${
                          specificCategory === cat.id
                            ? 'border-[#D4AF37] bg-[#D4AF37]/15 text-[#F5D77A]'
                            : 'border-white/10 bg-[#151515] text-[#A1A1A1] hover:text-white'
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs tracking-[0.14em] text-[#A1A1A1] mr-1">
                    GROUP:
                  </span>
                  {activeSpecificConfig.groups.map((grp) => (
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
              </div>

              <p className="text-xs text-[#A1A1A1]">
                <span className={`font-semibold ${activeSpecificConfig.textClass}`}>
                  {activeSpecificConfig.tierLabel}
                </span>{' '}
                · {currentStandingsGroupMeta?.name} ({currentStandingsGroupMeta?.capacity} pairs) · Top{' '}
                {activeSpecificConfig.qualifiersPerGroup} Qualify
              </p>
            </div>

            <div className="mt-4 surface-panel overflow-hidden rounded-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/10 bg-[#111111] text-xs font-semibold tracking-[0.1em] text-[#A1A1A1]">
                      <th className="px-4 py-3.5">Pos</th>
                      <th className="px-4 py-3.5">Pair</th>
                      <th className="px-4 py-3.5 text-right">Played</th>
                      <th className="px-4 py-3.5 text-right">Won</th>
                      <th className="px-4 py-3.5 text-right">Lost</th>
                      <th className="px-4 py-3.5 text-right">Table Points</th>
                      <th className="px-4 py-3.5 text-right">Total Points Scored</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/8">
                    {currentGroupStandings.map((row) => (
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
                          <span className="mr-2 font-mono-data text-xs font-semibold text-[#F5D77A]">
                            {row.pairId}
                          </span>
                          <span>{row.pairName}</span>
                          {row.tieBreakerApplied && (
                            <span className="ml-2 text-[11px] text-[#D4AF37]">
                              (Total Points Scored)
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
                        <td className="px-4 py-3.5 text-right font-mono-data text-base font-bold text-[#F5D77A]">
                          {row.tablePoints}
                        </td>
                        <td className="px-4 py-3.5 text-right font-mono-data text-sm font-medium text-white">
                          {row.pointsFor}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="border-t border-white/10 bg-[#111111] px-4 py-3 text-xs text-[#A1A1A1] flex flex-wrap items-center justify-between gap-2">
                <span>
                  Win = 2 pts · Loss = 0 pts · Group stage: {STAGE_SCORING_CONFIG.groupStagePoints} pts · Postponed &amp; unplayed matches excluded
                </span>
                <span>
                  Tie-breaker: Total Points Scored only
                </span>
              </div>
            </div>
            <p className="mt-3 text-xs text-[#A1A1A1]">
              {COMMITTEE_AUTHORITY_STATEMENT}
            </p>
          </section>
        )}

        {/* VIEW 4: KNOCKOUT BRACKETS */}
        {activeView === 'brackets' && (
          <section className="mt-8">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="font-display text-xl font-bold tracking-wider text-white">
                  {activeSpecificConfig.name} KNOCKOUT BRACKET
                </h2>
                {selectedCategory === 'ALL' && (
                  <div className="flex items-center gap-1.5">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => handleSpecificCategoryChange(cat.id)}
                        className={`min-h-[34px] rounded-sm border px-3 py-1 text-xs font-semibold tracking-wider cursor-pointer transition-colors ${
                          specificCategory === cat.id
                            ? 'border-[#D4AF37] bg-[#D4AF37]/15 text-[#F5D77A]'
                            : 'border-white/10 bg-[#151515] text-[#A1A1A1] hover:text-white'
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <span className="text-xs text-[#A1A1A1]">
                {activeSpecificConfig.knockoutRounds.join(' → ')} · {STAGE_SCORING_CONFIG.knockoutStagePoints} points per game
              </span>
            </div>

            <div className="overflow-x-auto pb-2">
              <div
                className={`grid gap-6 ${
                  activeSpecificConfig.id === 'orange'
                    ? 'min-w-[840px] grid-cols-3'
                    : 'min-w-[600px] grid-cols-2'
                }`}
              >
                {activeSpecificConfig.knockoutRounds.map((roundName) => {
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
                              <span>{slot.matchLabel} · 30 PTS</span>
                              <span>
                                {slot.date ? slot.date : 'Schedule Pending'}
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
                              <span>{slot.court ?? 'Court TBD (Courts 3–5)'}</span>
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

            <p className="mt-4 text-xs text-[#A1A1A1]">
              Knockout matchups, times, and courts (Courts 3–5) will be confirmed once group-stage qualification finishes. Finals take place on 13 December 2026, followed by the Relay Tournament.
            </p>
          </section>
        )}

        {/* VIEW 5: COMPLETED RESULTS */}
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
                {availableGroupsForFilter.map((grp) => (
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
                {completedResultsFixtures.length} Completed Matches
              </p>
            </div>

            {completedResultsFixtures.length === 0 ? (
              <div className="mt-4 surface-panel rounded-sm px-6 py-14 text-center">
                <Trophy className="mx-auto h-7 w-7 text-[#D4AF37]/70" aria-hidden="true" />
                <p className="mt-3 font-display text-base font-semibold tracking-[0.12em] text-[#F5D77A]">
                  NO COMPLETED MATCHES YET
                </p>
                <p className="mt-2 text-xs text-[#A1A1A1]">
                  Group-stage play begins on 28 November 2026. Recorded match scores and automatic winner updates will appear here as games finish.
                </p>
              </div>
            ) : (
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {completedResultsFixtures.map((fixture) => {
                  const cat = CATEGORY_MAP[fixture.categoryId];
                  const pair1 = pairMap.get(fixture.pair1Id);
                  const pair2 = pairMap.get(fixture.pair2Id);
                  const res = resultMap.get(fixture.id);
                  const winnerId = determineMatchWinner(fixture, res);
                  const winnerPair = winnerId ? pairMap.get(winnerId) : undefined;
                  const margin = res ? Math.abs(res.pair1Score - res.pair2Score) : 0;

                  return (
                    <div key={fixture.id} className="surface-panel rounded-sm p-5">
                      <div className="flex items-center justify-between text-xs text-[#A1A1A1] border-b border-white/8 pb-3">
                        <span className={`font-mono-data font-semibold ${cat.textClass}`}>
                          {cat.name} · Group {fixture.groupId}
                        </span>
                        <span className="font-mono-data">
                          {fixture.date} · {fixture.court}
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
