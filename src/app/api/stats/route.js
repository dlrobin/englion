import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug');
  if (!slug) return Response.json({ downloads: 0, avg_rating: 0, ratings_count: 0 });

  const { data } = await supabase.from('skill_stats').select('*').eq('skill_slug', slug).maybeSingle();
  return Response.json(data || { skill_slug: slug, downloads: 0, avg_rating: 0, ratings_count: 0 });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { action, slug, rating, name } = body;

    if (action === 'download') {
      const { data: existing } = await supabase.from('skill_stats').select('downloads').eq('skill_slug', slug).maybeSingle();
      if (existing) {
        await supabase.from('skill_stats').update({ downloads: existing.downloads + 1 }).eq('skill_slug', slug);
      } else {
        await supabase.from('skill_stats').insert({ skill_slug: slug, downloads: 1 });
      }
      const { data: updated } = await supabase.from('skill_stats').select('downloads').eq('skill_slug', slug).single();
      return Response.json({ downloads: updated?.downloads || 1 });
    }

    if (action === 'rate') {
      if (!rating || rating < 1 || rating > 5) return Response.json({ error: '无效评分' }, { status: 400 });
      await supabase.from('skill_ratings').insert({ skill_slug: slug, rating, name: name || '匿名' });
      
      const { data: ratings } = await supabase.from('skill_ratings').select('rating').eq('skill_slug', slug);
      const total = ratings.reduce((s, r) => s + r.rating, 0);
      const count = ratings.length;
      const avg = Math.round((total / count) * 10) / 10;

      const { data: existing } = await supabase.from('skill_stats').select('id').eq('skill_slug', slug).maybeSingle();
      if (existing) {
        await supabase.from('skill_stats').update({ avg_rating: avg, ratings_count: count }).eq('skill_slug', slug);
      } else {
        await supabase.from('skill_stats').insert({ skill_slug: slug, downloads: 0, avg_rating: avg, ratings_count: count });
      }
      return Response.json({ avg_rating: avg, ratings_count: count });
    }

    return Response.json({ error: 'invalid action' }, { status: 400 });
  } catch (e) {
    return Response.json({ error: e.message || 'error' }, { status: 500 });
  }
}
