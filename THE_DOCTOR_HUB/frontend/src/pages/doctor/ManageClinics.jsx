import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Building2, Plus, Edit, Trash2, MapPin, Clock, Phone } from 'lucide-react';
import { clinicService } from '../../services/doctorService';
import { useToast } from '../../hooks/useToast';
import PageHeader from '../../components/shared/PageHeader';
import EmptyState from '../../components/shared/EmptyState';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const emptyClinic = { name: '', address: { street: '', city: '', state: '', country: 'Pakistan' }, contact: { phone: '', email: '' }, workingDays: [], openingTime: '09:00', closingTime: '17:00', description: '' };

const ManageClinics = () => {
  const toast = useToast();
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, mode: 'add', clinic: null });
  const [form, setForm] = useState(emptyClinic);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const res = await clinicService.getMyClinics();
      setClinics(res.data?.data?.clinics || []);
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setForm(emptyClinic); setModal({ open: true, mode: 'add', clinic: null }); };
  const openEdit = (clinic) => { setForm({ ...clinic }); setModal({ open: true, mode: 'edit', clinic }); };

  const toggleDay = (day) => {
    setForm((f) => ({
      ...f,
      workingDays: f.workingDays.includes(day) ? f.workingDays.filter((d) => d !== day) : [...f.workingDays, day],
    }));
  };

  const handleSave = async () => {
    if (!form.name || !form.address.city) { toast.error('Name and city are required'); return; }
    setSaving(true);
    try {
      if (modal.mode === 'add') {
        await clinicService.createClinic(form);
        toast.success('Clinic added');
      } else {
        await clinicService.updateClinic(modal.clinic._id, form);
        toast.success('Clinic updated');
      }
      setModal({ open: false, mode: 'add', clinic: null });
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Deactivate this clinic?')) return;
    try {
      await clinicService.deleteClinic(id);
      toast.success('Clinic deactivated');
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Manage Clinics" subtitle={`${clinics.length} clinic(s)`}
        actions={<Button variant="gradient" leftIcon={<Plus className="w-4 h-4" />} onClick={openAdd}>Add Clinic</Button>} />

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{[...Array(2)].map((_, i) => <div key={i} className="skeleton h-44 rounded-xl" />)}</div>
      ) : clinics.length === 0 ? (
        <EmptyState icon={Building2} title="No clinics added" description="Add your clinic locations" actionLabel="Add Clinic" onAction={openAdd} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {clinics.map((clinic, i) => (
            <motion.div key={clinic._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-5 shadow-card">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-50 dark:bg-primary-900/20 rounded-xl flex items-center justify-center"><Building2 className="w-5 h-5 text-primary-600" /></div>
                  <div><p className="font-semibold text-slate-800 dark:text-white">{clinic.name}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${clinic.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>{clinic.isActive ? 'Active' : 'Inactive'}</span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(clinic)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"><Edit className="w-4 h-4 text-slate-400" /></button>
                  <button onClick={() => handleDelete(clinic._id)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"><Trash2 className="w-4 h-4 text-red-400" /></button>
                </div>
              </div>
              <div className="space-y-1.5 text-sm text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-2"><MapPin className="w-4 h-4 flex-shrink-0" /><span className="truncate">{clinic.address?.street}, {clinic.address?.city}</span></div>
                <div className="flex items-center gap-2"><Clock className="w-4 h-4 flex-shrink-0" /><span>{clinic.openingTime} - {clinic.closingTime}</span></div>
                {clinic.contact?.phone && <div className="flex items-center gap-2"><Phone className="w-4 h-4 flex-shrink-0" /><span>{clinic.contact.phone}</span></div>}
              </div>
              {clinic.workingDays?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {DAYS.map((d) => (
                    <span key={d} className={`text-xs px-2 py-0.5 rounded-full capitalize ${clinic.workingDays.includes(d) ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400' : 'bg-gray-100 text-gray-400 dark:bg-slate-700 dark:text-slate-500'}`}>{d.slice(0, 3)}</span>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      <Modal isOpen={modal.open} onClose={() => setModal({ open: false, mode: 'add', clinic: null })} title={modal.mode === 'add' ? 'Add Clinic' : 'Edit Clinic'} size="lg">
        <div className="space-y-4">
          <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Clinic Name *"
            className="w-full px-3 py-2.5 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white" />
          <div className="grid grid-cols-2 gap-3">
            <input value={form.address?.street} onChange={(e) => setForm((f) => ({ ...f, address: { ...f.address, street: e.target.value } }))} placeholder="Street Address"
              className="px-3 py-2.5 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white" />
            <input value={form.address?.city} onChange={(e) => setForm((f) => ({ ...f, address: { ...f.address, city: e.target.value } }))} placeholder="City *"
              className="px-3 py-2.5 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input value={form.contact?.phone} onChange={(e) => setForm((f) => ({ ...f, contact: { ...f.contact, phone: e.target.value } }))} placeholder="Phone"
              className="px-3 py-2.5 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white" />
            <input value={form.contact?.email} onChange={(e) => setForm((f) => ({ ...f, contact: { ...f.contact, email: e.target.value } }))} placeholder="Email"
              className="px-3 py-2.5 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs font-medium text-slate-500 block mb-1">Opening Time</label>
              <input type="time" value={form.openingTime} onChange={(e) => setForm((f) => ({ ...f, openingTime: e.target.value }))}
                className="w-full px-3 py-2.5 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white" />
            </div>
            <div><label className="text-xs font-medium text-slate-500 block mb-1">Closing Time</label>
              <input type="time" value={form.closingTime} onChange={(e) => setForm((f) => ({ ...f, closingTime: e.target.value }))}
                className="w-full px-3 py-2.5 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 block mb-2">Working Days</label>
            <div className="flex flex-wrap gap-2">
              {DAYS.map((d) => (
                <button key={d} type="button" onClick={() => toggleDay(d)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${form.workingDays?.includes(d) ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-gray-200'}`}>
                  {d.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" fullWidth onClick={() => setModal({ open: false, mode: 'add', clinic: null })}>Cancel</Button>
            <Button variant="gradient" fullWidth isLoading={saving} onClick={handleSave}>{modal.mode === 'add' ? 'Add Clinic' : 'Save Changes'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
export default ManageClinics;
