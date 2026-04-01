'use client'
import { useEffect, useRef, useState } from 'react'
const useSize = () => {
  const ref = useRef<HTMLDivElement>(null),
    [size, setSize] = useState({ height: 0, width: 0 })
  useEffect(() => {
    if (!ref.current) return
    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        const w = Math.floor(entry.contentRect.width),
          h = Math.floor(entry.contentRect.height)
        setSize(prev => (prev.width === w && prev.height === h ? prev : { height: h, width: w }))
      }
    })
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])
  return { ref, ...size }
}
export { useSize }
