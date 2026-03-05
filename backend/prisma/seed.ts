import { PrismaClient, Role, TagType } from '@prisma/client';
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

  // Seed school tags
  const schoolTags = [
    { name: 'GAHŠVK', slug: 'gahsvk' },
    { name: 'SOŠ VK', slug: 'sosvk' },
    { name: 'SOŠ Želovce', slug: 'soszel' },
    { name: 'SŠMK', slug: 'ssmk' },
  ];

  for (const tag of schoolTags) {
    await prisma.tag.upsert({
      where: { slug: tag.slug },
      update: {},
      create: {
        name: tag.name,
        slug: tag.slug,
        type: TagType.SCHOOL,
      },
    });
  }

  console.log('Seeded', schoolTags.length, 'school tags');

  // Seed placeholder pages
  const oNasPage = await prisma.page.upsert({
    where: { slug: 'o-nas' },
    update: {},
    create: {
      title: 'O nás',
      slug: 'o-nas',
      content: '',
      published: false,
      sortOrder: 0,
    },
  });

  const oNasChildren = [
    { title: 'O škole', slug: 'o-skole', sortOrder: 1 },
    { title: 'Rada školy', slug: 'rada-skoly', sortOrder: 2 },
    { title: 'Školský parlament', slug: 'skolsky-parlament', sortOrder: 3 },
    { title: 'Verejné obstarávanie', slug: 'verejne-obstaravanie', sortOrder: 4 },
    { title: 'Voľné pracovné miesta', slug: 'volne-pracovne-miesta', sortOrder: 5 },
    { title: 'Správy o výchovno-vzdelávacej činnosti', slug: 'spravy-o-cinnosti', sortOrder: 6 },
    { title: 'Projekty', slug: 'projekty', sortOrder: 7 },
  ];

  for (const page of oNasChildren) {
    await prisma.page.upsert({
      where: { slug: page.slug },
      update: {},
      create: {
        ...page,
        content: '',
        published: false,
        parentId: oNasPage.id,
      },
    });
  }

  const studiumPage = await prisma.page.upsert({
    where: { slug: 'studium' },
    update: {},
    create: {
      title: 'Štúdium',
      slug: 'studium',
      content: '',
      published: false,
      sortOrder: 1,
    },
  });

  const sosPage = await prisma.page.upsert({
    where: { slug: 'stredna-odborna-skola' },
    update: {},
    create: {
      title: 'Stredná odborná škola',
      slug: 'stredna-odborna-skola',
      content: '',
      published: false,
      sortOrder: 3,
      parentId: studiumPage.id,
    },
  });

  const studiumChildren = [
    { title: 'Gymnázium A. H. Škultétyho', slug: 'gahsvk', sortOrder: 1 },
    { title: 'Obchodná akadémia', slug: 'obchodna-akademia', sortOrder: 2 },
    { title: 'Prijímacie skúšky', slug: 'prijimacie-skusky', sortOrder: 4 },
    { title: 'Maturity/Záverečné skúšky', slug: 'maturity', sortOrder: 5 },
  ];

  for (const page of studiumChildren) {
    await prisma.page.upsert({
      where: { slug: page.slug },
      update: {},
      create: {
        ...page,
        content: '',
        published: false,
        parentId: studiumPage.id,
      },
    });
  }

  const sosChildren = [
    { title: 'Veľký Krtíš', slug: 'sos-vk', sortOrder: 1 },
    { title: 'Želovce', slug: 'sos-zelovce', sortOrder: 2 },
    { title: 'Modrý Kameň', slug: 'sos-modry-kamen', sortOrder: 3 },
  ];

  for (const page of sosChildren) {
    await prisma.page.upsert({
      where: { slug: page.slug },
      update: {},
      create: {
        ...page,
        content: '',
        published: false,
        parentId: sosPage.id,
      },
    });
  }

  console.log('Seeded placeholder pages');

  // Seed existing documents
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
