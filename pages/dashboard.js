import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [status, setStatus] = useState('Loading...')

  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser()

      if (error || !data?.user) {
        setStatus('No user logged in.')
      } else {
        setUser(data.user)
        setStatus('')
      }
    }

    getUser()
  }, [])

  return (
    <div style={{ maxWidth: 500, margin: '100px auto', textAlign: 'center' }}>
      <h1>Dashboard</h1>

      {status && <p>{status}</p>}

      {user && (
        <div>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>User ID:</strong> {user.id}</p>
        </div>
      )}
    </div>
  )
}
