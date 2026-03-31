'use client'
import type { ChartConfig } from '@a/ui/chart'
import { Card, CardContent, CardHeader, CardTitle } from '@a/ui/card'
import { ChartContainer } from '@a/ui/chart'
import { Area, AreaChart } from 'recharts'
const data = [
    { v: 40 },
    { v: 30 },
    { v: 45 },
    { v: 50 },
    { v: 49 },
    { v: 60 },
    { v: 70 },
    { v: 91 },
    { v: 80 },
    { v: 75 },
    { v: 85 },
    { v: 90 },
    { v: 88 },
    { v: 95 },
    { v: 100 },
    { v: 92 },
    { v: 98 }
  ],
  chartConfig = {
    v: { color: 'var(--chart-1)', label: 'Value' }
  } satisfies ChartConfig,
  Sparkline = () => (
    <Card>
      <CardHeader>
        <CardTitle>Sparkline</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer className='h-16' config={chartConfig}>
          <AreaChart data={data}>
            <Area
              dataKey='v'
              fill='var(--color-v)'
              fillOpacity={0.2}
              stroke='var(--color-v)'
              strokeWidth={2}
              type='monotone'
            />
          </AreaChart>
        </ChartContainer>
        <div className='flex items-center justify-between pt-2 text-sm'>
          <span className='text-muted-foreground'>Last 17 days</span>
          <span className='font-medium'>+145%</span>
        </div>
      </CardContent>
    </Card>
  )
export default Sparkline
