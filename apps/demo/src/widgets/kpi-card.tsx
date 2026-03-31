'use client'
import type { ChartConfig } from '@a/ui/chart'
import { Card, CardContent, CardHeader, CardTitle } from '@a/ui/card'
import { ChartContainer } from '@a/ui/chart'
import { Area, AreaChart } from 'recharts'
const kpis = [
    {
      change: '+20.1%',
      data: [{ v: 30 }, { v: 35 }, { v: 28 }, { v: 40 }, { v: 38 }, { v: 45 }],
      label: 'Total Revenue',
      up: true,
      value: '$45,231'
    },
    {
      change: '+180.1%',
      data: [{ v: 10 }, { v: 15 }, { v: 22 }, { v: 18 }, { v: 28 }, { v: 35 }],
      label: 'Subscriptions',
      up: true,
      value: '+2,350'
    },
    {
      change: '+201',
      data: [{ v: 50 }, { v: 48 }, { v: 55 }, { v: 52 }, { v: 58 }, { v: 57 }],
      label: 'Active Now',
      up: true,
      value: '573'
    }
  ],
  chartConfig = {
    v: { color: 'var(--chart-1)', label: 'Value' }
  } satisfies ChartConfig,
  KpiCard = () => (
    <Card>
      <CardHeader>
        <CardTitle>Key Metrics</CardTitle>
      </CardHeader>
      <CardContent className='flex flex-col gap-4'>
        {kpis.map(k => (
          <div className='flex items-center justify-between' key={k.label}>
            <div className='flex flex-col gap-0.5'>
              <span className='text-sm text-muted-foreground'>{k.label}</span>
              <span className='text-2xl font-bold'>{k.value}</span>
            </div>
            <div className='flex items-center gap-2'>
              <ChartContainer className='h-8 w-16' config={chartConfig}>
                <AreaChart data={k.data}>
                  <Area
                    dataKey='v'
                    fill='var(--color-v)'
                    fillOpacity={0.2}
                    stroke='var(--color-v)'
                    strokeWidth={1.5}
                    type='monotone'
                  />
                </AreaChart>
              </ChartContainer>
              <span className='text-sm text-primary'>{k.change}</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
export default KpiCard
