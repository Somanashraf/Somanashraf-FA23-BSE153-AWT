export const doctors = [
  { id: 1, name: 'Dr. Sana Khan', treatmentType: 'Allopathic', specialization: 'Cardiology', city: 'Lahore', fee: 2500, rating: 4.9, experience: 11, diseases: ['Hypertension', 'Chest Pain', 'Arrhythmia'], next: 'Today 6:30 PM', clinic: 'Pulse Care Clinic' },
  { id: 2, name: 'Dr. Hammad Raza', treatmentType: 'Homeopathic', specialization: 'Respiratory Care', city: 'Karachi', fee: 1600, rating: 4.7, experience: 8, diseases: ['Asthma', 'Allergy', 'Sinus'], next: 'Tomorrow 3:00 PM', clinic: 'LifeSpring Center' },
  { id: 3, name: 'Dr. Mariam Shah', treatmentType: 'Herbal', specialization: 'Digestive Health', city: 'Islamabad', fee: 1800, rating: 4.8, experience: 10, diseases: ['Acidity', 'IBS', 'Liver Support'], next: 'Mon 5:15 PM', clinic: 'GreenWay Wellness' },
  { id: 4, name: 'Dr. Bilal Farooq', treatmentType: 'Allopathic', specialization: 'Dermatology', city: 'Faisalabad', fee: 2200, rating: 4.6, experience: 7, diseases: ['Eczema', 'Acne', 'Psoriasis'], next: 'Wed 12:00 PM', clinic: 'SkinLine Clinic' }
];

export const appointments = [
  { id: 'APT-1024', patient: 'Ayesha Noor', doctor: 'Dr. Sana Khan', clinic: 'Pulse Care Clinic', date: '2026-06-01', time: '06:30 PM', status: 'Confirmed', fee: 2500 },
  { id: 'APT-1025', patient: 'Hamza Ali', doctor: 'Dr. Hammad Raza', clinic: 'LifeSpring Center', date: '2026-06-01', time: '03:00 PM', status: 'Payment Review', fee: 1600 },
  { id: 'APT-1026', patient: 'Mehak Tariq', doctor: 'Dr. Mariam Shah', clinic: 'GreenWay Wellness', date: '2026-06-02', time: '05:15 PM', status: 'Pending', fee: 1800 },
  { id: 'APT-1027', patient: 'Usman Saeed', doctor: 'Dr. Bilal Farooq', clinic: 'SkinLine Clinic', date: '2026-06-03', time: '12:00 PM', status: 'Completed', fee: 2200 }
];

export const history = [
  { type: 'Prescription', title: 'Hypertension follow-up', doctor: 'Dr. Sana Khan', date: '2026-05-20', detail: 'Amlodipine 5mg continued. Salt restriction and BP log advised.' },
  { type: 'Lab Report', title: 'Lipid profile uploaded', doctor: 'Patient upload', date: '2026-05-14', detail: 'LDL elevated. Report attached to permanent record.' },
  { type: 'Follow-up Note', title: 'Chest discomfort review', doctor: 'Dr. Sana Khan', date: '2026-05-01', detail: 'ECG normal. Follow-up after two weeks recommended.' }
];

export const analytics = {
  daily: 38,
  monthly: 824,
  revenue: 1285000,
  prescriptions: 419,
  revenueLabels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  revenueData: [250000, 310000, 420000, 390000, 505000, 610000],
  diseaseLabels: ['Diabetes', 'Hypertension', 'Asthma', 'Acne', 'Migraine'],
  diseaseData: [88, 76, 51, 44, 39]
};
