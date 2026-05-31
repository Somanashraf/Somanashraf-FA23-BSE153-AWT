import { CheckCircle2, Eye, ShieldCheck, XCircle } from 'lucide-react';
import { Page } from '../components/common/UI.jsx';
import { appointments } from '../data/mockData.js';
import { useApp } from '../context/AppContext.jsx';

export default function Verification() {
  const { setToast } = useApp();
  return <Page title="Assistant verification" eyebrow="Payment and queue control">
    <div className="verification-layout"><div className="panel"><div className="panel-head"><h3>Payment screenshots</h3><span>Verify before queue confirmation</span></div>{appointments.filter(a => a.status !== 'Completed').map(a => <div className="verify-row" key={a.id}><div className="screenshot"><ShieldCheck size={20} /></div><div><strong>{a.id}</strong><span>{a.patient} paid Rs {a.fee}</span></div><div className="row-actions"><button className="icon"><Eye size={16} /></button><button className="icon" onClick={() => setToast({ type: 'success', message: `${a.id} approved` })}><CheckCircle2 size={16} /></button><button className="icon danger" onClick={() => setToast({ type: 'error', message: `${a.id} rejected` })}><XCircle size={16} /></button></div></div>)}</div><div className="panel"><div className="panel-head"><h3>Doctor schedule</h3><span>Today</span></div><div className="schedule-list"><span>Dr. Sana Khan - 5:00 PM to 9:00 PM</span><span>Dr. Hammad Raza - 2:00 PM to 6:00 PM</span><span>Dr. Mariam Shah - 4:30 PM to 8:30 PM</span></div></div></div>
  </Page>;
}
