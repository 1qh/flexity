'use client'
import type { ChartConfig } from '@a/ui/chart'
import { Card, CardContent, CardHeader, CardTitle } from '@a/ui/card'
import { ChartContainer } from '@a/ui/chart'
import { PolarAngleAxis, RadialBar, RadialBarChart } from 'recharts'
const POLAR_DOMAIN = [0, 100] as const,
  data = [{ fill: 'var(--chart-1)', value: 72 }],
  chartConfig = {
    value: { color: 'var(--chart-1)', label: 'Progress' }
  } satisfies ChartConfig,
  RadialChartWidget = () => (
    <Card>
      <CardHeader>
        <CardTitle>Radial Progress</CardTitle>
      </CardHeader>
      <CardContent className='flex items-center justify-center'>
        <ChartContainer className='aspect-square' config={chartConfig}>
          <RadialBarChart data={data} endAngle={90 + 360 * 0.72} innerRadius={80} outerRadius={110} startAngle={90}>
            <PolarAngleAxis angleAxisId={0} domain={POLAR_DOMAIN} tick={false} type='number' />
            <RadialBar cornerRadius={10} dataKey='value' />
            <text
              className='fill-foreground text-3xl font-bold'
              dominantBaseline='middle'
              textAnchor='middle'
              x='50%'
              y='50%'>
              72%
            </text>
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
export default RadialChartWidget
