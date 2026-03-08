"use client";

import { useEffect, useRef, useCallback, useImperativeHandle, forwardRef } from "react";
import * as d3 from "d3";
import { GraphNode, GraphEdge } from "@/types/graph";

export interface ForceGraphHandle {
  fitToCenter: () => void;
}

interface SimNode extends d3.SimulationNodeDatum {
  id: string;
  title: string;
  note: string;
  createdBy: string;
  fx?: number | null;
  fy?: number | null;
}

const USER_COLORS: Record<string, string> = {
  Nancy: "#6366f1",
  Raushan: "#ec4899",
  Golu: "#f97316",
  Abhikesh: "#22c55e",
  Sourav: "#06b6d4",
};

interface SimLink extends d3.SimulationLinkDatum<SimNode> {
  id: string;
  label: string;
}

interface ForceGraphProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  selectedNodeId: string | null;
  onNodeClick: (id: string) => void;
  onNodePositionChange: (id: string, x: number, y: number) => void;
}

const NODE_COLORS = [
  { bg: "#4f46e5", light: "#e0e7ff" }, // indigo
  { bg: "#7c3aed", light: "#ede9fe" }, // violet
  { bg: "#db2777", light: "#fce7f3" }, // pink
  { bg: "#dc2626", light: "#fee2e2" }, // red
  { bg: "#ea580c", light: "#ffedd5" }, // orange
  { bg: "#ca8a04", light: "#fef9c3" }, // yellow
  { bg: "#16a34a", light: "#dcfce7" }, // green
  { bg: "#0891b2", light: "#cffafe" }, // cyan
  { bg: "#2563eb", light: "#dbeafe" }, // blue
  { bg: "#9333ea", light: "#f3e8ff" }, // purple
];

function getColor(index: number) {
  return NODE_COLORS[index % NODE_COLORS.length];
}

const NODE_RADIUS = 38;

const ForceGraph = forwardRef<ForceGraphHandle, ForceGraphProps>(function ForceGraph({
  nodes,
  edges,
  selectedNodeId,
  onNodeClick,
  onNodePositionChange,
}, ref) {
  const svgRef = useRef<SVGSVGElement>(null);
  const simulationRef = useRef<d3.Simulation<SimNode, SimLink> | null>(null);
  const nodesRef = useRef<SimNode[]>([]);
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const gRef = useRef<d3.Selection<SVGGElement, unknown, null, undefined> | null>(null);

  useImperativeHandle(ref, () => ({
    fitToCenter() {
      if (!svgRef.current || !zoomRef.current || !nodesRef.current.length) return;
      const svg = d3.select(svgRef.current);
      const w = svgRef.current.clientWidth;
      const h = svgRef.current.clientHeight;
      const simNodes = nodesRef.current;

      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      simNodes.forEach((n) => {
        if (n.x != null && n.y != null) {
          minX = Math.min(minX, n.x);
          minY = Math.min(minY, n.y);
          maxX = Math.max(maxX, n.x);
          maxY = Math.max(maxY, n.y);
        }
      });

      const padding = 80;
      const bw = maxX - minX + padding * 2;
      const bh = maxY - minY + padding * 2;
      const cx = (minX + maxX) / 2;
      const cy = (minY + maxY) / 2;
      const scale = Math.min(w / bw, h / bh, 1.2);
      const tx = w / 2 - cx * scale;
      const ty = h / 2 - cy * scale;

      svg
        .transition()
        .duration(600)
        .call(
          zoomRef.current!.transform,
          d3.zoomIdentity.translate(tx, ty).scale(scale)
        );
    },
  }));

  const getConnectedNodeIds = useCallback(
    (nodeId: string | null): Set<string> => {
      if (!nodeId) return new Set();
      const connected = new Set<string>();
      connected.add(nodeId);
      edges.forEach((e) => {
        if (e.source === nodeId) connected.add(e.target);
        if (e.target === nodeId) connected.add(e.source);
      });
      return connected;
    },
    [edges]
  );

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const width = svgRef.current.clientWidth || 900;
    const height = svgRef.current.clientHeight || 600;

    const oldNodesMap = new Map<string, SimNode>();
    nodesRef.current.forEach((n) => oldNodesMap.set(n.id, n));

    const simNodes: SimNode[] = nodes.map((n) => {
      const old = oldNodesMap.get(n.id);
      return {
        id: n.id,
        title: n.title,
        note: n.note,
        createdBy: n.createdBy,
        x: n.x ?? old?.x ?? width / 2 + (Math.random() - 0.5) * 200,
        y: n.y ?? old?.y ?? height / 2 + (Math.random() - 0.5) * 200,
        fx: n.fx !== undefined ? n.fx : old?.fx ?? null,
        fy: n.fy !== undefined ? n.fy : old?.fy ?? null,
      };
    });

    const nodeMap = new Map<string, SimNode>();
    simNodes.forEach((n) => nodeMap.set(n.id, n));

    const simLinks: SimLink[] = edges
      .filter((e) => nodeMap.has(e.source) && nodeMap.has(e.target))
      .map((e) => ({
        id: e.id,
        source: nodeMap.get(e.source)!,
        target: nodeMap.get(e.target)!,
        label: e.label,
      }));

    nodesRef.current = simNodes;

    svg.selectAll("*").remove();

    const defs = svg.append("defs");

    // Arrow markers
    [
      { id: "arrow", color: "#94a3b8" },
      { id: "arrow-hl", color: "#4f46e5" },
    ].forEach(({ id, color }) => {
      defs
        .append("marker")
        .attr("id", id)
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", NODE_RADIUS / 1.5 + 14)
        .attr("refY", 0)
        .attr("markerWidth", 8)
        .attr("markerHeight", 8)
        .attr("orient", "auto")
        .append("path")
        .attr("d", "M0,-4L8,0L0,4")
        .attr("fill", color);
    });

    // Subtle grid
    const grid = defs
      .append("pattern")
      .attr("id", "grid")
      .attr("width", 30)
      .attr("height", 30)
      .attr("patternUnits", "userSpaceOnUse");
    grid
      .append("circle")
      .attr("cx", 15)
      .attr("cy", 15)
      .attr("r", 0.6)
      .attr("fill", "#e5e7eb");

    // Background
    svg.append("rect").attr("width", width).attr("height", height).attr("fill", "#f9fafb");
    svg.append("rect").attr("width", width).attr("height", height).attr("fill", "url(#grid)");

    const g = svg.append("g");
    gRef.current = g;

    // Zoom
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 3])
      .on("zoom", (event) => g.attr("transform", event.transform));
    svg.call(zoom);
    zoomRef.current = zoom;

    // ---- EDGES ----
    const linkGroup = g
      .append("g")
      .attr("class", "links")
      .selectAll("g")
      .data(simLinks, (d: unknown) => (d as SimLink).id)
      .join("g");

    // Edge lines
    linkGroup
      .append("line")
      .attr("stroke", "#94a3b8")
      .attr("stroke-width", 2)
      .attr("opacity", 0.5)
      .attr("marker-end", "url(#arrow)")
      .attr("class", "edge-line");

    // Edge label pill background
    linkGroup
      .append("rect")
      .attr("rx", 8)
      .attr("ry", 8)
      .attr("fill", "#f1f5f9")
      .attr("stroke", "#e2e8f0")
      .attr("stroke-width", 1)
      .attr("class", "edge-pill");

    // Edge label text
    linkGroup
      .append("text")
      .text((d) => d.label)
      .attr("font-size", 10)
      .attr("fill", "#64748b")
      .attr("text-anchor", "middle")
      .attr("dy", 3.5)
      .attr("font-weight", 500)
      .attr("pointer-events", "none")
      .attr("class", "edge-text");

    // ---- NODES ----
    let dragStartPos: { x: number; y: number } | null = null;

    const nodeGroup = g
      .append("g")
      .attr("class", "nodes")
      .selectAll("g")
      .data(simNodes, (d: unknown) => (d as SimNode).id)
      .join("g")
      .attr("cursor", "pointer");

    // Outer glow circle (subtle shadow ring)
    nodeGroup
      .append("circle")
      .attr("r", NODE_RADIUS + 3)
      .attr("fill", "none")
      .attr("stroke", (_d, i) => getColor(i).bg)
      .attr("stroke-width", 1)
      .attr("opacity", 0.15)
      .attr("class", "node-glow");

    // Main filled circle
    nodeGroup
      .append("circle")
      .attr("r", NODE_RADIUS)
      .attr("fill", (_d, i) => getColor(i).bg)
      .attr("class", "node-circle")
      .style("filter", "drop-shadow(0 2px 4px rgba(0,0,0,0.15))");

    // Node title (white, bold, centered)
    nodeGroup.each(function (d) {
      const g = d3.select(this);
      const title = d.title;

      // Split long titles into two lines
      if (title.length > 10 && title.includes(" ")) {
        const words = title.split(" ");
        const mid = Math.ceil(words.length / 2);
        const line1 = words.slice(0, mid).join(" ");
        const line2 = words.slice(mid).join(" ");

        g.append("text")
          .attr("text-anchor", "middle")
          .attr("dy", -3)
          .attr("font-size", 11)
          .attr("font-weight", 700)
          .attr("fill", "white")
          .attr("pointer-events", "none")
          .attr("class", "node-title")
          .text(line1);

        g.append("text")
          .attr("text-anchor", "middle")
          .attr("dy", 12)
          .attr("font-size", 11)
          .attr("font-weight", 700)
          .attr("fill", "white")
          .attr("pointer-events", "none")
          .attr("class", "node-title-2")
          .text(line2);
      } else {
        g.append("text")
          .attr("text-anchor", "middle")
          .attr("dy", 5)
          .attr("font-size", title.length > 10 ? 10 : 12)
          .attr("font-weight", 700)
          .attr("fill", "white")
          .attr("pointer-events", "none")
          .attr("class", "node-title")
          .text(title);
      }
    });

    // User avatar badge (bottom-right of node)
    const badgeG = nodeGroup.append("g")
      .attr("transform", `translate(${NODE_RADIUS * 0.6}, ${-NODE_RADIUS * 0.6})`);

    badgeG
      .append("circle")
      .attr("r", 10)
      .attr("fill", "white")
      .attr("stroke", (d) => USER_COLORS[d.createdBy] || "#94a3b8")
      .attr("stroke-width", 2);

    badgeG
      .append("text")
      .text((d) => d.createdBy.charAt(0))
      .attr("text-anchor", "middle")
      .attr("dy", 4)
      .attr("font-size", 9)
      .attr("font-weight", 700)
      .attr("fill", (d) => USER_COLORS[d.createdBy] || "#94a3b8")
      .attr("pointer-events", "none");

    // Drag
    const drag = d3
      .drag<SVGGElement, SimNode>()
      .on("start", (event, d) => {
        dragStartPos = { x: event.x, y: event.y };
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on("drag", (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on("end", (event, d) => {
        if (!event.active) simulation.alphaTarget(0);
        const dx = dragStartPos ? event.x - dragStartPos.x : 0;
        const dy = dragStartPos ? event.y - dragStartPos.y : 0;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 5) {
          onNodeClick(d.id);
        } else {
          d.fx = event.x;
          d.fy = event.y;
          onNodePositionChange(d.id, event.x, event.y);
        }
        dragStartPos = null;
      });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    nodeGroup.call(drag as any);

    // ---- SIMULATION ----
    const simulation = d3
      .forceSimulation<SimNode>(simNodes)
      .force(
        "link",
        d3.forceLink<SimNode, SimLink>(simLinks).id((d) => d.id).distance(200)
      )
      .force("charge", d3.forceManyBody().strength(-600))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide(NODE_RADIUS + 30))
      .on("tick", () => {
        // Edge lines
        g.selectAll<SVGLineElement, SimLink>(".links .edge-line")
          .attr("x1", (d) => (d.source as SimNode).x!)
          .attr("y1", (d) => (d.source as SimNode).y!)
          .attr("x2", (d) => (d.target as SimNode).x!)
          .attr("y2", (d) => (d.target as SimNode).y!);

        // Edge label pills (position + size)
        g.selectAll<SVGRectElement, SimLink>(".links .edge-pill").each(
          function (d) {
            const mx = ((d.source as SimNode).x! + (d.target as SimNode).x!) / 2;
            const my = ((d.source as SimNode).y! + (d.target as SimNode).y!) / 2;
            const textEl = (this as SVGRectElement).nextElementSibling as SVGTextElement | null;
            const tw = textEl ? textEl.getComputedTextLength() + 14 : 50;
            d3.select(this)
              .attr("x", mx - tw / 2)
              .attr("y", my - 9)
              .attr("width", tw)
              .attr("height", 18);
          }
        );

        // Edge label text
        g.selectAll<SVGTextElement, SimLink>(".links .edge-text")
          .attr("x", (d) => ((d.source as SimNode).x! + (d.target as SimNode).x!) / 2)
          .attr("y", (d) => ((d.source as SimNode).y! + (d.target as SimNode).y!) / 2);

        // Nodes
        g.selectAll<SVGGElement, SimNode>(".nodes g").attr(
          "transform",
          (d) => `translate(${d.x},${d.y})`
        );
      });

    simulationRef.current = simulation;
    return () => { simulation.stop(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, edges, onNodeClick, onNodePositionChange]);

  // ---- HIGHLIGHT ON SELECTION ----
  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    const connectedIds = getConnectedNodeIds(selectedNodeId);
    const hasSel = !!selectedNodeId;

    // Nodes
    svg.selectAll<SVGGElement, SimNode>(".nodes g").each(function (d, i) {
      const group = d3.select(this);
      const isSel = d.id === selectedNodeId;
      const isCon = connectedIds.has(d.id);
      const color = getColor(i);

      group
        .select(".node-circle")
        .transition().duration(200)
        .attr("r", isSel ? NODE_RADIUS + 4 : NODE_RADIUS)
        .attr("fill", isSel ? color.bg : color.bg);

      group
        .select(".node-glow")
        .transition().duration(200)
        .attr("r", isSel ? NODE_RADIUS + 8 : NODE_RADIUS + 3)
        .attr("stroke-width", isSel ? 3 : 1)
        .attr("opacity", isSel ? 0.4 : 0.15);

      group
        .transition().duration(200)
        .attr("opacity", hasSel ? (isCon ? 1 : 0.2) : 1);
    });

    // Edges
    svg.selectAll<SVGLineElement, SimLink>(".links .edge-line")
      .transition().duration(200)
      .attr("stroke", (d) => {
        const s = (d.source as SimNode).id, t = (d.target as SimNode).id;
        return (connectedIds.has(s) && connectedIds.has(t)) ? "#4f46e5" : "#94a3b8";
      })
      .attr("stroke-width", (d) => {
        const s = (d.source as SimNode).id, t = (d.target as SimNode).id;
        return (connectedIds.has(s) && connectedIds.has(t)) ? 3 : 2;
      })
      .attr("opacity", (d) => {
        if (!hasSel) return 0.5;
        const s = (d.source as SimNode).id, t = (d.target as SimNode).id;
        return (connectedIds.has(s) && connectedIds.has(t)) ? 0.9 : 0.08;
      })
      .attr("marker-end", (d) => {
        const s = (d.source as SimNode).id, t = (d.target as SimNode).id;
        return (connectedIds.has(s) && connectedIds.has(t)) ? "url(#arrow-hl)" : "url(#arrow)";
      });

    svg.selectAll<SVGTextElement, SimLink>(".links .edge-text")
      .transition().duration(200)
      .attr("fill", (d) => {
        const s = (d.source as SimNode).id, t = (d.target as SimNode).id;
        return (connectedIds.has(s) && connectedIds.has(t)) ? "#4f46e5" : "#64748b";
      })
      .attr("opacity", (d) => {
        if (!hasSel) return 1;
        const s = (d.source as SimNode).id, t = (d.target as SimNode).id;
        return (connectedIds.has(s) && connectedIds.has(t)) ? 1 : 0.1;
      });

    svg.selectAll<SVGRectElement, SimLink>(".links .edge-pill")
      .transition().duration(200)
      .attr("opacity", (d) => {
        if (!hasSel) return 1;
        const s = (d.source as SimNode).id, t = (d.target as SimNode).id;
        return (connectedIds.has(s) && connectedIds.has(t)) ? 1 : 0.1;
      });
  }, [selectedNodeId, getConnectedNodeIds]);

  return (
    <svg
      ref={svgRef}
      className="w-full h-full"
      style={{ background: "#f9fafb" }}
    />
  );
});

export default ForceGraph;
