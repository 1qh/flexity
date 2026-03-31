'use client'
import { Button } from '@a/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@a/ui/card'
import { Skeleton } from '@a/ui/skeleton'
import { useState } from 'react'
const SkeletonWidget = () => {
  const [loading, setLoading] = useState(true)
  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between'>
        <CardTitle>Loading State</CardTitle>
        <Button onClick={() => setLoading(!loading)} size='sm' variant='outline'>
          {loading ? 'Show' : 'Loading'}
        </Button>
      </CardHeader>
      <CardContent className='flex flex-col gap-3'>
        {loading ? (
          <>
            <Skeleton className='h-4 w-3/4' />
            <Skeleton className='h-4 w-1/2' />
            <Skeleton className='h-20 w-full' />
            <div className='flex gap-2'>
              <Skeleton className='h-8 w-8 rounded-full' />
              <Skeleton className='h-8 w-8 rounded-full' />
              <Skeleton className='h-8 w-8 rounded-full' />
            </div>
          </>
        ) : (
          <>
            <span className='text-sm'>Content loaded successfully!</span>
            <span className='text-sm text-muted-foreground'>This demonstrates the skeleton loading state toggle.</span>
          </>
        )}
      </CardContent>
    </Card>
  )
}
export default SkeletonWidget
