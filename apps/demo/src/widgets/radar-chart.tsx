'use client'
import type { ChartConfig } from '@a/ui/chart'
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from '@a/ui/chart'
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from 'recharts'
const data = [
    { a: 120, b: 110, subject: 'Math' },
    { a: 98, b: 130, subject: 'Chinese' },
    { a: 86, b: 130, subject: 'English' },
    { a: 99, b: 100, subject: 'Geography' },
    { a: 85, b: 90, subject: 'Physics' },
    { a: 65, b: 85, subject: 'History' }
  ],
  chartConfig = {
    a: { color: 'var(--chart-1)', label: 'Student A' },
    b: { color: 'var(--chart-2)', label: 'Student B' }
  } satisfies ChartConfig,
  tooltipContent = <ChartTooltipContent />,
  legendContent = <ChartLegendContent />,
  RadarChartWidget = () => (
    <>
      <span className='text-sm font-medium'>Radar Chart</span>
      <ChartContainer config={chartConfig}>
        <RadarChart data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey='subject' />
          <ChartTooltip content={tooltipContent} />
          <ChartLegend content={legendContent} />
          <Radar dataKey='a' fill='var(--color-a)' fillOpacity={0.3} stroke='var(--color-a)' />
          <Radar dataKey='b' fill='var(--color-b)' fillOpacity={0.3} stroke='var(--color-b)' />
        </RadarChart>
      </ChartContainer>
    </>
  )
export default RadarChartWidget
