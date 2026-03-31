'use client'
import { Card, CardContent, CardHeader, CardTitle } from '@a/ui/card'
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent
} from '@a/ui/chart'
import { CartesianGrid, Line, LineChart, ReferenceLine, XAxis, YAxis } from 'recharts'
const data = [
    { month: 'Jan', revenue: 4000, profit: 2400 },
    { month: 'Feb', revenue: 3000, profit: 1398 },
    { month: 'Mar', revenue: 2000, profit: 9800 },
    { month: 'Apr', revenue: 2780, profit: 3908 },
    { month: 'May', revenue: 1890, profit: 4800 },
    { month: 'Jun', revenue: 2390, profit: 3800 }
  ],
  chartConfig = {
    revenue: { label: 'Revenue', color: 'var(--chart-1)' },
    profit: { label: 'Profit', color: 'var(--chart-3)' }
  } satisfies ChartConfig,
  LineChartWidget = () => (
    <Card>
      <CardHeader>
        <CardTitle>Line Chart</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray='3 3' />
            <XAxis axisLine={false} dataKey='month' tickLine={false} />
            <YAxis axisLine={false} tickLine={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <ReferenceLine stroke='var(--muted-foreground)' strokeDasharray='3 3' y={3000} />
            <Line dataKey='revenue' dot stroke='var(--color-revenue)' strokeWidth={2} type='monotone' />
            <Line dataKey='profit' dot stroke='var(--color-profit)' strokeWidth={2} type='monotone' />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
export default LineChartWidget
