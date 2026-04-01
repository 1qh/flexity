/** biome-ignore-all lint/correctness/useUniqueElementIds: demo page */
/* oxlint-disable react-perf/jsx-no-new-object-as-prop */
'use client'
import dynamic from 'next/dynamic'
import { createGrid } from 'ogrid'
import AccordionWidget from '~/widgets/accordion'
import Avatars from '~/widgets/avatars'
import Badges from '~/widgets/badges'
import CalendarWidget from '~/widgets/calendar'
import CheckboxWidget from '~/widgets/checkbox'
import CommandWidget from '~/widgets/command'
import DataTableWidget from '~/widgets/data-table'
import DatePicker from '~/widgets/date-picker'
import EmptyState from '~/widgets/empty-state'
import FormWidget from '~/widgets/form'
import ProgressBars from '~/widgets/progress-bars'
import Prose from '~/widgets/prose'
import ScrollContent from '~/widgets/scroll-content'
import SeparatorWidget from '~/widgets/separator'
import SkeletonWidget from '~/widgets/skeleton'
import SliderWidget from '~/widgets/slider'
import StatsGrid from '~/widgets/stats-grid'
import TabsPanel from '~/widgets/tabs-panel'
import Timeline from '~/widgets/timeline'
import ToggleGroupWidget from '~/widgets/toggle-group'
const AreaChartWidget = dynamic(async () => import('~/widgets/area-chart'), { ssr: false }),
  BarChartWidget = dynamic(async () => import('~/widgets/bar-chart'), { ssr: false }),
  KpiCard = dynamic(async () => import('~/widgets/kpi-card'), { ssr: false }),
  LineChartWidget = dynamic(async () => import('~/widgets/line-chart'), { ssr: false }),
  PieChartWidget = dynamic(async () => import('~/widgets/pie-chart'), { ssr: false }),
  RadarChartWidget = dynamic(async () => import('~/widgets/radar-chart'), { ssr: false }),
  RadialChartWidget = dynamic(async () => import('~/widgets/radial-chart'), { ssr: false }),
  Sparkline = dynamic(async () => import('~/widgets/sparkline'), { ssr: false }),
  { Grid, Panel } = createGrid(),
  demoConfig = {
    gap: 16,
    layout: [
      { key: 'kpi', w: 400 },
      { key: 'stats', w: 400 },
      { key: 'sparkline', w: 400 },
      { h: 350, key: 'bar', w: 600 },
      { h: 350, key: 'line', w: 600 },
      { h: 350, key: 'area', w: 600 },
      { h: 300, key: 'pie', w: 400 },
      { h: 300, key: 'radar', w: 400 },
      { h: 300, key: 'radial', w: 400 },
      { key: 'table', w: 800 },
      { key: 'progress', w: 400 },
      { key: 'timeline', w: 400 },
      { key: 'badges', w: 300 },
      { key: 'avatars', w: 300 },
      { key: 'calendar', w: 350 },
      { key: 'datePicker', w: 350 },
      { key: 'tabs', w: 500 },
      { key: 'accordion', w: 500 },
      { key: 'form', w: 400 },
      { key: 'command', w: 400 },
      { key: 'toggles', w: 300 },
      { key: 'sliders', w: 300 },
      { key: 'checkboxes', w: 300 },
      { key: 'skeleton', w: 400 },
      { key: 'separator', w: 400 },
      { key: 'empty', w: 300 },
      { h: 350, key: 'scroll', w: 300 },
      { key: 'prose', w: 500 }
    ],
    snap: 8
  },
  Page = () => (
    <div className='flex flex-col gap-2 p-4'>
      <Panel />
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
  )
export default Page
