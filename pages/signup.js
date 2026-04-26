import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { supabase } from '../lib/supabaseClient'

export default function Signup() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        router.replace('/dashboard')
      }
    }

    checkUser()
  }, [router])

  const handleSignup = async (e) => {
    e.preventDefault()
    setLoading(true)
    setStatus('Signing up...')

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })

      if (error) {
        setStatus(`Error: ${error.message}`)
        setLoading(false)
        return
      }

      setStatus('Signup successful. Redirecting to dashboard...')
      router.push('/dashboard')
    } catch (err) {
      setStatus(`Unexpected error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page">
      <div className="auth-shell">
        <div className="card">
          <div className="hero" style={{ marginBottom: 24 }}>
            <div className="badge">Create Account</div>
            <h1 style={{ fontSize: 32 }}>Sign Up</h1>
            <p>Start practicing English with your AI tutor.</p>
          </div>

          <form onSubmit={handleSignup}>
            <div className="form-group">
              <label className="label">Full Name</label>
              <input
                className="input"
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="label">Email</label>
              <input
                className="input"
                placeholder="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="label">Password</label>
              <input
                className="input"
                placeholder="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button className="button" type="submit" disabled={loading} style={{ width: '100%' }}>
              {loading ? 'Signing Up...' : 'Sign Up'}
            </button>
          </form>

          <p className="status">{status}</p>
          <p className="muted" style={{ marginTop: 16 }}>
            Already have an account? <Link href="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  )
}