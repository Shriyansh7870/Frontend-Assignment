'use client';

import { useState, useEffect, useRef } from 'react';
import { teamMembers } from '@/data/seed';
import { NODE_PALETTE } from '@/utils/nodeColors';
import { useTheme } from '@/context/ThemeContext';

const MEMBER_COLORS: Record<string, string> = {
  Nancy: '#6366f1', Raushan: '#ec4899', Golu: '#f97316',
  Abhikesh: '#22c55e', Sourav: '#06b6d4',
};

interface AddNodeModalProps {
  onAdd: (title: string, note: string, createdBy: string) => void;
  onClose: () => void;
}

export default function AddNodeModal({ onAdd, onClose }: AddNodeModalProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [createdBy, setCreatedBy] = useState(teamMembers[0]);
  const [previewColor, setPreviewColor] = useState(NODE_PALETTE[0].bg);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => { titleRef.current?.focus(); }, []);

  useEffect(() => {
    if (!title) { setPreviewColor(NODE_PALETTE[0].bg); return; }
    let hash = 0;
    for (let i = 0; i < title.length; i++) {
      hash = ((hash << 5) - hash) + title.charCodeAt(i); hash |= 0;
    }
    setPreviewColor(NODE_PALETTE[Math.abs(hash) % NODE_PALETTE.length].bg);
  }, [title]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd(title.trim(), note.trim(), createdBy);
    onClose();
  };

  const memberColor = MEMBER_COLORS[createdBy] ?? '#6366f1';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      style={{
        background: isDark ? 'rgba(0,0,0,0.7)' : 'rgba(15,23,42,0.45)',
        backdropFilter: 'blur(16px) saturate(120%)',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-[440px] rounded-3xl overflow-hidden animate-scale-in"
        style={{
          background: isDark
            ? 'linear-gradient(165deg, rgba(15,18,35,0.98) 0%, rgba(8,10,22,0.99) 100%)'
            : 'linear-gradient(165deg, #ffffff 0%, #f8fafc 100%)',
          border: `1px solid ${isDark ? 'rgba(99,102,241,0.12)' : 'rgba(99,102,241,0.1)'}`,
          boxShadow: isDark
            ? '0 32px 80px -12px rgba(0,0,0,0.85), 0 0 0 1px rgba(99,102,241,0.06), inset 0 1px 0 rgba(255,255,255,0.04)'
            : '0 32px 80px -12px rgba(0,0,0,0.2), 0 0 0 1px rgba(99,102,241,0.08), 0 0 60px -20px rgba(99,102,241,0.12)',
        }}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
          style={{
            background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
            color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.35)',
          }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header with gradient accent strip */}
        <div className="relative px-7 pt-7 pb-6 overflow-hidden">
          {/* Gradient accent bar at top */}
          <div
            className="absolute top-0 left-0 right-0 h-[3px]"
            style={{ background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #a78bfa)' }}
          />

          {/* Ambient glow */}
          <div
            className="absolute -top-12 -right-12 w-48 h-48 rounded-full pointer-events-none transition-all duration-700"
            style={{ background: `radial-gradient(circle, ${previewColor}${isDark ? '18' : '12'} 0%, transparent 70%)`, filter: 'blur(30px)' }}
          />
          <div
            className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full pointer-events-none"
            style={{ background: `radial-gradient(circle, rgba(99,102,241,${isDark ? '0.08' : '0.05'}) 0%, transparent 70%)`, filter: 'blur(25px)' }}
          />

          <div className="relative flex items-center gap-4">
            {/* Animated preview node */}
            <div
              className="w-[52px] h-[52px] rounded-2xl flex items-center justify-center text-white text-xl font-black shrink-0 transition-all duration-400"
              style={{
                background: `linear-gradient(135deg, ${previewColor} 0%, ${previewColor}bb 100%)`,
                boxShadow: `0 8px 28px ${previewColor}40, inset 0 1px 0 rgba(255,255,255,0.2)`,
              }}
            >
              {title ? title.charAt(0).toUpperCase() : (
                <svg className="w-5 h-5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                New Node
              </h2>
              <p className="text-[13px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                Add a topic to your knowledge graph
              </p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="mx-7" style={{ height: 1, background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }} />

        {/* Fields */}
        <div className="px-7 py-6 space-y-5">
          {/* Title */}
          <div>
            <label className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.08em] mb-2" style={{ color: 'var(--text-muted)' }}>
              <div className="w-1 h-1 rounded-full" style={{ background: '#6366f1' }} />
              Title
              <span className="text-red-400/80 text-[10px]">required</span>
            </label>
            <input
              ref={titleRef}
              className="input-dark"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. GraphQL, Docker, CI/CD..."
              style={{ fontSize: 14, padding: '11px 16px', borderRadius: 14 }}
            />
          </div>

          {/* Note */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.08em]" style={{ color: 'var(--text-muted)' }}>
                <div className="w-1 h-1 rounded-full" style={{ background: '#8b5cf6' }} />
                Note
                <span className="text-[10px] font-normal normal-case opacity-50">optional</span>
              </label>
              {note.length > 0 && (
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md"
                  style={{ background: isDark ? 'rgba(99,102,241,0.1)' : 'rgba(99,102,241,0.06)', color: 'var(--text-accent)' }}>
                  {note.length}
                </span>
              )}
            </div>
            <textarea
              className="input-dark resize-none"
              value={note}
              onChange={e => setNote(e.target.value)}
              rows={3}
              placeholder="Brief description of this topic..."
              style={{ lineHeight: '1.7', fontSize: 14, padding: '11px 16px', borderRadius: 14 }}
            />
          </div>

          {/* Created By */}
          <div>
            <label className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.08em] mb-2" style={{ color: 'var(--text-muted)' }}>
              <div className="w-1 h-1 rounded-full" style={{ background: '#06b6d4' }} />
              Created By
            </label>
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-black shrink-0 transition-all duration-300"
                style={{
                  background: `linear-gradient(135deg, ${memberColor} 0%, ${memberColor}cc 100%)`,
                  boxShadow: `0 4px 12px ${memberColor}50`,
                }}
              >
                {createdBy.charAt(0)}
              </div>
              <div className="relative flex-1">
                <select
                  className="input-dark appearance-none pr-10 cursor-pointer"
                  value={createdBy}
                  onChange={e => setCreatedBy(e.target.value)}
                  style={{ fontSize: 14, padding: '10px 16px', borderRadius: 14 }}
                >
                  {teamMembers.map(name => (
                    <option key={name} value={name} style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>{name}</option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }}>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between px-7 py-5"
          style={{ borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}` }}
        >
          <span className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>
            Press <kbd className="px-1.5 py-0.5 rounded-md text-[10px] font-bold" style={{ background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)', border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}` }}>Esc</kbd> to close
          </span>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-200 hover:scale-[1.03] active:scale-95"
              style={{
                background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
                color: 'var(--text-secondary)',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold text-white transition-all duration-200 hover:scale-[1.03] active:scale-95 disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:scale-100"
              style={{
                background: title.trim()
                  ? 'linear-gradient(135deg, #6366f1 0%, #7c3aed 50%, #8b5cf6 100%)'
                  : isDark ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.15)',
                boxShadow: title.trim()
                  ? '0 6px 24px rgba(99,102,241,0.45), inset 0 1px 0 rgba(255,255,255,0.15)'
                  : 'none',
              }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Create Node
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
