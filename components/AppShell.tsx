'use client'

import { useState, useEffect, createContext, useContext } from 'react'
import { supabase } from '@/lib/supabase'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import type { User, Session } from '@supabase/supabase-js'

const AuthContext = createContext<{ user: User | null; session: Session | null; profile: string | null }>({
  user: null, session: null, profile: null
})

export const useAuth = () => useContext(AuthContext)

function SpartanLogo({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <path d="M8,10 L40,10 L40,30 L24,44 L8,30 Z" fill="#1a1506" stroke="#E8C547" strokeWidth="1.4" strokeLinejoin="miter" />
      <path d="M11,13 L37,13 L37,29 L24,40 L11,29 Z" fill="none" stroke="#E8C547" strokeWidth="0.5" strokeOpacity="0.3" strokeLinejoin="miter" />
      <line x1="24" y1="2" x2="24" y2="46" stroke="#E8C547" strokeWidth="1.8" strokeLinecap="square" />
      <polygon points="24,1 29,13 24,10 19,13" fill="#E8C547" />
      <line x1="16" y1="17" x2="32" y2="17" stroke="#E8C547" strokeWidth="1.5" strokeLinecap="square" />
      <polygon points="24,46 22,43 26,43" fill="#E8C547" />
    </svg>
  )
}

function LoginScreen() {
  return (
    <div style={{ minHeight: '100vh', background: '#0F0F0F', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: "'DM Mono', monospace" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Syne:wght@700;800&display=swap');`}</style>
      <div style={{ marginBottom: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <SpartanLogo size={56} />
        <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 28, fontWeight: 800, color: '#E8E8E0', letterSpacing: '-0.02em' }}>Spartan Protocol</div>
        <div style={{ fontSize: 11, color: '#444', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Lean · Mobile · Durable</div>
      </div>
      <div style={{ width: '100%', maxWidth: 380 }}>
        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: { default: { colors: { brand: '#E8C547', brandAccent: '#d4b03c', inputBackground: '#111', inputBorder: '#2a2a2a', inputText: '#E8E8E0', inputPlaceholder: '#444', messageText: '#888', anchorTextColor: '#E8C547', defaultButtonBackground: '#1a1a1a', defaultButtonBackgroundHover: '#222', defaultButtonBorder: '#2a2a2a', defaultButtonText: '#888' } } },
            style: {
              button: { fontFamily: "'DM Mono', monospace", fontSize: '12px', letterSpacing: '0.08em' },
              input: { fontFamily: "'DM Mono', monospace", fontSize: '13px' },
              label: { fontFamily: "'DM Mono', monospace", fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#555' },
              container: { background: 'transparent' },
              anchor: { fontFamily: "'DM Mono', monospace", fontSize: '11px' },
            }
          }}
          providers={[]}
          redirectTo={typeof window !== 'undefined' ? window.location.origin : ''}
        />
      </div>
    </div>
  )
}

function ProfileSelector({ user, onSelect }: { user: User; onSelect: (p: string) => void }) {
  const profiles = [
    { id: 'primary', name: 'Cody', subtitle: 'Back-safe hypertrophy + NRC running', accent: '#E8C547' },
    { id: 'wife', name: "Kimberly's Program", subtitle: 'Fat loss · Strength · Circuit style', accent: '#F472B6' },
  ]
  return (
    <div style={{ minHeight: '100vh', background: '#0F0F0F', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: "'DM Mono', monospace" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Syne:wght@700;800&display=swap');`}</style>
      <SpartanLogo size={44} />
      <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800, color: '#E8E8E0', marginTop: 12, marginBottom: 4 }}>Who's training today?</div>
      <div style={{ fontSize: 11, color: '#444', letterSpacing: '0.1em', marginBottom: 32 }}>{user.email}</div>
      <div style={{ width: '100%', maxWidth: 380, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {profiles.map(p => (
          <button key={p.id} onClick={() => onSelect(p.id)} style={{ background: '#111', border: `1px solid ${p.accent}40`, borderLeft: `3px solid ${p.accent}`, padding: '18px 20px', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s', fontFamily: "'DM Mono', monospace" }}>
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 16, fontWeight: 700, color: p.accent, marginBottom: 4 }}>{p.name}</div>
            <div style={{ fontSize: 11, color: '#555', letterSpacing: '0.04em' }}>{p.subtitle}</div>
          </button>
        ))}
        <button onClick={() => supabase.auth.signOut().then(() => localStorage.removeItem("spartan-profile"))} style={{ background: 'transparent', border: '1px solid #1e1e1e', color: '#444', fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '10px', cursor: 'pointer', marginTop: 8 }}>Sign out</button>
      </div>
    </div>
  )
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<string | null>(() => typeof window !== "undefined" ? localStorage.getItem("spartan-profile") : null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  if (loading) return <div style={{ minHeight: '100vh', background: '#0F0F0F', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><SpartanLogo size={36} /></div>
  if (!session?.user) return <LoginScreen />
  if (!profile) return <ProfileSelector user={session.user} onSelect={(p) => { localStorage.setItem("spartan-profile", p); setProfile(p); }} />

  return (
    <AuthContext.Provider value={{ user: session.user, session, profile }}>
      <div style={{ position: 'relative' }}>
        <button onClick={() => setProfile(null)} style={{ position: 'fixed', top: 12, right: 12, zIndex: 999, background: '#111', border: '1px solid #2a2a2a', color: '#555', fontFamily: "'DM Mono', monospace", fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '5px 10px', cursor: 'pointer' }}>
          Switch
        </button>
        {children}
      </div>
    </AuthContext.Provider>
  )
}
