/* eslint-disable @eslint-react/hooks-extra/no-direct-set-state-in-use-effect */
'use client'
import { useEffect, useRef, useState } from 'react'
const useSize = () => {
  const ref = useRef<HTMLDivElement>(null),
    [width, setWidth] = useState(0),
    [height, setHeight] = useState(0),
    prevWRef = useRef(0),
    prevHRef = useRef(0)
  useEffect(() => {
    if (!ref.current) return
    const check = () => {
      if (!ref.current) return
      const w = ref.current.clientWidth,
        h = ref.current.clientHeight
      if (w !== prevWRef.current) {
        prevWRef.current = w
        setWidth(w)
      }
      if (h !== prevHRef.current) {
        prevHRef.current = h
        setHeight(h)
      }
    }
    check()
    const observer = new ResizeObserver(check)
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])
  return { height, ref, width }
}
export { useSize }
