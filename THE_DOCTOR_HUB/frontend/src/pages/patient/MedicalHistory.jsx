import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ClipboardList, Heart, Pill, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { medicalService } from '../../services/medicalService';
import PageHeader from '../../components/shared/PageHeader';
import EmptyState from '../../components/shared/EmptyState';
import { formatDate, getInitials } from '../../lib/utils';

const InfoChip = ({ label }) => (
  <span className="inline-flex items-center px-2.5 py-1 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 rounded-full text-xs font-medium">{label}</span>
);

const RecordCard = ({ record, index }) => {
  const [expanded, setExpanded] = useState(false);
  const doc = record.doctor?.user;
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
      className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 overflow-hidden shadow-card">
      <button onClick={() => setExpanded(!expanded)} className="w-full flex items-center gap-4 p-5 text-left hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
        <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
          {doc ? getInitials(doc.firstName, doc.lastName) : 'DR'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-slate-800 dark:text-white">Dr. {doc?.firstName} {doc?.lastName}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{formatDate(record.recordDate)} · {record.diagnosis || 'General Consultation'}</p>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />}
      </button>
      {expanded && (
        <div className="px-5 pb-5 space-y-4 border-t border-gray-50 dark:border-slate-700/50 pt-4">
          {record.chiefComplaint && <div><p className="text-xs font-semibold text-slate-400 uppercase mb-1">Chief Complaint</p><p className="text-sm text-slate-700 dark:text-slate-300">{record.chiefComplaint}</p></div>}
          {record.diagnosis && <div><p className="text-xs font-semibold text-slate-400 uppercase mb-1">Diagnosis</p><p className="text-sm text-slate-700 dark:text-slate-300">{record.diagnosis}</p></div>}
          {record.vitalSigns && Object.values(record.vitalSigns).some(Boolean) && (
            <div><p className="text-xs font-semibold text-slate-400 uppercase mb-2">Vital Signs</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {Object.entries(record.vitalSigns).filter(([, v]) => v).map(([k, v]) => (
                  <div key={k} className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-2 text-center">
                    <p className="text-xs text-slate-400 capitalize">{k.replace(/([A-Z])/g, ' $1')}</p>
                    <p className="font-semibold text-sm text-slate-800 dark:text-white">{v}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {record.medications?.length > 0 && (
            <div><p className="text-xs font-semibold text-slate-400 uppercase mb-2">Medications</p>
              <div className="space-y-2">
                {record.medications.map((m, i) => (
                  <div key={i} className="flex items-start gap-2 bg-blue-50 dark:bg-blue-900/10 rounded-lg p-3">
                    <span className="text-blue-500">💊</span>
                    <div><p className="font-medium text-sm text-slate-800 dark:text-white">{m.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{m.dosage} · {m.frequency} · {m.duration}</p>
                      {m.instructions && <p className="text-xs text-slate-400 mt-0.5">{m.instructions}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {record.treatmentNotes && <div><p className="text-xs font-semibold text-slate-400 uppercase mb-1">Treatment Notes</p><p className="text-sm text-slate-700 dark:text-slate-300">{record.treatmentNotes}</p></div>}
          {record.followUpRequired && record.followUpDate && (
            <div className="bg-amber-50 dark:bg-amber-900/10 rounded-lg p-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
              <p className="text-sm text-amber-700 dark:text-amber-400">Follow-up required on {formatDate(record.followUpDate)}</p>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};

const MedicalHistory = () => {
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await medicalService.getMyHistory();
        setHistory(res.data?.data?.history);
      } catch { } finally { setLoading(false); }
    };
    load();
  }, []);

  if (loading) return <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="skeleton h-24 rounded-xl" />)}</div>;

  return (
    <div className="space-y-6">
      <PageHeader title="Medical History" subtitle={`${history?.records?.length || 0} records · ${history?.totalVisits || 0} total visits`} />

      {/* Profile info */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-5 shadow-card">
        <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Health Profile</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="bg-red-50 dark:bg-red-900/10 rounded-lg p-3 text-center">
            <p className="text-xs text-slate-400 mb-1">Blood Group</p>
            <p className="font-bold text-2xl text-red-600 dark:text-red-400">{history?.bloodGroup || '—'}</p>
          </div>
          <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-3">
            <p className="text-xs text-slate-400 mb-2 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Allergies</p>
            {history?.allergies?.length ? history.allergies.map((a) => <InfoChip key={a} label={a} />) : <p className="text-xs text-slate-400">None recorded</p>}
          </div>
          <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-3">
            <p className="text-xs text-slate-400 mb-2 flex items-center gap-1"><Heart className="w-3 h-3" /> Chronic Conditions</p>
            {history?.chronicConditions?.length ? history.chronicConditions.map((c) => <InfoChip key={c} label={c} />) : <p className="text-xs text-slate-400">None recorded</p>}
          </div>
          <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-3">
            <p className="text-xs text-slate-400 mb-2 flex items-center gap-1"><Pill className="w-3 h-3" /> Current Medications</p>
            {history?.currentMedications?.length ? history.currentMedications.map((m) => <InfoChip key={m} label={m} />) : <p className="text-xs text-slate-400">None</p>}
          </div>
        </div>
      </div>

      {/* Records */}
      <div>
        <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Consultation Records</h3>
        {!history?.records?.length ? (
          <EmptyState icon={ClipboardList} title="No records yet" description="Your medical records will appear here after consultations" />
        ) : (
          <div className="space-y-3">
            {[...history.records].reverse().map((record, i) => <RecordCard key={record._id || i} record={record} index={i} />)}
          </div>
        )}
      </div>
    </div>
  );
};
export default MedicalHistory;
