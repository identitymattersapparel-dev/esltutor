import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [level, setLevel] = useState('')
  const [chapter, setChapter] = useState('')
  const [status, setStatus] = useState('Loading...')
  const [saveStatus, setSaveStatus] = useState('')

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
      setLevel(profileData.current_level || '')
      setChapter(profileData.current_chapter || '')
      setStatus('')
    }

    loadDashboard()
  }, [])

  const handleSave = async () => {
    if (!user) return

    setSaveStatus('Saving...')

    const { data, error } = await supabase
      .schema('esl_tutor')
      .from('profiles')
      .update({
        current_level: level,
        current_chapter: chapter,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
      .select()
      .single()

    if (error) {
      setSaveStatus(`Error: ${error.message}`)
      return
    }

    setProfile(data)
    setSaveStatus('Saved successfully.')
  }

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

          <div style={{ marginTop: 24 }}>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', marginBottom: 6 }}>Level</label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                style={{ width: 250, padding: 8 }}
              >
                <option value="">Select level</option>
                <option value="1">Level 1</option>
                <option value="2">Level 2</option>
                <option value="3">Level 3</option>
                <option value="4">Level 4</option>
              </select>
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', marginBottom: 6 }}>Chapter</label>
              <select
                value={chapter}
                onChange={(e) => setChapter(e.target.value)}
                style={{ width: 250, padding: 8 }}
              >
                <option value="">Select chapter</option>
                <option value="1">Chapter 1</option>
                <option value="2">Chapter 2</option>
                <option value="3">Chapter 3</option>
                <option value="4">Chapter 4</option>
                <option value="5">Chapter 5</option>
                <option value="6">Chapter 6</option>
                <option value="7">Chapter 7</option>
                <option value="8">Chapter 8</option>
                <option value="9">Chapter 9</option>
                <option value="10">Chapter 10</option>
                <option value="11">Chapter 11</option>
                <option value="12">Chapter 12</option>
              </select>
            </div>

            <button onClick={handleSave} style={{ padding: '10px 20px' }}>
              Save Progress
            </button>

            {saveStatus && <p style={{ marginTop: 12 }}>{saveStatus}</p>}
          </div>

          <div style={{ marginTop: 24 }}>
            <p><strong>Current Level:</strong> {profile.current_level || '(not set)'}</p>
            <p><strong>Current Chapter:</strong> {profile.current_chapter || '(not set)'}</p>
            <p><strong>Last Session ID:</strong> {profile.last_session_id || '(none)'}</p>
          </div>
        </div>
      )}
    </div>
  )
}
