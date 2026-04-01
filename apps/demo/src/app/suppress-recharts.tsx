/* eslint-disable no-console */
'use client'
const originalError = console.error
console.error = (...args: unknown[]) => {
  if (typeof args[0] === 'string' && args[0].includes('width(-1)')) return
  originalError(...args)
}
const SuppressRecharts = () => null
export default SuppressRecharts
