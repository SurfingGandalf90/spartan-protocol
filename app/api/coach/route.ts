// @ts-nocheck
export const runtime = 'edge'

export async function POST(request: Request) {
  try {
    const { messages, system } = await request.json()
    console.log('coach hit, messages:', messages.length, 'system len:', system?.length)

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'messages-2023-12-15'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 800,
        stream: true,
        system,
        messages
      })
    })

    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const chunk = decoder.decode(value, { stream: true })
          for (const line of chunk.split('\n')) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6).trim()
              if (data === '[DONE]') continue
              try {
                const json = JSON.parse(data)
                const text = json.delta?.text
                if (text) controller.enqueue(encoder.encode(text))
              } catch {}
            }
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
