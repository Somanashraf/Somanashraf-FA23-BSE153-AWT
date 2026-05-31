import { CalendarDays, ClipboardPlus, HeartPulse, IndianRupee, TrendingUp, Users } from 'lucide-react';
import { Page, StatCard } from '../components/common/UI.jsx';
import { AppointmentTrend, DiseaseChart, RevenueChart } from '../components/charts/AnalyticsCharts.jsx';
import { analytics, appointments } from '../data/mockData.js';
import { useApp } from '../context/AppContext.jsx';

const roleCopy = {
  PATIENT: ['Your care timeline', 'Upcoming consultation and permanent records are ready.'],
  DOCTOR: ['Clinical command center', 'Review queue, write locked prescriptions, and append notes.'],
  ASSISTANT: ['Verification desk', 'Payments and bookings waiting for confirmation.'],
  ADMIN: ['Operations overview', 'Users, doctors, assistants, categories, and reports.'],
  SUPER_ADMIN: ['System control room', 'Analytics, permissions, audit logs, and platform governance.']
};

export default function Dashboard() {
  const { user } = useApp();
  const [heading, sub] = roleCopy[user.role];
  return <Page title={heading} eyebrow="Doctor Hub" actions={<button className="primary">Export report</button>}>
    <section className="hero-band"><div><span className="eyebrow">Healthcare SaaS</span><h2>Consultation, payment verification, prescriptions, and medical history in one secure workflow.</h2><p>{sub}</p></div><div className="hero-metrics"><strong>98.4%</strong><span>on-time clinical record completion</span></div></section>
    <section className="stats-grid">
      <StatCard icon={CalendarDays} label="Daily appointments" value={analytics.daily} caption="12 confirmed today" />
      <StatCard icon={Users} label="Monthly appointments" value={analytics.monthly} tone="teal" caption="Across all clinics" />
      <StatCard icon={IndianRupee} label="Verified revenue" value={`Rs ${analytics.revenue.toLocaleString()}`} tone="green" caption="Payment screenshots checked" />
      <StatCard icon={ClipboardPlus} label="Prescriptions" value={analytics.prescriptions} tone="indigo" caption="Locked after creation" />
    </section>
    <section className="dashboard-grid">
      <div className="panel wide"><div className="panel-head"><h3>Revenue trend</h3><span>Monthly verified payments</span></div><RevenueChart /></div>
      <div className="panel"><div className="panel-head"><h3>Most searched diseases</h3><span>Optimized search log</span></div><DiseaseChart /></div>
      <div className="panel"><div className="panel-head"><h3>Appointment trend</h3><span>Current week</span></div><AppointmentTrend /></div>
      <div className="panel wide"><div className="panel-head"><h3>Today queue</h3><span>Live consultation flow</span></div><table><tbody>{appointments.slice(0,3).map(a => <tr key={a.id}><td>{a.id}</td><td>{a.patient}</td><td>{a.doctor}</td><td><span className={`status ${a.status.toLowerCase().replaceAll(' ', '-')}`}>{a.status}</span></td></tr>)}</tbody></table></div>
    </section>
  </Page>;
}
