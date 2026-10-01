import { createClient } from '@supabase/supabase-js';
import { createVerdentAuth } from '@verdent/auth-js';

// On Verdent hosting: same-origin BaaS proxy is used automatically.
// On other hosts (e.g. Vercel): set VITE_SUPABASE_URL + VITE_SUPABASE_PUBLISHABLE_KEY env vars.
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || window.location.origin;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'verdent-baas-proxy';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export const auth = createVerdentAuth({
  supabase,
  ...(import.meta.env.VITE_VERDENT_OAUTH_INITIATE_URL
    ? { oauth: { authorizeUrl: import.meta.env.VITE_VERDENT_OAUTH_INITIATE_URL } }
    : {}),
});

// Edge Functions live on the Supabase project, not the web host.
export const EDGE_FUNCTIONS_URL = import.meta.env.VITE_SUPABASE_URL
  ? `${import.meta.env.VITE_SUPABASE_URL.replace(/\/$/, '')}/functions/v1`
  : `${window.location.origin}/functions/v1`;

export const PLATFORMS = ['instagram', 'x', 'linkedin'] as const;
export type Platform = (typeof PLATFORMS)[number];

export const PLATFORM_META: Record<Platform, { label: string; icon: string; color: string }> = {
  instagram: { label: 'Instagram', icon: 'IG', color: 'from-pink-500 to-orange-400' },
  x: { label: 'X (Twitter)', icon: 'X', color: 'from-slate-500 to-slate-300' },
  linkedin: { label: 'LinkedIn', icon: 'in', color: 'from-sky-500 to-blue-600' },
};

export type Brand = {
  id: string;
  user_id: string;
  name: string;
  website_url: string | null;
  product_desc: string | null;
  audience: string | null;
  tone: string | null;
  niche: string | null;
  goals: string | null;
};

export type Post = {
  id: string;
  user_id: string;
  brand_id: string | null;
  platform: Platform;
  format: string;
  content: string;
  hashtags: string[];
  image_prompt: string | null;
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  scheduled_at: string | null;
  published_at: string | null;
  metrics: { likes: number; comments: number; shares: number; clicks: number; sales: number };
  created_at: string;
};

export type SeoArticle = {
  id: string;
  title: string;
  keyword: string;
  meta_description: string;
  content: string;
  status: 'draft' | 'published';
  created_at: string;
};

export type ConnectedAccount = {
  id: string;
  platform: Platform;
  account_name: string | null;
  status: string;
};
