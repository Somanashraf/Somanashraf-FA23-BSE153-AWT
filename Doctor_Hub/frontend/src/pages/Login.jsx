import { zodResolver } from '@hookform/resolvers/zod';
import { Activity, LockKeyhole } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Page } from '../components/common/UI.jsx';
import { useApp } from '../context/AppContext.jsx';

const schema = z.object({ email: z.string().email(), password: z.string().min(8) });

export default function Login() {
  const { setToast } = useApp();
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema), defaultValues: { email: 'patient@doctorhub.local', password: 'Password@123' } });
  const submit = () => setToast({ type: 'success', message: 'Login validated. Connect API token for production mode.' });
  return <Page title="Secure login" eyebrow="JWT authentication">
    <section className="login-card"><div className="login-visual"><Activity size={42} /><h2>Doctor Hub protects appointments, payments, and clinical history with role-based access.</h2></div><form onSubmit={handleSubmit(submit)} className="auth-form"><label><span>Email</span><input {...register('email')} />{errors.email && <small className="field-error">Enter a valid email.</small>}</label><label><span>Password</span><input type="password" {...register('password')} />{errors.password && <small className="field-error">Password must be at least 8 characters.</small>}</label><button className="primary full"><LockKeyhole size={17} /> Sign in</button></form></section>
  </Page>;
}
