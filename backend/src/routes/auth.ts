import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { prisma } from '../index.js';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const result = loginSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ error: 'Invalid input', details: result.error.flatten() });
      return;
    }

    const { email, password } = result.data;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    req.session.userId = user.id;

    req.session.save((err) => {
      if (err) {
        res.status(500).json({ error: 'Session error' });
        return;
      }
      res.json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      });
    });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/logout', requireAuth, (req: Request, res: Response): void => {
  req.session.destroy((err) => {
    if (err) {
      res.status(500).json({ error: 'Failed to logout' });
      return;
    }
    res.clearCookie('ssvk.sid');
    res.json({ message: 'Logged out successfully' });
  });
});

router.get('/me', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  res.json({ user: req.user });
});

export default router;
