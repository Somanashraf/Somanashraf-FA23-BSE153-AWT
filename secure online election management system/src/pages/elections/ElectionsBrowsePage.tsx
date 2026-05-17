import { useState } from 'react'
import { Search } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Input } from '@/components/ui/input'
import { ElectionCard } from '@/components/elections/ElectionCard'
import { useElections } from '@/hooks/useElections'
import { Skeleton } from '@/components/ui/skeleton'

export function ElectionsBrowsePage() {
  const [search, setSearch] = useState('')
  const { elections, loading } = useElections({ search: search || undefined })

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-7xl mx-auto pt-28 pb-16 px-4">
        <h1 className="text-3xl font-bold">All elections</h1>
        <div className="relative max-w-md mt-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
          {loading
            ? [1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} className="h-64 rounded-2xl" />)
            : elections.map((e, i) => <ElectionCard key={e.id} election={e} index={i} />)}
        </div>
      </div>
      <Footer />
    </div>
  )
}
