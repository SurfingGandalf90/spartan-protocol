// @ts-nocheck
import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

const KIMBERLY_EMAIL = 'kimberly@kimberlymoller.com'

export async function GET(request: Request) {
  // Verify this is called by Vercel Cron (or manually with secret)
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Get all users
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id, email, current_week')

    if (usersError) throw usersError

    const results = []

    for (const user of users || []) {
      try {
        const isKimberly = user.email === KIMBERLY_EMAIL

        // Get their session logs for the current week
        const { data: logs } = await supabase
          .from('session_logs')
          .select('*')
          .eq('user_id', user.id)
          .eq('week', user.current_week || 1)

        // Get their run logs (Cody only)
        const { data: runLogs } = !isKimberly
          ? await supabase.from('run_logs').select('*').eq('user_id', user.id)
          : { data: [] }

        // Build the log summary
        const logSummary = buildLogSummary(logs || [], user.current_week || 1)
        const nextWeek = (user.current_week || 1) + 1

        // Build the appropriate prompt
        const prompt = isKimberly
          ? buildKimberlyPrompt(logSummary, user.current_week || 1, nextWeek)
          : buildCodyPrompt(logSummary, user.current_week || 1, nextWeek)

        // Call Claude to generate next week
        const message = await anthropic.messages.create({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 4000,
          messages: [{ role: 'user', content: prompt }]
        })

        const responseText = message.content[0].type === 'text' ? message.content[0].text : ''
        const programData = JSON.parse(responseText)

        // Save to Supabase
        const { error: saveError } = await supabase
          .from('generated_programs')
          .upsert({
            user_id: user.id,
            week: nextWeek,
            program_data: programData,
            generated_at: new Date().toISOString(),
          }, { onConflict: 'user_id,week' })

        if (saveError) throw saveError

        // Update user's current week
        await supabase
          .from('profiles')
          .update({ current_week: nextWeek })
          .eq('id', user.id)

        results.push({ userId: user.id, email: user.email, status: 'success', week: nextWeek })
      } catch (userError) {
        results.push({ userId: user.id, email: user.email, status: 'error', error: String(userError) })
      }
    }

    return NextResponse.json({ success: true, results, generatedAt: new Date().toISOString() })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

// ─── Cody's Prompt ───────────────────────────────────────────────────────────

function buildCodyPrompt(logSummary: string, currentWeek: number, nextWeek: number): string {
  return `You are a strength coach for Spartan Protocol, a back-safe hypertrophy program for a 
male athlete with a history of back issues. His program is 4 days: Push, Glute/Ham, Pull, Full Body.

User's Week ${currentWeek} log:
${logSummary}

Generate Week ${nextWeek} of his program. Rules:
- No spinal flexion under load
- No axial compression exercises  
- Progress load by 5-10% on exercises logged as "Too Easy"
- Keep same load on exercises logged as "Just Right"
- Regress load on exercises logged as "Too Hard"
- RPE target: 7-8 for Week ${nextWeek}
- Keep the same exercise structure but vary rep schemes

Respond with ONLY a JSON object in this exact format, no other text:
{
  "week": ${nextWeek},
  "theme": "theme for this week",
  "rpeRange": "7-8",
  "days": [
    {
      "id": 1,
      "label": "Day 1",
      "title": "Push Day",
      "accent": "#E8C547",
      "supersets": [
        {
          "id": "A",
          "name": "Superset A",
          "exercises": [
            {
              "name": "Exercise Name",
              "sets": "3",
              "reps": "8-10",
              "load": "specific weight or bodyweight",
              "note": "coaching cue"
            }
          ]
        }
      ]
    }
  ]
}`
}

// ─── Kimberly's Prompt ───────────────────────────────────────────────────────

function buildKimberlyPrompt(logSummary: string, currentWeek: number, nextWeek: number): string {
  return `You are a strength coach for Spartan Protocol. You are generating the next week of 
Kimberly's Program — a 3-day full body circuit program designed for fat loss, strength, and 
back safety. Sessions run 35-38 minutes with no rest between stations (15-20 sec transitions only).

Format: Each day has a Warmup (2 rounds), Circuit A (3 rounds), Circuit B (3 rounds), 
a Finisher (1-2 rounds), and a Cooldown. No rest periods — keep moving.

Back safety rules (strict):
- No spinal flexion under load
- No axial compression (no barbell squats, deadlifts from floor, overhead press standing)
- All rows must be chest-supported
- Deadlifts must be elevated (KB on step or plate)
- Core work: dead bugs, pallof press, plank holds only — no crunches or sit-ups

Progression rules based on Week ${currentWeek} logs:
${logSummary}

- Progress load by 5-10% on exercises logged as "Too Easy"
- Keep same load on exercises logged as "Just Right"
- Regress load or reduce reps on exercises logged as "Too Hard"
- RPE target: ${nextWeek <= 2 ? '6-7' : nextWeek <= 4 ? '7-8' : '8-9'} for Week ${nextWeek}
- Vary rep schemes and circuit order week to week to prevent adaptation
- Keep sessions at 35-38 minutes total

Respond with ONLY a JSON object in this exact format, no other text:
{
  "week": ${nextWeek},
  "theme": "theme for this week",
  "rpeRange": "${nextWeek <= 2 ? '6-7' : nextWeek <= 4 ? '7-8' : '8-9'}",
  "days": [
    {
      "id": 1,
      "label": "Day 1",
      "title": "Full Body Circuit A",
      "accent": "#F472B6",
      "focus": "Lower body + core",
      "duration": "35 min",
      "note": "coaching note for the day",
      "supersets": [
        {
          "id": "W",
          "name": "Warmup — 2 rounds",
          "exercises": [
            {
              "name": "Exercise Name",
              "sets": "2",
              "reps": "10",
              "load": "Bodyweight",
              "note": "coaching cue"
            }
          ]
        },
        {
          "id": "A",
          "name": "Circuit A — 3 rounds",
          "exercises": [
            {
              "name": "Exercise Name",
              "sets": "3",
              "reps": "12",
              "load": "specific weight",
              "note": "coaching cue"
            }
          ]
        },
        {
          "id": "B",
          "name": "Circuit B — 3 rounds",
          "exercises": [
            {
              "name": "Exercise Name",
              "sets": "3",
              "reps": "10",
              "load": "specific weight",
              "note": "coaching cue"
            }
          ]
        },
        {
          "id": "F",
          "name": "Finisher — 1 round",
          "exercises": [
            {
              "name": "Exercise Name",
              "sets": "1",
              "reps": "description",
              "load": "specific weight or bodyweight",
              "note": "coaching cue"
            }
          ]
        },
        {
          "id": "C",
          "name": "Cooldown",
          "exercises": [
            {
              "name": "Stretch Name",
              "sets": "1",
              "reps": "60 sec/side",
              "load": "Bodyweight",
              "note": "coaching cue"
            }
          ]
        }
      ]
    }
  ]
}`
}

// ─── Log Summary Builder ──────────────────────────────────────────────────────

function buildLogSummary(logs: any[], week: number): string {
  if (!logs.length) return 'No logs found for this week — maintain current loads and structure.'

  let summary = `Week ${week} Summary:\n`
  logs.forEach(log => {
    summary += `\n${log.day_title} (${log.date}):\n`
    summary += `  Status: ${log.completed ? 'Completed' : 'Skipped'}\n`
    summary += `  RPE: ${log.rpe}/10\n`
    if (log.exercises) {
      Object.entries(log.exercises).forEach(([name, data]: [string, any]) => {
        if (data.difficulty || data.weight) {
          summary += `  ${name}: ${
            data.difficulty === 'easy' ? 'TOO EASY' :
            data.difficulty === 'hard' ? 'TOO HARD' : 'JUST RIGHT'
          }`
          if (data.weight) summary += ` @ ${data.weight}${data.unit || 'lb'}`
          summary += '\n'
        }
      })
    }
    if (log.notes) summary += `  Notes: ${log.notes}\n`
  })
  return summary
}
