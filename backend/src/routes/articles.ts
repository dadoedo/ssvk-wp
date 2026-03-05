import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../index.js';
import { requireAuth, requireSchoolAdminOrAbove, AuthenticatedRequest } from '../middleware/auth.js';
import { getCached, setCache, invalidateArticles, cacheKeys, TTL_MS } from '../services/cache.js';

const router = Router();

const articleSchema = z.object({
  title: z.string().min(1).max(255),
  slug: z.string().min(1).max(255).regex(/^[a-z0-9-]+$/),
  excerpt: z.string().optional().nullable(),
  content: z.string(),
  coverImage: z.string().optional().nullable(),
  published: z.boolean().optional().default(false),
  publishedAt: z.string().datetime().optional().nullable(),
  tagIds: z.array(z.string()).optional().default([]),
});

const updateArticleSchema = articleSchema.partial();

router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { tag, limit, published } = req.query;

    // Only cache public list (published articles only)
    if (published !== 'all') {
      const cacheKey = cacheKeys.articlesList(tag as string | undefined, limit as string | undefined);
      const cached = getCached<unknown[]>(cacheKey);
      if (cached) {
        res.json(cached);
        return;
      }
    }

    const where: Record<string, unknown> = {};

    if (published !== 'all') {
      where.published = true;
    }

    if (tag) {
      where.tags = {
        some: {
          slug: tag as string,
        },
      };
    }

    const articles = await prisma.article.findMany({
      where,
      include: {
        tags: true,
        author: {
          select: { id: true, name: true },
        },
      },
      orderBy: { publishedAt: 'desc' },
      take: limit ? parseInt(limit as string, 10) : undefined,
    });

    if (published !== 'all') {
      const cacheKey = cacheKeys.articlesList(tag as string | undefined, limit as string | undefined);
      setCache(cacheKey, articles, TTL_MS.articles);
    }

    res.json(articles);
  } catch (error) {
    console.error('Failed to fetch articles:', error);
    res.status(500).json({ error: 'Failed to fetch articles' });
  }
});

router.get('/admin', requireAuth, requireSchoolAdminOrAbove, async (_req: Request, res: Response): Promise<void> => {
  try {
    const articles = await prisma.article.findMany({
      include: {
        tags: true,
        author: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(articles);
  } catch (error) {
    console.error('Failed to fetch articles:', error);
    res.status(500).json({ error: 'Failed to fetch articles' });
  }
});

router.get('/:slug', async (req: Request, res: Response): Promise<void> => {
  try {
    const slug = req.params.slug as string;
    const cacheKey = cacheKeys.articleBySlug(slug);

    const cached = getCached<unknown>(cacheKey);
    if (cached) {
      res.json(cached);
      return;
    }

    const article = await prisma.article.findUnique({
      where: { slug },
      include: {
        tags: true,
        author: {
          select: { id: true, name: true },
        },
      },
    });

    if (!article) {
      res.status(404).json({ error: 'Article not found' });
      return;
    }

    setCache(cacheKey, article, TTL_MS.articles);
    res.json(article);
  } catch (error) {
    console.error('Failed to fetch article:', error);
    res.status(500).json({ error: 'Failed to fetch article' });
  }
});

router.post(
  '/',
  requireAuth,
  requireSchoolAdminOrAbove,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const result = articleSchema.safeParse(req.body);
      if (!result.success) {
        res.status(400).json({ error: 'Invalid input', details: result.error.flatten() });
        return;
      }

      const { title, slug, excerpt, content, coverImage, published, publishedAt, tagIds } = result.data;

      const existing = await prisma.article.findUnique({ where: { slug } });
      if (existing) {
        res.status(400).json({ error: 'Article with this slug already exists' });
        return;
      }

      const article = await prisma.article.create({
        data: {
          title,
          slug,
          excerpt,
          content,
          coverImage,
          published,
          publishedAt: published ? (publishedAt ? new Date(publishedAt) : new Date()) : null,
          authorId: req.user!.id,
          tags: {
            connect: tagIds.map((id) => ({ id })),
          },
        },
        include: {
          tags: true,
          author: {
            select: { id: true, name: true },
          },
        },
      });

      invalidateArticles();
      res.status(201).json(article);
    } catch (error) {
      console.error('Failed to create article:', error);
      res.status(500).json({ error: 'Failed to create article' });
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
      const result = updateArticleSchema.safeParse(req.body);
      if (!result.success) {
        res.status(400).json({ error: 'Invalid input', details: result.error.flatten() });
        return;
      }

      const existing = await prisma.article.findUnique({ where: { id } });
      if (!existing) {
        res.status(404).json({ error: 'Article not found' });
        return;
      }

      const { tagIds, publishedAt, ...data } = result.data;

      const updateData: Record<string, unknown> = { ...data };

      if (data.published && !existing.publishedAt) {
        updateData.publishedAt = publishedAt ? new Date(publishedAt) : new Date();
      } else if (publishedAt !== undefined) {
        updateData.publishedAt = publishedAt ? new Date(publishedAt) : null;
      }

      if (tagIds !== undefined) {
        updateData.tags = {
          set: tagIds.map((tagId) => ({ id: tagId })),
        };
      }

      const article = await prisma.article.update({
        where: { id },
        data: updateData,
        include: {
          tags: true,
          author: {
            select: { id: true, name: true },
          },
        },
      });

      invalidateArticles();
      res.json(article);
    } catch (error) {
      console.error('Failed to update article:', error);
      res.status(500).json({ error: 'Failed to update article' });
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

      const article = await prisma.article.findUnique({ where: { id } });
      if (!article) {
        res.status(404).json({ error: 'Article not found' });
        return;
      }

      await prisma.article.delete({ where: { id } });

      invalidateArticles();
      res.json({ message: 'Article deleted successfully' });
    } catch (error) {
      console.error('Failed to delete article:', error);
      res.status(500).json({ error: 'Failed to delete article' });
    }
  }
);

export default router;
