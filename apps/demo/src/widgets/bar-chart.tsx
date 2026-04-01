'use client'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { useSize } from '~/widgets/use-size'
const data = [
    { desktop: 186, month: 'Jan' },
    { desktop: 305, month: 'Feb' },
    { desktop: 237, month: 'Mar' },
    { desktop: 73, month: 'Apr' },
    { desktop: 209, month: 'May' },
    { desktop: 214, month: 'Jun' }
  ],
  BarChartWidget = () => {
    const { ref, width, height } = useSize()
    return (
      <div className='flex h-full flex-col gap-2'>
        <span className='text-sm font-medium'>Bar Chart</span>
        <div className='min-h-32 min-w-0 flex-1 overflow-hidden' ref={ref}>
          {width > 0 && height > 0 ? (
            <BarChart data={data} height={height} width={width}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey='month' />
              <YAxis />
              <Bar dataKey='desktop' fill='var(--chart-1)' />
            </BarChart>
          ) : null}
        </div>
      </div>
    )
  }
export default BarChartWidget
