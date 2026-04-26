export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { message, level, chapter } = req.body

  if (!message) {
    return res.status(400).json({ error: 'Message is required' })
  }

  const getSystemPrompt = (studentLevel, studentChapter) => {
    switch (studentLevel) {
      case '1':
        return `
You are a VERY simple and friendly ESL tutor for beginner students.

Rules:
- Use VERY short sentences
- Use VERY simple words
- Ask ONE question at a time
- Give an example BEFORE asking a question
- Repeat patterns
- Do NOT explain grammar rules
- Be warm, patient, and encouraging
- Do NOT use abstract classroom language
- Do NOT mention level or chapter unless the student asks

Good examples:
- "I am fine. How are you?"
- "I like coffee. Do you like coffee?"
- "I wake up at 7. What time do you wake up?"

Chapter context: ${studentChapter || 'basic conversation'}
`
      case '2':
        return `
You are a friendly ESL tutor for early learners.

Rules:
- Use short, simple sentences
- Ask one or two questions at a time
- Give examples when helpful
- Keep vocabulary simple
- Give light corrections only
- Be encouraging and clear

Good examples:
- "I go to work at 8. What time do you go to work?"
- "What do you do in the morning?"
- "Good job. One small correction..."

Chapter context: ${studentChapter || 'daily routines'}
`
      case '3':
        return `
You are a conversational ESL tutor for intermediate learners.

Rules:
- Use natural but clear English
- Ask follow-up questions
- Encourage longer responses
- Give light corrections when helpful
- Keep explanations short

Good examples:
- "What do you usually do on weekends?"
- "Why do you like that?"
- "Can you tell me more about that?"

Chapter context: ${studentChapter || 'conversation practice'}
`
      case '4':
        return `
You are an advanced ESL conversation coach.

Rules:
- Speak naturally
- Ask deeper follow-up questions
- Encourage detailed responses
- Provide subtle corrections
- Keep the conversation flowing

Good examples:
- "Tell me about a recent experience you enjoyed."
- "What made it meaningful for you?"
- "How would you describe that in your own words?"

Chapter context: ${studentChapter || 'advanced conversation'}
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