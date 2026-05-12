// @ts-nocheck
'use client'

import { useState, useRef, useEffect } from 'react'
import { WIFE_DAYS, WIFE_CURRENT_WEEK, WIFE_WEEK_THEME, WIFE_RPE_RANGE } from '@/lib/program'

const accent = '#F472B6'
const WEEK = WIFE_CURRENT_WEEK

function CoachChat({ day }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "I'm here. You're on " + safeDay.title + " — Week " + WEEK + ". Ask me about any exercise, form cues, substitutions, or why it's in the program." }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const send = async () => {
    const text = input.trim()
    if (!text || loading) return
    setInput('')
    const userMsg = { role: 'user', content: text }
    setMessages(prev => [...prev, userMsg, { role: 'assistant', content: '...' }])
    setLoading(true)
    try {
      const exerciseContext = safeDay.supersets.flatMap(ss => ss.exercises).map(ex => ex.name + ': ' + ex.note).join('\n')
      const res = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-5',
          max_tokens: 1000,
          system: "You are a back-safe strength coach for Spartan Protocol. The athlete is Kimberly. Her program is a 3-day full body circuit — back-safe, no spinal flexion under load, no axial compression, all rows chest-supported. Today is " + safeDay.title + " (Week " + WEEK + "). Exercises today:\n" + exerciseContext + "\nKeep answers concise and practical.",
          messages: [...messages, userMsg].filter(m => m.content !== '...').map(m => ({ role: m.role, content: m.content }))
        })
      })
      const data = await res.json()
      const reply = data.content?.[0]?.text || 'Something went wrong — try again.'
      setMessages(prev => [...prev.slice(0, -1), { role: 'assistant', content: reply }])
    } catch (e) {
      setMessages(prev => [...prev.slice(0, -1), { role: 'assistant', content: 'Connection error — try again.' }])
    } finally {
      setLoading(false)
    }
  }

  const handleKey = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }
  const allExercises = safeDay.supersets.flatMap(ss => ss.exercises)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 220px)', minHeight: 360 }}>
      {messages.length === 1 && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 10, color: '#444', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>Tap an exercise to ask about it</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
            {allExercises.map((ex, i) => (
              <button key={i} onClick={() => {
                const q = 'How do I cue ' + ex.name + '?'
                setMessages(prev => [...prev, { role: 'user', content: q }, { role: 'assistant', content: '...' }])
                setLoading(true)
                fetch('/api/coach', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    model: 'claude-sonnet-4-5', max_tokens: 500,
                    system: "Back-safe coach for Kimberly's 3-day circuit program. Concise cues only.",
                    messages: [{ role: 'user', content: q }]
                  })
                }).then(r => r.json()).then(d => {
                  setMessages(prev => [...prev.slice(0, -1), { role: 'assistant', content: d.content?.[0]?.text || 'Try again.' }])
                  setLoading(false)
                })
              }} style={{ background: '#111', border: '1px solid #2a2a2a', color: '#777', fontFamily: 'DM Mono,monospace', fontSize: 10, padding: '6px 10px', cursor: 'pointer' }}>{ex.name}</button>
            ))}
          </div>
          <div style={{ fontSize: 10, color: '#444', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>Or ask anything</div>
          {["My back feels tight — should I stop?", "Give me a substitute for an exercise", "Why is this exercise in today's session?"].map((q, i) => (
            <button key={i} onClick={() => {
              setMessages(prev => [...prev, { role: 'user', content: q }, { role: 'assistant', content: '...' }])
              setLoading(true)
              fetch('/api/coach', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  model: 'claude-sonnet-4-5', max_tokens: 500,
                  system: "Back-safe coach for Kimberly's 3-day circuit program. Concise answers only.",
                  messages: [{ role: 'user', content: q }]
                })
              }).then(r => r.json()).then(d => {
                setMessages(prev => [...prev.slice(0, -1), { role: 'assistant', content: d.content?.[0]?.text || 'Try again.' }])
                setLoading(false)
              })
            }} style={{ textAlign: 'left', background: '#0d0d0d', border: '1px solid #1e1e1e', color: '#666', fontFamily: 'DM Mono,monospace', fontSize: 11, padding: '8px 12px', cursor: 'pointer', marginBottom: 5, display: 'block', width: '100%' }}>{q}</button>
          ))}
        </div>
      )}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12, paddingBottom: 8 }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row', gap: 10 }}>
            <div style={{ maxWidth: '84%', padding: '10px 14px', background: msg.role === 'user' ? accent + '15' : '#141414', border: '1px solid ' + (msg.role === 'user' ? accent + '35' : '#222'), fontSize: 13, color: msg.role === 'user' ? accent : '#ccc', lineHeight: 1.7 }}>{msg.content}</div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div style={{ borderTop: '1px solid #1e1e1e', paddingTop: 12, display: 'flex', gap: 8 }}>
        <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey} placeholder="Ask about any exercise..." rows={2}
          style={{ flex: 1, background: '#111', border: '1px solid #2a2a2a', color: '#E8E8E0', fontFamily: 'DM Mono,monospace', fontSize: 13, padding: '10px 12px', resize: 'none', outline: 'none' }} />
        <button onClick={send} disabled={!input.trim() || loading}
          style={{ background: !input.trim() || loading ? '#1a1a1a' : accent, color: !input.trim() || loading ? '#444' : '#0F0F0F', border: 'none', width: 48, fontSize: 20, cursor: !input.trim() || loading ? 'not-allowed' : 'pointer' }}>↑</button>
      </div>
    </div>
  )
}

export default function WifeUI({ sessionLogs, onSaveLog, user }: any) {
  const [activeDay, setActiveDay] = useState(0)
  const [scheduleAssignments, setScheduleAssignments] = useState({})

  useEffect(() => {
    const sa = localStorage.getItem("schedule-assignments")
    if (sa) setScheduleAssignments(JSON.parse(sa))
    const handleSchedule = (e) => { if (e.detail) { setScheduleAssignments(e.detail); return; } const s = localStorage.getItem("schedule-assignments"); if (s) setScheduleAssignments(JSON.parse(s)); }
    window.addEventListener("schedule-updated", handleSchedule)
    window.addEventListener("storage", handleSchedule)
    return () => { window.removeEventListener("schedule-updated", handleSchedule); window.removeEventListener("storage", handleSchedule); }
  }, [])
  const [view, setView] = useState('program')
  const [logs, setLogs] = useState(sessionLogs || {})
  const [logModal, setLogModal] = useState(null)

  const weekdayOrder = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"]
  const defaultWifeDays = ["Monday","Wednesday","Friday"]
  const activeWeekday = weekdayOrder[activeDay]
  const day = WIFE_DAYS.find(d => (scheduleAssignments["wife-lift-" + d.id] || defaultWifeDays[d.id-1]) === activeWeekday)
  const isRestDay = !day
  const safeDay = day || { id: 0, label: activeWeekday, title: "Rest Day", accent, focus: "", duration: "", note: "", supersets: [] }

  const handleSave = (entry: any) => {
    const key = 'wife-w' + WEEK + '-d' + entry.dayId
    const updated = { ...logs, [key]: entry }
    setLogs(updated)
    if (onSaveLog) onSaveLog(entry)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0F0F0F', color: '#E8E8E0', fontFamily: "'DM Mono', monospace", paddingBottom: 80 }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Syne:wght@700;800&display=swap'); * { box-sizing: border-box; margin: 0; padding: 0; } .wife-nav-tab { background: transparent; border: none; font-family: 'DM Mono', monospace; font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; cursor: pointer; padding: 6px 0; border-bottom: 1px solid transparent; transition: all 0.2s; }`}</style>

      {/* Header */}
      <div style={{ padding: '24px 20px 0', borderBottom: '1px solid #1e1e1e' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div style={{ fontSize: 10, color: accent, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 4 }}>Week {WEEK} · {WIFE_RPE_RANGE} RPE</div>
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 26, fontWeight: 800, color: '#E8E8E0', lineHeight: 1.1, marginBottom: 4 }}>Kimberly's Program</div>
          <div style={{ fontSize: 11, color: '#555', marginBottom: 16 }}>{WIFE_WEEK_THEME}</div>

          {/* Nav tabs */}
          <div style={{ display: 'flex', gap: 18, marginBottom: 0 }}>
            {['program', 'log', 'coach', 'schedule'].map(t => (
              <button key={t} className="wife-nav-tab"
                style={{ color: view === t ? '#E8E8E0' : '#444', borderBottomColor: view === t ? accent : 'transparent' }}
                onClick={() => setView(t)}>{t}</button>
            ))}
          </div>

          {/* Day tabs */}
          {(view === 'program' || view === 'coach') && (
            <div style={{ display: 'flex', gap: 8, paddingTop: 16 }}>
              { ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"].map((weekday, i) => {
                const d = WIFE_DAYS.find(d => (scheduleAssignments["wife-lift-" + d.id] || defaultWifeDays[d.id-1]) === weekday)
                const defaultDays = ["Monday","Wednesday","Friday"]
                if (!d && !defaultDays.includes(weekday)) return null
                const logged = d ? !!logs["wife-w" + WEEK + "-d" + d.id] : false
                const logged = logs['wife-w' + WEEK + '-d' + d.id]
                return (
                  <button key={weekday} onClick={() => setActiveDay(i)} style={{
                    flex: 1, padding: '10px 4px', border: '1px solid ' + (activeDay === i ? accent : '#2a2a2a'),
                    background: activeDay === i ? accent + '18' : '#111',
                    color: activeDay === i ? accent : '#555',
                    fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: '0.08em',
                    textTransform: 'uppercase', cursor: 'pointer', position: 'relative',
                  }}>
                    {weekday.slice(0,3).toUpperCase()}
                    {logged && <span style={{ position: 'absolute', top: 3, right: 3, width: 5, height: 5, borderRadius: '50%', background: '#6EC6A0' }} />}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '24px 20px 60px' }}>

        {/* Program view */}
        {view === 'program' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 10, color: '#555', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 3 }}>{safeDay.focus} · {safeDay.duration}</div>
                <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 700, color: accent }}>{safeDay.title}</div>
              </div>
              <button onClick={() => setLogModal(day)} style={{ background: logs['wife-w' + WEEK + '-d' + safeDay.id] ? 'transparent' : accent, color: logs['wife-w' + WEEK + '-d' + safeDay.id] ? '#555' : '#0F0F0F', border: logs['wife-w' + WEEK + '-d' + safeDay.id] ? '1px solid #2a2a2a' : 'none', fontFamily: 'DM Mono,monospace', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '10px 18px', cursor: 'pointer' }}>
                {logs['wife-w' + WEEK + '-d' + safeDay.id] ? '✓ Logged' : 'Log Session'}
              </button>
            </div>
            <div style={{ fontSize: 11, color: '#666', lineHeight: 1.6, fontStyle: 'italic', marginBottom: 20 }}>{safeDay.note}</div>

            {safeDay.supersets.map((circuit: any) => (
              <div key={circuit.id} style={{ border: '1px solid #222', borderLeft: '3px solid ' + accent, background: '#141414', marginBottom: 12 }}>
                <div style={{ padding: '10px 18px', fontSize: 10, color: accent, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{circuit.name}</div>
                {circuit.exercises.map((ex: any) => (
                  <div key={ex.name} style={{ padding: '10px 18px', borderTop: '1px solid #1e1e1e' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                      <div style={{ fontSize: 13, color: '#E8E8E0', fontWeight: 500 }}>{ex.name}</div>
                      <div style={{ fontSize: 10, color: '#444', whiteSpace: 'nowrap', marginLeft: 8 }}>{ex.sets}×{ex.reps}</div>
                    </div>
                    <div style={{ fontSize: 11, color: '#555' }}>{ex.load} · {ex.note}</div>
                  </div>
                ))}
              </div>
            ))}
          </>
        )}

        {/* Coach view */}
        {view === 'coach' && (
          <>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 10, color: '#555', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 3 }}>Ask Coach · {day.label}</div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 700, color: accent }}>{safeDay.title}</div>
            </div>
            <CoachChat key={'coach-' + safeDay.id} day={day} />
          </>
        )}

        {/* Log view */}
        {view === 'log' && (
          <>
            <div style={{ fontSize: 10, letterSpacing: '0.15em', color: '#444', textTransform: 'uppercase', marginBottom: 16 }}>Week {WEEK} — Session Log</div>
            {WIFE_DAYS.map((d: any) => {
              const log = logs['wife-w' + WEEK + '-d' + d.id]
              return (
                <div key={d.id} style={{ border: '1px solid #1e1e1e', background: '#111', padding: '16px 18px', marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: 10, color: '#444', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 3 }}>{d.label}</div>
                      <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 14, fontWeight: 700, color: accent }}>{d.title}</div>
                    </div>
                    <button onClick={() => setLogModal(d)} style={{ background: log ? 'transparent' : accent, color: log ? '#666' : '#0F0F0F', border: log ? '1px solid #2a2a2a' : 'none', fontFamily: 'DM Mono,monospace', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '8px 14px', cursor: 'pointer' }}>
                      {log ? 'Edit' : 'Log →'}
                    </button>
                  </div>
                  {log && (
                    <div style={{ marginTop: 10, fontSize: 11, color: '#666' }}>
                      <span style={{ color: log.completed ? '#6EC6A0' : '#E87A5D' }}>{log.completed ? '✓ Completed' : '✗ Skipped'}</span>
                      {log.rpe && <span style={{ marginLeft: 16 }}>RPE {log.rpe}</span>}
                      {log.date && <span style={{ marginLeft: 16, color: '#444' }}>{log.date}</span>}
                      {log.notes && <div style={{ marginTop: 6, fontStyle: 'italic' }}>"{log.notes}"</div>}
                    </div>
                  )}
                </div>
              )
            })}
          </>
        )}

        {/* Schedule view */}
        {view === 'schedule' && (
          <div>
            <div style={{ fontSize: 10, letterSpacing: '0.15em', color: '#444', textTransform: 'uppercase', marginBottom: 16 }}>Weekly Schedule</div>
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(dayName => (
              <div key={dayName} style={{ border: '1px solid #1e1e1e', background: '#0d0d0d', padding: '14px 18px', marginBottom: 8 }}>
                <div style={{ fontSize: 11, color: '#555', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>{dayName}</div>
                {WIFE_DAYS.map((d: any) => {
                  const defaultDays = { 1: 'Monday', 2: 'Wednesday', 3: 'Friday' }
                  if (defaultDays[d.id] === dayName) {
                    return <div key={d.id} style={{ fontSize: 12, color: accent, padding: '4px 0' }}>⚡ {d.title} · {d.duration}</div>
                  }
                  return null
                })}
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}
