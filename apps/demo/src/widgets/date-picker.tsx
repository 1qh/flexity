'use client'
import { Calendar } from '@a/ui/calendar'
import { Card, CardContent, CardHeader, CardTitle } from '@a/ui/card'
import { useState } from 'react'
const DatePicker = () => {
  const [range, setRange] = useState<{ from: Date; to?: Date }>(() => ({
    from: new Date(2026, 2, 15),
    to: new Date(2026, 2, 25)
  }))
  return (
    <Card>
      <CardHeader>
        <CardTitle>Date Range</CardTitle>
      </CardHeader>
      <CardContent className='flex flex-col items-center gap-2'>
        <Calendar
          mode='range'
          onSelect={r => {
            if (r?.from) setRange({ from: r.from, to: r.to })
          }}
          selected={range}
        />
        <span className='text-xs text-muted-foreground'>
          {range.from.toLocaleDateString()} — {range.to?.toLocaleDateString() ?? '...'}
        </span>
      </CardContent>
    </Card>
  )
}
export default DatePicker
