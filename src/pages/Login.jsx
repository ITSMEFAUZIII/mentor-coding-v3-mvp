import React from 'react'
import { supabase } from '../lib/supabaseClient'
import { useNavigate } from 'react-router-dom'

export default function Login(){
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const navigate = useNavigate()

  const onLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) return alert(error.message)
    navigate('/')
  }

  const onSignup = async (e) => {
    e.preventDefault()
    setLoading(true)
    const { data, error } = await supabase.auth.signUp({ email, password })
    setLoading(false)
    if (error) return alert(error.message)
    alert('Check your email to confirm.')
  }

  return (
    <div className="grid" style={{maxWidth:420, margin:'40px auto'}}>
      <div className="card">
        <h2>Welcome back</h2>
        <p className="small">Use email + password to sign in.</p>
        <form className="grid" onSubmit={onLogin}>
          <input className="input" placeholder="email" value={email} onChange={e=>setEmail(e.target.value)} />
          <input className="input" type="password" placeholder="password" value={password} onChange={e=>setPassword(e.target.value)} />
          <button className="btn" disabled={loading}>{loading?'Loading...':'Sign In'}</button>
        </form>
        <div className="separator"></div>
        <form className="grid" onSubmit={onSignup}>
          <button className="btn" disabled={loading}>Create Account</button>
        </form>
      </div>
    </div>
  )
}
