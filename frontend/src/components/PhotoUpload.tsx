'use client'
import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'

interface PhotoUploadProps {
  onFiles: (files: File[]) => void
}

export default function PhotoUpload({ onFiles }: PhotoUploadProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    onFiles(acceptedFiles)
  }, [onFiles])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'image/*': [] } })

  return (
    <div {...getRootProps()} className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer ${isDragActive ? 'bg-accent-light' : 'bg-gray-50'}`}> 
      <input {...getInputProps()} />
      <p className="text-sm text-gray-600">Drag & drop photos here, or click to select</p>
    </div>
  )
}
