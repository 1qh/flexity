import type { GridConfig, WidgetLayoutEntry } from './types'
type ChangeCallback<K extends string> = (config: GridConfig<K>) => void
type Listener = () => void
interface Store<K extends string = string> {
  getState: () => StoreState<K>
  reorderKeys: (orderedKeys: K[]) => void
  reset: () => void
  setConfig: (config: GridConfig<K>) => void
  setOnReset: (handler: (() => void) | null) => void
  setOnUserChange: (handler: ChangeCallback<K> | null) => void
  setState: (partial: Partial<StoreState<K>>) => void
  subscribe: (listener: Listener) => () => void
  updateGridConfig: (updates: Partial<GridConfig<K>>) => void
  updateWidgetLayout: (key: K, updates: Partial<WidgetLayoutEntry<K>>) => void
  userChange: () => void
}
interface StoreState<K extends string = string> {
  config: GridConfig<K>
  containerWidth: number
  initialConfig: GridConfig<K>
  itemKeys: K[]
  selectedWidget: K | null
  showDebugBg: boolean
  showDebugBorders: boolean
}
const createStore = <K extends string>(initialConfig: GridConfig<K>): Store<K> => {
  const listeners = new Set<Listener>()
  let state: StoreState<K> = {
      config: { ...initialConfig, layout: initialConfig.layout?.map(e => ({ ...e })) },
      containerWidth: 0,
      initialConfig: { ...initialConfig, layout: initialConfig.layout?.map(e => ({ ...e })) },
      itemKeys: [],
      selectedWidget: null,
      showDebugBg: false,
      showDebugBorders: false
    },
    onUserChangeCb: ChangeCallback<K> | null = null,
    onResetCb: (() => void) | null = null
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
      if (idx === -1) layout.push({ key, ...updates } as WidgetLayoutEntry<K>)
      else layout[idx] = { ...layout[idx], ...updates }
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
        config: { ...state.initialConfig, layout: state.initialConfig.layout?.map(e => ({ ...e })) },
        selectedWidget: null,
        showDebugBg: false,
        showDebugBorders: false
      })
      if (onResetCb) onResetCb()
    },
    setOnUserChange = (handler: ChangeCallback<K> | null) => {
      onUserChangeCb = handler
    },
    setOnReset = (handler: (() => void) | null) => {
      onResetCb = handler
    },
    userChange = () => {
      if (onUserChangeCb) onUserChangeCb(state.config)
    }
  return {
    getState,
    reorderKeys,
    reset,
    setConfig,
    setOnReset,
    setOnUserChange,
    setState,
    subscribe,
    updateGridConfig,
    updateWidgetLayout,
    userChange
  }
}
export { createStore }
export type { Store, StoreState }
