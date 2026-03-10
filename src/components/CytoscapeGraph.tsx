'use client';

import {
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
  useState,
} from 'react';
import cytoscape from 'cytoscape';
import dagre from 'cytoscape-dagre';
import { GraphData } from '@/types/graph';
import { getNodeColor } from '@/utils/nodeColors';
import type { LayoutMode } from './Toolbar';

// Register dagre layout
cytoscape.use(dagre);

export interface CytoscapeGraphRef {
  fitToCenter: () => void;
  applyLayout: (mode: LayoutMode) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  exportPNG: () => void;
  highlightSearch: (query: string) => void;
}

interface Props {
  data: GraphData;
  onNodeSelect: (id: string | null) => void;
  selectedNodeId: string | null;
  onNodePositionChange: (id: string, x: number, y: number) => void;
  layoutMode: LayoutMode;
  theme: 'dark' | 'light';
}

function toElements(data: GraphData) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const els: any[] = [];
  data.nodes.forEach(node => {
    const color = getNodeColor(node.id);
    els.push({
      group: 'nodes',
      data: { id: node.id, label: node.title, bg: color.bg, glow: color.glow, ring: color.ring },
      position: node.x != null && node.y != null
        ? { x: node.x, y: node.y }
        : { x: (Math.random() - 0.5) * 600, y: (Math.random() - 0.5) * 400 },
    });
  });
  data.edges.forEach(edge => {
    els.push({
      group: 'edges',
      data: { id: edge.id, source: edge.source, target: edge.target, label: edge.label },
    });
  });
  return els;
}

function getLayoutConfig(mode: LayoutMode) {
  const base = { animate: true, animationDuration: 700, fit: true, padding: 80 };
  switch (mode) {
    case 'circle':
      return { ...base, name: 'circle', spacingFactor: 1.8 };
    case 'grid':
      return { ...base, name: 'grid', spacingFactor: 2.0 };
    case 'concentric':
      return {
        ...base,
        name: 'concentric',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        concentric: (n: any) => n.connectedEdges().length,
        levelWidth: () => 2,
        spacingFactor: 2.0,
      };
    case 'breadthfirst-h':
      return { ...base, name: 'breadthfirst', directed: true, spacingFactor: 2.2 };
    case 'breadthfirst-v':
      return { ...base, name: 'breadthfirst', directed: true, spacingFactor: 2.2 };
    case 'random':
      return { ...base, name: 'random' };
    case 'dagre-lr':
      return {
        ...base,
        name: 'dagre',
        rankDir: 'LR',
        nodeSep: 80,
        rankSep: 180,
        edgeSep: 40,
      };
    case 'cose':
    default:
      return {
        ...base,
        name: 'cose',
        animate: false,
        nodeRepulsion: 60000,
        idealEdgeLength: 280,
        edgeElasticity: 45,
        gravity: 0.15,
        numIter: 3000,
        initialTemp: 1500,
        coolingFactor: 0.995,
        minTemp: 1.0,
        nodeDimensionsIncludeLabels: true,
      };
  }
}

// ── Floating ambient orbs ──────────────────────────────────
function AmbientOrbs({ theme }: { theme: 'dark' | 'light' }) {
  const isDark = theme === 'dark';
  const orbs = [
    { color: '#6366f1', size: 320, x: '12%', y: '25%', delay: '0s', dur: '18s' },
    { color: '#8b5cf6', size: 260, x: '78%', y: '15%', delay: '3s', dur: '22s' },
    { color: '#06b6d4', size: 200, x: '65%', y: '75%', delay: '6s', dur: '20s' },
    { color: '#ec4899', size: 180, x: '25%', y: '80%', delay: '9s', dur: '24s' },
    { color: '#f97316', size: 140, x: '50%', y: '50%', delay: '4s', dur: '26s' },
  ];
  return (
    <>
      {orbs.map((o, i) => (
        <div
          key={i}
          className="ambient-orb"
          style={{
            position: 'absolute',
            left: o.x,
            top: o.y,
            width: o.size,
            height: o.size,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${o.color}${isDark ? '12' : '0a'} 0%, transparent 70%)`,
            filter: `blur(${o.size / 3}px)`,
            animationDelay: o.delay,
            animationDuration: o.dur,
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />
      ))}
    </>
  );
}

const CytoscapeGraph = forwardRef<CytoscapeGraphRef, Props>(
  ({ data, onNodeSelect, selectedNodeId, onNodePositionChange, layoutMode, theme }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cyRef = useRef<any>(null);
    const animFrameRef = useRef<number>(0);
    const [mounted, setMounted] = useState(false);

    const applyLayout = (mode: LayoutMode) => {
      const cy = cyRef.current;
      if (!cy || cy.nodes().length === 0) return;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      cy.layout(getLayoutConfig(mode) as any).run();
    };

    useImperativeHandle(ref, () => ({
      fitToCenter: () => {
        const cy = cyRef.current;
        if (!cy) return;
        cy.animate(
          { fit: { eles: cy.elements(), padding: 80 } },
          { duration: 600 }
        );
      },
      applyLayout,
      zoomIn: () => {
        const cy = cyRef.current;
        if (!cy) return;
        cy.animate({ zoom: cy.zoom() * 1.3, center: { eles: cy.elements() } }, { duration: 300 });
      },
      zoomOut: () => {
        const cy = cyRef.current;
        if (!cy) return;
        cy.animate({ zoom: cy.zoom() / 1.3, center: { eles: cy.elements() } }, { duration: 300 });
      },
      exportPNG: () => {
        const cy = cyRef.current;
        if (!cy) return;
        const png = cy.png({ full: true, scale: 2, bg: theme === 'dark' ? '#050810' : '#f1f5f9' });
        const a = document.createElement('a');
        a.href = png;
        a.download = `knowledge-graph-${new Date().toISOString().slice(0, 10)}.png`;
        a.click();
      },
      highlightSearch: (query: string) => {
        const cy = cyRef.current;
        if (!cy) return;
        cy.elements().removeClass('search-match search-dim');
        if (!query.trim()) return;
        const q = query.toLowerCase();
        const matched = cy.nodes().filter((n: { data: (key: string) => string }) =>
          n.data('label').toLowerCase().includes(q)
        );
        if (matched.length > 0) {
          cy.elements().addClass('search-dim');
          matched.removeClass('search-dim').addClass('search-match');
          matched.connectedEdges().removeClass('search-dim');
        }
      },
    }));

    // ── Create/recreate cytoscape on data change ───────────
    useEffect(() => {
      const el = containerRef.current;
      if (!el || data.nodes.length === 0) return;

      if (cyRef.current) {
        cyRef.current.destroy();
        cyRef.current = null;
      }

      const isDark = theme === 'dark';

      const cy = cytoscape({
        container: el,
        elements: toElements(data),
        style: buildStylesheet(isDark),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        layout: getLayoutConfig(layoutMode) as any,
        userZoomingEnabled: true,
        userPanningEnabled: true,
        boxSelectionEnabled: false,
        minZoom: 0.15,
        maxZoom: 4,
        wheelSensitivity: 0.3,
      });

      cyRef.current = cy;

      requestAnimationFrame(() => {
        cy.resize();
        cy.fit(undefined, 80);
        setMounted(true);
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      cy.on('tap', (e: any) => {
        if (e.target === cy) onNodeSelect(null);
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      cy.on('tap', 'node', (e: any) => {
        onNodeSelect(e.target.id());
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      cy.on('dragfree', 'node', (e: any) => {
        const pos = e.target.position();
        onNodePositionChange(e.target.id(), pos.x, pos.y);
      });

      if (selectedNodeId) {
        applySelection(cy, selectedNodeId);
      }

      // ── Animated edge flow (dashed moving lines) ──────
      let dashOffset = 0;
      const animateEdges = () => {
        dashOffset = (dashOffset + 0.4) % 24;
        cy.edges().style('line-dash-offset', -dashOffset);
        animFrameRef.current = requestAnimationFrame(animateEdges);
      };
      animFrameRef.current = requestAnimationFrame(animateEdges);

      return () => {
        cancelAnimationFrame(animFrameRef.current);
        cy.destroy();
        cyRef.current = null;
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data, theme]);

    // ── Selection highlight ───────────────────────────────
    useEffect(() => {
      const cy = cyRef.current;
      if (!cy) return;

      cy.elements().removeClass('selected neighbor faded');

      if (selectedNodeId) {
        applySelection(cy, selectedNodeId);
      }
    }, [selectedNodeId]);

    const bgClass = theme === 'dark' ? 'graph-bg-dark' : 'graph-bg-light';

    return (
      <div
        className={`graph-canvas-wrapper ${mounted ? 'graph-mounted' : ''}`}
        style={{ width: '100%', height: '100vh', position: 'relative', overflow: 'hidden' }}
      >
        {/* Background layer */}
        <div
          className={`${bgClass} transition-colors duration-700`}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, pointerEvents: 'none' }}
        />

        {/* Animated ambient orbs */}
        <AmbientOrbs theme={theme} />

        {/* Cytoscape container */}
        <div
          ref={containerRef}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1 }}
        />
      </div>
    );
  }
);

CytoscapeGraph.displayName = 'CytoscapeGraph';
export default CytoscapeGraph;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function applySelection(cy: any, nodeId: string) {
  const node = cy.getElementById(nodeId);
  if (!node.length) return;
  const connected = node.connectedEdges();
  const neighbors = connected.connectedNodes().not(node);
  cy.elements().addClass('faded');
  node.removeClass('faded').addClass('selected');
  connected.removeClass('faded').addClass('neighbor');
  neighbors.removeClass('faded').addClass('neighbor');
}

// ── Stylesheet ────────────────────────────────────────────
function buildStylesheet(isDark: boolean) {
  const edgeColor = isDark ? 'rgba(99,102,241,0.28)' : 'rgba(99,102,241,0.35)';
  const edgeLabelColor = isDark ? 'rgba(165,180,252,0.85)' : '#4338ca';
  const edgeTextBg = isDark ? 'rgba(10,14,26,0.95)' : 'rgba(255,255,255,0.97)';
  const fadedOpacity = isDark ? 0.06 : 0.12;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return [
    // ── Default node ──────────────────────────
    {
      selector: 'node',
      style: {
        'background-color': 'data(bg)',
        'background-opacity': 0.9,
        label: 'data(label)',
        color: '#ffffff',
        'font-size': 10,
        'font-weight': 700,
        'font-family': 'Inter, system-ui, -apple-system, sans-serif',
        'text-valign': 'center',
        'text-halign': 'center',
        'text-wrap': 'wrap',
        'text-max-width': 54,
        'text-outline-color': 'data(bg)',
        'text-outline-width': 2,
        width: 58,
        height: 58,
        shape: 'ellipse',
        'border-width': 3,
        'border-color': 'data(ring)',
        'border-opacity': isDark ? 0.35 : 0.3,
        'overlay-opacity': 0,
        'transition-property': 'width, height, border-width, border-opacity, opacity, background-opacity',
        'transition-duration': '0.35s',
      },
    },
    // ── Node hover ────────────────────────────
    {
      selector: 'node:active',
      style: {
        width: 64,
        height: 64,
        'border-width': 4,
        'border-opacity': isDark ? 0.7 : 0.6,
        'background-opacity': 1,
        'overlay-opacity': 0,
      },
    },
    // ── Selected node ─────────────────────────
    {
      selector: 'node.selected',
      style: {
        width: 68,
        height: 68,
        'background-opacity': 1,
        'border-width': 4,
        'border-color': isDark ? '#a5b4fc' : '#6366f1',
        'border-opacity': 1,
        'overlay-opacity': 0,
        'font-size': 11,
        'font-weight': 800,
      },
    },
    // ── Faded nodes ───────────────────────────
    {
      selector: 'node.faded',
      style: {
        opacity: fadedOpacity,
        'transition-property': 'opacity',
        'transition-duration': '0.5s',
      },
    },
    // ── Neighbor nodes ────────────────────────
    {
      selector: 'node.neighbor',
      style: {
        opacity: 1,
        width: 62,
        height: 62,
        'background-opacity': 1,
        'border-width': 3.5,
        'border-opacity': isDark ? 0.7 : 0.6,
        'transition-property': 'opacity, width, height, border-opacity',
        'transition-duration': '0.35s',
      },
    },
    // ── Default edge ──────────────────────────
    {
      selector: 'edge',
      style: {
        width: 1.5,
        'line-color': edgeColor,
        'line-style': 'dashed',
        'line-dash-pattern': [6, 4],
        'line-dash-offset': 0,
        'line-opacity': 0.85,
        'target-arrow-color': edgeColor,
        'target-arrow-shape': 'triangle',
        'arrow-scale': 0.8,
        'curve-style': 'bezier',
        label: 'data(label)',
        'font-size': 9,
        'font-weight': 600,
        color: edgeLabelColor,
        'font-family': 'Inter, system-ui, sans-serif',
        'text-background-color': edgeTextBg,
        'text-background-opacity': 1,
        'text-background-padding': '4px',
        'text-background-shape': 'roundrectangle',
        'text-border-color': isDark ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.1)',
        'text-border-width': 1,
        'text-border-opacity': 1,
        'edge-text-rotation': 'autorotate',
        'overlay-opacity': 0,
        'transition-property': 'width, line-color, opacity, target-arrow-color',
        'transition-duration': '0.35s',
      },
    },
    // ── Neighbor edges (highlighted) ──────────
    {
      selector: 'edge.neighbor',
      style: {
        width: 2.5,
        'line-color': '#6366f1',
        'line-style': 'dashed',
        'line-dash-pattern': [8, 4],
        'line-opacity': 1,
        'target-arrow-color': '#6366f1',
        color: isDark ? '#e0e7ff' : '#3730a3',
        'font-weight': 700,
        'text-background-color': isDark ? 'rgba(30,27,75,0.97)' : 'rgba(238,242,255,0.99)',
        'text-border-color': 'rgba(99,102,241,0.3)',
        opacity: 1,
      },
    },
    // ── Faded edges ───────────────────────────
    {
      selector: 'edge.faded',
      style: {
        opacity: isDark ? 0.03 : 0.06,
        'transition-property': 'opacity',
        'transition-duration': '0.5s',
      },
    },
    // ── Search highlight ─────────────────────
    {
      selector: '.search-match',
      style: {
        'border-width': 4,
        'border-color': '#22c55e',
        'border-opacity': 1,
        opacity: 1,
        width: 68,
        height: 68,
      },
    },
    {
      selector: '.search-dim',
      style: {
        opacity: isDark ? 0.08 : 0.15,
        'transition-property': 'opacity',
        'transition-duration': '0.3s',
      },
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ] as any[];
}
