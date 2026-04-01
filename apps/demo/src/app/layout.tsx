/* oxlint-disable import/no-unassigned-import */
import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import './globals.css'
import DarkToggle from './dark-toggle'
import SuppressRecharts from './suppress-recharts'
const metadata: Metadata = {
    title: 'ogrid demo'
  },
  RootLayout = ({ children }: { children: ReactNode }) => (
    <html lang='en' suppressHydrationWarning>
      <body className='bg-background text-foreground antialiased'>
        <SuppressRecharts />
        <DarkToggle />
        {children}
      </body>
    </html>
  )
export { metadata }
export default RootLayout
