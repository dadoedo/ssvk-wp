export interface PageTreeItem {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  sortOrder: number;
  parentId: string | null;
  children: PageTreeItem[];
}

export interface MenuItem {
  label: string;
  href?: string;
  external?: boolean;
  children?: MenuItem[];
}

const ziackeKnizkySubmenu: MenuItem[] = [
  { label: 'Edupage GAHSVK', href: 'https://gahsvk.edupage.org/login/', external: true },
  { label: 'Edupage SOSVK', href: 'https://sosvk.edupage.org/login/', external: true },
  { label: 'Edupage SOSZEL', href: 'https://sos-zelovce.edupage.org/', external: true },
  { label: 'Edupage SSMK', href: 'https://ssmk.edupage.org/', external: true },
];

function hasPublishedDescendant(page: PageTreeItem): boolean {
  if (page.published) return true;
  return page.children?.some(child => hasPublishedDescendant(child)) || false;
}

function pageTreeToMenuItem(page: PageTreeItem, parentPath = ''): MenuItem | null {
  const fullPath = parentPath ? `${parentPath}/${page.slug}` : page.slug;
  const href = page.published ? `/stranka/${fullPath}` : undefined;

  const visibleChildren = page.children?.filter(child => hasPublishedDescendant(child)) || [];
  const childMenuItems = visibleChildren
    .map(child => pageTreeToMenuItem(child, fullPath))
    .filter((item): item is MenuItem => item !== null);

  if (childMenuItems.length > 0) {
    return {
      label: page.title,
      href,
      children: childMenuItems,
    };
  }

  if (page.published) {
    return {
      label: page.title,
      href,
    };
  }

  return null;
}

export function buildMenu(pages: PageTreeItem[]): MenuItem[] {
  const oNasPage = pages.find(p => p.slug === 'o-nas');
  const studiumPage = pages.find(p => p.slug === 'studium');

  const oNasVisibleChildren = oNasPage?.children.filter(c => hasPublishedDescendant(c)) || [];
  const oNasChildren: MenuItem[] = oNasVisibleChildren
    .map(child => pageTreeToMenuItem(child, 'o-nas'))
    .filter((item): item is MenuItem => item !== null);
  oNasChildren.push({ label: 'Dokumenty', href: '/pz' });

  const studiumVisibleChildren = studiumPage?.children.filter(c => hasPublishedDescendant(c)) || [];
  const studiumChildren: MenuItem[] = studiumVisibleChildren
    .map(child => pageTreeToMenuItem(child, 'studium'))
    .filter((item): item is MenuItem => item !== null);

  const hasZiackeKnizky = studiumChildren.some(
    c => c.href?.endsWith('/ziacke-knizky') || c.href === '/stranka/studium/ziacke-knizky'
  );
  if (hasZiackeKnizky) {
    const ziackeKnizky = studiumChildren.find(c => c.href?.includes('ziacke-knizky'));
    if (ziackeKnizky) {
      ziackeKnizky.children = [...(ziackeKnizky.children ?? []), ...ziackeKnizkySubmenu];
    }
  } else {
    studiumChildren.push({ label: 'Žiacke knižky', href: '/stranka/studium/ziacke-knizky', children: ziackeKnizkySubmenu });
  }

  return [
    { label: 'Domov', href: '/' },
    {
      label: 'O nás',
      href: oNasPage?.published ? '/stranka/o-nas' : undefined,
      children: oNasChildren,
    },
    {
      label: 'Štúdium',
      href: studiumPage?.published ? '/stranka/studium' : undefined,
      children: studiumChildren,
    },
    { label: 'Kontakt', href: '/#kontakt' },
  ];
}

/**
 * Vráti menu children pre danú stránku (path). Používa sa pre buttons pod H1.
 * Len pre top-level (o-nas, studium) a studium/ziacke-knizky - tam sú fixné položky.
 * Pre ostatné vnorené stránky null - použije sa API children (len deti, nie súrodenci).
 */
export function getMenuChildrenForPath(menuConfig: MenuItem[], path: string): MenuItem[] | null {
  const segments = path.split('/').filter(Boolean);
  if (segments.length === 0) return null;

  const topSlug = segments[0];
  const topItem = menuConfig.find(item => {
    const itemSlug = item.href?.replace('/stranka/', '').replace(/^\/+|\/+$/g, '') || '';
    return itemSlug === topSlug || (topSlug === 'o-nas' && item.label === 'O nás') || (topSlug === 'studium' && item.label === 'Štúdium');
  });

  if (!topItem?.children) return null;

  // Top-level: o-nas, studium – vráť children (vrátane fixných)
  if (segments.length === 1) {
    return topItem.children;
  }

  // Výnimka: studium/ziacke-knizky – má fixné Edupage linky ako „deti“
  if (segments.length === 2 && segments[0] === 'studium' && segments[1] === 'ziacke-knizky') {
    const ziackeKnizky = topItem.children.find(c => c.label === 'Žiacke knižky');
    return ziackeKnizky?.children ?? null;
  }

  // Ostatné vnorené stránky – použij len API children (deti), nie súrodencov
  return null;
}
