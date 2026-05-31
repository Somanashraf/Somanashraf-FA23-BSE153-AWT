import { Download, Lock, PlusCircle } from 'lucide-react';
import { Page } from '../components/common/UI.jsx';
import { useApp } from '../context/AppContext.jsx';

const prescriptions = [
  { id: 'RX-8821', diagnosis: 'Hypertension stage 1', doctor: 'Dr. Sana Khan', date: '2026-05-20', medicines: ['Amlodipine 5mg', 'Vitamin D3'], followUp: '2026-06-05' },
  { id: 'RX-8720', diagnosis: 'Seasonal allergy', doctor: 'Dr. Hammad Raza', date: '2026-04-18', medicines: ['Cetirizine 10mg', 'Steam inhalation'], followUp: 'As needed' }
];

export default function Prescriptions() {
  const { user, setToast } = useApp();
  return <Page title="Prescriptions" eyebrow="Locked records" actions={user.role === 'DOCTOR' ? <button className="primary" onClick={() => setToast({ type: 'success', message: 'Prescription saved as locked record' })}><PlusCircle size={17} /> Create prescription</button> : null}>
    <section className="prescription-grid">{prescriptions.map(rx => <article className="prescription-card" key={rx.id}><div className="rx-head"><span>{rx.id}</span><Lock size={18} /></div><h3>{rx.diagnosis}</h3><p>{rx.doctor} on {rx.date}</p><ul>{rx.medicines.map(m => <li key={m}>{m}</li>)}</ul><div className="rx-footer"><span>Follow-up: {rx.followUp}</span><button className="secondary"><Download size={16} /> PDF</button></div></article>)}</section>
  </Page>;
}
