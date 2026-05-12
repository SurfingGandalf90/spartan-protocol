// @ts-nocheck
import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(request: Request) {
  try {
    const { messages, system } = await request.json()
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 1000,
      system,
      messages
    })
    return NextResponse.json({ content: response.content[0].text })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
