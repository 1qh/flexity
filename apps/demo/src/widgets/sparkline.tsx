'use client'
import { Area, AreaChart } from 'recharts'
import { useSize } from '~/widgets/use-size'
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
  Sparkline = () => {
    const { ref, width, height } = useSize()
    return (
      <div className='flex h-full flex-col gap-2'>
        <span className='text-sm font-medium'>Sparkline</span>
        <div className='h-16' ref={ref}>
          {width > 0 && height > 0 ? (
            <AreaChart data={data} height={height} width={width}>
              <Area
                dataKey='v'
                fill='var(--chart-1)'
                fillOpacity={0.2}
                stroke='var(--chart-1)'
                strokeWidth={2}
                type='monotone'
              />
            </AreaChart>
          ) : null}
        </div>
        <div className='flex items-center justify-between pt-2 text-sm'>
          <span className='text-muted-foreground'>Last 17 days</span>
          <span className='font-medium'>+145%</span>
        </div>
      </div>
    )
  }
export default Sparkline
