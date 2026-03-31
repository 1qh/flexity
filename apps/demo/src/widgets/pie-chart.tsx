'use client'
import type { ChartConfig } from '@a/ui/chart'
import { Card, CardContent, CardHeader, CardTitle } from '@a/ui/card'
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from '@a/ui/chart'
import { Pie, PieChart } from 'recharts'
const data = [
    { fill: 'var(--chart-1)', name: 'Chrome', value: 275 },
    { fill: 'var(--chart-2)', name: 'Safari', value: 200 },
    { fill: 'var(--chart-3)', name: 'Firefox', value: 187 },
    { fill: 'var(--chart-4)', name: 'Edge', value: 173 },
    { fill: 'var(--chart-5)', name: 'Other', value: 90 }
  ],
  chartConfig = {
    chrome: { color: 'var(--chart-1)', label: 'Chrome' },
    edge: { color: 'var(--chart-4)', label: 'Edge' },
    firefox: { color: 'var(--chart-3)', label: 'Firefox' },
    other: { color: 'var(--chart-5)', label: 'Other' },
    safari: { color: 'var(--chart-2)', label: 'Safari' }
  } satisfies ChartConfig,
  tooltipContent = <ChartTooltipContent />,
  legendContent = <ChartLegendContent />,
  PieChartWidget = () => (
    <Card>
      <CardHeader>
        <CardTitle>Pie Chart</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <PieChart>
            <ChartTooltip content={tooltipContent} />
            <ChartLegend content={legendContent} />
            <Pie cx='50%' cy='50%' data={data} dataKey='value' innerRadius={60} label nameKey='name' outerRadius={80} />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
export default PieChartWidget
