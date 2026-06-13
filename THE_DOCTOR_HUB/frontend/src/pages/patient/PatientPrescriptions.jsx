import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Eye, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { prescriptionService } from '../../services/medicalService';
import PageHeader from '../../components/shared/PageHeader';
import EmptyState from '../../components/shared/EmptyState';
import Button from '../../components/ui/Button';
import { formatDate, getInitials } from '../../lib/utils';

const PatientPrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await prescriptionService.getAll({ limit: 20 });
        setPrescriptions(res.data?.data || []);
      } catch { } finally { setLoading(false); }
    };
    load();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader title="My Prescriptions" subtitle="All your prescriptions in one place" />
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{[...Array(4)].map((_, i) => <div key={i} className="skeleton h-40 rounded-xl" />)}</div>
      ) : prescriptions.length === 0 ? (
        <EmptyState icon={FileText} title="No prescriptions yet" description="Your prescriptions will appear here after consultations" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {prescriptions.map((p, i) => {
            const doc = p.doctor?.user;
            return (
              <motion.div key={p._id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-5 shadow-card hover:shadow-card-hover transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center text-white text-sm font-bold">
                      {doc ? getInitials(doc.firstName, doc.lastName) : 'DR'}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-slate-800 dark:text-white">Dr. {doc?.firstName} {doc?.lastName}</p>
                      <p className="text-xs text-slate-400">{formatDate(p.prescriptionDate || p.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-xs text-emerald-600 font-medium">Valid</span>
                  </div>
                </div>
                <div className="mb-4">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Diagnosis</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">{p.diagnosis}</p>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400 mb-4">
                  <span>💊 {p.medicines?.length || 0} medicine(s)</span>
                  {p.followUpDate && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Follow-up: {formatDate(p.followUpDate)}</span>}
                </div>
                <Button size="sm" variant="outline" fullWidth onClick={() => navigate(`/patient/prescriptions/${p._id}`)} leftIcon={<Eye className="w-3.5 h-3.5" />}>
                  View Prescription
                </Button>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};
export default PatientPrescriptions;
