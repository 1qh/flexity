'use client'
import { ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from '@a/ui/chart'
import { Pie, PieChart } from 'recharts'
import { useSize } from '~/widgets/use-size'
const data = [
    { fill: 'var(--chart-1)', name: 'Chrome', value: 275 },
    { fill: 'var(--chart-2)', name: 'Safari', value: 200 },
    { fill: 'var(--chart-3)', name: 'Firefox', value: 187 },
    { fill: 'var(--chart-4)', name: 'Edge', value: 173 },
    { fill: 'var(--chart-5)', name: 'Other', value: 90 }
  ],
  tooltipContent = <ChartTooltipContent />,
  legendContent = <ChartLegendContent />,
  PieChartWidget = () => {
    const { ref, width, height } = useSize()
    return (
      <div className='flex h-full flex-col gap-2'>
        <span className='text-sm font-medium'>Pie Chart</span>
        <div className='min-h-0 min-w-0 flex-1 overflow-hidden' ref={ref}>
          {width > 0 && height > 0 ? (
            <PieChart height={height} width={width}>
              <ChartTooltip content={tooltipContent} />
              <ChartLegend content={legendContent} />
              <Pie data={data} dataKey='value' nameKey='name' />
            </PieChart>
          ) : null}
        </div>
      </div>
    )
  }
export default PieChartWidget
