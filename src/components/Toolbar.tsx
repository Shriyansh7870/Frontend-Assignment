"use client";

import { teamMembers } from "@/data/seed";

interface ToolbarProps {
  onAddNode: () => void;
  onAddEdge: () => void;
  onFitToCenter: () => void;
  nodeCount: number;
  edgeCount: number;
}

const avatarColors = ["#6366f1", "#ec4899", "#f97316", "#22c55e", "#06b6d4"];

export default function Toolbar({
  onAddNode,
  onAddEdge,
  onFitToCenter,
  nodeCount,
  edgeCount,
}: ToolbarProps) {
  return (
    <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between">
      {/* Left: Title + Stats + Actions */}
      <div className="bg-white/80 backdrop-blur-xl border border-gray-200 rounded-2xl px-5 py-3 flex items-center gap-4 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
              />
            </svg>
          </div>
          <h1 className="text-gray-900 font-bold text-sm">Knowledge Graph</h1>
        </div>

        <div className="w-px h-6 bg-gray-200" />

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-indigo-400" />
            <span className="text-gray-500 text-xs font-medium">
              {nodeCount} nodes
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-gray-300" />
            <span className="text-gray-500 text-xs font-medium">
              {edgeCount} edges
            </span>
          </div>
        </div>

        <div className="w-px h-6 bg-gray-200" />

        <div className="flex items-center gap-2">
          <button
            onClick={onAddNode}
            className="flex items-center gap-1.5 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition-all hover:shadow-md active:scale-95"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4v16m8-8H4"
              />
            </svg>
            Node
          </button>
          <button
            onClick={onAddEdge}
            className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold px-3.5 py-2 rounded-xl transition-all active:scale-95"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4v16m8-8H4"
              />
            </svg>
            Edge
          </button>
          <button
            onClick={onFitToCenter}
            className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold px-3.5 py-2 rounded-xl transition-all active:scale-95"
            title="Fit all nodes to center"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
              />
            </svg>
            Fit
          </button>
        </div>
      </div>

      {/* Right: Team Members */}
      <div className="bg-white/80 backdrop-blur-xl border border-gray-200 rounded-2xl px-4 py-3 flex items-center gap-3 shadow-sm">
        <span className="text-gray-400 text-xs font-medium">Team</span>
        <div className="flex items-center gap-2">
          {teamMembers.map((name, i) => (
            <div
              key={name}
              className="flex items-center gap-1.5 bg-gray-50 rounded-lg px-2 py-1"
            >
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold shrink-0"
                style={{
                  backgroundColor: avatarColors[i % avatarColors.length],
                }}
              >
                {name.charAt(0)}
              </div>
              <span className="text-gray-700 text-xs font-medium">{name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
