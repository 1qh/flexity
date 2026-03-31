'use client'
import { Card, CardContent, CardHeader, CardTitle } from '@a/ui/card'
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@a/ui/chart'
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from 'recharts'
const data = [
    { subject: 'Math', a: 120, b: 110 },
    { subject: 'Chinese', a: 98, b: 130 },
    { subject: 'English', a: 86, b: 130 },
    { subject: 'Geography', a: 99, b: 100 },
    { subject: 'Physics', a: 85, b: 90 },
    { subject: 'History', a: 65, b: 85 }
  ],
  chartConfig = {
    a: { label: 'Student A', color: 'var(--chart-1)' },
    b: { label: 'Student B', color: 'var(--chart-2)' }
  } satisfies ChartConfig,
  RadarChartWidget = () => (
    <Card>
      <CardHeader>
        <CardTitle>Radar Chart</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <RadarChart data={data}>
            <PolarGrid />
            <PolarAngleAxis dataKey='subject' />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Radar dataKey='a' fill='var(--color-a)' fillOpacity={0.3} stroke='var(--color-a)' />
            <Radar dataKey='b' fill='var(--color-b)' fillOpacity={0.3} stroke='var(--color-b)' />
          </RadarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
export default RadarChartWidget
