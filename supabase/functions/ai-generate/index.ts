// Edge Function: ai-generate
// Generates social posts and SEO articles via an LLM when an API key is configured.
// Supported secret keys: LLM_API_KEY (OpenAI-compatible), GEMINI_API_KEY, OPENAI_API_KEY.
// Returns ok:false with reason "no_key" when none configured — the client falls back to its built-in engine.

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json({ ok: false, reason: 'method' }, 405);

  let body: any;
  try {
    body = await req.json();
  } catch {
    return json({ ok: false, reason: 'bad_json' }, 400);
  }

  const key = Deno.env.get('LLM_API_KEY') ?? Deno.env.get('OPENAI_API_KEY') ?? Deno.env.get('GEMINI_API_KEY');
  if (!key) return json({ ok: false, reason: 'no_key' }, 200);

  const brand = body?.brand ?? {};
  const brandLine = `Brand: ${brand.name ?? 'Unknown'}. Niche: ${brand.niche ?? 'general'}. Audience: ${brand.audience ?? 'general audience'}. Product: ${brand.product ?? ''}. Website: ${brand.website ?? ''}.`;

  let prompt: string;
  if (body.kind === 'article') {
    prompt = `You are an expert SEO content writer. ${brandLine}\nWrite a complete, publish-ready SEO article (600-900 words) targeting the keyword "${body.keyword}". Return JSON: {"title": string, "meta_description": string (max 155 chars), "content": markdown string with ## headings, lists and a conclusion.}`;
  } else {
    const platform = body.platform === 'x' ? 'X/Twitter (max 280 chars, punchy thread style)' : body.platform === 'linkedin' ? 'LinkedIn (professional, insight-driven)' : 'Instagram (casual, emoji-friendly, save-worthy)';
    prompt = `You are a world-class social media copywriter. ${brandLine}\nWrite ONE ${platform} post about "${body.topic}". Include a strong hook, value body, and call-to-action driving traffic to the website. Return JSON: {"content": string, "hashtags": string[] (3-8 relevant hashtags), "image_prompt": string (brief visual description for an image generator)}.`;
  }

  try {
    const isGemini = !!Deno.env.get('GEMINI_API_KEY') && !Deno.env.get('LLM_API_KEY') && !Deno.env.get('OPENAI_API_KEY');
    let text: string;
    if (isGemini) {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt + '\nRespond with ONLY valid JSON.' }] }] }),
      });
      const data = await res.json();
      text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    } else {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You write high-converting marketing content. Always respond with ONLY valid JSON, no markdown fences.' },
            { role: 'user', content: prompt },
          ],
          response_format: { type: 'json_object' },
        }),
      });
      const data = await res.json();
      text = data?.choices?.[0]?.message?.content ?? '';
    }

    const cleaned = text.replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/```\s*$/, '').trim();
    const parsed = JSON.parse(cleaned);
    return json({ ok: true, ...parsed }, 200);
  } catch (_e) {
    return json({ ok: false, reason: 'llm_error' }, 200);
  }
});

function json(payload: unknown, status: number) {
  return new Response(JSON.stringify(payload), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });
}
