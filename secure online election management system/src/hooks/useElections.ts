import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Election } from '@/types/database'
import { DEMO_ELECTIONS, isDemoMode } from '@/lib/demo-data'

export function useElections(filter?: {
  status?: string[]
  search?: string
}) {
  const [elections, setElections] = useState<Election[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const searchKey = filter?.search ?? ''
  const statusKey = filter?.status?.join(',') ?? ''

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      if (isDemoMode()) {
        let data = [...DEMO_ELECTIONS]
        if (filter?.status?.length) {
          data = data.filter((e) => filter.status!.includes(e.status))
        }
        if (filter?.search) {
          const q = filter.search.toLowerCase()
          data = data.filter(
            (e) =>
              e.title.toLowerCase().includes(q) ||
              e.description.toLowerCase().includes(q),
          )
        }
        if (!cancelled) {
          setElections(data)
          setLoading(false)
        }
        return
      }

      let query = supabase
        .from('elections')
        .select('*')
        .not('status', 'in', '("draft","cancelled")')
        .order('created_at', { ascending: false })

      if (filter?.status?.length) {
        query = query.in('status', filter.status)
      }
      if (filter?.search) {
        query = query.or(
          `title.ilike.%${filter.search}%,description.ilike.%${filter.search}%`,
        )
      }

      const { data, error: err } = await query
      if (!cancelled) {
        if (err) setError(err.message)
        else setElections((data as Election[]) ?? [])
        setLoading(false)
      }
    }

    load()

    if (!isDemoMode()) {
      const channel = supabase
        .channel('elections-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'elections' },
          () => load(),
        )
        .subscribe()
      return () => {
        cancelled = true
        supabase.removeChannel(channel)
      }
    }

    return () => {
      cancelled = true
    }
  }, [searchKey, statusKey])

  return { elections, loading, error }
}

export function useElection(id: string | undefined) {
  const [election, setElection] = useState<Election | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    if (isDemoMode()) {
      Promise.resolve().then(() => {
        setElection(DEMO_ELECTIONS.find((e) => e.id === id) ?? null)
        setLoading(false)
      })
      return
    }
    supabase
      .from('elections')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data }) => {
        setElection(data as Election)
        setLoading(false)
      })
  }, [id])

  return { election, loading }
}
