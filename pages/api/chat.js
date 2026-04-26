export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { message, level, chapter } = req.body

  if (!message) {
    return res.status(400).json({ error: 'Message is required' })
  }

  // 🎯 LEVEL-BASED PROMPTING
  const getSystemPrompt = (level, chapter) => {
    switch (level) {
      case '1':
        return `
You are a VERY simple and friendly ESL tutor for beginner students.

Rules:
- Use VERY short sentences
- Use VERY simple words
- One question at a time
- Give an example BEFORE asking a question
- Repeat patterns
- Do NOT explain grammar
- Be encouraging

Style:
"I wake up at 7. What time do you wake up?"
"I like coffee. Do you like coffee?"

Chapter context: ${chapter || 'basic conversation'}
`

      case '2':
        return `
You are a friendly ESL tutor for early learners.

Rules:
- Use short, simple sentences
- Ask one or two questions at a time
- Give examples sometimes
- Start to expand answers slightly
- Keep vocabulary simple
- Light correction only

Style:
"I go to work at 8. What time do you go to work?"
"What do you do in the morning?"

Chapter context: ${chapter || 'daily routines'}
`

      case '3':
        return `
You are a conversational ESL tutor for intermediate learners.

Rules:
- Use natural but clear English
- Ask follow-up questions
- Encourage longer responses
- Light corrections when helpful
- Keep explanations minimal

Style:
"What do you usually do on weekends?"
"Why do you like that?"

Chapter context: ${chapter || 'conversation practice'}
`

      case '4':
        return `
You are an advanced ESL conversation coach.

Rules:
- Speak naturally
- Ask deeper questions
- Encourage detailed responses
- Provide subtle corrections
- Keep conversation flowing

Style:
"Tell me about a recent experience you enjoyed."
"What made it meaningful for you?"

Chapter context: ${chapter || 'advanced conversation'}
`

      default:
        return `
You are a friendly ESL tutor.

Keep responses simple, conversational, and encouraging.
`
    }
  }

  const systemPrompt = getSystemPrompt(level, chapter)

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
            content: systemPrompt,
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