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
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
const data = [
    { month: 'Jan', desktop: 186, mobile: 80 },
    { month: 'Feb', desktop: 305, mobile: 200 },
    { month: 'Mar', desktop: 237, mobile: 120 },
    { month: 'Apr', desktop: 73, mobile: 190 },
    { month: 'May', desktop: 209, mobile: 130 },
    { month: 'Jun', desktop: 214, mobile: 140 }
  ],
  chartConfig = {
    desktop: { label: 'Desktop', color: 'var(--chart-1)' },
    mobile: { label: 'Mobile', color: 'var(--chart-2)' }
  } satisfies ChartConfig,
  BarChartWidget = () => (
    <Card>
      <CardHeader>
        <CardTitle>Bar Chart</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart data={data}>
            <CartesianGrid vertical={false} />
            <XAxis axisLine={false} dataKey='month' tickLine={false} />
            <YAxis axisLine={false} tickLine={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar dataKey='desktop' fill='var(--color-desktop)' radius={4} />
            <Bar dataKey='mobile' fill='var(--color-mobile)' radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
export default BarChartWidget
