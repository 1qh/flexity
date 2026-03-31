import { afterEach, describe, expect, it } from 'bun:test'
import { clearConfig, loadConfig, saveConfig } from '../storage'
const mockStorage = (): Storage => {
  const store = new Map<string, string>()
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value)
    },
    removeItem: (key: string) => {
      store.delete(key)
    },
    clear: () => {
      store.clear()
    },
    get length() {
      return store.size
    },
    key: (index: number) => [...store.keys()][index] ?? null
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
    const config = { gap: 16, snap: 8, layout: [{ key: 'a', w: 320 }] }
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
})
