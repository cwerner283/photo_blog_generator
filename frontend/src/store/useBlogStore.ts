import { create } from 'zustand'

interface BlogState {
  loading: boolean
  blogPost: string | null
  persona: string | null
  error: string | null
  setLoading: (loading: boolean) => void
  setBlogPost: (content: string | null, persona: string | null) => void
  setError: (err: string | null) => void
}

export const useBlogStore = create<BlogState>((set) => ({
  loading: false,
  blogPost: null,
  persona: null,
  error: null,
  setLoading: (loading) => set({ loading }),
  setBlogPost: (content, persona) => set({ blogPost: content, persona }),
  setError: (err) => set({ error: err }),
}))
