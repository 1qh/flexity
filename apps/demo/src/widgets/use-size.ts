'use client'
import { useEffect, useRef, useState } from 'react'
const useSize = () => {
  const ref = useRef<HTMLDivElement>(null),
    [size, setSize] = useState({ height: 0, width: 0 })
  useEffect(() => {
    if (!ref.current) return
    const observer = new ResizeObserver(entries => {
      for (const entry of entries)
        setSize({ height: Math.floor(entry.contentRect.height), width: Math.floor(entry.contentRect.width) })
    })
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])
  return { ref, ...size }
}
export { useSize }
