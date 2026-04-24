import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabaseClient'

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [level, setLevel] = useState('')
  const [chapter, setChapter] = useState('')
  const [status, setStatus] = useState('Loading...')
  const [saveStatus, setSaveStatus] = useState('')
  const [logoutStatus, setLogoutStatus] = useState('')

  const loadProfile = async (userId) => {
    const { data: profileData, error: profileError } = await supabase
      .schema('esl_tutor')
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (profileError) {
      setStatus(`Profile error: ${profileError.message}`)
      return null
    }

    setProfile(profileData)
    setLevel(profileData.current_level || '')
    setChapter(profileData.current_chapter || '')
    setStatus('')
    return profileData
  }

  useEffect(() => {
    const loadDashboard = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        router.replace('/login')
        return
      }

      setUser(user)
      await loadProfile(user.id)
    }

    loadDashboard()
  }, [router])

  const handleSave = async () => {
    if (!user) return

    if (!level || !chapter) {
      setSaveStatus('Please select both a level and a chapter.')
      return
    }

    setSaveStatus('Saving...')

    const { error: updateError } = await supabase
      .schema('esl_tutor')
      .from('profiles')
      .update({
        current_level: level,
        current_chapter: chapter,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (updateError) {
      setSaveStatus(`Error: ${updateError.message}`)
      return
    }

    const refreshedProfile = await loadProfile(user.id)

    if (!refreshedProfile) {
      setSaveStatus('Error: profile could not be reloaded after save.')
      return
    }

    if (
      refreshedProfile.current_level !== level ||
      refreshedProfile.current_chapter !== chapter
    ) {
      setSaveStatus('Error: save did not persist to the database.')
      return
    }

    setSaveStatus('Saved successfully.')
  }

  const handleLogout = async () => {
    setLogoutStatus('Logging out...')

    const { error } = await supabase.auth.signOut()

    if (error) {
      setLogoutStatus(`Error: ${error.message}`)
      return
    }

    router.push('/login')
  }

  const handleStartNew = () => {
    router.push('/practice?mode=new')
  }

  const handleContinue = () => {
    if (!profile?.last_session_id) return
    router.push('/practice?mode=continue')
  }

  return (
    <div style={{ maxWidth: 700, margin: '100px auto', textAlign: 'center' }}>
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

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 16, flexWrap: 'wrap' }}>
              <button onClick={handleSave} style={{ padding: '10px 20px' }}>
                Save Progress
              </button>

              <button onClick={handleStartNew} style={{ padding: '10px 20px' }}>
                Start New Practice
              </button>

              <button
                onClick={handleContinue}
                disabled={!profile.last_session_id}
                style={{ padding: '10px 20px' }}
              >
                Continue Last Session
              </button>

              <button onClick={handleLogout} style={{ padding: '10px 20px' }}>
                Logout
              </button>
            </div>

            {saveStatus && <p style={{ marginTop: 12 }}>{saveStatus}</p>}
            {logoutStatus && <p style={{ marginTop: 12 }}>{logoutStatus}</p>}
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