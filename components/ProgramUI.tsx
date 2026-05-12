// @ts-nocheck
'use client'

import { useState, useEffect, useRef } from 'react'
import {
  CURRENT_WEEK,
  WEEK_THEME,
  RPE_RANGE,
  NRC_RUN_DAYS,
  NRC_PROGRAM,
  WEEKLY_SCHEDULE,
  NEURO_SNACKS,
  DAYS,
  COOLDOWNS,
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
// ─── EXERCISE VIDEO + BODYWEIGHT SWAP DATA ─────────────────────────────────
const EXERCISE_META = {
  "KB Goblet Press (kneeling)": {
    video: "https://www.youtube.com/watch?v=INDieUDCYVg",
    videoLabel: "Kettlebell Tall Kneeling Press",
    bw: { name: "Pike Push-Up (kneeling)", sets: "3", reps: "10", load: "Bodyweight", note: "Kneel, hinge at hip, press head toward floor. Same shoulder pattern, zero load." },
  },
  "DB Lateral Raise": {
    video: "https://www.youtube.com/watch?v=3VcKaXpzqRo",
    videoLabel: "DB Lateral Raise Tutorial",
    bw: { name: "Side-Lying External Rotation", sets: "3", reps: "15/side", load: "Bodyweight", note: "Lie on side, rotate top arm up from elbow. Trains same delt stabilisers." },
  },
  "DB Floor Press": {
    video: "https://www.youtube.com/watch?v=uUGDRwge4F8",
    videoLabel: "DB Floor Press Tutorial",
    bw: { name: "Push-Up (floor, elbows 45)", sets: "3", reps: "10-15", load: "Bodyweight", note: "Hands shoulder-width, elbows at 45 degrees. Lower chest to floor, pause, press." },
  },
  "Dead Bug": {
    video: "https://www.youtube.com/watch?v=bxn9FBrt4-A",
    videoLabel: "Dead Bug — NASM Tutorial",
    bw: null,
  },
  "Dead Bug (opposite limb)": {
    video: "https://www.youtube.com/watch?v=bxn9FBrt4-A",
    videoLabel: "Dead Bug — NASM Tutorial",
    bw: null,
  },
  "DB Farmer Carry": {
    video: "https://www.youtube.com/watch?v=rt17lmnaLSM",
    videoLabel: "Farmer Carry Tutorial",
    bw: { name: "Suitcase Walk (heavy bag)", sets: "3", reps: "20m/side", load: "Bodyweight", note: "Use any heavy bag, backpack, or water jug. Same loaded carry stimulus." },
  },
  "Plank Shoulder Tap": {
    video: "https://www.youtube.com/watch?v=1JaT5GFCSYY",
    videoLabel: "Plank Shoulder Tap Tutorial",
    bw: null,
  },
  "KB Hip Thrust (floor, feet on bench)": {
    video: "https://www.youtube.com/watch?v=29OfN4ztW_g",
    videoLabel: "Dumbbell Hip Thrust Tutorial",
    bw: { name: "Glute Bridge (floor, bodyweight)", sets: "4", reps: "15", load: "Bodyweight", note: "Feet flat on floor. Drive through heels, posterior tilt at top. 3-sec hold." },
  },
  "KB Romanian Deadlift": {
    video: "https://www.youtube.com/watch?v=0qYUHZOVKus",
    videoLabel: "KB Romanian Deadlift",
    bw: { name: "Single-Leg Hip Hinge (BW)", sets: "4", reps: "8/side", load: "Bodyweight", note: "Stand on one leg, hinge at hip, arms hang. Pure hamstring stretch pattern." },
  },
  "Reverse Lunge (DB)": {
    video: "https://www.youtube.com/watch?v=xrPteyQLGAo",
    videoLabel: "Reverse Lunge Tutorial",
    bw: { name: "Reverse Lunge (bodyweight)", sets: "3", reps: "10/side", load: "Bodyweight", note: "Same movement, no load. Focus on torso staying vertical throughout." },
  },
  "Side-Lying Hip Abduction": {
    video: "https://www.youtube.com/watch?v=5-RkRXWFQZE",
    videoLabel: "Side-Lying Hip Abduction",
    bw: null,
  },
  "Nordic Curl Eccentric (5-sec)": {
    video: "https://www.youtube.com/watch?v=_e9vFU9-tkc",
    videoLabel: "Nordic Curl Technique — E3 Rehab",
    bw: null,
  },
  "Pallof Press Hold (band)": {
    video: "https://www.youtube.com/watch?v=DR5F7K0iwSs",
    videoLabel: "Pallof Press Tutorial",
    bw: { name: "Hollow Body Hold", sets: "3", reps: "20-30 sec", load: "Bodyweight", note: "Lie on back, lower back flat, arms overhead, legs extended low. Pure anti-extension." },
  },
  "Pallof Press (band)": {
    video: "https://www.youtube.com/watch?v=DR5F7K0iwSs",
    videoLabel: "Pallof Press Tutorial",
    bw: { name: "Hollow Body Hold", sets: "4", reps: "20-30 sec", load: "Bodyweight", note: "Lie on back, lower back flat, arms overhead, legs extended low. Pure anti-extension." },
  },
  "Pull-Up": {
    video: "https://www.youtube.com/watch?v=eGo4IYlbE5g",
    videoLabel: "Pull-Up Form & Technique — Alan Thrall",
    bw: null,
  },
  "DB Single-Arm Row (half-kneeling)": {
    video: "https://www.youtube.com/watch?v=pYcpY20QaE8",
    videoLabel: "Single Arm Row Tutorial",
    bw: { name: "Inverted Row (under a table)", sets: "3", reps: "10", load: "Bodyweight", note: "Lie under a sturdy table, grip edge, row chest to surface. Excellent pull pattern." },
  },
  "Band Pull-Apart": {
    video: "https://www.youtube.com/watch?v=QKAGrMhZKWQ",
    videoLabel: "Band Pull-Apart Tutorial",
    bw: { name: "Prone Y Raise", sets: "3", reps: "12", load: "Bodyweight", note: "Lie face down, thumbs up, raise arms to Y shape. Same rear delt and mid trap." },
  },
  "DB Hammer Curl": {
    video: "https://www.youtube.com/watch?v=zC3nLlEvin4",
    videoLabel: "Hammer Curl Form Tutorial",
    bw: { name: "Towel Curl (isometric)", sets: "3", reps: "10", load: "Bodyweight", note: "Step on a towel, curl it up with neutral grip hands. Surprisingly effective." },
  },
  "Face Pull (band)": {
    video: "https://www.youtube.com/watch?v=rep-qVOkqgk",
    videoLabel: "Face Pull Tutorial",
    bw: { name: "Prone W Raise", sets: "3", reps: "12", load: "Bodyweight", note: "Lie face down, arms in W shape, pull elbows back and rotate thumbs up. Same pattern." },
  },
  "Suitcase Carry": {
    video: "https://www.youtube.com/watch?v=GD30TnrCtmA",
    videoLabel: "Suitcase Carry Tutorial",
    bw: { name: "Overhead Book Carry", sets: "3", reps: "20m/side", load: "Bodyweight", note: "Balance a heavy book flat on your palm, arm fully extended. Same shoulder stability demand." },
  },
  "Goblet Squat (KB)": {
    video: "https://www.youtube.com/watch?v=MxsFDhcyFyE",
    videoLabel: "Goblet Squat — Dan John",
    bw: { name: "Bodyweight Squat (arms forward)", sets: "4", reps: "12", load: "Bodyweight", note: "Arms extended forward for counterbalance. Same depth, same chest-up cue." },
  },
  "Split Squat (BB front rack, light)": {
    video: "https://www.youtube.com/watch?v=U8HBdDvBGm8",
    videoLabel: "Split Squat Tutorial",
    bw: { name: "Bodyweight Split Squat", sets: "3", reps: "10/side", load: "Bodyweight", note: "Same movement, no bar. Hands on hips. Torso stays vertical the whole time." },
  },
  "Glute Bridge (BB, light)": {
    video: "https://www.youtube.com/watch?v=29OfN4ztW_g",
    videoLabel: "Hip Thrust and Glute Bridge Tutorial",
    bw: { name: "Glute Bridge (single-leg)", sets: "3", reps: "12/side", load: "Bodyweight", note: "One foot on floor, other leg extended. Harder than it looks. Posterior tilt at top." },
  },
  "KB Waiter Carry": {
    video: "https://www.youtube.com/watch?v=4tHDYslPY0U",
    videoLabel: "Waiter Carry Tutorial",
    bw: { name: "Overhead Book Carry", sets: "3", reps: "20m/side", load: "Bodyweight", note: "Balance a heavy book flat on your palm, arm fully extended. Same shoulder stability demand." },
  },
  "Crocodile Breathing": {
    video: "https://www.youtube.com/watch?v=di9SzPsBlEs",
    videoLabel: "Crocodile Breathing Tutorial",
    bw: null,
  },
};

// ─── OFFLINE COACH ENGINE ──────────────────────────────────────────────────
const EXERCISE_KNOWLEDGE = {
  "KB Goblet Press (kneeling)": {
    cue: "Grip the KB horns, elbows at 45 degrees from your torso — not flared wide. Press straight up, don't let the bell tip forward. At the top, think 'tall spine' not 'lean back.'",
    why: "Kneeling kills the spinal load you'd get standing. All the pressing stimulus, zero compression on the disc. It also forces your core to work without a bench to lean on.",
    sub: "Seated DB shoulder press on a box or bench. Keep the backrest upright if you have one.",
    back: "If you feel anything in your lumbar, check your anterior pelvic tilt — kneeling on a hard surface can exaggerate the arch. Tuck the pelvis slightly before you press.",
    form: "Kneel tall — don't sit back on your heels. Ribs down, glutes squeezed lightly. Press the bell up in a straight line, not forward.",
  },
  "DB Lateral Raise": {
    cue: "Lead with your elbows, not your hands. Slight forward lean at the hip. Stop at shoulder height — going higher recruits traps, not delts.",
    why: "Pure medial delt isolation with zero spinal load. Builds the shoulder width that keeps your posture strong and protective over the long term.",
    sub: "Band lateral raise — anchor a band under your foot. Same movement, lighter resistance curve.",
    back: "This is one of the safest shoulder movements for your back. If you feel it there, you're probably swinging — drop the weight and go slower.",
    form: "Slight bend in the elbow, slight forward lean at the hip. Don't shrug. Don't swing. Slow on the way down — 2-3 seconds eccentric.",
  },
  "DB Floor Press": {
    cue: "Lie flat, knees bent, feet flat. Lower the DBs until your triceps touch the floor — pause there for 1 second, then press. That pause eliminates stretch reflex and builds real strength.",
    why: "The floor stops your range of motion before your shoulder gets into an impingement position. Safer than a bench press for your shoulder and completely removes spinal compression.",
    sub: "KB Floor Press — same movement, the KB naturally centres better in the hand for some people.",
    back: "Lying flat is one of the best positions for your disc. If your lower back arches off the floor, bend your knees more and push your feet into the ground.",
    form: "Elbows at 45 degrees, not 90. Touch the triceps to the floor, pause, press. Don't bounce off the floor.",
  },
  "Dead Bug": {
    cue: "Lower back stays glued to the floor the entire time. Breathe out fully before you move. Extend opposite arm and leg simultaneously — slow, controlled. If your back lifts, you've gone too far.",
    why: "This is your spine's seatbelt. It trains deep core stability — the muscles that actually protect your disc — without any flexion or compression. Pure PT gold.",
    sub: "Heel slide — lie on your back, slide one heel away from you while keeping your lower back flat. Easier version, same muscle pattern.",
    back: "This IS a back exercise. If your lower back lifts off the floor at any point, stop and reset. Shorten the range of motion — half extension is better than full extension with a lifted back.",
    form: "Exhale fully to brace. Move opposite arm and leg together. Return slowly. Never hold your breath. Think 'ribs to pelvis' throughout.",
  },
  "DB Farmer Carry": {
    cue: "Stand tall like someone has a string pulling the top of your head up. Pack your shoulders — think 'proud chest.' Walk slowly and deliberately. Your body should look completely relaxed from a distance.",
    why: "Moving meditation for your spine. Loaded carries build the lateral stability and grip strength that protects your back under real-world load. The compression is axial — straight down — which your discs actually handle well.",
    sub: "KB Farmer Carry — identical. Suitcase carry — one-sided, even harder for the lateral core.",
    back: "If you feel your lower back during the carry, you're probably letting your pelvis shift side to side. Tighten your glutes slightly and shorten your steps.",
    form: "Tall spine, packed shoulders, relaxed arms. Breathe normally. Don't lean toward the weights. Short steps.",
  },
  "Plank Shoulder Tap": {
    cue: "Set up in a perfect plank first — hands under shoulders, body in a straight line, glutes squeezed. When you lift a hand to tap, your hips should not move at all. If they rotate, widen your feet.",
    why: "Anti-rotation core training. Your spine needs to resist movement, not just create it. This teaches the deep stabilisers to hold position while your limbs move — exactly what protects your disc.",
    sub: "Plank hold — just hold the position without tapping if the rotation is too hard to control yet.",
    back: "If you feel your lower back in a plank, you're probably sagging through the hips. Squeeze your glutes hard and push the floor away with your hands.",
    form: "Wide feet for stability. Move slowly — tap and return, don't rush. Breathe throughout. Hips stay level.",
  },
  "KB Hip Thrust (floor, feet on bench)": {
    cue: "Drive through your heels, not your toes. At the top, posterior tilt — tuck your pelvis under — don't hyperextend your lower back. Squeeze your glutes hard for a full second at the top.",
    why: "The single most important exercise for your back health. Strong glutes take load off the lumbar spine. Every session this gets stronger, your back gets safer.",
    sub: "Glute bridge on the floor — feet flat, no bench. Easier version, same muscle.",
    back: "At the top of the movement, if you feel your lower back, you've gone too high. Stop at hip level and focus on the glute squeeze, not the height.",
    form: "Upper back on the bench edge, not mid-back. Feet flat, hip-width. Drive hips up, squeeze at top, lower slow. Don't let the KB roll.",
  },
  "KB Romanian Deadlift": {
    cue: "Push your hips back — don't bend your knees to go lower. The KB travels close to your legs. Stop when you feel a strong hamstring stretch, NOT when you feel your lower back.",
    why: "Hip hinge pattern — the safest way to load your posterior chain. Mid-shin only this week means we keep the spine loaded but not at end range where disc risk increases.",
    sub: "Single-leg RDL with bodyweight — much lighter stimulus, better balance challenge.",
    back: "This is the exercise to be most careful with. The moment you feel lumbar rounding, stop and reset. Hinge from the hip, not the lower back. Never sacrifice neutral spine for more range.",
    form: "Soft knee, not locked. Push hips back as if closing a car door with your glutes. Neutral spine the whole way. Stop at mid-shin.",
  },
  "Reverse Lunge (DB)": {
    cue: "Step back, not forward. Your front knee stays over your front ankle — don't let it cave in. Torso stays tall and upright throughout. Think 'lower straight down' not 'lean forward.'",
    why: "Reverse lunges are safer than forward lunges for the back because the deceleration force is lower. Single-leg work also exposes and corrects strength imbalances between sides.",
    sub: "Split squat — same position, no stepping. Just hold the split stance and go straight up and down.",
    back: "If you feel your lower back, your torso is probably leaning forward. Tall spine, chest up. Hold the DBs by your sides rather than in front if needed.",
    form: "Step back far enough that your front shin stays vertical. Lower until back knee is just off the floor. Drive through the front heel to return.",
  },
  "Side-Lying Hip Abduction": {
    cue: "Lie on your side, body in a straight line. Lift the top leg with your heel slightly higher than your toes — this targets glute med, not TFL. Pause at the top for a second.",
    why: "Glute med is the hip stabiliser that prevents the pelvis from dropping when you walk or stand on one leg. Weakness here puts enormous stress on the lower back. This is PT staple work.",
    sub: "Standing hip abduction with a band — same muscle, just standing.",
    back: "This is completely back-safe. Lying on your side is a great position for your disc. If you feel it in your lower back, make sure your body is in a straight line — not curved.",
    form: "Don't let your pelvis roll back to lift the leg higher. Small, controlled range beats big sloppy movement. Heel slightly higher than toes.",
  },
  "Nordic Curl Eccentric (5-sec)": {
    cue: "Anchor your feet under something heavy. Start upright. Lower yourself as slowly as possible — 5 full seconds. Catch yourself with your hands when you can't hold any longer. That's one rep.",
    why: "The most effective hamstring exercise in existence for injury prevention. Eccentrics build the tendon resilience and length-tension strength that protects both hamstrings and lower back.",
    sub: "Hamstring curl with a band around a rack — lie prone, curl band toward your glutes. Much easier version.",
    back: "Keep your hips extended throughout — don't let them flex as you lower. Your body should be one straight line from knee to head as you descend.",
    form: "Slow is everything here. 5 seconds minimum on the way down. Don't rush. Catch yourself, reset, repeat. Three to five reps is plenty.",
  },
  "Pallof Press Hold (band)": {
    cue: "Stand sideways to the anchor. Pull the band to your chest, then press straight out. Hold. The challenge is not rotating toward the anchor. Breathe normally while holding.",
    why: "Anti-rotation core training — training your spine to resist twisting forces, which is what actually protects your disc in real life. This directly mirrors what your PT is working on.",
    sub: "Half-kneeling Pallof press — get into a half-kneeling position for extra hip stability challenge.",
    back: "This is pure back protection work. Safe at any stage of disc rehab. If you feel anything unusual, check that the band isn't pulling you into rotation and reduce the resistance.",
    form: "Feet shoulder-width, slight knee bend. Press straight out from your chest, not diagonally. Hold the press position. Exhale on the press.",
  },
  "Pull-Up": {
    cue: "Dead hang start — full arm extension at the bottom every rep. Pull your elbows down and back toward your hips, not out to the sides. Chin clears the bar, then lower slowly — 3 seconds on the way down.",
    why: "The gold standard of vertical pulling. Now that you are pain-free overhead, pull-ups build the lat, rhomboid, and bicep strength that no row can fully replicate. The vertical pulling plane is essential for complete back development and shoulder health.",
    sub: "Band-assisted pull-up — loop a resistance band over the bar, kneel or place foot in it. Same movement pattern with less load.",
    back: "You confirmed these are pain-free — that is the green light. If you ever feel anything in your lower back during a pull-up, stop immediately and check that you are not hyperextending at the bottom of the hang. Brace your core lightly throughout.",
    form: "Dead hang, full extension. No kipping — strict reps only. Pull elbows down to hips. Stop 2 reps short of failure — this is Week 1, build the pattern first. Lower with control.",
  },
  "DB Single-Arm Row (half-kneeling)": {
    cue: "Half-kneeling means one knee down, one foot forward. Place the same-side hand on your thigh for support. Row the DB to your hip, not your shoulder. Elbow drives straight back.",
    why: "Kneeling removes spinal compression while still letting you row heavy. Pulling strength is posture — every row you do makes your upper back stronger and counteracts the forward slouch that compresses discs.",
    sub: "Seated cable row — sit tall on a box, use a band anchored low.",
    back: "Half-kneeling locks your spine in place. Don't rotate your torso to get more range — that's your back compensating. Row only as far as your shoulder allows.",
    form: "Neutral spine, don't twist. Drive the elbow back, not out. Squeeze the shoulder blade at the top. Lower slowly — 3 seconds.",
  },
  "Band Pull-Apart": {
    cue: "Hold the band at shoulder height, arms straight. Pull it apart until it touches your chest. Squeeze your shoulder blades together at the end position. Don't let your elbows bend.",
    why: "The most underrated exercise in this program. Directly trains the rear delts and mid-traps that are chronically weak in people who sit. These muscles hold your posture upright and take pressure off the disc.",
    sub: "Prone Y/T/W — lie face down and make those shapes with your arms. Same muscles, no band needed.",
    back: "Zero spinal load. Do these between every set if you want. More volume here is almost always better.",
    form: "Straight arms, constant tension. Don't rush. Palms facing down for standard, palms up for more external rotation.",
  },
  "DB Hammer Curl": {
    cue: "Neutral grip — thumbs up, palms facing each other. Keep your elbows pinned to your sides. Don't swing or lean back to get the weight up. Lower slowly — 3 seconds.",
    why: "Hammer grip targets the brachialis and brachioradialis alongside the bicep. Builds more overall arm strength than a supinated curl and is easier on the elbow joint.",
    sub: "Band curl — anchor a band under your feet, curl with the same hammer grip.",
    back: "Zero direct back involvement. If you feel your lower back, you're swinging — reduce the weight.",
    form: "Stand tall, elbows at your sides. Curl, pause at the top, lower slow. Don't let the elbows drift forward.",
  },
  "Face Pull (band)": {
    cue: "Anchor the band at face height. Pull toward your face with your elbows high and wide. At the end of the pull, externally rotate — think 'double bicep pose.' Hold for a second.",
    why: "Rear delt and external rotator work. These muscles are almost always undertrained and their weakness contributes to shoulder impingement and poor posture. Non-negotiable for long-term shoulder health.",
    sub: "Prone Y raise — lie face down, arms at Y position, thumbs up. Lift and lower. Same muscles.",
    back: "Safe in all positions. If standing bothers you, do these seated on a box.",
    form: "Elbows high, above shoulder height. Pull to your face, not your chin. The external rotation at the end is the whole point — don't skip it.",
  },
  "Suitcase Carry": {
    cue: "Hold the KB in one hand. Walk. Don't lean toward it — stand completely tall as if there's no weight. Your outside oblique and QL are working to keep you upright.",
    why: "Lateral core anti-bending. In real life your spine constantly has to resist side-bending forces. This trains exactly that — and does it through loaded movement, which is more functional than any plank.",
    sub: "Farmer carry — bilateral, easier to balance. Work up to suitcase.",
    back: "If you feel your lower back during the carry, you're letting your pelvis hike on the weighted side. Concentrate on keeping your hips level.",
    form: "Packed shoulder on the working side. Walk tall. Short steps. Breathe normally. Don't look at the weight.",
  },
  "Goblet Squat (KB)": {
    cue: "Hold the KB by the horns at chest height. Elbows inside your knees at the bottom. Sit into it — spend time at the bottom. Drive through your heels to stand.",
    why: "The counterbalance weight keeps your chest tall and prevents forward lean. This is the safest squat pattern for a herniated disc because the load is anterior and keeps your spine in extension.",
    sub: "Bodyweight squat — same pattern, no load. Or TRX squat holding a strap for counterbalance.",
    back: "Sit into the squat rather than grinding down. At the bottom, your elbows should push your knees out. If you feel lower back at the bottom, limit depth and work on hip mobility first.",
    form: "Feet slightly wider than hip-width, toes out 15-30 degrees. Kneel, don't crumple. Tall chest through the whole movement.",
  },
  "Pallof Press (band)": {
    cue: "Stand sideways to the anchor. Pull the band to your chest, then press straight out and hold. Your whole job is not rotating. Breathe while holding the pressed position.",
    why: "Anti-rotation core work. Your disc is most vulnerable to rotational forces under load. This directly trains your spine to resist that. Every rep is protective.",
    sub: "Kneeling Pallof press — takes the legs out of it and makes the core work harder.",
    back: "This is rehabilitation work as much as training. There is no wrong time to do more Pallof presses.",
    form: "Don't let the band pull you into rotation. Press straight out from the sternum. Hold the pressed position. Exhale on the press.",
  },
  "Split Squat (BB front rack, light)": {
    cue: "Front rack keeps the torso vertical — that's why we do it this way. Take a long enough stance that your front shin stays vertical. Lower straight down, drive straight up.",
    why: "Front rack position prevents forward lean, keeping spinal load minimal. Split stance means half the load on each leg and exposes asymmetries that could be contributing to back issues.",
    sub: "Bodyweight split squat or DB split squat at your sides — easier front rack alternative.",
    back: "Front rack is non-negotiable here. The moment you rack the bar on your back, the spinal loading changes completely. Keep it in front.",
    form: "Upright torso, chest tall. Don't let the front knee cave. Back knee drops straight down. Drive through the front heel.",
  },
  "Glute Bridge (BB, light)": {
    cue: "Bar across your hips with a pad. Feet flat, hip-width. Drive through heels, posterior tilt at the top — tuck your pelvis, don't hyperextend. Squeeze glutes hard at the top.",
    why: "Loaded glute activation. Stronger glutes mean less lumbar compensation in every movement you do. This is direct back protection.",
    sub: "KB Hip Thrust or bodyweight glute bridge — same pattern, less load.",
    back: "Posterior tilt at the top is critical. Hyperextending the lower back at the top of a bridge is a common error that loads the disc. Tuck, squeeze, lower.",
    form: "Bar stays on your hips throughout. Drive through heels. Full hip extension at the top with a pelvic tuck. Lower with control.",
  },
  "KB Waiter Carry": {
    cue: "Press the KB overhead, palm facing forward. Stack wrist over elbow over shoulder. Walk tall. Your job is to keep the KB completely still while your legs move beneath it.",
    why: "Overhead stability under load. Trains the shoulder stabilisers and serratus anterior that protect the shoulder joint. The walking component adds core anti-lateral-flexion under a more demanding load.",
    sub: "Bottoms-up KB carry — KB upside down, much harder for the shoulder. Or plate overhead carry.",
    back: "If you feel your lower back during this, your rib cage is probably flaring. Pull your ribs down and brace your core before you walk.",
    form: "Shoulder packed, not elevated. Elbow locked. Core braced. Look forward not up at the bell. Short steps.",
  },
  "Crocodile Breathing": {
    cue: "Lie face down, forehead on your hands. Breathe in through your nose — feel your back body expand, your lower back rise. Exhale fully. No chest movement. All breath goes into the back.",
    why: "Retrains diaphragmatic breathing. Most people breathe into their chest and never engage the posterior diaphragm. This activates the deep stabilisers — multifidus, QL — that directly support the disc.",
    sub: "Supine belly breathing — same concept on your back if prone is uncomfortable.",
    back: "This IS the back exercise. It is impossible to do this wrong in a way that hurts your back. Relax into it completely.",
    form: "Completely passive. No bracing, no forcing. Just breathe into your back and feel it expand. Exhale fully before the next breath.",
  },
  "Deficit Push-Up (hands on dip bar handles)": {
    cue: "Hands on the dip bar handles, body in a straight line. Lower slowly until you feel a deep chest stretch — well below where a floor push-up would stop. Pause 1 second at the bottom, then press. Elbows at 45 degrees, not flared wide.",
    why: "The deficit gives you a full range of motion that the floor cuts short. That bottom range is where the pec gets fully loaded and where real tissue strength is built. You logged this felt better than floor press — it is better.",
    sub: "Floor push-up — same movement, shorter range. Or elevate hands on a bench for a partial deficit.",
    back: "Push-ups are completely spine-safe. If you feel your lower back during a push-up you're sagging through the hips — squeeze your glutes and push the floor away.",
    form: "Straight line from head to heels. Elbows at 45 degrees. Lower to full stretch, 1-second pause, press. Don't let your hips rise or drop.",
  },
  "Dip (bodyweight, upright torso)": {
    cue: "Grip the bars, lock out at the top, lower yourself with elbows tracking back — not out wide. Stay as upright as possible. Touch the bottom when your upper arms are parallel to the floor, then press back up.",
    why: "Dips are a vertical press that hits the lower chest, anterior deltoid, and tricep in a way no horizontal press can replicate. Upright torso keeps the load on the tricep and reduces shoulder impingement risk.",
    sub: "Bench dip — hands on bench behind you, feet on floor. Lower load, same pressing pattern.",
    back: "Keep your torso upright — leaning too far forward loads the lower back. If you feel lumbar discomfort, you're leaning. Sit tall on the bars.",
    form: "Upright torso throughout. Elbows go back, not out. Control the lowering — 2 seconds down. Don't lock out aggressively at the top.",
  },
  "Heel Tap (supine)": {
    cue: "Lie on your back, knees bent, feet flat. Flatten your lower back into the floor — hold it there. Slowly lower one heel to tap the floor, return, switch sides. The moment your lower back lifts, you've gone too far.",
    why: "This is the dead bug regression. Your log showed dead bugs were too hard to breathe through. Heel taps teach the same lower back stability pattern — lower back pinned, core braced — but with less lever arm. You'll progress back to dead bugs once this is consistent.",
    sub: "Bent knee hold — just hold knees at 90 degrees with lower back flat. Even easier regression if heel taps are too challenging.",
    back: "This is literally a back rehabilitation exercise. Lower back must stay flat the entire time. If it lifts, the range is too big. Shorten the movement.",
    form: "Lower back glued to floor before you move anything. Slow alternate heel taps. Exhale as you lower. Never sacrifice the back position for range.",
  },
  "Slant Board Reverse Lunge (DB)": {
    cue: "Stand on the slant board with heels elevated. Step one foot back into a reverse lunge. The front knee stays over the front ankle — don't let it cave in. Lower until back knee is just off the floor. Drive back up through the front heel. Torso stays tall the entire time.",
    why: "The slant board heel elevation shifts the loading pattern significantly — more quad stimulus, deeper range of motion, and the torso naturally stays more upright which means your spine stays safer. It changes a simple reverse lunge into a much more potent movement.",
    sub: "Flat ground reverse lunge — same movement without the elevated heel. Step back, keep torso upright.",
    back: "The upright torso from the slant board is actually better for your back than a flat ground lunge. If you feel your lower back, your torso is leaning forward — the board should be preventing that. Check that you're using it correctly.",
    form: "Heels on the slope, toes toward the edge. Step back far enough that the front shin stays vertical. Lower straight down, drive through front heel to return.",
  },
  "KB Staggered Stance RDL": {
    cue: "Stand with most of your weight on the front leg — back foot barely touches the floor for balance only. Hold KB in opposite hand to the front leg. Hinge at the hip, pushing your hips back. Stop when you feel a strong hamstring stretch, not when you feel your lower back.",
    why: "The staggered stance is the progression between bilateral RDL and single-leg RDL. It loads one hamstring significantly more than the other, corrects left-right imbalances, and increases the hip stability demand without the full balance challenge of a single-leg version.",
    sub: "Bilateral KB RDL — both feet even, same hinge pattern but less single-leg demand.",
    back: "Same rule as all hinges — the moment you feel lumbar rounding or your lower back working harder than your hamstrings, stop. Neutral spine is non-negotiable on any RDL variation.",
    form: "90% weight on front leg. Hip hinge — push hips back, not down. Neutral spine throughout. Stop at mid-shin depth. Drive through front heel to stand.",
  },
  "Chest-Supported KB Row (incline bench)": {
    cue: "Set incline bench to 45-60 degrees. Lie chest-down on it, feet on the floor. Row the KB up to your hip — elbow drives back and up. Your chest stays in contact with the bench the entire set. If you're rising up to get more range, the weight is too heavy.",
    why: "The chest support completely eliminates lumbar compensation. In a standing or bent-over row your lower back has to stabilise under load. Here it doesn't — which means 100% of the demand goes to the lat, rhomboid, and rear delt. Pure pulling stimulus.",
    sub: "Half-kneeling DB row — one knee down, same rowing pattern. Less spinal support but still safe.",
    back: "This is one of the most back-safe rowing variations possible. Chest is on the bench, spine is supported. If you feel your lower back, check that you're not raising your torso off the bench.",
    form: "Chest on bench throughout. Elbow drives back toward hip, not out to the side. Full hang at the bottom, squeeze the shoulder blade at the top. 3-second lowering.",
  },
  "KB Hip Thrust (bench, 3-sec squeeze)": {
    cue: "Upper back on the bench edge — not mid-back. Feet flat, hip-width. Drive through heels, posterior tilt at the top — tuck pelvis under, don't hyperextend. Squeeze the glutes hard for 3 full seconds at the top. Lower with control.",
    why: "Adding the 3-second hold at the top dramatically increases time under tension in the fully shortened position. This is where the glute is maximally contracted. More time there means more stimulus for the muscle that protects your lower back.",
    sub: "Glute bridge on the floor — bodyweight or KB across hips. Feet flat, same posterior tilt cue.",
    back: "Posterior tilt at the top is critical. If you hyperextend the lower back at the top of a thrust you are loading the exact tissue we are trying to protect. Tuck, squeeze, lower.",
    form: "Bar stays on hips. Drive through heels. Full hip extension with a posterior pelvic tilt at the top. 3-second squeeze every single rep. Lower with control.",
  },
  "Slant Board Goblet Squat (KB)": {
    cue: "Stand on the slant board with heels elevated, holding KB by the horns at chest height. Elbows inside knees at the bottom. Sit deep into the squat — the heel elevation gives you range that flat ground won't. Breathe at the bottom. Drive through heels to stand.",
    why: "The elevated heel from the slant board allows your ankle to dorsiflex more, which lets you sit deeper while keeping the chest upright. More depth, safer spine position, more quad and glute stimulus. It is simply a better goblet squat.",
    sub: "Heel-elevated goblet squat using a plate under each heel — same effect as the slant board with less kit.",
    back: "The slant board actually makes this safer for your back by allowing a more upright torso at depth. If you feel lower back at the bottom, you're not tall enough through the chest — think about lifting your elbows.",
    form: "Heels on slope. Elbows inside knees at bottom. Sit and breathe — don't rush the bottom. Drive through heels, stay tall through the chest on the way up.",
  },
  "Medicine Ball Rotational Slam (20 lb)": {
    cue: "Stand sideways to the wall or open space, feet shoulder-width. Hips rotate first — load the hip away from the direction of the slam. Then torso rotates, arms follow, slam the ball into the floor or wall. Hips lead, arms follow. Catch the rebound with control.",
    why: "This is the only transverse plane core work in the program so far. Your spine needs to resist and produce rotation safely — that is different from the anti-rotation work of Pallof presses. The hips driving the rotation keeps the lumbar spine safe while the obliques and rotators get trained.",
    sub: "Standing trunk rotation with a light band — same rotational pattern, no slam, lower load.",
    back: "Hips drive the rotation — never initiate from the lower back. If you feel it in your lumbar, you are using your back to rotate instead of your hips. Slow down, feel the hip load before you slam.",
    form: "Hip loads first. Rotation comes from hips and thoracic spine — not lumbar. Slam with intention, catch with control. Feet stay planted throughout.",
  },
  "Step-Up (DB, slow eccentric)": {
    cue: "Stand in front of the step platform. Place one foot fully on the platform. Drive through the heel of the elevated foot to step up — do not push off the bottom foot. Pause at the top. Lower back down slowly — 3 full seconds — with control.",
    why: "The slow eccentric lowering builds single-leg strength and control that carries directly into running mechanics and hip stability. The key instruction is driving through the heel only — using the bottom foot to push off turns this into a calf raise, not a step-up.",
    sub: "Bodyweight step-up — same movement, no DBs. Or reduce box height.",
    back: "Step-ups are spine-neutral when performed upright. If you feel lower back, you're leaning forward — tall torso, proud chest, drive through the heel.",
    form: "Full foot on platform. Drive through heel only. Tall torso. 3-second controlled lowering. The step down is the training — don't skip it.",
  },
  "Dead Hang (bar)": {
    cue: "Jump or step to the bar. Full grip, arms fully extended. Relax your shoulders — let them open and decompress. Breathe normally. You're not pulling, just hanging. Feel the shoulder decompress with each breath.",
    why: "Dead hangs decompress the shoulder joint and the thoracic spine before any pulling work. They also build grip strength and teach the lat to engage passively. 20 seconds of hang does more for shoulder health than most stretches.",
    sub: "Doorway hang — grip a sturdy door frame and lean back slightly. Same decompression effect.",
    back: "Dead hangs can actually feel good for lumbar disc issues as the spine decompresses slightly. If you feel any discomfort, drop down immediately.",
    form: "Full arm extension. Relaxed shoulders — not actively pulling. Breathe normally. Feel the hang, don't fight it.",
  },
};

const TOPIC_KEYWORDS = {
  cue:  ["cue", "form", "how do i", "how to", "technique", "tips", "doing this right", "proper", "correct", "setup"],
  why:  ["why", "reason", "point", "purpose", "benefit", "what does", "what is this for", "programmed"],
  sub:  ["substitute", "sub", "swap", "alternative", "replace", "instead", "different", "can't do", "cant do", "modification"],
  back: ["back", "hurt", "pain", "spine", "disc", "sore", "tight", "twinge", "safe", "worried", "should i stop", "stop"],
  form: ["form", "technique", "setup", "position", "how do", "elbow", "knee", "foot", "feet", "stance", "grip", "hand"],
};

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

// ─── SCHEDULE VIEW ────────────────────────────────────────────────────────

// Session durations in minutes
const SESSION_DURATIONS = { lift: 50, run: 30, dance: 60 };
const WORK_END = { h: 14, m: 30 };  // 2:30 PM PST
const FAMILY_TARGET = { h: 17, m: 30 };  // 5:30 PM

function fmtTime(h, m) {
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return hour + ":" + String(m).padStart(2, "0") + " " + ampm;
}

function buildTimeline(sessions) {
  let h = WORK_END.h, m = WORK_END.m;
  return sessions.map(s => {
    const start = fmtTime(h, m);
    const dur = SESSION_DURATIONS[s.type] || 45;
    m += dur;
    h += Math.floor(m / 60);
    m = m % 60;
    const end = fmtTime(h, m);
    return { ...s, start, end, dur };
  });
}

// Default lift assignment: dayId -> weekday
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
export default function ProgramUI(props: any) {
  const [activeDay, setActiveDay] = useState(0);
  const [openSets, setOpenSets] = useState({});
  const [showWarmup, setShowWarmup] = useState(false);
  const [view, setView] = useState("program"); // program | log
  const [scheduleAssignments, setScheduleAssignments] = useState({});
  const [logModal, setLogModal] = useState(null);
  const [sessionLogs, setSessionLogs] = useState({});
  const [logSaved, setLogSaved] = useState(false);
  const [travelMode, setTravelMode] = useState(false);
  const [runLogs, setRunLogs] = useState({});
  const [swapped, setSwapped] = useState({});
  const [unit, setUnit] = useState("lb");

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
        const sa = localStorage.getItem("schedule-assignments");
        if (sa) setScheduleAssignments(JSON.parse(sa));
        if (rl) setRunLogs(JSON.parse(rl));
      } catch (e) {}
    }
    load();
  }, []);

  const saveUnit = (u) => {
    setUnit(u);
    try {
      localStorage.setItem("weight-unit", u);
      if (typeof window.storage !== "undefined") window.storage.set("weight-unit", u).catch(() => {});
    } catch (e) {}
  };

  const saveRunLog = (key, status) => {
    const updated = { ...runLogs, [key]: status };
    setRunLogs(updated);
    try { localStorage.setItem("run-logs", JSON.stringify(updated)); } catch (e) {}
  };

  const saveLog = async (entry) => {
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

  const toggleSet = (key) => setOpenSets(prev => ({ ...prev, [key]: !prev[key] }));

  const day = orderedDays[activeDay];
  const dayLog = sessionLogs[`w${CURRENT_WEEK}-d${day.id}`];
  const weekLogs = DAYS.map(d => sessionLogs[`w${CURRENT_WEEK}-d${d.id}`]).filter(Boolean);
  const allLogged = weekLogs.length === DAYS.length;
  const dayOrder = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
  const orderedDays = [...DAYS].sort((a, b) => {
    const aDay = scheduleAssignments["lift-" + a.id] || ["Monday","Tuesday","Thursday","Saturday"][a.id-1];
    const bDay = scheduleAssignments["lift-" + b.id] || ["Monday","Tuesday","Thursday","Saturday"][b.id-1];
    return dayOrder.indexOf(aDay) - dayOrder.indexOf(bDay);
  });

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
              {orderedDays.map((d, i) => {
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
                <span style={{ fontSize: 10, color: "#555", letterSpacing: "0.15em", textTransform: "uppercase" }}>{day.label} · {scheduleAssignments["lift-" + day.id] || ["Monday","Tuesday","Thursday","Saturday"][day.id-1]} · Week {CURRENT_WEEK}</span>
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
