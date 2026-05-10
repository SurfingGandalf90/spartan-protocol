'use client'

import { useState, useEffect, useRef } from 'react'
import {
  DAYS, COOLDOWNS, NRC_PROGRAM, NEURO_SNACKS, EXERCISE_META, EXERCISE_KNOWLEDGE,
  SESSION_DURATIONS, WORK_END, FAMILY_TARGET,
  WEEKLY_SCHEDULE, WEEK_THEME, RPE_RANGE, fmtTime, buildTimeline,
} from '@/lib/program'

function SpartanLogo({ size = 48 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <path d="M8,10 L40,10 L40,30 L24,44 L8,30 Z" fill="#1a1506" stroke="#E8C547" strokeWidth="1.4" strokeLinejoin="miter" />
      <path d="M11,13 L37,13 L37,29 L24,40 L11,29 Z" fill="none" stroke="#E8C547" strokeWidth="0.5" strokeOpacity="0.3" strokeLinejoin="miter" />
      <line x1="24" y1="2" x2="24" y2="46" stroke="#E8C547" strokeWidth="1.8" strokeLinecap="square" />
      <polygon points="24,1 29,13 24,10 19,13" fill="#E8C547" />
      <line x1="16" y1="17" x2="32" y2="17" stroke="#E8C547" strokeWidth="1.5" strokeLinecap="square" />
      <polygon points="24,46 22,43 26,43" fill="#E8C547" />
    </svg>
  );
}

// ─── HELPERS ───────────────────────────────────────────────────────────────
function isBodyweight(load) {
  return (load || "").toLowerCase() === "bodyweight";
}

// ─── EXERCISE LOG ROW ──────────────────────────────────────────────────────
function ExerciseLogRow({ exercise, accent, value, onChange, defaultUnit = "lb" }) {
  const bw = isBodyweight(exercise.load);
  const weighted = value?.weighted || false;
  const showWeightField = !bw || weighted;
  const entryUnit = value?.unit || defaultUnit;

  const update = (patch) => onChange({ ...value, ...patch });

  const difficultyOptions = [
    { key: "easy", label: "Too Easy",  color: "#6EC6A0" },
    { key: "good", label: "Just Right", color: accent    },
    { key: "hard", label: "Too Hard",  color: "#E87A5D" },
  ];

  return (
    <div style={{ padding: "12px 0", borderBottom: "1px solid #1a1a1a" }}>
      {/* Exercise name */}
      <div style={{ fontSize: 12, color: "#ccc", marginBottom: 10, letterSpacing: "0.02em" }}>
        {exercise.name}
        <span style={{ fontSize: 10, color: "#444", marginLeft: 8 }}>{exercise.sets}×{exercise.reps}</span>
      </div>

      {/* Difficulty */}
      <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
        {difficultyOptions.map(opt => {
          const active = value?.difficulty === opt.key;
          return (
            <button key={opt.key} onClick={() => update({ difficulty: opt.key })} style={{
              flex: 1, padding: "7px 4px", fontSize: 10, letterSpacing: "0.06em",
              textTransform: "uppercase", cursor: "pointer", fontFamily: "'DM Mono', monospace",
              border: "1px solid " + (active ? opt.color : "#2a2a2a"),
              background: active ? opt.color + "18" : "transparent",
              color: active ? opt.color : "#555",
              transition: "all 0.15s",
            }}>
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* Weight row */}
      <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
        {/* BW toggle — available on ALL exercises (not just pure bodyweight ones) */}
        {!bw && (
          <button onClick={() => update({ performedBW: !value?.performedBW, weight: value?.performedBW ? value.weight : "" })} style={{
            padding: "6px 10px", fontSize: 10, letterSpacing: "0.06em", textTransform: "uppercase",
            cursor: "pointer", fontFamily: "'DM Mono', monospace", whiteSpace: "nowrap",
            border: "1px solid " + (value?.performedBW ? "#6EC6A0" : "#2a2a2a"),
            background: value?.performedBW ? "#0d2a1a" : "transparent",
            color: value?.performedBW ? "#6EC6A0" : "#555",
            transition: "all 0.15s",
          }}>
            {value?.performedBW ? "✓ Bodyweight" : "BW"}
          </button>
        )}
        {bw && (
          <button onClick={() => update({ weighted: !weighted, weight: "" })} style={{
            padding: "6px 10px", fontSize: 10, letterSpacing: "0.06em", textTransform: "uppercase",
            cursor: "pointer", fontFamily: "'DM Mono', monospace", whiteSpace: "nowrap",
            border: "1px solid " + (weighted ? accent : "#2a2a2a"),
            background: weighted ? accent + "15" : "transparent",
            color: weighted ? accent : "#555",
          }}>
            + Added weight
          </button>
        )}
        {showWeightField && !value?.performedBW && (
          <>
            <input
              type="number"
              inputMode="decimal"
              placeholder={bw ? "Weight added" : "Weight used"}
              value={value?.weight || ""}
              onChange={e => update({ weight: e.target.value })}
              style={{
                flex: 1, background: "#0d0d0d", border: "1px solid #2a2a2a",
                color: "#ccc", fontFamily: "'DM Mono', monospace", fontSize: 12,
                padding: "7px 10px", letterSpacing: "0.03em", minWidth: 0,
              }}
            />
            {/* Per-entry unit toggle */}
            <div style={{ display: "flex", flexShrink: 0 }}>
              {["kg", "lb"].map((u, i) => (
                <button key={u} onClick={() => update({ unit: u })} style={{
                  padding: "6px 10px", fontFamily: "'DM Mono', monospace", fontSize: 11,
                  letterSpacing: "0.06em", textTransform: "uppercase", cursor: "pointer",
                  border: "1px solid " + (entryUnit === u ? accent : "#2a2a2a"),
                  borderLeft: i === 1 ? "none" : undefined,
                  background: entryUnit === u ? accent + "18" : "transparent",
                  color: entryUnit === u ? accent : "#444",
                  transition: "all 0.15s",
                }}>{u}</button>
              ))}
            </div>
          </>
        )}
        {bw && !weighted && (
          <span style={{ fontSize: 10, color: "#333", letterSpacing: "0.05em" }}>Bodyweight</span>
        )}
      </div>
    </div>
  );
}

// ─── LOG MODAL ─────────────────────────────────────────────────────────────
function LogModal({ day, weekNum, onSave, onClose, existingLog, unit, saveUnit }) {
  const [rpe, setRpe] = useState(existingLog?.rpe || "");
  const [notes, setNotes] = useState(existingLog?.notes || "");
  const [completed, setCompleted] = useState(existingLog?.completed ?? true);
  const [scroll, setScroll] = useState(0);

  // Build flat list of all exercises across supersets
  const allExercises = day.supersets.flatMap(ss => ss.exercises);

  // Per-exercise log state: { [exName]: { difficulty, weight, weighted } }
  const [exLogs, setExLogs] = useState(() => {
    const init = {};
    allExercises.forEach(ex => {
      init[ex.name] = existingLog?.exercises?.[ex.name] || {};
    });
    return init;
  });

  const updateEx = (name, val) => setExLogs(prev => ({ ...prev, [name]: val }));

  const save = () => {
    onSave({
      dayId: day.id, dayTitle: day.title, week: weekNum,
      rpe, notes, completed,
      exercises: exLogs,
      date: new Date().toLocaleDateString(),
    });
    onClose();
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.9)", zIndex: 100, display: "flex", alignItems: "flex-end" }}>
      <div style={{ width: "100%", background: "#141414", border: "1px solid #2a2a2a", borderBottom: "none", maxHeight: "90vh", display: "flex", flexDirection: "column" }}>

        {/* Header — fixed */}
        <div style={{ padding: "20px 20px 0", flexShrink: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 10, letterSpacing: "0.2em", color: "#555", textTransform: "uppercase", marginBottom: 3 }}>Log Session</div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 700, color: day.accent }}>{day.title}</div>
            </div>
            <button onClick={onClose} style={{ background: "none", border: "1px solid #2a2a2a", color: "#555", fontFamily: "'DM Mono',monospace", fontSize: 11, padding: "6px 12px", cursor: "pointer" }}>✕</button>
          </div>

          {/* Completed toggle */}
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            {[true, false].map(val => (
              <button key={String(val)} onClick={() => setCompleted(val)} style={{
                flex: 1, padding: "9px", border: `1px solid ${completed === val ? day.accent : "#2a2a2a"}`,
                background: completed === val ? `${day.accent}12` : "transparent",
                color: completed === val ? day.accent : "#555", fontFamily: "'DM Mono', monospace",
                fontSize: 11, letterSpacing: "0.08em", cursor: "pointer", textTransform: "uppercase",
              }}>
                {val ? "✓ Completed" : "✗ Skipped"}
              </button>
            ))}
          </div>

          {/* Session RPE */}
          <div style={{ marginBottom: 4 }}>
            <div style={{ fontSize: 10, color: "#555", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>Session RPE</div>
            <div style={{ display: "flex", gap: 5 }}>
              {["5","6","7","8","9","10"].map(r => (
                <button key={r} onClick={() => setRpe(r)} style={{
                  width: 38, height: 38, border: `1px solid ${rpe === r ? day.accent : "#2a2a2a"}`,
                  background: rpe === r ? `${day.accent}18` : "transparent",
                  color: rpe === r ? day.accent : "#555", fontFamily: "'DM Mono', monospace",
                  fontSize: 13, cursor: "pointer", flexShrink: 0,
                }}>{r}</button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div style={{ borderBottom: "1px solid #1e1e1e", margin: "16px 0 0" }} />
          <div style={{ fontSize: 10, color: "#444", letterSpacing: "0.12em", textTransform: "uppercase", padding: "10px 0 4px" }}>Exercises</div>
        </div>

        {/* Scrollable exercise list */}
        <div style={{ overflowY: "auto", flex: 1, padding: "0 20px" }}>
          {day.supersets.map(ss => (
            <div key={ss.id}>
              <div style={{ fontSize: 10, color: "#444", letterSpacing: "0.1em", textTransform: "uppercase", padding: "10px 0 2px", borderTop: "1px solid #1a1a1a" }}>
                {ss.id} — {ss.name.split("—")[1]?.trim() || ss.name}
              </div>
              {ss.exercises.map(ex => (
                <ExerciseLogRow
                  key={ex.name}
                  exercise={ex}
                  accent={day.accent}
                  value={exLogs[ex.name]}
                  onChange={val => updateEx(ex.name, val)}
                  defaultUnit={unit}
                />
              ))}
            </div>
          ))}

          {/* Notes */}
          <div style={{ padding: "16px 0 8px" }}>
            <div style={{ fontSize: 10, color: "#555", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>Notes for Claude</div>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Anything else — soreness, energy level, what felt off..."
              style={{
                width: "100%", background: "#0d0d0d", border: "1px solid #2a2a2a", color: "#ccc",
                fontFamily: "'DM Mono', monospace", fontSize: 12, padding: "10px 12px",
                resize: "none", height: 70, letterSpacing: "0.03em", lineHeight: 1.6,
              }}
            />
          </div>
        </div>

        {/* Save button — fixed at bottom */}
        <div style={{ padding: "12px 20px 36px", borderTop: "1px solid #1e1e1e", flexShrink: 0 }}>
          <button onClick={save} style={{
            width: "100%", background: day.accent, color: "#0F0F0F", border: "none",
            fontFamily: "'DM Mono', monospace", fontSize: 12, letterSpacing: "0.1em",
            textTransform: "uppercase", padding: "14px", cursor: "pointer", fontWeight: 500,
          }}>Save Log</button>
        </div>
      </div>
    </div>
  );
}

// ─── COACH SYSTEM CONTEXT ──────────────────────────────────────────────────


function getCoachResponse(input, day) {
  const q = input.toLowerCase();
  const allExercises = day.supersets.flatMap(ss => ss.exercises);

  // Detect topic
  let topic = "cue";
  for (const [t, keywords] of Object.entries(TOPIC_KEYWORDS)) {
    if (keywords.some(k => q.includes(k))) { topic = t; break; }
  }

  // Find which exercise they're asking about
  let matchedEx = null;
  let bestScore = 0;
  for (const ex of allExercises) {
    const words = ex.name.toLowerCase().split(/\W+/).filter(w => w.length > 3);
    const score = words.filter(w => q.includes(w)).length;
    if (score > bestScore) { bestScore = score; matchedEx = ex; }
  }

  // Back safety catch-all — highest priority
  if (["hurt", "pain", "twinge", "sharp", "stop"].some(k => q.includes(k))) {
    return "Stop what you're doing. Don't train through pain — especially not with a herniated disc. Rest, reassess. If it's a dull ache, take 5 minutes and see if it settles. If it's sharp or shooting, that's your session done for today. Log it and message your PT.";
  }

  // Generic back question without specific exercise
  if ((q.includes("back") || q.includes("safe")) && !matchedEx) {
    return "Every exercise in this program was chosen specifically for your disc. The rules: no spinal flexion under load, no axial compression, no high impact. If something feels wrong in your lower back during any exercise, stop that movement — skip it, log it, and we'll swap it next week.";
  }

  // If we found a specific exercise
  if (matchedEx && EXERCISE_KNOWLEDGE[matchedEx.name]) {
    const knowledge = EXERCISE_KNOWLEDGE[matchedEx.name];
    const answer = knowledge[topic] || knowledge.cue;
    return matchedEx.name + ": " + answer;
  }

  // Exercise matched but no knowledge entry yet — give a useful generic answer using the exercise name
  if (matchedEx) {
    const genericByTopic = {
      cue: matchedEx.name + ": Set up with a neutral spine before the first rep. Move through full range, control the eccentric, and stop if anything feels off in your lower back.",
      why: matchedEx.name + " is programmed to load the target muscles while keeping your spine safe and neutral throughout the movement.",
      sub: matchedEx.name + ": If you need a substitute, use a lighter load or reduce the range of motion first. Tell me what specifically is limiting you and I can give a more targeted swap.",
      back: matchedEx.name + ": If you feel anything in your lower back during this movement, stop immediately. Check your neutral spine position and reduce load or range before trying again.",
      form: matchedEx.name + ": Focus on neutral spine throughout, control both the lifting and lowering phase, and never sacrifice position for load.",
    };
    return genericByTopic[topic] || genericByTopic.cue;
  }

  // No exercise matched at all — ask once but guide toward quick taps
  const generics = {
    cue: "Tap one of the exercise chips above to get exact cues, or type the exercise name.",
    why: "All " + day.title + " exercises load the target muscles while keeping your spine safe. Tap an exercise chip above for the specific reason.",
    sub: "Tell me which exercise you need to swap and I'll give you a back-safe alternative from your equipment.",
    back: "If your back is talking to you, stop that exercise, rest 5 minutes. If it doesn't settle, end the session. Tap an exercise chip to tell me which one triggered it.",
    form: "Tap one of the exercise chips above for setup and technique, or type the exercise name.",
  };
  return generics[topic] || "Tap one of the exercise chips above or type the exercise name and I'll answer immediately.";
}

// ─── COACH CHAT ────────────────────────────────────────────────────────────
function CoachChat({ day }) {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "I'm here. You're on " + day.title + " — Week " + CURRENT_WEEK + ". Ask me about any exercise — form, cues, substitutions, or why it's in the program." }
  ]);
  const [input, setInput] = useState("");
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = () => {
    const text = input.trim();
    if (!text) return;
    setInput("");
    const userMsg = { role: "user", content: text };
    const reply = getCoachResponse(text, day);
    setMessages(prev => [...prev, userMsg, { role: "assistant", content: reply }]);
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const allExercises = day.supersets.flatMap(ss => ss.exercises);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 220px)", minHeight: 360 }}>

      {/* Exercise quick-tap chips */}
      {messages.length === 1 && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 10, color: "#444", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>Tap an exercise to ask about it</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
            {allExercises.map((ex, i) => (
              <button key={i} onClick={() => {
                const q = "How do I cue " + ex.name + "?";
                setMessages(prev => [...prev,
                  { role: "user", content: q },
                  { role: "assistant", content: getCoachResponse(q, day) }
                ]);
              }} style={{
                background: "#111", border: "1px solid #2a2a2a", color: "#777",
                fontFamily: "DM Mono,monospace", fontSize: 10, padding: "6px 10px",
                cursor: "pointer", letterSpacing: "0.03em", textAlign: "left",
              }}>{ex.name}</button>
            ))}
          </div>
          <div style={{ fontSize: 10, color: "#444", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>Or ask anything</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {["My back feels tight — should I stop?", "Give me a substitute for an exercise", "Why is this exercise in today's session?"].map((q, i) => (
              <button key={i} onClick={() => {
                setMessages(prev => [...prev,
                  { role: "user", content: q },
                  { role: "assistant", content: getCoachResponse(q, day) }
                ]);
              }} style={{
                textAlign: "left", background: "#0d0d0d", border: "1px solid #1e1e1e",
                color: "#666", fontFamily: "DM Mono,monospace", fontSize: 11,
                padding: "8px 12px", cursor: "pointer", letterSpacing: "0.03em",
              }}>{q}</button>
            ))}
          </div>
        </div>
      )}

      {/* Message thread */}
      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 12, paddingBottom: 8 }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ display: "flex", flexDirection: msg.role === "user" ? "row-reverse" : "row", gap: 10, alignItems: "flex-start" }}>
            {msg.role === "assistant" && (
              <div style={{ width: 26, height: 26, flexShrink: 0, paddingTop: 2 }}><SpartanLogo size={22} /></div>
            )}
            <div style={{
              maxWidth: "84%", padding: "10px 14px",
              background: msg.role === "user" ? day.accent + "15" : "#141414",
              border: "1px solid " + (msg.role === "user" ? day.accent + "35" : "#222"),
              fontSize: 13, color: msg.role === "user" ? day.accent : "#ccc",
              lineHeight: 1.7, letterSpacing: "0.02em",
            }}>{msg.content}</div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ borderTop: "1px solid #1e1e1e", paddingTop: 12, display: "flex", gap: 8 }}>
        <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey}
          placeholder="Ask about any exercise..." rows={2}
          style={{ flex: 1, background: "#111", border: "1px solid #2a2a2a", color: "#E8E8E0",
            fontFamily: "DM Mono,monospace", fontSize: 13, padding: "10px 12px",
            resize: "none", letterSpacing: "0.02em", lineHeight: 1.5, outline: "none" }}
          onFocus={e => e.target.style.borderColor = day.accent}
          onBlur={e => e.target.style.borderColor = "#2a2a2a"} />
        <button onClick={send} disabled={!input.trim()} style={{
          background: !input.trim() ? "#1a1a1a" : day.accent,
          color: !input.trim() ? "#444" : "#0F0F0F",
          border: "none", width: 48, fontSize: 20,
          cursor: !input.trim() ? "not-allowed" : "pointer", flexShrink: 0,
        }}>↑</button>
      </div>
    </div>
  );
}

// ─── SHARE WITH CLAUDE ────────────────────────────────────────────────────
function ShareWithClaude({ sessionLogs, weekNum }) {
  const [copied, setCopied] = useState(false);

  const buildSummary = () => {
    let out = "SPARTAN PROTOCOL — WEEK " + weekNum + " LOG\n";
    out += "================================\n\n";
    DAYS.forEach(d => {
      const log = sessionLogs["w" + weekNum + "-d" + d.id];
      out += d.label + ": " + d.title + "\n";
      if (!log) {
        out += "  Not yet logged\n\n";
        return;
      }
      out += "  Status: " + (log.completed ? "Completed" : "Skipped") + "\n";
      if (log.rpe) out += "  Session RPE: " + log.rpe + "/10\n";
      if (log.date) out += "  Date: " + log.date + "\n";
      if (log.exercises) {
        out += "  Exercises:\n";
        Object.entries(log.exercises).forEach(([name, ex]) => {
          if (ex.difficulty || ex.weight) {
            out += "    - " + name + ": ";
            if (ex.difficulty) out += ex.difficulty === "easy" ? "TOO EASY" : ex.difficulty === "hard" ? "TOO HARD" : "JUST RIGHT";
            if (ex.performedBW) out += " | Bodyweight";
            else if (ex.weight) out += " | " + ex.weight + " " + (ex.unit || log.unit || "lb") + (ex.weighted ? " added" : "");
            out += "\n";
          }
        });
      }
      if (log.notes) out += "  Notes: " + log.notes + "\n";
      out += "\n";
    });
    out += "================================\n";
    out += "Paste this to Claude and say: build my Week " + (weekNum + 1) + " program";
    return out;
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(buildSummary());
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (e) {
      // Fallback for mobile
      const el = document.createElement("textarea");
      el.value = buildSummary();
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  return (
    <div style={{ marginTop: 20, padding: "16px 18px", background: copied ? "#0a150a" : "#111", border: "1px solid " + (copied ? "#2a4a2a" : "#2a2a2a"), transition: "all 0.3s" }}>
      <div style={{ fontSize: 10, color: "#555", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>
        Share with Claude
      </div>
      <div style={{ fontSize: 12, color: "#666", marginBottom: 14, lineHeight: 1.6 }}>
        Copies your full week log as text. Paste it into this Claude conversation so I can program your next week intelligently.
      </div>
      <button onClick={copy} style={{
        width: "100%", fontFamily: "DM Mono,monospace", fontSize: 12,
        letterSpacing: "0.1em", textTransform: "uppercase", padding: "12px",
        cursor: "pointer", border: "none", transition: "all 0.2s",
        background: copied ? "#6EC6A0" : "#E8C547",
        color: "#0F0F0F", fontWeight: 500,
      }}>
        {copied ? "✓ Copied — paste into Claude chat" : "Copy log for Claude"}
      </button>
    </div>
  );
}

// ─── NEURO SNACK VIEW ─────────────────────────────────────────────────────
function NeuroSnackView() {
  const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const todayName = days[new Date().getDay()];
  const todaySnack = NEURO_SNACKS.find(s => s.day === todayName) || NEURO_SNACKS[0];
  const [selected, setSelected] = useState(todaySnack);
  const [expanded, setExpanded] = useState(null);
  const [done, setDone] = useState({});

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 10, color: "#A78BFA", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 4, opacity: 0.8 }}>
          Z-Health Inspired · Evening Wind-Down · 5 min
        </div>
        <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 800, color: "#E8E8E0", marginBottom: 4 }}>
          Neuro Snacks
        </div>
        <div style={{ fontSize: 12, color: "#555", lineHeight: 1.6 }}>
          Daily 5-minute nervous system drills. Train your brain like you train your body — with precision and intention. Based on Z-Health principles of joint-by-joint neurology and threat reduction.
        </div>
      </div>

      {/* Day selector */}
      <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 20 }}>
        {NEURO_SNACKS.map(s => (
          <button key={s.day} onClick={() => setSelected(s)} style={{
            padding: "6px 10px", fontFamily: "DM Mono,monospace", fontSize: 10,
            letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer",
            border: "1px solid " + (selected.day === s.day ? "#A78BFA" : "#2a2a2a"),
            background: selected.day === s.day ? "#1a1528" : "transparent",
            color: selected.day === s.day ? "#A78BFA" : (s.day === todayName ? "#888" : "#444"),
            position: "relative",
          }}>
            {s.day.slice(0,3)}
            {s.day === todayName && (
              <span style={{ position: "absolute", top: 2, right: 2, width: 4, height: 4, borderRadius: "50%", background: "#A78BFA" }} />
            )}
          </button>
        ))}
      </div>

      {/* Today badge */}
      {selected.day === todayName && (
        <div style={{ padding: "6px 12px", background: "#1a1528", border: "1px solid #2a1a4a", fontSize: 10, color: "#A78BFA", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 16, display: "inline-block" }}>
          Today
        </div>
      )}

      {/* Snack card */}
      <div style={{ border: "1px solid #2a2a2a", borderTop: "2px solid #A78BFA", background: "#111", marginBottom: 16 }}>
        <div style={{ padding: "16px 18px", borderBottom: "1px solid #1e1e1e" }}>
          <div style={{ fontSize: 10, color: "#555", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4 }}>{selected.day} · {selected.duration}</div>
          <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 700, color: "#A78BFA", marginBottom: 2 }}>{selected.title}</div>
          <div style={{ fontSize: 12, color: "#666" }}>{selected.subtitle}</div>
        </div>

        {/* Steps */}
        <div style={{ padding: "14px 18px" }}>
          <div style={{ fontSize: 10, color: "#444", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>Steps</div>
          {selected.steps.map((step, i) => (
            <div key={i} onClick={() => setDone(prev => ({ ...prev, [selected.day + "-" + i]: !prev[selected.day + "-" + i] }))}
              style={{ display: "flex", gap: 12, marginBottom: 10, cursor: "pointer", alignItems: "flex-start" }}>
              <div style={{
                width: 20, height: 20, borderRadius: "50%", flexShrink: 0, marginTop: 1,
                border: "1px solid " + (done[selected.day + "-" + i] ? "#A78BFA" : "#333"),
                background: done[selected.day + "-" + i] ? "#A78BFA" : "transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 10, color: "#0F0F0F", transition: "all 0.2s",
              }}>
                {done[selected.day + "-" + i] ? "✓" : ""}
              </div>
              <div style={{ fontSize: 12, color: done[selected.day + "-" + i] ? "#555" : "#ccc", lineHeight: 1.65, textDecoration: done[selected.day + "-" + i] ? "line-through" : "none", transition: "all 0.2s" }}>
                {step}
              </div>
            </div>
          ))}
        </div>

        {/* Coach cue */}
        <div style={{ padding: "10px 18px", background: "#0d0d0d", borderTop: "1px solid #1a1a1a" }}>
          <span style={{ fontSize: 10, color: "#A78BFA", letterSpacing: "0.08em", textTransform: "uppercase", marginRight: 8 }}>Cue</span>
          <span style={{ fontSize: 11, color: "#666", fontStyle: "italic" }}>{selected.cue}</span>
        </div>
      </div>

      {/* Why section */}
      <div style={{ border: "1px solid #1e1e1e", background: "#0d0d0d" }}>
        <div style={{ padding: "12px 18px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}
          onClick={() => setExpanded(expanded === "why" ? null : "why")}>
          <span style={{ fontSize: 10, color: "#555", letterSpacing: "0.12em", textTransform: "uppercase" }}>Why this works</span>
          <span style={{ color: "#444", fontSize: 12 }}>{expanded === "why" ? "−" : "+"}</span>
        </div>
        {expanded === "why" && (
          <div style={{ padding: "0 18px 14px", fontSize: 12, color: "#777", lineHeight: 1.7, borderTop: "1px solid #1a1a1a", paddingTop: 12 }}>
            {selected.why}
          </div>
        )}
      </div>

      {/* Attribution */}
      <div style={{ marginTop: 20, padding: "10px 16px", background: "#0d0d0d", border: "1px solid #1a1a1a", fontSize: 11, color: "#333", letterSpacing: "0.04em" }}>
        Neuro drills inspired by Z-Health Performance — <span style={{ color: "#444" }}>zhealth.net</span>
      </div>
    </div>
  );
}


// Default lift assignment: dayId -> weekday
const DEFAULT_LIFT_DAYS = { 1: "Monday", 2: "Tuesday", 3: "Thursday", 4: "Saturday" };
const DEFAULT_RUN_DAYS  = { 1: "Monday", 2: "Tuesday", 3: "Thursday", 4: "Friday" };
const ALL_DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

function ScheduleView() {
  const dayNames = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const todayName = dayNames[new Date().getDay()];
  const [danceDay, setDanceDay] = useState(null);
  const [moving, setMoving] = useState(null);
  const [assignments, setAssignments] = useState(() => {
    try {
      const saved = localStorage.getItem("schedule-assignments");
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });

  const saveAssignments = (next) => {
    setAssignments(next);
    try { localStorage.setItem("schedule-assignments", JSON.stringify(next)); } catch {}
  };

  const getDay = (key, def) => assignments[key] || def;

  const buildDayMap = () => {
    const map = {};
    ALL_DAYS.forEach(d => { map[d] = []; });
    DAYS.forEach(d => {
      const key = "lift-" + d.id;
      const day = getDay(key, DEFAULT_LIFT_DAYS[d.id]);
      if (map[day]) map[day].push({ key, type: "lift", label: d.title, accent: d.accent, icon: "\u26A1", dayId: d.id });
    });
    const weekRuns = NRC_PROGRAM[CURRENT_WEEK]?.runs || [];
    weekRuns.forEach(r => {
      const key = "run-" + r.runNum;
      const day = getDay(key, DEFAULT_RUN_DAYS[r.runNum]);
      const tc = r.type === "Recovery" ? "#6EC6A0" : r.type === "Race" ? "#E87A5D" : "#E8C547";
      if (map[day]) map[day].push({ key, type: "run", label: r.label, accent: tc, icon: "\uD83C\uDFC3", runNum: r.runNum, runType: r.type });
    });
    if (danceDay && danceDay !== "None this week" && map[danceDay]) {
      map[danceDay].push({ key: "dance", type: "dance", label: "Dance Class", accent: "#A78BFA", icon: "\uD83D\uDC83" });
    }
    return map;
  };

  const dayMap = buildDayMap();

  const handleMove = (targetDay) => {
    if (!moving) return;
    saveAssignments({ ...assignments, [moving]: targetDay });
    setMoving(null);
  };

  const getConflicts = (map) => {
    const w = {};
    ALL_DAYS.forEach(day => {
      const lifts = map[day].filter(s => s.type === "lift");
      if (lifts.length > 1) w[day] = "Two lifts on one day — split them";
      const hardRun = map[day].find(s => s.type === "run" && ["Speed","Race"].includes(s.runType));
      const d2 = map[day].find(s => s.type === "lift" && s.dayId === 2);
      if (hardRun && d2) w[day] = (w[day] ? w[day] + " · " : "") + "Hard run + Day 2 — monitor closely";
    });
    return w;
  };

  const conflicts = getConflicts(dayMap);
  const hasChanges = Object.keys(assignments).length > 0;
  const restDays = ALL_DAYS.filter(d => dayMap[d].length === 0);

  return (
    <div>
      {/* Work schedule context */}
      <div style={{ marginBottom: 20, padding: "14px 16px", background: "#111", border: "1px solid #1e1e1e", borderLeft: "3px solid #E8C547" }}>
        <div style={{ fontSize: 10, color: "#E8C547", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 8, opacity: 0.8 }}>Your Schedule</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
          {[
            ["Work ends", "2:30 PM", "#555"],
            ["Train", "2:30–4:15 PM", "#E8C547"],
            ["Family", "5:30 PM+", "#6EC6A0"],
          ].map(([label, val, color]) => (
            <div key={label}>
              <div style={{ fontSize: 9, color: "#444", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 3 }}>{label}</div>
              <div style={{ fontSize: 12, color, fontFamily: "'Syne',sans-serif", fontWeight: 700 }}>{val}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 10, fontSize: 11, color: "#555", lineHeight: 1.6 }}>
          Sessions start at 2:30 PM. Each card below shows exact finish time and minutes before family time.
        </div>
      </div>

      {/* Title */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 10, color: "#6EC6A0", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 4, opacity: 0.8 }}>
          Week {CURRENT_WEEK} · Tap to Reschedule
        </div>
        <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 800, color: "#E8E8E0", marginBottom: 6 }}>Weekly Calendar</div>
        <div style={{ fontSize: 12, color: "#555", lineHeight: 1.6 }}>Tap a session to move it, then tap the target day.</div>
      </div>

      {moving && (
        <div style={{ padding: "10px 16px", background: "#1a1528", border: "1px solid #A78BFA", marginBottom: 16, fontSize: 12, color: "#A78BFA", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>Moving {moving.replace("lift-","Day ").replace("run-","Run ")} — tap a day to place it</span>
          <button onClick={() => setMoving(null)} style={{ background: "none", border: "none", color: "#888", fontFamily: "DM Mono,monospace", fontSize: 11, cursor: "pointer" }}>Cancel</button>
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", gap: 14 }}>
          {[["\u26A1","#E8C547","Lift"],["\uD83C\uDFC3","#6EC6A0","Run"],["\uD83D\uDC83","#A78BFA","Dance"]].map(([icon,color,label]) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#555" }}>
              <span style={{ color }}>{icon}</span><span>{label}</span>
            </div>
          ))}
        </div>
        {hasChanges && (
          <button onClick={() => saveAssignments({})} style={{ background: "transparent", border: "1px solid #2a2a2a", color: "#555", fontFamily: "DM Mono,monospace", fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", padding: "4px 10px", cursor: "pointer" }}>
            Reset
          </button>
        )}
      </div>

      <div style={{ marginBottom: 16, padding: "12px 16px", background: "#111", border: "1px solid #1e1e1e" }}>
        <div style={{ fontSize: 10, color: "#A78BFA", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>Dance class</div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {["Wednesday","Friday","None this week"].map(d => (
            <button key={d} onClick={() => setDanceDay(danceDay === d ? null : d)} style={{
              padding: "6px 10px", fontFamily: "DM Mono,monospace", fontSize: 10, letterSpacing: "0.06em", textTransform: "uppercase", cursor: "pointer",
              border: "1px solid " + (danceDay === d ? "#A78BFA" : "#2a2a2a"),
              background: danceDay === d ? "#1a1028" : "transparent",
              color: danceDay === d ? "#A78BFA" : "#555",
            }}>{d}</button>
          ))}
        </div>
      </div>

      {ALL_DAYS.map(dayName => {
        const sessions = dayMap[dayName] || [];
        const isToday = dayName === todayName;
        const conflict = conflicts[dayName];
        const isTrainingDay = sessions.length > 0;
        const timeline = buildTimeline(sessions);
        const lastSession = timeline[timeline.length - 1];
        const doneBy = lastSession ? lastSession.end : null;
        const minsToFamily = lastSession ? (() => {
          const [hStr, rest] = lastSession.end.split(":");
          const [mStr, ampm] = rest.split(" ");
          let endH = parseInt(hStr) + (ampm === "PM" && parseInt(hStr) !== 12 ? 12 : 0);
          const endM = parseInt(mStr);
          const totalEnd = endH * 60 + endM;
          const family = FAMILY_TARGET.h * 60 + FAMILY_TARGET.m;
          return family - totalEnd;
        })() : null;

        return (
          <div key={dayName} onClick={() => { if (moving) handleMove(dayName); }}
            style={{
              border: "1px solid " + (isToday ? "#444" : moving ? "#1e1e2e" : "#1e1e1e"),
              borderLeft: "3px solid " + (sessions[0]?.accent || (isToday ? "#555" : "#1e1e1e")),
              background: moving ? "#0d0d18" : isToday ? "#141414" : "#0d0d0d",
              marginBottom: 8, cursor: moving ? "pointer" : "default", transition: "all 0.15s",
            }}>

            {/* Day header */}
            <div style={{ padding: "10px 14px 8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 13, color: isToday ? "#E8C547" : "#777" }}>{dayName}</span>
                {isToday && <span style={{ fontSize: 9, color: "#E8C547", border: "1px solid #E8C54740", padding: "1px 5px", letterSpacing: "0.1em" }}>TODAY</span>}
                {moving && <span style={{ fontSize: 9, color: "#A78BFA", letterSpacing: "0.06em" }}>tap to drop here</span>}
              </div>
              <div style={{ textAlign: "right" }}>
                {!isTrainingDay && !moving && <span style={{ fontSize: 10, color: "#2a2a2a" }}>Rest</span>}
                {doneBy && !moving && (
                  <div>
                    <span style={{ fontSize: 10, color: "#555" }}>Done by {doneBy}</span>
                    {minsToFamily > 0 && (
                      <span style={{ fontSize: 9, color: "#4a8a4a", marginLeft: 6 }}>{minsToFamily}min before family time</span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {conflict && (
              <div style={{ padding: "3px 14px", background: "#1a0e00", fontSize: 10, color: "#cc8844" }}>⚠ {conflict}</div>
            )}

            {/* Session timeline */}
            {timeline.length > 0 && (
              <div style={{ padding: "0 14px 10px", display: "flex", flexDirection: "column", gap: 5 }}>
                {timeline.map((s, idx) => (
                  <div key={s.key} onClick={e => { e.stopPropagation(); if (!moving && s.type !== "dance") setMoving(s.key); }}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "7px 10px",
                      background: moving === s.key ? s.accent + "28" : s.accent + "10",
                      border: "1px solid " + (moving === s.key ? s.accent : s.accent + "30"),
                      cursor: s.type === "dance" ? "default" : "pointer", transition: "all 0.15s",
                    }}>
                    <div>
                      <span style={{ fontSize: 12, color: moving === s.key ? s.accent : "#ccc" }}>{s.icon} {s.label}</span>
                      <div style={{ fontSize: 10, color: "#555", marginTop: 2, letterSpacing: "0.04em" }}>
                        {s.start} → {s.end} · {s.dur} min
                      </div>
                    </div>
                    {!moving && s.type !== "dance" && <span style={{ fontSize: 9, color: "#444", textTransform: "uppercase", letterSpacing: "0.08em", flexShrink: 0 }}>move</span>}
                    {moving === s.key && <span style={{ fontSize: 9, color: s.accent, textTransform: "uppercase", letterSpacing: "0.08em", flexShrink: 0 }}>moving...</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      <div style={{ marginTop: 12, border: "1px solid #1e1e1e", background: "#111" }}>
        <div style={{ padding: "10px 16px", borderBottom: "1px solid #1a1a1a", fontSize: 10, color: "#555", letterSpacing: "0.12em", textTransform: "uppercase" }}>Weekly Load</div>
        {[
          ["Lifting","4 sessions","#E8C547"],
          ["Running","4 NRC sessions","#6EC6A0"],
          ["Dance", danceDay && danceDay !== "None this week" ? danceDay : "Not scheduled","#A78BFA"],
          ["Rest", restDays.join(", ") || "None","#555"],
        ].map(([label,val,color],i,arr) => (
          <div key={label} style={{ display: "grid", gridTemplateColumns: "1fr auto", padding: "9px 16px", borderBottom: i < arr.length-1 ? "1px solid #1a1a1a" : "none", fontSize: 12 }}>
            <span style={{ color: "#666" }}>{label}</span>
            <span style={{ color, fontSize: 11 }}>{val}</span>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 12, padding: "10px 14px", background: "#1a0e00", border: "1px solid #3a2000", fontSize: 11, color: "#cc8844", lineHeight: 1.6 }}>
        <strong style={{ color: "#E8C547" }}>NRC Watch: </strong>Week 4+ move Tuesday run to Wednesday if legs are heavy after Day 2.
      </div>
      <div style={{ marginTop: 10, padding: "8px 14px", background: "#0d0d0d", border: "1px solid #1a1a1a", fontSize: 10, color: "#333" }}>
        Changes save automatically and persist.
      </div>
    </div>
  );
}

// ─── MAIN APP ──────────────────────────────────────────────────────────────

export default function ProgramUI({
  currentWeek: currentWeekProp, sessionLogs, runLogs, unit, assignments, danceDay,
  activeDay, setActiveDay, view, setView, openSets, toggleSet,
  showWarmup, setShowWarmup, logModal, setLogModal,
  travelMode, setTravelMode, swapped, setSwapped,
  onSaveLog, onSaveRunLog, onSaveUnit, onSaveSchedule, user
}: any) {
  const CURRENT_WEEK = currentWeekProp;
  const [logSaved, setLogSaved] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        // ── Migration: window.storage → localStorage (runs once) ──────────
        const migrated = localStorage.getItem("spartan-migrated");
        if (!migrated && typeof window.storage !== "undefined") {
          try {
            const sl = await window.storage.get("session-logs");
            if (sl?.value) {
              localStorage.setItem("session-logs", sl.value);
            }
            const wu = await window.storage.get("weight-unit");
            if (wu?.value) {
              localStorage.setItem("weight-unit", wu.value);
            }
            const sw = await window.storage.get("saved-weeks");
            if (sw?.value) {
              localStorage.setItem("saved-weeks", sw.value);
            }
            localStorage.setItem("spartan-migrated", "1");
          } catch (e) {
            // window.storage not available — already on localStorage
            localStorage.setItem("spartan-migrated", "1");
          }
        }
        // ── Load from localStorage ─────────────────────────────────────────
        const r = localStorage.getItem("session-logs");
        if (r) setSessionLogs(JSON.parse(r));
        const u = localStorage.getItem("weight-unit");
        if (u) setUnit(u);
        const rl = localStorage.getItem("run-logs");
        if (rl) setRunLogs(JSON.parse(rl));
      } catch (e) {}
    }
    load();
  }, []);

  const saveUnit = onSaveUnit;
  const _saveUnitOrig = (u) => {
    setUnit(u);
    try {
      localStorage.setItem("weight-unit", u);
      if (typeof window.storage !== "undefined") window.storage.set("weight-unit", u).catch(() => {});
    } catch (e) {}
  };

  const saveRunLog = onSaveRunLog;
  const _saveRunLogOrig = (key, status) => {
    const updated = { ...runLogs, [key]: status };
    setRunLogs(updated);
    try { localStorage.setItem("run-logs", JSON.stringify(updated)); } catch (e) {}
  };

  const saveLog = onSaveLog;
  const _unused = async (entry) => {
    const key = `w${entry.week}-d${entry.dayId}`;
    const updated = { ...sessionLogs, [key]: entry };
    setSessionLogs(updated);
    try {
      const json = JSON.stringify(updated);
      localStorage.setItem("session-logs", json);
      if (typeof window.storage !== "undefined") window.storage.set("session-logs", json).catch(() => {});
      setLogSaved(true);
      setTimeout(() => setLogSaved(false), 2000);
    } catch (e) {}
  };



  const day = DAYS[activeDay];
  const dayLog = sessionLogs[`w${CURRENT_WEEK}-d${day.id}`];
  const weekLogs = DAYS.map(d => sessionLogs[`w${CURRENT_WEEK}-d${d.id}`]).filter(Boolean);
  const allLogged = weekLogs.length === DAYS.length;

  return (
    <div style={{ fontFamily: "'DM Mono','Courier New',monospace", background: "#0F0F0F", minHeight: "100vh", color: "#E8E8E0" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Syne:wght@700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #333; border-radius: 2px; }
        .day-tab { cursor:pointer; padding:10px 14px; border:1px solid #2a2a2a; background:transparent; color:#555; font-family:'DM Mono',monospace; font-size:11px; letter-spacing:0.1em; transition:all 0.2s; text-transform:uppercase; position:relative; }
        .day-tab:hover { border-color:#444; color:#aaa; }
        .day-tab.active { background:var(--accent); border-color:var(--accent); color:#0F0F0F; font-weight:500; }
        .day-tab.logged::after { content:''; position:absolute; top:3px; right:3px; width:5px; height:5px; border-radius:50%; background:#6EC6A0; }
        .superset-card { border:1px solid #222; border-left:3px solid var(--accent); background:#141414; margin-bottom:12px; }
        .superset-header { padding:14px 18px; display:flex; justify-content:space-between; align-items:center; cursor:pointer; user-select:none; }
        .superset-header:hover { background:#1a1a1a; }
        .exercise-row { padding:10px 18px 10px 32px; border-top:1px solid #1e1e1e; display:grid; grid-template-columns:1fr auto; gap:8px; align-items:start; }
        .badge { display:inline-block; font-size:10px; letter-spacing:0.08em; padding:2px 8px; border-radius:2px; text-transform:uppercase; background:#1e1e1e; color:#666; border:1px solid #2a2a2a; }
        .toggle-btn { background:transparent; border:1px solid #333; color:#888; font-family:'DM Mono',monospace; font-size:11px; padding:6px 14px; cursor:pointer; letter-spacing:0.05em; transition:all 0.2s; }
        .toggle-btn:hover { border-color:#666; color:#ccc; }
        .rule-chip { display:inline-flex; align-items:center; gap:6px; background:#1a1a1a; border:1px solid #2a2a2a; border-radius:2px; padding:6px 12px; font-size:11px; color:#888; letter-spacing:0.04em; }
        .nav-tab { background:transparent; border:none; font-family:'DM Mono',monospace; font-size:11px; letter-spacing:0.1em; text-transform:uppercase; cursor:pointer; padding:6px 0; border-bottom:1px solid transparent; transition:all 0.2s; }
        .log-btn { font-family:'DM Mono',monospace; font-size:11px; letter-spacing:0.08em; text-transform:uppercase; padding:10px 18px; cursor:pointer; transition:all 0.2s; border:none; }
        .timer-block { background:#161616; border:1px solid #222; padding:12px 18px; font-size:11px; color:#666; letter-spacing:0.08em; text-transform:uppercase; display:flex; gap:24px; flex-wrap:wrap; }
      `}</style>

      {/* ── HEADER ── */}
      <div style={{ padding: "28px 20px 0", borderBottom: "1px solid #1e1e1e" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>

          {/* Logo row */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <SpartanLogo size={50} />
              <div>
                <div style={{ fontSize: 10, letterSpacing: "0.25em", color: "#E8C547", textTransform: "uppercase", marginBottom: 3, opacity: 0.8 }}>Λ Spartan Protocol</div>
                <div style={{ fontSize: 10, letterSpacing: "0.14em", color: "#3a3a3a", textTransform: "uppercase" }}>Lean · Mobile · Durable</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 18, paddingTop: 4 }}>
              <button className="nav-tab" style={{ color: view === "program" ? "#E8E8E0" : "#444", borderBottomColor: view === "program" ? "#666" : "transparent" }} onClick={() => setView("program")}>Program</button>
              <button className="nav-tab" style={{ color: view === "log" ? "#E8E8E0" : "#444", borderBottomColor: view === "log" ? "#666" : "transparent" }} onClick={() => setView("log")}>
                Log {weekLogs.length > 0 && <span style={{ color: "#6EC6A0" }}>({weekLogs.length}/4)</span>}
              </button>
              <button className="nav-tab" style={{ color: view === "coach" ? "#E8E8E0" : "#444", borderBottomColor: view === "coach" ? day.accent : "transparent" }} onClick={() => setView("coach")}>
                Coach
              </button>
              <button className="nav-tab" style={{ color: view === "neuro" ? "#E8E8E0" : "#444", borderBottomColor: view === "neuro" ? "#A78BFA" : "transparent" }} onClick={() => setView("neuro")}>
                Neuro
              </button>
              <button className="nav-tab" style={{ color: view === "schedule" ? "#E8E8E0" : "#444", borderBottomColor: view === "schedule" ? "#6EC6A0" : "transparent" }} onClick={() => setView("schedule")}>
                Schedule
              </button>
            </div>
          </div>

          <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(22px,5vw,36px)", fontWeight: 800, letterSpacing: "-0.02em", color: "#E8E8E0", lineHeight: 1, marginBottom: 6 }}>
            4-Day Superset Program
          </h1>
          <p style={{ fontSize: 11, color: "#3a3a3a", marginBottom: 16, letterSpacing: "0.04em" }}>
            Week {CURRENT_WEEK} · {WEEK_THEME} · RPE {RPE_RANGE}
          </p>

          {(view === "program" || view === "coach") && (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", paddingBottom: 0 }}>
              {DAYS.map((d, i) => {
                const logged = !!sessionLogs[`w${CURRENT_WEEK}-d${d.id}`];
                return (
                  <button key={d.id} className={`day-tab${activeDay === i ? " active" : ""}${logged ? " logged" : ""}`}
                    style={{ "--accent": d.accent }} onClick={() => { setActiveDay(i); setShowWarmup(false); }}>
                    {d.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── BODY ── */}
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px 20px 60px" }}>

        {/* ── NEURO VIEW ── */}
        {view === "neuro" && (
          <NeuroSnackView />
        )}

        {/* ── SCHEDULE VIEW ── */}
        {view === "schedule" && (
          <ScheduleView />
        )}

        {/* ── COACH VIEW ── */}
        {view === "coach" && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 10, color: "#555", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 3 }}>Ask Coach · {day.label}</div>
                <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 700, color: day.accent }}>{day.title}</div>
              </div>
              <div style={{ fontSize: 10, color: "#3a3a3a", letterSpacing: "0.06em", textAlign: "right" }}>
                Context-aware<br />back-safe only
              </div>
            </div>
            <CoachChat key={`coach-${day.id}`} day={day} />
          </>
        )}

        {/* ── LOG VIEW ── */}
        {view === "log" && (
          <>
            <div style={{ fontSize: 10, letterSpacing: "0.15em", color: "#444", textTransform: "uppercase", marginBottom: 16 }}>Week {CURRENT_WEEK} — Session Log</div>

            {allLogged && (
              <div style={{ padding: "14px 18px", background: "#0a150a", border: "1px solid #1a3a1a", marginBottom: 20, fontSize: 12, color: "#4a8a6a", lineHeight: 1.6 }}>
                ✓ All 4 sessions logged. Come back to this chat and tell Claude <span style={{ color: "#6EC6A0" }}>"build my Week {CURRENT_WEEK + 1} program"</span> — your log will be included automatically.
              </div>
            )}

            {DAYS.map((d) => {
              const log = sessionLogs[`w${CURRENT_WEEK}-d${d.id}`];
              return (
                <div key={d.id} style={{ border: "1px solid #1e1e1e", background: "#111", padding: "16px 18px", marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: log ? 10 : 0 }}>
                    <div>
                      <div style={{ fontSize: 10, color: "#444", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 3 }}>{d.label}</div>
                      <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 14, fontWeight: 700, color: d.accent }}>{d.title}</div>
                    </div>
                    <button className="log-btn" onClick={() => setLogModal(d)}
                      style={{ background: log ? "transparent" : d.accent, color: log ? "#666" : "#0F0F0F", border: log ? "1px solid #2a2a2a" : "none", fontSize: 10 }}>
                      {log ? "Edit" : "Log →"}
                    </button>
                  </div>
                  {log && (
                    <div style={{ marginTop: 8 }}>
                      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", fontSize: 11, marginBottom: log.exercises ? 10 : 0 }}>
                        <span style={{ color: log.completed ? "#6EC6A0" : "#E87A5D" }}>{log.completed ? "✓ Completed" : "✗ Skipped"}</span>
                        {log.rpe && <span style={{ color: "#888" }}>RPE {log.rpe}</span>}
                        {log.date && <span style={{ color: "#444" }}>{log.date}</span>}
                      </div>
                      {log.exercises && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                          {Object.entries(log.exercises).map(([name, ex]) => {
                            if (!ex.difficulty && !ex.weight) return null;
                            const diffColor = ex.difficulty === "easy" ? "#6EC6A0" : ex.difficulty === "hard" ? "#E87A5D" : d.accent;
                            return (
                              <div key={name} style={{ fontSize: 10, color: "#555", display: "flex", gap: 10, alignItems: "center", letterSpacing: "0.03em" }}>
                                <span style={{ color: "#3a3a3a", flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</span>
                                {ex.difficulty && <span style={{ color: diffColor, flexShrink: 0 }}>{ex.difficulty === "easy" ? "too easy" : ex.difficulty === "hard" ? "too hard" : "just right"}</span>}
                                {ex.weight && !ex.performedBW && <span style={{ color: "#555", flexShrink: 0 }}>{ex.weight} {ex.unit || "lb"}{ex.weighted ? " added" : ""}</span>}
                                {ex.performedBW && <span style={{ color: "#6EC6A0", flexShrink: 0 }}>Bodyweight</span>}
                              </div>
                            );
                          })}
                        </div>
                      )}
                      {log.notes && <div style={{ fontSize: 11, color: "#555", marginTop: 6, lineHeight: 1.5, fontStyle: "italic" }}>"{log.notes}"</div>}
                    </div>
                  )}
                </div>
              );
            })}

            {logSaved && (
              <div style={{ padding: "10px 16px", background: "#0a150a", border: "1px solid #1a3a1a", fontSize: 11, color: "#4a8a6a", marginTop: 8 }}>
                ✓ Log saved — Claude can read this when you ask for next week's program
              </div>
            )}

            {/* Share with Claude button */}
            {weekLogs.length > 0 && (
              <ShareWithClaude sessionLogs={sessionLogs} weekNum={CURRENT_WEEK} />
            )}

            <div style={{ marginTop: 16, padding: "14px 18px", background: "#0d0d0d", border: "1px solid #1a1a1a", fontSize: 11, color: "#444", lineHeight: 1.7 }}>
              <div style={{ color: "#666", marginBottom: 4, letterSpacing: "0.08em", textTransform: "uppercase", fontSize: 10 }}>How to get next week's program</div>
              1. Log all 4 sessions above<br />
              2. Tap "Share with Claude" to copy your log<br />
              3. Paste it into this Claude conversation<br />
              4. Say <span style={{ color: "#888" }}>"build my Week {CURRENT_WEEK + 1} program"</span>
            </div>
          </>
        )}

        {/* ── PROGRAM VIEW ── */}
        {view === "program" && (
          <>
            {/* Logged badge */}
            {dayLog && (
              <div style={{ padding: "8px 14px", background: "#0a150a", border: "1px solid #1a3a1a", marginBottom: 16, fontSize: 11, color: "#3a6a4a", letterSpacing: "0.05em", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>✓ Logged · RPE {dayLog.rpe || "—"} · {dayLog.date}</span>
                <button onClick={() => setLogModal(day)} style={{ background: "none", border: "none", color: "#4a8a6a", fontFamily: "'DM Mono',monospace", fontSize: 10, cursor: "pointer", letterSpacing: "0.06em" }}>Edit</button>
              </div>
            )}

            {/* Quote */}
            <div style={{ borderLeft: `3px solid ${day.accent}`, paddingLeft: 16, marginBottom: 24 }}>
              <div style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(13px,3vw,17px)", fontWeight: 700, color: "#D0D0C8", lineHeight: 1.45, marginBottom: 6, fontStyle: "italic" }}>
                "{day.quote}"
              </div>
              <div style={{ fontSize: 11, color: "#555", letterSpacing: "0.1em", textTransform: "uppercase" }}>— {day.quoteAuthor}</div>
            </div>

            {/* Day title + log button */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 16 }}>
              <div>
                <span style={{ fontSize: 10, color: "#555", letterSpacing: "0.15em", textTransform: "uppercase" }}>{day.label} · Week {CURRENT_WEEK}</span>
                <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 700, color: day.accent, marginTop: 2 }}>{day.title}</h2>
              </div>
              <button className="log-btn" onClick={() => setLogModal(day)}
                style={{ background: dayLog ? "transparent" : day.accent, color: dayLog ? "#555" : "#0F0F0F", border: dayLog ? "1px solid #2a2a2a" : "none" }}>
                {dayLog ? "✓ Logged" : "Log Session"}
              </button>
            </div>

            {/* ── RUN CARD ── */}
            {(() => {
              const weekRuns = NRC_PROGRAM[CURRENT_WEEK]?.runs || [];
              const todayRuns = weekRuns.filter(r => r.day === ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][new Date().getDay()]);
              // Show run card on lift days that also have a run (Mon/Tue/Thu) or always show based on active day mapping
              const dayRunMap = { 1: "Monday", 2: "Tuesday", 3: "Thursday", 4: null };
              const runDay = dayRunMap[day.id];
              const run = runDay ? weekRuns.find(r => r.day === runDay) : null;
              if (!run) return null;
              const runKey = `w${CURRENT_WEEK}-run${run.runNum}`;
              const runStatus = runLogs[runKey];
              const effortColor = run.effort === "Easy" ? "#6EC6A0" : run.effort === "Race effort" ? "#E87A5D" : "#E8C547";
              return (
                <div style={{ border: "1px solid #1e3a2a", borderLeft: "3px solid #6EC6A0", background: "#0a150f", marginBottom: 16 }}>
                  <div style={{ padding: "12px 16px", borderBottom: "1px solid #1a2a20", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 16 }}>🏃</span>
                      <div>
                        <div style={{ fontSize: 10, color: "#4a8a6a", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 2 }}>
                          NRC Run to 5K · Week {CURRENT_WEEK} Run {run.runNum}
                        </div>
                        <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 14, fontWeight: 700, color: "#6EC6A0" }}>
                          {run.structure}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      {["done", "skipped"].map(s => (
                        <button key={s} onClick={() => saveRunLog(runKey, runStatus === s ? null : s)} style={{
                          padding: "6px 10px", fontFamily: "DM Mono,monospace", fontSize: 10,
                          letterSpacing: "0.07em", textTransform: "uppercase", cursor: "pointer",
                          border: "1px solid " + (runStatus === s ? (s === "done" ? "#6EC6A0" : "#E87A5D") : "#2a3a2a"),
                          background: runStatus === s ? (s === "done" ? "#0d2a1a" : "#2a0d0d") : "transparent",
                          color: runStatus === s ? (s === "done" ? "#6EC6A0" : "#E87A5D") : "#445a4a",
                        }}>
                          {s === "done" ? "✓ Done" : "✗ Skip"}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div style={{ padding: "10px 16px", display: "flex", gap: 16, flexWrap: "wrap", fontSize: 11, alignItems: "center" }}>
                    <span style={{ color: "#555" }}>⏱ {run.duration}</span>
                    <span style={{ color: "#6EC6A0" }}>📍 {run.distance}</span>
                    <span style={{ color: effortColor, border: "1px solid " + effortColor + "40", padding: "1px 7px", fontSize: 10, letterSpacing: "0.06em" }}>{run.effort}</span>
                    {runStatus === "done" && <span style={{ color: "#4a8a6a" }}>✓ Completed</span>}
                    {runStatus === "skipped" && <span style={{ color: "#8a4a4a" }}>Skipped</span>}
                  </div>
                  <div style={{ padding: "6px 16px", fontSize: 10, color: "#3a4a3a", letterSpacing: "0.05em", borderTop: "1px solid #1a2a1a" }}>
                    NRC is time-based — run for the duration above. Distance is approximate based on an easy pace.
                  </div>
                  <div style={{ padding: "8px 16px 12px", fontSize: 11, color: "#4a6a54", lineHeight: 1.6, borderTop: "1px solid #1a2a1a", fontStyle: "italic" }}>
                    {run.tip}
                  </div>
                </div>
              );
            })()}

            {/* Preview */}
            <div style={{ background: "#141414", border: "1px solid #222", borderTop: `2px solid ${day.accent}`, padding: "14px 18px", marginBottom: 16 }}>
              <div style={{ fontSize: 10, letterSpacing: "0.15em", color: "#555", textTransform: "uppercase", marginBottom: 8 }}>Session Overview</div>
              <p style={{ fontSize: 12, color: "#999", lineHeight: 1.7, margin: 0 }}>{day.preview}</p>
            </div>

            {/* Tips */}
            <div style={{ background: "#0d0d0d", border: "1px solid #1e1e1e", padding: "14px 18px", marginBottom: 20 }}>
              <div style={{ fontSize: 10, letterSpacing: "0.15em", color: "#555", textTransform: "uppercase", marginBottom: 10 }}>Coach's Tips</div>
              {day.tips.map((tip, i) => (
                <div key={i} style={{ display: "flex", gap: 10, marginBottom: i < day.tips.length - 1 ? 10 : 0, alignItems: "flex-start" }}>
                  <span style={{ color: day.accent, fontSize: 14, lineHeight: 1.4, flexShrink: 0 }}>›</span>
                  <p style={{ fontSize: 12, color: "#888", lineHeight: 1.6, margin: 0 }}>{tip}</p>
                </div>
              ))}
            </div>

            {/* Timer */}
            <div className="timer-block" style={{ marginBottom: 20 }}>
              <span>⏱ Between exercises: <strong style={{ color: "#aaa" }}>0–15 sec</strong></span>
              <span>⏱ Between supersets: <strong style={{ color: "#aaa" }}>60–90 sec</strong></span>
            </div>

            {/* Warmup */}
            <div style={{ marginBottom: 20 }}>
              <button className="toggle-btn" onClick={() => setShowWarmup(v => !v)}>
                {showWarmup ? "▲ Hide Warmup" : `▼ Phase SiX Warmup — ${day.title} (10 min)`}
              </button>
              {showWarmup && (
                <div style={{ border: "1px solid #222", borderTop: "none", background: "#111" }}>
                  <div style={{ padding: "10px 16px 6px", borderBottom: "1px solid #1e1e1e" }}>
                    <div style={{ fontSize: 10, color: "#888", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 2 }}>Phase SiX Style — Open Chain Mobility Prep</div>
                    <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 2fr", gap: 12, fontSize: 10, color: "#555", letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 8 }}>
                      <span>Movement</span><span>Volume</span><span>Focus</span>
                    </div>
                  </div>
                  {day.warmup.map((w, i) => (
                    <div key={i} style={{ padding: "10px 16px", borderBottom: i < day.warmup.length - 1 ? "1px solid #1a1a1a" : "none", display: "grid", gridTemplateColumns: "2fr 1fr 2fr", gap: 12, fontSize: 12, alignItems: "start" }}>
                      <div>
                        <div style={{ color: "#ccc" }}>{w.name}</div>
                        <div style={{ fontSize: 10, color: "#555", marginTop: 3, letterSpacing: "0.04em" }}>→ {w.cue}</div>
                      </div>
                      <span style={{ color: "#888", fontSize: 11 }}>{w.reps}</span>
                      <span style={{ color: "#666", fontSize: 11 }}>{w.focus}</span>
                    </div>
                  ))}
                  <div style={{ padding: "8px 16px", background: "#0d0d0d", borderTop: "1px solid #1e1e1e" }}>
                    <span style={{ fontSize: 10, color: "#555", letterSpacing: "0.08em" }}>~10 min · Slow and deliberate — feel every inch of range</span>
                  </div>
                </div>
              )}
            </div>

            {/* Travel mode toggle */}
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
              <button onClick={() => { setTravelMode(v => !v); setSwapped({}); }} style={{
                background: travelMode ? "#1a2a1a" : "transparent",
                border: "1px solid " + (travelMode ? "#4a8a4a" : "#2a2a2a"),
                color: travelMode ? "#6EC6A0" : "#555",
                fontFamily: "DM Mono,monospace", fontSize: 10, letterSpacing: "0.1em",
                textTransform: "uppercase", padding: "6px 12px", cursor: "pointer",
              }}>
                {travelMode ? "✓ Travel Mode — BW swaps active" : "No gym? Travel mode"}
              </button>
            </div>

            {/* Supersets */}
            {day.supersets.map((ss) => {
              const key = `${day.id}-${ss.id}`;
              const isOpen = openSets[key] !== false;
              return (
                <div key={ss.id} className="superset-card" style={{ "--accent": day.accent }}>
                  <div className="superset-header" onClick={() => toggleSet(key)}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 18, color: day.accent, lineHeight: 1 }}>{ss.id}</span>
                      <span style={{ fontSize: 12, color: "#aaa", letterSpacing: "0.04em" }}>{ss.name}</span>
                    </div>
                    <span style={{ color: "#555", fontSize: 14 }}>{isOpen ? "−" : "+"}</span>
                  </div>
                  {isOpen && (
                    <div>
                      {ss.exercises.map((ex, ei) => {
                        const meta = EXERCISE_META[ex.name] || {};
                        const swapKey = day.id + "-" + ss.id + "-" + ei;
                        const isSwapped = swapped[swapKey];
                        const bwEx = meta.bw;
                        const displayEx = (travelMode && isSwapped && bwEx) ? bwEx : ex;
                        const canSwap = travelMode && bwEx;
                        return (
                          <div key={ei}>
                            <div className="exercise-row" style={{ flexDirection: "column", gap: 6, alignItems: "stretch" }}>
                              {/* Swap badge */}
                              {canSwap && isSwapped && (
                                <div style={{ fontSize: 9, color: "#6EC6A0", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 2 }}>
                                  BW SWAP ACTIVE
                                </div>
                              )}
                              <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 8, alignItems: "start" }}>
                                <div>
                                  <div style={{ fontSize: 13, color: canSwap && isSwapped ? "#6EC6A0" : "#E8E8E0", marginBottom: 4, letterSpacing: "0.02em" }}>
                                    {displayEx.name}
                                  </div>
                                  <div style={{ fontSize: 11, color: "#666" }}>{displayEx.note}</div>
                                </div>
                                <div style={{ textAlign: "right", minWidth: 90 }}>
                                  <div style={{ fontSize: 12, color: "#aaa", marginBottom: 4 }}>
                                    <span style={{ color: day.accent }}>{displayEx.sets}</span> x <span>{displayEx.reps.replace(/\/side|\/arm|\/leg/i, "").trim()}</span>
                                  </div>
                                  {/* Per-side / per-arm label */}
                                  {/\/side|\/arm|\/leg/i.test(displayEx.reps) && (
                                    <div style={{ fontSize: 9, color: day.accent, letterSpacing: "0.1em", textTransform: "uppercase", opacity: 0.8, marginBottom: 4 }}>
                                      each side
                                    </div>
                                  )}
                                  <span className="badge">{displayEx.load}</span>
                                </div>
                              </div>
                              {/* Action row: Video + Swap */}
                              <div style={{ display: "flex", gap: 6, marginTop: 2 }}>
                                {meta.video && (
                                  <a href={meta.video} target="_blank" rel="noopener noreferrer" style={{
                                    fontSize: 10, color: "#E87A5D", letterSpacing: "0.08em",
                                    textTransform: "uppercase", textDecoration: "none",
                                    border: "1px solid #2a1a1a", background: "#1a0e0e",
                                    padding: "4px 8px", display: "inline-flex", alignItems: "center", gap: 4,
                                  }}>
                                    <span>▶</span> Watch
                                  </a>
                                )}
                                {canSwap && (
                                  <button onClick={() => setSwapped(prev => ({ ...prev, [swapKey]: !prev[swapKey] }))} style={{
                                    fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase",
                                    fontFamily: "DM Mono,monospace", cursor: "pointer", padding: "4px 8px",
                                    border: "1px solid " + (isSwapped ? "#2a4a2a" : "#2a2a2a"),
                                    background: isSwapped ? "#0d1a0d" : "transparent",
                                    color: isSwapped ? "#6EC6A0" : "#555",
                                  }}>
                                    {isSwapped ? "Undo swap" : "BW swap"}
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Rules */}
            <div style={{ marginTop: 28 }}>
              <div style={{ fontSize: 10, letterSpacing: "0.15em", color: "#444", textTransform: "uppercase", marginBottom: 12 }}>Session Rules</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {["🔴 No spinal flexion under load", `🟡 RPE cap: ${RPE_RANGE}`, "🟢 Back talks → skip that exercise", "🔵 Share Day 2 with your PT", "⚪ Earn the hinge back slowly"].map((r, i) => (
                  <div key={i} className="rule-chip">{r}</div>
                ))}
              </div>
            </div>

            {/* Cooldown */}
            {(() => {
              const cooldown = COOLDOWNS[day.id] || [];
              return (
                <div style={{ marginTop: 28, border: "1px solid #222", background: "#111" }}>
                  <div style={{ padding: "10px 16px", borderBottom: "1px solid #1e1e1e", display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 10, letterSpacing: "0.15em", color: "#555", textTransform: "uppercase" }}>Decompression · Phase SiX Style · 5 min</span>
                    <span style={{ fontSize: 10, color: "#444" }}>Today's cooldown</span>
                  </div>
                  {cooldown.map((c, i) => (
                    <div key={i} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 2fr", gap: 12, padding: "10px 16px", borderBottom: i < cooldown.length - 1 ? "1px solid #1a1a1a" : "none", fontSize: 12, alignItems: "center" }}>
                      <span style={{ color: "#ccc" }}>{c.name}</span>
                      <span style={{ color: day.accent, fontSize: 11 }}>{c.reps}</span>
                      <span style={{ color: "#666", fontSize: 11 }}>{c.focus}</span>
                    </div>
                  ))}
                </div>
              );
            })()}

            {/* Log CTA — hidden once logged */}
            {!dayLog && (
              <div style={{ marginTop: 20, padding: "14px 18px", background: "#111", border: "1px solid #1e1e1e", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                <span style={{ fontSize: 11, color: "#555", letterSpacing: "0.05em" }}>Done with this session?</span>
                <button className="log-btn" onClick={() => setLogModal(day)}
                  style={{ background: day.accent, color: "#0F0F0F", border: "none", fontWeight: 500 }}>
                  Log It →
                </button>
              </div>
            )}

            <div style={{ marginTop: 16, padding: "10px 16px", background: "#0d0d0d", border: "1px solid #1a1a1a", fontSize: 11, color: "#444", letterSpacing: "0.04em" }}>
              Mobility inspired by Steph Rose / Phase SiX — <span style={{ color: "#555" }}>phase6online.com</span>
            </div>
          </>
        )}
      </div>

      {/* ── LOG MODAL ── */}
      {logModal && (
        <LogModal day={logModal} weekNum={CURRENT_WEEK} onSave={saveLog} onClose={() => setLogModal(null)}
          existingLog={sessionLogs[`w${CURRENT_WEEK}-d${logModal.id}`]}
          unit={unit} saveUnit={saveUnit} />
      )}
    </div>
  );
}
