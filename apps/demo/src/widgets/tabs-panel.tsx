'use client'
import { Card, CardContent, CardHeader, CardTitle } from '@a/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@a/ui/tabs'
const TabsPanel = () => (
  <Card>
    <CardHeader>
      <CardTitle>Analytics</CardTitle>
    </CardHeader>
    <CardContent>
      <Tabs defaultValue='overview'>
        <TabsList>
          <TabsTrigger value='overview'>Overview</TabsTrigger>
          <TabsTrigger value='analytics'>Analytics</TabsTrigger>
          <TabsTrigger value='reports'>Reports</TabsTrigger>
        </TabsList>
        <TabsContent className='pt-4 text-sm text-muted-foreground' value='overview'>
          Overview of your dashboard metrics and key performance indicators.
        </TabsContent>
        <TabsContent className='pt-4 text-sm text-muted-foreground' value='analytics'>
          Detailed analytics with breakdowns by source, medium, and campaign.
        </TabsContent>
        <TabsContent className='pt-4 text-sm text-muted-foreground' value='reports'>
          Generated reports available for download in CSV and PDF formats.
        </TabsContent>
      </Tabs>
    </CardContent>
  </Card>
)
export default TabsPanel
