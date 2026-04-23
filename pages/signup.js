import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSignup = async (e) => {
    e.preventDefault()
    setLoading(true)
    setStatus('Signing up...')

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          }
        }
      })

      if (error) {
        setStatus(`Error: ${error.message}`)
      } else {
        setStatus(`Signup successful. User id: ${data?.user?.id || 'created'}`)
      }
    } catch (err) {
      setStatus(`Unexpected error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: '100px auto', textAlign: 'center' }}>
      <h1>Sign Up</h1>

      <form onSubmit={handleSignup}>
        <input
          placeholder="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          style={{ width: '100%', padding: 10, marginBottom: 10 }}
        />

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
          {loading ? 'Signing Up...' : 'Sign Up'}
        </button>
      </form>

      <p style={{ marginTop: 16 }}>{status}</p>
    </div>
  )
}
