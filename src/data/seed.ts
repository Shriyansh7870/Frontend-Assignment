import { GraphData } from "@/types/graph";

export const teamMembers = ["Nancy", "Raushan", "Golu", "Abhikesh", "Sourav"];

export const seedData: GraphData = {
  nodes: [
    {
      id: "1",
      title: "React",
      note: "A JavaScript library for building user interfaces using components.",
      createdBy: "Nancy",
    },
    {
      id: "2",
      title: "Next.js",
      note: "React framework with SSR, routing, and API support built in.",
      createdBy: "Raushan",
    },
    {
      id: "3",
      title: "TypeScript",
      note: "Typed superset of JavaScript that compiles to plain JS.",
      createdBy: "Golu",
    },
    {
      id: "4",
      title: "State Management",
      note: "Patterns for managing shared application state (Context, Zustand, Redux).",
      createdBy: "Abhikesh",
    },
    {
      id: "5",
      title: "Component Design",
      note: "Principles for building reusable, composable UI components.",
      createdBy: "Sourav",
    },
    {
      id: "6",
      title: "Performance",
      note: "Techniques like memoization, lazy loading, and virtualization.",
      createdBy: "Nancy",
    },
    {
      id: "7",
      title: "Testing",
      note: "Unit, integration, and e2e testing strategies for frontend apps.",
      createdBy: "Raushan",
    },
    {
      id: "8",
      title: "CSS & Styling",
      note: "Styling approaches including Tailwind, CSS Modules, and styled-components.",
      createdBy: "Golu",
    },
  ],
  edges: [
    { id: "e1", source: "2", target: "1", label: "built on" },
    { id: "e2", source: "1", target: "3", label: "pairs well with" },
    { id: "e3", source: "1", target: "4", label: "uses" },
    { id: "e4", source: "1", target: "5", label: "guides" },
    { id: "e5", source: "2", target: "6", label: "improves" },
    { id: "e6", source: "1", target: "7", label: "requires" },
    { id: "e7", source: "1", target: "8", label: "styled with" },
    { id: "e8", source: "4", target: "6", label: "impacts" },
    { id: "e9", source: "5", target: "6", label: "impacts" },
  ],
};
