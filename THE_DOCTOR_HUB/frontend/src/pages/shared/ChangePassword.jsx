import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import api from '../../services/api';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const schema = z.object({
  currentPassword: z.string().min(1, 'Current password required'),
  newPassword: z.string().min(8, 'Minimum 8 characters'),
  confirmPassword: z.string(),
}).refine(d => d.newPassword === d.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] });

const ChangePassword = () => {
  const toast = useToast();
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data) => {
    try {
      await api.put('/auth/change-password', { currentPassword: data.currentPassword, newPassword: data.newPassword });
      toast.success('Password changed successfully');
      setSuccess(true);
      reset();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-6 shadow-card max-w-md">
      <h3 className="font-semibold text-slate-800 dark:text-white mb-5 flex items-center gap-2">
        <Lock className="w-5 h-5 text-primary-600" /> Change Password
      </h3>
      {success && (
        <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 rounded-lg flex items-center gap-2 text-emerald-700 dark:text-emerald-400 text-sm">
          <CheckCircle className="w-4 h-4" /> Password changed successfully!
        </div>
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Current Password" type={showCurrent ? 'text' : 'password'}
          leftIcon={<Lock className="w-4 h-4" />}
          rightIcon={<button type="button" onClick={() => setShowCurrent(!showCurrent)} className="text-gray-400 hover:text-gray-600">{showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>}
          error={errors.currentPassword?.message} required {...register('currentPassword')} />
        <Input label="New Password" type={showNew ? 'text' : 'password'} placeholder="Min 8 characters"
          leftIcon={<Lock className="w-4 h-4" />}
          rightIcon={<button type="button" onClick={() => setShowNew(!showNew)} className="text-gray-400 hover:text-gray-600">{showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>}
          error={errors.newPassword?.message} required {...register('newPassword')} />
        <Input label="Confirm New Password" type="password" placeholder="Repeat new password"
          leftIcon={<Lock className="w-4 h-4" />}
          error={errors.confirmPassword?.message} required {...register('confirmPassword')} />
        <Button type="submit" variant="primary" isLoading={isSubmitting} leftIcon={<Lock className="w-4 h-4" />}>
          Update Password
        </Button>
      </form>
    </div>
  );
};
export default ChangePassword;
