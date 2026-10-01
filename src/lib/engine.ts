import { supabase, type Post } from './supabase';

// Simulated engagement model — replaced by real platform APIs once connected.
export function syntheticMetrics(post: Post) {
  const base = post.platform === 'linkedin' ? 120 : post.platform === 'instagram' ? 260 : 180;
  const lenBoost = Math.min(2, post.content.length / 400 + 1);
  const tagBoost = 1 + post.hashtags.length * 0.06;
  const k = base * lenBoost * tagBoost * (0.7 + Math.random() * 0.9);
  return {
    likes: Math.round(k),
    comments: Math.round(k * 0.06),
    shares: Math.round(k * 0.09),
    clicks: Math.round(k * 0.22),
    sales: Math.round(k * 0.03),
  };
}

// Publish engine: promote due scheduled posts to published (cron-equivalent client sweep).
export async function processDuePosts(userId: string): Promise<number> {
  const now = new Date().toISOString();
  const { data: due, error } = await supabase
    .from('posts')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'scheduled')
    .lte('scheduled_at', now);
  if (error || !due?.length) return 0;

  for (const post of due as Post[]) {
    const metrics = syntheticMetrics(post);
    await supabase
      .from('posts')
      .update({ status: 'published', published_at: now, metrics })
      .eq('id', post.id);
    await supabase.from('analytics_events').insert(
      Object.entries({ likes: metrics.likes, comments: metrics.comments, shares: metrics.shares, clicks: metrics.clicks, sales: metrics.sales }).map(([type, value]) => ({
        user_id: userId,
        post_id: post.id,
        event_type: type,
        platform: post.platform,
        value,
      }))
    );
  }
  return due.length;
}
