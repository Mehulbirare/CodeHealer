import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Language, AnalysisResult, HistoryItem, Project } from '../types';

const makeDefaultProject = (): Project => ({
  id: 'default',
  name: 'My Project',
  language: 'javascript',
  code: '',
  history: [],
  createdAt: Date.now(),
});

interface AppState {
  projects: Project[];
  activeProjectId: string;
  result: AnalysisResult | null;
  isAnalyzing: boolean;

  createProject: (name: string) => void;
  deleteProject: (id: string) => void;
  renameProject: (id: string, name: string) => void;
  setActiveProject: (id: string) => void;

  setCode: (code: string) => void;
  setLanguage: (language: Language) => void;
  setResult: (result: AnalysisResult | null) => void;
  setIsAnalyzing: (isAnalyzing: boolean) => void;
  addToHistory: (item: HistoryItem) => void;
  clearHistory: () => void;
}

export const selectActiveProject = (state: AppState): Project =>
  state.projects.find(p => p.id === state.activeProjectId) ?? state.projects[0];

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      projects: [makeDefaultProject()],
      activeProjectId: 'default',
      result: null,
      isAnalyzing: false,

      createProject: (name) => {
        const id = Date.now().toString();
        const project: Project = {
          id,
          name: name.trim() || 'Untitled',
          language: 'javascript',
          code: '',
          history: [],
          createdAt: Date.now(),
        };
        set((state) => ({
          projects: [...state.projects, project],
          activeProjectId: id,
          result: null,
        }));
      },

      deleteProject: (id) => set((state) => {
        if (state.projects.length <= 1) return state;
        const remaining = state.projects.filter(p => p.id !== id);
        const newActiveId = state.activeProjectId === id
          ? remaining[remaining.length - 1].id
          : state.activeProjectId;
        return { projects: remaining, activeProjectId: newActiveId, result: null };
      }),

      renameProject: (id, name) => set((state) => ({
        projects: state.projects.map(p =>
          p.id === id ? { ...p, name: name.trim() || p.name } : p
        ),
      })),

      setActiveProject: (id) => set({ activeProjectId: id, result: null }),

      setCode: (code) => set((state) => ({
        projects: state.projects.map(p =>
          p.id === state.activeProjectId ? { ...p, code } : p
        ),
      })),

      setLanguage: (language) => set((state) => ({
        projects: state.projects.map(p =>
          p.id === state.activeProjectId ? { ...p, language } : p
        ),
      })),

      setResult: (result) => set({ result }),
      setIsAnalyzing: (isAnalyzing) => set({ isAnalyzing }),

      addToHistory: (item) => set((state) => ({
        projects: state.projects.map(p =>
          p.id === state.activeProjectId
            ? { ...p, history: [item, ...p.history].slice(0, 50) }
            : p
        ),
      })),

      clearHistory: () => set((state) => ({
        projects: state.projects.map(p =>
          p.id === state.activeProjectId ? { ...p, history: [] } : p
        ),
      })),
    }),
    {
      name: 'fixcode-storage',
      storage: createJSONStorage(() => localStorage),
      version: 2,
      migrate: (persisted: any, version: number) => {
        if (version < 2) {
          const oldHistory: HistoryItem[] = persisted?.history ?? [];
          const project = makeDefaultProject();
          project.history = oldHistory;
          return { projects: [project], activeProjectId: 'default' };
        }
        return persisted;
      },
      partialize: (state) => ({
        projects: state.projects,
        activeProjectId: state.activeProjectId,
      }),
    }
  )
);
