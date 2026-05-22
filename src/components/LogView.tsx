import React from 'react';
import { Terminal, Trash2, Clock, Cpu, HelpCircle, Layers } from 'lucide-react';
import { LogEntry } from '../types';

interface LogViewProps {
  logs: LogEntry[];
  onClearLogs: () => void;
}

export default function LogView({ logs, onClearLogs }: LogViewProps) {
  // Let's calculate simple summary stats for the user
  const totalTokens = logs.reduce((acc, current) => acc + (current.tokens || 0), 0);
  const avgLatency = logs.filter(l => l.latency).length 
    ? Math.round(logs.reduce((acc, current) => acc + (current.latency || 0), 0) / logs.filter(l => l.latency).length)
    : 0;

  return (
    <div id="logs-container" className="flex flex-col h-full bg-[#0a0515]/60 backdrop-blur-md rounded-xl border border-purple-500/10 overflow-hidden font-mono antialiased">
      {/* Logs Header */}
      <div id="logs-header" className="flex items-center justify-between px-4 py-2 bg-[#120721]/80 border-b border-purple-500/10">
        <div className="flex items-center gap-2">
          <Terminal id="term-icon" className="w-4 h-4 text-purple-400" />
          <span className="text-[10px] font-semibold uppercase tracking-wider text-purple-200">System Telemetry & Logs</span>
        </div>

        {/* Stats segment */}
        <div className="flex items-center gap-4 text-[10px] text-purple-300/80 mr-2">
          {totalTokens > 0 && (
            <div className="flex items-center gap-1.5 bg-purple-950/20 px-2 py-0.5 rounded border border-purple-500/10">
              <Cpu className="w-3 h-3 text-cyan-400" />
              <span>Tokens consumed: <strong className="text-white">{totalTokens}</strong></span>
            </div>
          )}
          {avgLatency > 0 && (
            <div className="flex items-center gap-1.5 bg-purple-950/20 px-2 py-0.5 rounded border border-purple-500/10">
              <Clock className="w-3 h-3 text-pink-400" />
              <span>Avg Latency: <strong className="text-white">{avgLatency}ms</strong></span>
            </div>
          )}
          <button
            id="btn-clear-logs"
            onClick={onClearLogs}
            className="p-1 rounded hover:bg-purple-950/50 text-purple-400 hover:text-white transition duration-150 active:scale-95"
            title="Wipe Logs Console"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Logs Event Stream list */}
      <div id="log-list" className="flex-1 overflow-y-auto p-3.5 space-y-2 text-xs scrollbar-thin">
        {logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-6 text-purple-400/50 space-y-1">
            <HelpCircle className="w-5 h-5 text-purple-500/30" />
            <p className="text-[11px] select-none text-center">No transactions recorded. Run a query in Prompt Studio to stream telemetry logs.</p>
          </div>
        ) : (
          logs.map((log) => {
            let typeColor = 'text-purple-400';
            let bgClass = 'bg-purple-950/5 border-purple-950/15';

            if (log.type === 'success') {
              typeColor = 'text-cyan-400';
              bgClass = 'bg-cyan-950/10 border-cyan-900/10';
            } else if (log.type === 'warn') {
              typeColor = 'text-amber-400';
              bgClass = 'bg-amber-950/10 border-amber-900/10';
            } else if (log.type === 'error') {
              typeColor = 'text-red-400';
              bgClass = 'bg-red-950/10 border-red-900/10';
            }

            return (
              <div
                id={`log-item-${log.id}`}
                key={log.id}
                className={`p-2.5 rounded-lg border flex flex-col gap-1 ${bgClass} transition-all`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] text-purple-400/60 font-mono">[{log.timestamp}]</span>
                    <span className={`text-[10px] font-bold tracking-wider uppercase ${typeColor}`}>{log.type}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-[9px] text-purple-300/50">
                    {log.latency && <span>{log.latency}ms</span>}
                    {log.tokens && <span>{log.tokens} tokens</span>}
                  </div>
                </div>
                <p className="text-[11px] text-purple-100 whitespace-pre-wrap break-all leading-normal ml-0.5 mt-0.5 font-mono">
                  {log.message}
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
