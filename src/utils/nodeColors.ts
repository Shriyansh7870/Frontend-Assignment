export const NODE_PALETTE = [
  { bg: '#6366f1', glow: 'rgba(99,102,241,0.75)',  ring: '#6366f1' },
  { bg: '#8b5cf6', glow: 'rgba(139,92,246,0.75)',  ring: '#8b5cf6' },
  { bg: '#ec4899', glow: 'rgba(236,72,153,0.75)',  ring: '#ec4899' },
  { bg: '#f43f5e', glow: 'rgba(244,63,94,0.75)',   ring: '#f43f5e' },
  { bg: '#f97316', glow: 'rgba(249,115,22,0.75)',  ring: '#f97316' },
  { bg: '#eab308', glow: 'rgba(234,179,8,0.75)',   ring: '#eab308' },
  { bg: '#22c55e', glow: 'rgba(34,197,94,0.75)',   ring: '#22c55e' },
  { bg: '#06b6d4', glow: 'rgba(6,182,212,0.75)',   ring: '#06b6d4' },
  { bg: '#3b82f6', glow: 'rgba(59,130,246,0.75)',  ring: '#3b82f6' },
  { bg: '#a855f7', glow: 'rgba(168,85,247,0.75)',  ring: '#a855f7' },
];

export function getNodeColorIndex(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = ((hash << 5) - hash) + id.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % NODE_PALETTE.length;
}

export function getNodeColor(id: string) {
  return NODE_PALETTE[getNodeColorIndex(id)];
}
