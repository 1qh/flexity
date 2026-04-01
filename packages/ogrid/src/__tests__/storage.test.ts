/** biome-ignore-all lint/style/noProcessEnv: test env setup */
import { afterEach, describe, expect, it, spyOn } from 'bun:test'
import { clearConfig, loadConfig, saveConfig } from '../storage'
const mockStorage = (): Storage => {
  const store = new Map<string, string>()
  return {
    clear: () => {
      store.clear()
    },
    getItem: (key: string) => store.get(key) ?? null,
    key: (index: number) => [...store.keys()][index] ?? null,
    get length() {
      return store.size
    },
    removeItem: (key: string) => {
      store.delete(key)
    },
    setItem: (key: string, value: string) => {
      store.set(key, value)
    }
  }
}
describe('storage', () => {
  let original: Storage
  afterEach(() => {
    Object.defineProperty(globalThis, 'localStorage', { value: original, writable: true })
  })
  it('saveConfig and loadConfig round-trip', () => {
    original = globalThis.localStorage
    Object.defineProperty(globalThis, 'localStorage', { value: mockStorage(), writable: true })
    const config = { gap: 16, layout: [{ key: 'a', w: 320 }], snap: 8 }
    saveConfig('test', config)
    const loaded = loadConfig<'a'>('test')
    expect(loaded).toEqual(config)
  })
  it('loadConfig returns null for missing key', () => {
    original = globalThis.localStorage
    Object.defineProperty(globalThis, 'localStorage', { value: mockStorage(), writable: true })
    expect(loadConfig('nonexistent')).toBeNull()
  })
  it('clearConfig removes stored config', () => {
    original = globalThis.localStorage
    Object.defineProperty(globalThis, 'localStorage', { value: mockStorage(), writable: true })
    saveConfig('clear-test', { gap: 8 })
    expect(loadConfig('clear-test')).not.toBeNull()
    clearConfig('clear-test')
    expect(loadConfig('clear-test')).toBeNull()
  })
  it('uses ogrid- prefix for keys', () => {
    original = globalThis.localStorage
    const storage = mockStorage()
    Object.defineProperty(globalThis, 'localStorage', { value: storage, writable: true })
    saveConfig('myid', { gap: 4 })
    expect(storage.getItem('ogrid-myid')).not.toBeNull()
    expect(storage.getItem('myid')).toBeNull()
  })
  it('handles quota exceeded gracefully', () => {
    original = globalThis.localStorage
    const storage = mockStorage()
    storage.setItem = () => {
      throw new DOMException('QuotaExceededError')
    }
    Object.defineProperty(globalThis, 'localStorage', { value: storage, writable: true })
    expect(() => saveConfig('quota', { gap: 16 })).not.toThrow()
  })
  it('loadConfig handles corrupted JSON', () => {
    original = globalThis.localStorage
    const storage = mockStorage()
    storage.setItem('ogrid-bad', 'not valid json{{{')
    Object.defineProperty(globalThis, 'localStorage', { value: storage, writable: true })
    expect(loadConfig('bad')).toBeNull()
  })
  it('logs warning to console in dev mode when quota exceeded', () => {
    original = globalThis.localStorage
    const prevEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'development'
    const storage = mockStorage()
    storage.setItem = () => {
      throw new DOMException('QuotaExceededError')
    }
    Object.defineProperty(globalThis, 'localStorage', { value: storage, writable: true })
    const spy = spyOn(console, 'warn').mockReturnValue(undefined)
    saveConfig('quota-warn', { gap: 16 })
    expect(spy).toHaveBeenCalled()
    expect(String(spy.mock.calls[0]?.[0])).toContain('localStorage quota exceeded')
    spy.mockRestore()
    process.env.NODE_ENV = prevEnv
  })
})
