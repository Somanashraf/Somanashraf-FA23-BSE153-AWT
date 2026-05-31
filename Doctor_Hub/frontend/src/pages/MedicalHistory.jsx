import { Download, FilePlus2, LockKeyhole, Stethoscope } from 'lucide-react';
import { Page } from '../components/common/UI.jsx';
import { history } from '../data/mockData.js';
import { useApp } from '../context/AppContext.jsx';

export default function MedicalHistory() {
  const { setToast } = useApp();
  return <Page title="Permanent medical history" eyebrow="Append-only clinical record" actions={<button className="secondary" onClick={() => setToast({ type: 'success', message: 'Lab report queued for secure upload' })}><FilePlus2 size={17} /> Upload lab report</button>}>
    <div className="rules-panel"><LockKeyhole size={22} /><div><strong>History cannot be deleted or overwritten</strong><span>Doctors append diagnosis, prescriptions, recommendations, and follow-up notes. Every update creates a new entry for audit safety.</span></div></div>
    <section className="timeline">{history.map((item, index) => <article key={item.title} className="timeline-item"><div className="timeline-dot"><Stethoscope size={16} /></div><div className="panel"><div className="panel-head inline"><div><h3>{item.title}</h3><span>{item.type} by {item.doctor}</span></div><time>{item.date}</time></div><p>{item.detail}</p></div></article>)}</section>
  </Page>;
}
