import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: true, storageKey: "spartan-auth", storage: typeof window !== "undefined" ? window.localStorage : undefined } })

// ─── SESSION LOGS ──────────────────────────────────────────────────────────
export async function getSessionLogs(userId: string) {
  const { data, error } = await supabase
    .from('session_logs')
    .select('*')
    .eq('user_id', userId)
  if (error) throw error
  // Convert to { "w1-d1": {...}, "w2-d3": {...} } format
  const map: Record<string, any> = {}
  data?.forEach(row => {
    map[`w${row.week_num}-d${row.day_id}`] = {
      dayId: row.day_id,
      dayTitle: row.day_title,
      week: row.week_num,
      completed: row.status === 'completed',
      rpe: row.rpe,
      exercises: row.exercises,
      unit: row.unit,
      notes: row.notes,
      date: row.logged_date,
    }
  })
  return map
}

export async function saveSessionLog(userId: string, entry: any) {
  const { error } = await supabase
    .from('session_logs')
    .upsert({
      user_id: userId,
      week_num: entry.week,
      day_id: entry.dayId,
      day_title: entry.dayTitle,
      status: entry.completed ? 'completed' : 'skipped',
      rpe: entry.rpe,
      exercises: entry.exercises,
      unit: entry.unit,
      notes: entry.notes,
      logged_date: entry.date || new Date().toISOString().split('T')[0],
    }, { onConflict: 'user_id,week_num,day_id' })
  if (error) throw error
}

// ─── RUN LOGS ──────────────────────────────────────────────────────────────
export async function getRunLogs(userId: string) {
  const { data, error } = await supabase
    .from('run_logs')
    .select('*')
    .eq('user_id', userId)
  if (error) throw error
  const map: Record<string, string> = {}
  data?.forEach(row => {
    map[`w${row.week_num}-run${row.run_num}`] = row.status
  })
  return map
}

export async function saveRunLog(userId: string, key: string, status: string | null) {
  const [weekPart, runPart] = key.split('-')
  const weekNum = parseInt(weekPart.replace('w', ''))
  const runNum = parseInt(runPart.replace('run', ''))

  if (!status) {
    await supabase.from('run_logs')
      .delete()
      .eq('user_id', userId)
      .eq('week_num', weekNum)
      .eq('run_num', runNum)
    return
  }

  const { error } = await supabase
    .from('run_logs')
    .upsert({
      user_id: userId,
      week_num: weekNum,
      run_num: runNum,
      status,
      logged_date: new Date().toISOString().split('T')[0],
    }, { onConflict: 'user_id,week_num,run_num' })
  if (error) throw error
}

// ─── PREFERENCES ──────────────────────────────────────────────────────────
export async function getPreferences(userId: string) {
  const { data } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()
  return data || { weight_unit: 'lb', current_week: 1 }
}

export async function savePreferences(userId: string, prefs: { weight_unit?: string, current_week?: number }) {
  await supabase
    .from('user_preferences')
    .upsert({ user_id: userId, ...prefs }, { onConflict: 'user_id' })
}

// ─── SCHEDULE ──────────────────────────────────────────────────────────────
export async function getSchedule(userId: string) {
  const { data } = await supabase
    .from('schedule_assignments')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()
  return data || { assignments: {}, dance_day: null }
}

export async function saveSchedule(userId: string, assignments: any, danceDay: string | null) {
  await supabase
    .from('schedule_assignments')
    .upsert({ user_id: userId, assignments, dance_day: danceDay }, { onConflict: 'user_id' })
}
