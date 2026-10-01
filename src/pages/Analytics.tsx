import { useEffect, useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { supabase, PLATFORMS, PLATFORM_META, type Brand, type Post } from '../lib/supabase';
import { PageHeader, StatCard } from '../components/ui';

const COLORS = ['#ec4899', '#94a3b8', '#0ea5e9'];

export default function Analytics({ brand }: { brand: Brand }) {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    supabase
      .from('posts')
      .select('*')
      .eq('user_id', brand.user_id)
      .eq('status', 'published')
      .order('published_at', { ascending: true })
      .limit(200)
      .then(({ data }) => setPosts((data as Post[]) ?? []));
  }, [brand.user_id]);

  const { totals, byPlatform, timeline, topPosts } = useMemo(() => {
    const totals = posts.reduce(
      (a, p) => ({ likes: a.likes + p.metrics.likes, comments: a.comments + p.metrics.comments, shares: a.shares + p.metrics.shares, clicks: a.clicks + p.metrics.clicks, sales: a.sales + p.metrics.sales }),
      { likes: 0, comments: 0, shares: 0, clicks: 0, sales: 0 }
    );
    const byPlatform = PLATFORMS.map((pl) => {
      const pp = posts.filter((p) => p.platform === pl);
      return {
        name: PLATFORM_META[pl].label,
        engagement: pp.reduce((a, p) => a + p.metrics.likes + p.metrics.comments + p.metrics.shares, 0),
        clicks: pp.reduce((a, p) => a + p.metrics.clicks, 0),
        sales: pp.reduce((a, p) => a + p.metrics.sales, 0),
        fill: COLORS[PLATFORMS.indexOf(pl)],
      };
    });
    const byDay = new Map<string, { date: string; sales: number; clicks: number }>();
    posts.forEach((p) => {
      const d = (p.published_at ?? p.created_at).slice(0, 10);
      const cur = byDay.get(d) ?? { date: d, sales: 0, clicks: 0 };
      cur.sales += p.metrics.sales;
      cur.clicks += p.metrics.clicks;
      byDay.set(d, cur);
    });
    const timeline = [...byDay.values()].sort((a, b) => a.date.localeCompare(b.date));
    const topPosts = [...posts].sort((a, b) => b.metrics.sales - a.metrics.sales).slice(0, 5);
    return { totals, byPlatform, timeline, topPosts };
  }, [posts]);

  const engagementRate = totals.likes + totals.clicks > 0 ? ((totals.likes + totals.comments + totals.shares) / Math.max(1, posts.length * 500) * 100).toFixed(1) : '0';

  return (
    <div>
      <PageHeader title="Analytics & Sales" subtitle="Unified performance across platforms with sales attribution." />
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Impressions" value={(posts.length * 500 + totals.likes * 3).toLocaleString()} sub="estimated reach" />
        <StatCard label="Engagement" value={(totals.likes + totals.comments + totals.shares).toLocaleString()} sub={`${engagementRate}% rate`} accent="fuchsia" />
        <StatCard label="Link Clicks" value={totals.clicks.toLocaleString()} sub="to your product" accent="cyan" />
        <StatCard label="Sales" value={totals.sales} sub="attributed organically" accent="emerald" />
        <StatCard label="Published" value={posts.length} sub="total posts" accent="amber" />
      </div>

      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        <div className="glass p-6">
          <h3 className="mb-4 font-semibold text-white">Platform performance</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={byPlatform}>
              <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip contentStyle={{ background: '#12121e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }} />
              <Bar dataKey="engagement" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
              <Bar dataKey="clicks" fill="#22d3ee" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="glass p-6">
          <h3 className="mb-4 font-semibold text-white">Sales by platform</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={byPlatform} dataKey="sales" nameKey="name" innerRadius={60} outerRadius={95} paddingAngle={4}>
                {byPlatform.map((e, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#12121e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass mb-8 p-6">
        <h3 className="mb-4 font-semibold text-white">Growth over time</h3>
        {timeline.length === 0 ? (
          <p className="py-10 text-center text-sm text-slate-400">Publish posts to see your growth curve.</p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={timeline}>
              <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip contentStyle={{ background: '#12121e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }} />
              <Line type="monotone" dataKey="clicks" stroke="#22d3ee" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="sales" stroke="#34d399" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <h3 className="mb-3 font-semibold text-white">🏆 Top converting posts</h3>
      <div className="glass divide-y divide-white/5">
        {topPosts.length === 0 && <p className="p-6 text-sm text-slate-400">No published posts yet.</p>}
        {topPosts.map((p) => (
          <div key={p.id} className="flex items-center justify-between gap-4 p-4">
            <div className="min-w-0">
              <p className="truncate text-sm text-slate-300">{p.content.split('\n')[0]}</p>
              <p className="text-xs text-slate-500">{PLATFORM_META[p.platform].label}</p>
            </div>
            <div className="shrink-0 text-right text-xs">
              <p className="text-slate-400">❤️ {p.metrics.likes} · 🖱️ {p.metrics.clicks}</p>
              <p className="font-semibold text-emerald-400">💰 {p.metrics.sales} sales</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
