import type { GridConfig } from './types'
import { createGridComponent } from './grid'
import { createPanelComponent } from './panel'
import { createStore } from './store'
const createGrid = <K extends string = string>() => {
  const store = createStore<K>({} as GridConfig<K>),
    Grid = createGridComponent({ store }),
    Panel = createPanelComponent({ store }),
    reset = () => {
      store.reset()
    }
  return { Grid, Panel, reset }
}
export { createGrid }
export type {
  AllowedContent,
  BannedClass,
  GridConfig,
  GridProps,
  PanelProps,
  PanelRenderProps,
  WidgetLayoutEntry
} from './types'
