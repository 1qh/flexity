'use client'
import { Card, CardContent, CardHeader, CardTitle } from '@a/ui/card'
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@a/ui/chart'
import { Pie, PieChart } from 'recharts'
const data = [
    { name: 'Chrome', value: 275, fill: 'var(--chart-1)' },
    { name: 'Safari', value: 200, fill: 'var(--chart-2)' },
    { name: 'Firefox', value: 187, fill: 'var(--chart-3)' },
    { name: 'Edge', value: 173, fill: 'var(--chart-4)' },
    { name: 'Other', value: 90, fill: 'var(--chart-5)' }
  ],
  chartConfig = {
    chrome: { label: 'Chrome', color: 'var(--chart-1)' },
    safari: { label: 'Safari', color: 'var(--chart-2)' },
    firefox: { label: 'Firefox', color: 'var(--chart-3)' },
    edge: { label: 'Edge', color: 'var(--chart-4)' },
    other: { label: 'Other', color: 'var(--chart-5)' }
  } satisfies ChartConfig,
  PieChartWidget = () => (
    <Card>
      <CardHeader>
        <CardTitle>Pie Chart</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent />} />
            <Pie cx='50%' cy='50%' data={data} dataKey='value' innerRadius={60} label nameKey='name' outerRadius={80} />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
export default PieChartWidget
