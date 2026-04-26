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
    <div className="page">
      <div className="container">
        <div className="topbar">
          <div>
            <div className="badge">Student Dashboard</div>
            <h1>Welcome back{profile?.full_name ? `, ${profile.full_name}` : ''}</h1>
          </div>
          <button className="button button-secondary" onClick={handleLogout}>
            Logout
          </button>
        </div>

        {status && <p className="status">{status}</p>}

        {user && profile && (
          <div className="grid grid-2">
            <div className="card">
              <h2 className="section-title">Your Learning Setup</h2>

              <div className="form-group">
                <label className="label">Level</label>
                <select
                  className="select"
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                >
                  <option value="">Select level</option>
                  <option value="1">Level 1</option>
                  <option value="2">Level 2</option>
                  <option value="3">Level 3</option>
                  <option value="4">Level 4</option>
                </select>
              </div>

              <div className="form-group">
                <label className="label">Chapter</label>
                <select
                  className="select"
                  value={chapter}
                  onChange={(e) => setChapter(e.target.value)}
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

              <div className="button-row">
                <button className="button" onClick={handleSave}>
                  Save Progress
                </button>
                <button className="button" onClick={handleStartNew}>
                  Start New Practice
                </button>
                <button
                  className="button button-secondary"
                  onClick={handleContinue}
                  disabled={!profile.last_session_id}
                >
                  Continue Last Session
                </button>
              </div>

              {saveStatus && <p className="status">{saveStatus}</p>}
              {logoutStatus && <p className="status">{logoutStatus}</p>}
            </div>

            <div className="card">
              <h2 className="section-title">Current Status</h2>
              <div className="info-list">
                <div className="info-item">
                  <strong>Email:</strong> {user.email}
                </div>
                <div className="info-item">
                  <strong>Current Level:</strong> {profile.current_level || '(not set)'}
                </div>
                <div className="info-item">
                  <strong>Current Chapter:</strong> {profile.current_chapter || '(not set)'}
                </div>
                <div className="info-item">
                  <strong>Last Session ID:</strong> {profile.last_session_id || '(none)'}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}