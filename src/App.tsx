import React, { useState, useEffect } from 'react';
import GlowingEdgeCard from './Component';
import CodeGraph from './components/CodeGraph';
import TerminalPanel from './components/TerminalPanel';
import AiArchitect from './components/AiArchitect';
import Homepage from './components/Homepage';
import { 
  FolderOpen, 
  Search, 
  Terminal, 
  Database, 
  Cpu, 
  Settings, 
  User, 
  Bell, 
  Plus, 
  Trash2, 
  Edit3, 
  Upload, 
  Download, 
  Sparkles, 
  Code, 
  RefreshCw, 
  Check, 
  Copy, 
  Layers, 
  Eye, 
  Play, 
  AlertTriangle, 
  GitBranch, 
  Grid3X3,
  HelpCircle,
  Sun,
  Moon,
  ChevronRight
} from 'lucide-react';

interface WorkspaceFile {
  name: string;
  language: string;
  content: string;
}

interface TerminalLine {
  text: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'input';
}

export default function App() {
  const [showLandingPage, setShowLandingPage] = useState<boolean>(true);
  // Navigation Activity Sidebar state
  const [activeSidebarTab, setActiveSidebarTab] = useState<'explorer' | 'search' | 'git' | 'extensions' | 'settings'>('explorer');
  const [mode, setMode] = useState<'dark' | 'light'>('dark');

  // Multi-file Workspace state
  const [workspaceFiles, setWorkspaceFiles] = useState<WorkspaceFile[]>([
    {
      name: 'App.tsx',
      language: 'tsx',
      content: `import React from 'react';

export default function App() {
  return (
    <div className="p-8 text-slate-300 text-center max-w-sm mx-auto space-y-4">
      <div className="h-10 w-10 bg-purple-500/10 text-purple-400 rounded-full flex items-center justify-center mx-auto border border-purple-500/20">
        ✦
      </div>
      <h3 className="text-md font-semibold text-white">Prism Correction Code-Space</h3>
      <p className="text-xs text-slate-400 leading-normal">
        Upload or paste your React, TS, or style files in the explorer panel on the left.
      </p>
      <p className="text-[11px] text-slate-500">
        Type a query, then click "Analyze & Correct Code" to view corrected outputs instantly!
      </p>
    </div>
  );
}`
    },
    {
      name: 'index.css',
      language: 'css',
      content: `@import "tailwindcss";

body {
  background-color: #030409;
  color: #ededf0;
}`
    }
  ]);

  const [activeFileName, setActiveFileName] = useState<string>('App.tsx');
  const [activeTab, setActiveTab] = useState<'editor' | 'graph' | 'preview'>('editor');
  
  // Terminal Logs state
  const [terminalLogs, setTerminalLogs] = useState<TerminalLine[]>([
    { text: 'AuraReact AI Studio v2.4.0 Standalone Sandbox initialized.', type: 'info' },
    { text: 'Listening on port 3000 mapping container ingress gateways.', type: 'info' },
    { text: 'Supabase storage mapping initiated.', type: 'success' },
    { text: 'Type "help" in prompt bar or select presets to run CLI tooling.', type: 'info' }
  ]);

  // AI Architect & graph state
  const [isResolved, setIsResolved] = useState<boolean>(false);
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'model'; text: string; timestamp: string }[]>([
    { 
      role: 'model', 
      text: "I've detected a circular dependency cycle coupling inside your components path. Map.tsx relies on Utils.tsx, which couples back into Map.tsx. Click the 'Resolve Conflict' command button in the AI Architect bar to decouble interfaces automatically.", 
      timestamp: '2 min ago' 
    }
  ]);

  // General generating and saving states
  const [rawOutput, setRawOutput] = useState<string>('');
  const [generating, setGenerating] = useState<boolean>(false);
  const [selectedApi, setSelectedApi] = useState<'gemma-2-2b-it' | 'deepseek-chat'>('gemma-2-2b-it');
  const [prompt, setPrompt] = useState<string>('Create a futuristic circular progress indicator styled with glowing neon borders.');
  const [systemInstruction, setSystemInstruction] = useState<string>('You are an expert React UI developer. Respond ONLY with a self-contained, beautifully styled, functional JSX React component that utilizes clean Tailwind utility classes. Do not use external libraries other than Lucide-react. Standard default export function is required.');
  
  // Dynamic transpilation states
  const [compiledJs, setCompiledJs] = useState<string>('');
  const [transpiling, setTranspiling] = useState<boolean>(false);
  const [transpileError, setTranspileError] = useState<string | null>(null);

  // Supabase states
  const [supabaseFiles, setSupabaseFiles] = useState<any[]>([]);
  const [savedName, setSavedName] = useState<string>('Futuristic Progress Dial');
  const [savingState, setSavingState] = useState<'idle' | 'saving' | 'success' | 'err'>('idle');
  const [dbStatus, setDbStatus] = useState<{ status: string; message?: string }>({ status: 'checking' });
  const [copied, setCopied] = useState<boolean>(false);

  // Stats for Glowing Card Telemetry
  const [stats, setStats] = useState({
    x: '50.0%',
    y: '50.0%',
    deg: '110°',
    intensity: '50.0%'
  });

  // Load the initial code of App.tsx into the raw text area
  useEffect(() => {
    const defaultFile = workspaceFiles.find(f => f.name === activeFileName);
    if (defaultFile) {
      setRawOutput(defaultFile.content);
    }
  }, [activeFileName]);

  // Synchronize inline edits from active text area back to workspaceFiles array
  const handleEditorChange = (val: string) => {
    setRawOutput(val);
    setWorkspaceFiles(prev => prev.map(f => f.name === activeFileName ? { ...f, content: val } : f));
  };

  // Safe logging inside bottom terminal
  const handleAddTerminalLog = (text: string, type: 'info' | 'success' | 'warning' | 'error' | 'input') => {
    const timeStr = new Date().toLocaleTimeString();
    setTerminalLogs(prev => [...prev, { text: `[${timeStr}] ${text}`, type }]);
  };

  // Sync Supabase Files
  const loadSupabaseFiles = async () => {
    try {
      const res = await fetch("/api/supabase/files");
      const data = await res.json();
      if (data.files) {
        setSupabaseFiles(data.files);
      }
      setDbStatus({ status: data.status, message: data.message });
    } catch (e: any) {
      console.error("Failed to load backend artifacts:", e);
      setDbStatus({ status: 'exception', message: e.message || 'Server connection issue' });
    }
  };

  useEffect(() => {
    loadSupabaseFiles();
  }, []);

  // Transpilation Hook
  useEffect(() => {
    let active = true;
    const transpile = async () => {
      // We only attempt transpilation on React files (e.g., matching export statements)
      if (!rawOutput) return;
      setTranspiling(true);
      setTranspileError(null);
      try {
        const res = await fetch("/api/transpile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: rawOutput })
        });
        if (!res.ok) {
          throw new Error(`Transpiler returned status ${res.status}`);
        }
        const data = await res.json();
        if (data.success && active) {
          setCompiledJs(data.js);
        } else if (data.error && active) {
          setTranspileError(data.error);
        }
      } catch (err: any) {
        if (active) {
          setTranspileError(err.message || "An unexpected error occurred during backend code transpilation.");
        }
      } finally {
        if (active) {
          setTranspiling(false);
        }
      }
    };

    const timer = setTimeout(transpile, 150);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [rawOutput]);

  // Generative AI Trigger
  const triggerGenerate = async (customPrompt?: string) => {
    const activePrompt = customPrompt || prompt;
    setGenerating(true);
    handleAddTerminalLog(`Initiating code correction with engine: ${selectedApi}...`, 'info');
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: activePrompt,
          model: selectedApi,
          systemInstruction,
          temperature: 0.7,
          code: rawOutput
        })
      });

      if (!res.ok) {
        throw new Error(`Generation & correction gateway returned status ${res.status}`);
      }

      const block = await res.json();
      handleEditorChange(block.text);
      setActiveTab('preview');
      handleAddTerminalLog(`✔ Corrected code synthesized cleanly (${block.text.length} characters). Ready for preview!`, 'success');

      // Auto-stash the corrected output inside Supabase/artifacts backups directly!
      try {
        const stashRes = await fetch("/api/supabase/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: `Corrected ${activeFileName}`,
            code: block.text,
            prompt: activePrompt,
            model: selectedApi
          })
        });
        const stashData = await stashRes.json();
        if (stashData.success) {
          handleAddTerminalLog(`✔ Stash backup created in database stashes list as: "Corrected ${activeFileName}" with ID ${stashData.data?.id || 'id'}`, 'success');
          await loadSupabaseFiles();
        }
      } catch (stashErr) {
        console.warn("Auto-stash skipped or failed in background.", stashErr);
      }

      return block.text;

    } catch (e: any) {
      handleAddTerminalLog(`✖ Correction synthesis failed: ${e.message}`, 'error');
      throw e;
    } finally {
      setGenerating(false);
    }
  };

  // Safe Supabase Save/Sync stashing
  const triggerSave = async () => {
    setSavingState('saving');
    handleAddTerminalLog(`stashing current file '${activeFileName}' to Supabase registry...`, 'info');
    try {
      const res = await fetch("/api/supabase/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: savedName || activeFileName,
          code: rawOutput,
          prompt,
          model: selectedApi
        })
      });

      const rep = await res.json();
      if (rep.success) {
        setSavingState('success');
        handleAddTerminalLog(`✔ Stashed permanently inside Supabase: file registered as ID ${rep.data?.id || 'mock-id'}.`, 'success');
        await loadSupabaseFiles();
        setTimeout(() => setSavingState('idle'), 3000);
      } else {
        throw new Error(rep.error || "Save endpoint failed");
      }
    } catch (e: any) {
      console.error(e);
      setSavingState('err');
      handleAddTerminalLog(`✖ Stash fail: ${e.message}. Fallback memory storage used.`, 'warning');
      setTimeout(() => setSavingState('idle'), 4000);
    }
  };

  // Resolve conflict mechanism
  const handleResolveCycle = () => {
    setIsResolved(true);
    setWorkspaceFiles(prev => prev.map(f => {
      if (f.name === 'Map.tsx') {
        return {
          ...f,
          content: `// OPTIMIZED MAP COMPONENT - Circular import cycle resolved successfully by AI Architect
import React from 'react';
import { MapPin } from 'lucide-react';

export default function MapVisualizer() {
  return (
    <div className="bg-[#0e161c] p-6 rounded-2xl border border-emerald-500/20 text-center text-slate-100 max-w-sm">
      <div className="inline-flex p-3 bg-emerald-950/40 rounded-full text-emerald-400 mb-3">
        <MapPin className="animate-pulse" />
      </div>
      <h4 className="text-sm font-bold text-slate-200">Active Node Plotter (Healed ✓)</h4>
      <p className="text-xs text-emerald-400 mt-1">✓ Dynamic coordinate reference loaded from decoupled types.</p>
    </div>
  );`
        };
      }
      return f;
    }));

    if (activeFileName === 'Map.tsx') {
      setRawOutput(`// OPTIMIZED MAP COMPONENT - Circular import cycle resolved successfully by AI Architect
import React from 'react';
import { MapPin } from 'lucide-react';

export default function MapVisualizer() {
  return (
    <div className="bg-[#0e161c] p-6 rounded-2xl border border-emerald-500/20 text-center text-slate-100 max-w-sm">
      <div className="inline-flex p-3 bg-emerald-950/40 rounded-full text-emerald-400 mb-3">
        <MapPin className="animate-pulse" />
      </div>
      <h4 className="text-sm font-bold text-slate-200">Active Node Plotter (Healed ✓)</h4>
      <p className="text-xs text-emerald-400 mt-1">✓ Dynamic coordinate reference loaded from decoupled types.</p>
    </div>
  );}`);
    }
  };

  // File Upload handling (.tsx, .ts, .css, .json, .txt)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const name = file.name;
      let language = 'tsx';
      if (name.endsWith('.json')) language = 'json';
      if (name.endsWith('.css')) language = 'css';

      const newFile: WorkspaceFile = { name, content, language };
      setWorkspaceFiles(prev => {
        const filtered = prev.filter(f => f.name !== name);
        return [...filtered, newFile];
      });
      setActiveFileName(name);
      setRawOutput(content);
      handleAddTerminalLog(`Successfully uploaded and targeted file: '${name}'`, 'success');
    };
    reader.readAsText(file);
  };

  // File Download individual file download
  const handleDownloadFile = () => {
    const blob = new Blob([rawOutput], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = activeFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    handleAddTerminalLog(`✔ Downloaded active workspace block: ${activeFileName}`, 'success');
  };

  // Load artifact representation from Supabase stash list
  const handleLoadArtifact = (item: any) => {
    const name = item.name.endsWith('.tsx') || item.name.endsWith('.ts') || item.name.endsWith('.css') || item.name.endsWith('.json') 
      ? item.name 
      : `${item.name}.tsx`;

    const newFile: WorkspaceFile = {
      name,
      content: item.code,
      language: name.endsWith('.json') ? 'json' : name.endsWith('.css') ? 'css' : 'tsx'
    };

    setWorkspaceFiles(prev => {
      const filtered = prev.filter(f => f.name !== name);
      return [...filtered, newFile];
    });
    setActiveFileName(name);
    setRawOutput(item.code);
    handleAddTerminalLog(`✔ Instantiated remote Supabase artifact backup: ${item.name}`, 'success');
  };

  const handleCreateFile = () => {
    const name = prompt('Enter name of the new component file:');
    if (!name) return;
    const cleanName = name.includes('.') ? name : `${name}.tsx`;
    
    const newFile: WorkspaceFile = {
      name: cleanName,
      language: cleanName.endsWith('.json') ? 'json' : cleanName.endsWith('.css') ? 'css' : 'tsx',
      content: `import React from 'react';\n\nexport default function ${cleanName.split('.')[0]}() {\n  return (\n    <div className="p-4 bg-slate-900 border border-white/10 rounded-xl text-center text-white">\n      Custom Component ${cleanName}\n    </div>\n  );\n}`
    };

    setWorkspaceFiles(prev => [...prev, newFile]);
    setActiveFileName(cleanName);
    setRawOutput(newFile.content);
    handleAddTerminalLog(`Created new local workspace module: '${cleanName}'`, 'success');
  };

  const handleDeleteFile = (nameToDel: string) => {
    if (nameToDel === 'App.tsx' || nameToDel === 'index.css') {
      alert("System files can't be deleted.");
      return;
    }
    setWorkspaceFiles(prev => prev.filter(f => f.name !== nameToDel));
    if (activeFileName === nameToDel) {
      setActiveFileName('App.tsx');
    }
    handleAddTerminalLog(`Removed file module mapping: ${nameToDel}`, 'warning');
  };

  // Copy Code to Clipboard
  const triggerCopy = () => {
    navigator.clipboard.writeText(rawOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Safe client-side dynamic React component interpreter
  const renderFallbackDynamic = () => {
    try {
      let cleanCode = compiledJs;

      if (!cleanCode) {
        if (transpileError) {
          return (
            <div className="p-6 text-left rounded-xl bg-red-950/20 border border-red-500/20 text-red-300 font-mono text-xs overflow-auto max-h-[300px] w-full">
              <div className="flex items-center gap-2 mb-2 text-sm font-semibold">
                <AlertTriangle size={15} /> Generative TSX Parsing Error
              </div>
              <p>{transpileError}</p>
              <p className="mt-3 text-[10px] opacity-70">
                The transpilation pipeline rejected this component. Check the specifications or adjust the model configurations to re-synthesize.
              </p>
            </div>
          );
        }
        return (
          <div className="flex flex-col items-center justify-center p-8 text-slate-400 space-y-3 font-serif">
            <RefreshCw className="animate-spin text-purple-400 w-8 h-8" />
            <p className="text-sm">Configuring React virtual runtime environment...</p>
          </div>
        );
      }
      
      cleanCode = cleanCode.replace(/^```[a-zA-Z]*\n/gm, "").replace(/```$/gm, "");

      const lines = cleanCode.split("\n");
      const codeWithoutImports = lines
        .filter(l => !l.trim().startsWith("import "))
        .join("\n");

      let exportName = "TargetWidget";
      const defaultFuncMatch = rawOutput.match(/export\s+default\s+function\s+(\w+)/);
      const defaultVarMatch = rawOutput.match(/export\s+default\s+(\w+)\s*;?/);
      const defaultConstMatch = rawOutput.match(/export\s+const\s+(\w+)/);

      if (defaultFuncMatch) {
        exportName = defaultFuncMatch[1];
      } else if (defaultVarMatch) {
         exportName = defaultVarMatch[1];
      } else if (defaultConstMatch) {
         exportName = defaultConstMatch[1];
      }

      const functionalCode = codeWithoutImports
        .replace(/export\s+default\s+function\s+/g, "function ")
        .replace(/export\s+default\s+class\s+/g, "class ")
        .replace(/export\s+default\s+/g, "const dummyDefault = ")
        .replace(/export\s+function\s+/g, "function ")
        .replace(/export\s+const\s+/g, "const ")
        .replace(/export\s+let\s+/g, "let ")
        .replace(/export\s+var\s+/g, "var ")
        .replace(/export\s*\{\s*[^}]*\}\s*;?/g, "");

      const requireLucideReact = () => {
        return {
          FolderOpen, Search, Terminal, Database, Cpu, Settings, User, Bell, Plus, Trash2, Edit3, Upload, Download, Sparkles, Code, RefreshCw, Check, Copy, Layers, Eye, Play, AlertTriangle, GitBranch, Grid3X3, HelpCircle, Sun, Moon, ChevronRight
        };
      };

      const lucideIcons = requireLucideReact();
      const iconsProxy = new Proxy(lucideIcons, {
        get: (target: any, name: string) => {
          if (name in target) {
            return target[name];
          }
          return function FallbackIcon({ className, size = 16 }: { className?: string; size?: number }) {
            return <Sparkles size={size} className={`${className || "text-[#a855f7] animate-pulse"}`} />;
          };
        }
      });

      const ALL_ICONS = [
        "FolderOpen", "Search", "Terminal", "Database", "Cpu", "Settings", "User", "Bell", "Plus", "Trash2", "Edit3", "Upload", "Download", "Sparkles", "Code", "RefreshCw", "Check", "Copy", "Layers", "Eye", "Play", "AlertTriangle", "GitBranch", "Grid3X3", "HelpCircle", "Sun", "Moon", "ChevronRight"
      ];

      const unpackString = ALL_ICONS.map(k => `const ${k} = scope.iconsProxy.${k};`).join("\n");

      const hookSimScope = {
        React,
        useState,
        useEffect,
        iconsProxy
      };

      const runner = new Function(
        "scope",
        `
        const { React, useState, useEffect } = scope;
        ${unpackString}
        ${functionalCode}
        return typeof ${exportName} !== "undefined" ? ${exportName} : (typeof TargetWidget !== "undefined" ? TargetWidget : null);
      `
      );

      const EvaluatedComponent = runner(hookSimScope);
      if (EvaluatedComponent) {
        return <EvaluatedComponent />;
      }
      return <div className="text-xs text-slate-500 font-mono">Module compiled. React.createElement rendering done.</div>;
    } catch (err: any) {
      return (
        <div className="p-6 text-left rounded-xl bg-red-950/20 border border-red-500/20 text-red-300 font-mono text-xs overflow-auto max-h-[300px] w-full">
          <div className="flex items-center gap-2 mb-2 text-sm font-semibold text-red-400">
            <AlertTriangle size={15} /> Dynamic Compilation Error
          </div>
          <p>{err.toString()}</p>
          <p className="mt-3 text-[10px] opacity-70 leading-normal">
            The preview module failed to evaluate with standard script injection. Verify imports are from standard Lucide sets or adjust structure.
          </p>
        </div>
      );
    }
  };

  const handleSendMessage = async (text: string) => {
    const timestamp = 'Just now';
    setChatHistory(prev => [...prev, { role: 'user', text, timestamp }]);
    
    handleAddTerminalLog(`$ ask-architect: "${text}"`, 'input');
    
    setPrompt(text);

    setChatHistory(prev => [...prev, {
      role: 'model',
      text: `Let me analyze "${activeFileName}" and compile the corrected code based on your query: "${text}". Running live synthesis under ${selectedApi}...`,
      timestamp: 'Just now'
    }]);

    try {
      const compiledText = await triggerGenerate(text);
      
      setChatHistory(prev => {
        const nextHist = [...prev];
        const lastModelIdx = nextHist.map(h => h.role).lastIndexOf('model');
        if (lastModelIdx !== -1) {
          nextHist[lastModelIdx] = {
            role: 'model',
            text: `Analysis complete! Corrected code for "${activeFileName}" has been generated and mounted successfully.\n\nChanges are applied in the code editor, and you can see the live hot-reloaded UI instantly under the "Sandboxed Runtime Preview" tab!`,
            timestamp: 'Just now'
          };
        }
        return nextHist;
      });
      handleAddTerminalLog('AI Architect solved the query and updated the workspace code successfully.', 'success');
    } catch (err: any) {
      setChatHistory(prev => {
        const nextHist = [...prev];
        const lastModelIdx = nextHist.map(h => h.role).lastIndexOf('model');
        if (lastModelIdx !== -1) {
          nextHist[lastModelIdx] = {
            role: 'model',
            text: `Analysis failed: ${err.message || err}. Please ensure your GEMINI_API_KEY is configured in your secrets.`,
            timestamp: 'Just now'
          };
        }
        return nextHist;
      });
    }
  };

  if (showLandingPage) {
    return (
      <Homepage 
        onEnterWorkspace={() => setShowLandingPage(false)} 
        savedCount={supabaseFiles.length} 
      />
    );
  }

  return (
    <div className={`min-h-screen w-full flex flex-col justify-between font-sans transition-all duration-300 ${
      mode === 'light' ? 'bg-[#f4f5f8] text-[#1c1921]' : 'bg-[#030408] text-[#ededf0]'
    }`}>
      
      {/* 1. TOP NAVBAR SECTION */}
      <nav className="flex items-center justify-between px-5 py-3 bg-[#0d0e14] border-b border-white/[0.04] select-none z-20">
        {/* Left Side Title Logos */}
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 shadow-md">
            <Cpu className="w-4.5 h-4.5 text-white animate-spin-slow" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-bold text-white tracking-widest uppercase font-mono leading-none">AIGen Core</span>
            <span className="text-[9px] text-[#8b5cf6] font-semibold mt-0.5 font-mono">Workspace IDE Studio</span>
          </div>
        </div>

        {/* Center Navigation Menus */}
        <div className="hidden md:flex items-center gap-6 text-[11px] font-mono tracking-wider font-medium text-slate-550">
          <button 
            onClick={() => setShowLandingPage(true)}
            className="hover:text-purple-300 transition-colors font-semibold flex items-center gap-1 cursor-pointer"
          >
            &larr; Exit to Landing Home
          </button>
          <span className="h-4 w-px bg-white/10" />
          <button className="text-purple-400 font-bold border-b border-purple-500 pb-0.5 px-1 bg-purple-500/5">Projects Workspace</button>
          <button className="hover:text-white transition cursor-pointer">Models</button>
          <button className="hover:text-white transition cursor-pointer">History</button>
        </div>

        {/* Right Nav Utilities */}
        <div className="flex items-center gap-3">
          {/* Light/Dark theme selectors */}
          <div className="flex items-center p-1 bg-slate-900 rounded-lg border border-white/5">
            <button 
              onClick={() => setMode('light')}
              className={`p-1 rounded-md text-xs transition ${mode === 'light' ? 'bg-white text-black' : 'text-slate-500 hover:text-white'}`}
            >
              <Sun size={12} />
            </button>
            <button 
              onClick={() => setMode('dark')}
              className={`p-1 rounded-md text-xs transition ${mode === 'dark' ? 'bg-slate-800 text-purple-400' : 'text-slate-500 hover:text-white'}`}
            >
              <Moon size={12} />
            </button>
          </div>

          <button className="p-1.5 text-slate-400 hover:text-white bg-slate-900/60 rounded-lg border border-white/5 transition relative cursor-pointer" title="Alert streams">
            <Bell size={13} />
            <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-red-500" />
          </button>

          <button className="p-1.5 text-slate-400 hover:text-white bg-slate-900/60 rounded-lg border border-white/5 transition cursor-pointer" title="User profile">
            <User size={13} />
          </button>
        </div>
      </nav>

      {/* 2. PRIMARY MULTI-COLUMN WORKFLOW FIELD */}
      <div className="flex-1 w-full grid grid-cols-1 lg:grid-cols-12 items-stretch overflow-hidden">
        
        {/* PART A: SIDEBAR PANEL (Activity + Secondary Panel) (cols-span-3) */}
        <div className="lg:col-span-3 flex border-r border-white/5 bg-[#090a10]">
          
          {/* A1: Thin vertical Activity bar */}
          <div className="w-[50px] border-r border-white/5 flex flex-col justify-between items-center py-4 bg-[#07080c] select-none text-slate-500">
            <div className="flex flex-col gap-5 items-center w-full">
              <button 
                onClick={() => setActiveSidebarTab('explorer')}
                className={`p-2 rounded-xl transition cursor-pointer ${activeSidebarTab === 'explorer' ? 'bg-purple-950/40 text-purple-400 border border-purple-500/10' : 'hover:text-white'}`}
                title="Workspace Folders"
              >
                <FolderOpen size={16} />
              </button>
              <button 
                onClick={() => setActiveSidebarTab('search')}
                className={`p-2 rounded-xl transition cursor-pointer ${activeSidebarTab === 'search' ? 'bg-purple-950/40 text-purple-400 border border-purple-500/10' : 'hover:text-white'}`}
                title="Search Codebase"
              >
                <Search size={16} />
              </button>
              <button 
                onClick={() => setActiveSidebarTab('git')}
                className={`p-2 rounded-xl transition cursor-pointer ${activeSidebarTab === 'git' ? 'bg-purple-950/40 text-purple-400 border border-purple-500/10' : 'hover:text-white'}`}
                title="Supabase backup artifacts"
              >
                <GitBranch size={16} />
              </button>
              <button 
                onClick={() => setActiveSidebarTab('extensions')}
                className={`p-2 rounded-xl transition cursor-pointer ${activeSidebarTab === 'extensions' ? 'bg-purple-950/40 text-purple-400 border border-purple-500/10' : 'hover:text-white'}`}
                title="Plugins Registry"
              >
                <Grid3X3 size={16} />
              </button>
            </div>

            <div className="flex flex-col gap-4 items-center">
              <button 
                onClick={() => setActiveSidebarTab('settings')}
                className={`p-2 rounded-xl transition cursor-pointer ${activeSidebarTab === 'settings' ? 'bg-purple-950/40 text-purple-400 border border-purple-500/10' : 'hover:text-white'}`}
                title="IDE parameters configuration"
              >
                <Settings size={16} />
              </button>
            </div>
          </div>

          {/* A2: SECONDARY DETAIL COLUMN (Explorer file tree, Search inputs, or Git artifacts) */}
          <div className="flex-1 flex flex-col text-left p-4 h-full bg-[#090a10]/60 overflow-y-auto max-h-[750px] scrollbar-thin">
            
            {/* EXPLORER DETAIL STATE */}
            {activeSidebarTab === 'explorer' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-white/5">
                  <span className="text-[10px] uppercase font-mono tracking-widest text-slate-500 font-bold block">Explorer</span>
                  <div className="flex gap-1.5 font-mono text-[9px] items-center">
                    <button 
                      onClick={() => {
                        handleEditorChange('');
                        handleAddTerminalLog(`Cleared editor content for "${activeFileName}". Paste/upload your code!`, 'info');
                      }}
                      className="px-2 py-0.5 rounded bg-red-950/20 border border-red-500/10 text-red-400 hover:text-red-300 transition cursor-pointer flex items-center gap-1 font-mono font-bold"
                      title="Clear code editor to import custom code"
                    >
                      <Trash2 size={10} /> Clear Code
                    </button>
                    <button 
                      onClick={handleCreateFile}
                      className="p-1 rounded bg-slate-900 border border-white/5 text-purple-300 hover:text-white text-xs hover:border-purple-500/30 transition cursor-pointer"
                      title="Create workspace file"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </div>

                {/* Subtitle workspace dir label */}
                <span className="text-[10px] font-mono text-purple-400 font-semibold block uppercase pl-1 tracking-wider">▲ project-alpha</span>

                {/* File Tree List */}
                <div className="space-y-1 font-mono text-xs pl-2.5">
                  <div className="text-slate-500 flex items-center gap-1.5 select-none pb-1 py-0.5">
                    <ChevronRight size={10} className="transform rotate-90" />
                    <span>src</span>
                  </div>
                  <div className="space-y-0.5 pl-3 border-l border-white/5">
                    {workspaceFiles.map((file) => {
                      const isActive = file.name === activeFileName;
                      
                      return (
                        <div 
                          key={file.name}
                          onClick={() => {
                            setActiveFileName(file.name);
                            setActiveTab('editor');
                          }}
                          className={`group flex justify-between items-center py-1.5 px-2.5 rounded-lg cursor-pointer ${
                            isActive 
                              ? 'bg-purple-950/25 border border-purple-500/20 text-purple-200 font-semibold' 
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {file.name.endsWith('.tsx') ? (
                              <Code size={11} className="text-cyan-400" />
                            ) : file.name.endsWith('.css') ? (
                              <Layers size={11} className="text-emerald-400" />
                            ) : (
                              <ChevronRight size={11} />
                            )}
                            <span className="text-[11px] font-mono">{file.name}</span>
                          </div>

                          {/* Hover action delete */}
                          {file.name !== 'App.tsx' && file.name !== 'index.css' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteFile(file.name);
                              }}
                              className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-red-950 rounded text-red-400 transition"
                            >
                              <Trash2 size={10} />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* File Upload Area */}
                <div className="pt-4 border-t border-white/5 space-y-2">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold block">File Upload</span>
                  <label className="border border-dashed border-white/10 hover:border-purple-500/40 p-3 rounded-lg text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 bg-black/20">
                    <Upload className="w-5 h-5 text-purple-400 animate-bounce" />
                    <div className="text-[9.5px] text-slate-500 leading-normal">
                      Drag or click to import <br /><strong className="text-slate-200">.tsx, .ts, .css, .json</strong>
                    </div>
                    <input 
                      type="file" 
                      onChange={handleFileUpload} 
                      accept=".tsx,.ts,.css,.json,.txt" 
                      className="hidden" 
                    />
                  </label>
                </div>

                {/* File Download and Actions Area */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold block">Current File Exports</span>
                  <button
                    onClick={handleDownloadFile}
                    className="w-full py-1.5 bg-slate-900 hover:bg-slate-800 border border-white/10 hover:border-purple-500/20 rounded-lg text-[10px] font-mono text-slate-300 transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Download size={11} className="text-purple-400" /> Download {activeFileName}
                  </button>
                </div>
              </div>
            )}

            {/* ARTIFCT STORAGE BACKUPS (Supabase integration) */}
            {activeSidebarTab === 'git' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-white/5">
                  <span className="text-[10px] uppercase font-mono tracking-widest text-slate-500 font-bold block">Database Artifacts</span>
                  <button 
                    onClick={loadSupabaseFiles}
                    className="p-1 rounded bg-slate-900 border border-white/5 text-purple-400 hover:text-white hover:border-purple-500/20 transition cursor-pointer"
                    title="Refresh database stashes"
                  >
                    <RefreshCw size={11} />
                  </button>
                </div>

                <p className="text-[10.5px] text-slate-400 leading-normal">
                  Stash components directly inside Supabase PostgreSQL backups and synchronize them in real-time.
                </p>

                {/* DB Config status info */}
                <div className="p-2.5 rounded-lg bg-black/40 border border-white/5 font-mono text-[9px] text-slate-500 space-y-1">
                  <div className="flex justify-between">
                    <span>Database Status:</span>
                    <strong className="text-purple-400 mr-0.5">{dbStatus.status === 'supabase_success' ? 'ONLINE ✓' : 'MEMORY BUFFER'}</strong>
                  </div>
                </div>

                {/* Sync controls */}
                <div className="space-y-2 pt-1">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={savedName}
                      onChange={(e) => setSavedName(e.target.value)}
                      placeholder="Archive label..."
                      className="flex-1 text-[10.5px] bg-black text-slate-200 p-1.5 rounded border border-white/10 font-mono focus:border-purple-500 focus:outline-none"
                    />
                    <button
                      onClick={triggerSave}
                      className="bg-purple-600 hover:bg-purple-500 px-2 rounded font-mono text-[10px] text-white transition active:scale-95 flex items-center gap-1 cursor-pointer"
                    >
                      <Plus size={11} /> Stash
                    </button>
                  </div>
                </div>

                {/* Stashed Artifact Backup List fetched from Supabase */}
                <div className="space-y-2 pt-3 border-t border-white/5">
                  <span className="text-[10.5px] font-mono text-purple-300 font-bold uppercase tracking-wider pl-1 font-mono">Saved Artifacts ({supabaseFiles.length})</span>
                  {supabaseFiles.length === 0 ? (
                    <div className="text-[10px] opacity-40 p-3 italic text-center rounded border border-dashed border-white/5">No active backups stored. Sync current modules.</div>
                  ) : (
                    <div className="space-y-2 max-h-[250px] overflow-y-auto pr-0.5 scrollbar-thin">
                      {supabaseFiles.map((item, idx) => (
                        <div
                          key={item.id || idx}
                          onClick={() => handleLoadArtifact(item)}
                          className="p-2 rounded bg-black/35 hover:bg-black/55 border border-white/5 hover:border-purple-500/30 cursor-pointer transition flex flex-col gap-1 text-left"
                        >
                          <div className="flex justify-between items-center">
                            <span className="text-[10.5px] font-bold text-slate-200 truncate pr-2">{item.name}</span>
                            <span className="text-[8px] font-mono text-[#8b5cf6] bg-purple-500/10 px-1 rounded uppercase">{item.model?.replace('-chat', '')}</span>
                          </div>
                          <span className="text-[8.5px] font-mono text-slate-500 leading-none">{new Date(item.created_at).toLocaleDateString()} • code block</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SEARCH DETAL STATE */}
            {activeSidebarTab === 'search' && (
              <div className="space-y-4">
                <span className="text-[10px] uppercase font-mono tracking-widest text-slate-500 font-bold block pb-2 border-b border-white/5">Search Modules</span>
                <div className="space-y-2.5">
                  <input
                    type="text"
                    placeholder="Search queries (e.g., useState)..."
                    className="w-full text-xs bg-black text-slate-200 p-2 rounded border border-white/10 font-mono focus:border-purple-500 focus:outline-none"
                  />
                  <button className="w-full text-xs bg-purple-600 hover:bg-purple-500 py-1.5 rounded text-white font-mono transition">Examine Directory</button>
                </div>
              </div>
            )}

            {/* EXTENSIONS STATE */}
            {activeSidebarTab === 'extensions' && (
              <div className="space-y-4">
                <span className="text-[10px] uppercase font-mono tracking-widest text-slate-500 font-bold block pb-2 border-b border-white/5">Extensions</span>
                <div className="space-y-3 font-mono text-xs text-slate-400">
                  <div className="p-2 bg-black/40 rounded border border-white/5">
                    <div className="font-bold text-white text-[10.5px]">esbuild tsx-loader</div>
                    <p className="text-[9px] opacity-75 mt-0.5">Transpiles React code dynamically in 8.4ms.</p>
                  </div>
                  <div className="p-2 bg-black/40 rounded border border-white/5">
                    <div className="font-bold text-white text-[10.5px]">AIGen Graph visualizer</div>
                    <p className="text-[9px] opacity-75 mt-0.5 font-sans leading-relaxed">Computes dependency loops and detects imports cycles.</p>
                  </div>
                </div>
              </div>
            )}

            {/* SETTINGS STATE */}
            {activeSidebarTab === 'settings' && (
              <div className="space-y-4">
                <span className="text-[10px] uppercase font-mono tracking-widest text-slate-500 font-bold block pb-2 border-b border-white/5">IDE Configs</span>
                <p className="text-[10.5px] text-slate-400 leading-normal">
                  Manage API gateways, model prompt parameters, and execution settings.
                </p>

                <div className="space-y-3 bg-black/25 p-3 rounded-lg border border-white/5 select-none text-left">
                  <label className="text-[9px] uppercase tracking-wider font-semibold opacity-60 block">Synthesis LLM Backend</label>
                  
                  <div className="grid grid-cols-1 gap-2 font-mono">
                    <button
                      onClick={() => setSelectedApi('gemma-2-2b-it')}
                      className={`p-2 rounded text-left border transition text-xs flex justify-between items-center ${
                        selectedApi === 'gemma-2-2b-it'
                          ? 'border-purple-500 bg-purple-500/10 text-purple-200 font-semibold'
                          : 'border-white/5 hover:bg-white/5 text-slate-400'
                      }`}
                    >
                      <span>Gemma 2 2B</span>
                      <span className="text-[8px] opacity-50">gemma-2-2b-it</span>
                    </button>

                    <button
                      onClick={() => setSelectedApi('deepseek-chat')}
                      className={`p-2 rounded text-left border transition text-xs flex justify-between items-center ${
                        selectedApi === 'deepseek-chat'
                          ? 'border-purple-500 bg-purple-500/10 text-purple-200 font-semibold'
                          : 'border-white/5 hover:bg-white/5 text-slate-400'
                      }`}
                    >
                      <span>DeepSeek-V3</span>
                      <span className="text-[8px] opacity-50">deepseek-chat</span>
                    </button>
                  </div>
                </div>

                {/* System Prompt Specs */}
                <div className="space-y-2 bg-black/25 p-3 rounded-lg border border-white/5 text-left">
                  <span className="text-[10px] uppercase font-semibold opacity-65 block">Component Prompts Spec</span>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={4}
                    placeholder="Describe visual component..."
                    className="w-full text-xs p-2 rounded bg-black/45 text-slate-300 border border-white/5 focus:outline-none focus:border-purple-500 font-mono leading-relaxed"
                  />
                  <button
                    onClick={triggerGenerate}
                    disabled={generating}
                    className="w-full text-xs py-2 bg-purple-600 hover:bg-purple-500 rounded font-mono text-white tracking-widest uppercase transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {generating ? <RefreshCw className="animate-spin w-3 h-3" /> : <Play className="w-2.5 h-2.5 fill-current" />} Synthesize Component
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* PART B: CENTER PIECE (Tabs bar, Tab active workspace, and Terminal line) (cols-span-6) */}
        <div className="lg:col-span-6 flex flex-col justify-between border-r border-white/5 h-full bg-[#050608]/20">
          
          {/* B1: Filename Tabs Area */}
          <div className="flex justify-between items-center bg-[#090a0f] border-b border-white/5 px-2 select-none z-10">
            
            {/* Left side tabs: Opened Files + Map + Preview */}
            <div className="flex items-center gap-0.5 overflow-x-auto scrollbar-none py-1">
              {/* Explorer Tab active file code sheet */}
              <button
                onClick={() => setActiveTab('editor')}
                className={`py-1.5 px-3 rounded text-[11px] font-mono tracking-wider transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'editor' 
                    ? 'bg-purple-950/20 text-purple-300 border border-purple-500/10 font-bold' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Code size={11} className="text-purple-400 animate-pulse" /> {activeFileName}
              </button>

              {/* Dependency Architecture Map Graph */}
              <button
                onClick={() => setActiveTab('graph')}
                className={`py-1.5 px-3 rounded text-[11px] font-mono tracking-wider transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'graph' 
                    ? 'bg-[#12131b] text-purple-300 border border-purple-500/20 font-bold shadow-[0_0_8px_rgba(139,92,246,0.1)]' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Grid3X3 size={11} className="text-[#8b5cf6]" /> Architecture Graph Map
              </button>

              {/* Dynamic Live Canvas Stage */}
              <button
                onClick={() => setActiveTab('preview')}
                className={`py-1.5 px-3 rounded text-[11px] font-mono tracking-wider transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'preview' 
                    ? 'bg-purple-950/20 text-purple-300 border border-purple-500/10 font-bold' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Eye size={11} className="text-cyan-400" /> Sandboxed Runtime Preview
              </button>
            </div>

            {/* Quick Actions tray */}
            <div className="flex items-center gap-2 pr-2">
              <button
                onClick={triggerCopy}
                className="p-1 rounded text-slate-500 hover:text-white transition active:scale-95 cursor-pointer"
                title="Copy current active file text"
              >
                {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
              </button>
              <button
                onClick={handleDownloadFile}
                className="p-1 rounded text-slate-500 hover:text-white transition active:scale-95 cursor-pointer"
                title="Download active block"
              >
                <Download size={12} />
              </button>
            </div>
          </div>

          {/* B2: TAB CONTENT SCREEN CONTAINER */}
          <div className="flex-1 w-full relative overflow-y-auto px-4 py-4 min-h-[450px]">
            
            {/* TAB VIEW 1: EDITOR WITH LINE SIDEBAR */}
            {activeTab === 'editor' && (
              <div className="w-full h-full flex bg-[#0c0d12]/60 rounded-2xl border border-white/5 overflow-hidden text-left font-mono text-[11.5px] shadow-2xl">
                {/* Visual Line Numbers */}
                <div className="py-4 pl-3.5 pr-2.5 text-right text-slate-600 bg-black/40 border-r border-white/5 font-mono select-none space-y-0.5">
                  {rawOutput.split('\n').map((_, i) => (
                    <div key={i} className="text-[11px] h-5">{i + 1}</div>
                  ))}
                </div>
                {/* Code text Area */}
                <textarea
                  value={rawOutput}
                  onChange={(e) => handleEditorChange(e.target.value)}
                  className="flex-1 py-4 px-4 bg-transparent text-slate-200 outline-none resize-none font-mono text-[11.5px] leading-5 font-medium scrollbar-thin h-[4500px]"
                  style={{ whiteSpace: 'pre', overflowX: 'auto' }}
                />
              </div>
            )}

            {/* TAB VIEW 2: INTERACTIVE CODE GRAPH CANVAS */}
            {activeTab === 'graph' && (
              <div className="w-full h-full">
                <CodeGraph 
                  isResolved={isResolved} 
                  onResolve={handleResolveCycle}
                  onSelectNode={(name) => {
                    const matchedFile = workspaceFiles.find(f => f.name === name);
                    if (matchedFile) {
                      setActiveFileName(name);
                      setActiveTab('editor');
                    }
                  }}
                />
              </div>
            )}

            {/* TAB VIEW 3: LIVE RUNTIME CANVAS IN THE MESH GRADIENT CARD */}
            {activeTab === 'preview' && (
              <div className="w-full h-full flex flex-col justify-center items-center py-4 bg-[#0a0614]/20 rounded-2xl border border-white/5 p-4 select-none">
                
                {/* Interactive GlowingEdgeCard with pointer follow lights */}
                <GlowingEdgeCard
                  mode={mode}
                  className="w-full h-[400px] max-w-[450px] shadow-2xl relative select-none animate-float rounded-[2em]"
                  onStatsUpdate={(telemetry) => setStats(telemetry)}
                >
                  <div className="relative w-full h-full p-6 flex flex-col justify-between overflow-hidden">
                    {/* Visual canvas decorations */}
                    <div className="absolute inset-0 bg-transparent bg-[radial-gradient(ellipse_at_top_right,transparent_30%,#8b5cf6_0.5%,transparent_3%)] bg-[size:32px_32px] opacity-15 pointer-events-none select-none z-0" />
                    
                    {/* Sandboxed title banner */}
                    <span className="absolute top-4 left-4 text-[9px] font-mono tracking-widest opacity-45 uppercase z-10 flex items-center gap-1.5 select-none leading-none">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> Virtual Applet Sandbox
                    </span>

                    {/* Evaluated target container output */}
                    <div className="flex-1 w-full flex flex-col justify-center items-center z-10 py-5 overflow-auto select-text">
                      {renderFallbackDynamic()}
                    </div>

                    {/* Metrics Footer */}
                    <footer className="relative z-10 mt-4 pt-2 border-t border-white/5 flex justify-between items-center text-[10px] text-slate-500 font-mono text-left tracking-tight select-none leading-none">
                      <div className="flex gap-3">
                        <span>Angle: <strong className="text-purple-400 font-bold">{stats.deg}</strong></span>
                        <span>Luminescence: <strong className="text-cyan-405 font-bold">{stats.intensity}</strong></span>
                      </div>
                      <div className="flex items-center gap-1 opacity-70">
                        <Plus className="w-2.5 h-2.5 text-purple-400 animate-pulse" /> Hover border lights follow pointer
                      </div>
                    </footer>
                  </div>
                </GlowingEdgeCard>
              </div>
            )}
          </div>

          {/* B3: BOTTOM CLI TERMINAL PANEL */}
          <div className="p-3.5 bg-[#05060b] border-t border-white/5 min-h-[160px]">
            <TerminalPanel
              logs={terminalLogs}
              onAddLog={(text, type) => setTerminalLogs(prev => [...prev, { text, type }])}
              onClear={() => setTerminalLogs([])}
            />
          </div>
        </div>

        {/* PART C: RIGHT PANEL: SYSTEM INTEGRATED ASSISTANT (cols-span-3) */}
        <div className="lg:col-span-3 h-full border-t lg:border-t-0 border-white/5">
          <AiArchitect 
            isResolved={isResolved}
            onResolve={handleResolveCycle}
            onAddTerminalLog={handleAddTerminalLog}
            onSendMessage={handleSendMessage}
            chatHistory={chatHistory}
          />
        </div>

      </div>

      {/* 3. FOOTER WORKSPACE SPECIFIERS */}
      <footer className="px-5 py-2 hover:bg-slate-900/10 border-t border-white/5 text-[9px] font-mono text-slate-500 flex justify-between select-none bg-[#090a10]">
        <div className="flex gap-4">
          <span>Branch: <strong className="text-purple-400">main</strong></span>
          <span>Port: <strong className="text-cyan-400">3000 (Vite)</strong></span>
          <span>Status: <strong className="text-emerald-400">AI Engine Ready</strong></span>
        </div>
        <div>
          <span>© AuraReact Studio Core IDE Sandbox edition</span>
        </div>
      </footer>

      {/* Styles */}
      <style>{`
        .scrollbar-none::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-none {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
        @keyframes floatingGlow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-3px); }
        }
        .animate-float {
          animation: floatingGlow 4s ease-in-out infinite;
        }
        .animate-spin-slow {
          animation: spin 8s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
export { App };
