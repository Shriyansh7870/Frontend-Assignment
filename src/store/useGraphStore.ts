import { useCallback, useEffect, useRef, useState } from "react";
import { GraphNode, GraphEdge, GraphData } from "@/types/graph";
import { seedData } from "@/data/seed";
import { v4 as uuidv4 } from "uuid";

const STORAGE_KEY = "knowledge-graph-data";
const MAX_HISTORY = 30;

function loadFromStorage(): GraphData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return null;
}

function saveToStorage(data: GraphData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

interface HistoryEntry {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export function useGraphStore() {
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Undo/redo
  const historyRef = useRef<HistoryEntry[]>([]);
  const futureRef = useRef<HistoryEntry[]>([]);
  const skipHistoryRef = useRef(false);

  const pushHistory = useCallback((n: GraphNode[], e: GraphEdge[]) => {
    if (skipHistoryRef.current) return;
    historyRef.current = [...historyRef.current.slice(-MAX_HISTORY), { nodes: n, edges: e }];
    futureRef.current = [];
  }, []);

  // Load on mount
  useEffect(() => {
    const stored = loadFromStorage();
    if (stored && stored.nodes.length > 0) {
      const migratedNodes = stored.nodes.map((n, i) => ({
        ...n,
        createdBy: n.createdBy || seedData.nodes[i]?.createdBy || "Nancy",
      }));
      setNodes(migratedNodes);
      setEdges(stored.edges);
      historyRef.current = [{ nodes: migratedNodes, edges: stored.edges }];
    } else {
      setNodes(seedData.nodes);
      setEdges(seedData.edges);
      saveToStorage({ nodes: seedData.nodes, edges: seedData.edges });
      historyRef.current = [{ nodes: seedData.nodes, edges: seedData.edges }];
    }
    setInitialized(true);
  }, []);

  // Persist on change
  useEffect(() => {
    if (!initialized) return;
    saveToStorage({ nodes, edges });
    setLastSaved(new Date());
  }, [nodes, edges, initialized]);

  const addNode = useCallback((title: string, note: string, createdBy: string) => {
    const newNode: GraphNode = { id: uuidv4(), title, note, createdBy };
    setNodes((prev) => {
      pushHistory(prev, edges);
      return [...prev, newNode];
    });
    return newNode;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [edges, pushHistory]);

  const updateNode = useCallback(
    (id: string, updates: Partial<Pick<GraphNode, "title" | "note" | "createdBy">>) => {
      setNodes((prev) => {
        pushHistory(prev, edges);
        return prev.map((n) => (n.id === id ? { ...n, ...updates } : n));
      });
    },
    [edges, pushHistory]
  );

  const deleteNode = useCallback(
    (id: string) => {
      pushHistory(nodes, edges);
      setNodes((prev) => prev.filter((n) => n.id !== id));
      setEdges((prev) => prev.filter((e) => e.source !== id && e.target !== id));
      if (selectedNodeId === id) setSelectedNodeId(null);
    },
    [selectedNodeId, nodes, edges, pushHistory]
  );

  const addEdge = useCallback(
    (source: string, target: string, label: string) => {
      const newEdge: GraphEdge = { id: uuidv4(), source, target, label };
      setEdges((prev) => {
        pushHistory(nodes, prev);
        return [...prev, newEdge];
      });
      return newEdge;
    },
    [nodes, pushHistory]
  );

  const deleteEdge = useCallback((id: string) => {
    setEdges((prev) => {
      pushHistory(nodes, prev);
      return prev.filter((e) => e.id !== id);
    });
  }, [nodes, pushHistory]);

  const updateNodePosition = useCallback(
    (id: string, x: number, y: number) => {
      skipHistoryRef.current = true;
      setNodes((prev) =>
        prev.map((n) => (n.id === id ? { ...n, x, y, fx: x, fy: y } : n))
      );
      skipHistoryRef.current = false;
    },
    []
  );

  const undo = useCallback(() => {
    const history = historyRef.current;
    if (history.length <= 1) return;
    const current = history[history.length - 1];
    const prev = history[history.length - 2];
    futureRef.current = [...futureRef.current, current];
    historyRef.current = history.slice(0, -1);
    skipHistoryRef.current = true;
    setNodes(prev.nodes);
    setEdges(prev.edges);
    skipHistoryRef.current = false;
  }, []);

  const redo = useCallback(() => {
    const future = futureRef.current;
    if (future.length === 0) return;
    const next = future[future.length - 1];
    futureRef.current = future.slice(0, -1);
    historyRef.current = [...historyRef.current, next];
    skipHistoryRef.current = true;
    setNodes(next.nodes);
    setEdges(next.edges);
    skipHistoryRef.current = false;
  }, []);

  const canUndo = historyRef.current.length > 1;
  const canRedo = futureRef.current.length > 0;

  const exportJSON = useCallback(() => {
    const data = JSON.stringify({ nodes, edges }, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `knowledge-graph-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [nodes, edges]);

  const importJSON = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string) as GraphData;
        if (data.nodes && data.edges) {
          pushHistory(nodes, edges);
          setNodes(data.nodes);
          setEdges(data.edges);
        }
      } catch {
        alert("Invalid JSON file");
      }
    };
    reader.readAsText(file);
  }, [nodes, edges, pushHistory]);

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || null;

  return {
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
  };
}
