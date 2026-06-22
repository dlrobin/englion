'use client';

import React, { use } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ArrowLeft, Tag, Download, Globe, User, Hash, MessageSquareText, Clock } from 'lucide-react';
import data from '@/data/skills.json';
import Link from 'next/link';

const typeStyles = {
  '建议': 'bg-blue-100 text-blue-700',
  '问题反馈': 'bg-yellow-100 text-yellow-700',
  '功能请求': 'bg-green-100 text-green-700',
  '其他': 'bg-gray-100 text-gray-600'
};

// Feedback form component
function FeedbackForm({ skillName, onSubmitted }) {
  const [form, setForm] = React.useState({ name: '', email: '', type: '建议', message: '' });
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, skill: skillName })
      });
      const data = await res.json();
      if (data.success) {
        setForm({ name: '', email: '', type: '建议', message: '' });
        if (onSubmitted) onSubmitted();
      }
    } catch (err) {
      alert('提交失败，请稍后重试');
    }
    setLoading(false);
  };

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
      <h3 className="text-sm font-semibold text-gray-900 mb-1">反馈建议</h3>
      <p className="text-xs text-gray-400 mb-4">如果你对该技能有任何建议或问题，欢迎留言。</p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="姓名（可选）"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-900 placeholder-gray-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
          />
          <input
            type="email"
            placeholder="邮箱（可选）"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-900 placeholder-gray-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
          />
        </div>
        <select
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-900 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
        >
          <option value="建议">建议</option>
          <option value="问题反馈">问题反馈</option>
          <option value="功能请求">功能请求</option>
          <option value="其他">其他</option>
        </select>
        <textarea
          placeholder="请详细描述您的建议或问题..."
          rows={3}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          required
          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-900 placeholder-gray-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100 resize-none"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-primary-600 px-4 py-2 text-xs font-medium text-white hover:bg-primary-700 transition-colors disabled:opacity-50"
        >
          {loading ? '提交中...' : '提交反馈'}
        </button>
      </form>
    </div>
  );
}


export default function SkillPage({ params }) {
  const { slug } = use(params);
  const skill = data.skills.find((s) => s.slug === slug);
  const [stats, setStats] = React.useState({ downloads: 0, avg_rating: 0, ratings_count: 0 });
  const [userRating, setUserRating] = React.useState(0);
  const [rated, setRated] = React.useState(false);
  const [feedbacks, setFeedbacks] = React.useState([]);
  const [feedbacksLoading, setFeedbacksLoading] = React.useState(true);

  const loadFeedbacks = React.useCallback(async () => {
    if (!skill) return;
    setFeedbacksLoading(true);
    try {
      const res = await fetch('/api/feedback?skill=' + encodeURIComponent(skill.name));
      const data = await res.json();
      setFeedbacks(data.feedbacks || []);
    } catch (e) {
      // ignore
    }
    setFeedbacksLoading(false);
  }, [skill]);

  React.useEffect(() => {
    fetch('/api/stats?slug=' + slug).then(r => r.json()).then(d => setStats(d)).catch(() => {});
    loadFeedbacks();
  }, [slug, loadFeedbacks]);

  const handleDownload = () => {
    fetch('/api/stats', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'download', slug }) })
      .then(r => r.json()).then(d => setStats(prev => ({ ...prev, downloads: d.downloads }))).catch(() => {});
    const content = `# ${skill.name}\n\n## 简介\n\n${skill.description}\n\n## 分类\n\n${skill.category}\n\n---\n\n${skill.body}`;
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${skill.slug}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!skill) {
    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-xl font-semibold text-gray-900">未找到该技能</h1>
        <p className="mt-2 text-sm text-gray-500">
          技能 &quot;{slug}&quot; 不存在
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-700"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          返回技能库
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-1.5 text-xs text-gray-400">
        <Link href="/" className="hover:text-gray-600 transition-colors">
          技能库
        </Link>
        <span>/</span>
        <span className="text-gray-600">{skill.name}</span>
      </nav>

      {/* Skill header */}
      <div className="mb-8">
        <div className="flex items-start gap-2 mb-3">
          <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-medium text-gray-600">
            <Tag className="h-2.5 w-2.5 mr-1" />
            {skill.category}
          </span>
        </div>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{skill.name}</h1>
            <p className="mt-2 text-sm text-gray-500 leading-relaxed">
              {skill.description}
            </p>
            {/* Meta info */}
            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-gray-400">
              <span className="inline-flex items-center gap-1">
                <Hash className="h-3 w-3" />
                v{skill.version}
              </span>
              <span className="inline-flex items-center gap-1">
                <User className="h-3 w-3" />
                {skill.author}
              </span>
              <a
                href={skill.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-primary-500 hover:text-primary-600 transition-colors"
              >
                <Globe className="h-3 w-3" />
                {skill.website}
              </a>
              <span className="inline-flex items-center gap-1">
                <Download className="h-3 w-3" />
                下载 {stats.downloads} 次
              </span>
              <span className="inline-flex items-center gap-1">
                {[1,2,3,4,5].map(i => (
                  <button key={i} onClick={() => { if (!rated) { setUserRating(i); setRated(true); fetch('/api/stats', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'rate', slug, rating: i }) }).then(r => r.json()).then(d => setStats(prev => ({ ...prev, avg_rating: d.avg_rating, ratings_count: d.ratings_count }))).catch(() => {}); }}}
                    className={`h-3.5 w-3.5 transition-colors ${i <= Math.round(stats.avg_rating) ? 'text-yellow-400' : 'text-gray-200'} ${!rated ? 'hover:text-yellow-300 cursor-pointer' : 'cursor-default'}`}
                    dangerouslySetInnerHTML={{ __html: '★' }}
                  />
                ))}
                {stats.ratings_count > 0 ? ` ${stats.avg_rating.toFixed(1)} (${stats.ratings_count}人)` : ' 暂无评分'}
              </span>
            </div>
          </div>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 rounded-lg bg-primary-600 px-3.5 py-2 text-xs font-medium text-white shadow-sm hover:bg-primary-700 transition-colors shrink-0"
          >
            <Download className="h-3.5 w-3.5" />
            下载
            {stats.downloads > 0 && <span className="ml-1 opacity-70">({stats.downloads})</span>}
          </button>
        </div>
      </div>

      {/* Divider */}
      <hr className="mb-8 border-gray-200" />

      {/* Markdown content */}
      <div className="prose-custom">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {skill.body}
        </ReactMarkdown>
      </div>

      {/* Feedback list */}
      <div className="mt-10">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquareText className="h-4 w-4 text-primary-500" />
          <h3 className="text-sm font-semibold text-gray-900">
            用户反馈
            {feedbacks.length > 0 && (
              <span className="ml-1.5 text-xs font-normal text-gray-400">({feedbacks.length})</span>
            )}
          </h3>
        </div>

        {feedbacksLoading ? (
          <div className="text-center py-8 text-xs text-gray-400">加载中...</div>
        ) : feedbacks.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <MessageSquareText className="h-6 w-6 mx-auto mb-2" />
            <p className="text-xs">暂无反馈，来写下第一条吧</p>
          </div>
        ) : (
          <div className="space-y-3 mb-8">
            {feedbacks.map((fb) => (
              <div key={fb.id} className="rounded-lg border border-gray-100 bg-white p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${typeStyles[fb.type] || 'bg-gray-100 text-gray-600'}`}>
                      {fb.type}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] text-gray-400">
                      <User className="h-2.5 w-2.5" />
                      {fb.name || '匿名'}
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] text-gray-300 shrink-0">
                    <Clock className="h-2.5 w-2.5" />
                    {new Date(fb.time || fb.created_at).toLocaleDateString('zh-CN')}
                  </span>
                </div>
                <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap">{fb.message}</p>
              </div>
            ))}
          </div>
        )}

        {/* Feedback form */}
        <FeedbackForm skillName={skill.name} onSubmitted={loadFeedbacks} />
      </div>

      {/* Footer */}
      <div className="mt-12 pt-6 border-t border-gray-200 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          返回技能库
        </Link>
        <button
          onClick={handleDownload}
          className="inline-flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-700 transition-colors"
        >
          <Download className="h-3.5 w-3.5" />
          下载此技能
          {stats.downloads > 0 && <span className="ml-0.5 opacity-70">({stats.downloads})</span>}
        </button>
      </div>
    </div>
  );
}
