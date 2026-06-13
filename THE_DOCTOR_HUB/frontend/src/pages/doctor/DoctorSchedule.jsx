import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Save, ToggleLeft, ToggleRight } from 'lucide-react';
import { scheduleService } from '../../services/scheduleService';
import { doctorService } from '../../services/doctorService';
import { useToast } from '../../hooks/useToast';
import PageHeader from '../../components/shared/PageHeader';
import Button from '../../components/ui/Button';

const DAYS = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
const DAY_LABELS = { monday:'Monday', tuesday:'Tuesday', wednesday:'Wednesday', thursday:'Thursday', friday:'Friday', saturday:'Saturday', sunday:'Sunday' };

const defaultAvailability = DAYS.reduce((acc, day) => {
  acc[day] = { isOpen: !['saturday','sunday'].includes(day), slots: [{ start: '09:00', end: '17:00' }] };
  return acc;
}, {});

const DoctorSchedule = () => {
  const toast = useToast();
  const [availability, setAvailability] = useState(defaultAvailability);
  const [isAvailable, setIsAvailable] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await doctorService.getMyProfile();
        const doctor = res.data?.data?.doctor;
        if (doctor) {
          setIsAvailable(doctor.isAvailable ?? true);
          if (doctor.availability && Object.keys(doctor.availability).length > 0) {
            setAvailability({ ...defaultAvailability, ...doctor.availability });
          }
        }
      } catch { } finally { setLoading(false); }
    };
    load();
  }, []);

  const toggleDay = (day) => {
    setAvailability(prev => ({ ...prev, [day]: { ...prev[day], isOpen: !prev[day].isOpen } }));
  };

  const updateSlot = (day, field, value) => {
    setAvailability(prev => ({
      ...prev,
      [day]: { ...prev[day], slots: [{ ...(prev[day].slots?.[0] || {}), [field]: value }] },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await scheduleService.updateAvailability({ availability, isAvailable });
      toast.success('Schedule updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update schedule');
    } finally { setSaving(false); }
  };

  if (loading) return <div className="space-y-3">{[...Array(7)].map((_, i) => <div key={i} className="skeleton h-16 rounded-xl" />)}</div>;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <PageHeader title="Manage Schedule" subtitle="Set your availability and working hours" />

      {/* Global availability toggle */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-5 shadow-card flex items-center justify-between">
        <div>
          <p className="font-semibold text-slate-800 dark:text-white">Accept Appointments</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">Turn off to stop receiving new appointments</p>
        </div>
        <button onClick={() => setIsAvailable(!isAvailable)} className="flex items-center gap-2">
          {isAvailable
            ? <ToggleRight className="w-10 h-10 text-emerald-500" />
            : <ToggleLeft className="w-10 h-10 text-gray-400" />}
          <span className={`text-sm font-medium ${isAvailable ? 'text-emerald-600' : 'text-gray-500'}`}>
            {isAvailable ? 'Available' : 'Unavailable'}
          </span>
        </button>
      </div>

      {/* Weekly schedule */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-card overflow-hidden">
        <div className="p-5 border-b border-gray-100 dark:border-slate-700">
          <h3 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary-600" /> Weekly Schedule
          </h3>
        </div>
        <div className="divide-y divide-gray-50 dark:divide-slate-700">
          {DAYS.map((day, i) => {
            const dayData = availability[day] || { isOpen: false, slots: [{ start: '09:00', end: '17:00' }] };
            return (
              <motion.div key={day} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                <button onClick={() => toggleDay(day)}
                  className={`w-24 py-2 rounded-lg text-sm font-semibold capitalize transition-all flex-shrink-0 ${dayData.isOpen ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400'}`}>
                  {DAY_LABELS[day].slice(0,3)}
                </button>
                {dayData.isOpen ? (
                  <div className="flex items-center gap-3 flex-1 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 dark:text-slate-400 w-8">From</span>
                      <input type="time" value={dayData.slots?.[0]?.start || '09:00'}
                        onChange={(e) => updateSlot(day, 'start', e.target.value)}
                        className="px-2 py-1.5 border border-gray-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 dark:text-slate-400 w-3">To</span>
                      <input type="time" value={dayData.slots?.[0]?.end || '17:00'}
                        onChange={(e) => updateSlot(day, 'end', e.target.value)}
                        className="px-2 py-1.5 border border-gray-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500" />
                    </div>
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">● Open</span>
                  </div>
                ) : (
                  <div className="flex-1">
                    <span className="text-sm text-slate-400 dark:text-slate-500 italic">Closed — click to open</span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      <Button onClick={handleSave} variant="gradient" fullWidth size="lg" isLoading={saving} leftIcon={<Save className="w-5 h-5" />}>
        Save Schedule
      </Button>
    </div>
  );
};
export default DoctorSchedule;
