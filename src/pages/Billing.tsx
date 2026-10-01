import { PageHeader, Badge } from '../components/ui';

const PLANS = [
  {
    name: 'Free', price: '$0', features: ['10 AI posts / month', '1 platform', 'Basic SEO articles', 'Simulated publishing'], current: true,
  },
  {
    name: 'Pro', price: '$29', features: ['Unlimited AI posts', 'All 3 platforms live', 'SEO blog + rank tracking', 'Full analytics & attribution', 'Auto-scheduler'], badge: 'Most Popular',
  },
  {
    name: 'Business', price: '$99', features: ['Everything in Pro', 'Full auto-pilot agent', 'Competitor analysis', 'Trend detection', 'Priority AI queue'],
  },
];

export default function Billing() {
  return (
    <div>
      <PageHeader title="Billing & Plans" subtitle="Upgrade for more AI power, platforms and automation." />
      <div className="glass mb-8 border-amber-500/30 p-5 text-sm text-amber-200">
        💳 <strong>Stripe setup pending:</strong> add your Stripe API keys (Secrets → STRIPE_SECRET_KEY) to enable real subscription checkout. Until then, all accounts run on the Free plan with full feature access in this preview.
      </div>
      <div className="grid gap-5 md:grid-cols-3">
        {PLANS.map((p) => (
          <div key={p.name} className={`glass p-7 ${p.badge ? 'border-violet-500/50 ring-1 ring-violet-500/30' : ''}`}>
            <div className="mb-1 flex items-center gap-2">
              <h3 className="text-xl font-bold text-white">{p.name}</h3>
              {p.current && <Badge tone="green">Current</Badge>}
              {p.badge && <Badge tone="violet">{p.badge}</Badge>}
            </div>
            <p className="mt-2 text-4xl font-extrabold text-white">{p.price}<span className="text-base font-normal text-slate-500">/mo</span></p>
            <ul className="mt-5 space-y-2.5 text-sm text-slate-400">
              {p.features.map((f) => <li key={f} className="flex items-center gap-2"><span className="text-emerald-400">✓</span> {f}</li>)}
            </ul>
            <button disabled={!p.badge} className={`${p.badge ? 'glow-btn' : 'ghost-btn'} mt-6 w-full py-3`}>
              {p.current ? 'Your plan' : p.badge ? 'Upgrade (needs Stripe keys)' : 'Choose plan'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
