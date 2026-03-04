import { Request, Response, NextFunction } from 'express';
import { prisma } from '../index.js';
import { Role } from '@prisma/client';

declare module 'express-session' {
  interface SessionData {
    userId?: string;
  }
}

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    role: Role;
  };
}

export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  if (!req.session.userId) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.session.userId },
      select: { id: true, email: true, name: true, role: true },
    });

    if (!user) {
      req.session.destroy(() => {});
      res.status(401).json({ error: 'User not found' });
      return;
    }

    req.user = user;
    next();
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
}

export function requireRole(...roles: Role[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    next();
  };
}

export function requireAdmin(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  return requireRole(Role.ADMIN)(req, res, next);
}

export function requireSchoolAdminOrAbove(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  return requireRole(Role.ADMIN, Role.SCHOOL_ADMIN)(req, res, next);
}
