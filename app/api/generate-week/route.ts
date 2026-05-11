// @ts-nocheck
import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
const KIMBERLY_EMAIL = 'kimberly@kimberlymoller.com'
const APP_URL = 'https://spartan-protocol.vercel.app'

export async function GET(request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== 'Bearer ' + process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const res = await fetch(process.env.NEXT_PUBLIC_SUPABASE_URL + '/rest/v1/profiles?select=id,email,current_week', {
      headers: {
        'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': 'Bearer ' + process.env.SUPABASE_SERVICE_ROLE_KEY
      }
    })
    const users = await res.json()

    const results = []
    for (const user of users || []) {
      try {
        const isKimberly = user.email === KIMBERLY_EMAIL
        const logsRes = await fetch(process.env.NEXT_PUBLIC_SUPABASE_URL + '/rest/v1/session_logs?select=*&user_id=eq.' + user.id + '&week=eq.' + (user.current_week || 1), {
          headers: {
            'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
            'Authorization': 'Bearer ' + process.env.SUPABASE_SERVICE_ROLE_KEY
          }
        })
        const logs = await logsRes.json()
        const logSummary = buildLogSummary(logs || [], user.current_week || 1)
        const nextWeek = (user.current_week || 1) + 1
        const prompt = isKimberly ? buildKimberlyPrompt(logSummary, user.current_week || 1, nextWeek) : buildCodyPrompt(logSummary, user.current_week || 1, nextWeek)

        const message = await anthropic.messages.create({
          model: 'claude-sonnet-4-5',
          max_tokens: 4000,
          messages: [{ role: 'user', content: prompt }]
        })

        const responseText = message.content[0].type === 'text' ? message.content[0].text : ''
        const cleanResponse = responseText.replace(/```json/g, '').replace(/```/g, '').trim()
        const programData = JSON.parse(cleanResponse)

        await fetch(process.env.NEXT_PUBLIC_SUPABASE_URL + '/rest/v1/generated_programs', {
          method: 'POST',
          headers: {
            'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
            'Authorization': 'Bearer ' + process.env.SUPABASE_SERVICE_ROLE_KEY,
            'Content-Type': 'application/json',
            'Prefer': 'resolution=merge-duplicates'
          },
          body: JSON.stringify({ user_id: user.id, week: nextWeek, program_data: programData, generated_at: new Date().toISOString() })
        })

        await fetch(process.env.NEXT_PUBLIC_SUPABASE_URL + '/rest/v1/profiles?id=eq.' + user.id, {
          method: 'PATCH',
          headers: {
            'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
            'Authorization': 'Bearer ' + process.env.SUPABASE_SERVICE_ROLE_KEY,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ current_week: nextWeek })
        })

        await sendEmail(user.email, isKimberly, nextWeek, programData.theme)
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

async function sendEmail(email, isKimberly, week, theme) {
  const name = isKimberly ? 'Kimberly' : 'Cody'
  const accent = isKimberly ? '#F472B6' : '#E8C547'
  const programName = isKimberly ? "Kimberly's Program" : 'Spartan Protocol'
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + process.env.RESEND_EMAIL_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'Spartan Protocol <onboarding@resend.dev>',
      to: email,
      subject: 'Week ' + week + ' is ready',
      html: '<div style="background:#0F0F0F;color:#E8E8E0;padding:40px;max-width:600px"><p style="color:' + accent + '">' + programName + '</p><h1>Week ' + week + ' is ready.</h1><p style="color:#666">' + theme + '</p><p>Hey ' + name + ', your Week ' + week + ' program is live.</p><a href="' + APP_URL + '" style="background:' + accent + ';color:#000;padding:12px 24px;text-decoration:none;display:inline-block;margin-top:16px">Open App</a></div>'
    })
  })
}

function buildCodyPrompt(logSummary, currentWeek, nextWeek) {
  return 'You are a strength coach for Spartan Protocol, a back-safe hypertrophy program. 4 days: Push, Glute/Ham, Pull, Full Body.\n\nWeek ' + currentWeek + ' log:\n' + logSummary + '\n\nGenerate Week ' + nextWeek + '. No spinal flexion under load. No axial compression. Progress 5-10% on Too Easy. Keep load on Just Right. Regress on Too Hard. RPE 7-8.\n\nRespond ONLY with raw JSON, no markdown, no code fences:\n{"week":' + nextWeek + ',"theme":"string","rpeRange":"7-8","days":[{"id":1,"label":"Day 1","title":"Push Day","accent":"#E8C547","supersets":[{"id":"A","name":"Superset A","exercises":[{"name":"Exercise","sets":"3","reps":"8-10","load":"weight","note":"cue"}]}]}]}'
}

function buildKimberlyPrompt(logSummary, currentWeek, nextWeek) {
  var rpe = nextWeek <= 2 ? '6-7' : nextWeek <= 4 ? '7-8' : '8-9'
  return 'You are a strength coach generating Kimberly\'s Program — 3-day full body circuit, fat loss, back-safe. 35-38 min, no rest between stations.\n\nFormat per day: Warmup (2 rounds), Circuit A (3 rounds), Circuit B (3 rounds), Finisher, Cooldown.\n\nRules: No spinal flexion under load. No axial compression. Rows chest-supported. Deadlifts elevated. Core: dead bugs/pallof/planks only.\n\nWeek ' + currentWeek + ' logs:\n' + logSummary + '\n\nGenerate Week ' + nextWeek + '. RPE ' + rpe + '.\n\nRespond ONLY with raw JSON, no markdown, no code fences:\n{"week":' + nextWeek + ',"theme":"string","rpeRange":"' + rpe + '","days":[{"id":1,"label":"Day 1","title":"Full Body Circuit A","accent":"#F472B6","focus":"Lower body + core","duration":"35 min","note":"string","supersets":[{"id":"W","name":"Warmup - 2 rounds","exercises":[{"name":"Ex","sets":"2","reps":"10","load":"BW","note":"cue"}]},{"id":"A","name":"Circuit A - 3 rounds","exercises":[{"name":"Ex","sets":"3","reps":"12","load":"weight","note":"cue"}]},{"id":"B","name":"Circuit B - 3 rounds","exercises":[{"name":"Ex","sets":"3","reps":"10","load":"weight","note":"cue"}]},{"id":"F","name":"Finisher","exercises":[{"name":"Ex","sets":"1","reps":"desc","load":"weight","note":"cue"}]},{"id":"C","name":"Cooldown","exercises":[{"name":"Stretch","sets":"1","reps":"60 sec","load":"BW","note":"cue"}]}]}]}'
}

function buildLogSummary(logs, week) {
  if (!logs.length) return 'No logs — maintain current loads.'
  var s = 'Week ' + week + ' Summary:\n'
  logs.forEach(function(log) {
    s += '\n' + log.day_title + ' (' + log.date + '):\n'
    s += '  Status: ' + (log.completed ? 'Completed' : 'Skipped') + '\n'
    s += '  RPE: ' + log.rpe + '/10\n'
    if (log.exercises) {
      Object.entries(log.exercises).forEach(function(e) {
        var n = e[0]; var d = e[1]
        if (d.difficulty || d.weight) {
          s += '  ' + n + ': ' + (d.difficulty === 'easy' ? 'TOO EASY' : d.difficulty === 'hard' ? 'TOO HARD' : 'JUST RIGHT')
          if (d.weight) s += ' @ ' + d.weight + (d.unit || 'lb')
          s += '\n'
        }
      })
    }
    if (log.notes) s += '  Notes: ' + log.notes + '\n'
  })
  return s
}