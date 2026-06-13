import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { doctorService } from '../../services/doctorService';
import DoctorCard from '../../components/shared/DoctorCard';
import PageHeader from '../../components/shared/PageHeader';
import { CardSkeleton } from '../../components/ui/Skeleton';
import EmptyState from '../../components/shared/EmptyState';
import Button from '../../components/ui/Button';

const SPECIALIZATIONS = ['Cardiologist', 'Dermatologist', 'Neurologist', 'Orthopedic', 'Pediatrician', 'Psychiatrist', 'General Physician', 'Gynecologist', 'Oncologist', 'Ophthalmologist', 'ENT Specialist', 'Dentist'];
const DOCTOR_TYPES = [{ value: '', label: 'All Types' }, { value: 'allopathic', label: 'Allopathic' }, { value: 'homeopathic', label: 'Homeopathic' }, { value: 'herbal', label: 'Herbal' }];
const SORT_OPTIONS = [{ value: 'rating', label: 'Top Rated' }, { value: 'fee', label: 'Lowest Fee' }, { value: 'experience', label: 'Most Experienced' }];

const FindDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ search: '', specialization: '', doctorType: '', city: '', minFee: '', maxFee: '', minExperience: '', minRating: '', sortBy: 'rating' });
  const [page, setPage] = useState(1);

  const fetchDoctors = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 12, ...filters };
      Object.keys(params).forEach((k) => !params[k] && delete params[k]);
      const res = await doctorService.getDoctors(params);
      setDoctors(res.data?.data || []);
      setPagination(res.data?.pagination || { page: 1, pages: 1, total: 0 });
    } catch { } finally { setLoading(false); }
  }, [filters, page]);

  useEffect(() => { fetchDoctors(); }, [fetchDoctors]);

  const updateFilter = (key, val) => { setFilters((f) => ({ ...f, [key]: val })); setPage(1); };
  const clearFilters = () => { setFilters({ search: '', specialization: '', doctorType: '', city: '', minFee: '', maxFee: '', minExperience: '', minRating: '', sortBy: 'rating' }); setPage(1); };
  const hasActiveFilters = Object.entries(filters).some(([k, v]) => v && k !== 'sortBy');

  return (
    <div className="space-y-6">
      <PageHeader title="Find Doctors" subtitle={`${pagination.total} doctors available`} />

      {/* Search bar */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={filters.search} onChange={(e) => updateFilter('search', e.target.value)}
            placeholder="Search by doctor name..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white"
          />
        </div>
        <Button variant={showFilters ? 'primary' : 'outline'} onClick={() => setShowFilters(!showFilters)} leftIcon={<SlidersHorizontal className="w-4 h-4" />}>
          Filters {hasActiveFilters && <span className="bg-white/30 text-white text-xs px-1.5 py-0.5 rounded-full ml-1">{Object.values(filters).filter((v, i) => v && i !== 8).length}</span>}
        </Button>
        <select value={filters.sortBy} onChange={(e) => updateFilter('sortBy', e.target.value)}
          className="px-3 py-2.5 border border-gray-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white">
          {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
          className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-5 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800 dark:text-white">Filters</h3>
            {hasActiveFilters && <button onClick={clearFilters} className="text-sm text-red-500 hover:underline flex items-center gap-1"><X className="w-3.5 h-3.5" /> Clear all</button>}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">Specialization</label>
              <select value={filters.specialization} onChange={(e) => updateFilter('specialization', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white">
                <option value="">All Specializations</option>
                {SPECIALIZATIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">Doctor Type</label>
              <select value={filters.doctorType} onChange={(e) => updateFilter('doctorType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white">
                {DOCTOR_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">City</label>
              <input value={filters.city} onChange={(e) => updateFilter('city', e.target.value)} placeholder="e.g. Karachi"
                className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">Min Rating</label>
              <select value={filters.minRating} onChange={(e) => updateFilter('minRating', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white">
                <option value="">Any Rating</option>
                {[4.5, 4, 3.5, 3].map((r) => <option key={r} value={r}>⭐ {r}+</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">Min Fee (Rs.)</label>
              <input type="number" value={filters.minFee} onChange={(e) => updateFilter('minFee', e.target.value)} placeholder="0"
                className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">Max Fee (Rs.)</label>
              <input type="number" value={filters.maxFee} onChange={(e) => updateFilter('maxFee', e.target.value)} placeholder="Any"
                className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">Min Experience (yrs)</label>
              <input type="number" value={filters.minExperience} onChange={(e) => updateFilter('minExperience', e.target.value)} placeholder="0"
                className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white" />
            </div>
          </div>
        </motion.div>
      )}

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : doctors.length === 0 ? (
        <EmptyState icon={Search} title="No doctors found" description="Try adjusting your filters or search terms" actionLabel="Clear Filters" onAction={clearFilters} />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {doctors.map((doc, i) => <DoctorCard key={doc._id} doctor={doc} index={i} />)}
          </div>
          {pagination.pages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              {[...Array(pagination.pages)].map((_, i) => (
                <button key={i} onClick={() => setPage(i + 1)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${page === i + 1 ? 'bg-primary-600 text-white' : 'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700'}`}>
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};
export default FindDoctors;
