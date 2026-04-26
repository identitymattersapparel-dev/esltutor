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
    <div className="page">
      <div className="container">
        <div className="card hero">
          <div className="badge">ESL Tutor POC</div>
          <h1>Practice English with an AI Tutor</h1>
          <p>
            Students can choose their level and chapter, then practice
            conversational English in a guided way.
          </p>

          <div className="home-actions">
            {!user ? (
              <>
                <Link className="button" href="/signup">
                  Sign Up
                </Link>
                <Link className="button button-secondary" href="/login">
                  Login
                </Link>
              </>
            ) : (
              <Link className="button" href="/dashboard">
                Go to Dashboard
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}