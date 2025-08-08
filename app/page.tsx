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

// Historical reaction memes (PD/CC-ish museum images)
const REACTIONS = {
  correct: [
    {
      img: "https://upload.wikimedia.org/wikipedia/commons/4/4b/Napoleon_Bonaparte_premier_consul_by_Jean-Auguste-Dominique_Ingres%2C_1804.jpg",
      caption: "Correct. Napoleon approves.",
    },
    {
      img: "https://upload.wikimedia.org/wikipedia/commons/0/0c/Leonardo_da_Vinci_-_Self-Portrait_-_WGA12798.jpg",
      caption: "Leonardo nods in respect.",
    },
    {
      img: "https://upload.wikimedia.org/wikipedia/commons/b/bc/Athena_Giustiniani_Musei_Capitolini_Inv_i_409.jpg",
      caption: "Athena: wisdom recognized.",
    },
  ],
  wrong: [
    {
      img: "https://upload.wikimedia.org/wikipedia/commons/6/6d/Facepalm_statue.jpg",
      caption: "History facepalm.",
    },
    {
      img: "https://upload.wikimedia.org/wikipedia/commons/1/1a/Rembrandt_-_Self-Portrait%2C_1659.jpg",
      caption: "Rembrandt is disappointed.",
    },
    {
      img: "https://upload.wikimedia.org/wikipedia/commons/6/6a/Giotto_-_Scrovegni_-_-38-_-_Kiss_of_Judas.jpg",
      caption: "Betrayed by your brain.",
    },
  ],
};

function pick<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

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

  const [flash, setFlash] = useState<"green" | "red" | null>(null);
  const [shake, setShake] = useState(false);
  const [reaction, setReaction] = useState<{ img: string; caption: string } | null>(null);

  const deck = useMemo(() => {
    const base = hardMode ? [...QUESTION_BANK, ...QUESTION_BANK] : QUESTION_BANK;
    return shuffle(base).map((q, i) => ({ ...q, _idx: `${seed}-${i}` }));
  }, [hardMode, seed]);

  const { time, reset } = useCountdown(ROUND_SECONDS, true);

  useEffect(() => {
    if (time === 0) {
      setBest((b) => {
        const nb = Math.max(b, score);
        try {
          localStorage.setItem("pastfool-best", String(nb));
        } catch {}
        return nb;
      });
    }
  }, [time, score]);

  const current = time > 0 ? deck[index % deck.length] : null;

  const multiplier = streak >= 10 ? 3 : streak >= 5 ? 2 : 1;

  function answer(choice: boolean) {
    if (!current || time === 0) return;
    const correct = current.isTrue === choice;

    if (correct) {
      setScore((s) => s + 1 * multiplier);
      setStreak((st) => st + 1);
      setFlash("green");
      setReaction(pick(REACTIONS.correct));
      setTimeout(() => setFlash(null), 180);
    } else {
      setStreak(0);
      setFlash("red");
      setShake(true);
      setReaction(pick(REACTIONS.wrong));
      setTimeout(() => setFlash(null), 180);
      setTimeout(() => setShake(false), 250);
    }
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
    const text = `I scored ${score} (x${multiplier} streak mult) in "${BRAND.title}"! Can you beat me?`;
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
      {/* tiny keyframes for shake + flash */}
      <style>{`
        @keyframes shake { 10%, 90% { transform: translateX(-1px) } 20%, 80% { transform: translateX(2px) } 30%, 50%, 70% { transform: translateX(-4px) } 40%, 60% { transform: translateX(4px) } }
        .shake { animation: shake 0.25s linear; }
        .flash-green { box-shadow: 0 0 0 3px rgba(16,185,129,.6) inset; }
        .flash-red { box-shadow: 0 0 0 3px rgba(239,68,68,.6) inset; }
        .glow { box-shadow: 0 0 40px rgba(251,191,36,.3); }
      `}</style>

      <div className="max-w-md w-full space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">{BRAND.title}</h1>
            <p className="text-sm text-neutral-300">{BRAND.tagline}</p>
          </div>
          <div className="flex gap-2 items-center">
            <button
              onClick={restart}
              className="px-3 py-2 text-xs rounded-lg bg-white/10 hover:bg-white/20"
              title="Restart"
            >
              Restart
            </button>
            <a href={BRAND.tiktok} target="_blank" rel="noreferrer">
