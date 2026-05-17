import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Language, AnalysisResult, HistoryItem } from '../types';

interface AppState {
  code: string;
  language: Language;
  result: AnalysisResult | null;
  isAnalyzing: boolean;
  history: HistoryItem[];
  
  setCode: (code: string) => void;
  setLanguage: (language: Language) => void;
  setResult: (result: AnalysisResult | null) => void;
  setIsAnalyzing: (isAnalyzing: boolean) => void;
  addToHistory: (item: HistoryItem) => void;
  clearHistory: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      code: '',
      language: 'javascript',
      result: null,
      isAnalyzing: false,
      history: [],
      
      setCode: (code) => set({ code }),
      setLanguage: (language) => set({ language }),
      setResult: (result) => set({ result }),
      setIsAnalyzing: (isAnalyzing) => set({ isAnalyzing }),
      addToHistory: (item) => set((state) => ({
        history: [item, ...state.history].slice(0, 50), // Keep last 50
      })),
      clearHistory: () => set({ history: [] }),
    }),
    {
      name: 'fixcode-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ history: state.history }),
    }
  )
);
