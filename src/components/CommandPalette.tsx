'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { GraphNode } from '@/types/graph';

interface Action {
  id: string;
  label: string;
  shortcut?: string;
  icon: string;
  section: string;
  action: () => void;
}

interface CommandPaletteProps {
  onClose: () => void;
  actions: Action[];
  nodes: GraphNode[];
  onSelectNode: (id: string) => void;
}

export default function CommandPalette({ onClose, actions, nodes, onSelectNode }: CommandPaletteProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [query, setQuery] = useState('');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const allItems = useMemo(() => {
    const nodeItems: Action[] = nodes.map(n => ({
      id: `node-${n.id}`,
      label: n.title,
      icon: '○',
      section: 'Nodes',
      action: () => { onSelectNode(n.id); onClose(); },
    }));
    return [...actions, ...nodeItems];
  }, [actions, nodes, onSelectNode, onClose]);

  const filtered = useMemo(() => {
    if (!query.trim()) return allItems;
    const q = query.toLowerCase();
    return allItems.filter(a => a.label.toLowerCase().includes(q) || a.section.toLowerCase().includes(q));
  }, [query, allItems]);

  useEffect(() => { setSelectedIdx(0); }, [query]);

  useEffect(() => {
    const el = listRef.current?.children[selectedIdx] as HTMLElement | undefined;
    el?.scrollIntoView({ block: 'nearest' });
  }, [selectedIdx]);

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIdx(i => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIdx(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && filtered[selectedIdx]) {
      e.preventDefault();
      filtered[selectedIdx].action();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  // Group by section
  const sections = useMemo(() => {
    const map = new Map<string, Action[]>();
    filtered.forEach(a => {
      const arr = map.get(a.section) || [];
      arr.push(a);
      map.set(a.section, arr);
    });
    return map;
  }, [filtered]);

  let globalIdx = -1;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center pt-[15vh] p-4 animate-fade-in"
      style={{
        background: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(15,23,42,0.35)',
        backdropFilter: 'blur(12px)',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-lg rounded-2xl overflow-hidden animate-scale-in"
        style={{
          background: isDark
            ? 'linear-gradient(165deg, rgba(15,18,35,0.98) 0%, rgba(8,10,22,0.99) 100%)'
            : 'linear-gradient(165deg, #ffffff 0%, #f8fafc 100%)',
          border: `1px solid ${isDark ? 'rgba(99,102,241,0.12)' : 'rgba(99,102,241,0.1)'}`,
          boxShadow: isDark
            ? '0 32px 80px -12px rgba(0,0,0,0.85), 0 0 0 1px rgba(99,102,241,0.06)'
            : '0 32px 80px -12px rgba(0,0,0,0.2), 0 0 0 1px rgba(99,102,241,0.08)',
        }}
        onKeyDown={handleKey}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3.5" style={{ borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}` }}>
          <svg className="w-5 h-5 shrink-0" style={{ color: 'var(--text-muted)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search actions, nodes..."
            className="flex-1 bg-transparent outline-none text-sm font-medium"
            style={{ color: 'var(--text-primary)' }}
          />
          <kbd
            className="px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0"
            style={{
              background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
              color: 'var(--text-muted)',
            }}
          >
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-80 overflow-y-auto py-2">
          {filtered.length === 0 && (
            <div className="px-4 py-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
              No results found
            </div>
          )}
          {Array.from(sections.entries()).map(([section, items]) => (
            <div key={section}>
              <div className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                {section}
              </div>
              {items.map(item => {
                globalIdx++;
                const idx = globalIdx;
                const isSelected = idx === selectedIdx;
                return (
                  <button
                    key={item.id}
                    onClick={item.action}
                    onMouseEnter={() => setSelectedIdx(idx)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors"
                    style={{
                      background: isSelected
                        ? (isDark ? 'rgba(99,102,241,0.1)' : 'rgba(99,102,241,0.06)')
                        : 'transparent',
                      color: isSelected ? 'var(--text-accent)' : 'var(--text-secondary)',
                    }}
                  >
                    <span className="w-5 text-center text-sm shrink-0">{item.icon}</span>
                    <span className="flex-1 text-sm font-medium truncate">{item.label}</span>
                    {item.shortcut && (
                      <kbd
                        className="px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0"
                        style={{
                          background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
                          border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                          color: 'var(--text-muted)',
                        }}
                      >
                        {item.shortcut}
                      </kbd>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export type { Action };
