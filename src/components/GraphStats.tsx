'use client';

import { useMemo } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { GraphNode, GraphEdge } from '@/types/graph';

interface GraphStatsProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  lastSaved: Date | null;
}

export default function GraphStats({ nodes, edges, lastSaved }: GraphStatsProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const stats = useMemo(() => {
    const degreeMap: Record<string, number> = {};
    nodes.forEach(n => { degreeMap[n.id] = 0; });
    edges.forEach(e => {
      degreeMap[e.source] = (degreeMap[e.source] || 0) + 1;
      degreeMap[e.target] = (degreeMap[e.target] || 0) + 1;
    });

    const mostConnected = nodes.reduce<{ node: GraphNode | null; count: number }>(
      (acc, n) => (degreeMap[n.id] > acc.count ? { node: n, count: degreeMap[n.id] } : acc),
      { node: null, count: 0 }
    );

    const isolated = nodes.filter(n => degreeMap[n.id] === 0).length;
    const maxEdges = nodes.length * (nodes.length - 1) / 2;
    const density = maxEdges > 0 ? (edges.length / maxEdges * 100).toFixed(1) : '0';

    return { mostConnected, isolated, density };
  }, [nodes, edges]);

  const timeSince = useMemo(() => {
    if (!lastSaved) return null;
    const diff = Date.now() - lastSaved.getTime();
    if (diff < 3000) return 'just now';
    if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`;
    return `${Math.floor(diff / 60000)}m ago`;
  }, [lastSaved]);

  return (
    <div
      className="absolute bottom-5 left-5 z-20 flex items-center gap-3 rounded-xl px-3.5 py-2 pointer-events-auto animate-fade-in-up"
      style={{
        background: isDark ? 'rgba(8,12,22,0.9)' : 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(16px)',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
      }}
    >
      {/* Auto-save indicator */}
      {timeSince && (
        <>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#22c55e' }} />
            <span className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>
              Saved {timeSince}
            </span>
          </div>
          <div className="w-px h-4" style={{ background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }} />
        </>
      )}

      {/* Most connected */}
      {stats.mostConnected.node && (
        <>
          <div className="flex items-center gap-1.5">
            <svg className="w-3 h-3" style={{ color: '#6366f1' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="text-[11px] font-semibold" style={{ color: 'var(--text-secondary)' }}>
              Hub: {stats.mostConnected.node.title}
            </span>
            <span className="text-[10px] px-1 py-0.5 rounded" style={{
              background: isDark ? 'rgba(99,102,241,0.1)' : 'rgba(99,102,241,0.06)',
              color: 'var(--text-accent)',
            }}>
              {stats.mostConnected.count}
            </span>
          </div>
          <div className="w-px h-4" style={{ background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }} />
        </>
      )}

      {/* Density */}
      <span className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>
        Density {stats.density}%
      </span>

      {/* Isolated */}
      {stats.isolated > 0 && (
        <>
          <div className="w-px h-4" style={{ background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }} />
          <span className="text-[11px] font-medium" style={{ color: '#f97316' }}>
            {stats.isolated} isolated
          </span>
        </>
      )}

      {/* Shortcuts hint */}
      <div className="w-px h-4" style={{ background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }} />
      <span className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>
        <kbd className="px-1 py-0.5 rounded text-[9px] font-bold" style={{
          background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
        }}>
          Ctrl+K
        </kbd>
        {' '}commands
      </span>
    </div>
  );
}
