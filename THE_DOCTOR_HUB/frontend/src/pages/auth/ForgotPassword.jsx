import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, CheckCircle, Stethoscope } from 'lucide-react';
import api from '../../services/api';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
});

const ForgotPassword = () => {
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError('');
    try {
      await api.post('/auth/forgot-password', data);
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-gradient-primary rounded-xl flex items-center justify-center mx-auto mb-3">
            <Stethoscope className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Doctor<span className="text-primary-600">Hub</span></h1>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-premium border border-gray-100 dark:border-slate-700 p-8">
          {submitted ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-emerald-500" />
              </div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Check Your Email</h2>
              <p className="text-slate-500 dark:text-slate-400 mb-6">
                If that email exists, we've sent a password reset link.
              </p>
              <Link to="/login">
                <Button variant="outline" fullWidth leftIcon={<ArrowLeft className="w-4 h-4" />}>
                  Back to Login
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">Reset Password</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
                  Enter your email and we'll send a reset link.
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="you@example.com"
                  leftIcon={<Mail className="w-4 h-4" />}
                  error={errors.email?.message}
                  required
                  {...register('email')}
                />
                <Button type="submit" fullWidth size="lg" isLoading={isLoading} variant="gradient">
                  Send Reset Link
                </Button>
              </form>

              <div className="mt-6 text-center">
                <Link to="/login" className="text-sm text-slate-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors inline-flex items-center gap-1">
                  <ArrowLeft className="w-4 h-4" /> Back to Login
                </Link>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
