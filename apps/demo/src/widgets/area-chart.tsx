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
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'
const data = [
    { month: 'Jan', users: 2400, sessions: 4000 },
    { month: 'Feb', users: 1398, sessions: 3000 },
    { month: 'Mar', users: 9800, sessions: 2000 },
    { month: 'Apr', users: 3908, sessions: 2780 },
    { month: 'May', users: 4800, sessions: 1890 },
    { month: 'Jun', users: 3800, sessions: 2390 }
  ],
  chartConfig = {
    users: { label: 'Users', color: 'var(--chart-1)' },
    sessions: { label: 'Sessions', color: 'var(--chart-2)' }
  } satisfies ChartConfig,
  AreaChartWidget = () => (
    <Card>
      <CardHeader>
        <CardTitle>Area Chart</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <AreaChart data={data}>
            <CartesianGrid vertical={false} />
            <XAxis axisLine={false} dataKey='month' tickLine={false} />
            <YAxis axisLine={false} tickLine={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
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
      </CardContent>
    </Card>
  )
export default AreaChartWidget
