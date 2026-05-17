import { useState, useRef, useEffect } from 'react';
import type { Project } from '../types';

interface Props {
  projects: Project[];
  activeProjectId: string;
  onSwitch: (id: string) => void;
  onCreate: (name: string) => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
}

export function ProjectSelector({ projects, activeProjectId, onSwitch, onCreate, onRename, onDelete }: Props) {
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const activeProject = projects.find(p => p.id === activeProjectId) ?? projects[0];

  useEffect(() => {
    if (!open) return;
    const handleOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setCreating(false);
        setRenamingId(null);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [open]);

  const handleCreate = () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    onCreate(trimmed);
    setNewName('');
    setCreating(false);
    setOpen(false);
  };

  const startRename = (project: Project) => {
    setRenamingId(project.id);
    setRenameValue(project.name);
  };

  const commitRename = (id: string) => {
    if (renameValue.trim()) onRename(id, renameValue.trim());
    setRenamingId(null);
    setRenameValue('');
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
          open
            ? 'bg-white/10 border-neon-cyan/30 text-gray-200'
            : 'bg-white/5 border-white/10 hover:bg-white/10 text-gray-300'
        }`}
      >
        <span className="max-w-[7rem] truncate">{activeProject.name}</span>
        <svg
          className={`w-3 h-3 text-gray-500 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1.5 w-60 bg-gray-900 border border-white/10 rounded-xl shadow-2xl z-50 py-1.5 overflow-hidden">
          <p className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-600">Projects</p>

          {projects.map((project) => (
            <div
              key={project.id}
              className={`flex items-center gap-1.5 px-3 py-2 group ${
                project.id === activeProjectId ? 'bg-white/5' : 'hover:bg-white/5'
              }`}
            >
              {renamingId === project.id ? (
                <input
                  autoFocus
                  value={renameValue}
                  onChange={e => setRenameValue(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') commitRename(project.id);
                    if (e.key === 'Escape') { setRenamingId(null); setRenameValue(''); }
                  }}
                  onBlur={() => commitRename(project.id)}
                  className="flex-1 min-w-0 bg-white/10 text-xs text-gray-200 px-2 py-0.5 rounded outline-none border border-neon-cyan/40"
                />
              ) : (
                <button
                  onClick={() => { onSwitch(project.id); setOpen(false); }}
                  className="flex-1 min-w-0 text-left text-xs text-gray-300 flex items-center gap-1.5"
                >
                  {project.id === activeProjectId
                    ? <span className="text-neon-cyan flex-shrink-0 text-[11px]">✓</span>
                    : <span className="w-3 flex-shrink-0" />
                  }
                  <span className="truncate">{project.name}</span>
                </button>
              )}

              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 flex-shrink-0 transition-opacity">
                <button
                  onClick={e => { e.stopPropagation(); startRename(project); }}
                  title="Rename"
                  className="p-1 rounded text-gray-600 hover:text-gray-200 hover:bg-white/10 transition-colors"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                {projects.length > 1 && (
                  <button
                    onClick={e => { e.stopPropagation(); onDelete(project.id); }}
                    title="Delete project"
                    className="p-1 rounded text-gray-600 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          ))}

          <div className="border-t border-white/10 mt-1 pt-1">
            {creating ? (
              <div className="flex items-center gap-2 px-3 py-2">
                <input
                  autoFocus
                  value={newName}
                  placeholder="Project name…"
                  onChange={e => setNewName(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleCreate();
                    if (e.key === 'Escape') { setCreating(false); setNewName(''); }
                  }}
                  className="flex-1 bg-white/10 text-xs text-gray-200 placeholder-gray-600 px-2 py-1 rounded outline-none border border-neon-cyan/40"
                />
                <button
                  onClick={handleCreate}
                  className="text-xs font-semibold text-neon-cyan hover:text-white transition-colors"
                >
                  Add
                </button>
              </div>
            ) : (
              <button
                onClick={() => setCreating(true)}
                className="w-full text-left px-3 py-2 text-xs text-gray-500 hover:text-gray-300 hover:bg-white/5 transition-colors flex items-center gap-2"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New project
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
