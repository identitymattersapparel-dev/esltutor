export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { message, level, chapter } = req.body

  if (!message) {
    return res.status(400).json({ error: 'Message is required' })
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a friendly ESL tutor helping adult learners practice English.

Student level: ${level || 'beginner'}
Chapter: ${chapter || 'general conversation'}

Keep responses:
- simple
- conversational
- short
- encouraging

Gently correct mistakes.`,
          },
          {
            role: 'user',
            content: message,
          },
        ],
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      return res.status(500).json({ error: errorText })
    }

    const data = await response.json()
    const reply = data.choices?.[0]?.message?.content || 'No response'

    return res.status(200).json({ reply })
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}