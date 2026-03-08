"use client";

import { useState, useCallback, useRef } from "react";
import { useGraphStore } from "@/store/useGraphStore";
import ForceGraph, { ForceGraphHandle } from "@/components/ForceGraph";
import NodeDetailPanel from "@/components/NodeDetailPanel";
import AddNodeModal from "@/components/AddNodeModal";
import AddEdgeModal from "@/components/AddEdgeModal";
import Toolbar from "@/components/Toolbar";

export default function Home() {
  const {
    nodes,
    edges,
    initialized,
    selectedNodeId,
    selectedNode,
    setSelectedNodeId,
    addNode,
    updateNode,
    deleteNode,
    addEdge,
    deleteEdge,
    updateNodePosition,
  } = useGraphStore();

  const [showAddNode, setShowAddNode] = useState(false);
  const [showAddEdge, setShowAddEdge] = useState(false);
  const graphRef = useRef<ForceGraphHandle>(null);

  const handleNodeClick = useCallback(
    (id: string) => {
      setSelectedNodeId(selectedNodeId === id ? null : id);
    },
    [selectedNodeId, setSelectedNodeId]
  );

  const handleNodePositionChange = useCallback(
    (id: string, x: number, y: number) => {
      updateNodePosition(id, x, y);
    },
    [updateNodePosition]
  );

  if (!initialized) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
          <span className="text-gray-400 text-sm font-medium">Loading graph...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white">
      {/* Graph Canvas */}
      <div className="flex-1 relative">
        <Toolbar
          onAddNode={() => setShowAddNode(true)}
          onAddEdge={() => setShowAddEdge(true)}
          onFitToCenter={() => graphRef.current?.fitToCenter()}
          nodeCount={nodes.length}
          edgeCount={edges.length}
        />
        <ForceGraph
          ref={graphRef}
          nodes={nodes}
          edges={edges}
          selectedNodeId={selectedNodeId}
          onNodeClick={handleNodeClick}
          onNodePositionChange={handleNodePositionChange}
        />
        {/* Help hint */}
        <div className="absolute bottom-4 left-4 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl px-3 py-2 text-gray-400 text-xs font-medium">
          Click a node to view details &middot; Drag to reposition &middot;
          Scroll to zoom
        </div>
      </div>

      {/* Detail Panel */}
      {selectedNode && (
        <NodeDetailPanel
          node={selectedNode}
          edges={edges}
          allNodes={nodes}
          onUpdate={updateNode}
          onDelete={deleteNode}
          onDeleteEdge={deleteEdge}
          onClose={() => setSelectedNodeId(null)}
        />
      )}

      {/* Modals */}
      {showAddNode && (
        <AddNodeModal
          onAdd={addNode}
          onClose={() => setShowAddNode(false)}
        />
      )}
      {showAddEdge && (
        <AddEdgeModal
          nodes={nodes}
          onAdd={addEdge}
          onClose={() => setShowAddEdge(false)}
        />
      )}
    </div>
  );
}
