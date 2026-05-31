import { motion } from 'framer-motion';

export function Page({ title, eyebrow, actions, children }) {
  return <motion.main className="page" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.32 }}>
    <div className="page-head"><div>{eyebrow && <span className="eyebrow">{eyebrow}</span>}<h1>{title}</h1></div>{actions}</div>
    {children}
  </motion.main>;
}

export function StatCard({ icon: Icon, label, value, tone = 'blue', caption }) {
  return <motion.div className={`stat-card ${tone}`} whileHover={{ y: -4 }} transition={{ type: 'spring', stiffness: 280, damping: 20 }}>
    <div className="stat-icon"><Icon size={22} /></div><div><span>{label}</span><strong>{value}</strong>{caption && <small>{caption}</small>}</div>
  </motion.div>;
}

export function EmptyState({ title, text, action }) {
  return <div className="empty-state"><div className="empty-ring" /><h3>{title}</h3><p>{text}</p>{action}</div>;
}

export function SkeletonTable() {
  return <div className="panel skeleton-wrap">{Array.from({ length: 5 }).map((_, i) => <div className="skeleton-row" key={i}><span /><span /><span /><span /></div>)}</div>;
}

export function Toast({ toast }) {
  if (!toast) return null;
  return <motion.div className={`toast ${toast.type || 'info'}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>{toast.message}</motion.div>;
}
