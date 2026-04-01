/** biome-ignore-all lint/suspicious/noEmptyBlockStatements: intentional catch-and-ignore for localStorage */
/* eslint-disable no-console, no-empty */
import type { GridConfig } from './types'
import { isDev } from './validation'
const STORAGE_PREFIX = 'flexity-',
  loadConfig = <K extends string>(id: string): GridConfig<K> | null => {
    try {
      const raw = localStorage.getItem(`${STORAGE_PREFIX}${id}`)
      if (!raw) return null
      return JSON.parse(raw) as GridConfig<K>
    } catch {
      return null
    }
  },
  saveConfig = <K extends string>(id: string, config: GridConfig<K>) => {
    try {
      localStorage.setItem(`${STORAGE_PREFIX}${id}`, JSON.stringify(config))
    } catch (saveError) {
      if (isDev()) console.warn('[flexity] localStorage quota exceeded, persistence disabled', saveError)
    }
  },
  clearConfig = (id: string) => {
    try {
      localStorage.removeItem(`${STORAGE_PREFIX}${id}`)
    } catch {}
  }
export { clearConfig, loadConfig, saveConfig }
