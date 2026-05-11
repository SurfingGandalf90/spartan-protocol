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
        // Get their session logs for the current week
        const { data: logs } = await supabase
          .from('session_logs')
          .select('*')
          .eq('user_id', user.id)
          .eq('week', user.current_week || 2)

        // Get their run logs
        const { data: runLogs } = await supabase
          .from('run_logs')
          .select('*')
          .eq('user_id', user.id)

        // Build the log summary
        const logSummary = buildLogSummary(logs || [], user.current_week || 2)
        const nextWeek = (user.current_week || 2) + 1

        // Call Claude to generate next week
        const message = await anthropic.messages.create({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 4000,
          messages: [{
            role: 'user',
            content: `You are a strength coach for Spartan Protocol, a back-safe hypertrophy program.

User's Week ${user.current_week} log:
${logSummary}

Generate Week ${nextWeek} of their program. Rules:
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
          }]
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

        results.push({ userId: user.id, status: 'success', week: nextWeek })
      } catch (userError) {
        results.push({ userId: user.id, status: 'error', error: String(userError) })
      }
    }

    return NextResponse.json({ success: true, results, generatedAt: new Date().toISOString() })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

function buildLogSummary(logs: any[], week: number): string {
  if (!logs.length) return 'No logs found for this week.'
  
  let summary = `Week ${week} Summary:\n`
  logs.forEach(log => {
    summary += `\n${log.day_title} (${log.date}):\n`
    summary += `  Status: ${log.completed ? 'Completed' : 'Skipped'}\n`
    summary += `  RPE: ${log.rpe}/10\n`
    if (log.exercises) {
      Object.entries(log.exercises).forEach(([name, data]: [string, any]) => {
        if (data.difficulty || data.weight) {
          summary += `  ${name}: ${data.difficulty === 'easy' ? 'TOO EASY' : data.difficulty === 'hard' ? 'TOO HARD' : 'JUST RIGHT'}`
          if (data.weight) summary += ` @ ${data.weight}${data.unit || 'lb'}`
          summary += '\n'
        }
      })
    }
    if (log.notes) summary += `  Notes: ${log.notes}\n`
  })
  return summary
}
