'use client'
import { ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from '@a/ui/chart'
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from 'recharts'
import { useSize } from '~/widgets/use-size'
const data = [
    { a: 120, b: 110, subject: 'Math' },
    { a: 98, b: 130, subject: 'Chinese' },
    { a: 86, b: 130, subject: 'English' },
    { a: 99, b: 100, subject: 'Geography' },
    { a: 85, b: 90, subject: 'Physics' },
    { a: 65, b: 85, subject: 'History' }
  ],
  tooltipContent = <ChartTooltipContent />,
  legendContent = <ChartLegendContent />,
  RadarChartWidget = () => {
    const { ref, width, height } = useSize()
    return (
      <div className='flex h-full flex-col gap-2'>
        <span className='text-sm font-medium'>Radar Chart</span>
        <div className='min-h-0 min-w-0 flex-1 overflow-hidden' ref={ref}>
          {width > 0 && height > 0 ? (
            <RadarChart data={data} height={height} width={width}>
              <PolarGrid />
              <PolarAngleAxis dataKey='subject' />
              <ChartTooltip content={tooltipContent} />
              <ChartLegend content={legendContent} />
              <Radar dataKey='a' fill='var(--chart-1)' fillOpacity={0.6} stroke='var(--chart-1)' />
              <Radar dataKey='b' fill='var(--chart-2)' fillOpacity={0.6} stroke='var(--chart-2)' />
            </RadarChart>
          ) : null}
        </div>
      </div>
    )
  }
export default RadarChartWidget
