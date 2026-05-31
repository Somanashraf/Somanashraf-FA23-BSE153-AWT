import { motion } from 'framer-motion';
import { CalendarPlus, Filter, MapPin, Search, Star } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Page, EmptyState } from '../components/common/UI.jsx';
import { doctors } from '../data/mockData.js';
import { useApp } from '../context/AppContext.jsx';

export default function FindDoctors() {
  const { setToast } = useApp();
  const [filters, setFilters] = useState({ disease: '', treatmentType: '', city: '', maxFee: 3000 });
  const results = useMemo(() => doctors.filter(d => (!filters.disease || d.diseases.join(' ').toLowerCase().includes(filters.disease.toLowerCase())) && (!filters.treatmentType || d.treatmentType === filters.treatmentType) && (!filters.city || d.city === filters.city) && d.fee <= Number(filters.maxFee)), [filters]);
  const update = (key, value) => setFilters(prev => ({ ...prev, [key]: value }));

  return <Page title="Find the right doctor" eyebrow="Patient search" actions={<button className="secondary"><Filter size={17} /> Save filters</button>}>
    <form className="filter-panel">
      <label><span>Disease</span><div className="input-icon"><Search size={17} /><input value={filters.disease} onChange={(e) => update('disease', e.target.value)} placeholder="Hypertension, asthma, acne" /></div></label>
      <label><span>Treatment</span><select value={filters.treatmentType} onChange={(e) => update('treatmentType', e.target.value)}><option value="">Any treatment</option><option>Allopathic</option><option>Homeopathic</option><option>Herbal</option></select></label>
      <label><span>City</span><select value={filters.city} onChange={(e) => update('city', e.target.value)}><option value="">Any city</option><option>Lahore</option><option>Karachi</option><option>Islamabad</option><option>Faisalabad</option></select></label>
      <label><span>Max fee Rs {filters.maxFee}</span><input type="range" min="1000" max="3500" step="100" value={filters.maxFee} onChange={(e) => update('maxFee', e.target.value)} /></label>
    </form>
    {results.length === 0 ? <EmptyState title="No doctors match this search" text="Adjust the disease, treatment type, city, or fee range to discover available doctors." /> : <section className="doctor-grid">{results.map((doctor, index) => <motion.article className="doctor-card" key={doctor.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * .05 }} whileHover={{ y: -5 }}>
      <div className="doctor-top"><div className="doctor-avatar">{doctor.name.split(' ').slice(1).map(n => n[0]).join('')}</div><div><h3>{doctor.name}</h3><p>{doctor.specialization}</p></div><span className="rating"><Star size={15} fill="currentColor" />{doctor.rating}</span></div>
      <div className="chips"><span>{doctor.treatmentType}</span><span>{doctor.experience} years</span><span>Rs {doctor.fee}</span></div>
      <p className="diseases">Treats {doctor.diseases.join(', ')}</p>
      <div className="doctor-meta"><span><MapPin size={16} />{doctor.city}</span><span>{doctor.clinic}</span></div>
      <button className="primary full" onClick={() => setToast({ type: 'success', message: `Appointment request started for ${doctor.name}` })}><CalendarPlus size={17} /> Book {doctor.next}</button>
    </motion.article>)}</section>}
  </Page>;
}
