import { supabase, EDGE_FUNCTIONS_URL, type Brand, type Platform } from './supabase';

// ---------- Hook / template libraries ----------
const HOOKS: Record<Platform, string[]> = {
  instagram: [
    'Stop scrolling — this changes everything for {audience}.',
    'The secret {niche} brands don\'t want you to know.',
    '3 reasons {brand} is becoming the go-to for {audience} 👇',
    'POV: You finally found the {niche} solution you always wanted.',
    'Your {audience} journey deserves better. Here\'s why 👇',
  ],
  x: [
    'Hot take: most {niche} products solve the wrong problem.',
    'I tested every {niche} tool on the market. Here\'s what actually works:',
    '{brand} just changed the game for {audience}. Thread:',
    'Unpopular opinion: {audience} don\'t need more tools. They need {brand}.',
    'The {niche} industry has a dirty little secret 🧵',
  ],
  linkedin: [
    'After working with dozens of {audience}, we found one pattern that separates winners from everyone else.',
    'The {niche} landscape is shifting. Here\'s what smart {audience} are doing about it:',
    'We built {brand} with one belief: {audience} deserve better results, faster.',
    'Most {niche} strategies fail for the same reason. A short breakdown:',
    'Growth isn\'t about doing more. It\'s about doing what compounds. Here\'s our approach:',
  ],
};

const BODIES: Record<Platform, ((b: Brand, topic: string) => string)[]> = {
  instagram: [
    (b, t) => `${t}\n\n${b.product_desc ?? b.name} was built to solve exactly this — no fluff, just results for ${b.audience ?? 'you'}.\n\n✅ Save this post for later\n✅ Share with someone who needs it\n✅ Follow ${b.name} for more ${b.niche ?? 'growth'} tips`,
    (b, t) => `Here's the breakdown:\n\n1️⃣ The problem: ${b.audience ?? 'Most people'} waste hours on ${b.niche ?? 'manual work'} every week\n2️⃣ The fix: ${t}\n3️⃣ The result: more growth, less busywork\n\n${b.name} makes step 2 automatic. Link in bio 🚀`,
  ],
  x: [
    (b, t) => `${t}\n\n1. The old way: manual, slow, expensive\n2. The new way: ${b.name}\n3. The result: ${b.audience ?? 'teams'} ship 10x faster\n\nTry it → ${b.website_url ?? ''}`,
    (b, t) => `${t}\n\nWe noticed ${b.audience ?? 'people'} were stuck doing ${b.niche ?? 'repetitive work'} by hand.\n\nSo we built ${b.name} to do it automatically.\n\nLess time grinding. More time growing.\n\n${b.website_url ?? ''}`,
  ],
  linkedin: [
    (b, t) => `${t}\n\nHere's what we learned building ${b.name}:\n\n1. ${b.audience ?? 'Teams'} don't lack effort — they lack leverage.\n2. The right ${b.niche ?? 'automation'} compounds every single week.\n3. Systems beat willpower, every time.\n\n${b.product_desc ?? ''}\n\nWhat's your biggest ${b.niche ?? 'growth'} bottleneck right now? 👇\n\n${b.website_url ?? ''}`,
    (b, t) => `${t}\n\nThe data is clear:\n\n→ Companies using ${b.niche ?? 'automation'} grow 3x faster\n→ Manual processes are the #1 hidden cost\n→ The best teams automate early\n\nThat's why we built ${b.name}: ${b.product_desc ?? 'to give teams their time back'}.\n\nLearn more: ${b.website_url ?? ''}`,
  ],
};

const CTAS: Record<Platform, string[]> = {
  instagram: ['Link in bio to start free 🚀', 'Tap the link in bio — your future self will thank you.', 'DM us "START" and we\'ll get you set up.'],
  x: ['Start free today 👇', 'Try it free — link below.', 'Check it out →'],
  linkedin: ['Request a demo in the comments.', 'Start your free trial at the link below.', 'Happy to share how it works — reach out anytime.'],
};

function pick<T>(arr: T[], seed: number): T {
  return arr[Math.abs(seed) % arr.length];
}

function fill(tpl: string, brand: Brand, topic: string): string {
  const map: Record<string, string> = {
    '{brand}': brand.name,
    '{audience}': brand.audience ?? 'growth-minded teams',
    '{niche}': brand.niche ?? 'marketing',
    '{topic}': topic,
  };
  let out = tpl;
  for (const [k, v] of Object.entries(map)) out = out.split(k).join(v);
  return out;
}

function hashtagsFor(brand: Brand, platform: Platform, topic: string): string[] {
  const base = [brand.name.replace(/[^a-zA-Z0-9]/g, ''), (brand.niche ?? 'growth').replace(/[^a-zA-Z0-9]/g, '')];
  const topicTags = topic.toLowerCase().split(/[^a-zA-Z0-9]+/).filter((w) => w.length > 3).slice(0, 3);
  const platformTags: Record<Platform, string[]> = {
    instagram: ['marketing', 'businesstips', 'growth', 'entrepreneur', 'smallbusiness'],
    x: ['buildinpublic', 'startup', 'marketing', 'saas'],
    linkedin: ['B2BMarketing', 'GrowthStrategy', 'Innovation', 'BusinessGrowth'],
  };
  const tags = [...new Set([...base, ...topicTags, ...platformTags[platform]])]
    .map((t) => `#${t}`)
    .slice(0, platform === 'instagram' ? 8 : 4);
  return tags;
}

export function imagePromptFor(brand: Brand, topic: string): string {
  return `Modern, minimal social media visual for ${brand.name} (${brand.niche ?? 'tech brand'}) about "${topic}". Bold gradient background (violet to cyan), clean geometric shapes, no text, premium SaaS aesthetic, high contrast, square composition.`;
}

// ---------- Local generation engine ----------
export function generatePostLocal(brand: Brand, platform: Platform, topic: string): { content: string; hashtags: string[]; image_prompt: string } {
  const seed = Date.now() + topic.length + platform.length;
  const hook = pick(HOOKS[platform], seed);
  const body = pick(BODIES[platform], seed >> 2)(brand, topic);
  const cta = pick(CTAS[platform], seed >> 3);
  return {
    content: `${fill(hook, brand, topic)}\n\n${fill(body, brand, topic)}\n\n${cta}`,
    hashtags: hashtagsFor(brand, platform, topic),
    image_prompt: imagePromptFor(brand, topic),
  };
}

export function generateArticleLocal(brand: Brand, keyword: string): { title: string; meta_description: string; content: string } {
  const niche = brand.niche ?? 'marketing';
  const aud = brand.audience ?? 'growing businesses';
  const title = `${keyword}: The Complete ${new Date().getFullYear()} Guide for ${aud}`;
  const meta = `Learn how ${keyword} can transform your ${niche} results. Practical strategies, common mistakes, and how ${brand.name} makes it automatic.`;
  const content = `# ${title}\n\n## Why ${keyword} matters in ${new Date().getFullYear()}\n\n${aud} everywhere are discovering that ${keyword} is one of the highest-leverage moves in ${niche}. Done right, it compounds: every week you get more visible, more trusted, and more profitable — without spending more on ads.\n\n## The 3 pillars of ${keyword}\n\n1. **Consistency beats intensity.** A steady cadence of quality content outperforms sporadic pushes.\n2. **Meet your audience where they are.** Distribute across the channels ${aud} already use daily.\n3. **Measure what matters.** Track clicks, conversions, and sales — not vanity metrics.\n\n## Common mistakes to avoid\n\n- Posting random content with no strategy\n- Ignoring SEO fundamentals like keyword intent and internal links\n- Failing to connect content to real revenue\n\n## How ${brand.name} automates ${keyword}\n\n${brand.product_desc ?? `${brand.name} uses AI to research, create, schedule, and publish content for you`} — so you get the compounding benefits of ${keyword} without the manual grind.\n\n## Getting started\n\n1. Define your niche and audience.\n2. Pick your core channels.\n3. Let AI handle ideation, creation, and scheduling.\n4. Review analytics weekly and double down on winners.\n\nStart today — the sooner you begin, the sooner ${keyword} starts compounding for ${brand.name}. ${brand.website_url ? `Learn more at ${brand.website_url}.` : ''}`;
  return { title, meta_description: meta, content };
}

// ---------- Edge Function AI (real LLM when key configured) ----------
export async function tryEdgeAI(brand: Brand, platform: Platform, topic: string): Promise<{ content: string; hashtags: string[]; image_prompt: string } | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;
    const res = await fetch(`${EDGE_FUNCTIONS_URL}/ai-generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify({
        kind: 'post',
        brand: { name: brand.name, niche: brand.niche, audience: brand.audience, product: brand.product_desc, website: brand.website_url },
        platform,
        topic,
      }),
    });
    if (!res.ok) return null;
    const json = await res.json();
    if (!json?.ok || !json.content) return null;
    return { content: json.content, hashtags: json.hashtags ?? [], image_prompt: json.image_prompt ?? imagePromptFor(brand, topic) };
  } catch {
    return null;
  }
}

export async function tryEdgeAIArticle(brand: Brand, keyword: string): Promise<{ title: string; meta_description: string; content: string } | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;
    const res = await fetch(`${EDGE_FUNCTIONS_URL}/ai-generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify({
        kind: 'article',
        brand: { name: brand.name, niche: brand.niche, audience: brand.audience, product: brand.product_desc, website: brand.website_url },
        keyword,
      }),
    });
    if (!res.ok) return null;
    const json = await res.json();
    if (!json?.ok || !json.content) return null;
    return { title: json.title ?? keyword, meta_description: json.meta_description ?? '', content: json.content };
  } catch {
    return null;
  }
}
