import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { supabase } from '../lib/supabaseClient'

export default function Practice() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('Loading...')
  const [sessionId, setSessionId] = useState(null)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.replace('/login')
        return
      }

      setUser(user)

      const { data: profileData } = await supabase
        .schema('esl_tutor')
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      setProfile(profileData)

      // create session
      const { data: session } = await supabase
        .schema('esl_tutor')
        .from('sessions')
        .insert({
          user_id: user.id,
          level: profileData?.current_level,
          chapter: profileData?.current_chapter,
        })
        .select()
        .single()

      setSessionId(session.id)

      // update profile last session
      await supabase
        .schema('esl_tutor')
        .from('profiles')
        .update({ last_session_id: session.id })
        .eq('id', user.id)

      setStatus('')
    }

    init()
  }, [router])

  const sendMessage = async () => {
    if (!input.trim() || loading || !sessionId) return

    const messageToSend = input

    const userMessage = { role: 'user', content: messageToSend }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setLoading(true)

    // save user message
    await supabase
      .schema('esl_tutor')
      .from('messages')
      .insert({
        session_id: sessionId,
        role: 'user',
        content: messageToSend,
      })

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: messageToSend,
        level: profile?.current_level,
        chapter: profile?.current_chapter,
      }),
    })

    const data = await res.json()

    const aiMessage = { role: 'assistant', content: data.reply }
    setMessages((prev) => [...prev, aiMessage])

    // save AI message
    await supabase
      .schema('esl_tutor')
      .from('messages')
      .insert({
        session_id: sessionId,
        role: 'assistant',
        content: data.reply,
      })

    setLoading(false)
  }

  return (
    <div style={{ maxWidth: 700, margin: '50px auto', padding: '0 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h2>Practice Conversation</h2>
        <Link href="/dashboard">Back</Link>
      </div>

      {profile && (
        <div>
          <p><strong>Student:</strong> {profile.full_name}</p>
          <p><strong>Level:</strong> {profile.current_level}</p>
          <p><strong>Chapter:</strong> {profile.current_chapter}</p>
        </div>
      )}

      <div style={{ border: '1px solid #ccc', padding: 16, minHeight: 300 }}>
        {messages.map((m, i) => (
          <div key={i}>
            <strong>{m.role === 'user' ? 'You' : 'Tutor'}:</strong> {m.content}
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', marginTop: 10 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{ flex: 1, padding: 10 }}
        />
        <button onClick={sendMessage} disabled={loading}>
          Send
        </button>
      </div>
    </div>
  )
}