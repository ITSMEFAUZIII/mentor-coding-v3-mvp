import React from 'react'
import { supabase } from '../lib/supabaseClient'

export default function Chat(){
  const [text, setText] = React.useState('')
  const [messages, setMessages] = React.useState([])

  React.useEffect(()=> {
    let mounted = true

    // initial load dari DB (persisted history)
    supabase.from('messages')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(30)
      .then(({data}) => mounted && setMessages(data ?? []))

    // Fallback realtime: broadcast channel (tidak perlu replication)
    const channel = supabase.channel('room:global', {
      config: { broadcast: { self: false } }  // jangan echo pesan sendiri
    })

    channel.on('broadcast', { event: 'chat' }, (payload) => {
      setMessages(prev => [payload.payload, ...prev].slice(0,30))
    })

    channel.subscribe()

    return () => { mounted = false; supabase.removeChannel(channel) }
  }, [])

  const send = async (e) => {
    e.preventDefault()
    const payload = { body: text, created_at: new Date().toISOString() }

    // 1) kirim broadcast biar yang lain langsung lihat
    const ch = supabase.channel('room:global')
    await ch.send({ type: 'broadcast', event: 'chat', payload })

    // 2) simpan ke DB (persist)
    const { error } = await supabase.from('messages').insert({ body: text })
    if (error) return alert(error.message)

    // 3) optimistik: render langsung juga di sisi pengirim
    setMessages(prev => [{ id: Math.random(), ...payload }, ...prev].slice(0,30))
    setText('')
  }

  return (
    <div className="grid" style={{maxWidth:720, margin:'0 auto'}}>
      <div className="card">
        <h3>Community Chat (MVP)</h3>
        <form onSubmit={send} style={{display:'flex', gap:8, margin:'8px 0 16px'}}>
          <input className="input" value={text} onChange={e=>setText(e.target.value)} placeholder="Say something nice..." />
          <button className="btn">Send</button>
        </form>
        <div className="grid">
          {messages.map(m => (
            <div key={m.id ?? m.created_at} className="card" style={{padding:12}}>
              <div className="small" style={{opacity:.8}}>{new Date(m.created_at).toLocaleString()}</div>
              <div>{m.body}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
