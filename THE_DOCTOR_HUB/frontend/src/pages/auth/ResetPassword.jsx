import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, CheckCircle, Stethoscope } from 'lucide-react';
import api from '../../services/api';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const schema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data) => {
    if (!token) { setError('Invalid or missing reset token.'); return; }
    setIsLoading(true); setError('');
    try {
      await api.post('/auth/reset-password', { token, password: data.password });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally { setIsLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-gradient-primary rounded-xl flex items-center justify-center mx-auto mb-3">
            <Stethoscope className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Doctor<span className="text-primary-600">Hub</span></h1>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-premium border border-gray-100 dark:border-slate-700 p-8">
          {success ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-emerald-500" />
              </div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Password Reset!</h2>
              <p className="text-slate-500 dark:text-slate-400 mb-6">Your password has been successfully reset.</p>
              <Button onClick={() => navigate('/login')} variant="gradient" fullWidth size="lg">Go to Login</Button>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">Set New Password</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Enter your new password below.</p>
              </div>
              {error && <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">{error}</div>}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input label="New Password" type={showPw ? 'text' : 'password'} placeholder="Min 8 characters" leftIcon={<Lock className="w-4 h-4" />}
                  rightIcon={<button type="button" onClick={() => setShowPw(!showPw)} className="text-gray-400 hover:text-gray-600">{showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>}
                  error={errors.password?.message} required {...register('password')} />
                <Input label="Confirm Password" type={showConfirm ? 'text' : 'password'} placeholder="Repeat password" leftIcon={<Lock className="w-4 h-4" />}
                  rightIcon={<button type="button" onClick={() => setShowConfirm(!showConfirm)} className="text-gray-400 hover:text-gray-600">{showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>}
                  error={errors.confirmPassword?.message} required {...register('confirmPassword')} />
                <Button type="submit" fullWidth size="lg" isLoading={isLoading} variant="gradient">Reset Password</Button>
              </form>
              <div className="mt-4 text-center"><Link to="/login" className="text-sm text-primary-600 hover:underline">Back to Login</Link></div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};
export default ResetPassword;
