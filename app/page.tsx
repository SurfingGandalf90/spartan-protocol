'use client'

import { useState, useEffect } from 'react'
import AppShell, { useAuth } from '@/components/AppShell'
import ProgramUI from '@/components/ProgramUI'
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
  const { user } = useAuth()
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
      <div style={{ minHeight: '100vh', background: '#0F0F0F', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'monospace', fontSize: 11, color: '#444', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
        Loading your program...
      </div>
    )
  }

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
