import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Eye, FileText, ClipboardList } from 'lucide-react';
import { motion } from 'framer-motion';
import { appointmentService } from '../../services/appointmentService';
import { medicalService } from '../../services/medicalService';
import PageHeader from '../../components/shared/PageHeader';
import EmptyState from '../../components/shared/EmptyState';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { formatDate, getInitials } from '../../lib/utils';
import { useToast } from '../../hooks/useToast';

const DoctorPatients = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [historyModal, setHistoryModal] = useState({ open: false, patient: null, history: null });
  const [addRecordModal, setAddRecordModal] = useState({ open: false, patient: null, appointmentId: null });
  const [recordForm, setRecordForm] = useState({ chiefComplaint: '', diagnosis: '', treatmentNotes: '', additionalNotes: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await appointmentService.getAppointments({ limit: 100, status: 'completed' });
        const appts = res.data?.data || [];
        // Unique patients
        const seen = new Set();
        const uniquePatients = [];
        appts.forEach((a) => {
          if (a.patient && !seen.has(a.patient._id)) {
            seen.add(a.patient._id);
            uniquePatients.push({ ...a.patient, lastVisit: a.appointmentDate, lastAppointmentId: a._id });
          }
        });
        setPatients(uniquePatients);
      } catch { } finally { setLoading(false); }
    };
    load();
  }, []);

  const viewHistory = async (patient) => {
    try {
      const res = await medicalService.getPatientHistory(patient._id);
      setHistoryModal({ open: true, patient, history: res.data?.data?.history });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cannot view history');
    }
  };

  const handleAddRecord = async () => {
    if (!recordForm.diagnosis) { toast.error('Diagnosis is required'); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(recordForm).forEach(([k, v]) => fd.append(k, v));
      if (addRecordModal.appointmentId) fd.append('appointmentId', addRecordModal.appointmentId);
      await medicalService.addRecord(addRecordModal.patient._id, fd);
      toast.success('Medical record added');
      setAddRecordModal({ open: false, patient: null, appointmentId: null });
      setRecordForm({ chiefComplaint: '', diagnosis: '', treatmentNotes: '', additionalNotes: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to add record'); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="My Patients" subtitle={`${patients.length} unique patients`} />

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="skeleton h-40 rounded-xl" />)}
        </div>
      ) : patients.length === 0 ? (
        <EmptyState icon={Users} title="No patients yet" description="Patients will appear here after completed appointments" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {patients.map((patient, i) => (
            <motion.div key={patient._id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-5 shadow-card hover:shadow-card-hover transition-all">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white font-bold overflow-hidden flex-shrink-0">
                  {patient.profilePicture?.url
                    ? <img src={patient.profilePicture.url} alt="" className="w-full h-full object-cover" />
                    : getInitials(patient.firstName, patient.lastName)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800 dark:text-white truncate">{patient.firstName} {patient.lastName}</p>
                  <p className="text-xs text-slate-400 truncate">{patient.email}</p>
                  {patient.phone && <p className="text-xs text-slate-400">{patient.phone}</p>}
                </div>
              </div>
              <p className="text-xs text-slate-400 mb-4">Last visit: {formatDate(patient.lastVisit)}</p>
              <div className="grid grid-cols-2 gap-2">
                <Button size="xs" variant="outline" fullWidth onClick={() => viewHistory(patient)} leftIcon={<ClipboardList className="w-3.5 h-3.5" />}>
                  History
                </Button>
                <Button size="xs" variant="primary" fullWidth
                  onClick={() => { setAddRecordModal({ open: true, patient, appointmentId: patient.lastAppointmentId }); setRecordForm({ chiefComplaint: '', diagnosis: '', treatmentNotes: '', additionalNotes: '' }); }}
                  leftIcon={<FileText className="w-3.5 h-3.5" />}>
                  Add Record
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* History Modal */}
      <Modal isOpen={historyModal.open} onClose={() => setHistoryModal({ open: false, patient: null, history: null })}
        title={`${historyModal.patient?.firstName}'s Medical History`} size="lg">
        {historyModal.history ? (
          <div className="space-y-4">
            {/* Health profile */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-red-50 dark:bg-red-900/10 rounded-lg p-3 text-center">
                <p className="text-xs text-slate-400 mb-1">Blood Group</p>
                <p className="font-bold text-xl text-red-600">{historyModal.history.bloodGroup || '—'}</p>
              </div>
              <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-3">
                <p className="text-xs text-slate-400 mb-1">Allergies</p>
                <p className="text-sm text-slate-700 dark:text-slate-300">{historyModal.history.allergies?.join(', ') || 'None'}</p>
              </div>
            </div>
            {/* Records */}
            <div>
              <p className="font-semibold text-sm text-slate-700 dark:text-slate-300 mb-2">Records ({historyModal.history.records?.length || 0})</p>
              {historyModal.history.records?.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-4">No records yet</p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {[...historyModal.history.records].reverse().map((r, i) => (
                    <div key={i} className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-3 border border-gray-100 dark:border-slate-600">
                      <div className="flex justify-between items-start mb-1">
                        <p className="font-medium text-sm text-slate-800 dark:text-white">{r.diagnosis || 'Consultation'}</p>
                        <p className="text-xs text-slate-400">{formatDate(r.recordDate)}</p>
                      </div>
                      {r.chiefComplaint && <p className="text-xs text-slate-500">Complaint: {r.chiefComplaint}</p>}
                      {r.treatmentNotes && <p className="text-xs text-slate-500">Treatment: {r.treatmentNotes}</p>}
                      {r.medications?.length > 0 && <p className="text-xs text-blue-500 mt-1">💊 {r.medications.map(m => m.name).join(', ')}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <p className="text-center text-slate-400 py-8">No medical history found</p>
        )}
      </Modal>

      {/* Add Record Modal */}
      <Modal isOpen={addRecordModal.open} onClose={() => setAddRecordModal({ open: false, patient: null, appointmentId: null })}
        title={`Add Record — ${addRecordModal.patient?.firstName} ${addRecordModal.patient?.lastName}`} size="md">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">Chief Complaint</label>
            <input value={recordForm.chiefComplaint} onChange={(e) => setRecordForm(f => ({ ...f, chiefComplaint: e.target.value }))}
              placeholder="Patient's main complaint"
              className="w-full px-3 py-2.5 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white" />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">Diagnosis *</label>
            <textarea value={recordForm.diagnosis} onChange={(e) => setRecordForm(f => ({ ...f, diagnosis: e.target.value }))} rows={2}
              placeholder="Enter diagnosis"
              className="w-full px-3 py-2.5 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white resize-none" />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">Treatment Notes</label>
            <textarea value={recordForm.treatmentNotes} onChange={(e) => setRecordForm(f => ({ ...f, treatmentNotes: e.target.value }))} rows={2}
              placeholder="Treatment given"
              className="w-full px-3 py-2.5 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white resize-none" />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">Additional Notes</label>
            <textarea value={recordForm.additionalNotes} onChange={(e) => setRecordForm(f => ({ ...f, additionalNotes: e.target.value }))} rows={2}
              placeholder="Any additional notes"
              className="w-full px-3 py-2.5 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white resize-none" />
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" fullWidth onClick={() => setAddRecordModal({ open: false, patient: null, appointmentId: null })}>Cancel</Button>
            <Button variant="gradient" fullWidth isLoading={saving} onClick={handleAddRecord}>Add Record</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
export default DoctorPatients;
