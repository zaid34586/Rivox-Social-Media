import { createClient } from '@supabase/supabase-js';
import { createVerdentAuth } from '@verdent/auth-js';

export const supabase = createClient(window.location.origin, 'verdent-baas-proxy', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export const auth = createVerdentAuth({ supabase });

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
