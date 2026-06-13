import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Check if Cloudinary is properly configured
const isCloudinaryConfigured = () => {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
  return (
    CLOUDINARY_CLOUD_NAME &&
    CLOUDINARY_CLOUD_NAME !== 'your_cloud_name' &&
    CLOUDINARY_API_KEY &&
    CLOUDINARY_API_KEY !== 'your_api_key' &&
    CLOUDINARY_API_SECRET &&
    CLOUDINARY_API_SECRET !== 'your_api_secret'
  );
};

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Local disk storage fallback (used when Cloudinary is not configured)
const createLocalStorage = (folder) => {
  const uploadDir = path.join(__dirname, '../../uploads', folder);
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  return multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `${unique}${path.extname(file.originalname)}`);
    },
  });
};

// Helper to get file URL for local storage
export const getLocalFileUrl = (req, filePath) => {
  const baseUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`;
  const relativePath = filePath.replace(/\\/g, '/').split('uploads/')[1];
  return `${baseUrl}/uploads/${relativePath}`;
};

// ─── PROFILE STORAGE ───────────────────────────────────────
const profileStorageCloud = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'doctor-hub/profiles',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 400, height: 400, crop: 'fill' }],
  },
});

export const uploadProfile = multer({
  storage: isCloudinaryConfigured() ? profileStorageCloud : createLocalStorage('profiles'),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed'), false);
  },
});

// ─── PAYMENT STORAGE ────────────────────────────────────────
const paymentStorageCloud = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: 'doctor-hub/payments',
    allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
    resource_type: file.mimetype === 'application/pdf' ? 'raw' : 'image',
  }),
});

export const uploadPayment = multer({
  storage: isCloudinaryConfigured() ? paymentStorageCloud : createLocalStorage('payments'),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only images and PDFs are allowed'), false);
  },
});

// ─── MEDICAL DOC STORAGE ────────────────────────────────────
const medicalDocStorageCloud = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: 'doctor-hub/medical-docs',
    allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
    resource_type: 'auto',
  }),
});

export const uploadMedicalDoc = multer({
  storage: isCloudinaryConfigured() ? medicalDocStorageCloud : createLocalStorage('medical-docs'),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only images and PDFs are allowed'), false);
  },
});

export { cloudinary, isCloudinaryConfigured };
export default cloudinary;
