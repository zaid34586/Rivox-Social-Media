import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase, PLATFORM_META, type Brand, type Post } from '../lib/supabase';
import { processDuePosts } from '../lib/engine';
import { PageHeader, StatCard, Badge, Spinner } from '../components/ui';

export default function Dashboard({ brand, onBrandChange }: { brand: Brand; onBrandChange: () => void }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState('');

  const load = useCallback(async () => {
    const published = await processDuePosts(brand.user_id);
    if (published > 0) setNote(`${published} scheduled post(s) went live automatically.`);
    const { data } = await supabase.from('posts').select('*').eq('user_id', brand.user_id).order('created_at', { ascending: false }).limit(50);
    setPosts((data as Post[]) ?? []);
    setLoading(false);
    if (published > 0) onBrandChange();
  }, [brand.user_id, onBrandChange]);

  useEffect(() => {
    load();
    const t = setInterval(load, 60_000);
    return () => clearInterval(t);
  }, [load]);

  const published = posts.filter((p) => p.status === 'published');
  const scheduled = posts.filter((p) => p.status === 'scheduled');
  const totals = published.reduce(
    (acc, p) => ({ likes: acc.likes + p.metrics.likes, clicks: acc.clicks + p.metrics.clicks, sales: acc.sales + p.metrics.sales }),
    { likes: 0, clicks: 0, sales: 0 }
  );

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${brand.name} 👋`}
        subtitle="Your AI growth engine overview."
        action={<Link to="/app/studio" className="glow-btn px-5 py-2.5 text-sm">✨ Generate Content</Link>}
      />
      {note && <div className="glass mb-6 border-emerald-500/30 p-4 text-sm text-emerald-300">🚀 {note}</div>}

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Published Posts" value={published.length} sub="all platforms" />
        <StatCard label="Scheduled" value={scheduled.length} sub="auto-publishing" accent="cyan" />
        <StatCard label="Total Engagement" value={totals.likes.toLocaleString()} sub="likes" accent="fuchsia" />
        <StatCard label="Attributed Sales" value={totals.sales} sub="from organic posts" accent="emerald" />
      </div>

      <div className="glass mb-8 p-5">
        <h3 className="mb-3 font-semibold text-white">Quick actions</h3>
        <div className="flex flex-wrap gap-3">
          <Link to="/app/studio" className="ghost-btn px-4 py-2 text-sm">✨ New AI post</Link>
          <Link to="/app/seo" className="ghost-btn px-4 py-2 text-sm">📈 Write SEO article</Link>
          <Link to="/app/platforms" className="ghost-btn px-4 py-2 text-sm">🔗 Connect platforms</Link>
          <Link to="/app/calendar" className="ghost-btn px-4 py-2 text-sm">🗓️ View calendar</Link>
        </div>
      </div>

      <h3 className="mb-3 font-semibold text-white">Recent posts</h3>
      {loading ? (
        <Spinner />
      ) : posts.length === 0 ? (
        <div className="glass p-10 text-center text-slate-400">
          No posts yet. Head to <Link to="/app/studio" className="text-violet-400 underline">AI Studio</Link> and generate your first one!
        </div>
      ) : (
        <div className="space-y-3">
          {posts.slice(0, 8).map((p) => (
            <div key={p.id} className="glass flex items-start justify-between gap-4 p-4">
              <div className="min-w-0">
                <div className="mb-1 flex items-center gap-2">
                  <Badge tone="violet">{PLATFORM_META[p.platform].label}</Badge>
                  <Badge tone={p.status === 'published' ? 'green' : p.status === 'scheduled' ? 'amber' : 'slate'}>{p.status}</Badge>
                  <span className="text-xs text-slate-500">{new Date(p.scheduled_at ?? p.created_at).toLocaleString()}</span>
                </div>
                <p className="truncate text-sm text-slate-300">{p.content.split('\n')[0]}</p>
              </div>
              {p.status === 'published' && (
                <div className="shrink-0 text-right text-xs text-slate-400">
                  <p>❤️ {p.metrics.likes} · 🖱️ {p.metrics.clicks}</p>
                  <p className="text-emerald-400">💰 {p.metrics.sales} sales</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
