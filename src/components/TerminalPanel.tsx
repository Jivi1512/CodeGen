import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Play, CheckCircle, RefreshCw, AlertCircle, Sparkles, Database } from 'lucide-react';

interface TerminalLine {
  text: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'input';
}

interface TerminalPanelProps {
  logs: TerminalLine[];
  onAddLog: (text: string, type: 'info' | 'success' | 'warning' | 'error' | 'input') => void;
  onClear: () => void;
}

export default function TerminalPanel({ logs, onAddLog, onClear }: TerminalPanelProps) {
  const [inputValue, setInputValue] = useState('');
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs]);

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const cmd = inputValue.trim().toLowerCase();
    onAddLog(`$ ${inputValue}`, 'input');
    setInputValue('');

    setTimeout(() => {
      // Evaluate custom mock/interactive CLI commands
      if (cmd === 'help') {
        onAddLog('Available commands inside this IDE sandbox:', 'info');
        onAddLog('  help       - Display list of CLI controls', 'info');
        onAddLog('  clear      - Wipe terminal log entries', 'info');
        onAddLog('  status     - Show compiler and repository indices', 'info');
        onAddLog('  run dev    - Force build & start local Vite server on port 3000', 'success');
        onAddLog('  run lint   - Verify syntax checks inside typescript modules', 'success');
        onAddLog('  git status - Report current staging tree logs', 'warning');
        onAddLog('  supabase   - Inspect tables and remote server connections', 'info');
      } else if (cmd === 'clear') {
        onClear();
      } else if (cmd === 'run dev' || cmd === 'dev') {
        onAddLog('esbuild: Compiling assets...', 'info');
        onAddLog('VITE v6.2.3  ready in 184ms', 'success');
        onAddLog('➜ Local:   http://localhost:3000/', 'success');
        onAddLog('➜ Network: http://127.0.0.1:3000/', 'success');
        onAddLog('✔ Hot Module Replacement proxy active (DISABLE_HMR=true env binded)', 'info');
      } else if (cmd === 'run lint' || cmd === 'lint') {
        onAddLog('tsc --noEmit', 'info');
        onAddLog('✔ Validation passed. 0 syntax errors or types mismatches detected.', 'success');
      } else if (cmd.startsWith('git')) {
        onAddLog('On branch main', 'info');
        onAddLog('Your branch is up to date with \'origin/main\'.', 'info');
        onAddLog('nothing to commit, working tree clean', 'success');
      } else if (cmd.startsWith('supabase')) {
        onAddLog('Supabase CLI: Connection active.', 'success');
        onAddLog('Tables matching: [glowing_files] with secure TLS connection', 'info');
        onAddLog('✔ Remote migrations are in sync with memory fallback modules.', 'success');
      } else if (cmd === 'status') {
        onAddLog('AuraCode Engine Status Info:', 'info');
        onAddLog('  - Hot Server Node: Online on Port 3000', 'success');
        onAddLog('  - Active Transpiler: esbuild loader: tsx', 'info');
        onAddLog('  - Stash Repository: Supabase Postgres connected', 'success');
      } else {
        onAddLog(`sh: command not found: ${cmd}. Type 'help' to see active IDE commands.`, 'error');
      }
    }, 100);
  };

  const handleQuickCommand = (preset: string) => {
    onAddLog(`$ ${preset}`, 'input');
    setTimeout(() => {
      if (preset === 'npm run dev') {
        onAddLog('Starting live dev servers...', 'info');
        onAddLog('esbuild: Compiling App.tsx, Layout.tsx, Map.tsx, index.css...', 'info');
        onAddLog('Vite v6.2.3 dev server bound & listening on port 3000.', 'success');
        onAddLog('✔ Preview frame fully online and responsive.', 'success');
      } else if (preset === 'npm run lint') {
        onAddLog('Running tsc --noEmit validation...', 'info');
        onAddLog('✔ Lint completed successfully. No syntax issues found.', 'success');
      } else if (preset === 'git commit -am "resolve"') {
        onAddLog('git add . && git commit -m "chore: optimize architecture imports & resolve cycles"', 'info');
        onAddLog('[main a4f8e6b] chore: optimize architecture imports & resolve cycles', 'success');
        onAddLog(' 3 files changed, 48 insertions(+), 12 deletions(-)', 'info');
      } else if (preset === 'supabase db push') {
        onAddLog('Reading local project artifacts...', 'info');
        onAddLog('Syncing with Supabase remote backend table [glowing_files]...', 'info');
        onAddLog('✔ Migration complete. Workspace files committed successfully to remote stashes.', 'success');
      }
    }, 150);
  };

  return (
    <div className="flex flex-col h-full bg-[#05060a] rounded-xl border border-white/5 overflow-hidden font-mono antialiased">
      {/* Terminal Title Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#0d0e12] border-b border-white/5 select-none">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-purple-400" />
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Integrated CLI Terminal</span>
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>

        {/* Action Macros */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => handleQuickCommand('npm run dev')}
            className="px-2 py-0.5 rounded bg-slate-900 border border-white/5 text-[9px] text-[#8b5cf6] hover:text-white hover:border-purple-500/30 transition select-none flex items-center gap-1 active:scale-95 cursor-pointer"
          >
            <Play className="w-2.5 h-2.5 fill-current" /> run dev
          </button>
          <button
            onClick={() => handleQuickCommand('npm run lint')}
            className="px-2 py-0.5 rounded bg-slate-900 border border-white/5 text-[9px] text-cyan-400 hover:text-white hover:border-cyan-500/30 transition select-none flex items-center gap-1 active:scale-95 cursor-pointer"
          >
            <CheckCircle className="w-2.5 h-2.5" /> lint
          </button>
          <button
            onClick={() => handleQuickCommand('git commit -am "resolve"')}
            className="px-2 py-0.5 rounded bg-slate-900 border border-white/5 text-[9px] text-amber-400 hover:text-white hover:border-amber-500/30 transition select-none flex items-center gap-1 active:scale-95 cursor-pointer"
          >
            <RefreshCw className="w-2.5 h-2.5" /> git commit
          </button>
          <button
            onClick={() => handleQuickCommand('supabase db push')}
            className="px-2 py-0.5 rounded bg-slate-900 border border-white/5 text-[9px] text-[#8b5cf6] hover:text-white hover:border-purple-400/30 transition select-none flex items-center gap-1 active:scale-95 cursor-pointer"
          >
            <Database className="w-2.5 h-2.5" /> db push
          </button>
          <button
            onClick={onClear}
            className="text-[9px] text-slate-500 hover:text-white transition px-1.5 py-0.5 hover:bg-slate-900 rounded"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Terminal logs list */}
      <div 
        ref={terminalRef}
        className="flex-1 p-3.5 space-y-1 overflow-y-auto max-h-[160px] text-[11px] leading-relaxed scrollbar-thin select-text text-left"
      >
        {logs.map((line, idx) => {
          let lineClass = 'text-slate-300';
          if (line.type === 'success') lineClass = 'text-emerald-400';
          if (line.type === 'warning') lineClass = 'text-amber-400';
          if (line.type === 'error') lineClass = 'text-red-400 font-semibold';
          if (line.type === 'input') lineClass = 'text-purple-300 font-semibold';

          return (
            <div key={idx} className={`${lineClass} font-mono`}>
              {line.text}
            </div>
          );
        })}
      </div>

      {/* Terminal input console */}
      <form onSubmit={handleCommandSubmit} className="flex border-t border-white/5 bg-[#090a0f]">
        <span className="pl-3.5 py-2 text-[11px] text-purple-400 font-bold select-none">$</span>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Type command ('help' to see presets, 'clear' to reset)..."
          className="flex-1 bg-transparent px-2.5 py-2 text-[11px] text-slate-200 focus:outline-none font-mono"
        />
      </form>
    </div>
  );
}
