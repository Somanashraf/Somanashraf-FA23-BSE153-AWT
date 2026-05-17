import * as React from 'react'
import { cn } from '@/lib/utils'

export function Card(props: React.HTMLAttributes<HTMLDivElement>) {
  const { className, ...rest } = props
  return (
    <div
      className={cn(
        'glass rounded-2xl text-card-foreground transition-shadow duration-300 hover:shadow-xl',
        className,
      )}
      {...rest}
    />
  )
}

export function CardHeader(props: React.HTMLAttributes<HTMLDivElement>) {
  const { className, ...rest } = props
  return <div className={cn('flex flex-col gap-1.5 p-6', className)} {...rest} />
}

export function CardTitle(props: React.HTMLAttributes<HTMLHeadingElement>) {
  const { className, ...rest } = props
  return (
    <h3
      className={cn('text-lg font-semibold tracking-tight', className)}
      {...rest}
    />
  )
}

export function CardDescription(props: React.HTMLAttributes<HTMLParagraphElement>) {
  const { className, ...rest } = props
  return (
    <p className={cn('text-sm text-muted-foreground', className)} {...rest} />
  )
}

export function CardContent(props: React.HTMLAttributes<HTMLDivElement>) {
  const { className, ...rest } = props
  return <div className={cn('p-6 pt-0', className)} {...rest} />
}

export function CardFooter(props: React.HTMLAttributes<HTMLDivElement>) {
  const { className, ...rest } = props
  return (
    <div className={cn('flex items-center p-6 pt-0', className)} {...rest} />
  )
}
