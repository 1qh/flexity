'use client'
import { Card, CardContent, CardHeader, CardTitle } from '@a/ui/card'
const events = [
    { time: '09:00', title: 'Deployment started', desc: 'v2.4.0 rolling out to production' },
    { time: '09:15', title: 'Health check passed', desc: 'All instances healthy' },
    { time: '10:30', title: 'Alert triggered', desc: 'Latency spike detected in us-east-1' },
    { time: '10:45', title: 'Incident resolved', desc: 'Auto-scaled to handle traffic' },
    { time: '14:00', title: 'Backup completed', desc: 'Daily snapshot stored' }
  ],
  Timeline = () => (
    <Card>
      <CardHeader>
        <CardTitle>Activity</CardTitle>
      </CardHeader>
      <CardContent className='flex flex-col gap-4'>
        {events.map(e => (
          <div className='flex gap-3' key={e.time}>
            <span className='shrink-0 text-xs text-muted-foreground'>{e.time}</span>
            <div className='flex flex-col gap-0.5'>
              <span className='text-sm font-medium'>{e.title}</span>
              <span className='text-xs text-muted-foreground'>{e.desc}</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
export default Timeline
