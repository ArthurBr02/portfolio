import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { auth } from '../middleware/auth';
import { uploadController } from '../controllers/upload.controller';

const storage = multer.diskStorage({
  destination: path.join(process.cwd(), 'uploads'),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp|pdf/;
    cb(null, allowed.test(path.extname(file.originalname).toLowerCase()));
  },
});

const router = Router();

router.post('/admin/upload', auth, upload.single('file'), uploadController);

export default router;
