/** biome-ignore-all lint/style/noProcessEnv: env check */
/* eslint-disable no-console, @typescript-eslint/no-unsafe-member-access */
import type { GridConfig } from './types'
const STORAGE_PREFIX = 'ogrid-',
  isDev = () => typeof process !== 'undefined' && process.env.NODE_ENV === 'development',
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
