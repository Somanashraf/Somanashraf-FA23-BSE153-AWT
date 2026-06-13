import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Star, MapPin, Clock, Stethoscope, Award } from 'lucide-react';
import { formatCurrency, getInitials } from '../../lib/utils';
import Badge from '../ui/Badge';
import Button from '../ui/Button';

const DoctorCard = ({ doctor, index = 0 }) => {
  const user = doctor.user || {};
  const rating = doctor.rating?.average || 0;
  const reviewCount = doctor.rating?.count || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-0.5 overflow-hidden"
    >
      {/* Header gradient */}
      <div className="h-2 bg-gradient-primary" />

      <div className="p-5">
        {/* Avatar + Name */}
        <div className="flex items-start gap-4 mb-4">
          <div className="relative flex-shrink-0">
            {user.profilePicture?.url ? (
              <img src={user.profilePicture.url} alt="" className="w-16 h-16 rounded-xl object-cover" />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-gradient-primary flex items-center justify-center text-white font-bold text-lg">
                {getInitials(user.firstName, user.lastName)}
              </div>
            )}
            {doctor.isAvailable && (
              <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-slate-800 rounded-full" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slate-800 dark:text-white truncate">
              Dr. {user.firstName} {user.lastName}
            </h3>
            <p className="text-sm text-primary-600 dark:text-primary-400 font-medium truncate">
              {doctor.specialization?.[0] || 'General Physician'}
            </p>
            <div className="flex items-center gap-1 mt-1">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-current" />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{rating.toFixed(1)}</span>
              <span className="text-xs text-slate-400">({reviewCount})</span>
            </div>
          </div>
        </div>

        {/* Type badge */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          <Badge variant={doctor.doctorType === 'allopathic' ? 'primary' : doctor.doctorType === 'homeopathic' ? 'secondary' : 'purple'}>
            {doctor.doctorType?.charAt(0).toUpperCase() + doctor.doctorType?.slice(1)}
          </Badge>
          {doctor.specialization?.slice(1, 2).map((s) => (
            <Badge key={s} variant="default">{s}</Badge>
          ))}
        </div>

        {/* Info rows */}
        <div className="space-y-1.5 mb-4 text-sm text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-slate-400" />
            <span>{doctor.experience} yr{doctor.experience !== 1 ? 's' : ''} experience</span>
          </div>
          {user.address?.city && (
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-slate-400" />
              <span className="truncate">{user.address.city}</span>
            </div>
          )}
        </div>

        {/* Fee + CTA */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-slate-700">
          <div>
            <span className="text-xs text-slate-400">Fee</span>
            <p className="font-bold text-slate-800 dark:text-white">{formatCurrency(doctor.consultationFee)}</p>
          </div>
          <Link to={`/patient/doctors/${doctor._id}`}>
            <Button size="sm" variant="gradient">Book Now</Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
};
export default DoctorCard;
