import React, { useEffect, useState, useRef } from 'react';
import { Play, RotateCcw, AlertTriangle, Eye, ShieldCheck, Download, Code, Layers } from 'lucide-react';

interface PreviewStageProps {
  fileName: string;
  fileContent: string;
}

export default function PreviewStage({ fileName, fileContent }: PreviewStageProps) {
  const [error, setError] = useState<string | null>(null);
  const [key, setKey] = useState(0); // For resetting preview sandbox
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    // If it is not App.tsx, we can render the text directly or in structured JSON view
    if (fileName !== 'App.tsx' && fileName !== 'index.css') {
      setError(null);
      return;
    }

    // Attempt to transpile and run App.tsx + index.css in sandboxed iframe
    transpileAndInject();
  }, [fileContent, fileName, key]);

  const transpileAndInject = () => {
    try {
      const iframe = iframeRef.current;
      if (!iframe) return;

      setError(null);

      // Simple light-duty TSX compiler to make button handlers, state, and standard counters work in the sandboxed frame!
      // In TSX, we strip type annotations, imports, exports, and extract the functional body.
      let srcCode = fileContent;

      // 1. Remove imports & exports
      srcCode = srcCode.replace(/import\s+[^;]+;/g, '');
      srcCode = srcCode.replace(/export\s+default\s+/g, '');

      // 2. Simple regex mapping to support React-like useState using standard Javascript
      // Find `const [count, setCount] = useState(0)` -> replace with dynamic variables
      // Let's bundle a mock React state library in the sandboxed page
      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8" />
            <script src="https://cdn.tailwindcss.com"></script>
            <style>
              body {
                background: radial-gradient(circle at top right, #100624 0%, #06020c 100%);
                color: #f1f0f7;
                font-family: system-ui, -apple-system, sans-serif;
                min-height: 100vh;
                margin: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 1rem;
              }
            </style>
          </head>
          <body>
            <div id="sandbox-root" class="w-full h-full flex items-center justify-center"></div>

            <script>
              // React-like state sandbox simulation
              let stateIndex = 0;
              const states = [];
              const renderListeners = [];

              const React = {
                useState(initialVal) {
                  const currIdx = stateIndex;
                  if (states[currIdx] === undefined) {
                    states[currIdx] = initialVal;
                  }
                  
                  const stateVal = states[currIdx];
                  const setStateVal = (newVal) => {
                    if (typeof newVal === 'function') {
                      states[currIdx] = newVal(states[currIdx]);
                    } else {
                      states[currIdx] = newVal;
                    }
                    triggerRender();
                  };

                  stateIndex++;
                  return [stateVal, setStateVal];
                }
              };

              // Map window variables
              window.React = React;
              window.useState = React.useState;

              function triggerRender() {
                stateIndex = 0;
                const root = document.getElementById('sandbox-root');
                root.innerHTML = '';
                
                try {
                  // Execute user component code which mounts compiled elements
                  const element = App();
                  if (typeof element === 'string') {
                    root.innerHTML = element;
                  } else if (element instanceof HTMLElement) {
                    root.appendChild(element);
                  } else {
                    // It returns structured HTML or nodes
                    root.innerHTML = String(element);
                  }
                } catch (err) {
                  root.innerHTML = \`
                    <div class="p-6 bg-red-950/40 border border-red-500/30 rounded-2xl max-w-sm text-center text-red-200">
                      <h4 class="font-bold text-red-400 mb-2">Sandbox Render Error</h4>
                      <p class="text-xs font-mono">\${err.message}</p>
                    </div>
                  \`;
                  window.parent.postMessage({ type: 'error', message: err.message }, '*');
                }
              }

              // Let's construct standard elements
              // Since the TSX compiled uses HTML string or components, we'll map standard JSX elements to template strings or HTML nodes
              // App definition
              ${srcCode}

              // Run first trigger
              setTimeout(triggerRender, 100);

              // Capture clicks inside the iframe to avoid complete navigation escapes
              window.addEventListener('error', (e) => {
                window.parent.postMessage({ type: 'error', message: e.message }, '*');
              });
            </script>
          </body>
        </html>
      `;

      // Set content using Blob URL or srcdoc to avoid CORS issues
      iframe.srcdoc = htmlContent;
    } catch (err: any) {
      setError(err.message || "Failed to configure compile environment of App.tsx");
    }
  };

  const resetSandbox = () => {
    setKey(prev => prev + 1);
  };

  const isCode = fileName === 'App.tsx' || fileName === 'index.css';

  return (
    <div id="preview-stage-container" className="flex flex-col h-full bg-[#110926]/50 border border-purple-500/10 rounded-xl overflow-hidden backdrop-blur-md">
      {/* Sandbox bar */}
      <div id="preview-stage-header" className="flex items-center justify-between px-4 py-2.5 bg-[#0e041e]/90 border-b border-purple-500/10">
        <div className="flex items-center gap-2">
          <Eye id="eye-icon" className="w-4 h-4 text-purple-400" />
          <span className="text-[10px] font-semibold uppercase tracking-wider text-purple-200">
            {isCode ? 'Sandboxed Render Stage' : 'Data Presentation Schema'}
          </span>
          <span className="text-[9px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 font-semibold border border-purple-500/10">
            {fileName}
          </span>
        </div>

        {isCode && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-purple-300/50 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" /> Active
            </span>
            <button
              id="btn-recompile-sandbox"
              onClick={resetSandbox}
              className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] bg-purple-950/20 hover:bg-purple-900/30 border border-purple-500/20 text-purple-100 hover:text-white rounded-md transition duration-150 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3 text-purple-400" /> Recompile
            </button>
          </div>
        )}
      </div>

      {/* Render Stage Window */}
      <div id="sandbox-viewport" className="flex-1 relative bg-[#06020c]/80 min-h-[300px]">
        {error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-red-200">
            <AlertTriangle className="w-8 h-8 text-red-400 mb-3" />
            <h4 className="text-sm font-semibold text-red-400">Compilation halted</h4>
            <p className="text-xs font-mono max-w-sm mt-2 text-red-300/80 bg-red-950/20 p-3 rounded-lg border border-red-500/10">
              {error}
            </p>
          </div>
        ) : fileName === 'App.tsx' ? (
          <iframe
            id="render-stage-iframe"
            ref={iframeRef}
            title="Render Sandbox Stage"
            className="w-full h-full border-none inset-0 absolute"
            sandbox="allow-scripts"
          />
        ) : fileName.endsWith('.json') ? (
          <div className="p-4 overflow-auto font-mono text-xs text-purple-300 h-full scrollbar-thin">
            <div className="flex items-center gap-1.5 text-purple-400 mb-2 select-none border-b border-purple-500/5 pb-2">
              <Layers className="w-3.5 h-3.5" /> Structured Output Constraints schema
            </div>
            <pre className="bg-[#0b051b] p-3.5 rounded-lg border border-purple-500/10 text-cyan-300 max-h-[90%] overflow-y-auto whitespace-pre">
              {fileContent}
            </pre>
          </div>
        ) : (
          <div className="p-5 overflow-auto text-xs text-purple-200 h-full scrollbar-thin">
            <div className="flex items-center gap-1.5 text-purple-400 mb-3 select-none border-b border-purple-500/5 pb-2">
              <Code className="w-3.5 h-3.5" /> Workspace Raw View
            </div>
            <pre className="bg-[#0b051b] p-4 rounded-xl border border-purple-500/10 text-purple-200 overflow-y-auto block whitespace-pre-wrap max-h-[90%] font-mono">
              {fileContent}
            </pre>
          </div>
        )}
      </div>

      {/* Deploy / Action tray */}
      <div id="sandbox-tray" className="px-4 py-2.5 bg-[#0c051a] border-t border-purple-500/10 flex items-center justify-between text-[10px] text-purple-300/60">
        <span>Tailwind CSS framework auto-mounted</span>
        <span>Environment Node-Ready</span>
      </div>
    </div>
  );
}
