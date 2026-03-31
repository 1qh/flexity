'use client'
import { Card, CardContent, CardHeader, CardTitle } from '@a/ui/card'
import { Label } from '@a/ui/label'
import { Slider } from '@a/ui/slider'
const SliderWidget = () => (
  <Card>
    <CardHeader>
      <CardTitle>Controls</CardTitle>
    </CardHeader>
    <CardContent className='flex flex-col gap-6'>
      <div className='flex flex-col gap-3'>
        <Label>Volume</Label>
        <Slider defaultValue={[50]} max={100} step={1} />
      </div>
      <div className='flex flex-col gap-3'>
        <Label>Brightness</Label>
        <Slider defaultValue={[75]} max={100} step={1} />
      </div>
      <div className='flex flex-col gap-3'>
        <Label>Contrast</Label>
        <Slider defaultValue={[30]} max={100} step={1} />
      </div>
    </CardContent>
  </Card>
)
export default SliderWidget
