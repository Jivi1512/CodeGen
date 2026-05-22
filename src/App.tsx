import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GlowingEdgeCard } from './Component';
import { 
  Send, 
  Upload, 
  Trash2, 
  Copy, 
  Check, 
  Sparkles, 
  Download, 
  Code, 
  FileCode, 
  Layout, 
  Database, 
  HelpCircle, 
  Sun, 
  Moon, 
  BookOpen, 
  ArrowRight, 
  CheckCircle, 
  Eye, 
  X,
  Plus,
  RefreshCw,
  Cpu,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  ClipboardList
} from 'lucide-react';

interface AttachedFile {
  name: string;
  type: string;
  size: number;
  content: string; // Transcribed/parsed code context text
  displayType: 'python' | 'notebook' | 'image_ocr' | 'text_code';
  imagePreviewData?: string; // base64 representation if image
}

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  attachedFiles?: AttachedFile[];
  extractedCode?: string;
}

export default function App() {
  // Appearance
  const [mode, setMode] = useState<'dark' | 'light'>('dark');

  // Multi-model pipeline
  const [selectedApi, setSelectedApi] = useState<'gemini-3.5-flash' | 'gemma-2-2b-it' | 'deepseek-chat'>('gemini-3.5-flash');

  // Chat conversation
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [promptInput, setPromptInput] = useState<string>('');
  const [generating, setGenerating] = useState<boolean>(false);

  // File uploads
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Right sidebar drawer state for interactive "Code Artifacts" (Matches Claude layout)
  const [activeCode, setActiveCode] = useState<string>('');
  const [activeArtifactName, setActiveArtifactName] = useState<string>('corrected_module.py');
  const [showArtifactPanel, setShowArtifactPanel] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const [transpiling, setTranspiling] = useState<boolean>(false);
  const [compiledJs, setCompiledJs] = useState<string>('');
  const [transpileError, setTranspileError] = useState<string | null>(null);

  // Supabase permanent database backing
  const [supabaseFiles, setSupabaseFiles] = useState<any[]>([]);
  const [dbStatus, setDbStatus] = useState<{ status: string; message?: string }>({ status: 'checking' });
  const [savingState, setSavingState] = useState<'idle' | 'saving' | 'success' | 'err'>('idle');

  // Quick state flags
  const [copiedText, setCopiedText] = useState<boolean>(false);
  const [activeSessionId, setActiveSessionId] = useState<string>('sess-' + Date.now());

  // Ref to chat feed wrapper for scrolling to bottom
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Load permanent stashes from Supabase database
  const loadSavedArtifacts = async () => {
    try {
      const res = await fetch("/api/supabase/files");
      const data = await res.json();
      if (data.files) {
        setSupabaseFiles(data.files);
      }
      setDbStatus({ status: data.status, message: data.message });
    } catch (e: any) {
      console.warn("Failed to load Supabase attachments:", e);
      setDbStatus({ status: 'exception', message: e.message || 'Inactive database sync' });
    }
  };

  useEffect(() => {
    loadSavedArtifacts();
  }, []);

  // Sync scrolling to bottom on new messages
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, generating]);

  // Client-side transpilation for dynamic previewing (supports JSX sandbox!)
  useEffect(() => {
    if (!activeCode) return;
    
    // Only transpile if there are signs of React JSX/TSX content
    const containsJsx = activeCode.includes('import React') || activeCode.includes('export default') || activeCode.includes('className=');
    if (!containsJsx) {
      setCompiledJs('');
      setTranspileError(null);
      return;
    }

    let active = true;
    const transpile = async () => {
      setTranspiling(true);
      setTranspileError(null);
      try {
        const res = await fetch("/api/transpile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: activeCode })
        });
        const data = await res.json();
        if (active) {
          if (data.success) {
            setCompiledJs(data.js);
          } else if (data.error) {
            setTranspileError(data.error);
          }
        }
      } catch (err: any) {
        if (active) setTranspileError(err.message || 'Transpilation gateway timed out');
      } finally {
        if (active) setTranspiling(false);
      }
    };

    const delayDebounce = setTimeout(() => {
      transpile();
    }, 800);

    return () => {
      active = false;
      clearTimeout(delayDebounce);
    };
  }, [activeCode]);

  // Dynamic code parsing helpers
  const parseJupyterNotebook = (rawTxt: string): string => {
    try {
      const notebook = JSON.parse(rawTxt);
      if (!notebook || !Array.isArray(notebook.cells)) {
        return rawTxt;
      }
      let cellExtract = "";
      notebook.cells.forEach((cell: any, idx: number) => {
        const type = cell.cell_type || "code";
        const sourceLines = Array.isArray(cell.source) ? cell.source : [cell.source || ""];
        const codeText = sourceLines.join("");
        
        cellExtract += `\n# --- [Cell ${idx + 1}: ${type.toUpperCase()}] ---\n`;
        if (type === "markdown") {
          const formattedMarkdown = codeText.split("\n").map(l => `# ${l}`).join("\n");
          cellExtract += formattedMarkdown + "\n";
        } else {
          cellExtract += codeText + "\n";
        }
      });
      return cellExtract;
    } catch (e) {
      console.warn("Jupyter JSON parsing failed. Displaying raw data:", e);
      return rawTxt;
    }
  };

  // Drag & drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processUploadedFiles(e.dataTransfer.files);
    }
  };

  // Convert files to memory objects
  const processUploadedFiles = async (files: FileList) => {
    const nextFilesState: AttachedFile[] = [...attachedFiles];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext = file.name.split('.').pop()?.toLowerCase();
      
      let displayType: 'python' | 'notebook' | 'image_ocr' | 'text_code' = 'text_code';
      if (ext === 'py') displayType = 'python';
      else if (ext === 'ipynb') displayType = 'notebook';
      else if (['png', 'jpg', 'jpeg', 'webp'].includes(ext || '')) displayType = 'image_ocr';

      if (displayType === 'image_ocr') {
        const reader = new FileReader();
        reader.onload = () => {
          const rawBase64 = reader.result as string;
          const cleanBase64 = rawBase64.split(',')[1]; // Strip prefix
          nextFilesState.push({
            name: file.name,
            type: file.type,
            size: file.size,
            displayType: 'image_ocr',
            content: `[Image Base 64 Source - Attached for AI OCR analysis]`,
            imagePreviewData: cleanBase64
          });
          setAttachedFiles([...nextFilesState]);
        };
        reader.readAsDataURL(file);
      } else {
        const text = await file.text();
        const parsedContext = displayType === 'notebook' ? parseJupyterNotebook(text) : text;
        
        nextFilesState.push({
          name: file.name,
          type: file.type,
          size: file.size,
          displayType,
          content: parsedContext
        });
        setAttachedFiles([...nextFilesState]);
      }
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      await processUploadedFiles(e.target.files);
    }
  };

  const handleClearAttached = (idx: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== idx));
  };

  // Triggers main chat completion & OCR
  const handleChatCompletion = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!promptInput.trim() && attachedFiles.length === 0) return;

    const userPrompt = promptInput.trim() || `Analyze the uploaded files and address logic issues.`;
    const messageId = "msg-" + Date.now();
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // 1. Append User Message
    const appendedUserMsg: ChatMessage = {
      id: messageId,
      role: 'user',
      text: userPrompt,
      timestamp: timeNow,
      attachedFiles: [...attachedFiles]
    };

    setChatHistory(prev => [...prev, appendedUserMsg]);
    setPromptInput('');
    setGenerating(true);

    // Prepare full unified code parameters
    let codeBlockSummary = "";
    attachedFiles.forEach(f => {
      if (f.displayType !== 'image_ocr') {
        codeBlockSummary += `\n\n--- FILE: "${f.name}" ---\n${f.content}`;
      }
    });

    // Extract any base64 image if uploaded (take the first image as direct multimodal context)
    const imgFile = attachedFiles.find(f => f.displayType === 'image_ocr');
    let imageParam = null;
    if (imgFile && imgFile.imagePreviewData) {
      imageParam = {
        mimeType: imgFile.type || "image/png",
        data: imgFile.imagePreviewData
      };
    }

    // Capture files to clear attachment box
    setAttachedFiles([]);

    // 2. Add empty model bubble
    const modelMsgId = "msg-model-" + Date.now();
    setChatHistory(prev => [...prev, {
      id: modelMsgId,
      role: 'model',
      text: imageParam 
        ? "Processing uploaded image... Transcribing code with high-fidelity OCR, compiling corrections on the server..."
        : "Analyzing active source layers... Running core synthesis against selected pipeline...",
      timestamp: timeNow
    }]);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: userPrompt,
          model: selectedApi,
          code: codeBlockSummary,
          image: imageParam,
          systemInstruction: `You are an elite code debugging assistant exactly like Claude.
Analyze user specifications, inspect their files or transcribed image, and solve issues.
Always output detailed conversational advice, and then output exactly ONE complete, pristine corrected block of code wrapped in standard markdown blocks like:
\`\`\`python
# fully revised code
\`\`\`
or
\`\`\`tsx
// fully revised React code
\`\`\``
        })
      });

      if (!response.ok) {
        const textErr = await response.text();
        throw new Error(textErr || `Server code synthesis responded with status ${response.status}`);
      }

      const resData = await response.json();
      let genText = resData.text || "No response produced.";

      // 3. Extract the last formatted markdown code block
      const codeRegex = /```(?:[a-zA-Z0-9+#-]+)?\n([\s\S]*?)```/g;
      const allBlocks = [...genText.matchAll(codeRegex)];
      let extractedCodeStr = '';
      
      if (allBlocks.length > 0) {
        extractedCodeStr = allBlocks[allBlocks.length - 1][1];
      }

      // Automatically update Right Drawer state on artifact creation
      if (extractedCodeStr) {
        setActiveCode(extractedCodeStr);
        // Deduce a clean output name
        const deducedName = imgFile 
          ? "transcribed_ocr_code.py" 
          : (appendedUserMsg.attachedFiles?.[0]?.name 
              ? "corrected_" + appendedUserMsg.attachedFiles?.[0]?.name 
              : "revised_logic.py");
        setActiveArtifactName(deducedName);
        setShowArtifactPanel(true);
        setActiveTab(extractedCodeStr.includes('import React') || extractedCodeStr.includes('className=') ? 'preview' : 'editor');
      }

      // Update model response bubble
      setChatHistory(prev => prev.map(msg => {
        if (msg.id === modelMsgId) {
          return {
            ...msg,
            text: genText,
            extractedCode: extractedCodeStr || undefined
          };
        }
        return msg;
      }));

    } catch (err: any) {
      console.error("AI correction error:", err);
      setChatHistory(prev => prev.map(msg => {
        if (msg.id === modelMsgId) {
          return {
            ...msg,
            text: `✖ Correction failed: ${err.message || err}. Ensure your API variables are loaded inside Secrets configuration.`
          };
        }
        return msg;
      }));
    } finally {
      setGenerating(false);
    }
  };

  // Render evaluation results recursively safely
  const renderSandboxEvaluator = () => {
    if (!compiledJs && !transpileError) {
      return (
        <div className="text-slate-500 font-mono text-[11px] text-center p-6 bg-slate-950/20 border border-white/5 rounded-xl">
          🚀 Run live layout. Upload React components (TSX) to transpile the design.
        </div>
      );
    }

    if (transpileError) {
      return (
        <div className="p-4 rounded-xl bg-red-950/25 border border-red-500/20 text-red-300 font-mono text-xs text-left overflow-auto max-h-[350px]">
          <div className="font-bold text-red-400 mb-1">Sandbox Evaluation Fault:</div>
          <pre className="whitespace-pre-wrap">{transpileError}</pre>
        </div>
      );
    }

    try {
      const functionalCode = compiledJs
        .replace(/import\s+[\s\S]*?\s+from\s+['"][^'"]+['"];?/g, "")
        .replace(/export\s+default\s+/g, "const DefaultExport = ")
        .replace(/export\s+function\s+/g, "function ")
        .replace(/export\s+const\s+/g, "const ");

      const requireLucideReact = () => ({
        Send, Upload, Trash2, Copy, Check, Sparkles, Download, Code, FileCode, Layout, Database, HelpCircle, Sun, Moon, BookOpen, ArrowRight, CheckCircle, Eye, X, Plus, RefreshCw, Cpu
      });

      const iconsProxy = new Proxy(requireLucideReact(), {
        get: (target: any, name: string) => target[name] || Sparkles
      });

      const runner = new Function(
        "scope",
        `
        const { React, useState, useEffect, iconsProxy } = scope;
        ${functionalCode}
        return typeof DefaultExport !== "undefined" ? DefaultExport : (typeof App !== "undefined" ? App : null);
        `
      );

      const EvaluatedComponent = runner({ React, useState, useEffect, iconsProxy });
      if (EvaluatedComponent) {
        return <EvaluatedComponent />;
      }
      return <div className="text-xs text-emerald-400 font-mono">Component registered successfully.</div>;
    } catch (e: any) {
      return (
        <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/20 text-amber-300 font-mono text-xs text-left">
          <div className="font-bold text-amber-400 mb-1">Runtime Eval Exception:</div>
          <pre className="whitespace-pre-wrap">{e.toString()}</pre>
        </div>
      );
    }
  };

  // Sync to database
  const handleCommitToDatabase = async () => {
    if (!activeCode) return;
    setSavingState('saving');
    try {
      const res = await fetch("/api/supabase/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: activeArtifactName,
          code: activeCode,
          prompt: "Claude Client correction",
          model: selectedApi
        })
      });
      const data = await res.json();
      if (data.success) {
        setSavingState('success');
        loadSavedArtifacts(); // reload list
        setTimeout(() => setSavingState('idle'), 3000);
      } else {
        setSavingState('err');
      }
    } catch (e) {
      setSavingState('err');
    }
  };

  // Helper copy content
  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  // Download code as local file
  const handleDownloadCodeFile = () => {
    const blob = new Blob([activeCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = activeArtifactName;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`min-h-screen w-full flex flex-col justify-between font-sans transition-all duration-300 ${
      mode === 'light' ? 'bg-[#f4f6fa] text-[#1e2230]' : 'bg-[#06070c] text-[#eceef4]'
    }`}>
      
      {/* 1. COMPASS NAVBAR TOP SECTION */}
      <nav className="flex items-center justify-between px-5 py-3 border-b border-white/[0.04] bg-[#0c0e16] select-none z-20">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 border border-purple-400/20 shadow-md">
            <Cpu className="w-4 h-4 text-white animate-spin-slow" />
          </div>
          <div className="flex flex-col text-left">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white tracking-widest uppercase font-mono leading-none">AuraClaude Core</span>
              <span className="text-[10px] bg-purple-950/80 border border-purple-500/20 px-2 py-0.5 rounded-full text-purple-300 font-mono font-bold font-semibold">Tuner v1.0</span>
            </div>
            <span className="text-[9px] text-slate-500 font-medium font-mono mt-0.5">Offline-First Intelligent Coding Engine</span>
          </div>
        </div>

        {/* Selected Model Selection Tabs */}
        <div className="hidden md:flex items-center gap-2 p-1 bg-slate-900 border border-white/5 rounded-xl text-[11px] font-mono">
          <button 
            onClick={() => setSelectedApi('gemini-3.5-flash')}
            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1 cursor-pointer ${selectedApi === 'gemini-3.5-flash' ? 'bg-purple-900/50 text-purple-300 border border-purple-500/20 shadow' : 'text-slate-400 hover:text-white'}`}
          >
            <Sparkles size={11} /> Gemini 3.5 Auto
          </button>
          <button 
            onClick={() => setSelectedApi('gemma-2-2b-it')}
            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1 cursor-pointer ${selectedApi === 'gemma-2-2b-it' ? 'bg-purple-900/50 text-purple-300 border border-purple-500/20 shadow' : 'text-slate-400 hover:text-white'}`}
          >
            <FileCode size={11} /> Gemma-2 (NVIDIA NIM)
          </button>
          <button 
            onClick={() => setSelectedApi('deepseek-chat')}
            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1 cursor-pointer ${selectedApi === 'deepseek-chat' ? 'bg-purple-900/50 text-purple-300 border border-purple-500/20 shadow' : 'text-slate-400 hover:text-white'}`}
          >
            <Code size={11} /> DeepSeek Chat
          </button>
        </div>

        {/* Global actions */}
        <div className="flex items-center gap-3">
          <div className="flex items-center p-0.5 bg-slate-900 rounded-lg border border-white/5">
            <button 
              onClick={() => setMode('light')}
              className={`p-1.5 rounded-md text-xs transition ${mode === 'light' ? 'bg-white text-black' : 'text-slate-500 hover:text-white'}`}
              title="Light Mode"
            >
              <Sun size={12} />
            </button>
            <button 
              onClick={() => setMode('dark')}
              className={`p-1.5 rounded-md text-xs transition ${mode === 'dark' ? 'bg-slate-800 text-purple-400' : 'text-slate-500 hover:text-white'}`}
              title="Dark Mode"
            >
              <Moon size={12} />
            </button>
          </div>
        </div>
      </nav>

      {/* 2. CHAT & DRAWERS GRID ROW */}
      <div className="flex-1 w-full grid grid-cols-1 lg:grid-cols-12 items-stretch overflow-hidden relative">
        
        {/* SIDE BAR DRAWERS: PREV HISTORY & BACKUPS */}
        <div className="lg:col-span-3 border-r border-white/5 bg-[#0a0c14]/90 flex flex-col justify-between text-left p-4 space-y-4">
          
          <div className="space-y-4 flex-1 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#a855f7] font-bold">Stashed History</span>
              <BookOpen size={13} className="text-slate-500" />
            </div>

            {/* Supabase Backup status */}
            <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 space-y-1.5 text-xs text-slate-400 font-mono">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-300">Synchronizer Panel</span>
                <span className={`h-1.5 w-1.5 rounded-full ${dbStatus.status === 'supabase_success' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400 animate-pulse'}`} />
              </div>
              <p className="text-[10px] leading-relaxed text-slate-500">
                {dbStatus.status === 'supabase_success' 
                  ? 'ONLINE ✓ Persisting code securely in Supabase Cloud.' 
                  : 'MEMORY BUFFER. Storage falling back to active server session.'}
              </p>
            </div>

            {/* List saved artifacts */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin max-h-[420px]">
              <span className="text-[9px] uppercase font-mono tracking-wider text-slate-500 block">Stashed Code ({supabaseFiles.length} item)</span>
              {supabaseFiles.length === 0 ? (
                <div className="p-4 text-center text-[10.5px] text-slate-500 border border-dashed border-white/5 rounded-xl font-mono">
                  No permanent stashes found. Code artifacts can be backed up.
                </div>
              ) : (
                supabaseFiles.map((item, idx) => (
                  <div 
                    key={idx}
                    onClick={() => {
                      setActiveCode(item.code);
                      setActiveArtifactName(item.name);
                      setShowArtifactPanel(true);
                      setActiveTab(item.code.includes('import React') || item.code.includes('className=') ? 'preview' : 'editor');
                    }}
                    className="p-2.5 rounded-lg bg-[#11131c]/60 border border-white/5 hover:border-purple-500/25 transition-all text-left group cursor-pointer"
                  >
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-300 font-bold mb-1 truncate">
                      <span className="truncate flex items-center gap-1.5">
                        <FileCode size={11} className="text-purple-400 flex-shrink-0" />
                        {item.name}
                      </span>
                      <Bookmark size={9} className="opacity-0 group-hover:opacity-100 text-purple-400 transition" />
                    </div>
                    {item.prompt && (
                      <p className="text-[9.5px] text-slate-500 truncate italic">"{item.prompt}"</p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Model guidelines info footer */}
          <div className="p-3 rounded-xl bg-purple-950/10 border border-purple-500/10 text-[10px] text-purple-300 font-mono leading-relaxed space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <Sparkles size={11} />
              <span>Multi-File Tuning Tips</span>
            </div>
            <p className="text-slate-400">Attach Python, IPython notebooks, text files or snaps of error screens. Type instructions below.</p>
          </div>
        </div>

        {/* CENTER COLUMN: LIVE CHATBOT FEED (cols-span-9 or 6 depending on split drawer toggle) */}
        <div className={`transition-all duration-300 flex flex-col h-[700px] bg-black/10 text-left ${
          showArtifactPanel ? 'lg:col-span-5' : 'lg:col-span-9'
        }`}>
          
          {/* Chat scrolling log frame */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 scrollbar-thin">
            
            {/* 1. Introductory Hero Welcome State if History is Empty (Matches user direction to remove the old larp stats) */}
            {chatHistory.length === 0 && (
              <div className="h-full flex flex-col justify-center items-center text-center space-y-6 max-w-lg mx-auto py-12">
                <div className="p-4 rounded-3xl bg-gradient-to-tr from-purple-600/20 via-indigo-600/10 to-transparent border border-purple-500/20 shadow-2xl pulse-glow">
                  <Cpu className="w-12 h-12 text-purple-400" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-xl sm:text-2xl font-serif text-white tracking-tight">
                    Code Fixer Chatbot
                  </h2>
                  <p className="text-xs text-slate-400 leading-relaxed font-mono">
                    A streamlined artificial intelligence code workspace modeled after Claude. Upload scripts, view beautiful corrected code blocks, format artifacts, or transpile layouts securely.
                  </p>
                </div>

                {/* Grid columns of Upload Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full text-left pt-2 text-[11px] font-mono">
                  
                  <div className="p-3 bg-[#0d0e15] border border-white/5 rounded-xl space-y-1.5 hover:border-purple-500/30 transition">
                    <div className="flex items-center gap-1 text-purple-300 font-bold">
                      <FileCode size={12} />
                      <span>Python Scripts</span>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-normal">Inspect algorithms, refine loops, and fix syntax errors instantly.</p>
                  </div>

                  <div className="p-3 bg-[#0d0e15] border border-white/5 rounded-xl space-y-1.5 hover:border-purple-500/30 transition">
                    <div className="flex items-center gap-1 text-purple-300 font-bold">
                      <Layout size={12} />
                      <span>Jupyter Cells</span>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-normal">Uploads .ipynb files. Automatically parses cell logic as clean lines.</p>
                  </div>

                  <div className="p-3 bg-[#0d0e15] border border-white/5 rounded-xl space-y-1.5 hover:border-purple-500/30 transition">
                    <div className="flex items-center gap-1 text-purple-300 font-bold">
                      <Sparkles size={12} />
                      <span>OCR Vision</span>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-normal">Drop code snaps. Real-time multimodal OCR transcribes code files.</p>
                  </div>

                </div>

                <div className="text-[10px] text-slate-500 font-mono bg-slate-900/40 border border-white/5 px-3 py-1.5 rounded-full flex items-center gap-2">
                  <CheckCircle size={10} className="text-purple-400" />
                  <span>Start by dropping your files or typing instructions below</span>
                </div>
              </div>
            )}

            {/* Chat list history */}
            {chatHistory.map((item, index) => (
              <div 
                key={item.id || index}
                className={`flex flex-col space-y-2 max-w-3xl ${
                  item.role === 'user' ? 'ml-auto text-right items-end' : 'mr-auto text-left items-start'
                }`}
              >
                
                {/* Meta line */}
                <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500">
                  <span className="font-bold text-slate-400">{item.role === 'user' ? 'You' : 'AI Coding Assistant'}</span>
                  <span>•</span>
                  <span>{item.timestamp}</span>
                </div>

                {/* Message Bubble */}
                <div className={`p-4 rounded-2xl text-[12.5px] leading-relaxed relative ${
                  item.role === 'user' 
                    ? 'bg-purple-900/10 border border-purple-500/20 text-purple-100 shadow-md ml-12' 
                    : 'bg-[#0d0e14]/90 border border-white/5 text-slate-200 mr-12'
                }`}>
                  
                  {/* Attached File chips inside bubble */}
                  {item.attachedFiles && item.attachedFiles.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2.5">
                      {item.attachedFiles.map((f, fkey) => (
                        <div key={fkey} className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-900 border border-white/5 text-[10px] font-mono text-purple-300 rounded-lg">
                          <FileCode size={10} className="text-purple-400" />
                          <span>{f.name}</span>
                          <span className="text-[8px] text-slate-500">({(f.size / 1024).toFixed(1)} KB)</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Message Main Markdown Text block */}
                  <div className="whitespace-pre-wrap font-sans">{item.text}</div>

                  {/* Extract active Action button if model generated code */}
                  {item.extractedCode && (
                    <div className="mt-3.5 pt-3 border-t border-white/5 flex flex-wrap gap-2 justify-start">
                      <button
                        onClick={() => {
                          setActiveCode(item.extractedCode || '');
                          setActiveArtifactName(
                            item.attachedFiles?.[0]?.name 
                              ? "corrected_" + item.attachedFiles[0].name 
                              : "source_module.py"
                          );
                          setShowArtifactPanel(true);
                          setActiveTab(item.extractedCode?.includes('import React') || item.extractedCode?.includes('className=') ? 'preview' : 'editor');
                        }}
                        className="px-3 py-1 bg-purple-950/40 hover:bg-purple-900/60 border border-purple-500/20 rounded-lg text-[10px] font-mono text-purple-300 flex items-center gap-1.5 cursor-pointer hover:text-white transition"
                      >
                        <Eye size={10} /> Open in Artifact Panel &rarr;
                      </button>
                      <button
                        onClick={() => handleCopyText(item.extractedCode || '')}
                        className="px-2.5 py-1 bg-[#11131c] hover:bg-slate-900 border border-white/10 rounded-lg text-[10px] font-mono text-slate-400 flex items-center gap-1.5 cursor-pointer hover:text-white transition"
                      >
                        <Copy size={10} /> Copy Code
                      </button>
                    </div>
                  )}
                </div>

              </div>
            ))}

            {generating && (
              <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-purple-400 animate-pulse bg-purple-950/10 border border-purple-500/10 px-4 py-3 rounded-xl max-w-sm mr-auto">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Generating corrected code...</span>
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>

          {/* DRAG AND DROP ZONE / ATTACHMENT LIST */}
          <div 
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`px-4 py-3 border-t border-white/5 flex flex-col gap-2 relative transition-all duration-200 ${
              dragActive ? 'bg-purple-950/20 border-purple-500/30' : 'bg-[#0b0c11]'
            }`}
          >
            {dragActive && (
              <div className="absolute inset-x-0 -top-12 bottom-0 bg-purple-950/80 backdrop-blur-sm z-30 flex items-center justify-center pointer-events-none border border-dashed border-purple-500/40 rounded-t-xl text-purple-300 font-mono text-xs font-bold gap-2">
                <Upload className="animate-bounce" /> Drop files here to attach code context instantly
              </div>
            )}

            {/* List attached files in memory widget */}
            {attachedFiles.length > 0 && (
              <div className="flex flex-wrap gap-2 items-center font-mono text-[10px] pb-2 border-b border-white/5">
                <span className="text-slate-500 uppercase tracking-widest text-[8px] font-bold">Attached for Correction:</span>
                {attachedFiles.map((file, fileIdx) => (
                  <div key={fileIdx} className="inline-flex items-center gap-1.5 px-2 bg-slate-900 border border-white/5 rounded-md py-0.5 text-purple-300 py-1 font-bold">
                    <FileCode size={11} className="text-purple-400" />
                    <span className="truncate max-w-[120px]">{file.name}</span>
                    <button 
                      onClick={() => handleClearAttached(fileIdx)}
                      className="text-slate-500 hover:text-red-400 transition ml-1 cursor-pointer"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* MESSAGE CHAT BOX */}
            <form onSubmit={handleChatCompletion} className="flex gap-2.5 items-end">
              
              {/* Attachment selector icon button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-white/5 rounded-xl transition cursor-pointer shrink-0"
                title="Attach files (.py, .ipynb, .txt, or snaps for OCR)"
              >
                <Upload size={14} />
              </button>
              <input 
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                multiple
                accept=".py,.ipynb,.txt,.js,.ts,.tsx,.html,.css,.png,.jpg,.jpeg,.webp"
                className="hidden"
              />

              <div className="flex-1 relative">
                <textarea
                  value={promptInput}
                  onChange={(e) => setPromptInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleChatCompletion();
                    }
                  }}
                  placeholder="Explain what needs to be fixed or changed on your code..."
                  className="w-full bg-[#111218] border border-white/10 rounded-2xl px-4 py-3 text-xs outline-none focus:border-purple-500 text-slate-100 font-mono resize-none h-12 scrollbar-none max-h-[140px]"
                  style={{ minHeight: '48px' }}
                />
              </div>

              <button
                type="submit"
                disabled={generating || (!promptInput.trim() && attachedFiles.length === 0)}
                className="p-3 bg-gradient-to-r from-purple-600 via-indigo-600 to-violet-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-2xl font-bold transition-all flex items-center justify-center shrink-0 disabled:opacity-40 cursor-pointer shadow shadow-purple-500/10"
              >
                <Send size={13} />
              </button>
            </form>
          </div>

        </div>

        {/* RIGHT COLUMN: INTERACTIVE CODE ARTIFACT DRAWER PANEL (cols-span-4) */}
        <AnimatePresence>
          {showArtifactPanel && (
            <motion.div 
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 15 }}
              transition={{ duration: 0.2 }}
              className="lg:col-span-4 border-l border-white/5 bg-[#0a0c13]/95 flex flex-col h-[700px] text-left select-none relative"
            >
              
              {/* Close toggle drawer banner */}
              <button 
                onClick={() => setShowArtifactPanel(false)}
                className="absolute -left-3 top-1/2 -translate-y-1/2 z-40 h-10 w-6 bg-slate-900 border border-white/5 flex items-center justify-center text-slate-400 hover:text-white rounded-l-md cursor-pointer hover:border-purple-500/20"
                title="Hide output deck"
              >
                <ChevronRight size={14} />
              </button>

              {/* Title Header metadata */}
              <div className="flex items-center justify-between px-4 py-3 bg-[#10121a] border-b border-white/5 shrink-0 select-none">
                <div className="flex items-center gap-2 font-mono text-xs">
                  <FileCode size={13} className="text-purple-400" />
                  <span className="font-bold text-white truncate max-w-[200px]">{activeArtifactName}</span>
                </div>
                <div className="flex items-center gap-1.5 font-mono text-[9px] text-slate-500">
                  <span className="h-1.5 w-1.5 bg-purple-500 rounded-full" />
                  <span>Corrected Sandbox Output</span>
                </div>
              </div>

              {/* Action Buttons Hub toolbar */}
              <div className="px-4 py-2 bg-[#090a10] border-b border-white/5 flex items-center justify-between shrink-0 font-mono text-[10px]">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setActiveTab('editor')}
                    className={`px-2.5 py-1 rounded text-[10px] font-bold flex items-center gap-1 cursor-pointer transition ${activeTab === 'editor' ? 'bg-[#1b1c28] text-purple-300 font-semibold' : 'text-slate-500 hover:text-white'}`}
                  >
                    <Code size={11} /> Source Code
                  </button>
                  <button
                    onClick={() => setActiveTab('preview')}
                    className={`px-2.5 py-1 rounded text-[10px] font-bold flex items-center gap-1 cursor-pointer transition ${activeTab === 'preview' ? 'bg-[#1b1c28] text-[#a855f7] font-semibold animate-pulse' : 'text-slate-500 hover:text-white'}`}
                  >
                    <Eye size={11} /> Live Playground
                  </button>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleCopyText(activeCode)}
                    className="p-1.5 rounded bg-[#11121a]/80 border border-white/5 text-slate-405 text-slate-400 hover:text-white hover:border-purple-500/20 transition cursor-pointer active:scale-95"
                    title="Copy to clipboard"
                  >
                    {copiedText ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                  </button>
                  <button
                    onClick={handleDownloadCodeFile}
                    className="p-1.5 rounded bg-[#11121a]/80 border border-white/5 text-slate-400 hover:text-white hover:border-purple-500/20 transition cursor-pointer active:scale-95"
                    title="Download revised file"
                  >
                    <Download size={11} />
                  </button>
                </div>
              </div>

              {/* CORE SCREEN BOX */}
              <div className="flex-1 overflow-y-auto relative min-h-0 bg-[#08090f]">
                
                {/* TAB WINDOW 1: EDITOR SCROLL WITH DUMMY LINES */}
                {activeTab === 'editor' && (
                  <div className="h-full flex font-mono text-[11px] leading-5 text-left text-slate-300">
                    {/* Sidebar line counts */}
                    <div className="py-4 pl-3 pr-2 bg-black/40 border-r border-[#191924] select-none text-right font-mono text-[10px] text-slate-600 space-y-0.5">
                      {activeCode.split('\n').map((_, lineIdx) => (
                        <div key={lineIdx} className="h-5">{lineIdx + 1}</div>
                      ))}
                    </div>
                    {/* Direct Text Editor content */}
                    <textarea
                      value={activeCode}
                      onChange={(e) => setActiveCode(e.target.value)}
                      className="flex-1 py-4 px-4 bg-transparent outline-none resize-none font-mono text-[11px] leading-5 text-slate-205 h-[3500px]"
                      style={{ whiteSpace: 'pre', overflowX: 'auto' }}
                    />
                  </div>
                )}

                {/* TAB WINDOW 2: THE SANDBOX PREVIEW */}
                {activeTab === 'preview' && (
                  <div className="h-full flex flex-col items-center justify-center p-6 select-text overflow-auto">
                    {activeCode.includes('import React') || activeCode.includes('className=') ? (
                      <GlowingEdgeCard
                        mode={mode}
                        className="w-full max-w-[390px] min-h-[300px] shadow-2xl relative select-none animate-float rounded-[2em] shrink-0 border border-purple-500/10"
                      >
                        <div className="relative w-full h-full p-5 flex flex-col justify-between overflow-auto">
                          
                          {/* Banner decorative */}
                          <div className="absolute top-4 left-4 text-[9px] font-mono tracking-widest opacity-45 uppercase flex items-center gap-1 select-none">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> Sandboxed Component Runtime
                          </div>

                          {/* Inner code render zone */}
                          <div className="flex-1 w-full flex flex-col justify-center items-center py-6 select-text">
                            {renderSandboxEvaluator()}
                          </div>

                          {/* Bottom controls */}
                          <footer className="mt-4 pt-2 border-t border-white/5 flex justify-between items-center text-[9px] text-slate-500 font-mono">
                            <span>Evaluated on-the-fly successfully</span>
                            <div className="flex items-center gap-1">
                              <Plus className="w-2 h-2 text-purple-400" /> Pointer interactive
                            </div>
                          </footer>

                        </div>
                      </GlowingEdgeCard>
                    ) : (
                      <div className="text-center space-y-3 max-w-sm font-mono text-[11px] text-slate-500">
                        <div className="h-10 w-10 bg-slate-900 border border-white/5 rounded-full flex items-center justify-center mx-auto text-purple-400">
                          <FileCode size={16} />
                        </div>
                        <h4 className="text-white font-bold text-xs uppercase tracking-wider">Corrected module ready</h4>
                        <p className="leading-relaxed">This script contains standalone programming logic. You can examine and tweak statements inside the Source Code tab or download as a file.</p>
                      </div>
                    )}
                  </div>
                )}

              </div>

              {/* Drawer footer backup triggers */}
              <div className="p-3.5 bg-[#0b0c13] border-t border-white/5 shrink-0 flex items-center justify-between font-mono text-[10.5px]">
                <div className="flex items-center gap-1 text-slate-500">
                  <span>Artifact Sync:</span>
                  <span className={`font-bold ${savingState === 'success' ? 'text-emerald-400' : 'text-slate-400'}`}>
                    {savingState === 'saving' && 'Syncing...'}
                    {savingState === 'success' && 'Archived ✓'}
                    {savingState === 'err' && 'Failed'}
                    {savingState === 'idle' && 'Idle'}
                  </span>
                </div>

                <button
                  onClick={handleCommitToDatabase}
                  disabled={savingState === 'saving' || !activeCode}
                  className="px-3.5 py-1.5 rounded bg-purple-600 hover:bg-purple-500 text-white font-bold font-mono text-[11px] uppercase transition cursor-pointer flex items-center gap-1.5 shadow disabled:opacity-50"
                >
                  <Database size={11} />
                  <span>Stash Artifact</span>
                </button>
              </div>

            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* 3. FINAL COMPACT WORKSPACE DETAILS FOOTER */}
      <footer className="px-5 py-2.5 bg-[#090a10] border-t border-white/5 text-[9px] font-mono text-slate-500 flex justify-between select-none">
        <div className="flex gap-4">
          <span>Active Session ID: <strong className="text-purple-400">{activeSessionId}</strong></span>
          <span>Workspace Environment: <strong className="text-cyan-400">Claude Core Web Canvas</strong></span>
          <span>Status: <strong className="text-emerald-400">Tuner Connected</strong></span>
        </div>
        <div>
          <span>Powered by Gemini &amp; DeepSeek Core API Integrations</span>
        </div>
      </footer>

      {/* Simple animations style declarations */}
      <style>{`
        .scrollbar-none::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-none {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @keyframes floatingGlow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-3px); }
        }
        .animate-float {
          animation: floatingGlow 4.5s ease-in-out infinite;
        }
        .animate-spin-slow {
          animation: spin 8s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .pulse-glow {
          box-shadow: 0 0 35px -10px rgba(168, 85, 247, 0.12);
        }
      `}</style>

    </div>
  );
}
export { App };
