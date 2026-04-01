'use client'
import { ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from '@a/ui/chart'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { useSize } from '~/widgets/use-size'
const data = [
    { month: 'Jan', sessions: 4000, users: 2400 },
    { month: 'Feb', sessions: 3000, users: 1398 },
    { month: 'Mar', sessions: 2000, users: 9800 },
    { month: 'Apr', sessions: 2780, users: 3908 },
    { month: 'May', sessions: 1890, users: 4800 },
    { month: 'Jun', sessions: 2390, users: 3800 }
  ],
  tooltipContent = <ChartTooltipContent />,
  legendContent = <ChartLegendContent />,
  AreaChartWidget = () => {
    const { ref, width, height } = useSize()
    return (
      <div className='flex h-full flex-col gap-2'>
        <span className='text-sm font-medium'>Area Chart</span>
        <div className='min-h-32 min-w-0 flex-1 overflow-hidden' ref={ref}>
          {width > 0 && height > 0 ? (
            <AreaChart data={data} height={height} width={width}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey='month' />
              <YAxis />
              <ChartTooltip content={tooltipContent} />
              <ChartLegend content={legendContent} />
              <Area dataKey='sessions' fill='var(--chart-1)' stroke='var(--chart-1)' type='monotone' />
              <Area dataKey='users' fill='var(--chart-2)' stroke='var(--chart-2)' type='monotone' />
            </AreaChart>
          ) : null}
        </div>
      </div>
    )
  }
export default AreaChartWidget
