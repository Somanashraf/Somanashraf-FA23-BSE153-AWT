import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  trend?: string
  className?: string
  delay?: number
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  className,
  delay = 0,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Card className={cn('overflow-hidden', className)}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{title}</p>
              <p className="text-3xl font-bold mt-1 tracking-tight">{value}</p>
              {subtitle && (
                <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
              )}
              {trend && (
                <p className="text-xs text-success mt-2 font-medium">{trend}</p>
              )}
            </div>
            <div className="rounded-xl bg-primary/10 p-3">
              <Icon className="size-5 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
