import { Store, SessionData } from 'express-session';
import type { PrismaClient } from '@prisma/client';

export class PrismaSessionStore extends Store {
  private prisma: PrismaClient;
  private ttl: number;

  constructor(prisma: PrismaClient, options?: { ttl?: number }) {
    super();
    this.prisma = prisma;
    this.ttl = options?.ttl || 86400 * 7;
  }

  get = (
    sid: string,
    callback: (err?: unknown, session?: SessionData | null) => void
  ): void => {
    this.prisma.session.findUnique({
      where: { sid },
    }).then((session) => {
      if (!session) {
        return callback(null, null);
      }

      if (session.expiresAt < new Date()) {
        this.prisma.session.delete({ where: { sid } }).then(() => {
          callback(null, null);
        }).catch(() => {
          callback(null, null);
        });
        return;
      }

      callback(null, JSON.parse(session.data) as SessionData);
    }).catch((err) => {
      callback(err);
    });
  };

  set = (
    sid: string,
    session: SessionData,
    callback?: (err?: unknown) => void
  ): void => {
    const ttl = session.cookie?.originalMaxAge
      ? Math.floor(session.cookie.originalMaxAge / 1000)
      : this.ttl;
    const expiresAt = new Date(Date.now() + ttl * 1000);

    this.prisma.session.upsert({
      where: { sid },
      update: {
        data: JSON.stringify(session),
        expiresAt,
      },
      create: {
        sid,
        data: JSON.stringify(session),
        expiresAt,
      },
    }).then(() => {
      callback?.();
    }).catch((err) => {
      callback?.(err);
    });
  };

  destroy = (sid: string, callback?: (err?: unknown) => void): void => {
    this.prisma.session.delete({
      where: { sid },
    }).then(() => {
      callback?.();
    }).catch(() => {
      callback?.();
    });
  };

  touch = (
    sid: string,
    session: SessionData,
    callback?: (err?: unknown) => void
  ): void => {
    const ttl = session.cookie?.originalMaxAge
      ? Math.floor(session.cookie.originalMaxAge / 1000)
      : this.ttl;
    const expiresAt = new Date(Date.now() + ttl * 1000);

    this.prisma.session.update({
      where: { sid },
      data: { expiresAt },
    }).then(() => {
      callback?.();
    }).catch((err) => {
      callback?.(err);
    });
  };
}
