'use client'
import { useState } from 'react'

interface VoiceProfile {
  title: string
  tone: string
  persona: string
  description: string
}

interface VoiceProfileCardProps {
  profile: VoiceProfile
  selected: boolean
  onSelect: (tone: string, persona: string) => void
}

export default function VoiceProfileCard({ profile, selected, onSelect }: VoiceProfileCardProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border rounded-lg shadow-sm mb-2 bg-white">
      <button type="button" className="w-full flex justify-between items-center p-4" onClick={() => setOpen(!open)}>
        <span className="font-medium text-gray-700">{profile.title}</span>
        <span>{open ? '-' : '+'}</span>
      </button>
      {open && (
        <div className="p-4 border-t text-sm text-gray-600">
          <p className="italic mb-2">{profile.description}</p>
          <button
            type="button"
            onClick={() => onSelect(profile.tone, profile.persona)}
            className={`px-3 py-1 rounded text-white ${selected ? 'bg-accent-dark' : 'bg-accent'} hover:bg-accent-dark`}
          >
            Use {profile.title} Voice
          </button>
        </div>
      )}
    </div>
  )
}
