import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [status, setStatus] = useState('Loading...')

  useEffect(() => {
    const loadDashboard = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        setStatus('No user logged in.')
        return
      }

      setUser(user)

      const { data: profileData, error: profileError } = await supabase
        .schema('esl_tutor')
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileError) {
        setStatus(`Profile error: ${profileError.message}`)
        return
      }

      setProfile(profileData)
      setStatus('')
    }

    loadDashboard()
  }, [])

  return (
    <div style={{ maxWidth: 600, margin: '100px auto', textAlign: 'center' }}>
      <h1>Dashboard</h1>

      {status && <p>{status}</p>}

      {user && (
        <div style={{ marginBottom: 24 }}>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>User ID:</strong> {user.id}</p>
        </div>
      )}

      {profile && (
        <div>
          <p><strong>Full Name:</strong> {profile.full_name || '(blank)'}</p>
          <p><strong>Current Level:</strong> {profile.current_level || '(not set)'}</p>
          <p><strong>Current Chapter:</strong> {profile.current_chapter || '(not set)'}</p>
          <p><strong>Last Session ID:</strong> {profile.last_session_id || '(none)'}</p>
        </div>
      )}
    </div>
  )
}
