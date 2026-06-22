'use client';

import { useState, useMemo, useCallback } from 'react';
import { Search, ChevronRight, Quote, MessageSquareText, Download, Star } from 'lucide-react';
import data from '@/data/skills.json';
import recommended from '@/data/recommended.json';
import reviews from '@/data/reviews.json';

function useDownload() {
  return useCallback((skill) => {
    fetch('/api/stats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'download', slug: skill.slug })
    }).catch(() => {});
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
  }, []);
}

function RecommendedCard({ skill, reason, onDownload }) {
  return (
    <div className="relative rounded-lg border-2 border-primary-100 bg-gradient-to-br from-white to-primary-50/40 p-4 transition-all hover:border-primary-300 hover:shadow-sm group">
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="inline-flex items-center rounded-full bg-primary-100 px-2 py-0.5 text-[10px] font-medium text-primary-700">
          {skill.category}
        </span>
        <span className="text-[10px] text-gray-400">v{skill.version}</span>
      </div>
      <h3 className="text-sm font-semibold text-gray-900 mb-1">{skill.name}</h3>
      <p className="text-[11px] text-gray-500 leading-relaxed mb-3 line-clamp-2">
        {skill.description}
      </p>
      <p className="text-[10px] text-primary-600/70 italic mb-3 leading-relaxed">
        {reason}
      </p>
      <div className="flex items-center gap-2">
        <a
          href={`/skills/${skill.slug}`}
          className="rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-[10px] font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors"
        >
          详情
        </a>
        <button
          onClick={(e) => { e.preventDefault(); onDownload(skill); }}
          className="inline-flex items-center gap-1 rounded-md bg-primary-600 px-3 py-1.5 text-[10px] font-medium text-white hover:bg-primary-700 transition-colors"
        >
          <Download className="h-3 w-3" />
          下载
        </button>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const downloadSkill = useDownload();

  const allCategories = ['全部', ...data.categories];

  const filtered = useMemo(() => {
    return data.skills.filter((skill) => {
      const matchesSearch =
        !search ||
        skill.name.toLowerCase().includes(search.toLowerCase()) ||
        skill.description.toLowerCase().includes(search.toLowerCase());
      const matchesCategory =
        selectedCategory === '全部' || skill.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [search, selectedCategory]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Header section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">技能库</h1>
        <p className="mt-1 text-sm text-gray-500">
          分享建筑领域AI应用，赋能建筑业智能化转型
        </p>
      </div>

      {/* Recommended downloads section */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <Star className="h-4 w-4 text-amber-500" fill="currentColor" />
          <h2 className="text-lg font-bold text-gray-900">推荐下载</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {recommended.map((rec) => {
            const skill = data.skills.find((s) => s.slug === rec.slug);
            if (!skill) return null;
            return (
              <RecommendedCard
                key={skill.slug}
                skill={skill}
                reason={rec.reason}
                onDownload={downloadSkill}
              />
            );
          })}
        </div>
      </div>

      {/* Divider */}
      <hr className="mb-8 border-gray-200" />

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="搜索技能..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100 transition-colors"
        />
      </div>

      {/* Category filter */}
      <div className="mb-8 flex flex-wrap gap-2">
        {allCategories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
              selectedCategory === cat
                ? 'bg-primary-600 text-white shadow-sm'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:border-gray-300'
            }`}
          >
            {cat}
            {cat !== '全部' && (
              <span className="ml-1 opacity-60">
                ({data.skills.filter((s) => s.category === cat).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Results count */}
      <p className="mb-4 text-xs text-gray-400">
        共 {data.total} 项技能
      </p>

      {/* Skills grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <Search className="h-8 w-8 mb-3" />
          <p className="text-sm">没有匹配的技能</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((skill) => (
            <a
              key={skill.slug}
              href={`/skills/${skill.slug}`}
              className="group relative rounded-lg border border-gray-200 bg-white p-4 transition-all hover:border-primary-200 hover:shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-sm font-semibold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-1">
                  {skill.name}
                </h3>
                <ChevronRight className="h-3.5 w-3.5 flex-shrink-0 text-gray-300 group-hover:text-primary-400 transition-colors mt-0.5" />
              </div>
              <p className="mt-1.5 text-xs text-gray-500 line-clamp-2 leading-relaxed">
                {skill.description}
              </p>
              <div className="mt-3 flex items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600">
                  {skill.category}
                </span>
                <span className="inline-flex items-center rounded-full bg-gray-50 px-2 py-0.5 text-[10px] font-medium text-gray-400">
                  v{skill.version}
                </span>
              </div>
            </a>
          ))}
        </div>
      )}

      {/* Reviews section */}
      <div className="mt-16 mb-8">
        <div className="flex items-center gap-2 mb-1">
          <MessageSquareText className="h-4 w-4 text-primary-500" />
          <h2 className="text-lg font-bold text-gray-900">用户评价</h2>
        </div>
        <p className="text-xs text-gray-400 mb-6">来自社区的真实反馈</p>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="relative rounded-lg border border-gray-200 bg-white p-5 transition-all hover:border-primary-200 hover:shadow-sm"
            >
              <Quote className="absolute top-3 right-3 h-4 w-4 text-primary-100" />
              <p className="text-xs text-gray-600 leading-relaxed mb-4 pr-4">
                {review.content}
              </p>
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-50 text-[10px] font-semibold text-primary-600 shrink-0">
                  {review.author[0]}
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-medium text-gray-900 truncate">{review.author}</p>
                  <p className="text-[10px] text-gray-400 truncate">{review.role} · {review.source}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
