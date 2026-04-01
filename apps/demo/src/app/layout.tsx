/** biome-ignore-all lint/security/noDangerouslySetInnerHtml: suppress recharts warning */
/* oxlint-disable import/no-unassigned-import, react/no-danger, react-perf/jsx-no-new-object-as-prop */
/* eslint-disable react/no-danger, @eslint-react/dom/no-dangerously-set-innerhtml */
import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import './globals.css'
import DarkToggle from './dark-toggle'
const metadata: Metadata = {
    title: 'ogrid demo'
  },
  RootLayout = ({ children }: { children: ReactNode }) => (
    <html lang='en' suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `var _w=console.warn;console.warn=function(){if(typeof arguments[0]==='string'&&arguments[0].indexOf('should be greater than 0')>-1)return;_w.apply(console,arguments)}`
          }}
        />
      </head>
      <body className='bg-background text-foreground antialiased'>
        <DarkToggle />
        {children}
      </body>
    </html>
  )
export { metadata }
export default RootLayout
