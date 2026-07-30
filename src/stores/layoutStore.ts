import { create } from 'zustand'

export interface LayoutState {
  text: string
  setText: (text: string) => void
  clear: () => void
}

export const useLayoutStore = create<LayoutState>()((set) => ({
  text: '',
  setText: (text) => set({ text }),
  clear: () => set({ text: '' }),
}))
