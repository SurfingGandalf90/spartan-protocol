// @ts-nocheck
'use client'

import { useState } from 'react'
import { WIFE_DAYS, WIFE_CURRENT_WEEK, WIFE_WEEK_THEME, WIFE_RPE_RANGE } from '@/lib/program'

export default function WifeUI({ sessionLogs, onSaveLog, user }: any) {
  const [activeDay, setActiveDay] = useState(0)
  const [logModal, setLogModal] = useState(null)
  const [logs, setLogs] = useState(sessionLogs || {})

  const day = WIFE_DAYS[activeDay]
  const accent = '#F472B6'

  const handleSave = (entry: any) => {
    const key = `wife-w${WIFE_CURRENT_WEEK}-d${entry.dayId}`
    const updated = { ...logs, [key]: entry }
    setLogs(updated)
    if (onSaveLog) onSaveLog(entry)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0F0F0F', color: '#E8E8E0', fontFamily: "'DM Mono', monospace", paddingBottom: 80 }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Syne:wght@700;800&display=swap'); * { box-sizing: border-box; margin: 0; padding: 0; }`}</style>

      {/* Header */}
      <div style={{ padding: '24px 20px 0' }}>
        <div style={{ fontSize: 10, color: accent, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 4 }}>Week {WIFE_CURRENT_WEEK} · {WIFE_RPE_RANGE} RPE</div>
        <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 26, fontWeight: 800, color: '#E8E8E0', lineHeight: 1.1, marginBottom: 4 }}>Spartan Protocol</div>
        <div style={{ fontSize: 11, color: '#555', marginBottom: 20 }}>{WIFE_WEEK_THEME}</div>
      </div>

      {/* Day selector */}
      <div style={{ display: 'flex', gap: 8, padding: '0 20px', marginBottom: 20 }}>
        {WIFE_DAYS.map((d: any, i: number) => {
          const logKey = `wife-w${WIFE_CURRENT_WEEK}-d${d.id}`
          const logged = logs[logKey]
          return (
            <button key={d.id} onClick={() => setActiveDay(i)} style={{
              flex: 1, padding: '10px 4px', border: `1px solid ${activeDay === i ? accent : '#2a2a2a'}`,
              background: activeDay === i ? accent + '18' : '#111',
              color: activeDay === i ? accent : '#555',
              fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: '0.08em',
              textTransform: 'uppercase', cursor: 'pointer', position: 'relative',
            }}>
              {d.label}
              {logged && <span style={{ position: 'absolute', top: 3, right: 3, width: 5, height: 5, borderRadius: '50%', background: '#6EC6A0' }} />}
            </button>
          )
        })}
      </div>

      {/* Day card */}
      <div style={{ margin: '0 20px', border: `1px solid #2a2a2a`, borderTop: `2px solid ${accent}`, background: '#111', marginBottom: 16 }}>
        <div style={{ padding: '16px 18px', borderBottom: '1px solid #1e1e1e' }}>
          <div style={{ fontSize: 10, color: '#555', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 4 }}>{day.focus} · {day.duration}</div>
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 700, color: accent, marginBottom: 6 }}>{day.title}</div>
          <div style={{ fontSize: 11, color: '#666', lineHeight: 1.6, fontStyle: 'italic' }}>{day.note}</div>
        </div>

        {/* Circuits */}
        {day.supersets.map((circuit: any) => (
          <div key={circuit.id} style={{ borderBottom: '1px solid #1a1a1a' }}>
            <div style={{ padding: '10px 18px 4px', fontSize: 10, color: accent, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{circuit.name}</div>
            {circuit.exercises.map((ex: any) => (
              <div key={ex.name} style={{ padding: '10px 18px', borderTop: '1px solid #111' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                  <div style={{ fontSize: 13, color: '#E8E8E0', fontWeight: 500 }}>{ex.name}</div>
                  <div style={{ fontSize: 10, color: '#444', letterSpacing: '0.05em', whiteSpace: 'nowrap', marginLeft: 8 }}>{ex.sets}×{ex.reps}</div>
                </div>
                <div style={{ fontSize: 11, color: '#666', marginBottom: 2 }}>{ex.load}</div>
                <div style={{ fontSize: 11, color: '#555', lineHeight: 1.5, fontStyle: 'italic' }}>{ex.note}</div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Log button */}
      <div style={{ padding: '0 20px' }}>
        <button onClick={() => setLogModal(day)} style={{
          width: '100%', background: accent, color: '#0F0F0F', border: 'none',
          fontFamily: "'DM Mono', monospace", fontSize: 12, letterSpacing: '0.1em',
          textTransform: 'uppercase', padding: '14px', cursor: 'pointer', fontWeight: 500,
        }}>
          {logs[`wife-w${WIFE_CURRENT_WEEK}-d${day.id}`] ? 'Edit Log' : 'Log This Session'}
        </button>
      </div>

      {/* Log modal */}
      {logModal && (
        <LogModal
          day={logModal}
          weekNum={WIFE_CURRENT_WEEK}
          accent={accent}
          existing={logs[`wife-w${WIFE_CURRENT_WEEK}-d${logModal.id}`]}
          onSave={handleSave}
          onClose={() => setLogModal(null)}
        />
      )}
    </div>
  )
}

function LogModal({ day, weekNum, accent, existing, onSave, onClose }: any) {
  const [rpe, setRpe] = useState(existing?.rpe || '')
  const [notes, setNotes] = useState(existing?.notes || '')
  const [completed, setCompleted] = useState(existing?.completed ?? true)

  const save = () => {
    onSave({ dayId: day.id, dayTitle: day.title, week: weekNum, rpe, notes, completed, date: new Date().toLocaleDateString() })
    onClose()
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 100, display: 'flex', alignItems: 'flex-end' }}>
      <div style={{ width: '100%', background: '#141414', border: '1px solid #2a2a2a', borderBottom: 'none', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px 20px 0', flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 700, color: accent }}>{day.title}</div>
            <button onClick={onClose} style={{ background: 'none', border: '1px solid #2a2a2a', color: '#555', fontFamily: "'DM Mono',monospace", fontSize: 11, padding: '6px 12px', cursor: 'pointer' }}>✕</button>
          </div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            {[true, false].map(v => (
              <button key={String(v)} onClick={() => setCompleted(v)} style={{ flex: 1, padding: '9px', border: `1px solid ${completed === v ? accent : '#2a2a2a'}`, background: completed === v ? accent + '12' : 'transparent', color: completed === v ? accent : '#555', fontFamily: "'DM Mono', monospace", fontSize: 11, cursor: 'pointer', textTransform: 'uppercase' }}>
                {v ? '✓ Completed' : '✗ Skipped'}
              </button>
            ))}
          </div>
          <div style={{ fontSize: 10, color: '#555', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>Session RPE</div>
          <div style={{ display: 'flex', gap: 5, marginBottom: 16 }}>
            {['5','6','7','8','9','10'].map(r => (
              <button key={r} onClick={() => setRpe(r)} style={{ width: 38, height: 38, border: `1px solid ${rpe === r ? accent : '#2a2a2a'}`, background: rpe === r ? accent + '18' : 'transparent', color: rpe === r ? accent : '#555', fontFamily: "'DM Mono', monospace", fontSize: 13, cursor: 'pointer' }}>{r}</button>
            ))}
          </div>
        </div>
        <div style={{ padding: '0 20px', flex: 1, overflowY: 'auto' }}>
          <div style={{ fontSize: 10, color: '#555', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>Notes</div>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="How did it feel? Any modifications?" style={{ width: '100%', background: '#0d0d0d', border: '1px solid #2a2a2a', color: '#ccc', fontFamily: "'DM Mono', monospace", fontSize: 12, padding: '10px 12px', resize: 'none', height: 80 }} />
        </div>
        <div style={{ padding: '12px 20px 36px', borderTop: '1px solid #1e1e1e', flexShrink: 0 }}>
          <button onClick={save} style={{ width: '100%', background: accent, color: '#0F0F0F', border: 'none', fontFamily: "'DM Mono', monospace", fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '14px', cursor: 'pointer', fontWeight: 500 }}>Save Log</button>
        </div>
      </div>
    </div>
  )
}
