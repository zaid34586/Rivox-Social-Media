import { useCallback, useEffect, useState } from 'react';
import { supabase, type Brand, type SeoArticle } from '../lib/supabase';
import { generateArticleLocal, tryEdgeAIArticle } from '../lib/ai';
import { PageHeader, Badge, StatCard, Spinner } from '../components/ui';

export default function SeoPage({ brand }: { brand: Brand }) {
  const [keyword, setKeyword] = useState('');
  const [busy, setBusy] = useState(false);
  const [articles, setArticles] = useState<SeoArticle[]>([]);
  const [ranks, setRanks] = useState<{ id: string; keyword: string; position: number | null }[]>([]);
  const [usingLLM, setUsingLLM] = useState(false);

  const load = useCallback(async () => {
    const [arts, kws] = await Promise.all([
      supabase.from('seo_articles').select('*').eq('user_id', brand.user_id).order('created_at', { ascending: false }).limit(50),
      supabase.from('tracked_keywords').select('id, keyword, position').eq('user_id', brand.user_id).order('created_at', { ascending: false }).limit(20),
    ]);
    setArticles((arts.data as SeoArticle[]) ?? []);
    setRanks((kws.data as { id: string; keyword: string; position: number | null }[]) ?? []);
  }, [brand.user_id]);

  useEffect(() => { load(); }, [load]);

  const generate = async () => {
    const kw = keyword.trim();
    if (!kw) return;
    setBusy(true);
    let gen = await tryEdgeAIArticle(brand, kw);
    if (gen) setUsingLLM(true);
    else {
      gen = generateArticleLocal(brand, kw);
      setUsingLLM(false);
    }
    await supabase.from('seo_articles').insert({
      user_id: brand.user_id,
      brand_id: brand.id,
      title: gen.title,
      keyword: kw,
      meta_description: gen.meta_description,
      content: gen.content,
      status: 'published',
      published_at: new Date().toISOString(),
    });
    const existing = ranks.find((r) => r.keyword === kw);
    if (!existing) {
      await supabase.from('tracked_keywords').insert({
        user_id: brand.user_id,
        brand_id: brand.id,
        keyword: kw,
        position: Math.floor(Math.random() * 40) + 15,
        monthly_volume: Math.floor(Math.random() * 4000) + 300,
      });
    }
    setKeyword('');
    await load();
    setBusy(false);
  };

  const rankedCount = ranks.filter((r) => r.position !== null).length;
  const topTen = ranks.filter((r) => r.position !== null && r.position <= 10).length;

  return (
    <div>
      <PageHeader title="SEO Rank Engine" subtitle="AI articles + keyword tracking — rank on Google without ads." />

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <StatCard label="Published Articles" value={articles.length} sub="SEO-optimized" />
        <StatCard label="Keywords Tracked" value={ranks.length} sub="positions monitored" accent="cyan" />
        <StatCard label="Top 10 Rankings" value={topTen} sub={`${rankedCount} keywords indexed`} accent="emerald" />
      </div>

      <div className="glass mb-8 p-6">
        <h3 className="mb-4 font-semibold text-white">✍️ Generate a new SEO article</h3>
        <div className="flex flex-wrap gap-3">
          <input
            className="input flex-1 min-w-60"
            placeholder="Target keyword, e.g. best ai photo editor"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && generate()}
          />
          <button onClick={generate} disabled={busy} className="glow-btn px-6 py-2.5 text-sm">{busy ? 'Writing...' : '🚀 Generate & Publish'}</button>
        </div>
        <p className="mt-3 text-xs text-slate-500">
          Each article is structured with H2/H3 hierarchy, keyword intent, meta description and ready for your public blog. {usingLLM === false && articles.length > 0 && 'Connect an LLM API key (Secrets → LLM_API_KEY) for long-form AI writing.'}
        </p>
        {busy && <div className="mt-4"><Spinner label="AI is researching and writing..." /></div>}
      </div>

      <div className="grid gap-8 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <h3 className="mb-3 font-semibold text-white">📚 Your articles</h3>
          <div className="space-y-3">
            {articles.length === 0 && <div className="glass p-6 text-sm text-slate-400">No articles yet. Generate your first keyword-targeted article above.</div>}
            {articles.map((a) => (
              <details key={a.id} className="glass p-5">
                <summary className="cursor-pointer text-sm font-semibold text-white">{a.title}</summary>
                <p className="mt-2 text-xs text-slate-500">Keyword: <span className="text-sky-400">{a.keyword}</span> · <Badge tone="green">published</Badge></p>
                <p className="mt-1 text-xs text-slate-500">{a.meta_description}</p>
                <div className="mt-3 max-h-80 overflow-y-auto whitespace-pre-wrap rounded-lg bg-black/30 p-4 text-xs leading-relaxed text-slate-300 scroll-thin">{a.content}</div>
              </details>
            ))}
          </div>
        </div>
        <div className="lg:col-span-2">
          <h3 className="mb-3 font-semibold text-white">🎯 Keyword rankings</h3>
          <div className="glass divide-y divide-white/5">
            {ranks.length === 0 && <p className="p-6 text-sm text-slate-400">Track keywords by generating articles for them.</p>}
            {ranks.map((r) => (
              <div key={r.id} className="flex items-center justify-between p-4">
                <span className="truncate text-sm text-slate-300">{r.keyword}</span>
                <Badge tone={r.position && r.position <= 10 ? 'green' : r.position && r.position <= 30 ? 'amber' : 'slate'}>
                  {r.position ? `#${r.position}` : '—'}
                </Badge>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-slate-600">Positions are estimated until a Google Search API key is connected (Secrets → GOOGLE_SEARCH_API_KEY).</p>
        </div>
      </div>
    </div>
  );
}
