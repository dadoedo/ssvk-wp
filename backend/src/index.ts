import express from 'express';
import cors from 'cors';
import session from 'express-session';
import { PrismaClient } from '@prisma/client';
import { PrismaSessionStore } from './services/session-store.js';
import authRoutes from './routes/auth.js';
import documentsRoutes from './routes/documents.js';
import adminRoutes from './routes/admin.js';
import articlesRoutes from './routes/articles.js';
import pagesRoutes from './routes/pages.js';
import tagsRoutes from './routes/tags.js';
import uploadRoutes from './routes/upload.js';

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

// Trust proxy (Caddy)
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173').split(',');

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(express.json());

app.use(session({
  name: 'ssvk.sid',
  store: new PrismaSessionStore(prisma),
  secret: process.env.SESSION_SECRET || 'dev-secret-change-in-production',
  resave: false,
  saveUninitialized: false,
  proxy: process.env.NODE_ENV === 'production',
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    sameSite: 'lax',
    domain: process.env.COOKIE_DOMAIN || undefined,
  },
}));

app.use('/api/auth', authRoutes);
app.use('/api/documents', documentsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/articles', articlesRoutes);
app.use('/api/pages', pagesRoutes);
app.use('/api/tags', tagsRoutes);
app.use('/api/upload', uploadRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export { prisma };
