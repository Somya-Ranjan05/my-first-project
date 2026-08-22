import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Multer storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOADS_DIR);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    cb(null, `item-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedMime = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic'];
  if (allowedMime.includes(file.mimetype) || file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG, PNG, WebP, GIF) are allowed'), false);
  }
};

export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: fileFilter
});

/**
 * Storage Service Interface
 * Currently operates on local disk, but structured so an S3Client or GCS
 * can be plugged in by swapping the methods below.
 */
export const StorageService = {
  getPublicUrl(filename) {
    if (!filename) return null;
    if (filename.startsWith('http://') || filename.startsWith('https://')) {
      return filename;
    }
    return `/uploads/${filename}`;
  },

  getLocalPath(filenameOrUrl) {
    if (!filenameOrUrl) return null;
    const baseName = path.basename(filenameOrUrl);
    return path.join(UPLOADS_DIR, baseName);
  },

  async saveBuffer(buffer, originalName = 'image.jpg') {
    const ext = path.extname(originalName) || '.jpg';
    const filename = `item-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    const fullPath = path.join(UPLOADS_DIR, filename);
    await fs.promises.writeFile(fullPath, buffer);
    return `/uploads/${filename}`;
  }
};
