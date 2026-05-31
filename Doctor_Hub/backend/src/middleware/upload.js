const path = require('path');
const multer = require('multer');
const { v4: uuid } = require('uuid');
const config = require('../config/env');
const { AppException } = require('../exceptions');

const allowed = ['image/png', 'image/jpeg', 'image/webp', 'application/pdf'];

const storage = multer.diskStorage({
  destination: config.uploadDir,
  filename: (req, file, cb) => cb(null, `${uuid()}${path.extname(file.originalname)}`)
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!allowed.includes(file.mimetype)) return cb(new AppException('Only images and PDF files are allowed', 415, 'UNSUPPORTED_FILE'));
    cb(null, true);
  }
});

module.exports = upload;
