import React from 'react'
import { supabase } from '../lib/supabaseClient'
import { useQuery } from '@tanstack/react-query'

async function getLeaderboard(){
  const { data, error } = await supabase.rpc('leaderboard_top', { p_limit: 10 })
  if(error) throw error
  return data ?? []
}

export default function Leaderboard(){
  const { data = [] } = useQuery({ queryKey:['leaderboard'], queryFn: getLeaderboard,refetchInterval: 5000, })

  return (
    <div className="card">
      <div className="header">
        <h3>Global Leaderboard (Top 10)</h3>
        <span className="small">Realtime-ready</span>
      </div>
      <div className="grid">
        {data.map((row, idx)=> (
          <div key={row.user_id} className="grid" style={{gridTemplateColumns:'40px 1fr 100px', alignItems:'center'}}>
            <div className="badge">#{idx+1}</div>
            <div style={{fontWeight:700}}>{row.display_name || row.user_id.slice(0,8)}</div>
            <div className="badge">{row.total_xp} XP</div>
          </div>
        ))}
        {data.length===0 && <div className="small">No data yet. Earn XP from Dashboard.</div>}
      </div>
    </div>
  )
}
