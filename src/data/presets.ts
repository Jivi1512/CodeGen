import { WorkspaceFile, PromptPreset, ModelConfig, AgentTool } from '../types';

export const INITIAL_FILES: WorkspaceFile[] = [
  {
    name: "App.tsx",
    content: `import React, { useState } from 'react';\n\nexport default function App() {\n  const [count, setCount] = useState(0);\n  return (\n    <div className="flex flex-col items-center justify-center min-h-[300px] text-white bg-purple-950/20 p-8 rounded-2xl border border-purple-500/20">\n      <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Interactive Applet</h2>\n      <p className="mt-2 text-purple-200">This sandbox supports live hot-reload compilations.</p>\n      <button \n        onClick={() => setCount(c => c + 1)}\n        className="mt-6 px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 font-bold rounded-lg shadow-lg hover:shadow-purple-500/20 active:scale-95 transition-all"\n      >\n        Clicked {count} times\n      </button>\n    </div>\n  );\n}`,
    language: "typescript"
  },
  {
    name: "schema.json",
    content: `{\n  "$schema": "http://json-schema.org/draft-07/schema#",\n  "title": "AgenticWeatherInput",\n  "type": "object",\n  "properties": {\n    "location": {\n      "type": "string",\n      "description": "City and Country, e.g. London, UK"\n    },\n    "units": {\n      "type": "string",\n      "enum": ["celsius", "fahrenheit"],\n      "default": "celsius"\n    }\n  },\n  "required": ["location"]\n}`,
    language: "json"
  },
  {
    name: "prompt.md",
    content: `# Next-Gen Prompt Studio\n\nYou are an advanced multimodal code generation engine. Your job is to generate interactive, responsive React components using Tailwind CSS.\n\n## Output Rules\n- Wrap files in code blocks labeled \`\`\`tsx\n- Ensure proper state management, react hooks, and click handlers.\n- Strictly use Tailwind CSS for all typography and layouts.`,
    language: "markdown"
  },
  {
    name: "index.css",
    content: `@import "tailwindcss";\n\nbody {\n  background-color: #0b061b;\n  color: #f1f0f7;\n  font-family: 'Inter', sans-serif;\n}`,
    language: "css"
  }
];

export const PROMPT_PRESETS: PromptPreset[] = [
  {
    id: "preset-1",
    title: "Countdown Timer",
    description: "Generate an elegant countdown timer component with pause/reset handlers.",
    prompt: "Generate a fully interactive countdown timer React component with high-contrast text, smooth transitions, pause/resume mechanisms, and circular progress bar. Style with deep space dark borders and neon cyan animations.",
    category: "UI Code"
  },
  {
    id: "preset-2",
    title: "Multimodal Voice Dictation",
    description: "Extract actionable tasks from simulated voice input audio files.",
    prompt: "Analyze the attached voice recording input (or simulated audio wave context below) and return a structured JSON task list with priority scoring and category clusters.",
    category: "Multimodal"
  },
  {
    id: "preset-3",
    title: "Flight Search Grounding",
    description: "Search grounding for cheap summer flights with location context.",
    prompt: "What are the top 3 best reviewed flight pathways to Tokyo from San Francisco or Singapore this summer? Use search grounding to locate exact airline recommendations.",
    category: "Structured"
  },
  {
    id: "preset-4",
    title: "Code Optimizer Agent",
    description: "Refactor a bloated state-machine using elegant memoization.",
    prompt: "Examine this state engine, detect redundant re-renders, and refactor it into clean, isolated state selectors using React.memo and primitive effect triggers.",
    category: "Text"
  }
];

export const INITIAL_CONFIG: ModelConfig = {
  modelName: "gemini-3.5-flash",
  temperature: 0.7,
  maxOutputTokens: 2048,
  topP: 0.95,
  safetyLevel: "standard",
  structuredOutput: false,
  systemInstruction: "You are the primary Google AI Studio coding engine, built to help developers deploy interactive React code prototypes using tailwind utility variables."
};

export const INITIAL_TOOLS: AgentTool[] = [
  {
    name: "Google Search Grounding",
    description: "Augment Gemini prompts with real-time web search links.",
    enabled: true,
    type: "grounding"
  },
  {
    name: "Google Maps Context",
    description: "Add geo-location context with latitude, longitude bounding boxes.",
    enabled: false,
    type: "grounding"
  },
  {
    name: "controlLight(brightness, color)",
    description: "External smart device simulation declaration.",
    enabled: false,
    type: "function"
  },
  {
    name: "getWeather(location, units)",
    description: "Simulated real-time meteorological weather query engine function call.",
    enabled: false,
    type: "function"
  }
];
