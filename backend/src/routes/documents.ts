import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { z } from 'zod';
import { prisma } from '../index.js';
import { requireAuth, requireSchoolAdminOrAbove, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

const uploadDir = process.env.UPLOAD_DIR || '../landing-page/public/pdfs';

const storage = multer.diskStorage({
  destination: async (_req, _file, cb) => {
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (err) {
      cb(err as Error, uploadDir);
    }
  },
  filename: (_req, file, cb) => {
    const timestamp = Date.now();
    const safeName = file.originalname
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9.]/g, '-')
      .replace(/-+/g, '-');
    cb(null, `${timestamp}-${safeName}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
});

const documentSchema = z.object({
  name: z.string().min(1).max(255),
  tags: z.array(z.string()).optional().default([]),
  dateAdded: z.string().datetime().optional(),
});

const updateDocumentSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  tags: z.array(z.string()).optional(),
});

router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const documents = await prisma.document.findMany({
      orderBy: { dateAdded: 'desc' },
    });
    res.json(documents);
  } catch {
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const document = await prisma.document.findUnique({
      where: { id },
    });
    
    if (!document) {
      res.status(404).json({ error: 'Document not found' });
      return;
    }
    
    res.json(document);
  } catch {
    res.status(500).json({ error: 'Failed to fetch document' });
  }
});

router.post(
  '/upload',
  requireAuth,
  requireSchoolAdminOrAbove,
  upload.single('file'),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({ error: 'No file uploaded' });
        return;
      }

      res.json({
        filename: req.file.filename,
        filePath: `/pdfs/${req.file.filename}`,
        originalName: req.file.originalname,
      });
    } catch {
      res.status(500).json({ error: 'Failed to upload file' });
    }
  }
);

router.post(
  '/',
  requireAuth,
  requireSchoolAdminOrAbove,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const result = documentSchema.safeParse(req.body);
      if (!result.success) {
        res.status(400).json({ error: 'Invalid input', details: result.error.flatten() });
        return;
      }

      const { name, tags, dateAdded } = result.data;
      const { filename, filePath } = req.body;

      if (!filename || !filePath) {
        res.status(400).json({ error: 'filename and filePath are required' });
        return;
      }

      const document = await prisma.document.create({
        data: {
          name,
          filename,
          filePath,
          tags,
          dateAdded: dateAdded ? new Date(dateAdded) : new Date(),
          createdBy: req.user?.id,
        },
      });

      res.status(201).json(document);
    } catch {
      res.status(500).json({ error: 'Failed to create document' });
    }
  }
);

router.put(
  '/:id',
  requireAuth,
  requireSchoolAdminOrAbove,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const id = req.params.id as string;
      const result = updateDocumentSchema.safeParse(req.body);
      if (!result.success) {
        res.status(400).json({ error: 'Invalid input', details: result.error.flatten() });
        return;
      }

      const existing = await prisma.document.findUnique({
        where: { id },
      });

      if (!existing) {
        res.status(404).json({ error: 'Document not found' });
        return;
      }

      const document = await prisma.document.update({
        where: { id },
        data: result.data,
      });

      res.json(document);
    } catch {
      res.status(500).json({ error: 'Failed to update document' });
    }
  }
);

router.delete(
  '/:id',
  requireAuth,
  requireSchoolAdminOrAbove,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const id = req.params.id as string;
      const document = await prisma.document.findUnique({
        where: { id },
      });

      if (!document) {
        res.status(404).json({ error: 'Document not found' });
        return;
      }

      const filePath = path.join(uploadDir, document.filename);
      try {
        await fs.unlink(filePath);
      } catch {
        console.warn(`Could not delete file: ${filePath}`);
      }

      await prisma.document.delete({
        where: { id },
      });

      res.json({ message: 'Document deleted successfully' });
    } catch {
      res.status(500).json({ error: 'Failed to delete document' });
    }
  }
);

export default router;
