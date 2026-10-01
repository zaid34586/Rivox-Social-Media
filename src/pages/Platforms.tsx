import { useCallback, useEffect, useState } from 'react';
import { supabase, PLATFORMS, PLATFORM_META, type Brand, type ConnectedAccount, type Platform } from '../lib/supabase';
import { PageHeader, Badge, Field } from '../components/ui';

export default function Platforms({ brand }: { brand: Brand }) {
  const [accounts, setAccounts] = useState<ConnectedAccount[]>([]);
  const [editing, setEditing] = useState<Platform | null>(null);
  const [accountName, setAccountName] = useState('');

  const load = useCallback(async () => {
    const { data } = await supabase.from('connected_accounts').select('*').eq('user_id', brand.user_id);
    setAccounts((data as ConnectedAccount[]) ?? []);
  }, [brand.user_id]);

  useEffect(() => { load(); }, [load]);

  const connect = async (platform: Platform) => {
    const { data: existing } = await supabase.from('connected_accounts').select('*').eq('user_id', brand.user_id).eq('platform', platform).maybeSingle();
    if (existing) {
      setEditing(platform);
      setAccountName(existing.account_name ?? '');
    } else {
      setEditing(platform);
      setAccountName('');
    }
  };

  const save = async () => {
    if (!editing) return;
    const status = accountName.trim() ? 'needs_api_keys' : 'not_connected';
    const { data: existing } = await supabase.from('connected_accounts').select('id').eq('user_id', brand.user_id).eq('platform', editing).maybeSingle();
    if (existing) {
      await supabase.from('connected_accounts').update({ account_name: accountName, status }).eq('id', existing.id);
    } else {
      await supabase.from('connected_accounts').insert({ user_id: brand.user_id, platform: editing, account_name: accountName, status });
    }
    setEditing(null);
    load();
  };

  const statusLabel = (s: string) =>
    s === 'connected' ? <Badge tone="green">Connected</Badge>
    : s === 'needs_api_keys' ? <Badge tone="amber">API keys needed</Badge>
    : <Badge>Not connected</Badge>;

  return (
    <div>
      <PageHeader title="Platform Connections" subtitle="Connect Instagram, X and LinkedIn to auto-publish live." />
      <div className="mb-6 glass border-violet-500/30 p-5 text-sm leading-relaxed text-violet-200">
        <strong className="text-white">ℹ️ How live publishing works:</strong> Until platform developer API keys are connected, posts are published in <em>simulation mode</em> — content goes live in your workspace with full analytics so you can test the whole flow. To go live on real platforms, add your developer credentials:
        <ul className="mt-2 list-inside list-disc space-y-1 text-violet-300/80">
          <li><strong>Instagram:</strong> Meta Graph API (Business account required)</li>
          <li><strong>X:</strong> X API v2 (developer.x.com)</li>
          <li><strong>LinkedIn:</strong> LinkedIn Marketing API (developer.linkedin.com)</li>
        </ul>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {PLATFORMS.map((p) => {
          const acc = accounts.find((a) => a.platform === p);
          return (
            <div key={p} className="glass p-6">
              <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${PLATFORM_META[p].color} text-lg font-bold text-white`}>
                {PLATFORM_META[p].icon}
              </div>
              <h3 className="font-semibold text-white">{PLATFORM_META[p].label}</h3>
              <p className="mt-1 text-xs text-slate-400">{acc?.account_name ?? 'No account linked'}</p>
              <div className="mt-3">{statusLabel(acc?.status ?? 'not_connected')}</div>
              <button onClick={() => connect(p)} className={`${acc ? 'ghost-btn' : 'glow-btn'} mt-5 w-full py-2.5 text-sm`}>
                {acc ? 'Manage' : 'Connect'}
              </button>
            </div>
          );
        })}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setEditing(null)}>
          <div className="glass w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-4 text-lg font-bold text-white">Connect {PLATFORM_META[editing].label}</h3>
            <Field label="Account handle / name" hint="e.g. @yourbrand — API keys are added later via Secrets (never stored in code)">
              <input className="input" placeholder="@yourbrand" value={accountName} onChange={(e) => setAccountName(e.target.value)} />
            </Field>
            <div className="mt-5 flex gap-3">
              <button onClick={save} className="glow-btn flex-1 py-2.5 text-sm">Save</button>
              <button onClick={() => setEditing(null)} className="ghost-btn flex-1 py-2.5 text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
