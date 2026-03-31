'use client'
import { Card, CardContent, CardHeader, CardTitle } from '@a/ui/card'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@a/ui/command'
import { useState } from 'react'
const frameworks = [
    { value: 'next', label: 'Next.js' },
    { value: 'remix', label: 'Remix' },
    { value: 'astro', label: 'Astro' },
    { value: 'nuxt', label: 'Nuxt' },
    { value: 'svelte', label: 'SvelteKit' },
    { value: 'gatsby', label: 'Gatsby' },
    { value: 'vite', label: 'Vite' }
  ],
  CommandWidget = () => {
    const [selected, setSelected] = useState('')
    return (
      <Card>
        <CardHeader>
          <CardTitle>Command Palette</CardTitle>
        </CardHeader>
        <CardContent>
          <Command className='rounded-lg border'>
            <CommandInput placeholder='Search framework...' />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup heading='Frameworks'>
                {frameworks.map(f => (
                  <CommandItem key={f.value} onSelect={() => setSelected(f.value)} value={f.value}>
                    <span>{f.label}</span>
                    {selected === f.value && <span className='ml-auto text-xs text-primary'>selected</span>}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </CardContent>
      </Card>
    )
  }
export default CommandWidget
