import { motion } from 'framer-motion';
import { Stethoscope } from 'lucide-react';

const LoadingScreen = ({ message = 'Loading...' }) => (
  <div className="min-h-screen bg-background dark:bg-slate-900 flex flex-col items-center justify-center gap-4">
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
      className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center"
    >
      <Stethoscope className="w-8 h-8 text-white" />
    </motion.div>
    <div className="text-center">
      <p className="font-bold text-xl text-slate-800 dark:text-white">Doctor<span className="text-primary-600">Hub</span></p>
      <p className="text-sm text-slate-400 mt-1">{message}</p>
    </div>
    <div className="flex gap-1.5 mt-2">
      {[0, 1, 2].map((i) => (
        <motion.div key={i} className="w-2 h-2 bg-primary-600 rounded-full"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }} />
      ))}
    </div>
  </div>
);
export default LoadingScreen;
