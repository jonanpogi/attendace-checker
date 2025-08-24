'use client';

import BackButton from '@/components/BackButton';
import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import LoginModal from '@/components/LoginModal';
import { useAuth } from '@/hooks/useAuth';
import useHasMounted from '@/hooks/useHasMounted';
import {
  motion,
  AnimatePresence,
  useMotionValue,
  animate,
} from 'framer-motion';
import Dialog from '@/components/Dialog';

// Fixed teams and games data
const TEAMS = [
  { key: 'white', name: 'White Team' },
  { key: 'blue', name: 'Blue Team' },
  { key: 'gold', name: 'Gold Team' },
] as const;

type TeamKey = (typeof TEAMS)[number]['key'];

const GAME_SECTIONS: { title: string; games: string[] }[] = [
  {
    title: 'Main Events',
    games: [
      'Pistol Proficiency',
      'Basketball',
      'Volleyball',
      'Team Chant',
      'Bowling',
      'Obstacle Relay',
      'Tug of War',
    ],
  },
  {
    title: 'Fun Games',
    games: [
      'Wheel Barrow Race (Fun Games)',
      'Balloon Pop (Fun Games)',
      'Sack Race (Fun Games)',
    ],
  },
  {
    title: 'Fun Run',
    games: ['Fun Run (Male)', 'Fun Run (Female)'],
  },
  {
    title: 'Boards & Precision',
    games: [
      'Chess',
      'Archery (Male)',
      'Archery (Female)',
      'Billiards (Male Singles)',
      'Billiards (Female Singles)',
      'Billiards (Mixed Doubles)',
      'Darts (Male Singles)',
      'Darts (Female Singles)',
      'Darts (Mixed Doubles)',
      'Table Tennis (Male Singles)',
      'Table Tennis (Female Singles)',
      'Table Tennis (Mixed Doubles)',
    ],
  },
];

// Flatten to a list of game IDs
const ALL_GAMES = GAME_SECTIONS.flatMap((s) => s.games);

// Types
type ScoreState = Record<string, Record<TeamKey, number>>; // game -> team -> points

/* helper: animated number with separators */
const AnimatedNumber = ({ value }: { value: number }) => {
  const mv = useMotionValue(value);
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const controls = animate(mv, value, { duration: 0.5, ease: 'easeOut' });
    return () => controls.stop();
  }, [mv, value]);

  useEffect(() => mv.on('change', (v) => setDisplay(Math.round(v))), [mv]);

  return <>{display.toLocaleString()}</>;
};

/* track rank changes to show ▲ ▼ badge */
const prevPlacesRef = {
  current: { white: 0, blue: 0, gold: 0 } as Record<TeamKey, number>,
};

const useRankDeltas = (leaderboard: { team: TeamKey; place: number }[]) => {
  const [deltas, setDeltas] = useState<Record<TeamKey, number>>({
    white: 0,
    blue: 0,
    gold: 0,
  });

  useEffect(() => {
    const next: Record<TeamKey, number> = { white: 0, blue: 0, gold: 0 };

    for (const row of leaderboard) {
      const prev = prevPlacesRef.current[row.team];
      if (prev && prev !== row.place) next[row.team] = prev - row.place; // + = moved up, - = down
    }

    setDeltas(next);

    prevPlacesRef.current = Object.fromEntries(
      leaderboard.map((r) => [r.team, r.place] as const),
    ) as Record<TeamKey, number>;
  }, [leaderboard]);

  return deltas;
};

const TeamPill = ({
  team,
  compact = false,
}: {
  team: TeamKey;
  compact?: boolean;
}) => {
  const label = team === 'white' ? 'White' : team === 'blue' ? 'Blue' : 'Gold';
  const styles: Record<TeamKey, string> = {
    white:
      'bg-zinc-100 text-slate-900 drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]',
    blue: 'bg-cyan-500 text-cyan-950 drop-shadow-[0_0_10px_rgba(34,211,238,0.6)]',
    gold: 'bg-amber-400 text-amber-900 drop-shadow-[0_0_10px_rgba(251,191,36,0.6)]',
  };
  return (
    <span
      className={
        'inline-flex items-center justify-center rounded-full tracking-widest uppercase ' +
        (compact ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs') +
        ' ' +
        styles[team]
      }
    >
      {label}
    </span>
  );
};

const Sports = () => {
  const { isAuthenticated, setIsAuthenticated } = useAuth();
  const hasMounted = useHasMounted();

  // Roles: "admin" can edit; "viewer" can only view totals.
  const [role, setRole] = useState<'admin' | 'viewer'>('viewer');
  const [openModal, setOpenModal] = useState(false);
  const isAdmin = role === 'admin';
  // Scores state (init zeros for all games)
  const [scores, setScores] = useState<ScoreState>(() => {
    const init: ScoreState = {};
    for (const g of ALL_GAMES) init[g] = { white: 0, blue: 0, gold: 0 };
    return init;
  });
  const [openDialog, setOpenDialog] = useState(false);

  // ---------- Realtime-enough via ETag polling ----------
  useEffect(() => {
    let alive = true;
    let etag: string | null = null;

    const pull = async () => {
      try {
        const headers: Record<string, string> = {};
        if (etag) headers['If-None-Match'] = etag;

        const res = await fetch('/api/scores', {
          method: 'GET',
          headers,
          cache: 'no-store',
        });

        if (res.status === 304) return; // no changes
        if (!res.ok) return; // ignore transient errors

        etag = res.headers.get('etag');

        const json = await res.json();
        if (!alive || !json?.data?.scores) return;

        setScores((prev) => {
          const next = { ...prev };
          for (const [game, row] of Object.entries(
            json.data.scores as Record<
              string,
              { white: number; blue: number; gold: number }
            >,
          )) {
            next[game] = {
              white: row.white ?? 0,
              blue: row.blue ?? 0,
              gold: row.gold ?? 0,
            };
          }
          return next;
        });
      } catch (error: unknown) {
        console.error('Failed to fetch scores', error);
      }
    };

    // initial fetch + interval polling
    pull();
    const id = setInterval(pull, 1500); // 1.5 seconds

    // optional: refresh when tab gains focus for snappier UX
    const onFocus = () => pull();
    window.addEventListener('focus', onFocus);

    return () => {
      alive = false;
      clearInterval(id);
      window.removeEventListener('focus', onFocus);
    };
  }, []);

  const totals = useMemo(() => {
    const t: Record<TeamKey, number> = { white: 0, blue: 0, gold: 0 };
    for (const g of ALL_GAMES) {
      t.white += scores[g]?.white ?? 0;
      t.blue += scores[g]?.blue ?? 0;
      t.gold += scores[g]?.gold ?? 0;
    }
    return t;
  }, [scores]);

  const leaderboard = useMemo(() => {
    return TEAMS.map((t) => ({
      team: t.key,
      name: t.name,
      total: totals[t.key],
    }))
      .sort((a, b) => b.total - a.total)
      .map((row, idx) => ({ ...row, place: idx + 1 }));
  }, [totals]);

  const deltas = useRankDeltas(leaderboard);

  const setScore = async (game: string, team: TeamKey, value: number) => {
    if (!isAdmin) return;
    const safeVal = Math.max(0, value || 0);

    // optimistic update
    setScores((prev) => ({
      ...prev,
      [game]: { ...prev[game], [team]: safeVal },
    }));

    const res = await fetch('/api/scores/set', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ game, team, value: safeVal }),
    });

    if (!res.ok) {
      setScores((prev) => ({
        ...prev,
        [game]: { ...prev[game], [team]: prev[game]?.[team] ?? 0 },
      }));
    }
  };

  const bump = (game: string, team: TeamKey, delta: number) => {
    if (!isAdmin) return;
    const cur = scores[game]?.[team] ?? 0;
    setScore(game, team, cur + delta);
  };

  const resetAll = async () => {
    if (!isAdmin) return;

    // optimistic zeroing
    setScores((prev) => {
      const next = { ...prev };
      for (const g of ALL_GAMES) next[g] = { white: 0, blue: 0, gold: 0 };
      return next;
    });

    await fetch('/api/scores/reset', { method: 'PUT' });
  };

  const selectRole = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as 'admin' | 'viewer';

    if (value === 'admin' && !isAuthenticated) {
      setOpenModal(true);
    } else {
      setRole(value);
    }
  };

  if (!hasMounted) return null;

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-[#090e1c] via-[#070b17] to-black text-slate-100">
        <div className="mx-auto max-w-7xl p-6">
          <BackButton />
          <div className="my-12" />
          <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1
                className="bg-gradient-to-r from-fuchsia-400 via-cyan-400 to-emerald-400 bg-clip-text text-4xl font-extrabold tracking-widest text-transparent drop-shadow-[0_0_25px_rgba(34,211,238,0.35)]"
                style={{
                  textShadow:
                    '0 0 18px rgba(34,211,238,0.35), 0 0 6px rgba(217,70,239,0.25)',
                }}
              >
                <Image
                  src={'122nd_logo.svg'}
                  alt="Logo"
                  width={50}
                  height={50}
                  className="mb-2 inline-block"
                />{' '}
                {new Date().getFullYear()} Sport Fest Scoreboard
              </h1>
              <p className="text-xs tracking-widest text-slate-400 uppercase">
                White · Blue · Gold
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {/* Role switcher (demo). Replace with your auth later. */}
              <div className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900/60 px-2 py-1 shadow-[0_0_12px_rgba(2,6,23,0.6)]">
                <span className="text-[11px] tracking-widest text-slate-400 uppercase">
                  Role
                </span>
                <select
                  className="rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-sm text-slate-100 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/30"
                  value={role}
                  onChange={selectRole}
                >
                  <option value="viewer">Viewer Mode</option>
                  <option value="admin">Admin Mode</option>
                </select>
              </div>

              {isAdmin && (
                <>
                  <button
                    onClick={() => setOpenDialog(true)}
                    className="inline-flex items-center justify-center rounded-lg border border-rose-500/60 bg-rose-600/30 px-3 py-1.5 text-sm font-semibold text-rose-200 shadow-[0_0_18px_rgba(244,63,94,0.35)] hover:bg-rose-600/40 active:translate-y-px"
                  >
                    Reset All Scores
                  </button>
                </>
              )}
            </div>
          </header>

          {/* Leaderboard */}
          <section>
            <h2 className="mb-3 text-lg font-bold tracking-widest text-slate-300 uppercase">
              Overall Leaderboard
            </h2>

            <motion.div
              layout
              className="grid grid-cols-1 gap-4 md:grid-cols-3"
              transition={{
                layout: {
                  type: 'spring',
                  stiffness: 600,
                  damping: 35,
                  mass: 0.6,
                },
              }}
            >
              <AnimatePresence>
                {leaderboard.map((row) => (
                  <motion.div
                    key={row.team}
                    layout
                    layoutId={`card-${row.team}`}
                    initial={{ opacity: 0, scale: 0.98, y: 8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{
                      type: 'spring',
                      stiffness: 500,
                      damping: 30,
                      mass: 0.5,
                    }}
                    className="relative rounded-2xl bg-slate-900/60 p-5 shadow-[0_0_24px_rgba(2,6,23,0.6)] ring-1 ring-cyan-500/20"
                  >
                    {/* rank + team */}
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-lg tracking-widest text-slate-400 uppercase">
                        {row.place === 1 ? (
                          <>
                            <span className="text-3xl">🥇</span>1st
                          </>
                        ) : row.place === 2 ? (
                          <>
                            <span className="text-3xl">🥈</span>2nd
                          </>
                        ) : (
                          <>
                            <span className="text-3xl">🥉</span>3rd
                          </>
                        )}
                      </span>

                      <div className="flex items-center gap-2">
                        {/* movement badge */}
                        <AnimatePresence>
                          {!!deltas[row.team] && (
                            <motion.span
                              initial={{
                                y: deltas[row.team] > 0 ? 10 : -10,
                                opacity: 0,
                              }}
                              animate={{ y: 0, opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className={
                                'rounded-full px-2 py-0.5 text-xs font-bold tracking-widest uppercase ' +
                                (deltas[row.team] > 0
                                  ? 'bg-emerald-400/90 text-emerald-950'
                                  : 'bg-rose-400/90 text-rose-950')
                              }
                              title={
                                deltas[row.team] > 0 ? 'Moved up' : 'Moved down'
                              }
                            >
                              {deltas[row.team] > 0 ? '▲' : '▼'}{' '}
                              {Math.abs(deltas[row.team])}
                            </motion.span>
                          )}
                        </AnimatePresence>

                        <TeamPill team={row.team as TeamKey} />
                      </div>
                    </div>

                    {/* total with count-up */}
                    <div
                      className="font-mono text-5xl leading-none font-black tracking-widest text-emerald-300 drop-shadow-[0_0_16px_rgba(16,185,129,0.35)]"
                      style={{
                        textShadow: '0 0 14px rgba(16,185,129,.35)',
                      }}
                    >
                      <AnimatedNumber value={row.total} />
                    </div>

                    <div className="mt-1 text-slate-300">{row.name}</div>

                    {/* subtle flash when the place for this card changes */}
                    <AnimatePresence>
                      {!!deltas[row.team] && (
                        <motion.div
                          key={`flash-${row.team}-${row.place}`}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 0.25 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.4 }}
                          className="pointer-events-none absolute inset-0 rounded-2xl ring-2 ring-cyan-400"
                        />
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          </section>

          {/* Breakdown */}
          <section className="mt-8">
            <h2 className="mb-3 text-lg font-bold tracking-widest text-slate-300 uppercase">
              Breakdown by Game
            </h2>

            {/* Mobile: card list */}
            <div className="sm:hidden">
              <div className="flex flex-col gap-6">
                {GAME_SECTIONS.map((section) => (
                  <div
                    key={section.title}
                    className="overflow-hidden rounded-2xl bg-slate-900/60 shadow-[0_0_24px_rgba(2,6,23,0.6)] ring-1 ring-fuchsia-500/20"
                  >
                    <div className="border-b border-slate-800/80 p-4">
                      <h3 className="text-sm font-bold tracking-widest text-slate-200 uppercase">
                        {section.title}
                      </h3>
                    </div>

                    <ul className="space-y-3 p-3 sm:p-4">
                      {section.games.map((g) => {
                        const row = scores[g] ?? { white: 0, blue: 0, gold: 0 };
                        const sum = row.white + row.blue + row.gold;
                        const maxVal = Math.max(row.white, row.blue, row.gold);
                        const leaders = (
                          ['white', 'blue', 'gold'] as TeamKey[]
                        ).filter((k) => row[k] === maxVal && maxVal > 0);

                        return (
                          <li
                            key={g}
                            className="rounded-xl border border-slate-800 bg-slate-900/40 p-3"
                          >
                            {/* Header: title + leaders */}
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <div className="font-medium break-words text-slate-100">
                                  {g}
                                </div>
                              </div>
                              <div className="text-center">
                                {leaders.length === 0 ? (
                                  <span className="text-slate-500">–</span>
                                ) : (
                                  <div className="flex items-center justify-center gap-1">
                                    {
                                      leaders.map((t) => (
                                        <>
                                          <span className="text-lg">🥇</span>
                                          <TeamPill key={t} team={t} compact />
                                        </>
                                      ))[0]
                                    }
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Team scores */}
                            <div className="mt-3 grid grid-cols-1 gap-2">
                              {TEAMS.map((t) => (
                                <div
                                  key={t.key}
                                  className="flex h-[45px] items-center justify-between rounded-lg bg-slate-900/60 px-2 py-2 ring-1 ring-slate-800"
                                >
                                  <div className="flex justify-center">
                                    <TeamPill team={t.key} compact />
                                  </div>

                                  {isAdmin ? (
                                    <div className="flex items-center justify-center gap-1.5">
                                      <button
                                        className="h-8 w-8 rounded-md border border-cyan-500/40 bg-slate-950 text-lg leading-none text-cyan-200 shadow-[0_0_12px_rgba(34,211,238,0.25)] select-none hover:bg-slate-900 focus:ring-2 focus:ring-cyan-500/30 focus:outline-none"
                                        onClick={() => bump(g, t.key, -1)}
                                        aria-label={`Decrement ${t.name} score for ${g}`}
                                      >
                                        −
                                      </button>
                                      <input
                                        type="number"
                                        inputMode="numeric"
                                        min={0}
                                        value={row[t.key] ?? 0}
                                        onChange={(e) =>
                                          setScore(
                                            g,
                                            t.key,
                                            Number(e.target.value),
                                          )
                                        }
                                        className="h-9 w-16 rounded-md border border-slate-700 bg-slate-950 px-2 text-center text-sm text-emerald-300 shadow-[0_0_12px_rgba(2,6,23,0.6)] focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/30 focus:outline-none"
                                      />
                                      <button
                                        className="h-8 w-8 rounded-md border border-cyan-500/40 bg-slate-950 text-lg leading-none text-cyan-200 shadow-[0_0_12px_rgba(34,211,238,0.25)] select-none hover:bg-slate-900 focus:ring-2 focus:ring-cyan-500/30 focus:outline-none"
                                        onClick={() => bump(g, t.key, +1)}
                                        aria-label={`Increment ${t.name} score for ${g}`}
                                      >
                                        +
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="text-center">
                                      <span className="inline-block rounded-md bg-slate-800/70 px-2 py-1 font-mono text-lg font-bold text-emerald-300 drop-shadow-[0_0_12px_rgba(16,185,129,0.35)]">
                                        {row[t.key] ?? 0}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>

                            {/* Total scores */}
                            <div className="mt-6 flex items-center justify-between">
                              <div className="text-[10px] tracking-widest text-slate-400 uppercase">
                                Total Scores
                              </div>
                              <div className="font-mono text-2xl font-extrabold text-cyan-300 drop-shadow-[0_0_12px_rgba(34,211,238,0.35)]">
                                {sum}
                              </div>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Desktop table */}
            <div className="hidden sm:block">
              <div className="flex flex-col gap-6">
                {GAME_SECTIONS.map((section) => (
                  <div
                    key={section.title}
                    className="overflow-hidden rounded-2xl bg-slate-900/60 shadow-[0_0_24px_rgba(2,6,23,0.6)] ring-1 ring-fuchsia-500/20"
                  >
                    <div className="border-b border-slate-800/80 p-4">
                      <h3 className="text-sm font-bold tracking-widest text-slate-200 uppercase">
                        {section.title}
                      </h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead>
                          <tr className="bg-slate-800/60 text-slate-200">
                            <th className="w-[30%] px-4 py-3 font-semibold tracking-widest uppercase">
                              Game
                            </th>
                            {TEAMS.map((t) => (
                              <th
                                key={t.key}
                                className="px-4 py-3 text-center font-semibold tracking-widest uppercase"
                              >
                                <TeamPill team={t.key} />
                              </th>
                            ))}
                            <th className="px-4 py-3 text-center font-semibold tracking-widest uppercase">
                              Total
                            </th>
                            <th className="px-4 py-3 text-center font-semibold tracking-widest uppercase">
                              Leader
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {section.games.map((g, i) => {
                            const row = scores[g] ?? {
                              white: 0,
                              blue: 0,
                              gold: 0,
                            };
                            const sum = row.white + row.blue + row.gold;
                            const maxVal = Math.max(
                              row.white,
                              row.blue,
                              row.gold,
                            );
                            const leaders = (
                              Object.keys(row) as TeamKey[]
                            ).filter((k) => row[k] === maxVal && maxVal > 0);
                            return (
                              <tr
                                key={g}
                                className={
                                  i % 2 ? 'bg-slate-900/30' : 'bg-slate-900/10'
                                }
                              >
                                <td className="px-4 py-3 font-medium text-slate-100">
                                  {g}
                                </td>
                                {TEAMS.map((t) => (
                                  <td key={t.key} className="px-4 py-3">
                                    {isAdmin ? (
                                      <div className="mx-auto flex max-w-[200px] items-center justify-center gap-2">
                                        <button
                                          className="h-8 w-8 rounded-md border border-cyan-500/40 bg-slate-950 text-lg leading-none text-cyan-200 shadow-[0_0_12px_rgba(34,211,238,0.25)] select-none hover:bg-slate-900 focus:ring-2 focus:ring-cyan-500/30 focus:outline-none"
                                          onClick={() => bump(g, t.key, -1)}
                                          aria-label={`Decrement ${t.name} score for ${g}`}
                                        >
                                          −
                                        </button>
                                        <input
                                          type="number"
                                          inputMode="numeric"
                                          min={0}
                                          value={row[t.key] ?? 0}
                                          onChange={(e) =>
                                            setScore(
                                              g,
                                              t.key,
                                              Number(e.target.value),
                                            )
                                          }
                                          className="h-9 w-24 rounded-md border border-slate-700 bg-slate-950 px-2 text-center text-sm text-emerald-300 shadow-[0_0_12px_rgba(2,6,23,0.6)] focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/30 focus:outline-none"
                                        />
                                        <button
                                          className="h-8 w-8 rounded-md border border-cyan-500/40 bg-slate-950 text-lg leading-none text-cyan-200 shadow-[0_0_12px_rgba(34,211,238,0.25)] select-none hover:bg-slate-900 focus:ring-2 focus:ring-cyan-500/30 focus:outline-none"
                                          onClick={() => bump(g, t.key, +1)}
                                          aria-label={`Increment ${t.name} score for ${g}`}
                                        >
                                          +
                                        </button>
                                      </div>
                                    ) : (
                                      <div className="text-center">
                                        <span className="inline-block rounded-md bg-slate-800/70 px-2 py-1 font-mono text-lg font-bold text-emerald-300 drop-shadow-[0_0_12px_rgba(16,185,129,0.35)]">
                                          {row[t.key] ?? 0}
                                        </span>
                                      </div>
                                    )}
                                  </td>
                                ))}
                                <td className="px-4 py-3 text-center font-mono text-base font-bold text-cyan-300 drop-shadow-[0_0_12px_rgba(34,211,238,0.35)]">
                                  {sum}
                                </td>
                                <td className="px-4 py-3 text-center">
                                  {leaders.length === 0 ? (
                                    <span className="text-slate-500">–</span>
                                  ) : (
                                    <div className="flex items-center justify-center gap-1">
                                      {
                                        leaders.map((t) => (
                                          <>
                                            <span className="text-lg">🥇</span>
                                            <TeamPill
                                              key={t}
                                              team={t}
                                              compact
                                            />
                                          </>
                                        ))[0]
                                      }
                                    </div>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Footer note */}
          <div className="mt-10 flex flex-col items-center gap-1 text-center text-xs tracking-widest text-slate-400 uppercase">
            {isAdmin ? (
              <p className="text-amber-300 drop-shadow-[0_0_10px_rgba(251,191,36,0.35)]">
                Admin mode: editing enabled.
              </p>
            ) : (
              <p>Viewer mode: read-only.</p>
            )}
          </div>
        </div>
      </div>

      {/* Login modal */}
      <LoginModal
        isOpen={openModal}
        onClose={() => setOpenModal(false)}
        onLoginSuccess={() => {
          setIsAuthenticated(true);
          window.dispatchEvent(new Event('auth:changed'));
          setRole('admin');
        }}
      />

      {/* Confirmation dialog */}
      <Dialog
        isOpen={openDialog}
        onClose={() => setOpenDialog(false)}
        title="Reset Scores"
        description="Are you sure you want to reset all scores to zero?"
        onConfirm={resetAll}
      />
    </>
  );
};

export default Sports;
