import multer from 'multer';

// Use memory storage (no disk writes)
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Validate audio files
  const allowedMimeTypes = [
    'audio/mpeg', 
    'audio/wav', 
    'audio/ogg', 
    'audio/flac', 
    'audio/aac',
    'audio/x-m4a',
    'video/mp4' // sometimes audio comes through as this
  ];

  if (allowedMimeTypes.includes(file.mimetype) || file.mimetype.startsWith('audio/')) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type: ${file.mimetype}`), false);
  }
};

export const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100 MB max size
  },
  fileFilter
});
