export interface WorkspaceFile {
  name: string;
  content: string;
  language: string;
  isOpen?: boolean;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  type: 'info' | 'success' | 'warn' | 'error';
  message: string;
  latency?: number;
  tokens?: number;
}

export interface PromptPreset {
  id: string;
  title: string;
  description: string;
  prompt: string;
  category: 'Text' | 'Multimodal' | 'UI Code' | 'Structured';
}

export interface ModelConfig {
  modelName: string;
  temperature: number;
  maxOutputTokens: number;
  topP: number;
  safetyLevel: 'standard' | 'high' | 'low';
  structuredOutput: boolean;
  systemInstruction: string;
}

export interface AgentTool {
  name: string;
  description: string;
  enabled: boolean;
  type: 'function' | 'grounding';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  attachments?: {
    name: string;
    type: string;
    preview: string;
    data?: string; // base64 payload
  }[];
  timestamp: string;
  modelUsed?: string;
}
