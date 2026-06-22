import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  try {
    const body = await request.json();
    const { error } = await supabase.from('feedback').insert({
      skill: body.skill || '全局',
      type: body.type || '建议',
      name: body.name || '匿名',
      email: body.email || '-',
      message: body.message
    });
    if (error) throw error;
    return Response.json({ success: true, message: '感谢反馈！' });
  } catch (error) {
    console.error('[Feedback] Save error:', error);
    return Response.json({ success: false, message: error.message || '提交失败' }, { status: 500 });
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const skill = searchParams.get('skill');
  let query = supabase.from('feedback').select('*').order('id', { ascending: false }).limit(100);
  if (skill) {
    query = query.eq('skill', skill);
  }
  try {
    const { data, error } = await query;
    if (error && error.message?.includes('relation "feedback" does not exist')) {
      return Response.json({ feedbacks: [] });
    }
    if (error) throw error;
    return Response.json({ feedbacks: data || [] });
  } catch (error) {
    console.error('[Feedback] Load error:', error);
    return Response.json({ feedbacks: [] });
  }
}
