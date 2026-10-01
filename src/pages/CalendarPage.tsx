import { useCallback, useEffect, useState } from 'react';
import { supabase, PLATFORM_META, type Brand, type Post, type Platform } from '../lib/supabase';
import { processDuePosts } from '../lib/engine';
import { PageHeader, Badge } from '../components/ui';

export default function CalendarPage({ brand }: { brand: Brand }) {
  const [posts, setPosts] = useState<Post[]>([]);

  const load = useCallback(async () => {
    await processDuePosts(brand.user_id);
    const { data } = await supabase
      .from('posts')
      .select('*')
      .eq('user_id', brand.user_id)
      .in('status', ['scheduled', 'published'])
      .order('scheduled_at', { ascending: false })
      .limit(100);
    setPosts((data as Post[]) ?? []);
  }, [brand.user_id]);

  useEffect(() => {
    load();
    const t = setInterval(load, 60_000);
    return () => clearInterval(t);
  }, [load]);

  const cancel = async (p: Post) => {
    await supabase.from('posts').update({ status: 'draft', scheduled_at: null }).eq('id', p.id);
    load();
  };

  const upcoming = posts.filter((p) => p.status === 'scheduled').sort((a, b) => (a.scheduled_at! > b.scheduled_at! ? 1 : -1));
  const past = posts.filter((p) => p.status === 'published');

  return (
    <div>
      <PageHeader title="Content Calendar" subtitle="Scheduled posts publish automatically at their time." />
      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <h3 className="mb-3 font-semibold text-white">⏳ Upcoming ({upcoming.length})</h3>
          <div className="space-y-3">
            {upcoming.length === 0 && <div className="glass p-6 text-sm text-slate-400">Nothing scheduled. Generate posts in AI Studio and schedule them.</div>}
            {upcoming.map((p) => (
              <div key={p.id} className="glass border-amber-500/20 p-4">
                <div className="mb-1 flex items-center gap-2">
                  <Badge tone="violet">{PLATFORM_META[p.platform].label}</Badge>
                  <Badge tone="amber">⏰ {new Date(p.scheduled_at!).toLocaleString()}</Badge>
                  <button onClick={() => cancel(p)} className="ml-auto text-xs text-slate-500 hover:text-red-400">Cancel</button>
                </div>
                <p className="text-sm text-slate-300">{p.content.split('\n')[0]}</p>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h3 className="mb-3 font-semibold text-white">✅ Published ({past.length})</h3>
          <div className="scroll-thin max-h-[70vh] space-y-3 overflow-y-auto pr-1">
            {past.length === 0 && <div className="glass p-6 text-sm text-slate-400">No published posts yet.</div>}
            {past.map((p) => (
              <div key={p.id} className="glass border-emerald-500/20 p-4">
                <div className="mb-1 flex items-center gap-2">
                  <Badge tone="violet">{PLATFORM_META[p.platform].label}</Badge>
                  <Badge tone="green">{new Date(p.published_at ?? p.created_at).toLocaleString()}</Badge>
                  <span className="ml-auto text-xs text-emerald-400">💰 {p.metrics.sales} sales</span>
                </div>
                <p className="text-sm text-slate-300">{p.content.split('\n')[0]}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
