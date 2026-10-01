import { auth, type Brand } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';

const FEATURES = [
  { icon: '✨', title: 'AI Content Engine', desc: 'Platform-perfect posts for Instagram, X & LinkedIn — hooks, captions, hashtags, all in your brand voice.' },
  { icon: '🗓️', title: 'Auto-Schedule & Publish', desc: 'AI picks the best times and publishes automatically. Full auto-pilot or approve-first — your call.' },
  { icon: '📈', title: 'SEO Rank Engine', desc: 'AI-generated, SEO-optimized articles with schema, meta tags and keyword tracking. Rank on Google without ads.' },
  { icon: '💰', title: 'Sales Attribution', desc: 'UTM tracking + unified analytics show exactly which post brought which sale.' },
  { icon: '🧠', title: 'Brand Voice AI', desc: 'The AI learns your product, audience and tone once — then writes like you forever.' },
  { icon: '🤖', title: 'Auto-Pilot Mode', desc: 'Research → create → schedule → publish → SEO — the whole growth loop runs itself.' },
];

const PLANS = [
  { name: 'Free', price: '$0', features: ['10 AI posts / month', '1 platform', 'Basic SEO'], cta: 'Start Free' },
  { name: 'Pro', price: '$29', features: ['Unlimited AI posts', 'All 3 platforms', 'SEO blog + rank tracking', 'Full analytics'], cta: 'Go Pro', hot: true },
  { name: 'Business', price: '$99', features: ['Everything in Pro', 'Full auto-pilot agent', 'Competitor analysis', 'Priority AI'], cta: 'Scale Up' },
];

export default function Landing({ user, brand }: { user: User | null; brand: Brand | null; onBrandLoaded: (id: string) => void }) {
  const navigate = useNavigate();
  const start = () => {
    if (!user) return auth.openSignInModal();
    navigate(brand ? '/app' : '/onboarding');
  };

  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-lg">🚀</div>
          <span className="text-lg font-bold text-white">PromoteAI</span>
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <button onClick={() => navigate(brand ? '/app' : '/onboarding')} className="glow-btn px-5 py-2.5 text-sm">Open Dashboard →</button>
          ) : (
            <button onClick={start} className="glow-btn px-5 py-2.5 text-sm">Sign in / Sign up</button>
          )}
        </div>
      </nav>

      {/* Hero */}
      <header className="mx-auto max-w-6xl px-6 pt-16 pb-20 text-center">
        <div className="glass mx-auto mb-6 inline-flex items-center gap-2 px-4 py-1.5 text-xs text-violet-300">
          <span className="h-2 w-2 animate-pulse rounded-full bg-violet-400" /> AI Growth Engine · Content + SEO + Sales
        </div>
        <h1 className="mx-auto max-w-4xl text-4xl font-extrabold leading-tight text-white md:text-6xl">
          Your product. <span className="grad-text">Promoted by AI.</span>
          <br />
          Sales on autopilot.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-400">
          PromoteAI writes, schedules and publishes your social content across Instagram, X and LinkedIn — and runs a full SEO engine that ranks you on Google. No ads. No agency. Just organic growth that converts.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <button onClick={start} className="glow-btn px-8 py-3.5 text-base">Get Started Free →</button>
          <a href="#features" className="ghost-btn px-8 py-3.5 text-base">See Features</a>
        </div>
        <div className="mt-12 flex items-center justify-center gap-8 text-sm text-slate-500">
          <span>📸 Instagram</span><span>𝕏 X (Twitter)</span><span>💼 LinkedIn</span><span>🔍 Google SEO</span>
        </div>
      </header>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-6 pb-20">
        <h2 className="mb-10 text-center text-3xl font-bold text-white">Everything you need to <span className="grad-text">grow organically</span></h2>
        <div className="grid gap-5 md:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="glass p-6 transition hover:border-violet-500/40">
              <div className="mb-4 text-3xl">{f.icon}</div>
              <h3 className="mb-2 font-semibold text-white">{f.title}</h3>
              <p className="text-sm leading-relaxed text-slate-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <h2 className="mb-10 text-center text-3xl font-bold text-white">Simple <span className="grad-text">pricing</span></h2>
        <div className="grid gap-5 md:grid-cols-3">
          {PLANS.map((p) => (
            <div key={p.name} className={`glass p-7 ${p.hot ? 'border-violet-500/50 ring-1 ring-violet-500/30' : ''}`}>
              {p.hot && <p className="mb-2 text-xs font-bold uppercase tracking-wider text-violet-400">Most Popular</p>}
              <h3 className="text-xl font-bold text-white">{p.name}</h3>
              <p className="mt-2 text-4xl font-extrabold text-white">{p.price}<span className="text-base font-normal text-slate-500">/mo</span></p>
              <ul className="mt-5 space-y-2.5 text-sm text-slate-400">
                {p.features.map((f) => <li key={f} className="flex items-center gap-2"><span className="text-emerald-400">✓</span> {f}</li>)}
              </ul>
              <button onClick={start} className={`${p.hot ? 'glow-btn' : 'ghost-btn'} mt-6 w-full py-3`}>{p.cta}</button>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-white/10 py-8 text-center text-sm text-slate-600">
        © {new Date().getFullYear()} PromoteAI — AI-powered organic growth. Built with Verdent.
      </footer>
    </div>
  );
}
