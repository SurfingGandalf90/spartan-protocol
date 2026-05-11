// @ts-nocheck
import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

const KIMBERLY_EMAIL = 'kimberly@kimberlymoller.com'
const CODY_EMAIL = 'ingram.cody90@pm.me'
const APP_URL = 'https://spartan-protocol.vercel.app'

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id, email, current_week')

    if (usersError) throw usersError

    const results = []

    for (const user of users || []) {
      try {
        const isKimberly = user.email === KIMBERLY_EMAIL

        const { data: logs } = await supabase
          .from('session_logs')
          .select('*')
          .eq('user_id', user.id)
          .eq('week', user.current_week || 1)

        const { data: runLogs } = !isKimberly
          ? await supabase.from('run_logs').select('*').eq('user_id', user.id)
          : { data: [] }

        const logSummary = buildLogSummary(logs || [], user.current_week || 1)
        const nextWeek = (user.current_week || 1) + 1

        const prompt = isKimberly
          ? buildKimberlyPrompt(logSummary, user.current_week || 1, nextWeek)
          : buildCodyPrompt(logSummary, user.current_week || 1, nextWeek)

        const message = await anthropic.messages.create({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 4000,
          messages: [{ role: 'user', content: prompt }]
        })

        const responseText = message.content[0].type === 'text' ? message.content[0].text : ''
        const programData = JSON.parse(responseText)

        const { error: saveError } = await supabase
          .from('generated_programs')
          .upsert({
            user_id: user.id,
            week: nextWeek,
            program_data: programData,
            generated_at: new Date().toISOString(),
          }, { onConflict: 'user_id,week' })

        if (saveError) throw saveError

        await supabase
          .from('profiles')
          .update({ current_week: nextWeek })
          .eq('id', user.id)

        await sendProgramReadyEmail(user.email, isKimberly, nextWeek, programData.theme)

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

async function sendProgramReadyEmail(email, isKimberly, week, theme) {
  const name = isKimberly ? 'Kimberly' : 'Cody'
  const programName = isKimberly ? "Kimberly's Program" : 'Spartan Protocol'
  const accentColor = isKimberly ? '#F472B6' : '#E8C547'

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + process.env.RESEND_EMAIL_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Spartan Protocol <onboarding@resend.dev>',
      to: email,
      subject: 'Week ' + week + ' is ready',
      html: '<div style="background:#0F0F0F;color:#E8E8E0;padding:40px;max-width:600px;margin:0 auto;"><div style="font-size:11px;color:' + accentColor + ';letter-spacing:0.2em;text-transform:uppercase;margin-bottom:8px;">' + programName + '</div><div style="font-size:28px;font-weight:800;margin-bottom:8px;">Week ' + week + ' is ready.</div><div style="font-size:13px;color:#666;margin-bottom:32px;">' + theme + '</div><div style="border-left:2px solid ' + accentColor + ';padding-left:16px;margin-bottom:32px;font-size:13px;color:#aaa;">Hey ' + name + ' your program for Week ' + week + ' has been generated based on last weeks logs.</div><a href="' + APP_URL + '" style="display:inline-block;background:' + accentColor + ';color:#0F0F0F;font-weight:700;font-size:12px;text-transform:uppercase;padding:14px 28px;text-decoration:none;">Open Spartan Protocol</a></div>'
    })
  })
}

function buildCodyPrompt(logSummary, currentWeek, nextWeek) {
  return 'You are a strength coach for Spartan Protocol, a back-safe hypertrophy program for a male athlete with a history of back issues. His program is 4 days: Push, Glute/Ham, Pull, Full Body.\n\nWeek ' + currentWeek + ' log:\n' + logSummary + '\n\nGenerate Week ' + nextWeek + '. Rules:\n- No spinal flexion under load\n- No axial compression\n- Progress load 5-10% on Too Easy\n- Keep load on Just Right\n- Regress on Too Hard\n- RPE 7-8\n\nRespond with ONLY JSON:\n{"week":' + nextWeek + ',"theme":"theme","rpeRange":"7-8","days":[{"id":1,"label":"Day 1","title":"Push Day","accent":"#E8C547","supersets":[{"id":"A","name":"Superset A","exercises":[{"name":"Exercise","sets":"3","reps":"8-10","load":"weight","note":"cue"}]}]}]}'
}

function buildKimberlyPrompt(logSummary, currentWeek, nextWeek) {
  const rpe = nextWeek <= 2 ? '6-7' : nextWeek <= 4 ? '7-8' : '8-9'
  return 'You are a strength coach for Spartan Protocol generating Kimberly\'s Program — a 3-day full body circuit for fat loss, strength, and back safety. Sessions 35-38 min, no rest between stations.\n\nFormat: Warmup (2 rounds), Circuit A (3 rounds), Circuit B (3 rounds), Finisher, Cooldown.\n\nBack safety rules:\n- No spinal flexion under load\n- No axial compression\n- All rows chest-supported\n- Deadlifts elevated\n- Core: dead bugs, pallof press, planks only\n\nWeek ' + currentWeek + ' logs:\n' + logSummary + '\n\nGenerate Week ' + nextWeek + '. RPE target: ' + rpe + '.\n\nRespond with ONLY JSON:\n{"week":' + nextWeek + ',"theme":"theme","rpeRange":"' + rpe + '","days":[{"id":1,"label":"Day 1","title":"Full Body Circuit A","accent":"#F472B6","focus":"Lower body + core","duration":"35 min","note":"day note","supersets":[{"id":"W","name":"Warmup - 2 rounds","exercises":[{"name":"Exercise","sets":"2","reps":"10","load":"Bodyweight","note":"cue"}]},{"id":"A","name":"Circuit A - 3 rounds","exercises":[{"name":"Exercise","sets":"3","reps":"12","load":"weight","note":"cue"}]},{"id":"B","name":"Circuit B - 3 rounds","exercises":[{"name":"Exercise","sets":"3","reps":"10","load":"weight","note":"cue"}]},{"id":"F","name":"Finisher - 1 round","exercises":[{"name":"Exercise","sets":"1","reps":"desc","load":"weight","note":"cue"}]},{"id":"C","name":"Cooldown","exercises":[{"name":"Stretch","sets":"1","reps":"60 sec/side","load":"Bodyweight","note":"cue"}]}]}]}'
}

function buildLogSummary(logs, week) {
  if (!logs.length) return 'No logs found for this week — maintain current loads and structure.'
  let summary = 'Week ' + week + ' Summary:\n'
  logs.forEach(function(log) {
    summary += '\n' + log.day_title + ' (' + log.date + '):\n'
    summary += '  Status: ' + (log.completed ? 'Completed' : 'Skipped') + '\n'
    summary += '  RPE: ' + log.rpe + '/10\n'
    if (log.exercises) {
      Object.entries(log.exercises).forEach(function(entry) {
        var name = entry[0]
        var data = entry[1]
        if (data.difficulty || data.weight) {
          summary += '  ' + name + ': ' + (data.difficulty === 'easy' ? 'TOO EASY' : data.difficulty === 'hard' ? 'TOO HARD' : 'JUST RIGHT')
          if (data.weight) summary += ' @ ' + data.weight + (data.unit || 'lb')
          summary += '\n'
        }
      })
    }
    if (log.notes) summary += '  Notes: ' + log.notes + '\n'
  })
  return summary
}
