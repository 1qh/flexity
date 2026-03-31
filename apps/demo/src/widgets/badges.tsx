'use client'
import { Badge } from '@a/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@a/ui/card'
const tags = [
    { label: 'React', variant: 'default' as const },
    { label: 'TypeScript', variant: 'secondary' as const },
    { label: 'Tailwind', variant: 'outline' as const },
    { label: 'Next.js', variant: 'default' as const },
    { label: 'Deprecated', variant: 'destructive' as const },
    { label: 'Stable', variant: 'secondary' as const },
    { label: 'Beta', variant: 'outline' as const },
    { label: 'New', variant: 'default' as const }
  ],
  Badges = () => (
    <Card>
      <CardHeader>
        <CardTitle>Tags</CardTitle>
      </CardHeader>
      <CardContent className='flex flex-wrap gap-2'>
        {tags.map(t => (
          <Badge key={t.label} variant={t.variant}>
            {t.label}
          </Badge>
        ))}
      </CardContent>
    </Card>
  )
export default Badges
