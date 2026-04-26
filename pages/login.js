import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { supabase } from '../lib/supabaseClient'

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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
      setLoading(false)
      return
    }

    router.push('/dashboard')
  }

  return (
    <div className="page">
      <div className="auth-shell">
        <div className="card">
          <div className="hero" style={{ marginBottom: 24 }}>
            <div className="badge">Welcome Back</div>
            <h1 style={{ fontSize: 32 }}>Login</h1>
            <p>Continue your English practice.</p>
          </div>

          <form onSubmit={handleLogin}>
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
              {loading ? 'Signing In...' : 'Login'}
            </button>
          </form>

          <p className="status">{status}</p>
          <p className="muted" style={{ marginTop: 16 }}>
            Need an account? <Link href="/signup">Sign Up</Link>
          </p>
        </div>
      </div>
    </div>
  )
}