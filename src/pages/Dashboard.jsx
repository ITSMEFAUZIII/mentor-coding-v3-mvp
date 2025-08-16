import React from 'react'
import { supabase } from '../lib/supabaseClient'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

const userIdKey = async () => {
  const { data } = await supabase.auth.getUser()
  return data.user?.id
}

async function getProfile(){
  const uid = await userIdKey()
  if(!uid) return null
  const { data, error } = await supabase.from('profiles').select('*').eq('user_id', uid).single()
  if(error && error.code !== 'PGRST116') throw error
  return data
}

async function upsertProfile(payload){
  const uid = await userIdKey()
  const row = { user_id: uid, ...payload }
  const { error } = await supabase.from('profiles').upsert(row, { onConflict: 'user_id' })
  if (error) throw error
}

async function getProgress(){
  const uid = await userIdKey()
  if(!uid) return []
  const { data, error } = await supabase.from('progress').select('*').eq('user_id', uid).limit(50)
  if(error) throw error
  return data
}

async function addXP(amount){
  const uid = await userIdKey()
  if(!uid) throw new Error('No user')
  const { error } = await supabase.rpc('increment_xp', { p_user_id: uid, p_amount: amount })
  if(error) throw error
}

export default function Dashboard(){
  const qc = useQueryClient()
  const { data: profile } = useQuery({ queryKey:['profile'], queryFn: getProfile })
  const { data: progress } = useQuery({ queryKey:['progress'], queryFn: getProgress })

  const mProfile = useMutation({ mutationFn: upsertProfile, onSuccess:()=>qc.invalidateQueries({queryKey:['profile']}) })
  const mXP = useMutation({ mutationFn: addXP, onSuccess:()=>qc.invalidateQueries({queryKey:['progress']}) })

  return (
    <div className="grid grid-2">
      <div className="card">
        <div className="header">
          <h3>Profile</h3>
          <span className="badge">{profile?.display_name || 'Anonymous'}</span>
        </div>
        <div className="grid">
          <input className="input" placeholder="Display name" defaultValue={profile?.display_name||''} id="dname"/>
          <button className="btn" onClick={()=> mProfile.mutate({ display_name: document.getElementById('dname').value })}>
            Save Profile
          </button>
        </div>
      </div>

      <div className="card">
        <div className="header">
          <h3>XP & Streak</h3>
        </div>
        <div className="grid">
          <div className="kpi">{progress?.reduce((a,p)=>a+(p.xp||0),0) || 0} XP</div>
          <div>Lessons tracked: <b>{progress?.length||0}</b></div>
          <div style={{display:'flex', gap:8}}>
            <button className="btn" onClick={()=> mXP.mutate(25)}>+25 XP</button>
            <button className="btn" onClick={()=> mXP.mutate(100)}>+100 XP</button>
          </div>
          <div className="small">Server-side validated to avoid cheating.</div>
        </div>
      </div>
    </div>
  )
}
