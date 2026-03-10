'use client';

import { useState, useEffect, useCallback } from 'react';
import { GraphNode, GraphEdge } from '@/types/graph';
import { getNodeColor } from '@/utils/nodeColors';
import { teamMembers } from '@/data/seed';
import { useTheme } from '@/context/ThemeContext';

const AVATAR_COLORS: Record<string, string> = {
  Nancy: '#6366f1', Raushan: '#ec4899', Golu: '#f97316',
  Abhikesh: '#22c55e', Sourav: '#06b6d4',
};
function memberColor(name: string) { return AVATAR_COLORS[name] ?? '#6366f1'; }
function initials(name: string) { return name.slice(0, 2).toUpperCase(); }

interface Props {
  node: GraphNode;
  edges: GraphEdge[];
  allNodes: GraphNode[];
  onUpdate: (id: string, updates: Partial<Pick<GraphNode, 'title' | 'note' | 'createdBy'>>) => void;
  onDelete: (id: string) => void;
  onDeleteEdge: (id: string) => void;
  onClose: () => void;
  onSelectNode?: (id: string) => void;
}

export default function NodeDetailPanel({
  node, edges, allNodes, onUpdate, onDelete, onDeleteEdge, onClose, onSelectNode,
}: Props) {
  const [tab, setTab] = useState<'details' | 'connections'>('details');
  const [title, setTitle] = useState(node.title);
  const [note, setNote] = useState(node.note);
  const [creator, setCreator] = useState(node.createdBy);
  const [dirty, setDirty] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);

  // Reset when node changes
  useEffect(() => {
    setTitle(node.title);
    setNote(node.note);
    setCreator(node.createdBy);
    setDirty(false);
    setConfirmDelete(false);
    setTab('details');
  }, [node.id]);

  useEffect(() => {
    const changed =
      title !== node.title || note !== node.note || creator !== node.createdBy;
    setDirty(changed);
  }, [title, note, creator, node]);

  const handleSave = useCallback(() => {
    if (!title.trim()) return;
    setSaving(true);
    setTimeout(() => {
      onUpdate(node.id, { title: title.trim(), note, createdBy: creator });
      setSaving(false);
      setDirty(false);
    }, 350);
  }, [title, note, creator, node.id, onUpdate]);

  const handleDelete = () => {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    onDelete(node.id);
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(node.id).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  // Escape key closes
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const outbound = edges.filter(e => e.source === node.id);
  const inbound  = edges.filter(e => e.target === node.id);
  const totalConn = outbound.length + inbound.length;

  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const nodeColor = getNodeColor(node.id);
  const nodeInitial = node.title.charAt(0).toUpperCase();
  const memberAvatarColor = memberColor(node.createdBy);

  const getNode = (id: string) => allNodes.find(n => n.id === id);

  return (
    <div
      className="h-full flex flex-col animate-slide-in-right overflow-hidden"
      style={{
        background: isDark ? 'rgba(8, 11, 20, 0.95)' : 'rgba(255, 255, 255, 0.97)',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        borderLeft: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)'}`,
        boxShadow: isDark ? '-20px 0 60px rgba(0,0,0,0.5)' : '-10px 0 40px rgba(0,0,0,0.08)',
      }}
    >
      {/* ── Gradient Hero ─────────────────────────────── */}
      <div
        className="relative flex-shrink-0 pt-5 pb-6 px-5 overflow-hidden"
        style={{
          background: `linear-gradient(160deg, ${nodeColor.bg}28 0%, ${nodeColor.bg}10 50%, transparent 100%)`,
          borderBottom: `1px solid ${nodeColor.bg}25`,
        }}
      >
        {/* Ambient glow blob */}
        <div
          className="absolute -top-8 -right-8 w-40 h-40 rounded-full opacity-20 blur-3xl pointer-events-none"
          style={{ background: nodeColor.bg }}
        />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95"
          style={{
            background: 'var(--bg-hover)',
            border: '1px solid var(--border)',
            color: 'var(--text-muted)',
          }}
          title="Close (Esc)"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Node avatar */}
        <div className="flex items-start gap-4 mt-1">
          <div
            className="relative w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-black flex-shrink-0 shadow-2xl"
            style={{ background: `linear-gradient(135deg, ${nodeColor.bg} 0%, ${nodeColor.bg}cc 100%)`, boxShadow: `0 8px 32px ${nodeColor.glow}` }}
          >
            {nodeInitial}
            {/* Subtle shine overlay */}
            <div className="absolute inset-0 rounded-2xl" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 60%)' }} />
          </div>

          <div className="flex-1 min-w-0 pr-8">
            <h2 className="text-xl font-bold leading-tight truncate" style={{ color: 'var(--text-primary)' }} title={node.title}>
              {node.title}
            </h2>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {/* Creator badge */}
              <div
                className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
                style={{
                  background: `${memberAvatarColor}20`,
                  border: `1px solid ${memberAvatarColor}35`,
                  color: memberAvatarColor,
                }}
              >
                <div className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-white text-[8px] font-black" style={{ background: memberAvatarColor }}>
                  {node.createdBy.charAt(0)}
                </div>
                {node.createdBy}
              </div>

              {/* Connection count */}
              <div
                className="flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold"
                style={{
                  background: 'var(--bg-hover)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-secondary)',
                }}
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <circle cx="6" cy="12" r="2" /><circle cx="18" cy="6" r="2" /><circle cx="18" cy="18" r="2" />
                  <path strokeLinecap="round" d="M8 12h4m2-4.5 2 4.5-2 4.5" />
                </svg>
                {totalConn} connection{totalConn !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
        </div>

        {/* Mini stats row */}
        <div className="flex items-center gap-4 mt-4">
          <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
            <svg className="w-3.5 h-3.5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
            <span><span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{outbound.length}</span> outbound</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
            <svg className="w-3.5 h-3.5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 16l-4-4m0 0l4-4m-4 4h18" />
            </svg>
            <span><span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{inbound.length}</span> inbound</span>
          </div>
        </div>
      </div>

      {/* ── Tabs ──────────────────────────────────────── */}
      <div
        className="flex px-5 gap-1 flex-shrink-0"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        {(['details', 'connections'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="relative px-4 py-3 text-xs font-semibold uppercase tracking-wider transition-colors"
            style={{
              color: tab === t ? 'var(--text-accent)' : 'var(--text-muted)',
            }}
          >
            {t === 'connections' && totalConn > 0 && (
              <span
                className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[9px] flex items-center justify-center font-black text-white"
                style={{ background: nodeColor.bg }}
              >
                {totalConn}
              </span>
            )}
            {t.charAt(0).toUpperCase() + t.slice(1)}
            {tab === t && (
              <span
                className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t"
                style={{ background: 'linear-gradient(90deg, #6366f1, #8b5cf6)' }}
              />
            )}
          </button>
        ))}
      </div>

      {/* ── Tab content ───────────────────────────────── */}
      <div className="flex-1 overflow-y-auto" key={tab}>

        {/* DETAILS TAB */}
        {tab === 'details' && (
          <div className="p-5 space-y-5 animate-fade-in-up">
            {/* Title */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>
                Title
              </label>
              <input
                className="input-dark"
                value={title}
                onChange={e => setTitle(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') e.currentTarget.blur(); }}
                placeholder="Node title"
              />
            </div>

            {/* Note */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  Note
                </label>
                <span className="text-xs" style={{ color: 'rgba(100,116,139,0.6)' }}>
                  {note.length} chars
                </span>
              </div>
              <textarea
                className="input-dark resize-none"
                value={note}
                onChange={e => setNote(e.target.value)}
                rows={5}
                placeholder="Add a description or notes…"
                style={{ lineHeight: '1.6' }}
              />
            </div>

            {/* Created By */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>
                Created By
              </label>
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-black flex-shrink-0 shadow-lg"
                  style={{ background: memberColor(creator) }}
                >
                  {creator.charAt(0)}
                </div>
                <div className="relative flex-1">
                  <select
                    className="input-dark appearance-none pr-8"
                    value={creator}
                    onChange={e => setCreator(e.target.value)}
                    style={{ background: 'var(--bg-input)', color: 'var(--text-primary)' }}
                  >
                    {teamMembers.map(name => (
                      <option key={name} value={name} style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
                        {name}
                      </option>
                    ))}
                  </select>
                  <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none" style={{ color: 'rgba(148,163,184,0.5)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Save button (visible when dirty) */}
            <div
              className="overflow-hidden transition-all duration-300"
              style={{ maxHeight: dirty ? '72px' : '0', opacity: dirty ? 1 : 0 }}
            >
              <button
                onClick={handleSave}
                disabled={!title.trim() || saving}
                className="w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
                style={{
                  background: `linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)`,
                  boxShadow: '0 4px 20px rgba(99,102,241,0.35)',
                }}
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Saving…
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Save changes
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* CONNECTIONS TAB */}
        {tab === 'connections' && (
          <div className="p-5 space-y-5 animate-fade-in-up">
            {totalConn === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3" style={{ color: 'rgba(100,116,139,0.7)' }}>
                <svg className="w-10 h-10 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                <p className="text-sm font-medium">No connections yet</p>
                <p className="text-xs text-center" style={{ color: 'rgba(100,116,139,0.5)' }}>Use &quot;+ Edge&quot; to connect this node</p>
              </div>
            ) : (
              <>
                {/* Outbound */}
                {outbound.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.25)' }}>
                        <svg className="w-3 h-3 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </div>
                      <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Outbound · {outbound.length}</span>
                    </div>
                    <div className="space-y-2 stagger-children">
                      {outbound.map(edge => {
                        const target = getNode(edge.target);
                        const tc = target ? getNodeColor(target.id) : null;
                        return (
                          <EdgeRow
                            key={edge.id}
                            edge={edge}
                            peerNode={target}
                            peerColor={tc?.bg}
                            direction="out"
                            onDelete={() => onDeleteEdge(edge.id)}
                            onSelectNode={onSelectNode}
                          />
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Inbound */}
                {inbound.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.25)' }}>
                        <svg className="w-3 h-3 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                        </svg>
                      </div>
                      <span className="text-xs font-bold uppercase tracking-wider text-violet-400">Inbound · {inbound.length}</span>
                    </div>
                    <div className="space-y-2 stagger-children">
                      {inbound.map(edge => {
                        const source = getNode(edge.source);
                        const sc = source ? getNodeColor(source.id) : null;
                        return (
                          <EdgeRow
                            key={edge.id}
                            edge={edge}
                            peerNode={source}
                            peerColor={sc?.bg}
                            direction="in"
                            onDelete={() => onDeleteEdge(edge.id)}
                            onSelectNode={onSelectNode}
                          />
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* ── Footer ────────────────────────────────────── */}
      <div
        className="px-5 py-4 flex-shrink-0 space-y-3"
        style={{ borderTop: '1px solid var(--border)' }}
      >
        {/* Node ID row */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono truncate flex-1" style={{ color: 'var(--text-muted)' }}>
            {node.id}
          </span>
          <button
            onClick={handleCopyId}
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium transition-all active:scale-95 flex-shrink-0"
            style={{
              background: copied ? 'rgba(34,197,94,0.1)' : 'var(--bg-hover)',
              border: `1px solid ${copied ? 'rgba(34,197,94,0.3)' : 'var(--border)'}`,
              color: copied ? '#4ade80' : 'var(--text-muted)',
            }}
          >
            {copied ? (
              <><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg> Copied</>
            ) : (
              <><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg> Copy ID</>
            )}
          </button>
        </div>

        {/* Delete button */}
        <button
          onClick={handleDelete}
          onBlur={() => setConfirmDelete(false)}
          className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-all active:scale-[0.98]"
          style={{
            background: confirmDelete ? 'rgba(239,68,68,0.18)' : 'rgba(239,68,68,0.08)',
            border: `1px solid ${confirmDelete ? 'rgba(239,68,68,0.5)' : 'rgba(239,68,68,0.2)'}`,
            color: confirmDelete ? '#f87171' : 'rgba(239,68,68,0.7)',
            boxShadow: confirmDelete ? '0 0 20px rgba(239,68,68,0.15)' : 'none',
          }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          {confirmDelete ? 'Confirm delete?' : 'Delete Node'}
        </button>
      </div>
    </div>
  );
}

/* ── Edge row sub-component ────────────────────────────── */
interface EdgeRowProps {
  edge: GraphEdge;
  peerNode?: GraphNode;
  peerColor?: string;
  direction: 'in' | 'out';
  onDelete: () => void;
  onSelectNode?: (id: string) => void;
}

function EdgeRow({ edge, peerNode, peerColor, direction, onDelete, onSelectNode }: EdgeRowProps) {
  const name = peerNode?.title ?? edge[direction === 'out' ? 'target' : 'source'];
  const color = peerColor ?? '#6366f1';

  return (
    <div
      className="group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all"
      style={{
        background: 'var(--bg-hover)',
        border: '1px solid var(--border)',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-hover)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)';
      }}
    >
      {/* Peer node avatar */}
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-black flex-shrink-0 cursor-pointer hover:scale-110 transition-transform"
        style={{ background: color, boxShadow: `0 2px 8px ${color}60` }}
        onClick={() => peerNode && onSelectNode?.(peerNode.id)}
        title={peerNode ? `Jump to ${name}` : undefined}
      >
        {name.charAt(0).toUpperCase()}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div
          className="text-sm font-semibold truncate cursor-pointer transition-colors"
          style={{ color: 'var(--text-primary)' }}
          onClick={() => peerNode && onSelectNode?.(peerNode.id)}
        >
          {name}
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span
            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
            style={{
              background: direction === 'out' ? 'rgba(99,102,241,0.15)' : 'rgba(139,92,246,0.15)',
              color: direction === 'out' ? '#a5b4fc' : '#c4b5fd',
              border: `1px solid ${direction === 'out' ? 'rgba(99,102,241,0.25)' : 'rgba(139,92,246,0.25)'}`,
            }}
          >
            {direction === 'out' ? '→' : '←'} {edge.label}
          </span>
        </div>
      </div>

      {/* Delete edge button */}
      <button
        onClick={onDelete}
        className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:scale-110 active:scale-90 flex-shrink-0"
        style={{
          background: 'rgba(239,68,68,0.06)',
          border: '1px solid rgba(239,68,68,0.12)',
          color: 'rgba(239,68,68,0.65)',
        }}
        title="Remove edge"
      >
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
