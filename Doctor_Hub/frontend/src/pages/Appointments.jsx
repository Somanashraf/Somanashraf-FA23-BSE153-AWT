import { Check, Clock, Upload, X } from 'lucide-react';
import { useState } from 'react';
import { Page, SkeletonTable } from '../components/common/UI.jsx';
import { appointments } from '../data/mockData.js';
import { useApp } from '../context/AppContext.jsx';

export default function Appointments() {
  const [loading, setLoading] = useState(false);
  const { user, setToast } = useApp();
  function simulate(action) {
    setLoading(true);
    setTimeout(() => { setLoading(false); setToast({ type: 'success', message: `${action} completed` }); }, 800);
  }
  return <Page title="Appointments" eyebrow={`${user.role.toLowerCase()} workspace`} actions={<button className="primary">New appointment</button>}>
    {loading ? <SkeletonTable /> : <div className="panel data-panel"><table><thead><tr><th>ID</th><th>Patient</th><th>Doctor</th><th>Clinic</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead><tbody>{appointments.map(a => <tr key={a.id}><td>{a.id}</td><td>{a.patient}</td><td>{a.doctor}</td><td>{a.clinic}</td><td>{a.date} {a.time}</td><td><span className={`status ${a.status.toLowerCase().replaceAll(' ', '-')}`}>{a.status}</span></td><td><div className="row-actions"><button className="icon" onClick={() => simulate('Payment upload')}><Upload size={16} /></button><button className="icon" onClick={() => simulate('Approval')}><Check size={16} /></button><button className="icon danger" onClick={() => simulate('Rejection')}><X size={16} /></button></div></td></tr>)}</tbody></table></div>}
    <section className="queue-strip"><div><Clock size={18} /><strong>Queue integrity</strong><span>Assistant approvals update appointment position without modifying medical history.</span></div><div><strong>04</strong><span>waiting</span></div><div><strong>12 min</strong><span>avg delay</span></div></section>
  </Page>;
}
