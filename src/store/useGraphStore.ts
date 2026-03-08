import { useCallback, useEffect, useRef, useState } from "react";
import { GraphNode, GraphEdge, GraphData } from "@/types/graph";
import { seedData } from "@/data/seed";
import { v4 as uuidv4 } from "uuid";

const STORAGE_KEY = "knowledge-graph-data";

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

export function useGraphStore() {
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);
  const skipPersist = useRef(false);

  // Load on mount
  useEffect(() => {
    const stored = loadFromStorage();
    if (stored && stored.nodes.length > 0) {
      // Migrate old data that may lack createdBy
      const migratedNodes = stored.nodes.map((n, i) => ({
        ...n,
        createdBy: n.createdBy || seedData.nodes[i]?.createdBy || "Nancy",
      }));
      setNodes(migratedNodes);
      setEdges(stored.edges);
    } else {
      setNodes(seedData.nodes);
      setEdges(seedData.edges);
    }
    skipPersist.current = true;
    setInitialized(true);
  }, []);

  // Persist on change
  useEffect(() => {
    if (!initialized) return;
    if (skipPersist.current) {
      skipPersist.current = false;
      return;
    }
    saveToStorage({ nodes, edges });
  }, [nodes, edges, initialized]);

  const addNode = useCallback((title: string, note: string, createdBy: string) => {
    const newNode: GraphNode = { id: uuidv4(), title, note, createdBy };
    setNodes((prev) => [...prev, newNode]);
    return newNode;
  }, []);

  const updateNode = useCallback(
    (id: string, updates: Partial<Pick<GraphNode, "title" | "note" | "createdBy">>) => {
      setNodes((prev) =>
        prev.map((n) => (n.id === id ? { ...n, ...updates } : n))
      );
    },
    []
  );

  const deleteNode = useCallback(
    (id: string) => {
      setNodes((prev) => prev.filter((n) => n.id !== id));
      setEdges((prev) =>
        prev.filter((e) => e.source !== id && e.target !== id)
      );
      if (selectedNodeId === id) setSelectedNodeId(null);
    },
    [selectedNodeId]
  );

  const addEdge = useCallback(
    (source: string, target: string, label: string) => {
      const newEdge: GraphEdge = { id: uuidv4(), source, target, label };
      setEdges((prev) => [...prev, newEdge]);
      return newEdge;
    },
    []
  );

  const deleteEdge = useCallback((id: string) => {
    setEdges((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const updateNodePosition = useCallback(
    (id: string, x: number, y: number) => {
      setNodes((prev) =>
        prev.map((n) => (n.id === id ? { ...n, x, y, fx: x, fy: y } : n))
      );
    },
    []
  );

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || null;

  return {
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
  };
}
