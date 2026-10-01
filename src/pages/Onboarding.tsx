import { useState } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { Field, PageHeader, Spinner } from '../components/ui';

export default function Onboarding({ user, onDone }: { user: User; onDone: (userId: string) => void }) {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    website_url: '',
    product_desc: '',
    audience: '',
    niche: '',
    tone: 'professional',
    goals: 'sales',
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm({ ...form, [k]: e.target.value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return setError('Brand name is required.');
    setSaving(true);
    setError('');
    const { error: err } = await supabase.from('brands').insert({ ...form, user_id: user.id });
    setSaving(false);
    if (err) return setError(err.message);
    onDone(user.id);
    navigate('/app');
  };

  return (
    <div className="mx-auto max-w-2xl p-6 md:p-10">
      <PageHeader
        title="Set up your brand 🚀"
        subtitle="Tell the AI about your product — it will learn your voice and start promoting automatically."
      />
      <form onSubmit={submit} className="glass space-y-5 p-6 md:p-8">
        <Field label="Brand / Product name *">
          <input className="input" placeholder="e.g. PhotoGenius" value={form.name} onChange={set('name')} />
        </Field>
        <Field label="Website URL" hint="Used for links in posts and SEO setup">
          <input className="input" placeholder="https://yourproduct.com" value={form.website_url} onChange={set('website_url')} />
        </Field>
        <Field label="What does your product do? *" hint="One or two sentences — the AI uses this for every post">
          <textarea className="input min-h-20" placeholder="e.g. AI photo editor that turns phone shots into studio-quality images in seconds" value={form.product_desc} onChange={set('product_desc')} />
        </Field>
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Target audience">
            <input className="input" placeholder="e.g. freelance photographers, e-commerce sellers" value={form.audience} onChange={set('audience')} />
          </Field>
          <Field label="Niche / industry">
            <input className="input" placeholder="e.g. AI photo editing, e-commerce" value={form.niche} onChange={set('niche')} />
          </Field>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Brand tone">
            <select className="input" value={form.tone} onChange={set('tone')}>
              <option value="professional">Professional</option>
              <option value="friendly">Friendly & casual</option>
              <option value="bold">Bold & punchy</option>
              <option value="expert">Expert / authoritative</option>
            </select>
          </Field>
          <Field label="Main goal">
            <select className="input" value={form.goals} onChange={set('goals')}>
              <option value="sales">Drive sales</option>
              <option value="leads">Generate leads</option>
              <option value="traffic">Grow traffic</option>
              <option value="awareness">Brand awareness</option>
            </select>
          </Field>
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button type="submit" disabled={saving} className="glow-btn w-full py-3 text-base">
          {saving ? 'Creating workspace...' : 'Launch my growth engine 🚀'}
        </button>
        {saving && <Spinner />}
      </form>
    </div>
  );
}
