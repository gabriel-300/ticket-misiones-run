import { useEffect } from 'react'

const SITE_NAME = 'tevent'

export function useSeo(title: string, description?: string) {
  useEffect(() => {
    document.title = title ? `${title} — ${SITE_NAME}` : SITE_NAME

    if (description) {
      let tag = document.querySelector<HTMLMetaElement>('meta[name="description"]')
      if (!tag) {
        tag = document.createElement('meta')
        tag.name = 'description'
        document.head.appendChild(tag)
      }
      tag.content = description

      const ogDesc = document.querySelector<HTMLMetaElement>('meta[property="og:description"]')
      if (ogDesc) ogDesc.content = description
    }

    const ogTitle = document.querySelector<HTMLMetaElement>('meta[property="og:title"]')
    if (ogTitle) ogTitle.content = title ? `${title} — ${SITE_NAME}` : SITE_NAME
  }, [title, description])
}
