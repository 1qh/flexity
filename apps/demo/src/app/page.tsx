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
import CommandWidget from '~/widgets/command-widget'
import DataTableWidget from '~/widgets/data-table'
import DatePicker from '~/widgets/date-picker'
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
import SeparatorWidget from '~/widgets/separator-widget'
import SkeletonWidget from '~/widgets/skeleton-widget'
import SliderWidget from '~/widgets/slider-widget'
import Sparkline from '~/widgets/sparkline'
import StatsGrid from '~/widgets/stats-grid'
import TabsPanel from '~/widgets/tabs-panel'
import Timeline from '~/widgets/timeline'
import ToggleGroupWidget from '~/widgets/toggle-group-widget'

const { Grid, Panel } = createGrid()

const Page = () => (
  <div className="flex gap-4 p-4">
    <div className="min-w-0 flex-1">
      <Grid
        config={{
          gap: 16,
          snap: 8,
          layout: [
            { key: 'kpi', w: 400 },
            { key: 'stats', w: 400 },
            { key: 'sparkline', w: 400 },
            { key: 'bar', w: 600 },
            { key: 'line', w: 600 },
            { key: 'area', w: 600 },
            { key: 'pie', w: 400 },
            { key: 'radar', w: 400 },
            { key: 'radial', w: 400 },
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
            { key: 'scroll', w: 300, h: 350 },
            { key: 'prose', w: 500 },
          ],
        }}
        id="demo"
        items={{
          kpi: <KpiCard />,
          stats: <StatsGrid />,
          sparkline: <Sparkline />,
          bar: <BarChartWidget />,
          line: <LineChartWidget />,
          area: <AreaChartWidget />,
          pie: <PieChartWidget />,
          radar: <RadarChartWidget />,
          radial: <RadialChartWidget />,
          table: <DataTableWidget />,
          progress: <ProgressBars />,
          timeline: <Timeline />,
          badges: <Badges />,
          avatars: <Avatars />,
          calendar: <CalendarWidget />,
          datePicker: <DatePicker />,
          tabs: <TabsPanel />,
          accordion: <AccordionWidget />,
          form: <FormWidget />,
          command: <CommandWidget />,
          toggles: <ToggleGroupWidget />,
          sliders: <SliderWidget />,
          checkboxes: <CheckboxWidget />,
          skeleton: <SkeletonWidget />,
          separator: <SeparatorWidget />,
          empty: <EmptyState />,
          scroll: <ScrollContent />,
          prose: <Prose />,
        }}
      />
    </div>
    <div className="w-64 shrink-0">
      <Panel />
    </div>
  </div>
)

export default Page
