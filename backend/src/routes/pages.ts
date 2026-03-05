import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../index.js';
import { requireAuth, requireSchoolAdminOrAbove, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

const pageSchema = z.object({
  title: z.string().min(1).max(255),
  slug: z.string().min(1).max(255).regex(/^[a-z0-9-]+$/),
  content: z.string().optional().default(''),
  published: z.boolean().optional().default(false),
  sortOrder: z.number().int().optional().default(0),
  parentId: z.string().optional().nullable(),
});

const updatePageSchema = pageSchema.partial();

interface PageWithChildren {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  sortOrder: number;
  parentId: string | null;
  children: PageWithChildren[];
}

async function buildPageTree(parentId: string | null = null, publishedOnly = true): Promise<PageWithChildren[]> {
  const where: Record<string, unknown> = { parentId };
  if (publishedOnly) {
    where.published = true;
  }

  const pages = await prisma.page.findMany({
    where,
    orderBy: { sortOrder: 'asc' },
    select: {
      id: true,
      title: true,
      slug: true,
      published: true,
      sortOrder: true,
      parentId: true,
    },
  });

  const result: PageWithChildren[] = [];
  for (const page of pages) {
    const children = await buildPageTree(page.id, publishedOnly);
    result.push({ ...page, children });
  }

  return result;
}

async function getBreadcrumbs(page: { id: string; parentId: string | null }): Promise<{ id: string; title: string; slug: string }[]> {
  const breadcrumbs: { id: string; title: string; slug: string }[] = [];
  let currentPage = page;

  while (currentPage.parentId) {
    const parent = await prisma.page.findUnique({
      where: { id: currentPage.parentId },
      select: { id: true, title: true, slug: true, parentId: true },
    });

    if (!parent) break;

    breadcrumbs.unshift({ id: parent.id, title: parent.title, slug: parent.slug });
    currentPage = parent;
  }

  return breadcrumbs;
}

async function getFullPath(page: { id: string; slug: string; parentId: string | null }): Promise<string> {
  const breadcrumbs = await getBreadcrumbs(page);
  const slugs = [...breadcrumbs.map((b) => b.slug), page.slug];
  return slugs.join('/');
}

router.get('/tree', async (req: Request, res: Response): Promise<void> => {
  try {
    const { all } = req.query;
    const tree = await buildPageTree(null, all !== 'true');
    res.json(tree);
  } catch (error) {
    console.error('Failed to fetch page tree:', error);
    res.status(500).json({ error: 'Failed to fetch page tree' });
  }
});

router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { published } = req.query;

    const where: Record<string, unknown> = {};
    if (published !== 'all') {
      where.published = true;
    }

    const pages = await prisma.page.findMany({
      where,
      orderBy: [{ parentId: 'asc' }, { sortOrder: 'asc' }],
      include: {
        parent: {
          select: { id: true, title: true, slug: true },
        },
      },
    });

    res.json(pages);
  } catch (error) {
    console.error('Failed to fetch pages:', error);
    res.status(500).json({ error: 'Failed to fetch pages' });
  }
});

router.get('/admin', requireAuth, requireSchoolAdminOrAbove, async (_req: Request, res: Response): Promise<void> => {
  try {
    const pages = await prisma.page.findMany({
      orderBy: [{ parentId: 'asc' }, { sortOrder: 'asc' }],
      include: {
        parent: {
          select: { id: true, title: true, slug: true },
        },
        _count: {
          select: { children: true },
        },
      },
    });

    const pagesWithPath = await Promise.all(
      pages.map(async (page) => ({
        ...page,
        fullPath: await getFullPath(page),
      }))
    );

    res.json(pagesWithPath);
  } catch (error) {
    console.error('Failed to fetch pages:', error);
    res.status(500).json({ error: 'Failed to fetch pages' });
  }
});

router.get('/by-path/{*path}', async (req: Request, res: Response): Promise<void> => {
  try {
    const pathParam = Array.isArray(req.params.path) ? req.params.path.join('/') : (req.params.path ?? '');
    const pathSegments = pathParam.split('/').filter(Boolean);
    
    if (pathSegments.length === 0) {
      res.status(400).json({ error: 'Path is required' });
      return;
    }

    type PageResult = {
      id: string;
      title: string;
      slug: string;
      content: string;
      published: boolean;
      sortOrder: number;
      parentId: string | null;
      createdAt: Date;
      updatedAt: Date;
    };

    let currentPage: PageResult | null = null;
    let parentId: string | null = null;

    for (const slug of pathSegments) {
      const foundPage: PageResult | null = await prisma.page.findFirst({
        where: { slug, parentId },
      });

      if (!foundPage) {
        res.status(404).json({ error: 'Page not found' });
        return;
      }

      currentPage = foundPage;
      parentId = foundPage.id;
    }

    if (!currentPage) {
      res.status(404).json({ error: 'Page not found' });
      return;
    }

    if (!currentPage.published) {
      res.status(404).json({ error: 'Page not found' });
      return;
    }

    const breadcrumbs = await getBreadcrumbs(currentPage);

    const siblings = await prisma.page.findMany({
      where: { parentId: currentPage.parentId, published: true },
      orderBy: { sortOrder: 'asc' },
      select: { id: true, title: true, slug: true },
    });

    const children = await prisma.page.findMany({
      where: { parentId: currentPage.id, published: true },
      orderBy: { sortOrder: 'asc' },
      select: { id: true, title: true, slug: true },
    });

    const parent = currentPage.parentId
      ? await prisma.page.findUnique({
          where: { id: currentPage.parentId },
          select: { id: true, title: true, slug: true },
        })
      : null;

    res.json({
      page: currentPage,
      breadcrumbs,
      siblings,
      children,
      parent,
      fullPath: await getFullPath(currentPage),
    });
  } catch (error) {
    console.error('Failed to fetch page:', error);
    res.status(500).json({ error: 'Failed to fetch page' });
  }
});

router.get('/:slug', async (req: Request, res: Response): Promise<void> => {
  try {
    const slug = req.params.slug as string;

    const page = await prisma.page.findUnique({
      where: { slug },
    });

    if (!page) {
      res.status(404).json({ error: 'Page not found' });
      return;
    }

    const breadcrumbs = await getBreadcrumbs(page);

    const siblings = await prisma.page.findMany({
      where: { parentId: page.parentId, published: true },
      orderBy: { sortOrder: 'asc' },
      select: { id: true, title: true, slug: true },
    });

    const children = await prisma.page.findMany({
      where: { parentId: page.id, published: true },
      orderBy: { sortOrder: 'asc' },
      select: { id: true, title: true, slug: true },
    });

    const parent = page.parentId
      ? await prisma.page.findUnique({
          where: { id: page.parentId },
          select: { id: true, title: true, slug: true },
        })
      : null;

    res.json({
      page,
      breadcrumbs,
      siblings,
      children,
      parent,
      fullPath: await getFullPath(page),
    });
  } catch (error) {
    console.error('Failed to fetch page:', error);
    res.status(500).json({ error: 'Failed to fetch page' });
  }
});

router.post(
  '/',
  requireAuth,
  requireSchoolAdminOrAbove,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const result = pageSchema.safeParse(req.body);
      if (!result.success) {
        res.status(400).json({ error: 'Invalid input', details: result.error.flatten() });
        return;
      }

      const { title, slug, content, published, sortOrder, parentId } = result.data;

      const existing = await prisma.page.findUnique({ where: { slug } });
      if (existing) {
        res.status(400).json({ error: 'Page with this slug already exists' });
        return;
      }

      if (parentId) {
        const parent = await prisma.page.findUnique({ where: { id: parentId } });
        if (!parent) {
          res.status(400).json({ error: 'Parent page not found' });
          return;
        }
      }

      const page = await prisma.page.create({
        data: {
          title,
          slug,
          content,
          published,
          sortOrder,
          parentId,
        },
        include: {
          parent: {
            select: { id: true, title: true, slug: true },
          },
        },
      });

      res.status(201).json(page);
    } catch (error) {
      console.error('Failed to create page:', error);
      res.status(500).json({ error: 'Failed to create page' });
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
      const result = updatePageSchema.safeParse(req.body);
      if (!result.success) {
        res.status(400).json({ error: 'Invalid input', details: result.error.flatten() });
        return;
      }

      const existing = await prisma.page.findUnique({ where: { id } });
      if (!existing) {
        res.status(404).json({ error: 'Page not found' });
        return;
      }

      const { parentId, ...data } = result.data;

      if (parentId !== undefined) {
        if (parentId === id) {
          res.status(400).json({ error: 'Page cannot be its own parent' });
          return;
        }

        if (parentId) {
          const parent = await prisma.page.findUnique({ where: { id: parentId } });
          if (!parent) {
            res.status(400).json({ error: 'Parent page not found' });
            return;
          }

          let currentParent = parent;
          while (currentParent.parentId) {
            if (currentParent.parentId === id) {
              res.status(400).json({ error: 'Circular reference detected' });
              return;
            }
            const nextParent = await prisma.page.findUnique({ where: { id: currentParent.parentId } });
            if (!nextParent) break;
            currentParent = nextParent;
          }
        }
      }

      const page = await prisma.page.update({
        where: { id },
        data: {
          ...data,
          parentId: parentId !== undefined ? parentId : existing.parentId,
        },
        include: {
          parent: {
            select: { id: true, title: true, slug: true },
          },
        },
      });

      res.json(page);
    } catch (error) {
      console.error('Failed to update page:', error);
      res.status(500).json({ error: 'Failed to update page' });
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

      const page = await prisma.page.findUnique({
        where: { id },
      });

      if (!page) {
        res.status(404).json({ error: 'Page not found' });
        return;
      }

      const childrenCount = await prisma.page.count({ where: { parentId: id } });

      if (childrenCount > 0) {
        res.status(400).json({ error: 'Cannot delete page with children. Delete or move children first.' });
        return;
      }

      await prisma.page.delete({ where: { id } });

      res.json({ message: 'Page deleted successfully' });
    } catch (error) {
      console.error('Failed to delete page:', error);
      res.status(500).json({ error: 'Failed to delete page' });
    }
  }
);

export default router;
