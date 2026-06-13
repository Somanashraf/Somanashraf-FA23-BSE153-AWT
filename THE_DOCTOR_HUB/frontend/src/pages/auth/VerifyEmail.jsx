import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader2, Stethoscope } from 'lucide-react';
import api from '../../services/api';
import Button from '../../components/ui/Button';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('verifying'); // verifying | success | error

  useEffect(() => {
    const verify = async () => {
      if (!token) { setStatus('error'); return; }
      try {
        await api.get(`/auth/verify-email?token=${token}`);
        setStatus('success');
      } catch {
        setStatus('error');
      }
    };
    verify();
  }, [token]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-premium border border-gray-100 p-10 text-center max-w-md w-full">
        <div className="w-14 h-14 bg-gradient-primary rounded-xl flex items-center justify-center mx-auto mb-4">
          <Stethoscope className="w-7 h-7 text-white" />
        </div>
        {status === 'verifying' && (<><Loader2 className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" /><h2 className="text-xl font-bold text-slate-800">Verifying your email...</h2></>)}
        {status === 'success' && (<><div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle className="w-8 h-8 text-emerald-500" /></div><h2 className="text-xl font-bold text-slate-800 mb-2">Email Verified!</h2><p className="text-slate-500 mb-6">Your email has been verified. You can now log in.</p><Link to="/login"><Button variant="gradient" fullWidth size="lg">Go to Login</Button></Link></>)}
        {status === 'error' && (<><div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"><XCircle className="w-8 h-8 text-red-500" /></div><h2 className="text-xl font-bold text-slate-800 mb-2">Verification Failed</h2><p className="text-slate-500 mb-6">The link is invalid or expired.</p><Link to="/login"><Button variant="outline" fullWidth>Back to Login</Button></Link></>)}
      </motion.div>
    </div>
  );
};
export default VerifyEmail;
