'use client'
import { Calendar } from '@a/ui/calendar'
import { Card, CardContent, CardHeader, CardTitle } from '@a/ui/card'
import { useState } from 'react'
const CalendarWidget = () => {
  const [date, setDate] = useState<Date | undefined>(() => new Date())
  return (
    <Card>
      <CardHeader>
        <CardTitle>Calendar</CardTitle>
      </CardHeader>
      <CardContent className='flex justify-center'>
        <Calendar mode='single' onSelect={setDate} selected={date} />
      </CardContent>
    </Card>
  )
}
export default CalendarWidget
