import { Router, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { requireAuth, requireSchoolAdminOrAbove, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

const imageUploadDir = process.env.IMAGE_UPLOAD_DIR || '../landing-page/public/images/uploads';

const storage = multer.diskStorage({
  destination: async (_req, _file, cb) => {
    try {
      await fs.mkdir(imageUploadDir, { recursive: true });
      cb(null, imageUploadDir);
    } catch (err) {
      cb(err as Error, imageUploadDir);
    }
  },
  filename: (_req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = path.basename(file.originalname, ext)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 50);
    cb(null, `${timestamp}-${safeName}${ext}`);
  },
});

const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPG, PNG, WebP and GIF images are allowed'));
    }
  },
});

router.post(
  '/image',
  requireAuth,
  requireSchoolAdminOrAbove,
  upload.single('image'),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({ error: 'No image uploaded' });
        return;
      }

      res.json({
        filename: req.file.filename,
        url: `/images/uploads/${req.file.filename}`,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
      });
    } catch (error) {
      console.error('Failed to upload image:', error);
      res.status(500).json({ error: 'Failed to upload image' });
    }
  }
);

router.delete(
  '/image/:filename',
  requireAuth,
  requireSchoolAdminOrAbove,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const filename = req.params.filename as string;

      const safeName = path.basename(filename);
      if (safeName !== filename || filename.includes('..')) {
        res.status(400).json({ error: 'Invalid filename' });
        return;
      }

      const filePath = path.join(imageUploadDir, safeName);

      try {
        await fs.access(filePath);
        await fs.unlink(filePath);
        res.json({ message: 'Image deleted successfully' });
      } catch {
        res.status(404).json({ error: 'Image not found' });
      }
    } catch (error) {
      console.error('Failed to delete image:', error);
      res.status(500).json({ error: 'Failed to delete image' });
    }
  }
);

export default router;
