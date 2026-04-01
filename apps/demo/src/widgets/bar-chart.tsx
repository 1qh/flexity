'use client'
import type { ChartConfig } from '@a/ui/chart'
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from '@a/ui/chart'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
const data = [
    { desktop: 186, mobile: 80, month: 'Jan' },
    { desktop: 305, mobile: 200, month: 'Feb' },
    { desktop: 237, mobile: 120, month: 'Mar' },
    { desktop: 73, mobile: 190, month: 'Apr' },
    { desktop: 209, mobile: 130, month: 'May' },
    { desktop: 214, mobile: 140, month: 'Jun' }
  ],
  chartConfig = {
    desktop: { color: 'var(--chart-1)', label: 'Desktop' },
    mobile: { color: 'var(--chart-2)', label: 'Mobile' }
  } satisfies ChartConfig,
  tooltipContent = <ChartTooltipContent />,
  legendContent = <ChartLegendContent />,
  BarChartWidget = () => (
    <>
      <span className='text-sm font-medium'>Bar Chart</span>
      <ChartContainer config={chartConfig}>
        <BarChart data={data}>
          <CartesianGrid vertical={false} />
          <XAxis axisLine={false} dataKey='month' tickLine={false} />
          <YAxis axisLine={false} tickLine={false} />
          <ChartTooltip content={tooltipContent} />
          <ChartLegend content={legendContent} />
          <Bar dataKey='desktop' fill='var(--color-desktop)' radius={4} />
          <Bar dataKey='mobile' fill='var(--color-mobile)' radius={4} />
        </BarChart>
      </ChartContainer>
    </>
  )
export default BarChartWidget
