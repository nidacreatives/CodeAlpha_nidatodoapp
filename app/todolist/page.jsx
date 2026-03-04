"use client";

import { useState, useEffect, useRef, useCallback } from "react";

const C = {
  green: "#08cb00",
  forest: "#253900",
  black: "#000000",
  light: "#eeeeee",
};
const PRIORITIES = { high: "🔴", medium: "🟡", low: "🟢" };
const PRIORITY_COLORS = {
  high: "rgba(220,50,50,0.3)",
  medium: "rgba(200,160,0,0.25)",
  low: "rgba(8,203,0,0.2)",
};
const CATEGORIES = [
  "💼 Work",
  "🏠 Home",
  "📚 Study",
  "❤️ Health",
  "⭐ Personal",
];

function LightningBolt({ style }) {
  return (
    <svg
      viewBox="0 0 24 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ position: "absolute", ...style, pointerEvents: "none" }}
    >
      <polyline
        points="14,2 6,28 12,28 10,58 18,22 12,22"
        stroke="#08cb00"
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        fill="rgba(8,203,0,0.08)"
        style={{ animation: "bolt-flash 0.18s ease-in-out" }}
      />
    </svg>
  );
}

export default function TodoPage() {
  const [todos, setTodos] = useState([
    {
      id: 1,
      text: "Set up Next.js project",
      done: true,
      priority: "high",
      category: "💼 Work",
      createdAt: Date.now() - 86400000,
      dueDate: "",
    },
    {
      id: 2,
      text: "Design UI with color theme",
      done: true,
      priority: "medium",
      category: "📚 Study",
      createdAt: Date.now() - 43200000,
      dueDate: "",
    },
    {
      id: 3,
      text: "Deploy to Vercel",
      done: false,
      priority: "high",
      category: "💼 Work",
      createdAt: Date.now(),
      dueDate: "",
    },
    {
      id: 4,
      text: "Morning workout",
      done: false,
      priority: "low",
      category: "❤️ Health",
      createdAt: Date.now(),
      dueDate: "",
    },
  ]);
  const [input, setInput] = useState("");
  const [priority, setPriority] = useState("medium");
  const [category, setCategory] = useState("⭐ Personal");
  const [dueDate, setDueDate] = useState("");
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState("");
  const [showCeleb, setShowCeleb] = useState(false);
  const [celebTask, setCelebTask] = useState("");
  const [confetti, setConfetti] = useState([]);
  const [bolts, setBolts] = useState([]);
  const [particles, setParticles] = useState([]);
  const [mounted, setMounted] = useState(false);
  const [darkPulse, setDarkPulse] = useState(false);
  const inputRef = useRef(null);
  const celebTimer = useRef(null);

  useEffect(() => {
    setMounted(true);
    setParticles(
      Array.from({ length: 22 }, (_, i) => ({
        id: i,
        size: Math.random() * 5 + 2,
        left: Math.random() * 100,
        delay: Math.random() * 10,
        dur: Math.random() * 14 + 10,
        op: Math.random() * 0.14 + 0.04,
      })),
    );
    const spawnBolt = () => {
      setBolts(
        Array.from({ length: Math.floor(Math.random() * 3) + 1 }, (_, i) => ({
          id: Date.now() + i,
          left: Math.random() * 88 + 4,
          top: Math.random() * 55,
          size: Math.random() * 40 + 18,
          height: Math.random() * 80 + 60,
        })),
      );
      setDarkPulse(true);
      setTimeout(() => {
        setBolts([]);
        setDarkPulse(false);
      }, 200);
    };
    let tid;
    const schedule = () => {
      tid = setTimeout(
        () => {
          spawnBolt();
          schedule();
        },
        Math.random() * 4000 + 2000,
      );
    };
    schedule();
    return () => clearTimeout(tid);
  }, []);

  const triggerCelebration = useCallback((text) => {
    setCelebTask(text);
    setShowCeleb(true);
    setConfetti(
      Array.from({ length: 60 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        color: [
          "#08cb00",
          "#00ff00",
          "#7fff00",
          "#eeeeee",
          "#adff2f",
          "#39ff14",
        ][Math.floor(Math.random() * 6)],
        delay: Math.random() * 1.2,
        size: Math.random() * 10 + 6,
        rotation: Math.random() * 360,
      })),
    );
    if (celebTimer.current) clearTimeout(celebTimer.current);
    celebTimer.current = setTimeout(() => {
      setShowCeleb(false);
      setConfetti([]);
    }, 4500);
  }, []);

  const addTodo = () => {
    const t = input.trim();
    if (!t) return;
    setTodos((p) => [
      {
        id: Date.now(),
        text: t,
        done: false,
        priority,
        category,
        dueDate,
        createdAt: Date.now(),
      },
      ...p,
    ]);
    setInput("");
    setDueDate("");
    inputRef.current?.focus();
  };

  const toggleTodo = (id) => {
    setTodos((p) =>
      p.map((t) => {
        if (t.id !== id) return t;
        if (!t.done) triggerCelebration(t.text);
        return { ...t, done: !t.done };
      }),
    );
  };

  const deleteTodo = (id) => setTodos((p) => p.filter((t) => t.id !== id));
  const saveEdit = (id) => {
    setTodos((p) =>
      p.map((t) =>
        t.id === id ? { ...t, text: editText.trim() || t.text } : t,
      ),
    );
    setEditId(null);
  };
  const clearDone = () => setTodos((p) => p.filter((t) => !t.done));

  const filtered = todos
    .filter((t) =>
      filter === "active" ? !t.done : filter === "done" ? t.done : true,
    )
    .filter(
      (t) =>
        t.text.toLowerCase().includes(search.toLowerCase()) ||
        t.category.toLowerCase().includes(search.toLowerCase()),
    )
    .sort((a, b) => {
      if (sortBy === "newest") return b.createdAt - a.createdAt;
      if (sortBy === "oldest") return a.createdAt - b.createdAt;
      if (sortBy === "priority")
        return (
          { high: 0, medium: 1, low: 2 }[a.priority] -
          { high: 0, medium: 1, low: 2 }[b.priority]
        );
      if (sortBy === "alpha") return a.text.localeCompare(b.text);
      return 0;
    });

  const doneCount = todos.filter((t) => t.done).length;
  const activeCount = todos.filter((t) => !t.done).length;
  const progress = todos.length
    ? Math.round((doneCount / todos.length) * 100)
    : 0;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: #000; }
        ::-webkit-scrollbar-thumb { background: #253900; border-radius: 3px; }
        body { font-family: 'Rajdhani', sans-serif; background: #000; color: #eee; min-height: 100vh; overflow-x: hidden; }

        /* BG */
        .bg { position: fixed; inset: 0; z-index: 0; overflow: hidden;
          background: radial-gradient(ellipse at 15% 85%, rgba(37,57,0,0.65) 0%, transparent 60%),
                      radial-gradient(ellipse at 85% 15%, rgba(8,203,0,0.07) 0%, transparent 55%), #000;
          transition: background 0.1s; }
        .bg.pulse { background: radial-gradient(ellipse at 50% 50%, rgba(8,203,0,0.06) 0%, transparent 80%), #000; }
        .grid { position: absolute; inset: 0;
          background-image: linear-gradient(rgba(8,203,0,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(8,203,0,0.04) 1px, transparent 1px);
          background-size: 50px 50px; animation: grid-drift 28s linear infinite; }
        @keyframes grid-drift { to { transform: translateY(50px); } }
        .scanline { position: absolute; inset: 0; pointer-events: none;
          background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(8,203,0,0.013) 2px, rgba(8,203,0,0.013) 4px); }
        .glow-orb { position: absolute; border-radius: 50%;
          background: radial-gradient(circle, rgba(8,203,0,0.11), transparent 70%);
          animation: orb-pulse 6s ease-in-out infinite; }
        @keyframes orb-pulse { 0%,100% { transform: scale(1); opacity: 0.5; } 50% { transform: scale(1.3); opacity: 1; } }
        .particle { position: absolute; border-radius: 50%; background: #08cb00; animation: float-up linear infinite; bottom: -10px; }
        @keyframes float-up { 0% { transform: translateY(0) scale(1); opacity: var(--op); } 85% { opacity: var(--op); } 100% { transform: translateY(-105vh) scale(0.2); opacity: 0; } }
        @keyframes bolt-flash {
          0%   { opacity: 0; filter: drop-shadow(0 0 8px #08cb00); }
          30%  { opacity: 1; filter: drop-shadow(0 0 22px #08cb00) drop-shadow(0 0 44px #08cb00); }
          60%  { opacity: 0.6; }
          100% { opacity: 0; }
        }

        /* PAGE */
        .page { position: relative; z-index: 1; min-height: 100vh; display: flex; flex-direction: column; align-items: center; padding: 40px 16px 100px; }

        /* HEADER */
        .header { text-align: center; margin-bottom: 32px; animation: slide-down 0.8s cubic-bezier(0.22,1,0.36,1) both; }
        @keyframes slide-down { from { opacity: 0; transform: translateY(-28px); } to { opacity: 1; transform: translateY(0); } }
        .badge { display: inline-block; font-family: 'Orbitron', monospace; font-size: 10px; letter-spacing: 0.22em; text-transform: uppercase; color: #08cb00; border: 1px solid rgba(8,203,0,0.3); border-radius: 100px; padding: 5px 16px; margin-bottom: 14px; background: rgba(8,203,0,0.06); box-shadow: 0 0 12px rgba(8,203,0,0.1); }
        h1 { font-family: 'Orbitron', monospace; font-size: clamp(2.2rem, 7vw, 4rem); font-weight: 900; letter-spacing: -0.02em; line-height: 1; color: #eee; text-shadow: 0 0 40px rgba(8,203,0,0.3); }
        h1 .accent { color: #08cb00; text-shadow: 0 0 20px #08cb00, 0 0 40px #08cb00; }
        .byline { margin-top: 10px; font-size: 0.85rem; letter-spacing: 0.2em; text-transform: uppercase; color: rgba(8,203,0,0.5); }
        .byline span { color: #08cb00; font-weight: 700; font-size: 0.95rem; }

        /* STATS */
        .stats-row { display: flex; gap: 10px; margin-bottom: 18px; width: 100%; max-width: 600px; animation: fade-up 0.6s 0.2s both; }
        @keyframes fade-up { from { opacity: 0; transform: translateY(28px); } to { opacity: 1; transform: translateY(0); } }
        .stat-chip { flex: 1; text-align: center; padding: 10px 6px; background: rgba(37,57,0,0.4); border: 1px solid rgba(8,203,0,0.18); border-radius: 12px; font-family: 'Orbitron', monospace; }
        .stat-num { font-size: 1.35rem; font-weight: 700; color: #08cb00; display: block; }
        .stat-lbl { font-size: 0.62rem; letter-spacing: 0.1em; color: rgba(238,238,238,0.35); text-transform: uppercase; }

        /* CARD */
        .card { width: 100%; max-width: 600px; background: rgba(0,0,0,0.72); border: 1px solid rgba(8,203,0,0.2); border-radius: 24px; backdrop-filter: blur(24px); box-shadow: 0 0 0 1px rgba(8,203,0,0.04) inset, 0 32px 80px rgba(0,0,0,0.6), 0 0 60px rgba(8,203,0,0.06); padding: 28px; animation: fade-up 0.8s 0.3s cubic-bezier(0.22,1,0.36,1) both; }

        /* PROGRESS */
        .prog-wrap { margin-bottom: 22px; }
        .prog-hdr { display: flex; justify-content: space-between; margin-bottom: 8px; }
        .prog-label { font-size: 0.75rem; letter-spacing: 0.1em; text-transform: uppercase; color: rgba(238,238,238,0.35); }
        .prog-pct { font-family: 'Orbitron', monospace; font-size: 0.88rem; color: #08cb00; font-weight: 700; }
        .prog-track { height: 8px; background: rgba(37,57,0,0.5); border-radius: 100px; overflow: hidden; border: 1px solid rgba(8,203,0,0.12); }
        .prog-fill { height: 100%; background: linear-gradient(90deg, #253900, #08cb00); border-radius: 100px; transition: width 0.7s cubic-bezier(0.34,1.56,0.64,1); box-shadow: 0 0 10px #08cb00, 0 0 20px rgba(8,203,0,0.35); position: relative; }
        .prog-fill::after { content: ''; position: absolute; right: -1px; top: 50%; transform: translateY(-50%); width: 12px; height: 12px; border-radius: 50%; background: #08cb00; box-shadow: 0 0 8px #08cb00; }

        /* SEARCH */
        .search-row { margin-bottom: 14px; position: relative; }
        .search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); opacity: 0.4; font-size: 13px; }
        .search-input { width: 100%; background: rgba(37,57,0,0.22); border: 1px solid rgba(8,203,0,0.18); border-radius: 12px; padding: 11px 14px 11px 38px; font-family: 'Rajdhani', sans-serif; font-size: 0.95rem; color: #eee; outline: none; transition: border-color 0.2s, box-shadow 0.2s; }
        .search-input::placeholder { color: rgba(238,238,238,0.22); }
        .search-input:focus { border-color: rgba(8,203,0,0.5); box-shadow: 0 0 0 3px rgba(8,203,0,0.07), 0 0 16px rgba(8,203,0,0.08); }

        /* ADD FORM */
        .add-section { margin-bottom: 18px; }
        .input-row { display: flex; gap: 8px; margin-bottom: 10px; }
        .todo-input { flex: 1; background: rgba(37,57,0,0.28); border: 1px solid rgba(8,203,0,0.22); border-radius: 12px; padding: 12px 16px; font-family: 'Rajdhani', sans-serif; font-size: 0.98rem; color: #eee; outline: none; transition: border-color 0.2s, box-shadow 0.2s; }
        .todo-input::placeholder { color: rgba(238,238,238,0.22); }
        .todo-input:focus { border-color: #08cb00; box-shadow: 0 0 0 3px rgba(8,203,0,0.1), 0 0 18px rgba(8,203,0,0.07); }
        .add-btn { background: linear-gradient(135deg, #253900, #08cb00); border: none; border-radius: 12px; padding: 12px 22px; color: #000; font-family: 'Orbitron', monospace; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.05em; cursor: pointer; transition: transform 0.15s, box-shadow 0.2s; box-shadow: 0 4px 16px rgba(8,203,0,0.25); white-space: nowrap; }
        .add-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(8,203,0,0.4), 0 0 28px rgba(8,203,0,0.18); }
        .add-btn:active { transform: scale(0.96); }
        .meta-row { display: flex; gap: 8px; flex-wrap: wrap; }
        .meta-select { flex: 1; min-width: 100px; background: rgba(37,57,0,0.22); border: 1px solid rgba(8,203,0,0.16); border-radius: 10px; padding: 8px 10px; font-family: 'Rajdhani', sans-serif; font-size: 0.88rem; color: #eee; outline: none; cursor: pointer; }
        .meta-select option { background: #0a1a00; }
        .due-input { flex: 1; min-width: 120px; background: rgba(37,57,0,0.22); border: 1px solid rgba(8,203,0,0.16); border-radius: 10px; padding: 8px 10px; font-family: 'Rajdhani', sans-serif; font-size: 0.88rem; color: #eee; outline: none; color-scheme: dark; }

        /* TOOLBAR */
        .toolbar { display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap; }
        .filter-btn { flex: 1; min-width: 56px; padding: 8px 6px; background: transparent; border: 1px solid rgba(8,203,0,0.16); border-radius: 10px; color: rgba(238,238,238,0.38); font-family: 'Rajdhani', sans-serif; font-size: 0.78rem; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; cursor: pointer; transition: all 0.2s; }
        .filter-btn.active { background: rgba(8,203,0,0.14); border-color: #08cb00; color: #08cb00; box-shadow: 0 0 10px rgba(8,203,0,0.12); }
        .filter-btn:hover:not(.active) { color: rgba(238,238,238,0.65); border-color: rgba(8,203,0,0.32); }
        .sort-select { background: rgba(37,57,0,0.22); border: 1px solid rgba(8,203,0,0.16); border-radius: 10px; padding: 8px 10px; font-family: 'Rajdhani', sans-serif; font-size: 0.78rem; color: rgba(238,238,238,0.55); outline: none; cursor: pointer; }
        .sort-select option { background: #0a1a00; }
        .clear-btn { padding: 8px 12px; background: rgba(100,20,20,0.28); border: 1px solid rgba(200,50,50,0.22); border-radius: 10px; font-family: 'Rajdhani', sans-serif; font-size: 0.78rem; color: rgba(220,100,100,0.7); cursor: pointer; transition: all 0.2s; white-space: nowrap; }
        .clear-btn:hover { background: rgba(200,50,50,0.18); color: #e07070; }

        /* DIVIDER */
        .divider { display: flex; align-items: center; gap: 10px; margin: 14px 0 12px; color: rgba(238,238,238,0.2); font-size: 0.7rem; letter-spacing: 0.12em; text-transform: uppercase; }
        .divider::before, .divider::after { content: ''; flex: 1; height: 1px; background: rgba(8,203,0,0.1); }

        /* TODO LIST */
        .todo-list { display: flex; flex-direction: column; gap: 8px; min-height: 60px; }
        .todo-item { display: flex; align-items: flex-start; gap: 12px; padding: 14px 16px; background: rgba(8,203,0,0.025); border: 1px solid rgba(8,203,0,0.1); border-radius: 14px; transition: all 0.22s; animation: item-in 0.38s cubic-bezier(0.22,1,0.36,1) both; position: relative; overflow: hidden; }
        .todo-item::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 3px; background: var(--pc, rgba(8,203,0,0.4)); border-radius: 3px 0 0 3px; }
        @keyframes item-in { from { opacity: 0; transform: translateX(-18px); } to { opacity: 1; transform: translateX(0); } }
        .todo-item:hover { background: rgba(8,203,0,0.055); border-color: rgba(8,203,0,0.22); transform: translateX(2px); }
        .todo-item.done { opacity: 0.48; }

        .check-btn { width: 24px; height: 24px; flex-shrink: 0; border-radius: 50%; border: 2px solid rgba(8,203,0,0.45); background: transparent; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; margin-top: 1px; }
        .check-btn.checked { background: #08cb00; border-color: #08cb00; box-shadow: 0 0 10px #08cb00, 0 0 22px rgba(8,203,0,0.3); }
        .check-btn:hover { transform: scale(1.14); box-shadow: 0 0 10px rgba(8,203,0,0.28); }
        .check-icon { width: 12px; height: 12px; stroke: #000; stroke-width: 3; fill: none; stroke-linecap: round; stroke-linejoin: round; opacity: 0; transition: opacity 0.18s; }
        .check-btn.checked .check-icon { opacity: 1; }

        .todo-body { flex: 1; min-width: 0; }
        .todo-meta { display: flex; gap: 5px; align-items: center; flex-wrap: wrap; margin-bottom: 4px; }
        .cat-badge { font-size: 0.68rem; padding: 2px 7px; background: rgba(37,57,0,0.55); border: 1px solid rgba(8,203,0,0.18); border-radius: 100px; color: rgba(238,238,238,0.55); white-space: nowrap; }
        .pri-badge { font-size: 0.7rem; }
        .due-badge { font-size: 0.68rem; color: rgba(238,238,238,0.32); }
        .todo-text { font-size: 1rem; color: #eee; line-height: 1.4; word-break: break-word; transition: all 0.2s; font-weight: 500; }
        .todo-item.done .todo-text { text-decoration: line-through; color: rgba(238,238,238,0.28); }
        .todo-time { font-size: 0.65rem; color: rgba(238,238,238,0.18); margin-top: 4px; }
        .edit-input { width: 100%; background: rgba(37,57,0,0.4); border: 1px solid #08cb00; border-radius: 8px; padding: 6px 10px; font-family: 'Rajdhani', sans-serif; font-size: 1rem; color: #eee; outline: none; }

        .todo-actions { display: flex; flex-direction: column; gap: 4px; opacity: 0; transition: opacity 0.2s; }
        .todo-item:hover .todo-actions { opacity: 1; }
        .act-btn { background: transparent; border: none; padding: 3px; cursor: pointer; color: rgba(238,238,238,0.32); font-size: 13px; transition: color 0.2s, transform 0.15s; display: flex; align-items: center; justify-content: center; }
        .act-btn:hover { transform: scale(1.2); }
        .act-btn.edit:hover { color: #08cb00; }
        .act-btn.del:hover  { color: #e07070; }

        /* EMPTY */
        .empty { text-align: center; padding: 36px 0 20px; color: rgba(238,238,238,0.22); }
        .empty-icon { font-size: 2.4rem; display: block; margin-bottom: 10px; }

        /* FOOTER */
        .card-footer { margin-top: 16px; text-align: center; font-size: 0.7rem; color: rgba(238,238,238,0.16); letter-spacing: 0.06em; }

        /* CELEBRATION */
        .celeb-overlay { position: fixed; inset: 0; z-index: 1000; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.65); backdrop-filter: blur(5px); animation: ov-in 0.3s ease both; }
        @keyframes ov-in { from { opacity: 0; } to { opacity: 1; } }
        .celeb-confetti-item { position: absolute; border-radius: 2px; animation: conf-fall 2.4s cubic-bezier(0.25,0.46,0.45,0.94) forwards; opacity: 0; }
        @keyframes conf-fall { 0% { transform: translateY(0) rotate(var(--r)); opacity: 1; } 85% { opacity: 1; } 100% { transform: translateY(calc(100vh + 50px)) rotate(calc(var(--r) + 720deg)); opacity: 0; } }
        .celeb-box { position: relative; background: linear-gradient(135deg, rgba(0,0,0,0.96), rgba(37,57,0,0.96)); border: 2px solid #08cb00; border-radius: 24px; padding: 44px 40px 36px; text-align: center; max-width: 380px; width: 90%; box-shadow: 0 0 60px rgba(8,203,0,0.4), 0 0 120px rgba(8,203,0,0.14); animation: box-pop 0.5s cubic-bezier(0.34,1.56,0.64,1) both; }
        @keyframes box-pop { from { opacity: 0; transform: scale(0.55) translateY(24px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        .celeb-glow { position: absolute; inset: -2px; border-radius: 26px; pointer-events: none; animation: glow-pulse 1s ease-in-out infinite alternate; }
        @keyframes glow-pulse { from { box-shadow: 0 0 20px #08cb00, 0 0 40px rgba(8,203,0,0.2); } to { box-shadow: 0 0 40px #08cb00, 0 0 80px rgba(8,203,0,0.4); } }
        .celeb-icon { font-size: 3.6rem; display: block; margin-bottom: 14px; animation: bounce 0.55s ease infinite alternate; }
        @keyframes bounce { from { transform: translateY(0); } to { transform: translateY(-9px); } }
        .celeb-title { font-family: 'Orbitron', monospace; font-size: 1.5rem; font-weight: 900; color: #08cb00; text-shadow: 0 0 20px #08cb00; margin-bottom: 8px; }
        .celeb-task { font-size: 0.95rem; color: rgba(238,238,238,0.6); margin-bottom: 22px; line-height: 1.5; font-style: italic; }
        .celeb-task strong { color: #eee; font-style: normal; }
        .celeb-close { background: linear-gradient(135deg, #253900, #08cb00); border: none; border-radius: 12px; padding: 13px 34px; color: #000; font-family: 'Orbitron', monospace; font-size: 0.76rem; font-weight: 700; letter-spacing: 0.08em; cursor: pointer; transition: transform 0.15s, box-shadow 0.2s; box-shadow: 0 4px 16px rgba(8,203,0,0.3); }
        .celeb-close:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(8,203,0,0.45); }
      `}</style>

      {/* BACKGROUND */}
      <div className={`bg ${darkPulse ? "pulse" : ""}`}>
        <div className="grid" />
        <div className="scanline" />
        <div
          className="glow-orb"
          style={{
            width: 420,
            height: 420,
            left: "-12%",
            top: "60%",
            animationDelay: "0s",
          }}
        />
        <div
          className="glow-orb"
          style={{
            width: 300,
            height: 300,
            right: "-6%",
            top: "8%",
            animationDelay: "3s",
          }}
        />
        {mounted &&
          particles.map((p) => (
            <div
              key={p.id}
              className="particle"
              style={{
                width: p.size,
                height: p.size,
                left: `${p.left}%`,
                animationDelay: `${p.delay}s`,
                animationDuration: `${p.dur}s`,
                "--op": p.op,
                opacity: p.op,
              }}
            />
          ))}
        {bolts.map((b) => (
          <LightningBolt
            key={b.id}
            style={{
              left: `${b.left}%`,
              top: `${b.top}%`,
              width: b.size,
              height: b.height,
            }}
          />
        ))}
      </div>

      {/* PAGE */}
      <div className="page">
        {/* Header */}
        <div className="header">
          <div className="badge">⚡ Task Manager Pro</div>
          <h1>
            TODO
            <br />
            <span className="accent">LIST</span>
          </h1>
          <p className="byline">
            by <span>Nida Batool</span>
          </p>
        </div>

        {/* Stats */}
        <div className="stats-row">
          {[
            { num: todos.length, lbl: "Total" },
            { num: activeCount, lbl: "Active" },
            { num: doneCount, lbl: "Done" },
            { num: `${progress}%`, lbl: "Progress" },
          ].map((s) => (
            <div className="stat-chip" key={s.lbl}>
              <span className="stat-num">{s.num}</span>
              <span className="stat-lbl">{s.lbl}</span>
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="card">
          {/* Progress */}
          <div className="prog-wrap">
            <div className="prog-hdr">
              <span className="prog-label">Overall Progress</span>
              <span className="prog-pct">{progress}%</span>
            </div>
            <div className="prog-track">
              <div className="prog-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>

          {/* Search */}
          <div className="search-row">
            <span className="search-icon">🔍</span>
            <input
              className="search-input"
              placeholder="Search tasks or categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Add */}
          <div className="add-section">
            <div className="input-row">
              <input
                ref={inputRef}
                className="todo-input"
                placeholder="Add a new task..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addTodo()}
              />
              <button className="add-btn" onClick={addTodo}>
                + ADD
              </button>
            </div>
            <div className="meta-row">
              <select
                className="meta-select"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="high">🔴 High</option>
                <option value="medium">🟡 Medium</option>
                <option value="low">🟢 Low</option>
              </select>
              <select
                className="meta-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <input
                className="due-input"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                title="Due date"
              />
            </div>
          </div>

          {/* Toolbar */}
          <div className="toolbar">
            {["all", "active", "done"].map((f) => (
              <button
                key={f}
                className={`filter-btn ${filter === f ? "active" : ""}`}
                onClick={() => setFilter(f)}
              >
                {f}
              </button>
            ))}
            <select
              className="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">↓ Newest</option>
              <option value="oldest">↑ Oldest</option>
              <option value="priority">⚠ Priority</option>
              <option value="alpha">A–Z</option>
            </select>
            {doneCount > 0 && (
              <button className="clear-btn" onClick={clearDone}>
                🗑 Clear done
              </button>
            )}
          </div>

          <div className="divider">Tasks — {filtered.length}</div>

          {/* List */}
          <div className="todo-list">
            {filtered.length === 0 ? (
              <div className="empty">
                <span className="empty-icon">⚡</span>
                <p>
                  {search
                    ? "No matching tasks"
                    : filter === "done"
                      ? "No completed tasks yet"
                      : filter === "active"
                        ? "All tasks done! ⚡"
                        : "Add your first task above"}
                </p>
              </div>
            ) : (
              filtered.map((todo) => (
                <div
                  key={todo.id}
                  className={`todo-item ${todo.done ? "done" : ""}`}
                  style={{ "--pc": PRIORITY_COLORS[todo.priority] }}
                >
                  <button
                    className={`check-btn ${todo.done ? "checked" : ""}`}
                    onClick={() => toggleTodo(todo.id)}
                  >
                    <svg className="check-icon" viewBox="0 0 14 14">
                      <polyline points="2,7 5.5,10.5 12,3.5" />
                    </svg>
                  </button>
                  <div className="todo-body">
                    <div className="todo-meta">
                      <span className="cat-badge">{todo.category}</span>
                      <span className="pri-badge">
                        {PRIORITIES[todo.priority]}
                      </span>
                      {todo.dueDate && (
                        <span className="due-badge">📅 {todo.dueDate}</span>
                      )}
                    </div>
                    {editId === todo.id ? (
                      <input
                        className="edit-input"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveEdit(todo.id);
                          if (e.key === "Escape") setEditId(null);
                        }}
                        autoFocus
                      />
                    ) : (
                      <div className="todo-text">{todo.text}</div>
                    )}
                    <div className="todo-time">
                      {new Date(todo.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                  <div className="todo-actions">
                    {editId === todo.id ? (
                      <button
                        className="act-btn edit"
                        onClick={() => saveEdit(todo.id)}
                        title="Save"
                      >
                        ✓
                      </button>
                    ) : (
                      <button
                        className="act-btn edit"
                        onClick={() => {
                          setEditId(todo.id);
                          setEditText(todo.text);
                        }}
                        title="Edit"
                      >
                        ✎
                      </button>
                    )}
                    <button
                      className="act-btn del"
                      onClick={() => deleteTodo(todo.id)}
                      title="Delete"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="card-footer">
            press enter to add · hover to edit/delete · ⚡ by nida batool
          </div>
        </div>
      </div>

      {/* CELEBRATION POPUP */}
      {showCeleb && (
        <div className="celeb-overlay" onClick={() => setShowCeleb(false)}>
          {confetti.map((c) => (
            <div
              key={c.id}
              className="celeb-confetti-item"
              style={{
                left: `${c.x}%`,
                top: "-20px",
                width: c.size,
                height: c.size * 0.4,
                background: c.color,
                animationDelay: `${c.delay}s`,
                "--r": `${c.rotation}deg`,
              }}
            />
          ))}
          <div className="celeb-box" onClick={(e) => e.stopPropagation()}>
            <div className="celeb-glow" />
            <span className="celeb-icon">🎉</span>
            <div className="celeb-title">TASK COMPLETE!</div>
            <div className="celeb-task">
              Amazing work, Nida!
              <br />
              <strong>"{celebTask}"</strong>
              <br />
              is done! 🚀
            </div>
            <button className="celeb-close" onClick={() => setShowCeleb(false)}>
              ⚡ KEEP GOING
            </button>
          </div>
        </div>
      )}
    </>
  );
}
