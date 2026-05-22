import React, { useState } from 'react';
import { File, FolderOpen, Plus, Trash2, Edit3, Code2, Layers, Check } from 'lucide-react';
import { WorkspaceFile } from '../types';

interface FileExplorerProps {
  files: WorkspaceFile[];
  activeFileName: string;
  onSelectFile: (name: string) => void;
  onCreateFile: (name: string) => void;
  onDeleteFile: (name: string) => void;
  onRenameFile: (oldName: string, newName: string) => void;
}

export default function FileExplorer({
  files,
  activeFileName,
  onSelectFile,
  onCreateFile,
  onDeleteFile,
  onRenameFile,
}: FileExplorerProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [editingName, setEditingName] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileName.trim()) return;
    
    // Add extension if missing
    let finalName = newFileName.trim();
    if (!finalName.includes('.')) {
      finalName += '.tsx';
    }
    
    onCreateFile(finalName);
    setNewFileName('');
    setIsCreating(false);
  };

  const startRename = (name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingName(name);
    setEditingValue(name);
  };

  const handleRenameSubmit = (oldName: string) => {
    if (editingValue.trim() && editingValue !== oldName) {
      onRenameFile(oldName, editingValue.trim());
    }
    setEditingName(null);
  };

  const getFileIcon = (name: string) => {
    if (name.endsWith('.tsx') || name.endsWith('.ts')) return <Code2 id={`icon-code-${name}`} className="w-4 h-4 text-cyan-400" />;
    if (name.endsWith('.json')) return <Layers id={`icon-json-${name}`} className="w-4 h-4 text-purple-400" />;
    if (name.endsWith('.css')) return <File id={`icon-css-${name}`} className="w-4 h-4 text-emerald-400" />;
    return <File id={`icon-file-${name}`} className="w-4 h-4 text-gray-400" />;
  };

  return (
    <div id="file-explorer-container" className="flex flex-col h-full bg-[#130d22]/40 backdrop-blur-md rounded-xl border border-purple-500/10 overflow-hidden">
      {/* Sidebar Header */}
      <div id="file-explorer-header" className="flex items-center justify-between px-4 py-3 bg-[#130725]/80 border-b border-purple-500/10">
        <div id="file-explorer-title" className="flex items-center gap-2">
          <FolderOpen id="folder-open-icon" className="w-4 h-4 text-purple-400" />
          <span className="text-xs font-semibold uppercase tracking-wider text-purple-200">Workspace Files</span>
        </div>
        <button
          id="btn-add-file"
          onClick={() => setIsCreating(!isCreating)}
          className="p-1 rounded hover:bg-purple-950/40 text-purple-300 hover:text-white transition-all active:scale-95"
          title="Create New File"
        >
          <Plus id="plus-icon" className="w-4.5 h-4.5" />
        </button>
      </div>

      {/* Inline File Creator */}
      {isCreating && (
        <form id="create-file-form" onSubmit={handleCreateSubmit} className="p-3 bg-[#1e1338]/40 border-b border-purple-500/10">
          <div className="flex gap-2">
            <input
              id="input-new-file-name"
              type="text"
              autoFocus
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              placeholder="filename.tsx"
              className="flex-1 text-xs bg-[#10071e] text-white py-1 px-2.5 rounded border border-purple-500/30 focus:outline-none focus:border-purple-400 transition"
            />
            <button
              id="btn-confirm-file-create"
              type="submit"
              className="px-2 py-1 bg-purple-600 hover:bg-purple-500 rounded text-xs text-white"
            >
              Add
            </button>
          </div>
          <span className="text-[10px] text-purple-300 mt-1 block">Press enter or Add (.tsx, .css, .json)</span>
        </form>
      )}

      {/* Workspace Applet Workspace Status (Sleek minimalist, NOT larping or online/active labels) */}
      <div id="file-explorer-list" className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin">
        {files.map((file) => {
          const isActive = file.name === activeFileName;
          const isEditing = file.name === editingName;

          return (
            <div
              id={`file-item-${file.name}`}
              key={file.name}
              onClick={() => onSelectFile(file.name)}
              className={`group flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-all duration-150 ${
                isActive
                  ? 'bg-purple-950/40 border border-purple-500/30 text-white font-medium shadow-inner'
                  : 'text-purple-200/70 hover:bg-purple-950/20 hover:text-white border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2.5 flex-1 min-w-0">
                {getFileIcon(file.name)}
                {isEditing ? (
                  <input
                    id={`input-rename-${file.name}`}
                    type="text"
                    value={editingValue}
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => setEditingValue(e.target.value)}
                    onBlur={() => handleRenameSubmit(file.name)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleRenameSubmit(file.name);
                      if (e.key === 'Escape') setEditingName(null);
                    }}
                    className="flex-1 text-xs bg-[#10071e] text-white py-0.5 px-1.5 rounded border border-purple-400 focus:outline-none"
                  />
                ) : (
                  <span className="text-xs truncate">{file.name}</span>
                )}
              </div>

              {/* Action Buttons available on hover */}
              {!isEditing && (
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    id={`btn-rename-${file.name}`}
                    onClick={(e) => startRename(file.name, e)}
                    className="p-1 rounded hover:bg-purple-900/40 text-purple-300 hover:text-white transition"
                    title="Rename File"
                  >
                    <Edit3 className="w-3 h-3" />
                  </button>
                  {/* Do not allow deleting basic files critical for template render to keep it safe */}
                  {file.name !== 'App.tsx' && file.name !== 'index.css' && (
                    <button
                      id={`btn-delete-${file.name}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteFile(file.name);
                      }}
                      className="p-1 rounded hover:bg-red-950/40 text-red-400 hover:text-red-300 transition"
                      title="Delete File"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
