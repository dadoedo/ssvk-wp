import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  const hashedPassword = await bcrypt.hash(adminPassword, 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@ssvk.sk' },
    update: {},
    create: {
      email: 'admin@ssvk.sk',
      password: hashedPassword,
      name: 'Administrator',
      role: Role.ADMIN,
    },
  });

  console.log('Created admin user:', admin.email);

  const existingDocs = [
    {
      name: 'Vyhlásenie volieb Školského parlamentu',
      filename: 'vyhlasenie-volieb-sp-02-2026.pdf',
      filePath: '/pdfs/vyhlasenie-volieb-sp-02-2026.pdf',
      dateAdded: new Date('2026-02-06'),
      tags: ['voľby', 'školský parlament'],
    },
    {
      name: 'Oznámenie o vyhlásení výberového konania',
      filename: 'vyberove-konanie-02-26.pdf',
      filePath: '/pdfs/vyberove-konanie-02-26.pdf',
      dateAdded: new Date('2026-02-03'),
      tags: ['výberové konanie', 'voľby'],
    },
    {
      name: 'Štatút Rady školy',
      filename: 'statut-rady-skoly-19-2-26.pdf',
      filePath: '/pdfs/statut-rady-skoly-19-2-26.pdf',
      dateAdded: new Date('2026-02-19'),
      tags: ['štatút', 'rada školy'],
    },
    {
      name: 'Zápisnica zo zasadnutia RŠ',
      filename: 'zapisinca-zasadnutie-rs-19-2-26.pdf',
      filePath: '/pdfs/zapisinca-zasadnutie-rs-19-2-26.pdf',
      dateAdded: new Date('2026-02-19'),
      tags: ['zápisnica', 'zasadnutie', 'rada školy'],
    },
    {
      name: 'Zápisnica z volieb ŠP',
      filename: 'zapsinica-volby-19-2-26.pdf',
      filePath: '/pdfs/zapsinica-volby-19-2-26.pdf',
      dateAdded: new Date('2026-02-19'),
      tags: ['zápisnica', 'voľby', 'školský parlament'],
    },
  ];

  for (const doc of existingDocs) {
    await prisma.document.upsert({
      where: { id: doc.filename },
      update: {},
      create: {
        id: doc.filename,
        ...doc,
      },
    });
  }

  console.log('Seeded', existingDocs.length, 'documents');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
