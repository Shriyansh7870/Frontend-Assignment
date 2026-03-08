# Personal Knowledge Base Graph

An interactive knowledge graph viewer built with **Next.js**, **TypeScript**, and **D3.js**. Map out topics and relationships in a lightweight, browser-based canvas — like a mini Obsidian graph view.

## Live Features

### Core
- **Interactive Graph Canvas** — Force-directed layout powered by D3.js with zoom and pan
- **Node CRUD** — Add, edit, and delete topic nodes with title, note, and assigned user
- **Edge CRUD** — Create directed relationships between nodes with custom labels; delete edges from the detail panel
- **Detail Panel** — Click any node to open a sidebar with inline editing for title, note, and owner
- **Persistence** — All graph state saved to `localStorage` and restored on refresh
- **Seed Data** — Pre-populated with 8 tech topics and 9 relationships on first load

### Stretch Goals (Implemented)
- **Animations** — Smooth transitions on node selection, edge highlighting, and panel open/close
- **Connected Highlighting** — Selecting a node highlights its direct neighbors and dims everything else
- **Drag & Pin** — Drag nodes to reposition; positions persist across reloads
- **Fit to Center** — One-click button to auto-zoom and center all nodes in the viewport

### Extras
- **Team Members** — Nodes are assigned to team members (Nancy, Raushan, Golu, Abhikesh, Sourav) with colored avatar badges on the graph
- **User Badge on Nodes** — Each node displays a small badge showing who created it
- **Reassign Owner** — Change a node's owner from the detail sidebar

## Tech Stack

| Technology | Purpose |
|---|---|
| [Next.js 16](https://nextjs.org/) | React framework with App Router |
| [TypeScript](https://www.typescriptlang.org/) | Type safety |
| [D3.js v7](https://d3js.org/) | Force-directed graph rendering |
| [Tailwind CSS v4](https://tailwindcss.com/) | Styling |
| localStorage | Client-side persistence |

## Getting Started

### Prerequisites
- Node.js 18+
- npm

### Installation

```bash
git clone https://github.com/Shriyansh7870/Frontend-Assignment.git
cd Frontend-Assignment
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── app/
│   ├── page.tsx            # Main page composing all components
│   ├── layout.tsx          # Root layout with metadata
│   └── globals.css         # Tailwind + custom animations
├── components/
│   ├── ForceGraph.tsx      # D3.js force-directed graph (core)
│   ├── NodeDetailPanel.tsx # Sidebar for viewing/editing node details
│   ├── AddNodeModal.tsx    # Modal to create new nodes
│   ├── AddEdgeModal.tsx    # Modal to create new edges
│   └── Toolbar.tsx         # Top bar with stats, actions, team members
├── data/
│   └── seed.ts             # Seed data (CSV equivalent) + team members
├── store/
│   └── useGraphStore.ts    # State management + localStorage persistence
└── types/
    └── graph.ts            # TypeScript interfaces
```

## Seed Data

### Nodes
| ID | Title | Created By |
|---|---|---|
| 1 | React | Nancy |
| 2 | Next.js | Raushan |
| 3 | TypeScript | Golu |
| 4 | State Management | Abhikesh |
| 5 | Component Design | Sourav |
| 6 | Performance | Nancy |
| 7 | Testing | Raushan |
| 8 | CSS & Styling | Golu |

### Edges
| Source | Target | Label |
|---|---|---|
| Next.js | React | built on |
| React | TypeScript | pairs well with |
| React | State Management | uses |
| React | Component Design | guides |
| Next.js | Performance | improves |
| React | Testing | requires |
| React | CSS & Styling | styled with |
| State Management | Performance | impacts |
| Component Design | Performance | impacts |

## Usage

- **Add Node** — Click the "+ Node" button, fill in title, note, and select a team member
- **Add Edge** — Click the "+ Edge" button, pick source/target nodes and a relationship label
- **Edit Node** — Click a node on the graph to open the detail sidebar; edit inline
- **Delete** — Use the detail panel to delete a node or its edges
- **Drag** — Drag nodes to rearrange; positions are saved
- **Zoom** — Scroll to zoom in/out; click "Fit" to auto-center all nodes
- **Reassign** — Change who owns a node from the "Created By" dropdown in the sidebar

