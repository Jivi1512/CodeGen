import React from 'react';
import { motion } from 'motion/react';
import { 
  Cpu, 
  Sparkles, 
  Grid3X3, 
  Database, 
  ArrowRight, 
  Code, 
  Eye, 
  Terminal, 
  GitBranch, 
  Check, 
  TrendingUp, 
  Play
} from 'lucide-react';

interface HomepageProps {
  onEnterWorkspace: () => void;
  savedCount: number;
}

export default function Homepage({ onEnterWorkspace, savedCount }: HomepageProps) {
  // Nested radii specifications:
  // - Main cards: rounded-2xl
  // - Inner assets / inputs: rounded-xl
  // - Buttons/badges: rounded-lg

  const features = [
    {
      icon: <Sparkles className="w-5 h-5 text-purple-400" />,
      title: "Generative Multi-model Engine",
      desc: "Instant code synthesis leveraging advanced Gemma-2-2B-It and DeepSeek-V3 models. Installs fallback preview components if API credentials aren't defined.",
      pill: "Gemma & DeepSeek"
    },
    {
      icon: <Grid3X3 className="w-5 h-5 text-cyan-400" />,
      title: "Imports Coupling Healer",
      desc: "Detect, traverse, and decouple cyclic circular dependencies in real-time. Installs automatic interfaces to secure healthy software boundaries.",
      pill: "Circular Map Solver"
    },
    {
      icon: <Eye className="w-5 h-5 text-emerald-400" />,
      title: "Glow Sandbox Preview",
      desc: "Live sandboxed execution module compiling component files on the fly. Interactive mesh gradient frames track cursor movements and coordinates in real-time.",
      pill: "Reactive Playground"
    },
    {
      icon: <Database className="w-5 h-5 text-amber-400" />,
      title: "Supabase Permanent Backups",
      desc: "Permit real-time synchronization with Supabase cloud databases. Stash components, prompts, and timestamps directly into Postgres tables.",
      pill: "Postgres Sync"
    }
  ];

  return (
    <div className="min-h-screen w-full relative flex flex-col items-center justify-start text-[#ededf0] overflow-x-hidden font-sans select-none pb-12">
      
      {/* Dynamic Background Overlays of the formalized system */}
      <div className="absolute inset-0 bg-[#04010a]/95 -z-10" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-[radial-gradient(circle_at_top,_var(--color-brand-purple)_0%,_transparent_55%)] opacity-20 pointer-events-none -z-10" />
      
      {/* 1. Header Navigation Bar */}
      <header className="w-full max-w-7xl mx-auto px-6 py-5 flex items-center justify-between z-20 border-b border-white/[0.04] backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 shadow-lg shadow-purple-500/10">
            <Cpu className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-sm font-bold tracking-widest uppercase font-mono text-white leading-none">AIGen Core</span>
            <span className="text-[10px] text-purple-400 font-semibold font-mono mt-0.5">Workspace IDE</span>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-6 text-xs font-mono tracking-wider text-slate-400">
          <a href="#features" className="hover:text-purple-300 transition-colors">Features</a>
          <a href="#architecture" className="hover:text-purple-300 transition-colors">Workspace Modules</a>
          <span className="h-4 w-px bg-white/10" />
          <div className="text-[10px] bg-purple-950/30 border border-purple-500/20 px-2 py-0.5 rounded-full text-purple-300 flex items-center gap-1">
            <Database size={9} />
            <span>Supabase Ready</span>
          </div>
        </div>

        <button 
          onClick={onEnterWorkspace}
          className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold font-mono tracking-wider uppercase rounded-lg shadow-lg shadow-purple-500/10 transition hover:-translate-y-0.5 active:translate-y-0 duration-200 cursor-pointer"
        >
          <span>Launch Studio</span>
          <ArrowRight size={13} />
        </button>
      </header>

      {/* 2. Hero Component Area */}
      <main className="w-full max-w-5xl mx-auto px-6 pt-16 md:pt-24 text-center space-y-6 z-10">
        
        {/* Release tag banner */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1 bg-white/[0.03] border border-white/[0.06] rounded-full text-left"
        >
          <span className="h-2 w-2 rounded-full bg-purple-500 animate-pulse" />
          <span className="text-[10px] font-mono uppercase tracking-wider text-purple-300 font-semibold">Decoupled AI Architecture Engine • v2.4</span>
        </motion.div>

        {/* Hero title display typography */}
        <motion.h1 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-5xl md:text-6xl font-serif text-white tracking-tight leading-[1.1] max-w-4xl mx-auto"
        >
          Decouple. Synthesize.<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-200 to-cyan-300 font-sans font-bold">
            Architect Beautiful Web Apps.
          </span>
        </motion.h1>

        {/* Subtle subtext */}
        <motion.p 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-sm md:text-base text-slate-400 font-sans max-w-2xl mx-auto leading-relaxed"
        >
          Analyze local file dependency coupling webs, heal cycles automatically, and generate responsive React UI layouts with pointer-tracking sandbox canvas controls.
        </motion.p>

        {/* CTA Launch Board */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
        >
          <button 
            onClick={onEnterWorkspace}
            className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-slate-100 text-[#0b041a] text-sm font-bold rounded-lg shadow-xl shadow-white/5 transition duration-200 flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current text-purple-950" />
            <span>Launch Interactive Portal</span>
          </button>
          
          <button 
            onClick={onEnterWorkspace}
            className="w-full sm:w-auto px-6 py-4 bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.08] hover:border-purple-500/30 rounded-lg text-sm font-semibold tracking-wider text-slate-300 font-mono transition duration-200 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Analyze active dependencies</span>
            <span className="text-purple-400">&rarr;</span>
          </button>
        </motion.div>

        {/* Static IDE Preview Showcase */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="pt-12 max-w-4xl mx-auto"
        >
          <div className="relative rounded-2xl border border-white/[0.05] bg-[#0c0a15]/80 overflow-hidden shadow-2xl p-1 pb-0">
            {/* Top terminal tab lines decor */}
            <div className="flex items-center justify-between px-4 py-3 bg-[#08060f] border-b border-white/[0.04] text-[10px] font-mono text-slate-400">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-red-500/20 border border-red-500/40" />
                  <span className="h-2 w-2 rounded-full bg-yellow-500/20 border border-yellow-500/40" />
                  <span className="h-2 w-2 rounded-full bg-green-500/20 border border-green-500/40" />
                </div>
                <span className="h-4 w-px bg-white/5 mx-1" />
                <Code size={11} className="text-purple-400 animate-pulse" />
                <span>workspace-preview.sh</span>
              </div>
              <span className="opacity-50">Localhost:3000 (Vite compiling)</span>
            </div>

            {/* Inner Dashboard Wireframe Preview */}
            <div className="grid grid-cols-1 md:grid-cols-12 bg-[#090712]/90 h-[280px] text-left">
              {/* Sidebar */}
              <div className="md:col-span-3 border-r border-white/[0.04] p-4 font-mono text-[10px] text-slate-500 space-y-4 hidden md:block select-none">
                <div className="space-y-1">
                  <span className="text-[8px] uppercase font-bold text-purple-400 block tracking-wider">File Explorer</span>
                  <div className="text-purple-300 flex items-center gap-1 cursor-pointer hover:text-white py-0.5 font-semibold bg-purple-500/5 px-2 rounded">
                    <span>App.tsx</span>
                  </div>
                  <div className="text-slate-400 flex items-center gap-1 cursor-pointer hover:text-white py-0.5 px-2">
                    <span>Layout.tsx</span>
                  </div>
                  <div className="text-slate-400 flex items-center gap-1 cursor-pointer hover:text-white py-0.5 px-2">
                    <span>Map.tsx</span>
                  </div>
                </div>
                <div className="space-y-1 pt-2 border-t border-white/[0.03]">
                  <span className="text-[8px] uppercase font-bold tracking-wider block">Supabase backing</span>
                  <div className="text-[9px] text-slate-400 pl-1">Table: <strong className="text-emerald-400">glowing_files</strong></div>
                  <div className="text-[9px] text-slate-400 pl-1">Stashes total: <strong className="text-slate-300 font-bold">{savedCount || 1} archived</strong></div>
                </div>
              </div>

              {/* Code window */}
              <div className="md:col-span-6 p-4 font-mono text-[10.5px] text-slate-400 space-y-2 overflow-hidden relative">
                <div className="text-slate-500">// Compiled live visual code component</div>
                <div className="text-purple-400">import <span className="text-slate-300">React, &#123; useState &#125;</span> from <span className="text-slate-100">'react'</span>;</div>
                <div className="text-[#06b6d4]">export default <span className="text-[#8b5cf6] font-bold">function</span> <span className="text-slate-100 font-semibold">GlowingProgress()</span> &#123;</div>
                <div className="text-slate-300 pl-4">const [pulse, setPulse] = useState(72);</div>
                <div className="text-slate-300 pl-4">return (</div>
                <div className="text-slate-400 pl-8">&lt;<span className="text-purple-400">div</span> className="p-8 text-neutral-100 bg-[#0d0e14] border border-brand-purple"&gt;</div>
                <div className="text-slate-500 pl-12">// Dynamic preview component logic loads here</div>
                <div className="text-slate-400 pl-8">&lt;/<span className="text-purple-400">div</span>&gt;</div>
                <div className="text-slate-300 pl-4">);</div>
                <div className="text-[#06b6d4]">&#125;</div>

                {/* Fade effect at bottom */}
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#090712] to-transparent pointer-events-none" />
              </div>

              {/* Visual Live output */}
              <div className="col-span-12 md:col-span-3 bg-black/40 p-4 flex flex-col items-center justify-center text-center relative border-t md:border-t-0 border-white/[0.04]">
                <div className="p-1 border border-purple-500/20 rounded-xl bg-purple-500/5 pulse-glow-violet flex items-center justify-center mb-2">
                  <Cpu className="w-5 h-5 text-purple-400" />
                </div>
                <span className="text-[10px] font-semibold text-[#8b5cf6] font-mono uppercase tracking-wider">Live Sandbox active</span>
                <span className="text-[9px] text-slate-500 font-mono mt-0.5">Click Launch to execute</span>
              </div>
            </div>
          </div>
        </motion.div>

      </main>

      {/* 3. Features Section Grid - Formal styling system with subtle borders */}
      <section id="features" className="w-full max-w-7xl mx-auto px-6 py-20 z-10 space-y-12">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#8b5cf6] font-mono">Formal System Architecture</h2>
          <p className="text-2xl font-serif text-white">Engineering pristine decoupled React layout panels</p>
          <p className="text-xs text-slate-400 font-sans leading-relaxed">
            A standardized, elegant panel container flow using nested radii guidelines and delicate borders to achieve a cohesive technical developer environment.
          </p>
        </div>

        {/* Feature Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {features.map((feat, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -3 }}
              transition={{ duration: 0.2 }}
              className="group p-6 bg-[#0a0715]/60 rounded-2xl border border-white/[0.04] text-left hover:border-purple-500/30 transition flex flex-col justify-between gap-5 relative overflow-hidden"
            >
              {/* Subtle mesh background grid lines inside individual bento cells */}
              <div className="absolute inset-0 bg-transparent bg-[radial-gradient(ellipse_at_top_right,transparent_60%,rgba(139,92,246,0.06),transparent_80%)] opacity-20 pointer-events-none select-none z-0" />
              
              <div className="space-y-3 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06]/60 text-slate-200">
                    {feat.icon}
                  </div>
                  <span className="text-[9px] font-mono font-semibold uppercase tracking-widest text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-full">{feat.pill}</span>
                </div>
                <h3 className="text-base font-bold text-white font-sans tracking-tight">{feat.title}</h3>
                <p className="text-xs text-slate-400 font-sans leading-relaxed">
                  {feat.desc}
                </p>
              </div>

              {/* Specs parameters placeholder */}
              <div className="pt-3 border-t border-white/[0.03]/60 flex items-center justify-between text-[9px] font-mono text-slate-500 relative z-10 select-none">
                <span>SYSTEM SEGMENT ACTIVE status</span>
                <span className="text-emerald-400 font-semibold uppercase tracking-wider flex items-center gap-1 select-none">
                  <Check size={8} className="text-emerald-400" /> READY
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 4. Model Cloud Credentials Grounding Board (Render and Secrets) */}
      <section className="w-full max-w-4xl mx-auto px-6 py-12 z-10">
        <div className="p-8 bg-[#070510] border border-white/[0.04] rounded-2xl text-left space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[radial-gradient(ellipse_at_center,_var(--color-brand-cyan)_0%,_transparent_65%)] opacity-5 pointer-events-none -z-10" />
          
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-mono tracking-widest text-cyan-400 font-bold block">Render & Cloud Deploy Grounding</span>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-serif text-white tracking-tight">Cloud-Friendly Secrets Configuration</h2>
            </div>
            <p className="text-xs text-slate-400 font-sans leading-relaxed">
              When deploying this builder pipeline to hosting services like <strong className="text-slate-200 font-semibold">Render</strong>, configure your API keys in Render's Env Secrets manager. All backend modules are designed to run safely, falling back to fluid offline interactive simulation screens automatically when keys aren't mounted in production.
            </p>
          </div>

          {/* Code panel for credential names */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-black/40 rounded-xl border border-white/[0.04] space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-purple-300 font-semibold">Interactive Models Keys</span>
              <div className="font-mono text-[11px] text-slate-400 space-y-1.5 leading-none pt-1">
                <div className="flex justify-between p-1.5 bg-white/[0.01] rounded">
                  <span className="text-slate-300 font-semibold">GEMINI_API_KEY</span>
                  <span className="text-slate-500">Gemma-2-2B Engine</span>
                </div>
                <div className="flex justify-between p-1.5 bg-white/[0.01] rounded">
                  <span className="text-slate-300 font-semibold">DEEPSEEK_API_KEY</span>
                  <span className="text-slate-500">DeepSeek-V3 Engine</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-black/40 rounded-xl border border-white/[0.04] space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-amber-300 font-semibold">Supabase Backing Storage Keys</span>
              <div className="font-mono text-[11px] text-slate-400 space-y-1.5 leading-none pt-1">
                <div className="flex justify-between p-1.5 bg-white/[0.01] rounded">
                  <span className="text-slate-300 font-semibold">SUPABASE_URL</span>
                  <span className="text-slate-500">Database API Ingress</span>
                </div>
                <div className="flex justify-between p-1.5 bg-white/[0.01] rounded">
                  <span className="text-slate-300 font-semibold">SUPABASE_ANON_KEY</span>
                  <span className="text-slate-500">Anon Client Token</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2">
            <p className="text-[10px] text-slate-500 font-mono">
              ★ Workspace variables are securely proxy-called server-side to prevent credential exposure in browser inspector frames.
            </p>
            <button
              onClick={onEnterWorkspace}
              className="px-5 py-3 bg-[#0a0614] hover:bg-[#110c22] border border-purple-500/25 rounded-lg text-xs font-mono font-semibold text-purple-300 hover:text-white transition duration-200 shadow-md text-center shrink-0 cursor-pointer"
            >
              Enter Workspace IDE &rarr;
            </button>
          </div>
        </div>
      </section>

      {/* 5. Simple page footer */}
      <footer className="w-full max-w-7xl mx-auto px-6 pt-12 mt-12 border-t border-white/[0.04] flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[10px] font-mono select-none">
        <div>
          <span>AuraReact Studio Core System IDE Sandbox edition • Cloud-Ready</span>
        </div>
        <div className="flex gap-4">
          <span>Latencies: 8.4ms</span>
          <span>Deploy: Standard SSL (tls)</span>
        </div>
      </footer>

    </div>
  );
}
