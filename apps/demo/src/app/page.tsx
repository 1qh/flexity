/** biome-ignore-all lint/correctness/useUniqueElementIds: demo page */
'use client'
import { createGrid } from 'ogrid'
import AccordionWidget from '~/widgets/accordion-widget'
import AreaChartWidget from '~/widgets/area-chart'
import Avatars from '~/widgets/avatars'
import Badges from '~/widgets/badges'
import BarChartWidget from '~/widgets/bar-chart'
import CalendarWidget from '~/widgets/calendar-widget'
import CheckboxWidget from '~/widgets/checkbox-widget'
import DataTableWidget from '~/widgets/data-table'
import EmptyState from '~/widgets/empty-state'
import FormWidget from '~/widgets/form-widget'
import KpiCard from '~/widgets/kpi-card'
import LineChartWidget from '~/widgets/line-chart'
import PieChartWidget from '~/widgets/pie-chart'
import ProgressBars from '~/widgets/progress-bars'
import Prose from '~/widgets/prose'
import RadarChartWidget from '~/widgets/radar-chart'
import RadialChartWidget from '~/widgets/radial-chart'
import ScrollContent from '~/widgets/scroll-content'
import SkeletonWidget from '~/widgets/skeleton-widget'
import SliderWidget from '~/widgets/slider-widget'
import Sparkline from '~/widgets/sparkline'
import StatsGrid from '~/widgets/stats-grid'
import TabsPanel from '~/widgets/tabs-panel'
import Timeline from '~/widgets/timeline'
import ToggleGroupWidget from '~/widgets/toggle-group-widget'
const { Grid, Panel } = createGrid(),
  Page = () => (
    <div className='flex gap-4 p-4'>
      <div className='flex-1'>
        <Grid
          className='p-2'
          id='demo'
          items={{
            kpi: <KpiCard />,
            stats: <StatsGrid />,
            bar: <BarChartWidget />,
            line: <LineChartWidget />,
            area: <AreaChartWidget />,
            pie: <PieChartWidget />,
            radar: <RadarChartWidget />,
            radial: <RadialChartWidget />,
            sparkline: <Sparkline />,
            table: <DataTableWidget />,
            progress: <ProgressBars />,
            badges: <Badges />,
            avatars: <Avatars />,
            calendar: <CalendarWidget />,
            timeline: <Timeline />,
            tabs: <TabsPanel />,
            accordion: <AccordionWidget />,
            form: <FormWidget />,
            toggles: <ToggleGroupWidget />,
            sliders: <SliderWidget />,
            checkboxes: <CheckboxWidget />,
            skeleton: <SkeletonWidget />,
            empty: <EmptyState />,
            scroll: <ScrollContent />,
            prose: <Prose />
          }}
        />
      </div>
      <div className='w-64 shrink-0'>
        <Panel />
      </div>
    </div>
  )
export default Page
