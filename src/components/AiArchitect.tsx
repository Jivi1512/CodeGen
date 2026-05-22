import React, { useState } from 'react';
import { Sparkles, AlertTriangle, CheckCircle, ArrowRight, CornerDownRight, Send, AlertCircle, RefreshCw } from 'lucide-react';

interface AiArchitectProps {
  isResolved: boolean;
  onResolve: () => void;
  onAddTerminalLog: (text: string, type: 'info' | 'success' | 'warning' | 'error' | 'input') => void;
  onSendMessage: (text: string) => void;
  chatHistory: { role: 'user' | 'model'; text: string; timestamp: string }[];
}

export default function AiArchitect({ 
  isResolved, 
  onResolve, 
  onAddTerminalLog, 
  onSendMessage, 
  chatHistory 
}: AiArchitectProps) {
  const [chatInput, setChatInput] = useState('');
  const [resolving, setResolving] = useState(false);

  const handleResolveClick = () => {
    setResolving(true);
    // Add immersive step-by-step resolution logs in bottom terminal
    onAddTerminalLog('$ npx @aigen/cli resolve-deps --file src/Map.tsx', 'input');
    setTimeout(() => {
      onAddTerminalLog('Deep analyzing dependency path: Map.tsx -> Utils.tsx -> Map.tsx...', 'info');
    }, 300);
    setTimeout(() => {
      onAddTerminalLog('Found bidirectional cycle coupling. Extracting shared geometry state...', 'info');
    }, 600);
    setTimeout(() => {
      onAddTerminalLog('✔ Refactored MapCoords interface into dedicated local Typesafe schema.', 'success');
      onAddTerminalLog('✔ Updated Map.tsx imports to utilize standalone decoupled helper variables.', 'success');
      onAddTerminalLog('✔ Dependency architecture graph fully optimized.', 'success');
      onResolve();
      setResolving(false);
    }, 1000);
  };

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    onSendMessage(chatInput);
    setChatInput('');
  };

  const codeSnippetRaw = isResolved ? `// DECUPLED INTERFACE: Clean architecture
export interface CoordinateSet {
  latitude: number;
  longitude: number;
  zoom: number;
}

// 1. Standalone Coordinate parser optimized
export function parseCoords(lat: number, lng: number): CoordinateSet {
  return {
    latitude: parseFloat(lat.toFixed(6)),
    longitude: parseFloat(lng.toFixed(6)),
    zoom: 12
  };
}` : `// CIRCULAR DEPENDENCY: Avoid direct back-reference coupling
import { renderMapLayout } from './Map';

export function parseAndPlot(raw: string) {
  // ❌ Coupling: Utils calls Map, Map calls Utils!
  return renderMapLayout(raw, {
    scale: 1.5,
    projection: "mercator"
  });
}`;

  return (
    <div className="flex flex-col h-full bg-[#0a0b0f] rounded-2xl border border-white/5 overflow-hidden text-[#ededf0] select-none text-left">
      {/* Header Banner */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#111218] border-b border-white/5">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider font-mono">AI Architect</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <span className="text-[10px] font-mono opacity-60">AI Ready</span>
        </div>
      </div>

      {/* Main Stats diagnostics */}
      <div className="p-4 space-y-4 flex-1 overflow-y-auto scrollbar-thin">
        {/* Analysis Complete block */}
        <div className="space-y-1.5 bg-[#12131b]/60 p-3.5 rounded-xl border border-white/5">
          <h4 className="text-xs font-semibold text-purple-300 flex items-center gap-1.5 font-mono">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Analysis Complete
          </h4>
          <p className="text-[11px] text-slate-400 font-sans leading-normal">
            I've deep-analyzed <strong className="text-slate-200 font-mono">42 files</strong> and <strong className="text-slate-200 font-mono">156 dependency links</strong> in the workspace.
          </p>
        </div>

        {/* Circular Dependency Warning / Resolve block */}
        {!isResolved ? (
          <div className="p-3.5 bg-red-950/20 border border-red-500/30 rounded-xl space-y-3">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5 animate-bounce" />
              <div className="space-y-1">
                <span className="text-xs font-bold text-red-300 uppercase tracking-wider font-mono block">Circular Dependency Found</span>
                <div className="flex items-center gap-1 bg-black/45 p-1 rounded font-mono text-[9.5px] text-red-200/90 leading-tight">
                  <span>Map.tsx</span>
                  <ArrowRight className="w-2.5 h-2.5 text-red-500" />
                  <span>Utils.tsx</span>
                  <ArrowRight className="w-2.5 h-2.5 text-red-500" />
                  <span>Map.tsx</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleResolveClick}
              disabled={resolving}
              className="w-full py-2 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white rounded-lg text-xs font-bold tracking-wider uppercase transition shadow-md active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-55"
            >
              {resolving ? (
                <>
                  <RefreshCw className="animate-spin w-3.5 h-3.5" /> Resolving conflicts...
                </>
              ) : (
                'Resolve Conflict'
              )}
            </button>
          </div>
        ) : (
          <div className="p-3.5 bg-emerald-950/25 border border-emerald-500/25 rounded-xl flex items-start gap-2.5 text-left">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="text-xs font-bold text-emerald-400 font-mono tracking-wider uppercase block">Cycle coupled healed</span>
              <p className="text-[10.5px] text-emerald-200/80 leading-normal">
                Bi-directional references decoupled. stand-alone interface types isolated successfully.
              </p>
            </div>
          </div>
        )}

        {/* Proposed Refactor code panel */}
        <div className="space-y-2 text-left">
          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 block">Proposed Refactor Solution</span>
          <div className="p-3 bg-black rounded-lg border border-white/5 font-mono text-[10px] overflow-auto max-h-[140px] text-slate-300">
            <pre className="whitespace-pre">{codeSnippetRaw}</pre>
          </div>
        </div>

        {/* Dynamic Chat History stream */}
        <div className="border-t border-white/5 pt-3.5 space-y-3.5 text-left">
          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 block">Workspace Message History</span>
          <div className="space-y-3 max-h-[160px] overflow-y-auto pr-1">
            {chatHistory.map((msg, index) => (
              <div 
                key={index} 
                className={`p-2.5 rounded-xl ${
                  msg.role === 'user' 
                    ? 'bg-purple-900/15 border border-purple-500/15 text-purple-100 ml-4' 
                    : 'bg-slate-900/40 border border-white/5 text-slate-300 mr-4'
                }`}
              >
                <div className="flex items-center justify-between text-[8.5px] font-mono text-slate-500 mb-1">
                  <span className="font-bold">{msg.role === 'model' ? 'Sahara AI' : 'You'}</span>
                  <span>{msg.timestamp}</span>
                </div>
                <p className="text-[11px] leading-relaxed whitespace-pre-wrap">{msg.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chat Prompt text input */}
      <form onSubmit={handleChatSubmit} className="p-3 bg-[#0d0e12] border-t border-white/5 flex gap-2">
        <input
          type="text"
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          placeholder="Ask AI about codebase..."
          className="flex-1 bg-black text-xs px-2.5 py-2 rounded-lg border border-white/10 text-slate-200 focus:outline-none focus:border-purple-500 font-sans"
        />
        <button
          type="submit"
          className="p-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition active:scale-95 cursor-pointer"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}
