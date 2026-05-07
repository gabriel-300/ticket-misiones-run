import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export function useUpload() {
  const [uploading, setUploading] = useState(false)

  async function uploadMedicalCert(file: File, userId: string): Promise<string> {
    setUploading(true)
    try {
      const ext = file.name.split('.').pop()
      const path = `medical-certs/${userId}/${Date.now()}.${ext}`
      const { error } = await supabase.storage
        .from('medical-certs')
        .upload(path, file, { upsert: true })
      if (error) throw error
      const { data } = supabase.storage.from('medical-certs').getPublicUrl(path)
      return data.publicUrl
    } finally {
      setUploading(false)
    }
  }

  return { uploadMedicalCert, uploading }
}
