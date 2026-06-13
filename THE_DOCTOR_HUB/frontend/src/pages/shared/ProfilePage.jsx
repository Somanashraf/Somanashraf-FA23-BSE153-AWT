import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Camera, Save, Lock, User, Mail, Phone } from 'lucide-react';
import { updateProfile } from '../../store/slices/authSlice';
import { userService } from '../../services/medicalService';
import { useToast } from '../../hooks/useToast';
import PageHeader from '../../components/shared/PageHeader';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import api from '../../services/api';
import { getInitials } from '../../lib/utils';

const profileSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  phone: z.string().optional(),
  gender: z.string().optional(),
  'address.city': z.string().optional(),
  'address.street': z.string().optional(),
  'address.state': z.string().optional(),
});

const pwSchema = z.object({
  currentPassword: z.string().min(6),
  newPassword: z.string().min(8),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] });

const ProfilePage = () => {
  const dispatch = useDispatch();
  const toast = useToast();
  const { user } = useSelector((s) => s.auth);
  const fileRef = useRef();
  const [uploading, setUploading] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phone: user?.phone || '',
      gender: user?.gender || '',
      'address.city': user?.address?.city || '',
      'address.street': user?.address?.street || '',
      'address.state': user?.address?.state || '',
    },
  });

  const pwForm = useForm({ resolver: zodResolver(pwSchema) });

  const onSaveProfile = async (data) => {
    const payload = {
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      gender: data.gender,
      address: { city: data['address.city'], street: data['address.street'], state: data['address.state'] },
    };
    const result = await dispatch(updateProfile(payload));
    if (updateProfile.fulfilled.match(result)) toast.success('Profile updated');
    else toast.error('Update failed');
  };

  const handlePicUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('profilePicture', file);
      await userService.uploadProfilePicture(fd);
      toast.success('Profile picture updated');
      window.location.reload();
    } catch { toast.error('Upload failed'); }
    finally { setUploading(false); }
  };

  const onChangePw = async (data) => {
    setSavingPw(true);
    try {
      await api.put('/auth/change-password', { currentPassword: data.currentPassword, newPassword: data.newPassword });
      toast.success('Password changed');
      pwForm.reset();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSavingPw(false); }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <PageHeader title="My Profile" subtitle="Manage your account information" />

      {/* Avatar */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-6 shadow-card">
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-gradient-primary flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
              {user?.profilePicture?.url ? <img src={user.profilePicture.url} alt="" className="w-full h-full object-cover" /> : getInitials(user?.firstName, user?.lastName)}
            </div>
            <button onClick={() => fileRef.current?.click()} disabled={uploading}
              className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary-600 rounded-full flex items-center justify-center text-white shadow hover:bg-primary-700 transition-colors">
              <Camera className="w-3.5 h-3.5" />
            </button>
            <input ref={fileRef} type="file" accept="image/*" onChange={handlePicUpload} className="hidden" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">{user?.firstName} {user?.lastName}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 capitalize">{user?.role?.replace('_', ' ')}</p>
            <p className="text-xs text-slate-400 mt-0.5">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Profile form */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-6 shadow-card">
        <h3 className="font-semibold text-slate-800 dark:text-white mb-5 flex items-center gap-2"><User className="w-4 h-4 text-primary-600" /> Personal Information</h3>
        <form onSubmit={handleSubmit(onSaveProfile)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="First Name" {...register('firstName')} error={errors.firstName?.message} required leftIcon={<User className="w-4 h-4" />} />
            <Input label="Last Name" {...register('lastName')} error={errors.lastName?.message} required />
          </div>
          <Input label="Phone" {...register('phone')} leftIcon={<Phone className="w-4 h-4" />} />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Gender</label>
            <select {...register('gender')} className="w-full px-3 py-2.5 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white">
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="City" {...register('address.city')} placeholder="e.g. Karachi" />
            <Input label="State" {...register('address.state')} />
          </div>
          <Input label="Street Address" {...register('address.street')} />
          <Button type="submit" variant="gradient" isLoading={isSubmitting} leftIcon={<Save className="w-4 h-4" />}>Save Changes</Button>
        </form>
      </div>

      {/* Change password */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-6 shadow-card">
        <h3 className="font-semibold text-slate-800 dark:text-white mb-5 flex items-center gap-2"><Lock className="w-4 h-4 text-primary-600" /> Change Password</h3>
        <form onSubmit={pwForm.handleSubmit(onChangePw)} className="space-y-4">
          <Input label="Current Password" type="password" {...pwForm.register('currentPassword')} error={pwForm.formState.errors.currentPassword?.message} required />
          <Input label="New Password" type="password" {...pwForm.register('newPassword')} error={pwForm.formState.errors.newPassword?.message} required />
          <Input label="Confirm Password" type="password" {...pwForm.register('confirmPassword')} error={pwForm.formState.errors.confirmPassword?.message} required />
          <Button type="submit" variant="outline" isLoading={savingPw} leftIcon={<Lock className="w-4 h-4" />}>Update Password</Button>
        </form>
      </div>
    </div>
  );
};
export default ProfilePage;
