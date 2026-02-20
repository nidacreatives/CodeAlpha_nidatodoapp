"use client";

import { useState, useEffect, useRef } from "react";

// ─── Raindrop canvas background ───────────────────────────────────────────────
function RaindropCanvas() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let drops = [];
    let orbs = [];
    let animId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const COLORS = [
      "#F72585",
      "#B5179E",
      "#7209B7",
      "#560BAD",
      "#480CA8",
      "#3A0CA3",
      "#3F37C9",
      "#4361EE",
      "#4895EF",
      "#4CC9F0",
    ];

    // Create raindrops
    for (let i = 0; i < 80; i++) {
      drops.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        len: 10 + Math.random() * 30,
        speed: 1 + Math.random() * 4,
        width: 0.5 + Math.random() * 2,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        alpha: 0.1 + Math.random() * 0.5,
      });
    }

    // Create floating orbs
    for (let i = 0; i < 12; i++) {
      orbs.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        r: 40 + Math.random() * 120,
        dx: (Math.random() - 0.5) * 0.4,
        dy: (Math.random() - 0.5) * 0.4,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw orbs
      orbs.forEach((o) => {
        const grad = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r);
        grad.addColorStop(0, o.color + "44");
        grad.addColorStop(1, o.color + "00");
        ctx.beginPath();
        ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
        o.x += o.dx;
        o.y += o.dy;
        if (o.x < -o.r) o.x = canvas.width + o.r;
        if (o.x > canvas.width + o.r) o.x = -o.r;
        if (o.y < -o.r) o.y = canvas.height + o.r;
        if (o.y > canvas.height + o.r) o.y = -o.r;
      });

      // Draw raindrops
      drops.forEach((d) => {
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x - d.width, d.y + d.len);
        ctx.strokeStyle =
          d.color +
          Math.round(d.alpha * 255)
            .toString(16)
            .padStart(2, "0");
        ctx.lineWidth = d.width;
        ctx.lineCap = "round";
        ctx.stroke();

        // Raindrop splash circle at bottom
        ctx.beginPath();
        ctx.arc(d.x, d.y + d.len, d.width * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = d.color + "55";
        ctx.fill();

        d.y += d.speed;
        if (d.y - d.len > canvas.height) {
          d.y = -d.len;
          d.x = Math.random() * canvas.width;
        }
      });

      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
}

// ─── Congratulations Modal ─────────────────────────────────────────────────────
function CongratsModal({ onClose }) {
  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modalBox} onClick={(e) => e.stopPropagation()}>
        <div style={styles.confettiRow}>
          {["🎉", "✨", "🎊", "💫", "🌟", "🎈", "🏆", "🥳"].map((e, i) => (
            <span
              key={i}
              style={{ ...styles.confetti, animationDelay: `${i * 0.1}s` }}
            >
              {e}
            </span>
          ))}
        </div>
        <h2 style={styles.modalTitle}>TASK CRUSHED!</h2>
        <p style={styles.modalSub}>
          You're absolutely slaying it. Keep going! 🚀
        </p>
        <button style={styles.modalBtn} onClick={onClose}>
          Let's Go! ⚡
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function TodoPage() {
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState("");
  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState("");
  const [filter, setFilter] = useState("all");
  const [showCongrats, setShowCongrats] = useState(false);
  const [mounted, setMounted] = useState(false);
  const inputRef = useRef(null);

  // Load from localStorage
  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem("pr_tasks");
      if (saved) setTasks(JSON.parse(saved));
    } catch {}
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem("pr_tasks", JSON.stringify(tasks));
  }, [tasks, mounted]);

  const addTask = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    setTasks((prev) => [
      {
        id: Date.now(),
        text: trimmed,
        done: false,
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);
    setInput("");
    inputRef.current?.focus();
  };

  const toggleDone = (id) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        if (!t.done) setShowCongrats(true);
        return { ...t, done: !t.done };
      }),
    );
  };

  const deleteTask = (id) =>
    setTasks((prev) => prev.filter((t) => t.id !== id));

  const startEdit = (task) => {
    setEditId(task.id);
    setEditText(task.text);
  };
  const saveEdit = () => {
    setTasks((prev) =>
      prev.map((t) => (t.id === editId ? { ...t, text: editText } : t)),
    );
    setEditId(null);
    setEditText("");
  };

  const clearCompleted = () => setTasks((prev) => prev.filter((t) => !t.done));

  const filtered = tasks.filter((t) => {
    if (filter === "active") return !t.done;
    if (filter === "done") return t.done;
    return true;
  });

  const doneCount = tasks.filter((t) => t.done).length;
  const totalCount = tasks.length;

  return (
    <>
      <style>{CSS}</style>
      <div style={styles.page}>
        <RaindropCanvas />

        {showCongrats && (
          <CongratsModal onClose={() => setShowCongrats(false)} />
        )}

        {/* ── Navbar ── */}
        <nav style={styles.nav}>
          <span style={styles.navLogo}>
            <span style={styles.logoGlyph}>◈</span>
            <span className="logo-text">Purple Raindrops</span>
          </span>
          <div style={styles.navLinks}>
            {["all", "active", "done"].map((f) => (
              <button
                key={f}
                style={{
                  ...styles.navLink,
                  ...(filter === f ? styles.navLinkActive : {}),
                }}
                onClick={() => setFilter(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
                {f === "done" && doneCount > 0 && (
                  <span style={styles.badge}>{doneCount}</span>
                )}
              </button>
            ))}
          </div>
          <button style={styles.clearBtn} onClick={clearCompleted}>
            Clear Done
          </button>
        </nav>

        {/* ── Hero header ── */}
        <header style={styles.header}>
          <h1 className="hero-title" style={styles.heroTitle}>
            {"GET IT DONE".split("").map((ch, i) => (
              <span
                key={i}
                className="hero-char"
                style={{ animationDelay: `${i * 0.06}s` }}
              >
                {ch === " " ? "\u00A0" : ch}
              </span>
            ))}
          </h1>
          <p className="hero-sub" style={styles.heroSub}>
            {totalCount === 0
              ? "Add your first task below ↓"
              : `${doneCount} of ${totalCount} tasks completed`}
          </p>

          {/* Progress bar */}
          {totalCount > 0 && (
            <div style={styles.progressWrap}>
              <div
                style={{
                  ...styles.progressBar,
                  width: `${Math.round((doneCount / totalCount) * 100)}%`,
                }}
              />
              <span style={styles.progressLabel}>
                {Math.round((doneCount / totalCount) * 100)}%
              </span>
            </div>
          )}
        </header>

        {/* ── Add Task ── */}
        <div style={styles.addRow}>
          <input
            ref={inputRef}
            style={styles.addInput}
            value={input}
            placeholder="What needs to get done?"
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTask()}
          />
          <button style={styles.addBtn} onClick={addTask}>
            <span style={styles.plusIcon}>+</span>
            <span>Add Task</span>
          </button>
        </div>

        {/* ── Task List ── */}
        <ul style={styles.list}>
          {filtered.length === 0 && (
            <li style={styles.emptyState}>
              <span style={{ fontSize: 48 }}>🌧️</span>
              <p>No tasks here yet.</p>
            </li>
          )}
          {filtered.map((task, idx) => (
            <li
              key={task.id}
              className="task-card"
              style={{
                ...styles.taskCard,
                animationDelay: `${idx * 0.05}s`,
                opacity: task.done ? 0.6 : 1,
              }}
            >
              {/* Checkbox */}
              <button
                style={{
                  ...styles.checkbox,
                  background: task.done
                    ? "linear-gradient(135deg, #4895EF, #4CC9F0)"
                    : "transparent",
                  borderColor: task.done ? "#4CC9F0" : "#7209B7",
                }}
                onClick={() => toggleDone(task.id)}
                title="Toggle complete"
              >
                {task.done && <span style={styles.checkMark}>✓</span>}
              </button>

              {/* Task text / edit */}
              {editId === task.id ? (
                <input
                  style={styles.editInput}
                  value={editText}
                  autoFocus
                  onChange={(e) => setEditText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveEdit();
                    if (e.key === "Escape") setEditId(null);
                  }}
                />
              ) : (
                <span
                  style={{
                    ...styles.taskText,
                    textDecoration: task.done ? "line-through" : "none",
                    color: task.done ? "#4CC9F0" : "#fff",
                  }}
                >
                  {task.text}
                </span>
              )}

              {/* Actions */}
              <div style={styles.actions}>
                {editId === task.id ? (
                  <button
                    style={styles.saveBtn}
                    onClick={saveEdit}
                    title="Save"
                  >
                    ✔
                  </button>
                ) : (
                  <button
                    style={styles.editBtn}
                    onClick={() => startEdit(task)}
                    title="Edit"
                  >
                    ✎
                  </button>
                )}
                <button
                  style={styles.delBtn}
                  onClick={() => deleteTask(task.id)}
                  title="Delete"
                >
                  ✕
                </button>
              </div>
            </li>
          ))}
        </ul>

        <footer style={styles.footer}>
          Made with 💜 · Purple Raindrops · Tasks persist in your browser
        </footer>
      </div>
    </>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────
const styles = {
  page: {
    minHeight: "100vh",
    background:
      "linear-gradient(135deg, #0a0015 0%, #130030 40%, #0a0020 100%)",
    fontFamily: "'Syne', 'Nunito', sans-serif",
    color: "#fff",
    position: "relative",
    overflowX: "hidden",
  },
  nav: {
    position: "sticky",
    top: 0,
    zIndex: 100,
    display: "flex",
    alignItems: "center",
    gap: 16,
    padding: "14px 32px",
    background: "rgba(10,0,30,0.7)",
    backdropFilter: "blur(20px)",
    borderBottom: "1px solid rgba(114,9,183,0.3)",
    flexWrap: "wrap",
  },
  navLogo: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontWeight: 800,
    fontSize: 20,
    letterSpacing: 1,
    background: "linear-gradient(90deg, #F72585, #7209B7, #4CC9F0)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    marginRight: "auto",
  },
  logoGlyph: {
    fontSize: 24,
    WebkitTextFillColor: "#B5179E",
    animation: "spin 8s linear infinite",
    display: "inline-block",
  },
  navLinks: { display: "flex", gap: 4 },
  navLink: {
    background: "transparent",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "rgba(255,255,255,0.6)",
    padding: "6px 16px",
    borderRadius: 50,
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600,
    transition: "all 0.25s",
    letterSpacing: 0.5,
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  navLinkActive: {
    background: "linear-gradient(135deg, #7209B7, #4361EE)",
    borderColor: "transparent",
    color: "#fff",
    boxShadow: "0 0 18px #7209B760",
  },
  badge: {
    background: "#F72585",
    color: "#fff",
    borderRadius: 50,
    padding: "1px 7px",
    fontSize: 11,
  },
  clearBtn: {
    background: "rgba(247,37,133,0.15)",
    border: "1px solid rgba(247,37,133,0.4)",
    color: "#F72585",
    padding: "6px 16px",
    borderRadius: 50,
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600,
    transition: "all 0.25s",
  },
  header: {
    textAlign: "center",
    padding: "64px 24px 32px",
    position: "relative",
    zIndex: 1,
  },
  heroTitle: {
    fontSize: "clamp(3rem, 8vw, 6rem)",
    fontWeight: 900,
    letterSpacing: "0.12em",
    lineHeight: 1,
    margin: "0 0 16px",
    display: "flex",
    justifyContent: "center",
    flexWrap: "wrap",
    background:
      "linear-gradient(90deg, #F72585 0%, #B5179E 20%, #7209B7 40%, #4361EE 70%, #4CC9F0 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    filter: "drop-shadow(0 0 40px #7209B790)",
  },
  heroSub: {
    fontSize: 16,
    color: "rgba(200,180,255,0.7)",
    letterSpacing: 2,
    marginBottom: 24,
    textTransform: "uppercase",
  },
  progressWrap: {
    maxWidth: 480,
    margin: "0 auto",
    background: "rgba(255,255,255,0.08)",
    borderRadius: 50,
    height: 8,
    position: "relative",
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: 50,
    background: "linear-gradient(90deg, #F72585, #7209B7, #4CC9F0)",
    transition: "width 0.6s cubic-bezier(0.34,1.56,0.64,1)",
    boxShadow: "0 0 16px #4895EF80",
  },
  progressLabel: {
    position: "absolute",
    right: 8,
    top: -20,
    fontSize: 12,
    color: "#4CC9F0",
    fontWeight: 700,
  },
  addRow: {
    display: "flex",
    gap: 12,
    maxWidth: 680,
    margin: "0 auto 40px",
    padding: "0 24px",
    position: "relative",
    zIndex: 1,
  },
  addInput: {
    flex: 1,
    padding: "16px 24px",
    background: "rgba(255,255,255,0.06)",
    border: "1.5px solid rgba(114,9,183,0.5)",
    borderRadius: 16,
    color: "#fff",
    fontSize: 16,
    outline: "none",
    fontFamily: "inherit",
    backdropFilter: "blur(10px)",
    transition: "border-color 0.3s, box-shadow 0.3s",
  },
  addBtn: {
    padding: "16px 28px",
    background: "linear-gradient(135deg, #7209B7, #4361EE)",
    border: "none",
    borderRadius: 16,
    color: "#fff",
    fontSize: 16,
    fontWeight: 700,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 8,
    boxShadow: "0 0 30px #7209B750",
    transition: "all 0.25s",
    whiteSpace: "nowrap",
    fontFamily: "inherit",
  },
  plusIcon: {
    fontSize: 22,
    fontWeight: 300,
    lineHeight: 1,
  },
  list: {
    listStyle: "none",
    maxWidth: 680,
    margin: "0 auto",
    padding: "0 24px 40px",
    display: "flex",
    flexDirection: "column",
    gap: 12,
    position: "relative",
    zIndex: 1,
  },
  emptyState: {
    textAlign: "center",
    padding: "48px 0",
    color: "rgba(200,180,255,0.4)",
    fontSize: 16,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 12,
  },
  taskCard: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    padding: "16px 20px",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(114,9,183,0.25)",
    borderRadius: 16,
    backdropFilter: "blur(12px)",
    transition: "transform 0.2s, box-shadow 0.2s",
    animation: "slideIn 0.35s both",
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    border: "2px solid",
    cursor: "pointer",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.25s",
    boxShadow: "0 0 12px #7209B740",
  },
  checkMark: { color: "#fff", fontWeight: 900, fontSize: 14 },
  taskText: {
    flex: 1,
    fontSize: 15,
    fontWeight: 500,
    lineHeight: 1.5,
    transition: "color 0.3s",
  },
  editInput: {
    flex: 1,
    padding: "6px 12px",
    background: "rgba(255,255,255,0.1)",
    border: "1px solid #4361EE",
    borderRadius: 8,
    color: "#fff",
    fontSize: 15,
    outline: "none",
    fontFamily: "inherit",
  },
  actions: { display: "flex", gap: 6, flexShrink: 0 },
  editBtn: {
    background: "rgba(67,97,238,0.2)",
    border: "1px solid rgba(67,97,238,0.5)",
    color: "#4895EF",
    width: 32,
    height: 32,
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 16,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s",
  },
  saveBtn: {
    background: "rgba(76,201,240,0.2)",
    border: "1px solid rgba(76,201,240,0.5)",
    color: "#4CC9F0",
    width: 32,
    height: 32,
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 14,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s",
  },
  delBtn: {
    background: "rgba(247,37,133,0.15)",
    border: "1px solid rgba(247,37,133,0.4)",
    color: "#F72585",
    width: 32,
    height: 32,
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 13,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s",
  },
  footer: {
    textAlign: "center",
    padding: "24px",
    color: "rgba(200,180,255,0.3)",
    fontSize: 13,
    letterSpacing: 1,
    position: "relative",
    zIndex: 1,
  },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    zIndex: 999,
    background: "rgba(0,0,10,0.8)",
    backdropFilter: "blur(8px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  modalBox: {
    background:
      "linear-gradient(135deg, rgba(114,9,183,0.3), rgba(67,97,238,0.3))",
    border: "1px solid rgba(76,201,240,0.4)",
    borderRadius: 24,
    padding: "48px 40px",
    textAlign: "center",
    maxWidth: 400,
    backdropFilter: "blur(20px)",
    boxShadow: "0 0 80px #7209B760, 0 0 40px #4361EE40",
    animation: "popIn 0.4s cubic-bezier(0.34,1.56,0.64,1)",
  },
  confettiRow: {
    display: "flex",
    justifyContent: "center",
    gap: 8,
    marginBottom: 20,
    flexWrap: "wrap",
  },
  confetti: {
    fontSize: 28,
    display: "inline-block",
    animation: "bounce 0.6s ease infinite alternate",
  },
  modalTitle: {
    fontSize: 36,
    fontWeight: 900,
    margin: "0 0 12px",
    background: "linear-gradient(90deg, #F72585, #4CC9F0)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    letterSpacing: 3,
  },
  modalSub: {
    color: "rgba(200,200,255,0.8)",
    fontSize: 16,
    marginBottom: 28,
  },
  modalBtn: {
    padding: "14px 36px",
    background: "linear-gradient(135deg, #F72585, #7209B7, #4CC9F0)",
    border: "none",
    borderRadius: 50,
    color: "#fff",
    fontSize: 16,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "inherit",
    boxShadow: "0 0 30px #7209B760",
    transition: "all 0.25s",
  },
};

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800;900&family=Nunito:wght@400;500;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: #0a0015;
    overflow-x: hidden;
  }

  ::selection { background: #7209B7; color: #fff; }

  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: #0a0015; }
  ::-webkit-scrollbar-thumb { background: linear-gradient(#7209B7, #4CC9F0); border-radius: 99px; }

  @keyframes slideIn {
    from { opacity: 0; transform: translateY(20px) scale(0.97); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }

  @keyframes popIn {
    from { opacity: 0; transform: scale(0.7); }
    to { opacity: 1; transform: scale(1); }
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  @keyframes bounce {
    from { transform: translateY(0) rotate(-5deg); }
    to { transform: translateY(-8px) rotate(5deg); }
  }

  @keyframes heroCharIn {
    from { opacity: 0; transform: translateY(40px) skewY(8deg); }
    to { opacity: 1; transform: translateY(0) skewY(0deg); }
  }

  .hero-char {
    display: inline-block;
    animation: heroCharIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both;
  }

  .hero-sub {
    animation: slideIn 0.6s 0.5s both;
  }

  .logo-text {
    background: linear-gradient(90deg, #F72585, #7209B7, #4CC9F0);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-size: 200% auto;
    animation: gradFlow 4s linear infinite;
  }

  @keyframes gradFlow {
    0% { background-position: 0% center; }
    100% { background-position: 200% center; }
  }

  .task-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 30px rgba(114,9,183,0.3);
    border-color: rgba(72,149,239,0.4) !important;
  }

  input:focus {
    border-color: #7209B7 !important;
    box-shadow: 0 0 0 3px rgba(114,9,183,0.2), 0 0 20px rgba(114,9,183,0.15) !important;
  }

  button:hover {
    filter: brightness(1.15);
    transform: translateY(-1px);
  }
`;
