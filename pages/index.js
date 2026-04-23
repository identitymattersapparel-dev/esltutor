import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function Home() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const loadUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      setUser(user || null)
    }

    loadUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <div style={{ maxWidth: 700, margin: '100px auto', textAlign: 'center' }}>
      <h1>ESL Tutor POC</h1>
      <p>Curriculum-aligned conversational practice for ESL students.</p>

      <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 24 }}>
        {!user ? (
          <>
            <Link href="/signup">Sign Up</Link>
            <Link href="/login">Login</Link>
          </>
        ) : (
          <Link href="/dashboard">Go to Dashboard</Link>
        )}
      </div>
    </div>
  )
}