import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { BrowserRouter, Routes, Route, Navigate, NavLink, useNavigate } from 'react-router-dom';
import { supabase, auth, type Brand } from './lib/supabase';
import Landing from './pages/Landing';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Studio from './pages/Studio';
import CalendarPage from './pages/CalendarPage';
import Platforms from './pages/Platforms';
import SeoPage from './pages/SeoPage';
import Analytics from './pages/Analytics';
import Billing from './pages/Billing';
import { Spinner } from './components/ui';

export function App() {
  const [user, setUser] = useState<User | null>(null);
  const [brand, setBrand] = useState<Brand | null>(null);
  const [loading, setLoading] = useState(true);

  const loadBrand = async (userId: string) => {
    const { data } = await supabase.from('brands').select('*').eq('user_id', userId).limit(1);
    setBrand((data as Brand[])?.[0] ?? null);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      if (data.session?.user) loadBrand(data.session.user.id);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
      if (session?.user) loadBrand(session.user.id);
      else setBrand(null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner label="Loading..." />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing user={user} brand={brand} onBrandLoaded={loadBrand} />} />
        <Route path="/onboarding" element={user ? <Onboarding user={user} onDone={loadBrand} /> : <Navigate to="/" />} />
        <Route
          path="/app/*"
          element={
            user ? (
              brand ? (
                <AppShell user={user} brand={brand} onBrandChange={() => loadBrand(user.id)} />
              ) : (
                <Navigate to="/onboarding" />
              )
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

const NAV = [
  { to: '/app', label: 'Dashboard', icon: '📊', end: true },
  { to: '/app/studio', label: 'AI Studio', icon: '✨' },
  { to: '/app/calendar', label: 'Calendar', icon: '🗓️' },
  { to: '/app/platforms', label: 'Platforms', icon: '🔗' },
  { to: '/app/seo', label: 'SEO Engine', icon: '📈' },
  { to: '/app/analytics', label: 'Analytics', icon: '💰' },
  { to: '/app/billing', label: 'Billing', icon: '💳' },
];

function AppShell({ user, brand, onBrandChange }: { user: User; brand: Brand; onBrandChange: () => void }) {
  const navigate = useNavigate();
  const signOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <div className="flex min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-white/10 bg-black/40 p-4 md:flex">
        <div className="mb-8 flex items-center gap-2 px-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-lg">🚀</div>
          <div>
            <p className="text-sm font-bold text-white">PromoteAI</p>
            <p className="text-[10px] uppercase tracking-wider text-slate-500">{brand.name}</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  isActive ? 'bg-violet-500/15 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <span>{n.icon}</span> {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-white/10 pt-3">
          <p className="truncate px-3 text-xs text-slate-500">{user.email}</p>
          <button onClick={signOut} className="ghost-btn mt-2 w-full px-3 py-2 text-sm">Sign out</button>
        </div>
      </aside>

      <main className="flex-1 p-4 md:ml-60 md:p-8">
        {/* Mobile top bar */}
        <div className="mb-4 flex items-center justify-between md:hidden">
          <p className="font-bold text-white">🚀 PromoteAI</p>
          <button onClick={signOut} className="ghost-btn px-3 py-1.5 text-xs">Sign out</button>
        </div>
        <div className="mb-6 flex flex-wrap gap-2 md:hidden">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => `rounded-lg px-3 py-1.5 text-xs font-medium ${isActive ? 'bg-violet-500/20 text-white' : 'bg-white/5 text-slate-400'}`}>
              {n.label}
            </NavLink>
          ))}
        </div>
        <Routes>
          <Route index element={<Dashboard brand={brand} onBrandChange={onBrandChange} />} />
          <Route path="studio" element={<Studio brand={brand} />} />
          <Route path="calendar" element={<CalendarPage brand={brand} />} />
          <Route path="platforms" element={<Platforms brand={brand} />} />
          <Route path="seo" element={<SeoPage brand={brand} />} />
          <Route path="analytics" element={<Analytics brand={brand} />} />
          <Route path="billing" element={<Billing />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
