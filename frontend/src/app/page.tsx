'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import PhotoUpload from '../components/PhotoUpload'
import VoiceProfileCard from '../components/VoiceProfileCard'
import RichTextEditor from '../components/RichTextEditor'
import ExportButtons from '../components/ExportButtons'
import MapPlaceholder from '../components/MapPlaceholder'
import TimelinePlaceholder from '../components/TimelinePlaceholder'
import { generateBlog } from '../lib/api'
import { useBlogStore } from '../store/useBlogStore'

const voiceProfiles = [
  {
    title: 'Anthony Bourdain',
    tone: 'Wry, candid travelogue with raw observations.',
    persona: 'Anthony Bourdain',
    description: '“Wry, candid travelogue with raw observations.”'
  },
  {
    title: 'Nomadic Matt',
    tone: 'Informative, budget-savvy, practical travel advice.',
    persona: 'Nomadic Matt',
    description: '“Informative, budget-savvy, practical travel advice.”'
  },
  {
    title: 'The Blonde Abroad',
    tone: 'Bright, inspirational solo-female travel style.',
    persona: 'The Blonde Abroad',
    description: '“Bright, inspirational solo-female travel style.”'
  }
]

const formSchema = z.object({
  businessDescription: z.string().optional(),
  tone: z.string().optional(),
  persona: z.string().optional(),
  photos: z.custom<File[]>(),
})

type FormValues = z.infer<typeof formSchema>

export default function HomePage() {
  const { register, handleSubmit, setValue } = useForm<FormValues>({
    resolver: zodResolver(formSchema)
  })
  const [files, setFiles] = useState<File[]>([])
  const [editorContent, setEditorContent] = useState('')
  const { loading, blogPost, error, setLoading, setBlogPost, setError } = useBlogStore()
  const [selectedPersona, setSelectedPersona] = useState('')

  const onSubmit = async (data: FormValues) => {
    const formData = new FormData()
    files.forEach(f => formData.append('photos', f))
    if (data.businessDescription) formData.append('businessDescription', data.businessDescription)
    if (data.tone) formData.append('tone', data.tone)
    if (data.persona) formData.append('persona', data.persona)

    try {
      setLoading(true)
      const res = await generateBlog(formData)
      setBlogPost(res.blog_post, res.persona)
      setEditorContent(res.blog_post)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Unknown error'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleVoiceSelect = (tone: string, persona: string) => {
    setValue('tone', tone)
    setValue('persona', persona)
    setSelectedPersona(persona)
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold text-accent">AI Travel Blog Generator</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <PhotoUpload onFiles={(f) => setFiles(f)} />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Blog theme (optional)</label>
          <input type="text" {...register('businessDescription')} className="mt-1 block w-full border rounded-md p-2" />
        </div>

        <div>
          <h2 className="font-semibold mb-2">Choose a Voice Profile</h2>
          {voiceProfiles.map(v => (
            <VoiceProfileCard key={v.title} profile={v} selected={selectedPersona === v.persona} onSelect={handleVoiceSelect} />
          ))}
        </div>

        <button disabled={loading} className="w-full bg-accent text-white py-3 rounded-lg hover:bg-accent-dark disabled:opacity-50">
          {loading ? 'Generating...' : 'Generate Blog Post'}
        </button>
        {error && <p className="text-red-600">{error}</p>}
      </form>

      {loading && <p className="text-accent">Crafting your masterpiece...</p>}

      {blogPost && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">Generated Blog Post</h2>
          <RichTextEditor content={blogPost} onChange={setEditorContent} />
          <ExportButtons html={editorContent} />
        </div>
      )}

      <MapPlaceholder />
      <TimelinePlaceholder />
    </div>
  )
}
