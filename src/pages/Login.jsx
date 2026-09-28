import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import AuthLayout from './AuthLayout'

function Login() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
    if (error) setError('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (submitting) return
    setSubmitting(true)
    setError('')
    try {
      const response = await api.post('/login', form)
      localStorage.setItem('token', response.data.access_token)
      navigate('/users')
    } catch (err) {
      const detail = err.response?.data?.detail
      setError(typeof detail === 'string' ? detail : 'Could not sign in. Please check your details and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout mode="login">
      <div className="auth-intro">
        <span className="auth-kicker">CONTINUE THE CONVERSATION</span>
        <h2>Welcome back<span className="auth-title-dot">.</span></h2>
        <p>Pick up right where your curiosity left off.</p>
      </div>

      <form onSubmit={handleSubmit} className="auth-form">
        {error && <div className="auth-error" role="alert">{error}</div>}
        <div className="auth-field">
          <label htmlFor="login-email">Email address</label>
          <input id="login-email" name="email" type="email" autoComplete="email" placeholder="you@example.com" value={form.email} onChange={handleChange} required />
        </div>
        <div className="auth-field">
          <label htmlFor="login-password">Password</label>
          <div className="auth-password-wrap">
            <input id="login-password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" placeholder="Enter your password" value={form.password} onChange={handleChange} required />
            <button type="button" className="auth-password-toggle" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? 'Hide' : 'Show'}</button>
          </div>
        </div>
        <button className="auth-submit" type="submit" disabled={submitting}>{submitting ? 'Signing in…' : 'Sign in'}<span aria-hidden="true">↗</span></button>
      </form>
      <p className="auth-switch">New around here? <Link to="/register">Create an account <span aria-hidden="true">→</span></Link></p>
    </AuthLayout>
  )
}

export default Login
