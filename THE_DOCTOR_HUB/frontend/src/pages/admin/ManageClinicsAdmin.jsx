import { useState, useEffect } from 'react';
import { Building2, Search, MapPin, Clock, Phone } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../services/api';
import PageHeader from '../../components/shared/PageHeader';
import EmptyState from '../../components/shared/EmptyState';
import Badge from '../../components/ui/Badge';

const ManageClinicsAdmin = () => {
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        // Get all doctors and their clinics
        const res = await api.get('/doctors', { params: { limit: 100 } });
        const doctors = res.data?.data || [];
        const allClinics = [];
        doctors.forEach(doc => {
          (doc.clinics || []).forEach(clinic => {
            allClinics.push({ ...clinic, doctor: doc });
          });
        });
        setClinics(allClinics);
      } catch { } finally { setLoading(false); }
    };
    load();
  }, []);

  const filtered = clinics.filter(c =>
    !search ||
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.address?.city?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Manage Clinics" subtitle={`${clinics.length} total clinics`} />

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or city..."
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white" />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="skeleton h-48 rounded-xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={Building2} title="No clinics found" description="Clinics appear here once doctors add them" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((clinic, i) => (
            <motion.div key={clinic._id || i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-5 shadow-card">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-50 dark:bg-primary-900/20 rounded-xl flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-white">{clinic.name}</p>
                    <p className="text-xs text-slate-400">
                      Dr. {clinic.doctor?.user?.firstName} {clinic.doctor?.user?.lastName}
                    </p>
                  </div>
                </div>
                <Badge variant={clinic.isActive !== false ? 'success' : 'danger'}>
                  {clinic.isActive !== false ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <div className="space-y-1.5 text-sm text-slate-500 dark:text-slate-400">
                {clinic.address && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">{clinic.address.street}, {clinic.address.city}</span>
                  </div>
                )}
                {(clinic.openingTime && clinic.closingTime) && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{clinic.openingTime} - {clinic.closingTime}</span>
                  </div>
                )}
                {clinic.contact?.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{clinic.contact.phone}</span>
                  </div>
                )}
              </div>
              {clinic.workingDays?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {['mon','tue','wed','thu','fri','sat','sun'].map((d, idx) => {
                    const fullDay = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'][idx];
                    const isOpen = clinic.workingDays.includes(fullDay);
                    return (
                      <span key={d} className={`text-xs px-2 py-0.5 rounded-full ${isOpen ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400' : 'bg-gray-100 text-gray-400 dark:bg-slate-700 dark:text-slate-500'}`}>
                        {d}
                      </span>
                    );
                  })}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
export default ManageClinicsAdmin;
