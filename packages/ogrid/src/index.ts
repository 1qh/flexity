import type { GridConfig, GridProps } from './types'
import { createGridComponent } from './grid'
import { createPanelComponent } from './panel'
import { createStore } from './store'
const createGrid = <K extends string = string>() => {
  const store = createStore<K>({} as GridConfig<K>)
  let currentItemKeys: K[] = []
  const OriginalGrid = createGridComponent({ store }),
    Grid = (props: GridProps<K>) => {
      currentItemKeys = Object.keys(props.items) as K[]
      return OriginalGrid(props)
    }
  Grid.displayName = 'Grid'
  const Panel = createPanelComponent({
      getItemKeys: () => currentItemKeys,
      store
    }),
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
