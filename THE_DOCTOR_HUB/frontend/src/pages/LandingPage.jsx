import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import {
  Stethoscope, Calendar, Shield, MessageSquare, FileText,
  BarChart3, ArrowRight, CheckCircle2, Users, HeartPulse,
  Star, ChevronRight, Menu, X, Sparkles, Activity, Zap,
} from 'lucide-react';
import Button from '../components/ui/Button';

const fadeUp = {
  hidden: { opacity: 0, y: 50 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] },
  }),
};

const stats = [
  { value: '500+', label: 'Expert Doctors' },
  { value: '10K+', label: 'Happy Patients' },
  { value: '50K+', label: 'Consultations' },
  { value: '99%', label: 'Satisfaction Rate' },
];

const features = [
  { icon: Calendar, title: 'Easy Appointments', desc: 'Book consultations with top doctors in just a few clicks.', color: 'from-blue-500 to-cyan-500' },
  { icon: FileText, title: 'Digital Prescriptions', desc: 'Access and download prescriptions anytime, anywhere.', color: 'from-violet-500 to-purple-500' },
  { icon: HeartPulse, title: 'Medical History', desc: 'Complete health records tracked securely in one place.', color: 'from-rose-500 to-pink-500' },
  { icon: MessageSquare, title: 'Secure Messaging', desc: 'Direct communication with your healthcare provider.', color: 'from-emerald-500 to-teal-500' },
  { icon: Shield, title: 'Enterprise Security', desc: 'Your health data protected with bank-grade encryption.', color: 'from-amber-500 to-orange-500' },
  { icon: BarChart3, title: 'Health Analytics', desc: 'Track your wellness journey with insightful dashboards.', color: 'from-indigo-500 to-blue-500' },
];

const steps = [
  { num: '01', title: 'Create Account', desc: 'Sign up as a patient, doctor, or clinic assistant in minutes.', icon: Users },
  { num: '02', title: 'Book Appointment', desc: 'Find specialists, choose a time slot, and confirm your visit.', icon: Calendar },
  { num: '03', title: 'Get Consulted', desc: 'Meet your doctor, receive prescriptions and follow-up care.', icon: Stethoscope },
];

const testimonials = [
  { name: 'Sarah Ahmed', role: 'Patient', text: 'Doctor Hub made booking appointments so effortless. The digital prescriptions feature is a game changer!', rating: 5 },
  { name: 'Dr. Ali Raza', role: 'Cardiologist', text: 'Managing my clinic and patients has never been easier. The analytics dashboard is incredibly powerful.', rating: 5 },
  { name: 'Ayesha Malik', role: 'Patient', text: 'I love how I can access my complete medical history anytime. Truly a premium healthcare experience.', rating: 5 },
];

const trustBadges = ['HIPAA Compliant', '256-bit Encryption', '24/7 Support', 'ISO Certified', 'GDPR Ready'];

const FloatingParticles = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {[...Array(20)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-1 h-1 rounded-full bg-primary-400/40"
        style={{ left: `${(i * 17 + 5) % 100}%`, top: `${(i * 23 + 10) % 100}%` }}
        animate={{
          y: [0, -30, 0],
          opacity: [0.2, 0.8, 0.2],
          scale: [1, 1.5, 1],
        }}
        transition={{ duration: 3 + (i % 4), repeat: Infinity, delay: i * 0.2, ease: 'easeInOut' }}
      />
    ))}
  </div>
);

const HeroVisual = () => {
  const orbitIcons = [HeartPulse, Activity, Shield, Calendar, FileText, MessageSquare];

  return (
    <div className="relative w-full max-w-lg mx-auto aspect-square">
      {/* Glow core */}
      <motion.div
        animate={{ scale: [1, 1.08, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute inset-[15%] bg-gradient-primary rounded-full blur-3xl"
      />

      {/* Rotating rings */}
      {[0, 1, 2].map((ring) => (
        <motion.div
          key={ring}
          className="absolute inset-0 flex items-center justify-center"
          animate={{ rotate: ring % 2 === 0 ? 360 : -360 }}
          transition={{ duration: 20 + ring * 8, repeat: Infinity, ease: 'linear' }}
        >
          <div
            className="rounded-full border border-dashed border-primary-300/30 dark:border-primary-600/20"
            style={{ width: `${65 + ring * 15}%`, height: `${65 + ring * 15}%` }}
          />
        </motion.div>
      ))}

      {/* Center icon */}
      <motion.div
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-primary rounded-3xl blur-xl opacity-50 scale-110" />
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 bg-gradient-primary rounded-3xl flex items-center justify-center shadow-2xl shadow-primary-500/40">
            <Stethoscope className="w-14 h-14 sm:w-16 sm:h-16 text-white" />
          </div>
        </div>
      </motion.div>

      {/* Orbiting icons */}
      {orbitIcons.map((Icon, i) => {
        const angle = (i / orbitIcons.length) * 360;
        const radius = 42;
        return (
          <motion.div
            key={i}
            className="absolute top-1/2 left-1/2"
            style={{ marginTop: -24, marginLeft: -24 }}
            animate={{ rotate: 360 }}
            transition={{ duration: 25, repeat: Infinity, ease: 'linear', delay: i * 0.5 }}
          >
            <motion.div
              style={{
                transform: `rotate(${angle}deg) translateX(${radius}%) rotate(-${angle}deg)`,
              }}
              className="w-12 h-12 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-lg border border-white/50 dark:border-slate-700/50"
              whileHover={{ scale: 1.15 }}
            >
              <Icon className="w-5 h-5 text-primary-600" />
            </motion.div>
          </motion.div>
        );
      })}

      {/* Pulse rings */}
      {[0, 1].map((i) => (
        <motion.div
          key={`pulse-${i}`}
          className="absolute inset-[20%] rounded-full border-2 border-primary-400/20"
          animate={{ scale: [1, 1.4], opacity: [0.5, 0] }}
          transition={{ duration: 3, repeat: Infinity, delay: i * 1.5, ease: 'easeOut' }}
        />
      ))}
    </div>
  );
};

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links = [
    { href: '#features', label: 'Features' },
    { href: '#how-it-works', label: 'How it Works' },
    { href: '#testimonials', label: 'Reviews' },
  ];

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl shadow-xl shadow-primary-500/5 border-b border-white/20 dark:border-slate-800/50'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <Link to="/" className="flex items-center gap-2.5 group">
            <motion.div
              whileHover={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 0.5 }}
              className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/30"
            >
              <Stethoscope className="w-5 h-5 text-white" />
            </motion.div>
            <span className="text-xl font-bold text-slate-800 dark:text-white">
              Doctor<span className="gradient-text">Hub</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {links.map((l, i) => (
              <motion.a
                key={l.href}
                href={l.href}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="relative text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors group"
              >
                {l.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-primary group-hover:w-full transition-all duration-300" />
              </motion.a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link to="/login"><Button variant="ghost" size="sm">Sign In</Button></Link>
            <Link to="/register">
              <Button variant="gradient" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>Get Started</Button>
            </Link>
          </div>

          <button type="button" className="md:hidden p-2 text-slate-600" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-100 dark:border-slate-800 px-4 py-4 space-y-3 overflow-hidden"
          >
            {links.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setMobileOpen(false)} className="block py-2 text-slate-600 dark:text-slate-300 font-medium">
                {l.label}
              </a>
            ))}
            <div className="flex flex-col gap-2 pt-2">
              <Link to="/login" onClick={() => setMobileOpen(false)}><Button variant="outline" fullWidth>Sign In</Button></Link>
              <Link to="/register" onClick={() => setMobileOpen(false)}><Button variant="gradient" fullWidth>Get Started</Button></Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

const Hero = () => {
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 400], [1, 0]);
  const scale = useTransform(scrollY, [0, 400], [1, 0.95]);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Premium mesh background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950" />
      <div className="absolute inset-0 landing-grid opacity-40" />

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ x: [0, 50, 0], y: [0, -30, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-primary-400/25 rounded-full blur-[100px]"
        />
        <motion.div
          animate={{ x: [0, -40, 0], y: [0, 40, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-secondary-400/25 rounded-full blur-[100px]"
        />
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
          className="absolute top-1/3 right-1/4 w-72 h-72 bg-accent/10 rounded-full blur-[80px]"
        />
      </div>

      <FloatingParticles />

      <motion.div style={{ opacity, scale }} className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16 lg:pt-32">
        <div className="flex flex-col items-center text-center">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/60 dark:bg-slate-800/60 backdrop-blur-md border border-primary-200/40 dark:border-primary-700/30 shadow-lg mb-8"
          >
            <motion.div animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 2, repeat: Infinity }}>
              <Sparkles className="w-4 h-4 text-primary-600" />
            </motion.div>
            <span className="text-sm font-semibold text-primary-700 dark:text-primary-300 tracking-wide">
              Pakistan&apos;s #1 Healthcare Platform
            </span>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={1}
            className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold text-slate-900 dark:text-white leading-[1.05] tracking-tight max-w-5xl"
          >
            <motion.span
              className="inline-block"
              animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
              style={{
                backgroundImage: 'linear-gradient(90deg, #0f172a, #2563EB, #14B8A6, #0f172a)',
                backgroundSize: '300% 100%',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Healthcare
            </motion.span>
            <span className="block mt-2">
              <span className="gradient-text">Reimagined</span>
              <span className="text-slate-900 dark:text-white"> for Everyone</span>
            </span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={2}
            className="mt-8 text-lg sm:text-xl lg:text-2xl text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed"
          >
            Connect with expert doctors, manage appointments, and track your health — all in one{' '}
            <span className="text-primary-600 dark:text-primary-400 font-medium">premium</span> platform.
          </motion.p>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={3}
            className="mt-10 flex flex-col sm:flex-row gap-4"
          >
            <Link to="/register">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Button variant="gradient" size="xl" rightIcon={<ArrowRight className="w-5 h-5" />} className="shadow-xl shadow-primary-500/25 px-10">
                  Start Free Today
                </Button>
              </motion.div>
            </Link>
            <Link to="/login">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Button variant="outline" size="xl" leftIcon={<Users className="w-5 h-5" />} className="backdrop-blur-sm bg-white/50 dark:bg-slate-800/50">
                  Sign In
                </Button>
              </motion.div>
            </Link>
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={4}
            className="mt-8 flex flex-wrap justify-center gap-4 sm:gap-8"
          >
            {['No credit card required', 'Free for patients', '24/7 support'].map((item, i) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + i * 0.15 }}
                className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400"
              >
                <CheckCircle2 className="w-4 h-4 text-secondary-500" />
                {item}
              </motion.div>
            ))}
          </motion.div>

          {/* Abstract animated visual */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={5}
            className="mt-16 w-full max-w-md lg:max-w-lg"
          >
            <HeroVisual />
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-6 h-10 rounded-full border-2 border-slate-300 dark:border-slate-600 flex justify-center pt-2"
        >
          <motion.div className="w-1 h-2 bg-primary-500 rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  );
};

const Marquee = () => (
  <div className="py-6 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-y border-slate-100 dark:border-slate-800 overflow-hidden">
    <motion.div
      animate={{ x: [0, -1000] }}
      transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
      className="flex gap-12 whitespace-nowrap"
    >
      {[...trustBadges, ...trustBadges, ...trustBadges].map((badge, i) => (
        <div key={i} className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
          <Zap className="w-4 h-4 text-primary-500" />
          {badge}
        </div>
      ))}
    </motion.div>
  </div>
);

const StatsBar = () => (
  <section className="relative z-10 px-4 sm:px-6 lg:px-8 -mt-4">
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.7 }}
      className="max-w-5xl mx-auto bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-premium border border-white/50 dark:border-slate-700/50 p-8 sm:p-10"
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, scale: 0.5 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, type: 'spring', stiffness: 200 }}
            whileHover={{ scale: 1.05 }}
            className="text-center group cursor-default"
          >
            <motion.p
              className="text-3xl sm:text-4xl lg:text-5xl font-bold gradient-text"
              whileInView={{ scale: [0.5, 1.1, 1] }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 + 0.2, duration: 0.5 }}
            >
              {s.value}
            </motion.p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 group-hover:text-primary-600 transition-colors">{s.label}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  </section>
);

const Features = () => (
  <section id="features" className="py-28 lg:py-36 px-4 sm:px-6 lg:px-8 relative">
    <div className="absolute inset-0 landing-radial opacity-50 pointer-events-none" />
    <div className="max-w-7xl mx-auto relative">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center max-w-2xl mx-auto mb-20"
      >
        <motion.span
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="inline-block text-sm font-bold text-primary-600 uppercase tracking-[0.2em] px-4 py-1.5 rounded-full bg-primary-50 dark:bg-primary-900/30"
        >
          Features
        </motion.span>
        <h2 className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white">
          Everything for
          <span className="gradient-text"> Better Health</span>
        </h2>
        <p className="mt-5 text-lg text-slate-600 dark:text-slate-400">
          A complete healthcare ecosystem designed for patients, doctors, and clinics.
        </p>
      </motion.div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 50, rotateX: 10 }}
            whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
            viewport={{ once: true, margin: '-30px' }}
            transition={{ delay: i * 0.08, duration: 0.6 }}
            whileHover={{ y: -10, transition: { duration: 0.3 } }}
            className="group relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl blur-xl from-primary-500/20 to-secondary-500/20" />
            <div className="relative premium-card p-8 h-full overflow-hidden">
              <div className={`w-14 h-14 bg-gradient-to-br ${f.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                <f.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-3">{f.title}</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{f.desc}</p>
              <motion.div
                className="absolute bottom-0 left-0 h-1 bg-gradient-primary"
                initial={{ width: 0 }}
                whileInView={{ width: '100%' }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 + 0.3, duration: 0.8 }}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

const HowItWorks = () => (
  <section id="how-it-works" className="py-28 lg:py-36 bg-slate-50/80 dark:bg-slate-900/50 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-primary-500/5 to-transparent rounded-full blur-3xl" />
    <div className="max-w-7xl mx-auto relative">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center max-w-2xl mx-auto mb-20"
      >
        <span className="text-sm font-bold text-primary-600 uppercase tracking-[0.2em]">How it Works</span>
        <h2 className="mt-5 text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white">
          <span className="gradient-text">3 Simple Steps</span> to Better Care
        </h2>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
        {steps.map((s, i) => (
          <motion.div
            key={s.num}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.2, duration: 0.6 }}
            whileHover={{ y: -8 }}
            className="relative group"
          >
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 lg:p-10 shadow-card hover:shadow-premium transition-all duration-500 border border-slate-100 dark:border-slate-700 h-full">
              <div className="flex items-center gap-4 mb-6">
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className="w-14 h-14 bg-gradient-primary rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-primary-500/30"
                >
                  {s.num}
                </motion.div>
                <div className="w-12 h-12 bg-primary-50 dark:bg-primary-900/30 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <s.icon className="w-6 h-6 text-primary-600" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-3">{s.title}</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{s.desc}</p>
            </div>
            {i < steps.length - 1 && (
              <motion.div
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 + i * 0.2, duration: 0.8 }}
                className="hidden md:block absolute top-1/2 -right-6 lg:-right-8 w-12 lg:w-16 h-0.5 bg-gradient-to-r from-primary-500 to-secondary-500 origin-left"
              />
            )}
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

const Testimonials = () => (
  <section id="testimonials" className="py-28 lg:py-36 px-4 sm:px-6 lg:px-8">
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center max-w-2xl mx-auto mb-20"
      >
        <span className="text-sm font-bold text-primary-600 uppercase tracking-[0.2em]">Testimonials</span>
        <h2 className="mt-5 text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white">
          Loved by <span className="gradient-text">Thousands</span>
        </h2>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
        {testimonials.map((t, i) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, y: 50, rotateY: -10 }}
            whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.15, duration: 0.6 }}
            whileHover={{ y: -8, scale: 1.02 }}
            className="premium-card p-8 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-primary opacity-5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
            <div className="flex gap-1 mb-5">
              {[...Array(t.rating)].map((_, j) => (
                <motion.div key={j} initial={{ opacity: 0, scale: 0 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 + j * 0.05 }}>
                  <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                </motion.div>
              ))}
            </div>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-8 text-lg">&ldquo;{t.text}&rdquo;</p>
            <div className="flex items-center gap-4">
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center text-white font-bold shadow-lg"
              >
                {t.name.charAt(0)}
              </motion.div>
              <div>
                <p className="font-bold text-slate-800 dark:text-white">{t.name}</p>
                <p className="text-sm text-slate-500">{t.role}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

const CTA = () => (
  <section className="py-28 px-4 sm:px-6 lg:px-8">
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="max-w-5xl mx-auto relative overflow-hidden rounded-[2rem] bg-gradient-primary p-12 sm:p-20 text-center"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        className="absolute -top-20 -right-20 w-60 h-60 border border-white/10 rounded-full"
      />
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
        className="absolute -bottom-20 -left-20 w-80 h-80 border border-white/10 rounded-full"
      />

      <div className="absolute inset-0">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white/10"
            style={{
              width: 10 + (i % 5) * 8,
              height: 10 + (i % 5) * 8,
              top: `${(i * 19) % 100}%`,
              left: `${(i * 27) % 100}%`,
            }}
            animate={{ y: [0, -15, 0], opacity: [0.1, 0.4, 0.1] }}
            transition={{ duration: 3 + (i % 3), repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </div>

      <div className="relative z-10">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6"
        >
          Ready to Transform Your Healthcare?
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-xl text-white/80 max-w-xl mx-auto mb-10"
        >
          Join thousands already using Doctor Hub. Create your free account today.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link to="/register">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button size="xl" className="bg-white text-primary-700 hover:bg-white/90 shadow-2xl px-10" rightIcon={<ChevronRight className="w-5 h-5" />}>
                Create Free Account
              </Button>
            </motion.div>
          </Link>
          <Link to="/login">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button size="xl" variant="outline" className="border-white/50 text-white hover:bg-white/15 bg-white/5 backdrop-blur-sm px-10">
                Sign In
              </Button>
            </motion.div>
          </Link>
        </motion.div>
      </div>
    </motion.div>
  </section>
);

const Footer = () => (
  <footer className="border-t border-slate-200/50 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm py-14 px-4 sm:px-6 lg:px-8">
    <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
      <motion.div whileHover={{ scale: 1.02 }} className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-lg">
          <Stethoscope className="w-5 h-5 text-white" />
        </div>
        <span className="text-xl font-bold text-slate-800 dark:text-white">
          Doctor<span className="gradient-text">Hub</span>
        </span>
      </motion.div>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        © {new Date().getFullYear()} Doctor Hub. All rights reserved.
      </p>
      <div className="flex items-center gap-8 text-sm font-medium">
        <Link to="/login" className="text-slate-500 hover:text-primary-600 transition-colors">Sign In</Link>
        <Link to="/register" className="text-slate-500 hover:text-primary-600 transition-colors">Register</Link>
      </div>
    </div>
  </footer>
);

const LandingPage = () => (
  <div className="min-h-screen overflow-x-hidden">
    <Navbar />
    <Hero />
    <Marquee />
    <StatsBar />
    <Features />
    <HowItWorks />
    <Testimonials />
    <CTA />
    <Footer />
  </div>
);

export default LandingPage;
