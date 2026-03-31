'use client'
import { Avatar, AvatarFallback } from '@a/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@a/ui/card'
const people = [
    { name: 'Alice', initials: 'AJ' },
    { name: 'Bob', initials: 'BS' },
    { name: 'Carol', initials: 'CW' },
    { name: 'Dave', initials: 'DB' },
    { name: 'Eve', initials: 'ED' }
  ],
  Avatars = () => (
    <Card>
      <CardHeader>
        <CardTitle>Team</CardTitle>
      </CardHeader>
      <CardContent className='flex gap-2'>
        {people.map(p => (
          <Avatar key={p.name}>
            <AvatarFallback>{p.initials}</AvatarFallback>
          </Avatar>
        ))}
      </CardContent>
    </Card>
  )
export default Avatars
