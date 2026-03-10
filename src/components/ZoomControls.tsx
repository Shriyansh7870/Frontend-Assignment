'use client';

import { useTheme } from '@/context/ThemeContext';

interface ZoomControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFit: () => void;
}

export default function ZoomControls({ onZoomIn, onZoomOut, onFit }: ZoomControlsProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const btnStyle = {
    background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
    border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
    color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)',
  };

  return (
    <div
      className="absolute bottom-5 right-5 z-20 flex flex-col gap-1 rounded-xl p-1 pointer-events-auto glass animate-fade-in"
    >
      <button
        onClick={onZoomIn}
        className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
        style={btnStyle}
        title="Zoom in (Ctrl +)"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      </button>
      <button
        onClick={onZoomOut}
        className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
        style={btnStyle}
        title="Zoom out (Ctrl -)"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
        </svg>
      </button>
      <div className="w-full my-0.5" style={{ height: 1, background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }} />
      <button
        onClick={onFit}
        className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
        style={btnStyle}
        title="Fit to screen"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
        </svg>
      </button>
    </div>
  );
}
