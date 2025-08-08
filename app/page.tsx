"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { BRAND } from "./lib/brand";

type Q = {
  id: string;
  statement: string;
  isTrue: boolean;
  blurb: string;
  source?: string;
  _idx?: string;
};

const QUESTION_BANK: Q[] = [
  {
    id: "1",
    statement: "Napoleon was actually taller than average for his time.",
    isTrue: true,
    blurb: "The 'short Napoleon' myth comes from mixed French/English inches.",
    source: "https://www.britannica.com/biography/Napoleon-I",
  },
  {
    id: "2",
    statement: "The Library of Alexandria burned down in a single fire started by Julius Caesar.",
    isTrue: false,
    blurb: "Multiple incidents over centuries; not one epic blaze.",
    source: "https://www.britannica.com/place/Library-of-Alexandria",
  },
  {
    id: "3",
    statement: "Medieval Europeans believed the Earth was flat.",
    isTrue: false,
    blurb: "Scholars knew it was round; the flat-earth trope is modern.",
    source: "https://www.britannica.com/story/what-did-medieval-people-believe-about-the-shape-of-the-earth",
  },
  {
    id: "4",
    statement: "The Great Wall of China is visible from the Moon with the naked eye.",
    isTrue: false,
    blurb: "Cool brag, but nope—needs optics, like most human structures.",
    source: "https://www.nasa.gov/vision/space/workinginspace/great_wall.html",
  },
];

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function useCountdown(seconds: number, isRunning: boolean) {
  const [time, setTime] = useState(seconds);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (!isRunning) return;
    timerRef.current = setInterval(() => setTime((t) => Math.max(0, t - 1)), 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning]);
  const reset = () => setTime(seconds);
  return { time, reset } as const;
}

export default function Page() {
  const ROUND_SECONDS = 60;
  const [hardMode, setHardMode] = useState(false);
  const [seed, setSeed] = useState(0);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState<number>(() => {
    try {
      const v = localStorage.getItem("pastfool-best");
      return v ? Number(v) : 0;
    } catch {
      return 0;
    }
  });
  const [adminOpen, setAdminOpen] = useState(false);

  const deck = useMemo(() => {
    const base = hardMode ? [...QUESTION_BANK, ...QUESTION_BANK] : QUESTION_BANK;
    return shuffle(base).map((q, i) => ({ ...q, _idx: `${seed}-${i}` }));
  }, [hardMode, seed]);

  const { time, reset } = useCountdown(ROUND_SECONDS, true);

  useEffect(() => {
    if (time === 0) {
      setBest((b) => {
        const nb = Math.max(b, score);
        try { localStorage.setItem("pastfool-best", String(nb)); } catch {}
        return nb;
      });
    }
  }, [time, score]);

  const current = time > 0 ? deck[index % deck.length] : null;

  function answer(choice: boolean) {
    if (!current || time === 0) return;
    const correct = current.isTrue === choice;
    setScore((s) => s + (correct ? 1 : 0));
    setStreak((st) => (correct ? st + 1 : 0));
    setIndex((i) => i + 1);
  }

  function restart() {
    setIndex(0);
    setScore(0);
    setStreak(0);
    setSeed((s) => s + 1);
    reset();
  }

  function shareScore() {
    const text = `I scored ${score} in "${BRAND.title}"! Can you beat me?`;
    const url = typeof window !== "undefined" ? window.location.href : "";
    if ((navigator as any).share) {
      (navigator as any).share({ title: BRAND.title, text, url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${text} ${url}`).catch(() => {});
      alert("Copied share text to clipboard!");
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">{BRAND.title}</h1>
            <p className="text-sm text-neutral-300">{BRAND.tagline}</p>
          </div>
          <div className="flex gap-2 items-center">
            <button
              onClick={() => setAdminOpen((v) => !v)}
              className="px-3 py-2 text-xs rounded-lg bg-white/10 hover:bg-white/20"
              title="Admin / content panel"
            >
              Admin
            </button>
            <a href={BRAND.tiktok} target="_blank" rel="noreferrer">
              <button className="px-3 py-2 text-xs rounded-full bg-white text-black hover:opacity-90">
                Follow
              </button>
            </a>
          </div>
        </div>

        {/* Score Row */}
        <div className="grid grid-cols-4 gap-2 text-center text-xs">
          {[
            { label: "seconds", value: time },
            { label: "score", value: score },
            { label: "streak", value: streak },
            { label: "best", value: best },
          ].map((b) => (
            <div key={b.label} className="rounded-xl bg-white/5 p-2">
              <div className="font-bold text-lg">{b.value as any}</div>
              <div className="text-neutral-400">{b.label}</div>
            </div>
          ))}
        </div>

        {/* Ad slot */}
        <div className="w-full h-16 rounded-xl border border-white/10 bg-white/5 backdrop-blur flex items-center justify-center text-xs text-neutral-400">
          Sponsor space
        </div>

        {/* Card */}
        <div className={`rounded-2xl p-1 bg-gradient-to-r ${BRAND.gradient}`}>
          <div className="rounded-2xl bg-neutral-950/90 p-4">
            {time > 0 ? (
              <div className="space-y-4">
                <p className="text-lg leading-tight">{current?.statement}</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => answer(true)}
                    className="h-12 rounded-xl bg-white text-black hover:opacity-90"
                  >
                    ✓ Fact
                  </button>
                  <button
                    onClick={() => answer(false)}
                    className="h-12 rounded-xl bg-white/10 hover:bg-white/20"
                  >
                    ✗ Cap
                  </button>
                </div>
                <div className="flex items-center justify-between text-xs text-neutral-400">
                  <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={hardMode}
                      onChange={(e) => setHardMode(e.target.checked)}
                    />
                    Hard mode
                  </label>
                  <button onClick={restart} className="hover:text-white">Shuffle</button>
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-center">
                <h2 className="text-xl font-bold">Time! Your score: {score}</h2>
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={restart}
                    className="px-4 py-2 rounded-full bg-white text-black hover:opacity-90"
                  >
                    Play again
                  </button>
                  <button
                    onClick={shareScore}
                    className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20"
                  >
                    Share
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {time > 0 && (
          <div className="text-xs text-neutral-300">
            <p className="opacity-80">Tap fast. After the round, you’ll see sources and mini-facts.</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          <a
            href={BRAND.tiktok}
            target="_blank"
            rel="noreferrer"
            className="rounded-xl bg-white/5 p-3 text-center hover:bg-white/10"
          >
            More Past Fool >>
          </a>
          <button onClick={shareScore} className="rounded-xl bg-white/5 p-3 hover:bg-white/10">
            Share my score
          </button>
        </div>

        <div className="w-full h-16 rounded-xl border border-white/10 bg-white/5 backdrop-blur flex items-center justify-center text-xs text-neutral-400">
          Ad space
        </div>

        {/* Admin Panel */}
        {adminOpen && <AdminPanel />}
      </div>
    </div>
  );
}

function AdminPanel() {
  const [json, setJson] = useState<string>("");
  const [status, setStatus] = useState<string>("");

  useEffect(() => {
    setJson(JSON.stringify(QUESTION_BANK, null, 2));
  }, []);

  function download() {
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "past-fool-questions.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="border border-white/10 rounded-xl p-4 space-y-3 bg-white/5">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Admin panel</h3>
        <div className="text-xs text-neutral-300">Import / Export question bank</div>
      </div>
      <div className="grid gap-2">
        <textarea
          value={json}
          onChange={(e) => setJson(e.target.value)}
          className="min-h-40 h-40 p-2 rounded-md bg-black/30 border border-white/10 font-mono text-xs"
        />
        <div className="text-xs text-neutral-300">
          Format: [{{"id, statement, isTrue, blurb, source".toString()}}]
        </div>
        <div className="flex gap-2">
          <button onClick={download} className="px-4 py-2 rounded-full bg-white text-black hover:opacity-90">
            Export JSON
          </button>
          <button
            className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20"
            onClick={() =>
              setStatus("Import replaced at build time. For dynamic import, wire to a backend or localStorage.")
            }
          >
            Import JSON
          </button>
        </div>
        {status && <p className="text-xs text-amber-300">{status}</p>}
        <div className="text-xs text-neutral-400">
          Tip: keep blurbs short and include a reputable source. You can also gate Hard Mode with trickier myths.
        </div>
      </div>
    </div>
  );
}
