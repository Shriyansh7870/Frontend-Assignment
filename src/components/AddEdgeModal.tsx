'use client';

import { useState, useEffect } from 'react';
import { GraphNode } from '@/types/graph';
import { getNodeColor } from '@/utils/nodeColors';
import { useTheme } from '@/context/ThemeContext';

const QUICK_LABELS = ['depends on', 'relates to', 'see also', 'built on', 'uses', 'improves', 'pairs well with', 'requires'];

interface AddEdgeModalProps {
  nodes: GraphNode[];
  onAdd: (source: string, target: string, label: string) => void;
  onClose: () => void;
}

export default function AddEdgeModal({ nodes, onAdd, onClose }: AddEdgeModalProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [source, setSource] = useState('');
  const [target, setTarget] = useState('');
  const [label, setLabel] = useState('');

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!source || !target || !label.trim() || source === target) return;
    onAdd(source, target, label.trim());
    onClose();
  };

  const canSubmit = source && target && label.trim() && source !== target;
  const sourceNode = nodes.find(n => n.id === source);
  const targetNode = nodes.find(n => n.id === target);

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
        className="relative w-full max-w-110 rounded-3xl overflow-hidden animate-scale-in"
        style={{
          background: isDark
            ? 'linear-gradient(165deg, rgba(15,18,35,0.98) 0%, rgba(8,10,22,0.99) 100%)'
            : 'linear-gradient(165deg, #ffffff 0%, #f8fafc 100%)',
          border: `1px solid ${isDark ? 'rgba(139,92,246,0.12)' : 'rgba(139,92,246,0.1)'}`,
          boxShadow: isDark
            ? '0 32px 80px -12px rgba(0,0,0,0.85), 0 0 0 1px rgba(139,92,246,0.06), inset 0 1px 0 rgba(255,255,255,0.04)'
            : '0 32px 80px -12px rgba(0,0,0,0.2), 0 0 0 1px rgba(139,92,246,0.08), 0 0 60px -20px rgba(139,92,246,0.12)',
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

        {/* Gradient accent bar */}
        <div
          className="absolute top-0 left-0 right-0 h-0.75"
          style={{ background: 'linear-gradient(90deg, #8b5cf6, #6366f1, #06b6d4)' }}
        />

        {/* Header */}
        <div className="relative px-7 pt-7 pb-5 overflow-hidden">
          {/* Ambient glows */}
          <div
            className="absolute -top-12 -left-12 w-48 h-48 rounded-full pointer-events-none"
            style={{ background: `radial-gradient(circle, rgba(139,92,246,${isDark ? '0.1' : '0.06'}) 0%, transparent 70%)`, filter: 'blur(30px)' }}
          />
          <div
            className="absolute -top-8 right-16 w-32 h-32 rounded-full pointer-events-none"
            style={{ background: `radial-gradient(circle, rgba(6,182,212,${isDark ? '0.06' : '0.04'}) 0%, transparent 70%)`, filter: 'blur(25px)' }}
          />

          <div className="relative flex items-center gap-4">
            <div
              className="w-13 h-13 rounded-2xl flex items-center justify-center shrink-0"
              style={{
                background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                boxShadow: '0 8px 28px rgba(139,92,246,0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
              }}
            >
              <svg className="w-5.5 h-5.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                New Connection
              </h2>
              <p className="text-[13px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                Link two topics with a relationship
              </p>
            </div>
          </div>

          {/* Live connection preview */}
          {(sourceNode || targetNode) && (
            <div
              className="relative flex items-center justify-between mt-5 px-4 py-3.5 rounded-2xl"
              style={{
                background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(99,102,241,0.03)',
                border: `1px solid ${isDark ? 'rgba(99,102,241,0.1)' : 'rgba(99,102,241,0.08)'}`,
              }}
            >
              <NodePreview node={sourceNode} placeholder="Source" isDark={isDark} />

              <div className="flex-1 flex flex-col items-center gap-1.5 px-3">
                {/* Animated connection line */}
                <div className="relative w-full h-[2px] overflow-hidden rounded-full">
                  <div
                    className="absolute inset-0"
                    style={{
                      background: `linear-gradient(90deg, ${sourceNode ? getNodeColor(sourceNode.id).bg : 'rgba(139,92,246,0.3)'}, rgba(139,92,246,0.6), ${targetNode ? getNodeColor(targetNode.id).bg : 'rgba(99,102,241,0.3)'})`,
                    }}
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%)',
                      backgroundSize: '60% 100%',
                      animation: 'shimmer 2s linear infinite',
                    }}
                  />
                </div>
                {label && (
                  <span
                    className="text-[10px] font-bold rounded-full px-2.5 py-0.5 transition-all"
                    style={{
                      background: isDark ? 'rgba(139,92,246,0.12)' : 'rgba(139,92,246,0.08)',
                      color: isDark ? '#c4b5fd' : '#7c3aed',
                      border: `1px solid ${isDark ? 'rgba(139,92,246,0.2)' : 'rgba(139,92,246,0.15)'}`,
                    }}
                  >
                    {label}
                  </span>
                )}
                <svg className="w-3.5 h-3.5" style={{ color: isDark ? 'rgba(139,92,246,0.5)' : 'rgba(99,102,241,0.4)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>

              <NodePreview node={targetNode} placeholder="Target" isDark={isDark} />
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="mx-7" style={{ height: 1, background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }} />

        {/* Fields */}
        <div className="px-7 py-6 space-y-5">
          <NodeSelect label="From" value={source} onChange={setSource} nodes={nodes} exclude={target} placeholder="Select source node..." isDark={isDark} dotColor="#8b5cf6" />
          <NodeSelect label="To" value={target} onChange={setTarget} nodes={nodes} exclude={source} placeholder="Select target node..." isDark={isDark} dotColor="#6366f1" />

          {/* Relationship */}
          <div>
            <label className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.08em] mb-2" style={{ color: 'var(--text-muted)' }}>
              <div className="w-1 h-1 rounded-full" style={{ background: '#06b6d4' }} />
              Relationship
              <span className="text-red-400/80 text-[10px]">required</span>
            </label>
            <input
              className="input-dark"
              value={label}
              onChange={e => setLabel(e.target.value)}
              placeholder='e.g. "depends on", "built with"...'
              style={{ fontSize: 14, padding: '11px 16px', borderRadius: 14 }}
            />
            <div className="flex flex-wrap gap-1.5 mt-3">
              {QUICK_LABELS.map(q => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setLabel(q)}
                  className="rounded-full px-3 py-1.5 text-[11px] font-semibold transition-all duration-200 hover:scale-[1.04] active:scale-95"
                  style={{
                    background: label === q
                      ? (isDark ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.08)')
                      : (isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'),
                    border: `1px solid ${label === q
                      ? (isDark ? 'rgba(99,102,241,0.35)' : 'rgba(99,102,241,0.25)')
                      : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)')}`,
                    color: label === q ? 'var(--text-accent)' : 'var(--text-muted)',
                  }}
                >
                  {q}
                </button>
              ))}
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
              disabled={!canSubmit}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold text-white transition-all duration-200 hover:scale-[1.03] active:scale-95 disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:scale-100"
              style={{
                background: canSubmit
                  ? 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 50%, #4f46e5 100%)'
                  : isDark ? 'rgba(139,92,246,0.2)' : 'rgba(139,92,246,0.15)',
                boxShadow: canSubmit
                  ? '0 6px 24px rgba(139,92,246,0.45), inset 0 1px 0 rgba(255,255,255,0.15)'
                  : 'none',
              }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              Create Edge
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

/* ── Sub-components ─────────────────────────────────────── */

function NodePreview({ node, placeholder, isDark }: { node?: GraphNode; placeholder: string; isDark: boolean }) {
  if (!node) return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center"
        style={{
          background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
          border: `1.5px dashed ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
        }}
      >
        <span style={{ color: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)', fontSize: 16, fontWeight: 700 }}>?</span>
      </div>
      <span className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>{placeholder}</span>
    </div>
  );
  const color = getNodeColor(node.id);
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center text-white text-sm font-black"
        style={{
          background: `linear-gradient(135deg, ${color.bg} 0%, ${color.bg}cc 100%)`,
          boxShadow: `0 4px 14px ${color.glow}`,
        }}
      >
        {node.title.charAt(0).toUpperCase()}
      </div>
      <span className="text-[10px] font-bold max-w-16 text-center truncate" style={{ color: 'var(--text-secondary)' }}>
        {node.title}
      </span>
    </div>
  );
}

interface NodeSelectProps {
  label: string; value: string; onChange: (v: string) => void;
  nodes: GraphNode[]; exclude: string; placeholder: string;
  isDark: boolean; dotColor: string;
}

function NodeSelect({ label, value, onChange, nodes, exclude, placeholder, isDark, dotColor }: NodeSelectProps) {
  const selectedNode = nodes.find(n => n.id === value);
  const color = selectedNode ? getNodeColor(selectedNode.id) : null;
  return (
    <div>
      <label className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.08em] mb-2" style={{ color: 'var(--text-muted)' }}>
        <div className="w-1 h-1 rounded-full" style={{ background: dotColor }} />
        {label}
        <span className="text-red-400/80 text-[10px]">required</span>
      </label>
      <div className="flex items-center gap-3">
        {selectedNode && color ? (
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-black shrink-0 transition-all duration-300"
            style={{
              background: `linear-gradient(135deg, ${color.bg} 0%, ${color.bg}cc 100%)`,
              boxShadow: `0 4px 12px ${color.glow}`,
            }}
          >
            {selectedNode.title.charAt(0).toUpperCase()}
          </div>
        ) : (
          <div
            className="w-9 h-9 rounded-xl shrink-0 flex items-center justify-center"
            style={{
              background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
              border: `1.5px dashed ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
            }}
          >
            <svg className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)', opacity: 0.5 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="12" cy="12" r="3" />
            </svg>
          </div>
        )}
        <div className="relative flex-1">
          <select
            className="input-dark appearance-none pr-10 cursor-pointer"
            value={value}
            onChange={e => onChange(e.target.value)}
            style={{ fontSize: 14, padding: '10px 16px', borderRadius: 14, color: value ? 'var(--text-primary)' : 'var(--text-muted)' }}
          >
            <option value="" style={{ background: 'var(--bg-primary)', color: 'var(--text-muted)' }}>{placeholder}</option>
            {nodes.filter(n => n.id !== exclude).map(n => (
              <option key={n.id} value={n.id} style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>{n.title}</option>
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
  );
}
