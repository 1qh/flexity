'use client'
import { PolarAngleAxis, RadialBar, RadialBarChart } from 'recharts'
import { useSize } from '~/widgets/use-size'
const POLAR_DOMAIN = [0, 100] as const,
  data = [{ fill: 'var(--chart-1)', value: 72 }],
  RadialChartWidget = () => {
    const { ref, width, height } = useSize()
    return (
      <div className='flex h-full flex-col gap-2'>
        <span className='text-sm font-medium'>Radial Progress</span>
        <div className='flex min-h-0 flex-1 items-center justify-center' ref={ref}>
          {width > 0 && height > 0 ? (
            <RadialBarChart
              data={data}
              endAngle={90 + 360 * 0.72}
              height={height}
              innerRadius={80}
              outerRadius={110}
              startAngle={90}
              width={width}>
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
          ) : null}
        </div>
      </div>
    )
  }
export default RadialChartWidget
