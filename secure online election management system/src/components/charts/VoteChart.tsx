import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'

const COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#c084fc', '#d8b4fe']

interface VoteChartProps {
  data: { name: string; votes: number }[]
}

export function VoteChart({ data }: VoteChartProps) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <XAxis
          dataKey="name"
          tick={{ fill: 'var(--color-muted-foreground)', fontSize: 12 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: 'var(--color-muted-foreground)', fontSize: 12 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            background: 'oklch(0.18 0.02 265 / 0.9)',
            border: '1px solid oklch(0.28 0.02 265)',
            borderRadius: '12px',
            color: '#fff',
          }}
          cursor={{ fill: 'oklch(0.52 0.19 264 / 0.1)' }}
        />
        <Bar dataKey="votes" radius={[8, 8, 0, 0]}>
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
