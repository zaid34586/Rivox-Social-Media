import { useState } from 'react';
import { supabase, PLATFORMS, PLATFORM_META, type Brand, type Platform, type Post } from '../lib/supabase';
import { generatePostLocal, tryEdgeAI } from '../lib/ai';
import { Field, PageHeader, Badge, Spinner } from '../components/ui';

const TOPIC_IDEAS = ['Product launch', 'Customer success story', 'Behind the scenes', 'Tip of the week', 'Feature highlight', 'Industry trend', 'Comparison vs alternatives', 'Limited-time offer'];

export default function Studio({ brand }: { brand: Brand }) {
  const [platform, setPlatform] = useState<Platform>('instagram');
  const [topic, setTopic] = useState('');
  const [count, setCount] = useState(3);
  const [busy, setBusy] = useState(false);
  const [usingLLM, setUsingLLM] = useState<boolean | null>(null);
  const [drafts, setDrafts] = useState<Post[]>([]);

  const generate = async () => {
    setBusy(true);
    const t = topic.trim() || TOPIC_IDEAS[Math.floor(Math.random() * TOPIC_IDEAS.length)];
    const rows: Partial<Post>[] = [];
    let llmUsed = false;
    for (let i = 0; i < count; i++) {
      let gen = await tryEdgeAI(brand, platform, t);
      if (gen) llmUsed = true;
      else gen = generatePostLocal(brand, platform, t);
      rows.push({
        user_id: brand.user_id,
        brand_id: brand.id,
        platform,
        format: 'post',
        content: gen.content,
        hashtags: gen.hashtags,
        image_prompt: gen.image_prompt,
        status: 'draft',
        metrics: { likes: 0, comments: 0, shares: 0, clicks: 0, sales: 0 },
      });
    }
    setUsingLLM(llmUsed);
    const { data, error } = await supabase.from('posts').insert(rows).select();
    setBusy(false);
    if (!error && data) setDrafts(data as Post[]);
  };

  const schedule = async (post: Post, when: string) => {
    await supabase.from('posts').update({ status: 'scheduled', scheduled_at: new Date(when).toISOString() }).eq('id', post.id);
    setDrafts(drafts.filter((d) => d.id !== post.id));
  };

  const publishNow = async (post: Post) => {
    await supabase.from('posts').update({ status: 'published', published_at: new Date().toISOString() }).eq('id', post.id);
    setDrafts(drafts.filter((d) => d.id !== post.id));
  };

  const remove = async (post: Post) => {
    await supabase.from('posts').delete().eq('id', post.id);
    setDrafts(drafts.filter((d) => d.id !== post.id));
  };

  return (
    <div>
      <PageHeader title="AI Content Studio" subtitle="Generate platform-optimized posts in your brand voice." />

      <div className="glass mb-8 p-6">
        <div className="mb-5 flex flex-wrap gap-3">
          {PLATFORMS.map((p) => (
            <button
              key={p}
              onClick={() => setPlatform(p)}
              className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition ${
                platform === p ? `bg-gradient-to-r ${PLATFORM_META[p].color} text-white` : 'ghost-btn'
              }`}
            >
              {PLATFORM_META[p].label}
            </button>
          ))}
        </div>
        <Field label="Topic (optional — leave empty for AI ideas)">
          <input className="input" placeholder="e.g. Why our AI editor saves 5 hours a week" value={topic} onChange={(e) => setTopic(e.target.value)} />
        </Field>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <span className="text-xs uppercase tracking-wider text-slate-500">Variations</span>
          {[1, 2, 3, 5].map((n) => (
            <button key={n} onClick={() => setCount(n)} className={`h-9 w-9 rounded-lg text-sm font-semibold ${count === n ? 'bg-violet-500/30 text-white' : 'ghost-btn'}`}>{n}</button>
          ))}
          <button onClick={generate} disabled={busy} className="glow-btn ml-auto px-6 py-2.5 text-sm">
            {busy ? 'Generating...' : `✨ Generate ${count} post${count > 1 ? 's' : ''}`}
          </button>
        </div>
        {usingLLM === false && drafts.length > 0 && (
          <p className="mt-3 text-xs text-amber-400/80">⚡ Built-in engine used. Connect an LLM API key (Secrets → LLM_API_KEY) for even smarter content.</p>
        )}
      </div>

      {busy && <Spinner label="AI is writing your posts..." />}

      <div className="space-y-4">
        {drafts.map((d) => (
          <div key={d.id} className="glass p-5">
            <div className="mb-2 flex items-center justify-between">
              <Badge tone="violet">{PLATFORM_META[d.platform].label} · draft</Badge>
              <button onClick={() => remove(d)} className="text-xs text-slate-500 hover:text-red-400">Delete</button>
            </div>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-200">{d.content}</p>
            <p className="mt-2 text-sm text-sky-400">{d.hashtags.join(' ')}</p>
            <details className="mt-3 text-xs text-slate-500">
              <summary className="cursor-pointer hover:text-slate-300">🎨 Image prompt for this post</summary>
              <p className="mt-2 rounded-lg bg-black/30 p-3">{d.image_prompt}</p>
            </details>
            <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-white/10 pt-4">
              <input type="datetime-local" className="input w-auto text-xs" onChange={(e) => schedule(d, e.target.value)} />
              <button onClick={() => schedule(d, new Date(Date.now() + 864e5).toISOString().slice(0, 16))} className="ghost-btn px-4 py-2 text-xs">Schedule +24h</button>
              <button onClick={() => publishNow(d)} className="glow-btn px-4 py-2 text-xs">Publish now</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
