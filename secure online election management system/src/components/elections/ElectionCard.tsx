import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Clock, Users, Vote } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCountdown } from '@/lib/utils'
import type { Election, ElectionStatus } from '@/types/database'
const statusVariant: Record<
  ElectionStatus,
  'default' | 'success' | 'warning' | 'secondary' | 'destructive'
> = {
  draft: 'secondary',
  published: 'default',
  registration_open: 'success',
  registration_closed: 'warning',
  active: 'success',
  completed: 'secondary',
  cancelled: 'destructive',
}

const statusLabel: Record<ElectionStatus, string> = {
  draft: 'Draft',
  published: 'Published',
  registration_open: 'Registration open',
  registration_closed: 'Registration closed',
  active: 'Live',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

interface ElectionCardProps {
  election: Election
  index?: number
}

export function ElectionCard({ election, index = 0 }: ElectionCardProps) {
  const countdown = formatCountdown(election.end_date)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
    >
      <Link to={`/elections/${election.id}`}>
        <Card className="group overflow-hidden h-full hover:glow-primary">
          {election.banner_url && (
            <div className="h-36 overflow-hidden">
              <img
                src={election.banner_url}
                alt=""
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          )}
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-2 mb-3">
              <Badge variant={statusVariant[election.status]}>
                {statusLabel[election.status]}
              </Badge>
              <span className="text-xs text-muted-foreground capitalize">
                {election.category}
              </span>
            </div>
            <h3 className="font-semibold text-lg leading-tight group-hover:text-primary transition-colors">
              {election.title}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
              {election.description}
            </p>
            <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="size-3.5" />
                {election.status === 'completed' ? 'Ended' : `${countdown} left`}
              </span>
              <span className="flex items-center gap-1">
                <Users className="size-3.5" />
                {election.registered_count}/{election.max_voters}
              </span>
              <span className="flex items-center gap-1">
                <Vote className="size-3.5" />
                {election.vote_count} votes
              </span>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  )
}
