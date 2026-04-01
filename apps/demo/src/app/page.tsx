/** biome-ignore-all lint/correctness/useUniqueElementIds: demo page */
/* oxlint-disable react-perf/jsx-no-new-object-as-prop */
'use client'
import { createGrid } from 'ogrid'
import AccordionWidget from '~/widgets/accordion'
import AreaChartWidget from '~/widgets/area-chart'
import Avatars from '~/widgets/avatars'
import Badges from '~/widgets/badges'
import BarChartWidget from '~/widgets/bar-chart'
import CalendarWidget from '~/widgets/calendar'
import CheckboxWidget from '~/widgets/checkbox'
import CommandWidget from '~/widgets/command'
import DataTableWidget from '~/widgets/data-table'
import DatePicker from '~/widgets/date-picker'
import EmptyState from '~/widgets/empty-state'
import FormWidget from '~/widgets/form'
import KpiCard from '~/widgets/kpi-card'
import LineChartWidget from '~/widgets/line-chart'
import PieChartWidget from '~/widgets/pie-chart'
import ProgressBars from '~/widgets/progress-bars'
import Prose from '~/widgets/prose'
import RadarChartWidget from '~/widgets/radar-chart'
import RadialChartWidget from '~/widgets/radial-chart'
import ScrollContent from '~/widgets/scroll-content'
import SeparatorWidget from '~/widgets/separator'
import SkeletonWidget from '~/widgets/skeleton'
import SliderWidget from '~/widgets/slider'
import Sparkline from '~/widgets/sparkline'
import StatsGrid from '~/widgets/stats-grid'
import TabsPanel from '~/widgets/tabs-panel'
import Timeline from '~/widgets/timeline'
import ToggleGroupWidget from '~/widgets/toggle-group'
const { Grid, Panel } = createGrid(),
  demoConfig = {
    gap: 16,
    layout: [
      { className: 'rounded-lg border border-border bg-card p-4', key: 'kpi', w: 400 },
      { className: 'rounded-lg border border-border bg-card p-4', key: 'stats', w: 400 },
      { className: 'rounded-lg border border-border bg-card p-4', key: 'sparkline', w: 400 },
      { className: 'rounded-lg border border-border bg-card p-4', key: 'bar', w: 600 },
      { className: 'rounded-lg border border-border bg-card p-4', key: 'line', w: 600 },
      { className: 'rounded-lg border border-border bg-card p-4', key: 'area', w: 600 },
      { className: 'rounded-lg border border-border bg-card p-4', key: 'pie', w: 400 },
      { className: 'rounded-lg border border-border bg-card p-4', key: 'radar', w: 400 },
      { className: 'rounded-lg border border-border bg-card p-4', key: 'radial', w: 400 },
      { className: 'rounded-lg border border-border bg-card p-4', key: 'table', w: 800 },
      { className: 'rounded-lg border border-border bg-card p-4', key: 'progress', w: 400 },
      { className: 'rounded-lg border border-border bg-card p-4', key: 'timeline', w: 400 },
      { className: 'rounded-lg border border-border bg-card p-4', key: 'badges', w: 300 },
      { className: 'rounded-lg border border-border bg-card p-4', key: 'avatars', w: 300 },
      { className: 'rounded-lg border border-border bg-card p-4', key: 'calendar', w: 350 },
      { className: 'rounded-lg border border-border bg-card p-4', key: 'datePicker', w: 350 },
      { className: 'rounded-lg border border-border bg-card p-4', key: 'tabs', w: 500 },
      { className: 'rounded-lg border border-border bg-card p-4', key: 'accordion', w: 500 },
      { className: 'rounded-lg border border-border bg-card p-4', key: 'form', w: 400 },
      { className: 'rounded-lg border border-border bg-card p-4', key: 'command', w: 400 },
      { className: 'rounded-lg border border-border bg-card p-4', key: 'toggles', w: 300 },
      { className: 'rounded-lg border border-border bg-card p-4', key: 'sliders', w: 300 },
      { className: 'rounded-lg border border-border bg-card p-4', key: 'checkboxes', w: 300 },
      { className: 'rounded-lg border border-border bg-card p-4', key: 'skeleton', w: 400 },
      { className: 'rounded-lg border border-border bg-card p-4', key: 'separator', w: 400 },
      { className: 'rounded-lg border border-border bg-card p-4', key: 'empty', w: 300 },
      { className: 'rounded-lg border border-border bg-card p-4', h: 350, key: 'scroll', w: 300 },
      { className: 'rounded-lg border border-border bg-card p-4', key: 'prose', w: 500 }
    ],
    snap: 8
  },
  Page = () => (
    <div className='flex gap-4 p-4'>
      <div className='min-w-0 flex-1'>
        <Grid
          config={demoConfig}
          id='demo'
          items={{
            accordion: <AccordionWidget />,
            area: <AreaChartWidget />,
            avatars: <Avatars />,
            badges: <Badges />,
            bar: <BarChartWidget />,
            calendar: <CalendarWidget />,
            checkboxes: <CheckboxWidget />,
            command: <CommandWidget />,
            datePicker: <DatePicker />,
            empty: <EmptyState />,
            form: <FormWidget />,
            kpi: <KpiCard />,
            line: <LineChartWidget />,
            pie: <PieChartWidget />,
            progress: <ProgressBars />,
            prose: <Prose />,
            radar: <RadarChartWidget />,
            radial: <RadialChartWidget />,
            scroll: <ScrollContent />,
            separator: <SeparatorWidget />,
            skeleton: <SkeletonWidget />,
            sliders: <SliderWidget />,
            sparkline: <Sparkline />,
            stats: <StatsGrid />,
            table: <DataTableWidget />,
            tabs: <TabsPanel />,
            timeline: <Timeline />,
            toggles: <ToggleGroupWidget />
          }}
        />
      </div>
      <div className='w-64 shrink-0'>
        <Panel />
      </div>
    </div>
  )
export default Page
