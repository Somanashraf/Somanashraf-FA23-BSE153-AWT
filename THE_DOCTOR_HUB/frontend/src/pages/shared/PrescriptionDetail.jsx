import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Printer, Download, Pill, Calendar, User, Stethoscope, FlaskConical } from 'lucide-react';
import { prescriptionService } from '../../services/medicalService';
import { useToast } from '../../hooks/useToast';
import Button from '../../components/ui/Button';
import { formatDate, getInitials } from '../../lib/utils';

const PrescriptionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [prescription, setPrescription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await prescriptionService.getById(id);
        setPrescription(res.data?.data?.prescription);
      } catch { toast.error('Prescription not found'); navigate(-1); }
      finally { setLoading(false); }
    };
    load();
  }, [id]);

  const handlePrint = () => window.print();

  if (loading) return (
    <div className="space-y-4 max-w-2xl mx-auto">
      {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-28 rounded-xl" />)}
    </div>
  );
  if (!prescription) return null;

  const doc = prescription.doctor?.user;
  const pat = prescription.patient;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-slate-500 hover:text-primary-600 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={handlePrint} leftIcon={<Printer className="w-4 h-4" />}>Print</Button>
        </div>
      </div>

      {/* Prescription card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-card overflow-hidden print:shadow-none print:border-gray-300">

        {/* Header */}
        <div className="bg-gradient-primary p-6 text-white print:bg-blue-600">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Stethoscope className="w-5 h-5" />
                <span className="font-bold text-lg">Doctor Hub</span>
              </div>
              <p className="text-white/80 text-sm">Medical Prescription</p>
            </div>
            <div className="text-right">
              <p className="text-white/80 text-xs">Date</p>
              <p className="font-semibold">{formatDate(prescription.prescriptionDate || prescription.createdAt)}</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Doctor & Patient Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/10 rounded-xl p-4">
              <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase mb-2 flex items-center gap-1">
                <Stethoscope className="w-3.5 h-3.5" /> Prescribed By
              </p>
              <p className="font-bold text-slate-800 dark:text-white">Dr. {doc?.firstName} {doc?.lastName}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{prescription.doctor?.specialization?.[0]}</p>
              <p className="text-xs text-slate-400 mt-0.5">Lic: {prescription.doctor?.licenseNumber}</p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/10 rounded-xl p-4">
              <p className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase mb-2 flex items-center gap-1">
                <User className="w-3.5 h-3.5" /> Patient
              </p>
              <p className="font-bold text-slate-800 dark:text-white">{pat?.firstName} {pat?.lastName}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{pat?.email}</p>
              {pat?.dateOfBirth && <p className="text-xs text-slate-400 mt-0.5">DOB: {formatDate(pat.dateOfBirth)}</p>}
            </div>
          </div>

          {/* Diagnosis */}
          <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-xl p-4">
            <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase mb-1">Diagnosis</p>
            <p className="text-slate-800 dark:text-white font-medium">{prescription.diagnosis}</p>
            {prescription.chiefComplaint && (
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Chief Complaint: {prescription.chiefComplaint}</p>
            )}
          </div>

          {/* Medicines */}
          {prescription.medicines?.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                <Pill className="w-4 h-4 text-primary-600" /> Prescribed Medicines ({prescription.medicines.length})
              </p>
              <div className="space-y-2">
                {prescription.medicines.map((med, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-xl border border-gray-100 dark:border-slate-600">
                    <div className="w-7 h-7 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-primary-600 dark:text-primary-400">{i + 1}</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-slate-800 dark:text-white">{med.name}</p>
                      {med.genericName && <p className="text-xs text-slate-400">({med.genericName})</p>}
                      <div className="flex flex-wrap gap-3 mt-1">
                        <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded-full">💊 {med.dosage}</span>
                        <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 px-2 py-0.5 rounded-full">🔄 {med.frequency}</span>
                        <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full">⏱️ {med.duration}</span>
                        {med.route && <span className="text-xs bg-gray-100 dark:bg-slate-600 text-gray-600 dark:text-slate-300 px-2 py-0.5 rounded-full capitalize">{med.route}</span>}
                      </div>
                      {med.instructions && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 italic">Note: {med.instructions}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lab Tests */}
          {prescription.labTests?.length > 0 && (
            <div className="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-4">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-secondary-500" /> Lab Tests
              </p>
              <div className="flex flex-wrap gap-2">
                {prescription.labTests.map((t, i) => (
                  <span key={i} className="text-xs bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 px-3 py-1 rounded-full font-medium">🧪 {t}</span>
                ))}
              </div>
            </div>
          )}

          {/* Advice */}
          {prescription.advice && (
            <div className="bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/30 rounded-xl p-4">
              <p className="text-xs font-semibold text-green-700 dark:text-green-400 uppercase mb-1">Advice & Instructions</p>
              <p className="text-sm text-slate-700 dark:text-slate-300">{prescription.advice}</p>
            </div>
          )}

          {/* Follow-up */}
          {prescription.followUpDate && (
            <div className="flex items-center gap-3 bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-900/30 rounded-xl p-4">
              <Calendar className="w-5 h-5 text-purple-500 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-purple-700 dark:text-purple-400 uppercase">Follow-up</p>
                <p className="text-sm text-slate-700 dark:text-slate-300">{formatDate(prescription.followUpDate)}</p>
                {prescription.followUpInstructions && <p className="text-xs text-slate-500 mt-0.5">{prescription.followUpInstructions}</p>}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="pt-4 border-t border-gray-100 dark:border-slate-700 text-center">
            <p className="text-xs text-slate-400">This prescription was issued digitally via Doctor Hub</p>
            <p className="text-xs text-slate-400 mt-0.5">Valid for 30 days from issue date</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
export default PrescriptionDetail;
