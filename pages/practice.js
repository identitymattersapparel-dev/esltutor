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
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        router.replace('/login')
        return
      }

      setUser(user)

      const { data: profileData, error: profileError } = await supabase
        .schema('esl_tutor')
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileError || !profileData) {
        setStatus(`Profile error: ${profileError?.message || 'Profile not found'}`)
        return
      }

      setProfile(profileData)

      const savedLevel = profileData.current_level || ''
      const savedChapter = profileData.current_chapter || ''

      if (!savedLevel || !savedChapter) {
        setStatus('Please go back to the dashboard and save a level and chapter before starting practice.')
        return
      }

      const welcomeMessage = {
        role: 'assistant',
        content: `Hi ${profileData.full_name || 'there'}! Let's practice English together. You are working on Level ${savedLevel}, Chapter ${savedChapter}. Tell me about yourself, or answer this: How are you today?`,
      }

      setMessages([welcomeMessage])

      const { data: sessionData, error: sessionError } = await supabase
        .schema('esl_tutor')
        .from('sessions')
        .insert({
          user_id: user.id,
          level: savedLevel,
          chapter: savedChapter,
          status: 'active',
        })
        .select()
        .single()

      if (sessionError || !sessionData) {
        setStatus(`Session error: ${sessionError?.message || 'Could not create session'}`)
        return
      }

      setSessionId(sessionData.id)

      await supabase
        .schema('esl_tutor')
        .from('profiles')
        .update({
          last_session_id: sessionData.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

      await supabase
        .schema('esl_tutor')
        .from('messages')
        .insert({
          session_id: sessionData.id,
          role: 'assistant',
          content: welcomeMessage.content,
        })

      setStatus('')
    }

    init()
  }, [router])

  const sendMessage = async () => {
    if (!input.trim() || loading || !sessionId) return

    const messageToSend = input.trim()

    const userMessage = { role: 'user', content: messageToSend }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
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

      if (!res.ok) {
        const errorMessage = data.error || 'Something went wrong'
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: `Error: ${errorMessage}` },
        ])
        setLoading(false)
        return
      }

      const aiReply = data.reply || 'No response'
      const aiMessage = { role: 'assistant', content: aiReply }

      setMessages((prev) => [...prev, aiMessage])

      await supabase
        .schema('esl_tutor')
        .from('messages')
        .insert({
          session_id: sessionId,
          role: 'assistant',
          content: aiReply,
        })
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `Error: ${error.message}` },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = async (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      await sendMessage()
    }
  }

  return (
    <div style={{ maxWidth: 700, margin: '50px auto', padding: '0 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2>Practice Conversation</h2>
        <Link href="/dashboard">Back to Dashboard</Link>
      </div>

      {status && <p>{status}</p>}

      {profile && (
        <div style={{ marginBottom: 20 }}>
          <p><strong>Student:</strong> {profile.full_name || user?.email}</p>
          <p><strong>Level:</strong> {profile.current_level || '(not set)'}</p>
          <p><strong>Chapter:</strong> {profile.current_chapter || '(not set)'}</p>
        </div>
      )}

      <div
        style={{
          border: '1px solid #ccc',
          padding: 16,
          minHeight: 320,
          marginBottom: 16,
          background: '#fff',
        }}
      >
        {messages.length === 0 ? (
          <p>Loading conversation...</p>
        ) : (
          messages.map((m, i) => (
            <div key={i} style={{ marginBottom: 12 }}>
              <strong>{m.role === 'user' ? 'You' : 'Tutor'}:</strong> {m.content}
            </div>
          ))
        )}
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          style={{ flex: 1, padding: 10 }}
          placeholder="Type your message..."
          disabled={loading || !sessionId}
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim() || !sessionId}
          style={{ padding: '10px 20px' }}
        >
          {loading ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  )
}