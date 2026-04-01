'use client'
import type { ChartConfig } from '@a/ui/chart'
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from '@a/ui/chart'
import { CartesianGrid, Line, LineChart, ReferenceLine, XAxis, YAxis } from 'recharts'
const data = [
    { month: 'Jan', profit: 2400, revenue: 4000 },
    { month: 'Feb', profit: 1398, revenue: 3000 },
    { month: 'Mar', profit: 9800, revenue: 2000 },
    { month: 'Apr', profit: 3908, revenue: 2780 },
    { month: 'May', profit: 4800, revenue: 1890 },
    { month: 'Jun', profit: 3800, revenue: 2390 }
  ],
  chartConfig = {
    profit: { color: 'var(--chart-3)', label: 'Profit' },
    revenue: { color: 'var(--chart-1)', label: 'Revenue' }
  } satisfies ChartConfig,
  tooltipContent = <ChartTooltipContent />,
  legendContent = <ChartLegendContent />,
  LineChartWidget = () => (
    <>
      <span className='text-sm font-medium'>Line Chart</span>
      <ChartContainer config={chartConfig}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray='3 3' />
          <XAxis axisLine={false} dataKey='month' tickLine={false} />
          <YAxis axisLine={false} tickLine={false} />
          <ChartTooltip content={tooltipContent} />
          <ChartLegend content={legendContent} />
          <ReferenceLine stroke='var(--muted-foreground)' strokeDasharray='3 3' y={3000} />
          <Line dataKey='revenue' dot stroke='var(--color-revenue)' strokeWidth={2} type='monotone' />
          <Line dataKey='profit' dot stroke='var(--color-profit)' strokeWidth={2} type='monotone' />
        </LineChart>
      </ChartContainer>
    </>
  )
export default LineChartWidget
