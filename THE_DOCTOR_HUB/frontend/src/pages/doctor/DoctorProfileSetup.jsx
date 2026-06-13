import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Save, Plus, Trash2, Stethoscope, Award, DollarSign, Clock } from 'lucide-react';
import { doctorService } from '../../services/doctorService';
import { useToast } from '../../hooks/useToast';
import Button from '../../components/ui/Button';
import PageHeader from '../../components/shared/PageHeader';

const SPECIALIZATIONS = ['Cardiologist','Dermatologist','Neurologist','Orthopedic','Pediatrician','Psychiatrist','General Physician','Gynecologist','Oncologist','Ophthalmologist','ENT Specialist','Dentist','Urologist','Gastroenterologist','Endocrinologist','Pulmonologist','Rheumatologist','Nephrologist','Hematologist','Radiologist'];
const TREATMENT_TYPES = ['General Checkup','Surgery','Consultation','Physiotherapy','Therapy','Vaccination','Lab Tests','Emergency Care','Chronic Disease Management','Preventive Care'];
const DISEASES = ['Heart Disease','Diabetes','Hypertension','Asthma','Cancer','Arthritis','Depression','Anxiety','Obesity','Kidney Disease','Liver Disease','Thyroid Disorder','Skin Disease','Eye Disease','Ear Disease','Bone Disease','Neurological Disorder','Digestive Disorder','Respiratory Disease','Infectious Disease'];
const DAYS = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];

const DoctorProfileSetup = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    licenseNumber: '',
    doctorType: 'allopathic',
    specialization: [],
    treatmentTypes: [],
    diseases: [],
    experience: '',
    consultationFee: '',
    consultationFeeOnline: '',
    about: '',
    languages: ['Urdu', 'English'],
    qualifications: [{ degree: '', institution: '', year: '', country: 'Pakistan' }],
    availability: {
      monday: { isOpen: true, slots: [{ start: '09:00', end: '17:00' }] },
      tuesday: { isOpen: true, slots: [{ start: '09:00', end: '17:00' }] },
      wednesday: { isOpen: true, slots: [{ start: '09:00', end: '17:00' }] },
      thursday: { isOpen: true, slots: [{ start: '09:00', end: '17:00' }] },
      friday: { isOpen: true, slots: [{ start: '09:00', end: '17:00' }] },
      saturday: { isOpen: false, slots: [{ start: '09:00', end: '14:00' }] },
      sunday: { isOpen: false, slots: [] },
    },
  });

  useEffect(() => {
    const check = async () => {
      try {
        const res = await doctorService.getMyProfile();
        if (res.data?.data?.doctor) {
          setHasProfile(true);
          const d = res.data.data.doctor;
          setForm({
            licenseNumber: d.licenseNumber || '',
            doctorType: d.doctorType || 'allopathic',
            specialization: d.specialization || [],
            treatmentTypes: d.treatmentTypes || [],
            diseases: d.diseases || [],
            experience: d.experience || '',
            consultationFee: d.consultationFee || '',
            consultationFeeOnline: d.consultationFeeOnline || '',
            about: d.about || '',
            languages: d.languages || ['Urdu', 'English'],
            qualifications: d.qualifications?.length ? d.qualifications : [{ degree: '', institution: '', year: '', country: 'Pakistan' }],
            availability: d.availability || form.availability,
          });
        }
      } catch { } finally { setLoading(false); }
    };
    check();
  }, []);

  const toggleItem = (field, val) => {
    setForm((f) => ({
      ...f,
      [field]: f[field].includes(val) ? f[field].filter((x) => x !== val) : [...f[field], val],
    }));
  };

  const updateQual = (i, field, val) => {
    setForm((f) => {
      const q = [...f.qualifications];
      q[i] = { ...q[i], [field]: val };
      return { ...f, qualifications: q };
    });
  };

  const toggleDay = (day) => {
    setForm((f) => ({
      ...f,
      availability: {
        ...f.availability,
        [day]: { ...f.availability[day], isOpen: !f.availability[day].isOpen },
      },
    }));
  };

  const handleSave = async () => {
    if (!form.licenseNumber) { toast.error('License number required'); return; }
    if (!form.specialization.length) { toast.error('Select at least one specialization'); return; }
    if (!form.consultationFee) { toast.error('Consultation fee required'); return; }
    if (!form.experience) { toast.error('Experience required'); return; }

    setSaving(true);
    try {
      const payload = {
        ...form,
        experience: Number(form.experience),
        consultationFee: Number(form.consultationFee),
        consultationFeeOnline: Number(form.consultationFeeOnline) || 0,
        qualifications: form.qualifications.filter((q) => q.degree && q.institution),
      };

      if (hasProfile) {
        await doctorService.updateProfile(payload);
        toast.success('Profile updated! Awaiting admin approval.');
      } else {
        await doctorService.createProfile(payload);
        toast.success('Doctor profile created! Awaiting admin approval.');
      }
      setTimeout(() => navigate('/doctor/dashboard'), 1500);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save profile');
    } finally { setSaving(false); }
  };

  if (loading) return <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="skeleton h-32 rounded-xl" />)}</div>;

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-10">
      <PageHeader
        title={hasProfile ? 'Update Doctor Profile' : 'Complete Doctor Profile'}
        subtitle="Fill in your professional details to start receiving appointments"
      />

      {!hasProfile && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex items-start gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <p className="font-semibold text-amber-800 dark:text-amber-400">Profile Incomplete</p>
            <p className="text-sm text-amber-700 dark:text-amber-500">Complete your doctor profile to get approved and start receiving patient appointments.</p>
          </div>
        </div>
      )}

      {/* Basic Info */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-6 shadow-card space-y-4">
        <h3 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
          <Stethoscope className="w-5 h-5 text-primary-600" /> Basic Information
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">License Number *</label>
            <input value={form.licenseNumber} onChange={(e) => setForm((f) => ({ ...f, licenseNumber: e.target.value }))}
              placeholder="e.g. PMDC-12345"
              className="w-full px-3 py-2.5 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white" />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">Doctor Type *</label>
            <select value={form.doctorType} onChange={(e) => setForm((f) => ({ ...f, doctorType: e.target.value }))}
              className="w-full px-3 py-2.5 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white">
              <option value="allopathic">Allopathic</option>
              <option value="homeopathic">Homeopathic</option>
              <option value="herbal">Herbal</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">Experience (Years) *</label>
            <input type="number" value={form.experience} onChange={(e) => setForm((f) => ({ ...f, experience: e.target.value }))}
              placeholder="e.g. 5"
              className="w-full px-3 py-2.5 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white" />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">In-Person Fee (Rs.) *</label>
            <input type="number" value={form.consultationFee} onChange={(e) => setForm((f) => ({ ...f, consultationFee: e.target.value }))}
              placeholder="e.g. 1000"
              className="w-full px-3 py-2.5 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white" />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">Online Fee (Rs.)</label>
            <input type="number" value={form.consultationFeeOnline} onChange={(e) => setForm((f) => ({ ...f, consultationFeeOnline: e.target.value }))}
              placeholder="e.g. 800"
              className="w-full px-3 py-2.5 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white" />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">Languages</label>
            <input value={form.languages.join(', ')} onChange={(e) => setForm((f) => ({ ...f, languages: e.target.value.split(',').map((l) => l.trim()) }))}
              placeholder="e.g. Urdu, English"
              className="w-full px-3 py-2.5 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white" />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">About / Bio</label>
          <textarea value={form.about} onChange={(e) => setForm((f) => ({ ...f, about: e.target.value }))} rows={3}
            placeholder="Describe your experience and expertise..."
            className="w-full px-3 py-2.5 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white resize-none" />
        </div>
      </div>

      {/* Specializations */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-6 shadow-card">
        <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Specializations * (Select all that apply)</h3>
        <div className="flex flex-wrap gap-2">
          {SPECIALIZATIONS.map((s) => (
            <button key={s} type="button" onClick={() => toggleItem('specialization', s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${form.specialization.includes(s) ? 'bg-primary-600 text-white border-primary-600' : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-gray-200 dark:border-slate-600 hover:border-primary-400'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Treatment Types */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-6 shadow-card">
        <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Treatment Types</h3>
        <div className="flex flex-wrap gap-2">
          {TREATMENT_TYPES.map((t) => (
            <button key={t} type="button" onClick={() => toggleItem('treatmentTypes', t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${form.treatmentTypes.includes(t) ? 'bg-secondary-500 text-white border-secondary-500' : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-gray-200 dark:border-slate-600 hover:border-secondary-400'}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Diseases Treated */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-6 shadow-card">
        <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Diseases / Conditions Treated</h3>
        <div className="flex flex-wrap gap-2">
          {DISEASES.map((d) => (
            <button key={d} type="button" onClick={() => toggleItem('diseases', d)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${form.diseases.includes(d) ? 'bg-accent text-white border-accent' : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-gray-200 dark:border-slate-600 hover:border-purple-400'}`}>
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Qualifications */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-6 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2"><Award className="w-5 h-5 text-primary-600" /> Qualifications</h3>
          <Button size="sm" variant="outline" onClick={() => setForm((f) => ({ ...f, qualifications: [...f.qualifications, { degree: '', institution: '', year: '', country: 'Pakistan' }] }))} leftIcon={<Plus className="w-3.5 h-3.5" />}>
            Add
          </Button>
        </div>
        <div className="space-y-3">
          {form.qualifications.map((q, i) => (
            <div key={i} className="grid grid-cols-2 gap-3 p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
              <input value={q.degree} onChange={(e) => updateQual(i, 'degree', e.target.value)} placeholder="Degree (e.g. MBBS)"
                className="px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white" />
              <input value={q.institution} onChange={(e) => updateQual(i, 'institution', e.target.value)} placeholder="Institution"
                className="px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white" />
              <input type="number" value={q.year} onChange={(e) => updateQual(i, 'year', e.target.value)} placeholder="Year (e.g. 2015)"
                className="px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white" />
              <div className="flex gap-2">
                <input value={q.country} onChange={(e) => updateQual(i, 'country', e.target.value)} placeholder="Country"
                  className="flex-1 px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white" />
                {form.qualifications.length > 1 && (
                  <button onClick={() => setForm((f) => ({ ...f, qualifications: f.qualifications.filter((_, idx) => idx !== i) }))} className="text-red-400 hover:text-red-600 px-2">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Availability */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-6 shadow-card">
        <h3 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2"><Clock className="w-5 h-5 text-primary-600" /> Weekly Availability</h3>
        <div className="space-y-3">
          {DAYS.map((day) => (
            <div key={day} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
              <button type="button" onClick={() => toggleDay(day)}
                className={`w-24 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${form.availability[day]?.isOpen ? 'bg-primary-600 text-white' : 'bg-gray-200 dark:bg-slate-600 text-gray-500 dark:text-slate-400'}`}>
                {day.slice(0, 3)}
              </button>
              {form.availability[day]?.isOpen ? (
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <span>From</span>
                  <input type="time" value={form.availability[day]?.slots?.[0]?.start || '09:00'}
                    onChange={(e) => setForm((f) => ({ ...f, availability: { ...f.availability, [day]: { ...f.availability[day], slots: [{ ...f.availability[day].slots?.[0], start: e.target.value }] } } }))}
                    className="px-2 py-1 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white" />
                  <span>To</span>
                  <input type="time" value={form.availability[day]?.slots?.[0]?.end || '17:00'}
                    onChange={(e) => setForm((f) => ({ ...f, availability: { ...f.availability, [day]: { ...f.availability[day], slots: [{ ...f.availability[day].slots?.[0], end: e.target.value }] } } }))}
                    className="px-2 py-1 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white" />
                </div>
              ) : (
                <span className="text-xs text-slate-400">Closed — click to open</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Save */}
      <Button onClick={handleSave} variant="gradient" fullWidth size="lg" isLoading={saving} leftIcon={<Save className="w-5 h-5" />}>
        {hasProfile ? 'Update Profile' : 'Save & Submit for Approval'}
      </Button>
    </div>
  );
};

export default DoctorProfileSetup;
