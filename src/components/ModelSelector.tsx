import React from 'react';
import { Sliders, Shield, FileJson, BookOpen, Bot, Zap, Sparkles, Cpu } from 'lucide-react';
import { ModelConfig, AgentTool, PromptPreset } from '../types';
import { PROMPT_PRESETS } from '../data/presets';

interface ModelSelectorProps {
  config: ModelConfig;
  onChangeConfig: (config: Partial<ModelConfig>) => void;
  tools: AgentTool[];
  onToggleTool: (toolName: string) => void;
  onApplyPreset: (preset: PromptPreset) => void;
}

export default function ModelSelector({
  config,
  onChangeConfig,
  tools,
  onToggleTool,
  onApplyPreset,
}: ModelSelectorProps) {
  return (
    <div id="model-selector-container" className="flex flex-col h-full bg-[#130d22]/40 backdrop-blur-md rounded-xl border border-purple-500/10 overflow-y-auto p-4 space-y-5 scrollbar-thin">
      {/* Configuration Header */}
      <div id="controls-head" className="flex items-center gap-2 border-b border-purple-500/10 pb-3">
        <Sliders id="sliders-icon" className="w-4 h-4 text-purple-400" />
        <span className="text-xs font-semibold uppercase tracking-wider text-purple-200">Model Configuration</span>
      </div>

      {/* Model switches */}
      <div id="model-picker-group" className="space-y-1.5 animate-fadeIn">
        <label className="text-[11px] font-medium text-purple-300">Target Gemini Engine</label>
        <div className="grid grid-cols-1 gap-2">
          {[
            {
              id: 'gemini-3.5-flash',
              title: 'Gemini 3.5 Flash',
              desc: 'High-speed multimodal intelligence',
              badge: 'Fastest',
              color: 'text-cyan-400',
              bgClass: 'hover:border-cyan-500/30 active:bg-cyan-500/5',
              borderClass: 'border-cyan-500/30 bg-cyan-950/10'
            },
            {
              id: 'gemini-3.1-pro-preview',
              title: 'Gemini 3.1 Pro',
              desc: 'Advanced coding & math reasoning',
              badge: 'Reasoning',
              color: 'text-purple-400',
              bgClass: 'hover:border-purple-500/30 active:bg-purple-500/5',
              borderClass: 'border-purple-500/30 bg-purple-950/10'
            },
            {
              id: 'gemini-3.1-flash-lite',
              title: 'Flash Lite',
              desc: 'Highly budget/latency optimized',
              badge: 'Lite Weight',
              color: 'text-emerald-400',
              bgClass: 'hover:border-emerald-500/30 active:bg-emerald-500/5',
              borderClass: 'border-emerald-500/30 bg-emerald-950/10'
            }
          ].map((m) => {
            const isSelected = config.modelName === m.id;
            return (
              <button
                id={`btn-model-${m.id}`}
                key={m.id}
                onClick={() => onChangeConfig({ modelName: m.id })}
                className={`flex flex-col items-start p-3 rounded-xl text-left border cursor-pointer transition text-white ${
                  isSelected 
                    ? `border-purple-500 bg-purple-950/30 shadow-[0_0_15px_rgba(168,85,247,0.15)]` 
                    : 'border-purple-500/10 bg-neutral-900/40 hover:bg-[#1e143c]/30'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-1.5 font-medium text-xs">
                    <span className={m.color}>
                      {m.id === 'gemini-3.1-pro-preview' ? <Cpu className="w-3.5 h-3.5 inline mr-1" /> : <Sparkles className="w-3.5 h-3.5 inline mr-1" />}
                    </span>
                    {m.title}
                  </div>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full bg-purple-500/10 text-purple-300 font-semibold border border-purple-500/10`}>
                    {m.badge}
                  </span>
                </div>
                <p className="text-[10px] text-purple-300/60 mt-1">{m.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Numerical Sliders */}
      <div id="controls-sliders" className="space-y-4">
        {/* Temperature */}
        <div id="slider-temp-block" className="space-y-1.5">
          <div className="flex justify-between items-center text-[11px] text-purple-300">
            <span className="font-medium">Temperature</span>
            <span className="font-mono text-purple-200 bg-purple-950/50 px-1.5 py-0.5 rounded text-[10px] border border-purple-500/10">
              {config.temperature}
            </span>
          </div>
          <input
            id="slider-temperature"
            type="range"
            min="0"
            max="2"
            step="0.1"
            value={config.temperature}
            onChange={(e) => onChangeConfig({ temperature: parseFloat(e.target.value) })}
            className="w-full accent-purple-500 h-1 bg-purple-950/80 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[9px] text-purple-300/40">
            <span>Deterministic (0)</span>
            <span>Creative (2)</span>
          </div>
        </div>

        {/* Max Tokens */}
        <div id="slider-tokens-block" className="space-y-1.5">
          <div className="flex justify-between items-center text-[11px] text-purple-300">
            <span className="font-medium">Token limit</span>
            <span className="font-mono text-purple-200 bg-purple-950/50 px-1.5 py-0.5 rounded text-[10px] border border-purple-500/10">
              {config.maxOutputTokens}
            </span>
          </div>
          <input
            id="slider-max-tokens"
            type="range"
            min="256"
            max="8192"
            step="128"
            value={config.maxOutputTokens}
            onChange={(e) => onChangeConfig({ maxOutputTokens: parseInt(e.target.value) })}
            className="w-full accent-purple-500 h-1 bg-purple-950/80 rounded-lg cursor-pointer"
          />
        </div>
      </div>

      {/* Safety Filters & Struct Output */}
      <div id="controls-binary-options" className="space-y-3 pt-1">
        {/* Safety Filter Level */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-medium text-purple-300 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-purple-400" /> Content Safety Threshold
          </label>
          <select
            id="select-safety-level"
            value={config.safetyLevel}
            onChange={(e) => onChangeConfig({ safetyLevel: e.target.value as any })}
            className="w-full text-xs bg-neutral-900/60 border border-purple-500/15 text-white p-2 rounded-lg focus:outline-none focus:border-purple-500 transition-all cursor-pointer"
          >
            <option value="standard">Standard filtering threshold</option>
            <option value="high">High block threshold (strict protect)</option>
            <option value="low">Low threshold (allow tech concepts)</option>
          </select>
        </div>

        {/* Structured Outputs toggle */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-900/30 border border-purple-500/10">
          <div className="flex items-start gap-2.5">
            <FileJson className="w-4 h-4 text-purple-400 mt-0.5" />
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-white">JSON Structured Schema</span>
              <span className="text-[9px] text-purple-300/50">Restrict model outputs to schema.json</span>
            </div>
          </div>
          <button
            id="btn-toggle-structured"
            onClick={() => onChangeConfig({ structuredOutput: !config.structuredOutput })}
            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
              config.structuredOutput ? 'bg-purple-600' : 'bg-neutral-800'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out mt-0.5 ${
                config.structuredOutput ? 'translate-x-4' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Agentic Builder Tools */}
      <div id="agentic-builder-group" className="space-y-2.5 pt-1">
        <span className="text-[11px] font-medium text-purple-300 flex items-center gap-1.5">
          <Bot className="w-3.5 h-3.5 text-purple-400" /> Agent Workflows & Grounding
        </span>
        <div className="space-y-2">
          {tools.map((t) => (
            <div
              id={`tool-item-${t.name}`}
              key={t.name}
              className="flex items-center justify-between p-2.5 bg-neutral-900/30 hover:bg-[#1a0f35]/50 border border-purple-500/10 rounded-xl transition duration-150"
            >
              <div className="flex flex-col pr-2">
                <span className="text-xs font-semibold text-purple-100">{t.name}</span>
                <span className="text-[9px] text-purple-300/60 leading-tight mt-0.5">{t.description}</span>
              </div>
              <button
                id={`btn-tool-toggle-${t.name}`}
                onClick={() => onToggleTool(t.name)}
                className={`relative inline-flex h-4.5 w-8 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
                  t.enabled ? 'bg-purple-600' : 'bg-neutral-800'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white transition duration-200 ease-in-out mt-0.5 ${
                    t.enabled ? 'translate-x-3.5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Preset Library */}
      <div id="controls-presets-group" className="space-y-2.5 pt-1">
        <span className="text-[11px] font-medium text-purple-300 flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5 text-purple-400" /> Preset Workspace Templates
        </span>
        <div className="grid grid-cols-1 gap-2">
          {PROMPT_PRESETS.map((p) => (
            <button
              id={`btn-apply-preset-${p.id}`}
              key={p.id}
              onClick={() => onApplyPreset(p)}
              className="group p-2.5 text-left bg-neutral-900/20 hover:bg-purple-950/20 border border-purple-500/10 hover:border-purple-500/30 rounded-xl transition-all font-sans cursor-pointer"
            >
              <div className="flex justify-between items-center text-xs font-semibold text-purple-100 group-hover:text-purple-300">
                {p.title}
                <span className="text-[8px] uppercase tracking-wider text-purple-400/80 bg-purple-500/5 px-1 rounded">
                  {p.category}
                </span>
              </div>
              <p className="text-[9px] text-purple-300/50 mt-1 leading-normal">
                {p.description}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
