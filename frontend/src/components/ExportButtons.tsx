'use client'
import { useState } from 'react'

interface Props {
  html: string
}

export default function ExportButtons({ html }: Props) {
  const [status, setStatus] = useState('')

  const toMarkdown = async (htmlContent: string) => {
    const TurndownService = (await import('turndown')).default
    const service = new TurndownService()
    return service.turndown(htmlContent)
  }

  const copyHtml = async () => {
    await navigator.clipboard.writeText(html)
    setStatus('HTML copied!')
  }

  const copyMarkdown = async () => {
    const md = await toMarkdown(html)
    await navigator.clipboard.writeText(md)
    setStatus('Markdown copied!')
  }

  const download = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = filename
    a.click()
  }

  return (
    <div className="flex flex-wrap gap-3 mt-4">
      <button className="bg-accent text-white px-3 py-2 rounded" onClick={copyHtml}>Copy HTML</button>
      <button className="bg-sky-500 text-white px-3 py-2 rounded" onClick={copyMarkdown}>Copy Markdown</button>
      <button className="bg-gray-600 text-white px-3 py-2 rounded" onClick={() => download(html, 'blog.html')}>Download HTML</button>
      <button className="bg-gray-500 text-white px-3 py-2 rounded" onClick={async () => download(await toMarkdown(html), 'blog.md')}>Download .md</button>
      <span className="text-green-600 text-sm ml-2">{status}</span>
    </div>
  )
}
