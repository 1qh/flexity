'use client'
import { Card, CardContent, CardHeader, CardTitle } from '@a/ui/card'
const kpis = [
    { label: 'Total Revenue', value: '$45,231', change: '+20.1%', up: true },
    { label: 'Subscriptions', value: '+2,350', change: '+180.1%', up: true },
    { label: 'Active Now', value: '573', change: '+201', up: true }
  ],
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
            <span className='text-sm text-primary'>{k.change}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  )
export default KpiCard
