'use client'
import type { ChartConfig } from '@a/ui/chart'
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from '@a/ui/chart'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'
const data = [
    { month: 'Jan', sessions: 4000, users: 2400 },
    { month: 'Feb', sessions: 3000, users: 1398 },
    { month: 'Mar', sessions: 2000, users: 9800 },
    { month: 'Apr', sessions: 2780, users: 3908 },
    { month: 'May', sessions: 1890, users: 4800 },
    { month: 'Jun', sessions: 2390, users: 3800 }
  ],
  chartConfig = {
    sessions: { color: 'var(--chart-2)', label: 'Sessions' },
    users: { color: 'var(--chart-1)', label: 'Users' }
  } satisfies ChartConfig,
  tooltipContent = <ChartTooltipContent />,
  legendContent = <ChartLegendContent />,
  AreaChartWidget = () => (
    <>
      <span className='text-sm font-medium'>Area Chart</span>
      <ChartContainer config={chartConfig}>
        <AreaChart data={data}>
          <CartesianGrid vertical={false} />
          <XAxis axisLine={false} dataKey='month' tickLine={false} />
          <YAxis axisLine={false} tickLine={false} />
          <ChartTooltip content={tooltipContent} />
          <ChartLegend content={legendContent} />
          <Area
            dataKey='users'
            fill='var(--color-users)'
            fillOpacity={0.3}
            stroke='var(--color-users)'
            strokeWidth={2}
            type='monotone'
          />
          <Area
            dataKey='sessions'
            fill='var(--color-sessions)'
            fillOpacity={0.3}
            stroke='var(--color-sessions)'
            strokeWidth={2}
            type='monotone'
          />
        </AreaChart>
      </ChartContainer>
    </>
  )
export default AreaChartWidget
