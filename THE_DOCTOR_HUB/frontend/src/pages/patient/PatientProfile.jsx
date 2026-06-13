// Patient profile page — extends shared ProfilePage with medical profile section
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, AlertTriangle, Pill, Activity, Save } from 'lucide-react';
import { medicalService } from '../../services/medicalService';
import { useToast } from '../../hooks/useToast';
import ProfilePage from '../shared/ProfilePage';
import Button from '../../components/ui/Button';
import PageHeader from '../../components/shared/PageHeader';

const PatientProfile = () => {
  const toast = useToast();
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    bloodGroup: '',
    allergies: '',
    chronicConditions: '',
    currentMedications: '',
    pastSurgeries: '',
    familyHistory: '',
  });

  useEffect(() => {
    const load = async () => {
      try {
        const res = await medicalService.getMyHistory();
        const h = res.data?.data?.history;
        if (h) {
          setHistory(h);
          setForm({
            bloodGroup: h.bloodGroup || '',
            allergies: h.allergies?.join(', ') || '',
            chronicConditions: h.chronicConditions?.join(', ') || '',
            currentMedications: h.currentMedications?.join(', ') || '',
            pastSurgeries: h.pastSurgeries?.join(', ') || '',
            familyHistory: h.familyHistory || '',
          });
        }
      } catch { } finally { setLoading(false); }
    };
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        bloodGroup: form.bloodGroup,
        allergies: form.allergies.split(',').map(s => s.trim()).filter(Boolean),
        chronicConditions: form.chronicConditions.split(',').map(s => s.trim()).filter(Boolean),
        currentMedications: form.currentMedications.split(',').map(s => s.trim()).filter(Boolean),
        pastSurgeries: form.pastSurgeries.split(',').map(s => s.trim()).filter(Boolean),
        familyHistory: form.familyHistory,
      };
      await medicalService.updateProfile(history?.patient?._id || 'me', payload);
      toast.success('Health profile updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-6">
      {/* Standard profile */}
      <ProfilePage />

      {/* Health profile */}
      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-6 shadow-card">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-5 flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500" /> Health Profile
          </h3>

          {loading ? (
            <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="skeleton h-10 rounded-lg" />)}</div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Blood Group
                </label>
                <select value={form.bloodGroup} onChange={(e) => setForm(f => ({ ...f, bloodGroup: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white">
                  <option value="">Select blood group</option>
                  {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>

              {[
                { key: 'allergies', label: 'Allergies', icon: AlertTriangle, placeholder: 'e.g. Penicillin, Aspirin (comma separated)' },
                { key: 'chronicConditions', label: 'Chronic Conditions', icon: Activity, placeholder: 'e.g. Diabetes, Hypertension (comma separated)' },
                { key: 'currentMedications', label: 'Current Medications', icon: Pill, placeholder: 'e.g. Metformin, Lisinopril (comma separated)' },
                { key: 'pastSurgeries', label: 'Past Surgeries', icon: Heart, placeholder: 'e.g. Appendectomy 2019 (comma separated)' },
              ].map(({ key, label, icon: Icon, placeholder }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
                    <Icon className="w-3.5 h-3.5 text-slate-400" /> {label}
                  </label>
                  <input value={form[key]} onChange={(e) => setForm(f => ({ ...f, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="w-full px-3 py-2.5 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white" />
                </div>
              ))}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Family History</label>
                <textarea value={form.familyHistory} onChange={(e) => setForm(f => ({ ...f, familyHistory: e.target.value }))}
                  rows={3} placeholder="Any hereditary conditions in family..."
                  className="w-full px-3 py-2.5 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white resize-none" />
              </div>

              <Button onClick={handleSave} isLoading={saving} variant="gradient" leftIcon={<Save className="w-4 h-4" />}>
                Save Health Profile
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default PatientProfile;
