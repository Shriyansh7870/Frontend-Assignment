'use client';

import { useState, useEffect, useRef } from 'react';
import { teamMembers } from '@/data/seed';
import { useTheme } from '@/context/ThemeContext';

const MEMBER_COLORS = ['#6366f1', '#ec4899', '#f97316', '#22c55e', '#06b6d4'];

export type LayoutMode = 'cose' | 'circle' | 'grid' | 'concentric' | 'breadthfirst-h' | 'breadthfirst-v' | 'random' | 'dagre-lr';

const LAYOUTS: { id: LayoutMode; label: string; icon: string }[] = [
  { id: 'dagre-lr', label: 'Directed (L→R)', icon: '→' },
  { id: 'circle', label: 'Circle', icon: '⭕' },
  { id: 'grid', label: 'Grid', icon: '⊞' },
  { id: 'concentric', label: 'Radial', icon: '◎' },
  { id: 'breadthfirst-h', label: 'Horizontal', icon: '↔' },
  { id: 'breadthfirst-v', label: 'Vertical', icon: '↕' },
  { id: 'random', label: 'Random', icon: '🎲' },
];

interface ToolbarProps {
  onAddNode: () => void;
  onAddEdge: () => void;
  onFitToCenter: () => void;
  onLayoutChange: (layout: LayoutMode) => void;
  currentLayout: LayoutMode;
  nodeCount: number;
  edgeCount: number;
  onSearch: (query: string) => void;
  onExportPNG: () => void;
  onExportJSON: () => void;
  onImportJSON: (file: File) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onOpenCommandPalette: () => void;
}

function AnimatedCount({ value }: { value: number }) {
  const [display, setDisplay] = useState(value);
  const prev = useRef(value);

  useEffect(() => {
    if (value === prev.current) return;
    const start = prev.current;
    const end = value;
    const duration = 400;
    const startTime = performance.now();
    const step = (now: number) => {
      const t = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(start + (end - start) * eased));
      if (t < 1) requestAnimationFrame(step);
      else prev.current = end;
    };
    requestAnimationFrame(step);
  }, [value]);

  return <span>{display}</span>;
}

function IconBtn({ onClick, title, disabled, children, active }: {
  onClick: () => void; title: string; disabled?: boolean;
  children: React.ReactNode; active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 disabled:opacity-30 disabled:hover:scale-100"
      style={{
        background: active ? 'rgba(99,102,241,0.15)' : 'var(--bg-hover)',
        border: `1px solid ${active ? 'rgba(99,102,241,0.3)' : 'var(--border)'}`,
        color: active ? 'var(--text-accent)' : 'var(--text-secondary)',
      }}
      title={title}
    >
      {children}
    </button>
  );
}

export default function Toolbar({
  onAddNode, onAddEdge, onFitToCenter, onLayoutChange, currentLayout,
  nodeCount, edgeCount, onSearch, onExportPNG, onExportJSON, onImportJSON,
  onUndo, onRedo, canUndo, canRedo, onOpenCommandPalette,
}: ToolbarProps) {
  const { theme, toggleTheme } = useTheme();
  const [showLayouts, setShowLayouts] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMore, setShowMore] = useState(false);
  const layoutRef = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (layoutRef.current && !layoutRef.current.contains(e.target as Node)) setShowLayouts(false);
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) setShowMore(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (showSearch) searchRef.current?.focus();
  }, [showSearch]);

  const handleSearch = (q: string) => {
    setSearchQuery(q);
    onSearch(q);
  };

  const clearSearch = () => {
    setSearchQuery('');
    onSearch('');
    setShowSearch(false);
  };

  const isDark = theme === 'dark';

  return (
    <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between gap-3 pointer-events-none">

      {/* ── Left: Brand + Stats + Actions ─────────── */}
      <div className="flex items-center gap-3 rounded-2xl px-4 py-2.5 pointer-events-auto glass">

        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 animate-glow-pulse"
            style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              boxShadow: '0 4px 18px rgba(99,102,241,0.5)',
            }}
          >
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="6" cy="6" r="2" /><circle cx="18" cy="6" r="2" /><circle cx="6" cy="18" r="2" /><circle cx="18" cy="18" r="2" />
              <path strokeLinecap="round" d="M8 6h8M6 8v8M18 8v8M8 18h8" />
            </svg>
          </div>
          <div>
            <div className="font-black text-sm leading-none tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Knowledge
            </div>
            <div className="text-xs leading-none mt-0.5 font-medium" style={{ color: 'var(--text-muted)' }}>
              Graph
            </div>
          </div>
        </div>

        <div className="w-px h-7" style={{ background: 'var(--border)' }} />

        {/* Stats */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: '#6366f1', boxShadow: '0 0 6px #6366f1' }} />
            <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
              <AnimatedCount value={nodeCount} />
              <span className="ml-1" style={{ color: 'var(--text-muted)' }}>nodes</span>
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: '#8b5cf6', boxShadow: '0 0 6px #8b5cf6' }} />
            <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
              <AnimatedCount value={edgeCount} />
              <span className="ml-1" style={{ color: 'var(--text-muted)' }}>edges</span>
            </span>
          </div>
        </div>

        <div className="w-px h-7" style={{ background: 'var(--border)' }} />

        {/* Add actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onAddNode}
            className="flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold text-white transition-all duration-200 hover:scale-105 active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              boxShadow: '0 4px 14px rgba(99,102,241,0.35)',
            }}
            title="Add Node (Ctrl+N)"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Node
          </button>

          <button
            onClick={onAddEdge}
            className="flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all duration-200 hover:scale-105 active:scale-95"
            style={{
              background: 'var(--bg-hover)',
              border: '1px solid var(--border)',
              color: 'var(--text-secondary)',
            }}
            title="Add Edge (Ctrl+E)"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            Edge
          </button>
        </div>

        <div className="w-px h-7" style={{ background: 'var(--border)' }} />

        {/* Undo / Redo */}
        <div className="flex items-center gap-1">
          <IconBtn onClick={onUndo} title="Undo (Ctrl+Z)" disabled={!canUndo}>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a5 5 0 015 5v2M3 10l4-4m-4 4l4 4" />
            </svg>
          </IconBtn>
          <IconBtn onClick={onRedo} title="Redo (Ctrl+Shift+Z)" disabled={!canRedo}>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 10H11a5 5 0 00-5 5v2m15-7l-4-4m4 4l-4 4" />
            </svg>
          </IconBtn>
        </div>

        <div className="w-px h-7" style={{ background: 'var(--border)' }} />

        {/* Search */}
        {showSearch ? (
          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                ref={searchRef}
                value={searchQuery}
                onChange={e => handleSearch(e.target.value)}
                onKeyDown={e => { if (e.key === 'Escape') clearSearch(); }}
                placeholder="Search nodes..."
                className="w-40 h-8 rounded-lg px-3 pr-7 text-xs font-medium outline-none transition-all"
                style={{
                  background: isDark ? 'rgba(99,102,241,0.08)' : 'rgba(99,102,241,0.05)',
                  border: '1px solid rgba(99,102,241,0.3)',
                  color: 'var(--text-primary)',
                }}
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        ) : (
          <IconBtn onClick={() => setShowSearch(true)} title="Search (Ctrl+F)">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </IconBtn>
        )}

        <div className="w-px h-7" style={{ background: 'var(--border)' }} />

        {/* Layout selector */}
        <div ref={layoutRef} className="relative">
          <button
            onClick={() => setShowLayouts(!showLayouts)}
            className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-all duration-200 hover:scale-105 active:scale-95"
            style={{
              background: showLayouts ? 'rgba(99,102,241,0.15)' : 'var(--bg-hover)',
              border: `1px solid ${showLayouts ? 'rgba(99,102,241,0.3)' : 'var(--border)'}`,
              color: showLayouts ? 'var(--text-accent)' : 'var(--text-secondary)',
            }}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
            </svg>
            Layout
            <svg className={`w-3 h-3 transition-transform ${showLayouts ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showLayouts && (
            <div
              className="absolute top-full left-0 mt-2 rounded-xl overflow-hidden animate-slide-down"
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                boxShadow: '0 12px 40px var(--shadow-strong)',
                backdropFilter: 'blur(20px)',
                minWidth: 160,
              }}
            >
              {LAYOUTS.map(l => (
                <button
                  key={l.id}
                  onClick={() => { onLayoutChange(l.id); setShowLayouts(false); }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-semibold transition-all"
                  style={{
                    background: currentLayout === l.id ? 'rgba(99,102,241,0.12)' : 'transparent',
                    color: currentLayout === l.id ? 'var(--text-accent)' : 'var(--text-secondary)',
                  }}
                  onMouseEnter={e => {
                    if (currentLayout !== l.id) e.currentTarget.style.background = 'var(--bg-hover)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = currentLayout === l.id ? 'rgba(99,102,241,0.12)' : 'transparent';
                  }}
                >
                  <span className="text-sm">{l.icon}</span>
                  {l.label}
                  {currentLayout === l.id && (
                    <svg className="w-3.5 h-3.5 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="w-px h-7" style={{ background: 'var(--border)' }} />

        {/* More menu */}
        <div ref={moreRef} className="relative">
          <button
            onClick={() => setShowMore(!showMore)}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
            style={{
              background: showMore ? 'rgba(99,102,241,0.15)' : 'var(--bg-hover)',
              border: `1px solid ${showMore ? 'rgba(99,102,241,0.3)' : 'var(--border)'}`,
              color: showMore ? 'var(--text-accent)' : 'var(--text-secondary)',
            }}
            title="More actions"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>

          {showMore && (
            <div
              className="absolute top-full right-0 mt-2 rounded-xl overflow-hidden animate-slide-down"
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                boxShadow: '0 12px 40px var(--shadow-strong)',
                backdropFilter: 'blur(20px)',
                minWidth: 190,
              }}
            >
              <MoreItem icon={<path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />} label="Export as PNG" onClick={() => { onExportPNG(); setShowMore(false); }} />
              <MoreItem icon={<path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />} label="Export as JSON" onClick={() => { onExportJSON(); setShowMore(false); }} />
              <div className="mx-3 my-1" style={{ height: 1, background: 'var(--border)' }} />
              <MoreItem icon={<path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />} label="Import JSON" onClick={() => { fileRef.current?.click(); setShowMore(false); }} />
              <div className="mx-3 my-1" style={{ height: 1, background: 'var(--border)' }} />
              <MoreItem
                icon={<path strokeLinecap="round" strokeLinejoin="round" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />}
                label="Command Palette"
                onClick={() => { onOpenCommandPalette(); setShowMore(false); }}
                kbd="Ctrl+K"
                isDark={isDark}
              />
            </div>
          )}
        </div>

        <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={e => {
          const file = e.target.files?.[0];
          if (file) onImportJSON(file);
          e.target.value = '';
        }} />
      </div>

      {/* ── Right: Theme + Team ────────────────────── */}
      <div className="flex items-center gap-2.5 rounded-2xl px-4 py-2.5 pointer-events-auto glass">
        <button
          onClick={toggleTheme}
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
          style={{
            background: 'var(--bg-hover)',
            border: '1px solid var(--border)',
            color: 'var(--text-secondary)',
          }}
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>

        <div className="w-px h-6" style={{ background: 'var(--border)' }} />

        <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Team</span>
        <div className="flex items-center gap-1.5">
          {teamMembers.map((name, i) => (
            <div key={name} className="group relative flex items-center">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-black transition-all hover:scale-125 hover:-translate-y-0.5"
                style={{
                  background: MEMBER_COLORS[i % MEMBER_COLORS.length],
                  boxShadow: `0 2px 8px ${MEMBER_COLORS[i % MEMBER_COLORS.length]}60`,
                  border: '2px solid rgba(255,255,255,0.12)',
                  zIndex: teamMembers.length - i,
                  marginLeft: i > 0 ? '-4px' : '0',
                }}
                title={name}
              >
                {name.charAt(0)}
              </div>
              <div
                className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded-lg text-xs font-semibold text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                style={{ background: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                {name}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MoreItem({ icon, label, onClick, kbd: kbdText, isDark }: {
  icon: React.ReactNode; label: string; onClick: () => void; kbd?: string; isDark?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-semibold transition-all"
      style={{ color: 'var(--text-secondary)' }}
      onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
    >
      <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>{icon}</svg>
      {label}
      {kbdText && (
        <kbd className="ml-auto text-[9px] px-1 py-0.5 rounded font-bold" style={{
          background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
          color: 'var(--text-muted)',
        }}>
          {kbdText}
        </kbd>
      )}
    </button>
  );
}
