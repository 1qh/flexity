'use client'
import { Avatar, AvatarFallback } from '@a/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@a/ui/card'
const people = [
    { initials: 'AJ', name: 'Alice' },
    { initials: 'BS', name: 'Bob' },
    { initials: 'CW', name: 'Carol' },
    { initials: 'DB', name: 'Dave' },
    { initials: 'ED', name: 'Eve' }
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
