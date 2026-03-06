import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../index.js';
import { requireAuth, requireSchoolAdminOrAbove, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

const tagSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
  type: z.enum(['SCHOOL', 'CUSTOM']).optional().default('CUSTOM'),
});

const updateTagSchema = z.object({
  name: z.string().min(1).max(100).optional(),
});

router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const tags = await prisma.tag.findMany({
      orderBy: [{ type: 'asc' }, { name: 'asc' }],
      include: {
        _count: {
          select: { articles: true },
        },
      },
    });

    res.json(tags);
  } catch (error) {
    console.error('Failed to fetch tags:', error);
    res.status(500).json({ error: 'Failed to fetch tags' });
  }
});

router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;

    const tag = await prisma.tag.findUnique({
      where: { id },
      include: {
        _count: {
          select: { articles: true },
        },
      },
    });

    if (!tag) {
      res.status(404).json({ error: 'Tag not found' });
      return;
    }

    res.json(tag);
  } catch (error) {
    console.error('Failed to fetch tag:', error);
    res.status(500).json({ error: 'Failed to fetch tag' });
  }
});

router.post(
  '/',
  requireAuth,
  requireSchoolAdminOrAbove,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const result = tagSchema.safeParse(req.body);
      if (!result.success) {
        res.status(400).json({ error: 'Invalid input', details: result.error.flatten() });
        return;
      }

      const { name, slug, type } = result.data;

      const existingName = await prisma.tag.findUnique({ where: { name } });
      if (existingName) {
        res.status(400).json({ error: 'Tag with this name already exists' });
        return;
      }

      const existingSlug = await prisma.tag.findUnique({ where: { slug } });
      if (existingSlug) {
        res.status(400).json({ error: 'Tag with this slug already exists' });
        return;
      }

      const tag = await prisma.tag.create({
        data: { name, slug, type },
      });

      res.status(201).json(tag);
    } catch (error) {
      console.error('Failed to create tag:', error);
      res.status(500).json({ error: 'Failed to create tag' });
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
      const result = updateTagSchema.safeParse(req.body);
      if (!result.success) {
        res.status(400).json({ error: 'Invalid input', details: result.error.flatten() });
        return;
      }

      const existing = await prisma.tag.findUnique({ where: { id } });
      if (!existing) {
        res.status(404).json({ error: 'Tag not found' });
        return;
      }

      if (existing.type === 'SCHOOL') {
        res.status(403).json({ error: 'Cannot modify school tags' });
        return;
      }

      const tag = await prisma.tag.update({
        where: { id },
        data: result.data,
      });

      res.json(tag);
    } catch (error) {
      console.error('Failed to update tag:', error);
      res.status(500).json({ error: 'Failed to update tag' });
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

      const tag = await prisma.tag.findUnique({
        where: { id },
      });

      if (!tag) {
        res.status(404).json({ error: 'Tag not found' });
        return;
      }

      if (tag.type === 'SCHOOL') {
        res.status(403).json({ error: 'Cannot delete school tags' });
        return;
      }

      const articlesCount = await prisma.article.count({
        where: { tags: { some: { id } } },
      });

      if (articlesCount > 0) {
        res.status(400).json({ error: 'Cannot delete tag with associated articles. Remove tag from articles first.' });
        return;
      }

      await prisma.tag.delete({ where: { id } });

      res.json({ message: 'Tag deleted successfully' });
    } catch (error) {
      console.error('Failed to delete tag:', error);
      res.status(500).json({ error: 'Failed to delete tag' });
    }
  }
);

export default router;
