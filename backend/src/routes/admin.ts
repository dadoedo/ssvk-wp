import { Router, Response } from 'express';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { Role } from '@prisma/client';
import { prisma } from '../index.js';
import { requireAuth, requireAdmin, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);
router.use(requireAdmin);

const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1).max(100),
  role: z.enum(['ADMIN', 'SCHOOL_ADMIN']).default('SCHOOL_ADMIN'),
});

const updateUserSchema = z.object({
  email: z.string().email().optional(),
  password: z.string().min(8).optional(),
  name: z.string().min(1).max(100).optional(),
  role: z.enum(['ADMIN', 'SCHOOL_ADMIN']).optional(),
});

router.get('/users', async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(users);
  } catch {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

router.get('/users/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json(user);
  } catch {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

router.post('/users', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const result = createUserSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ error: 'Invalid input', details: result.error.flatten() });
      return;
    }

    const { email, password, name, role } = result.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(409).json({ error: 'User with this email already exists' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: role as Role,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    res.status(201).json(user);
  } catch {
    res.status(500).json({ error: 'Failed to create user' });
  }
});

router.put('/users/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const result = updateUserSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ error: 'Invalid input', details: result.error.flatten() });
      return;
    }

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const { email, password, name, role } = result.data;

    if (email && email !== existing.email) {
      const emailTaken = await prisma.user.findUnique({ where: { email } });
      if (emailTaken) {
        res.status(409).json({ error: 'Email already in use' });
        return;
      }
    }

    const updateData: Record<string, unknown> = {};
    if (email) updateData.email = email;
    if (name) updateData.name = name;
    if (role) updateData.role = role as Role;
    if (password) updateData.password = await bcrypt.hash(password, 12);

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    res.json(user);
  } catch {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

router.delete('/users/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    
    if (req.user?.id === id) {
      res.status(400).json({ error: 'Cannot delete your own account' });
      return;
    }

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    await prisma.user.delete({ where: { id } });

    res.json({ message: 'User deleted successfully' });
  } catch {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

export default router;
