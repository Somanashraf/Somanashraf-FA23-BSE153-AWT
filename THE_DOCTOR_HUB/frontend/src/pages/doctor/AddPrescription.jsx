import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Trash2, FileText, Save } from 'lucide-react';
import { prescriptionService } from '../../services/medicalService';
import { useToast } from '../../hooks/useToast';
import PageHeader from '../../components/shared/PageHeader';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const emptyMed = { name: '', genericName: '', dosage: '', frequency: '', duration: '', route: 'oral', instructions: '' };

const AddPrescription = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const appointmentId = location.state?.appointmentId || new URLSearchParams(window.location.search).get('appointmentId');

  const [form, setForm] = useState({ diagnosis: '', chiefComplaint: '', medicines: [{ ...emptyMed }], labTests: [''], advice: '', followUpDate: '', followUpInstructions: '', notes: '' });
  const [saving, setSaving] = useState(false);

  const updateField = (field, val) => setForm((f) => ({ ...f, [field]: val }));
  const addMed = () => setForm((f) => ({ ...f, medicines: [...f.medicines, { ...emptyMed }] }));
  const removeMed = (i) => setForm((f) => ({ ...f, medicines: f.medicines.filter((_, idx) => idx !== i) }));
  const updateMed = (i, field, val) => setForm((f) => {
    const meds = [...f.medicines];
    meds[i] = { ...meds[i], [field]: val };
    return { ...f, medicines: meds };
  });
  const addLabTest = () => setForm((f) => ({ ...f, labTests: [...f.labTests, ''] }));
  const updateLabTest = (i, val) => setForm((f) => { const t = [...f.labTests]; t[i] = val; return { ...f, labTests: t }; });
  const removeLabTest = (i) => setForm((f) => ({ ...f, labTests: f.labTests.filter((_, idx) => idx !== i) }));

  const handleSave = async () => {
    if (!appointmentId) { toast.error('No appointment ID provided'); return; }
    if (!form.diagnosis) { toast.error('Diagnosis is required'); return; }
    const validMeds = form.medicines.filter((m) => m.name);
    if (!validMeds.length) { toast.error('At least one medicine is required'); return; }
    setSaving(true);
    try {
      const data = { ...form, appointmentId, medicines: validMeds, labTests: form.labTests.filter(Boolean) };
      await prescriptionService.create(data);
      toast.success('Prescription created successfully');
      navigate('/doctor/appointments');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to create prescription'); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <PageHeader title="Create Prescription" subtitle="Add medicines and diagnosis for the patient" />

      {!appointmentId && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 text-sm text-amber-700 dark:text-amber-400">
          ⚠️ No appointment linked. Navigate from an appointment to create a prescription.
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-6 shadow-card space-y-5">
        <h3 className="font-semibold text-slate-800 dark:text-white">Diagnosis</h3>
        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">Chief Complaint</label>
          <input value={form.chiefComplaint} onChange={(e) => updateField('chiefComplaint', e.target.value)} placeholder="Patient's main complaint..."
            className="w-full px-3 py-2.5 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white" />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">Diagnosis *</label>
          <textarea value={form.diagnosis} onChange={(e) => updateField('diagnosis', e.target.value)} rows={2} placeholder="Enter diagnosis..."
            className="w-full px-3 py-2.5 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white resize-none" />
        </div>
      </div>

      {/* Medicines */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-6 shadow-card">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-slate-800 dark:text-white">Medicines *</h3>
          <Button size="sm" variant="outline" onClick={addMed} leftIcon={<Plus className="w-3.5 h-3.5" />}>Add Medicine</Button>
        </div>
        <div className="space-y-4">
          {form.medicines.map((med, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl border border-gray-100 dark:border-slate-600">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Medicine #{i + 1}</span>
                {form.medicines.length > 1 && (
                  <button onClick={() => removeMed(i)} className="text-red-400 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input value={med.name} onChange={(e) => updateMed(i, 'name', e.target.value)} placeholder="Medicine name *"
                  className="px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white col-span-2" />
                <input value={med.dosage} onChange={(e) => updateMed(i, 'dosage', e.target.value)} placeholder="Dosage (e.g., 500mg)"
                  className="px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white" />
                <input value={med.frequency} onChange={(e) => updateMed(i, 'frequency', e.target.value)} placeholder="Frequency (e.g., TDS)"
                  className="px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white" />
                <input value={med.duration} onChange={(e) => updateMed(i, 'duration', e.target.value)} placeholder="Duration (e.g., 7 days)"
                  className="px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white" />
                <select value={med.route} onChange={(e) => updateMed(i, 'route', e.target.value)}
                  className="px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white">
                  {['oral', 'topical', 'injection', 'inhaled', 'other'].map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
                <input value={med.instructions} onChange={(e) => updateMed(i, 'instructions', e.target.value)} placeholder="Special instructions"
                  className="px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white col-span-2" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Lab tests */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-6 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-800 dark:text-white">Lab Tests</h3>
          <Button size="sm" variant="outline" onClick={addLabTest} leftIcon={<Plus className="w-3.5 h-3.5" />}>Add Test</Button>
        </div>
        <div className="space-y-2">
          {form.labTests.map((test, i) => (
            <div key={i} className="flex gap-2">
              <input value={test} onChange={(e) => updateLabTest(i, e.target.value)} placeholder="e.g., CBC, Blood Sugar"
                className="flex-1 px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white" />
              <button onClick={() => removeLabTest(i)} className="text-red-400 hover:text-red-600 transition-colors px-2"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
      </div>

      {/* Advice & Follow-up */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-6 shadow-card space-y-4">
        <h3 className="font-semibold text-slate-800 dark:text-white">Advice & Follow-up</h3>
        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">Advice / Instructions</label>
          <textarea value={form.advice} onChange={(e) => updateField('advice', e.target.value)} rows={3} placeholder="General advice for patient..."
            className="w-full px-3 py-2.5 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white resize-none" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">Follow-up Date</label>
            <input type="date" value={form.followUpDate} onChange={(e) => updateField('followUpDate', e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white" />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">Follow-up Instructions</label>
            <input value={form.followUpInstructions} onChange={(e) => updateField('followUpInstructions', e.target.value)} placeholder="What to check on follow-up"
              className="w-full px-3 py-2.5 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white" />
          </div>
        </div>
      </div>

      <div className="flex gap-3 pb-4">
        <Button variant="outline" onClick={() => navigate(-1)} className="flex-1">Cancel</Button>
        <Button variant="gradient" isLoading={saving} onClick={handleSave} className="flex-1" leftIcon={<Save className="w-4 h-4" />}>
          Save Prescription
        </Button>
      </div>
    </div>
  );
};
export default AddPrescription;
