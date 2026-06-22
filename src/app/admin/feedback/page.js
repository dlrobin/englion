'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, ArrowLeft, Tag, Mail, User, Clock } from 'lucide-react';
import Link from 'next/link';

export default function AdminFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/feedback')
      .then(r => r.json())
      .then(d => { setFeedbacks(d.feedbacks); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const typeColors = {
    '建议': 'bg-blue-100 text-blue-700',
    '问题反馈': 'bg-yellow-100 text-yellow-700',
    '功能请求': 'bg-green-100 text-green-700',
    '其他': 'bg-gray-100 text-gray-600'
  };

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link href="/" className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 mb-2">
            <ArrowLeft className="h-3 w-3" /> 返回技能库
          </Link>
          <h1 className="text-xl font-bold text-gray-900">反馈管理</h1>
          <p className="text-xs text-gray-400 mt-1">
            共 {feedbacks.length} 条反馈（内存存储，函数重启后清空）
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400 text-sm">加载中...</div>
      ) : feedbacks.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <MessageSquare className="h-8 w-8 mx-auto mb-3" />
          <p className="text-sm">暂无反馈</p>
        </div>
      ) : (
        <div className="space-y-3">
          {feedbacks.map((fb) => (
            <div key={fb.id} className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${typeColors[fb.type] || 'bg-gray-100 text-gray-600'}`}>
                    {fb.type}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] text-gray-400">
                    <Tag className="h-2.5 w-2.5" /> {fb.skill}
                  </span>
                </div>
                <span className="text-[10px] text-gray-300 shrink-0">{new Date(fb.time).toLocaleString('zh-CN')}</span>
              </div>
              <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap">{fb.message}</p>
              <div className="mt-2 flex items-center gap-3 text-[10px] text-gray-400">
                {fb.name !== '匿名' && (
                  <span className="inline-flex items-center gap-0.5"><User className="h-2.5 w-2.5" /> {fb.name}</span>
                )}
                {fb.email !== '-' && (
                  <span className="inline-flex items-center gap-0.5"><Mail className="h-2.5 w-2.5" /> {fb.email}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
