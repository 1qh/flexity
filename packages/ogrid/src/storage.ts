/* eslint-disable no-console */
import type { GridConfig } from './types'
import { isDev } from './validation'
const STORAGE_PREFIX = 'ogrid-',
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
      if (isDev()) console.warn('[ogrid] localStorage quota exceeded, persistence disabled', saveError)
    }
  },
  clearConfig = (id: string) => {
    try {
      localStorage.removeItem(`${STORAGE_PREFIX}${id}`)
    } catch {
      // Noop
    }
  }
export { clearConfig, loadConfig, saveConfig }
