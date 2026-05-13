// @ts-nocheck
export const runtime = 'edge'

export async function POST(request) {
  try {
    const body = await request.json()
    const messages = body.messages
    const system = body.system

    console.log('coach hit, messages:', messages.length, 'system len:', system ? system.length : 0)

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 800,
        stream: true,
        system: system,
        messages: messages
      })
    })

    if (!res.ok) {
      const err = await res.text()
      return new Response(err, { status: res.status })
    }

    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const chunk = decoder.decode(value, { stream: true })
          const lines = chunk.split('
')
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6).trim()
              if (data === '[DONE]') continue
              try {
                const json = JSON.parse(data)
                const text = json.delta && json.delta.text
                if (text) controller.enqueue(encoder.encode(text))
              } catch (e) {}
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
