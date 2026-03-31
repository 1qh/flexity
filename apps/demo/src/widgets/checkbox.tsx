'use client'
import { Card, CardContent, CardHeader, CardTitle } from '@a/ui/card'
import { Checkbox } from '@a/ui/checkbox'
import { Label } from '@a/ui/label'
const tasks = [
    { id: 'design', label: 'Design system review', done: true },
    { id: 'api', label: 'API integration', done: true },
    { id: 'tests', label: 'Write unit tests', done: false },
    { id: 'docs', label: 'Update documentation', done: false },
    { id: 'deploy', label: 'Deploy to production', done: false }
  ],
  CheckboxWidget = () => (
    <Card>
      <CardHeader>
        <CardTitle>Tasks</CardTitle>
      </CardHeader>
      <CardContent className='flex flex-col gap-3'>
        {tasks.map(t => (
          <div className='flex items-center gap-2' key={t.id}>
            <Checkbox defaultChecked={t.done} id={t.id} />
            <Label className='text-sm' htmlFor={t.id}>
              {t.label}
            </Label>
          </div>
        ))}
      </CardContent>
    </Card>
  )
export default CheckboxWidget
