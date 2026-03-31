'use client'
import { Button } from '@a/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@a/ui/card'
import { Input } from '@a/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@a/ui/table'
import { useState } from 'react'
const allRows = [
    { id: 1, name: 'Alice Johnson', email: 'alice@example.com', role: 'Admin', status: 'Active' },
    { id: 2, name: 'Bob Smith', email: 'bob@example.com', role: 'Editor', status: 'Active' },
    { id: 3, name: 'Carol White', email: 'carol@example.com', role: 'Viewer', status: 'Inactive' },
    { id: 4, name: 'Dave Brown', email: 'dave@example.com', role: 'Editor', status: 'Active' },
    { id: 5, name: 'Eve Davis', email: 'eve@example.com', role: 'Admin', status: 'Active' },
    { id: 6, name: 'Frank Wilson', email: 'frank@example.com', role: 'Viewer', status: 'Pending' },
    { id: 7, name: 'Grace Lee', email: 'grace@example.com', role: 'Editor', status: 'Active' },
    { id: 8, name: 'Henry Clark', email: 'henry@example.com', role: 'Viewer', status: 'Inactive' },
    { id: 9, name: 'Ivy Martin', email: 'ivy@example.com', role: 'Admin', status: 'Active' },
    { id: 10, name: 'Jack Turner', email: 'jack@example.com', role: 'Editor', status: 'Pending' }
  ],
  PAGE_SIZE = 5,
  sortKeys = ['name', 'email', 'role', 'status'] as const
type SortDir = 'asc' | 'desc'
type SortKey = (typeof sortKeys)[number]
const DataTableWidget = () => {
  const [filter, setFilter] = useState(''),
    [page, setPage] = useState(0),
    [sortKey, setSortKey] = useState<SortKey>('name'),
    [sortDir, setSortDir] = useState<SortDir>('asc'),
    filtered = allRows.filter(
      r =>
        r.name.toLowerCase().includes(filter.toLowerCase()) ||
        r.email.toLowerCase().includes(filter.toLowerCase()) ||
        r.role.toLowerCase().includes(filter.toLowerCase())
    ),
    sorted = [...filtered].sort((a, b) => {
      const av = a[sortKey],
        bv = b[sortKey]
      return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
    }),
    paged = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE),
    totalPages = Math.ceil(sorted.length / PAGE_SIZE),
    handleSort = (key: SortKey) => {
      if (sortKey === key) setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
      else {
        setSortKey(key)
        setSortDir('asc')
      }
      setPage(0)
    }
  return (
    <Card>
      <CardHeader>
        <CardTitle>Users</CardTitle>
      </CardHeader>
      <CardContent className='flex flex-col gap-3'>
        <Input
          className='h-8 text-sm'
          onChange={e => {
            setFilter(e.target.value)
            setPage(0)
          }}
          placeholder='Filter...'
          value={filter}
        />
        <Table>
          <TableHeader className='sticky top-0 bg-background'>
            <TableRow>
              {sortKeys.map(k => (
                <TableHead
                  className='cursor-pointer select-none hover:text-foreground'
                  key={k}
                  onClick={() => handleSort(k)}>
                  {k.charAt(0).toUpperCase() + k.slice(1)}
                  {sortKey === k ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ''}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paged.map(r => (
              <TableRow key={r.id}>
                <TableCell className='font-medium'>{r.name}</TableCell>
                <TableCell>{r.email}</TableCell>
                <TableCell>{r.role}</TableCell>
                <TableCell>{r.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className='flex items-center justify-between text-xs text-muted-foreground'>
          <span>
            {sorted.length} result{sorted.length === 1 ? '' : 's'}
          </span>
          <div className='flex gap-1'>
            <Button disabled={page === 0} onClick={() => setPage(page - 1)} size='sm' variant='outline'>
              Prev
            </Button>
            <Button disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)} size='sm' variant='outline'>
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
export default DataTableWidget
