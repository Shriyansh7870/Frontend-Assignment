"use client";

import { useState, useEffect } from "react";
import { GraphNode, GraphEdge } from "@/types/graph";
import { teamMembers } from "@/data/seed";

const avatarColors: Record<string, string> = {
  Nancy: "#6366f1",
  Raushan: "#ec4899",
  Golu: "#f97316",
  Abhikesh: "#22c55e",
  Sourav: "#06b6d4",
};

interface NodeDetailPanelProps {
  node: GraphNode;
  edges: GraphEdge[];
  allNodes: GraphNode[];
  onUpdate: (id: string, updates: Partial<Pick<GraphNode, "title" | "note" | "createdBy">>) => void;
  onDelete: (id: string) => void;
  onDeleteEdge: (id: string) => void;
  onClose: () => void;
}

export default function NodeDetailPanel({
  node,
  edges,
  allNodes,
  onUpdate,
  onDelete,
  onDeleteEdge,
  onClose,
}: NodeDetailPanelProps) {
  const [title, setTitle] = useState(node.title);
  const [note, setNote] = useState(node.note);

  useEffect(() => {
    setTitle(node.title);
    setNote(node.note);
  }, [node]);

  const handleTitleBlur = () => {
    if (title.trim() && title !== node.title) {
      onUpdate(node.id, { title: title.trim() });
    }
  };

  const handleNoteBlur = () => {
    if (note !== node.note) {
      onUpdate(node.id, { note });
    }
  };

  const connectedEdges = edges.filter(
    (e) => e.source === node.id || e.target === node.id
  );

  const getNodeTitle = (id: string) =>
    allNodes.find((n) => n.id === id)?.title ?? id;

  const userColor = avatarColors[node.createdBy] || "#6366f1";

  return (
    <div className="w-[340px] bg-white border-l border-gray-200 flex flex-col h-full overflow-hidden animate-slide-in shadow-[-4px_0_20px_rgba(0,0,0,0.04)]">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
            <span className="text-indigo-600 font-bold text-sm">
              {node.title.charAt(0)}
            </span>
          </div>
          <h2 className="text-sm font-semibold text-gray-900">Details</h2>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
        {/* Created By */}
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
            Created By
          </label>
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
              style={{ backgroundColor: userColor }}
            >
              {node.createdBy.charAt(0)}
            </div>
            <select
              value={node.createdBy}
              onChange={(e) => onUpdate(node.id, { createdBy: e.target.value })}
              className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all appearance-none"
            >
              {teamMembers.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleTitleBlur}
            onKeyDown={(e) => {
              if (e.key === "Enter") e.currentTarget.blur();
            }}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-gray-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
          />
        </div>

        {/* Note */}
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
            Note
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onBlur={handleNoteBlur}
            rows={4}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-gray-700 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all resize-none"
          />
        </div>

        {/* Connected Edges */}
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Connections ({connectedEdges.length})
          </label>
          {connectedEdges.length === 0 ? (
            <p className="text-gray-400 text-sm py-3 text-center bg-gray-50 rounded-xl">
              No connections yet
            </p>
          ) : (
            <div className="space-y-1.5">
              {connectedEdges.map((edge) => {
                const isSource = edge.source === node.id;
                const otherNode = isSource
                  ? getNodeTitle(edge.target)
                  : getNodeTitle(edge.source);
                return (
                  <div
                    key={edge.id}
                    className="flex items-center justify-between bg-gray-50 hover:bg-gray-100 rounded-xl px-3 py-2.5 group transition-colors"
                  >
                    <div className="text-sm text-gray-600 truncate flex-1">
                      <span className="font-semibold text-gray-800">
                        {isSource ? node.title : otherNode}
                      </span>
                      <span className="text-gray-400 mx-1.5 text-xs italic">
                        {edge.label}
                      </span>
                      <span className="font-semibold text-gray-800">
                        {isSource ? otherNode : node.title}
                      </span>
                    </div>
                    <button
                      onClick={() => onDeleteEdge(edge.id)}
                      className="text-gray-300 hover:text-red-500 transition-all ml-2 opacity-0 group-hover:opacity-100"
                      title="Delete edge"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Delete */}
      <div className="px-5 py-4 border-t border-gray-100">
        <button
          onClick={() => onDelete(node.id)}
          className="w-full bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all active:scale-[0.98]"
        >
          Delete Node
        </button>
      </div>
    </div>
  );
}
