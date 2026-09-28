import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import AuthLayout from './AuthLayout'

function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', age: '', email: '', password: '' })
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
      await api.post('/register', { ...form, age: Number(form.age) })
      navigate('/login')
    } catch (err) {
      const detail = err.response?.data?.detail
      setError(typeof detail === 'string' ? detail : 'Could not create your account. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout mode="register">
      <div className="auth-intro">
        <span className="auth-kicker">A NEW WAY TO EXPLORE</span>
        <h2>Start something<br className="auth-register-break" /> brilliant<span className="auth-title-dot">.</span></h2>
        <p>A little curiosity goes a long way. Let’s get you set up.</p>
      </div>

      <form onSubmit={handleSubmit} className="auth-form">
        {error && <div className="auth-error" role="alert">{error}</div>}
        <div className="auth-field">
          <label htmlFor="register-name">Full name</label>
          <input id="register-name" name="name" type="text" autoComplete="name" placeholder="Your name" value={form.name} onChange={handleChange} required />
        </div>
        <div className="auth-field">
          <label htmlFor="register-age">Age</label>
          <input id="register-age" name="age" type="number" inputMode="numeric" min="1" max="120" placeholder="Your age" value={form.age} onChange={handleChange} required />
        </div>
        <div className="auth-field">
          <label htmlFor="register-email">Email address</label>
          <input id="register-email" name="email" type="email" autoComplete="email" placeholder="you@example.com" value={form.email} onChange={handleChange} required />
        </div>
        <div className="auth-field">
          <label htmlFor="register-password">Password</label>
          <div className="auth-password-wrap">
            <input id="register-password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" placeholder="Create a password" value={form.password} onChange={handleChange} required />
            <button type="button" className="auth-password-toggle" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? 'Hide' : 'Show'}</button>
          </div>
        </div>
        <button className="auth-submit" type="submit" disabled={submitting}>{submitting ? 'Creating account…' : 'Create account'}<span aria-hidden="true">↗</span></button>
      </form>
      <p className="auth-switch">Already have an account? <Link to="/login">Sign in <span aria-hidden="true">→</span></Link></p>
    </AuthLayout>
  )
}

export default Register
