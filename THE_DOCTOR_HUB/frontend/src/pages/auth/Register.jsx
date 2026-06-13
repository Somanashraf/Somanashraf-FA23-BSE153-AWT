import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye, EyeOff, Mail, Lock, User, Phone, Stethoscope,
  CheckCircle, ChevronRight,
} from 'lucide-react';
import { registerUser, clearError, clearRegisterSuccess } from '../../store/slices/authSlice';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const registerSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters').max(50),
  lastName: z.string().min(2, 'Last name must be at least 2 characters').max(50),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  phone: z.string().optional(),
  role: z.enum(['patient', 'doctor', 'assistant']),
  gender: z.enum(['male', 'female', 'other']).optional(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

const roles = [
  { value: 'patient', label: 'Patient', desc: 'Book appointments & track health', icon: '🏥' },
  { value: 'doctor', label: 'Doctor', desc: 'Manage patients & consultations', icon: '👨‍⚕️' },
  { value: 'assistant', label: 'Assistant', desc: 'Manage clinic operations', icon: '📋' },
];

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error, registerSuccess } = useSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedRole, setSelectedRole] = useState('patient');

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'patient' },
  });

  useEffect(() => {
    setValue('role', selectedRole);
  }, [selectedRole, setValue]);

  useEffect(() => {
    if (registerSuccess) {
      dispatch(clearRegisterSuccess());
    }
  }, [registerSuccess, dispatch]);

  const onSubmit = async (data) => {
    dispatch(clearError());
    const { confirmPassword, ...userData } = data;
    const result = await dispatch(registerUser(userData));
    if (registerUser.fulfilled.match(result)) {
      navigate('/login?registered=true');
    }
  };

  if (registerSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-2xl shadow-premium p-10 text-center max-w-md w-full"
        >
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Registration Successful!</h2>
          <p className="text-slate-500 mb-6">Please check your email to verify your account.</p>
          <Button onClick={() => navigate('/login')} variant="gradient" fullWidth size="lg">
            Go to Login
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-gradient-primary rounded-xl flex items-center justify-center mx-auto mb-3">
            <Stethoscope className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Create Account</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Join Doctor Hub today</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-premium border border-gray-100 dark:border-slate-700 p-8">
          {/* Role selection */}
          <div className="mb-6">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">I am a...</p>
            <div className="grid grid-cols-3 gap-3">
              {roles.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setSelectedRole(r.value)}
                  className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                    selectedRole === r.value
                      ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20 dark:border-primary-400'
                      : 'border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500'
                  }`}
                >
                  <div className="text-2xl mb-1">{r.icon}</div>
                  <div className="font-semibold text-sm text-slate-800 dark:text-white">{r.label}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{r.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First Name"
                placeholder="John"
                leftIcon={<User className="w-4 h-4" />}
                error={errors.firstName?.message}
                required
                {...register('firstName')}
              />
              <Input
                label="Last Name"
                placeholder="Doe"
                error={errors.lastName?.message}
                required
                {...register('lastName')}
              />
            </div>

            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              leftIcon={<Mail className="w-4 h-4" />}
              error={errors.email?.message}
              required
              {...register('email')}
            />

            <Input
              label="Phone Number"
              type="tel"
              placeholder="+92 300 0000000"
              leftIcon={<Phone className="w-4 h-4" />}
              error={errors.phone?.message}
              {...register('phone')}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Min 8 characters"
                leftIcon={<Lock className="w-4 h-4" />}
                rightIcon={
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
                error={errors.password?.message}
                required
                {...register('password')}
              />
              <Input
                label="Confirm Password"
                type={showConfirm ? 'text' : 'password'}
                placeholder="Repeat password"
                leftIcon={<Lock className="w-4 h-4" />}
                rightIcon={
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="text-gray-400 hover:text-gray-600">
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
                error={errors.confirmPassword?.message}
                required
                {...register('confirmPassword')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Gender</label>
              <select
                className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                {...register('gender')}
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <Button type="submit" fullWidth size="lg" isLoading={isLoading} variant="gradient" rightIcon={<ChevronRight className="w-4 h-4" />}>
              Create Account
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
