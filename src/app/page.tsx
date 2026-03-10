"use client";

import { useState, useCallback, useRef, useMemo, useEffect } from "react";
import dynamic from "next/dynamic";
import { useGraphStore } from "@/store/useGraphStore";
import { useTheme } from "@/context/ThemeContext";
import NodeDetailPanel from "@/components/NodeDetailPanel";
import AddNodeModal from "@/components/AddNodeModal";
import AddEdgeModal from "@/components/AddEdgeModal";
import Toolbar from "@/components/Toolbar";
import ZoomControls from "@/components/ZoomControls";
import GraphStats from "@/components/GraphStats";
import CommandPalette from "@/components/CommandPalette";
import type { Action } from "@/components/CommandPalette";
import type { LayoutMode } from "@/components/Toolbar";
import type { CytoscapeGraphRef } from "@/components/CytoscapeGraph";

const CytoscapeGraph = dynamic(
  () => import("@/components/CytoscapeGraph"),
  { ssr: false }
);

export default function Home() {
  const {
    nodes,
    edges,
    initialized,
    selectedNodeId,
    selectedNode,
    lastSaved,
    canUndo,
    canRedo,
    setSelectedNodeId,
    addNode,
    updateNode,
    deleteNode,
    addEdge,
    deleteEdge,
    updateNodePosition,
    undo,
    redo,
    exportJSON,
    importJSON,
  } = useGraphStore();

  const { theme } = useTheme();
  const [showAddNode, setShowAddNode] = useState(false);
  const [showAddEdge, setShowAddEdge] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('dagre-lr');
  const graphRef = useRef<CytoscapeGraphRef>(null);

  const handleLayoutChange = useCallback((mode: LayoutMode) => {
    setLayoutMode(mode);
    graphRef.current?.applyLayout(mode);
  }, []);

  const handleNodeSelect = useCallback(
    (id: string | null) => setSelectedNodeId(id),
    [setSelectedNodeId]
  );

  const handlePositionChange = useCallback(
    (id: string, x: number, y: number) => updateNodePosition(id, x, y),
    [updateNodePosition]
  );

  const handleSearch = useCallback((query: string) => {
    graphRef.current?.highlightSearch(query);
  }, []);

  const graphData = useMemo(() => ({ nodes, edges }), [nodes, edges]);

  // ── Keyboard shortcuts ──────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isCtrl = e.ctrlKey || e.metaKey;
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT';

      if (isCtrl && e.key === 'k') {
        e.preventDefault();
        setShowCommandPalette(p => !p);
        return;
      }

      if (isInput) return;

      if (isCtrl && e.key === 'n') {
        e.preventDefault();
        setShowAddNode(true);
      } else if (isCtrl && e.key === 'e') {
        e.preventDefault();
        setShowAddEdge(true);
      } else if (isCtrl && e.key === 'f') {
        e.preventDefault();
        setShowCommandPalette(true);
      } else if (isCtrl && e.shiftKey && e.key === 'Z') {
        e.preventDefault();
        redo();
      } else if (isCtrl && e.key === 'z') {
        e.preventDefault();
        undo();
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedNodeId) {
          deleteNode(selectedNodeId);
          setSelectedNodeId(null);
        }
      } else if (e.key === 'Escape') {
        setSelectedNodeId(null);
        setShowCommandPalette(false);
      } else if (e.key === '=' && isCtrl) {
        e.preventDefault();
        graphRef.current?.zoomIn();
      } else if (e.key === '-' && isCtrl) {
        e.preventDefault();
        graphRef.current?.zoomOut();
      } else if (e.key === '0' && isCtrl) {
        e.preventDefault();
        graphRef.current?.fitToCenter();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selectedNodeId, deleteNode, setSelectedNodeId, undo, redo]);

  // ── Command palette actions ─────────────────────────────
  const commandActions: Action[] = useMemo(() => [
    { id: 'add-node', label: 'Add New Node', shortcut: 'Ctrl+N', icon: '+', section: 'Actions', action: () => { setShowAddNode(true); setShowCommandPalette(false); } },
    { id: 'add-edge', label: 'Add New Edge', shortcut: 'Ctrl+E', icon: '~', section: 'Actions', action: () => { setShowAddEdge(true); setShowCommandPalette(false); } },
    { id: 'undo', label: 'Undo', shortcut: 'Ctrl+Z', icon: '↩', section: 'Actions', action: () => { undo(); setShowCommandPalette(false); } },
    { id: 'redo', label: 'Redo', shortcut: 'Ctrl+Shift+Z', icon: '↪', section: 'Actions', action: () => { redo(); setShowCommandPalette(false); } },
    { id: 'fit', label: 'Fit to Screen', shortcut: 'Ctrl+0', icon: '⊡', section: 'View', action: () => { graphRef.current?.fitToCenter(); setShowCommandPalette(false); } },
    { id: 'zoom-in', label: 'Zoom In', shortcut: 'Ctrl+=', icon: '+', section: 'View', action: () => { graphRef.current?.zoomIn(); setShowCommandPalette(false); } },
    { id: 'zoom-out', label: 'Zoom Out', shortcut: 'Ctrl+-', icon: '-', section: 'View', action: () => { graphRef.current?.zoomOut(); setShowCommandPalette(false); } },
    { id: 'export-png', label: 'Export as PNG', icon: '📷', section: 'Export', action: () => { graphRef.current?.exportPNG(); setShowCommandPalette(false); } },
    { id: 'export-json', label: 'Export as JSON', icon: '📄', section: 'Export', action: () => { exportJSON(); setShowCommandPalette(false); } },
    { id: 'layout-dagre', label: 'Layout: Directed (L→R)', icon: '→', section: 'Layout', action: () => { handleLayoutChange('dagre-lr'); setShowCommandPalette(false); } },
    { id: 'layout-circle', label: 'Layout: Circle', icon: '⭕', section: 'Layout', action: () => { handleLayoutChange('circle'); setShowCommandPalette(false); } },
    { id: 'layout-grid', label: 'Layout: Grid', icon: '⊞', section: 'Layout', action: () => { handleLayoutChange('grid'); setShowCommandPalette(false); } },
    { id: 'layout-radial', label: 'Layout: Radial', icon: '◎', section: 'Layout', action: () => { handleLayoutChange('concentric'); setShowCommandPalette(false); } },
  ], [undo, redo, exportJSON, handleLayoutChange]);

  // ── Loading screen ─────────────────────────────────────
  if (!initialized) {
    return (
      <div
        className="flex items-center justify-center h-screen"
        style={{ background: 'var(--bg-primary)' }}
      >
        <div className="flex flex-col items-center gap-5">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              boxShadow: '0 8px 32px rgba(99,102,241,0.5)',
              animation: 'float 2s ease-in-out infinite',
            }}
          >
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="6" cy="6" r="2" /><circle cx="18" cy="6" r="2" />
              <circle cx="6" cy="18" r="2" /><circle cx="18" cy="18" r="2" />
              <path strokeLinecap="round" d="M8 6h8M6 8v8M18 8v8M8 18h8" />
            </svg>
          </div>
          <div className="text-center">
            <div className="text-white font-bold text-lg">Knowledge Graph</div>
            <div className="flex items-center justify-center gap-2 mt-2" style={{ color: 'rgba(148,163,184,0.6)' }}>
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden" style={{ background: 'var(--bg-primary)' }}>

      {/* ── Full-screen graph canvas ─────────────────── */}
      <div className="relative flex-1 h-full">
        <CytoscapeGraph
          ref={graphRef}
          data={graphData}
          onNodeSelect={handleNodeSelect}
          selectedNodeId={selectedNodeId}
          onNodePositionChange={handlePositionChange}
          layoutMode={layoutMode}
          theme={theme}
        />

        <Toolbar
          onAddNode={() => setShowAddNode(true)}
          onAddEdge={() => setShowAddEdge(true)}
          onFitToCenter={() => graphRef.current?.fitToCenter()}
          onLayoutChange={handleLayoutChange}
          currentLayout={layoutMode}
          nodeCount={nodes.length}
          edgeCount={edges.length}
          onSearch={handleSearch}
          onExportPNG={() => graphRef.current?.exportPNG()}
          onExportJSON={exportJSON}
          onImportJSON={importJSON}
          onUndo={undo}
          onRedo={redo}
          canUndo={canUndo}
          canRedo={canRedo}
          onOpenCommandPalette={() => setShowCommandPalette(true)}
        />

        <ZoomControls
          onZoomIn={() => graphRef.current?.zoomIn()}
          onZoomOut={() => graphRef.current?.zoomOut()}
          onFit={() => graphRef.current?.fitToCenter()}
        />

        <GraphStats nodes={nodes} edges={edges} lastSaved={lastSaved} />
      </div>

      {/* ── Detail panel ─────────────────────────────── */}
      {selectedNode && (
        <div className="w-100 shrink-0 h-full relative z-10">
          <NodeDetailPanel
            node={selectedNode}
            edges={edges}
            allNodes={nodes}
            onUpdate={updateNode}
            onDelete={(id) => { deleteNode(id); setSelectedNodeId(null); }}
            onDeleteEdge={deleteEdge}
            onClose={() => setSelectedNodeId(null)}
            onSelectNode={(id) => setSelectedNodeId(id)}
          />
        </div>
      )}

      {/* ── Modals ───────────────────────────────────── */}
      {showAddNode && (
        <AddNodeModal
          onAdd={(title, note, createdBy) => {
            addNode(title, note, createdBy);
            setShowAddNode(false);
          }}
          onClose={() => setShowAddNode(false)}
        />
      )}

      {showAddEdge && (
        <AddEdgeModal
          nodes={nodes}
          onAdd={(source, target, label) => {
            addEdge(source, target, label);
            setShowAddEdge(false);
          }}
          onClose={() => setShowAddEdge(false)}
        />
      )}

      {/* ── Command Palette ──────────────────────────── */}
      {showCommandPalette && (
        <CommandPalette
          onClose={() => setShowCommandPalette(false)}
          actions={commandActions}
          nodes={nodes}
          onSelectNode={(id) => { setSelectedNodeId(id); setShowCommandPalette(false); }}
        />
      )}
    </div>
  );
}
