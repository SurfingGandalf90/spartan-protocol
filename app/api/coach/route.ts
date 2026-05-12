// @ts-nocheck
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export const runtime = 'edge'

export async function POST(request: Request) {
  try {
    const { messages, system } = await request.json()

    const stream = await anthropic.messages.stream({
      model: 'claude-haiku-4-5',
      max_tokens: 1000,
      system,
      messages
    })

    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          if (chunk.type === 'content_block_delta' && chunk.delta?.text) {
            controller.enqueue(encoder.encode(chunk.delta.text))
          }
        }
        controller.close()
      }
    })

    return new Response(readable, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    })
  } catch (error) {
    return new Response(String(error), { status: 500 })
  }
}
