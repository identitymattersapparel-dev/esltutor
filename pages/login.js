import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setStatus('Signing in...')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setStatus(`Error: ${error.message}`)
    } else {
      setStatus('Login successful.')
    }

    setLoading(false)
  }

  return (
    <div style={{ maxWidth: 400, margin: '100px auto', textAlign: 'center' }}>
      <h1>Login</h1>

      <form onSubmit={handleLogin}>
        <input
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: '100%', padding: 10, marginBottom: 10 }}
          required
        />

        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: '100%', padding: 10, marginBottom: 10 }}
          required
        />

        <button
          type="submit"
          disabled={loading}
          style={{ width: '100%', padding: 10 }}
        >
          {loading ? 'Signing In...' : 'Login'}
        </button>
      </form>

      <p style={{ marginTop: 16 }}>{status}</p>
    </div>
  )
}
