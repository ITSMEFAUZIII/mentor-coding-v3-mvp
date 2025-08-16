import React from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { supabase } from './lib/supabaseClient'

export default function App(){
  const navigate = useNavigate()
  const [user, setUser] = React.useState(null)

  React.useEffect(()=>{
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null))
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
      setUser(session?.user ?? null)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <div className="container">
      <header className="header">
        <div>
          <div style={{fontSize:18, fontWeight:800}}>Mentor Coding v3 MVP</div>
          <div className="small">XP · Streak · Quests · Leaderboard</div>
        </div>
        <nav style={{display:'flex', gap:12}}>
          <NavLink to="/" className={({isActive}) => isActive ? 'active' : ''}>Dashboard</NavLink>
          <NavLink to="/leaderboard" className={({isActive}) => isActive ? 'active' : ''}>Leaderboard</NavLink>
          <NavLink to="/chat" className={({isActive}) => isActive ? 'active' : ''}>Chat</NavLink>
          {user ? (
            <button className="btn" onClick={signOut}>Sign out</button>
          ) : (
            <NavLink to="/login" className={({isActive}) => isActive ? 'active' : ''}>Login</NavLink>
          )}
        </nav>
      </header>
      <Outlet />
      <footer className="small" style={{marginTop:24, opacity:.7}}>v3-mvp • Supabase • React</footer>
    </div>
  )
}
