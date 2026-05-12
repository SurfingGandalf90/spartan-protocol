'use client'

import { useState, useEffect } from 'react'
import AppShell, { useAuth } from '@/components/AppShell'
import ProgramUI from '@/components/ProgramUI'
import WifeUI from '@/components/WifeUI'
import {
  getSessionLogs, saveSessionLog,
  getRunLogs, saveRunLog,
  getPreferences, savePreferences,
  getSchedule, saveSchedule,
} from '@/lib/supabase'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ProgramUIAny = ProgramUI as any

export default function Home() {
  return (
    <AppShell>
      <SpartanApp />
    </AppShell>
  )
}

function SpartanApp() {
  const { user, profile } = useAuth()
  const [loaded, setLoaded] = useState(false)
  const [currentWeek, setCurrentWeek] = useState(2)
  const [sessionLogs, setSessionLogs] = useState<Record<string, any>>({})
  const [runLogs, setRunLogs] = useState<Record<string, string>>({})
  const [unit, setUnit] = useState('lb')
  const [assignments, setAssignments] = useState<Record<string, string>>({})
  const [danceDay, setDanceDay] = useState<string | null>(null)
  const [activeDay, setActiveDay] = useState(0)
  const [view, setView] = useState('program')
  const [openSets, setOpenSets] = useState<Record<string, boolean>>({})
  const [showWarmup, setShowWarmup] = useState(false)
  const [logModal, setLogModal] = useState<any>(null)
  const [travelMode, setTravelMode] = useState(false)
  const [swapped, setSwapped] = useState<Record<string, boolean>>({})

  const toggleSet = (key: string) => setOpenSets(prev => ({ ...prev, [key]: !prev[key] }))

  useEffect(() => {
    if (!user) return
    async function loadAll() {
      try {
        const [logs, runs, prefs, schedule] = await Promise.all([
          getSessionLogs(user!.id),
          getRunLogs(user!.id),
          getPreferences(user!.id),
          getSchedule(user!.id),
        ])
        setSessionLogs(logs)
        setRunLogs(runs)
        setUnit(prefs.weight_unit || 'lb')
        setCurrentWeek(prefs.current_week || 2)
        setAssignments(schedule.assignments || {})
        setDanceDay(schedule.dance_day || null)
      } catch (e) {
        console.error('Load error:', e)
      } finally {
        setLoaded(true)
      }
    }
    loadAll()
  }, [user])

  const handleSaveLog = async (entry: any) => {
    if (!user) return
    const key = `w${entry.week}-d${entry.dayId}`
    setSessionLogs(prev => ({ ...prev, [key]: entry }))
    await saveSessionLog(user.id, entry)
  }

  const handleSaveRunLog = async (key: string, status: string | null) => {
    if (!user) return
    setRunLogs(prev => {
      const updated = { ...prev }
      if (!status) delete updated[key]
      else updated[key] = status
      return updated
    })
    await saveRunLog(user.id, key, status || '')
  }

  const handleSaveUnit = async (u: string) => {
    if (!user) return
    setUnit(u)
    await savePreferences(user.id, { weight_unit: u })
  }

  const handleSaveSchedule = async (a: any, d: string | null) => {
    if (!user) return
    setAssignments(a)
    setDanceDay(d)
    await saveSchedule(user.id, a, d)
  }

  if (!loaded) {
    return (
      <div style={{ minHeight: '100vh', background: '#0F0F0F', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <style>{`
          @keyframes fillUp {
            0% { clip-path: inset(100% 0 0 0); opacity: 0.3; }
            20% { opacity: 1; }
            100% { clip-path: inset(0% 0 0 0); opacity: 1; }
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.4; }
          }
          .spartan-fill-base { opacity: 0.15; }
          .spartan-fill-anim {
            animation: fillUp 1.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
            animation-delay: 0.2s;
            clip-path: inset(100% 0 0 0);
          }
          .spartan-pulse {
            animation: pulse 2s ease-in-out infinite;
            animation-delay: 2s;
          }
        `}</style>
        <div style={{ position: 'relative', width: 72, height: 72 }}>
          {/* Base dim logo */}
          <svg width={72} height={72} viewBox="0 0 48 48" fill="none" className="spartan-fill-base" style={{ position: 'absolute', top: 0, left: 0 }}>
            <path d="M8,10 L40,10 L40,30 L24,44 L8,30 Z" fill="#1a1506" stroke="#E8C547" strokeWidth="1.4" strokeLinejoin="miter" />
            <path d="M11,13 L37,13 L37,29 L24,40 L11,29 Z" fill="none" stroke="#E8C547" strokeWidth="0.5" strokeOpacity="0.3" strokeLinejoin="miter" />
            <line x1="24" y1="2" x2="24" y2="46" stroke="#E8C547" strokeWidth="1.8" strokeLinecap="square" />
            <polygon points="24,1 29,13 24,10 19,13" fill="#E8C547" />
            <line x1="16" y1="17" x2="32" y2="17" stroke="#E8C547" strokeWidth="1.5" strokeLinecap="square" />
            <polygon points="24,46 22,43 26,43" fill="#E8C547" />
          </svg>
          {/* Animated fill logo */}
          <svg width={72} height={72} viewBox="0 0 48 48" fill="none" className="spartan-fill-anim spartan-pulse" style={{ position: 'absolute', top: 0, left: 0 }}>
            <path d="M8,10 L40,10 L40,30 L24,44 L8,30 Z" fill="#1a1506" stroke="#E8C547" strokeWidth="1.4" strokeLinejoin="miter" />
            <path d="M11,13 L37,13 L37,29 L24,40 L11,29 Z" fill="none" stroke="#E8C547" strokeWidth="0.5" strokeOpacity="0.3" strokeLinejoin="miter" />
            <line x1="24" y1="2" x2="24" y2="46" stroke="#E8C547" strokeWidth="1.8" strokeLinecap="square" />
            <polygon points="24,1 29,13 24,10 19,13" fill="#E8C547" />
            <line x1="16" y1="17" x2="32" y2="17" stroke="#E8C547" strokeWidth="1.5" strokeLinecap="square" />
            <polygon points="24,46 22,43 26,43" fill="#E8C547" />
          </svg>
        </div>
      </div>
    )
  }

  // Wife's program
  if (profile === 'wife') {
    return <WifeUI sessionLogs={sessionLogs} onSaveLog={handleSaveLog} user={user} />
  }

  // Cody's program
  return (
    <ProgramUIAny
      currentWeek={currentWeek}
      sessionLogs={sessionLogs}
      runLogs={runLogs}
      unit={unit}
      assignments={assignments}
      danceDay={danceDay}
      activeDay={activeDay}
      setActiveDay={setActiveDay}
      view={view}
      setView={setView}
      openSets={openSets}
      toggleSet={toggleSet}
      showWarmup={showWarmup}
      setShowWarmup={setShowWarmup}
      logModal={logModal}
      setLogModal={setLogModal}
      travelMode={travelMode}
      setTravelMode={setTravelMode}
      swapped={swapped}
      setSwapped={setSwapped}
      onSaveLog={handleSaveLog}
      onSaveRunLog={handleSaveRunLog}
      onSaveUnit={handleSaveUnit}
      onSaveSchedule={handleSaveSchedule}
      user={user}
    />
  )
}
