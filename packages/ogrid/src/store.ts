import type { GridConfig, WidgetLayoutEntry } from './types'
type Listener = () => void
interface Store<K extends string = string> {
  getState: () => StoreState<K>
  reorderKeys: (orderedKeys: K[]) => void
  reset: () => void
  setConfig: (config: GridConfig<K>) => void
  setState: (partial: Partial<StoreState<K>>) => void
  subscribe: (listener: Listener) => () => void
  updateGridConfig: (updates: Partial<GridConfig<K>>) => void
  updateWidgetLayout: (key: K, updates: Partial<WidgetLayoutEntry<K>>) => void
}
interface StoreState<K extends string = string> {
  config: GridConfig<K>
  containerWidth: number
  initialConfig: GridConfig<K>
  selectedWidget: K | null
  showDebugBg: boolean
  showDebugBorders: boolean
}
const createStore = <K extends string>(initialConfig: GridConfig<K>): Store<K> => {
  const listeners = new Set<Listener>()
  let state: StoreState<K> = {
    config: { ...initialConfig },
    initialConfig: { ...initialConfig },
    selectedWidget: null,
    containerWidth: 0,
    showDebugBorders: false,
    showDebugBg: false
  }
  const notify = () => {
      for (const listener of listeners) listener()
    },
    getState = () => state,
    setState = (partial: Partial<StoreState<K>>) => {
      state = { ...state, ...partial }
      notify()
    },
    subscribe = (listener: Listener) => {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
    setConfig = (config: GridConfig<K>) => {
      setState({ config: { ...config } })
    },
    updateWidgetLayout = (key: K, updates: Partial<WidgetLayoutEntry<K>>) => {
      const current = state.config,
        layout = [...(current.layout ?? [])],
        idx = layout.findIndex(e => e.key === key)
      if (idx >= 0) layout[idx] = { ...layout[idx], ...updates }
      else layout.push({ key, ...updates } as WidgetLayoutEntry<K>)
      setState({ config: { ...current, layout } })
    },
    updateGridConfig = (updates: Partial<GridConfig<K>>) => {
      setState({ config: { ...state.config, ...updates } })
    },
    reorderKeys = (orderedKeys: K[]) => {
      const current = state.config,
        layout = current.layout ?? [],
        layoutMap = new Map<K, WidgetLayoutEntry<K>>()
      for (const entry of layout) layoutMap.set(entry.key, entry)
      const newLayout: WidgetLayoutEntry<K>[] = []
      for (const key of orderedKeys) {
        const entry = layoutMap.get(key)
        if (entry) newLayout.push(entry)
      }
      for (const entry of layout) if (!orderedKeys.includes(entry.key)) newLayout.push(entry)
      setState({ config: { ...current, layout: newLayout } })
    },
    reset = () => {
      setState({
        config: { ...state.initialConfig },
        selectedWidget: null
      })
    }
  return {
    getState,
    setState,
    subscribe,
    setConfig,
    updateWidgetLayout,
    updateGridConfig,
    reorderKeys,
    reset
  }
}
export { createStore }
export type { Store, StoreState }
