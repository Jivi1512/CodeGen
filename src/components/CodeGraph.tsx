import React, { useState } from 'react';
import { Layers, AlertTriangle, CheckCircle, HelpCircle, GitCommit, FileText } from 'lucide-react';

interface Node {
  id: string;
  name: string;
  type: 'component' | 'context' | 'view' | 'utils';
  desc: string;
  x: number;
  y: number;
  imports: number;
  imported: number;
}

interface CodeGraphProps {
  isResolved: boolean;
  onSelectNode: (fileName: string) => void;
  onResolve: () => void;
}

export default function CodeGraph({ isResolved, onSelectNode, onResolve }: CodeGraphProps) {
  // Absolute base coordinates matching the layout of Image 2
  const [nodes, setNodes] = useState<Node[]>([
    { id: 'App.tsx', name: 'App.tsx', type: 'component', desc: 'Imports: 1 | Imported: 4', x: 280, y: 80, imports: 1, imported: 4 },
    { id: 'Layout.tsx', name: 'Layout.tsx', type: 'component', desc: 'Functional Component', x: 460, y: 130, imports: 2, imported: 1 },
    { id: 'Dashboard.tsx', name: 'Dashboard.tsx', type: 'view', desc: 'Views analytics stats layout', x: 560, y: 180, imports: 3, imported: 1 },
    { id: 'Map.tsx', name: 'Map.tsx', type: 'component', desc: 'Active Focus: circular link optimized', x: 440, y: 240, imports: 4, imported: 2 },
    { id: 'AuthContext.tsx', name: 'AuthContext.tsx', type: 'context', desc: 'Global Store Provider', x: 280, y: 380, imports: 1, imported: 3 },
    { id: 'Utils.tsx', name: 'Utils.tsx', type: 'utils', desc: 'Geometry & Math helpers', x: 140, y: 220, imports: 2, imported: 2 }
  ]);

  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handlePointerDown = (id: string, e: React.PointerEvent) => {
    e.preventDefault();
    setDraggedNode(id);
    const node = nodes.find(n => n.id === id);
    if (node) {
      setDragStart({ x: e.clientX - node.x, y: e.clientY - node.y });
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (draggedNode) {
      const updatedX = Math.max(20, Math.min(800, e.clientX - dragStart.x));
      const updatedY = Math.max(20, Math.min(500, e.clientY - dragStart.y));
      setNodes(prev => prev.map(n => n.id === draggedNode ? { ...n, x: updatedX, y: updatedY } : n));
    }
  };

  const handlePointerUp = () => {
    setDraggedNode(null);
  };

  // Build curved connection path between nodes
  const getCurvePath = (fromId: string, toId: string, curvature = 0.2) => {
    const fromNode = nodes.find(n => n.id === fromId);
    const toNode = nodes.find(n => n.id === toId);
    if (!fromNode || !toNode) return '';

    const x1 = fromNode.x + 85; // midpoints
    const y1 = fromNode.y + 35;
    const x2 = toNode.x + 85;
    const y2 = toNode.y + 35;

    const dx = x2 - x1;
    const dy = y2 - y1;
    
    // Control point for quadratic curve
    const cx = (x1 + x2) / 2 - dy * curvature;
    const cy = (y1 + y2) / 2 + dx * curvature;

    return `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`;
  };

  return (
    <div 
      className="relative w-full h-[540px] bg-[#0c0d12]/95 rounded-2xl border border-white/5 overflow-hidden select-none"
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {/* Visual Canvas Graticule Background Grid */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20 z-0">
        <defs>
          <pattern id="dot-grid" width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.2" fill="#8892b0" />
          </pattern>
          {/* Node gradients */}
          <linearGradient id="glow-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#ec4899" stopOpacity="0.1" />
          </linearGradient>
          {/* Markers */}
          <marker id="arrow-direct" viewBox="0 0 10 10" refX="15" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#8b5cf6" />
          </marker>
          <marker id="arrow-prop" viewBox="0 0 10 10" refX="15" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#06b6d4" />
          </marker>
          <marker id="arrow-store" viewBox="0 0 10 10" refX="15" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#f59e0b" />
          </marker>
          <marker id="arrow-circ" viewBox="0 0 10 10" refX="15" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#ef4444" />
          </marker>
          <marker id="arrow-green" viewBox="0 0 10 10" refX="15" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#10b981" />
          </marker>
        </defs>
        <rect width="100%" height="100%" fill="url(#dot-grid)" />
      </svg>

      {/* SVG Connections/Curves */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
        {/* Direct Imports (App.tsx -> Layout.tsx, Layout.tsx -> Map.tsx) */}
        <path d={getCurvePath('App.tsx', 'Layout.tsx', 0.1)} fill="none" stroke="#8b5cf6" strokeWidth="2" markerEnd="url(#arrow-direct)" opacity="0.8" />
        <path d={getCurvePath('Layout.tsx', 'Map.tsx', -0.15)} fill="none" stroke="#8b5cf6" strokeWidth="2" markerEnd="url(#arrow-direct)" opacity="0.8" />
        
        {/* Prop Drilling (Layout.tsx -> Dashboard.tsx) */}
        <path d={getCurvePath('Layout.tsx', 'Dashboard.tsx', 0.15)} fill="none" stroke="#06b6d4" strokeWidth="2" markerEnd="url(#arrow-prop)" opacity="0.8" />
        
        {/* Context Store Imports (AuthContext.tsx -> Dashboard.tsx, AuthContext.tsx -> Map.tsx) */}
        <path d={getCurvePath('AuthContext.tsx', 'Dashboard.tsx', -0.25)} fill="none" stroke="#f59e0b" strokeWidth="2" markerEnd="url(#arrow-store)" opacity="0.7" />
        <path d={getCurvePath('AuthContext.tsx', 'Map.tsx', 0.2)} fill="none" stroke="#f59e0b" strokeWidth="2" markerEnd="url(#arrow-store)" opacity="0.7" />

        {/* Circular Dependency Links: Map.tsx -> Utils.tsx -> Map.tsx */}
        {isResolved ? (
          <>
            {/* Green optimized lines when resolved */}
            <path d={getCurvePath('Map.tsx', 'Utils.tsx', -0.25)} fill="none" stroke="#10b981" strokeWidth="2" markerEnd="url(#arrow-green)" opacity="0.9" />
            <path d={getCurvePath('Utils.tsx', 'Map.tsx', 0.15)} fill="none" stroke="#10b981" strokeWidth="1.5" markerEnd="url(#arrow-green)" opacity="0.7" />
          </>
        ) : (
          <>
            {/* Pulsing red dotted lines when circular error exists */}
            <path 
              d={getCurvePath('Map.tsx', 'Utils.tsx', -0.25)} 
              fill="none" 
              stroke="#ef4444" 
              strokeWidth="2.5" 
              strokeDasharray="5,5" 
              className="animate-pulse" 
              markerEnd="url(#arrow-circ)" 
              opacity="1" 
            />
            <path 
              d={getCurvePath('Utils.tsx', 'Map.tsx', 0.15)} 
              fill="none" 
              stroke="#ef4444" 
              strokeWidth="2.5" 
              strokeDasharray="5,5" 
              className="animate-pulse" 
              markerEnd="url(#arrow-circ)" 
              opacity="1" 
            />
          </>
        )}
      </svg>

      {/* Dynamic Draggable Node Cards */}
      <div className="absolute inset-0 z-20 pointer-events-none">
        {nodes.map((node) => {
          const isTargeted = node.id === 'Map.tsx';
          const hasError = isTargeted && !isResolved;
          
          return (
            <div
              key={node.id}
              style={{ left: `${node.x}px`, top: `${node.y}px` }}
              onPointerDown={(e) => handlePointerDown(node.id, e)}
              onClick={() => onSelectNode(node.id)}
              className={`absolute cursor-grab active:cursor-grabbing pointer-events-auto w-[180px] p-3 rounded-xl border select-none transition-shadow ${
                hasError
                  ? 'bg-red-950/45 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)] text-red-100'
                  : isResolved && isTargeted
                  ? 'bg-emerald-950/40 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.15)] text-emerald-100'
                  : 'bg-slate-900/90 hover:bg-slate-800/95 border-white/10 hover:border-purple-500/30 text-slate-100 shadow-lg'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono opacity-50 uppercase tracking-widest">
                  {node.type === 'component' ? 'Component' : node.type === 'context' ? 'Context' : node.type === 'view' ? 'View' : 'Utility'}
                </span>
                {node.id === 'Map.tsx' ? (
                  !isResolved ? (
                    <AlertTriangle className="w-3.5 h-3.5 text-red-400 animate-pulse" />
                  ) : (
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  )
                ) : (
                  <FileText className="w-3 h-3 text-slate-500" />
                )}
              </div>
              <h4 className="text-xs font-bold font-mono truncate">{node.name}</h4>
              <p className="text-[10px] text-slate-400 mt-1 font-mono truncate">
                {node.id === 'Map.tsx' ? (
                  !isResolved ? '⚠️ Circular cycle found!' : '✓ Interfaces optimized'
                ) : (
                  node.desc
                )}
              </p>
              
              {/* Handles indicators visually representing imports ports */}
              <div className="flex justify-between items-center mt-2.5 pt-1.5 border-t border-white/5 text-[9px] font-mono text-slate-500">
                <span>In: {node.imported}</span>
                <span>Out: {node.imports}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ARCHITECTURE LEGEND Box at Bottom Left */}
      <div className="absolute bottom-4 left-4 z-30 p-3 bg-slate-950/90 border border-white/5 rounded-xl text-[10px] text-slate-400 space-y-2 pointer-events-auto backdrop-blur-md">
        <h5 className="font-bold uppercase tracking-wider text-[9px] text-slate-500 font-mono">Architecture Legend</h5>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 px-0.5">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-4 rounded bg-[#8b5cf6]" />
            <span>Direct Import</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-4 rounded bg-[#06b6d4]" />
            <span>Prop Drilling</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-4 rounded bg-[#f59e0b]" />
            <span>Control/Store</span>
          </div>
          <div className="flex items-center gap-2">
            {isResolved ? (
              <>
                <span className="h-1.5 w-4 rounded bg-[#10b981]" />
                <span className="text-emerald-400 font-medium">Optimized Import</span>
              </>
            ) : (
              <>
                <span className="h-1.5 w-4 rounded bg-[#ef4444] animate-pulse" />
                <span className="text-red-400 font-semibold">Circular Cycle ⚠️</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Graph Help / Notice in Header margins */}
      <div className="absolute top-4 right-4 z-30 flex items-center gap-1.5 bg-slate-950/80 px-2.5 py-1.5 rounded-lg border border-white/5 text-[10px] text-slate-400 backdrop-blur-md">
        <HelpCircle className="w-3.5 h-3.5 text-purple-400" />
        <span>Drag nodes or double-click to view source file</span>
      </div>
    </div>
  );
}
