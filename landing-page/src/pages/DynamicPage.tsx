import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { pagesApi } from '../api/client';
import type { PageWithNavigation } from '../api/client';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { PageSidebar } from '../components/PageSidebar';
import { useMenu } from '../contexts/MenuContext';

export function DynamicPage() {
  const location = useLocation();
  const [pageData, setPageData] = useState<PageWithNavigation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const path = location.pathname.replace('/stranka/', '').replace(/^\/+|\/+$/g, '');

  useEffect(() => {
    const loadPage = async () => {
      if (!path) {
        setError('Stránka sa nenašla');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError('');

      try {
        const data = await pagesApi.getByPath(path);
        setPageData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Stránka sa nenašla');
      } finally {
        setIsLoading(false);
      }
    };

    loadPage();
  }, [path]);

  if (isLoading) {
    return (
      <main className="page-layout">
        <p>Načítavam...</p>
      </main>
    );
  }

  if (error || !pageData) {
    return (
      <main className="page-layout">
        <div style={{ textAlign: 'center', padding: 'var(--spacing-2xl)' }}>
          <h1 style={{ marginBottom: 'var(--spacing-md)' }}>Stránka sa nenašla</h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--spacing-lg)' }}>
            Požadovaná stránka neexistuje alebo ešte nebola publikovaná.
          </p>
          <Link to="/" style={{ color: 'var(--blue)' }}>
            ← Späť na domovskú stránku
          </Link>
        </div>
      </main>
    );
  }

  const { page, breadcrumbs, siblings, children, parent } = pageData;
  const hasSidebar = siblings.length > 1 || parent !== null;
  const { getMenuChildrenForPath } = useMenu();
  const menuChildren = getMenuChildrenForPath(path);

  // Buttons pod H1: preferuj menu children (vrátane fixných položiek ako Dokumenty, Žiacke knižky)
  const buttonItems =
    menuChildren && menuChildren.length > 0
      ? menuChildren
      : children.map(c => ({ label: c.title, href: `/stranka/${pageData.fullPath}/${c.slug}`, external: false as const }));

  return (
    <main className="page-layout">
      <Breadcrumbs items={breadcrumbs} currentTitle={page.title} />

      <div className={`page-content-wrapper ${!hasSidebar ? 'no-sidebar' : ''}`}>
        {hasSidebar && (
          <PageSidebar
            parent={parent}
            current={{ id: page.id, title: page.title, slug: page.slug }}
            siblings={siblings}
            basePath={pageData.fullPath}
          />
        )}

        <article className="page-content">
          <h1>{page.title}</h1>
          {buttonItems.length > 0 && (
            <div className="page-children-buttons">
              {buttonItems.map((item) =>
                item.external ? (
                  <a
                    key={item.label}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="page-child-button"
                  >
                    {item.label}
                  </a>
                ) : (
                  <Link
                    key={item.href ?? item.label}
                    to={item.href!}
                    className="page-child-button"
                  >
                    {item.label}
                  </Link>
                )
              )}
            </div>
          )}
          {page.content && (
            <div
              className="page-content-body"
              dangerouslySetInnerHTML={{ __html: page.content }}
            />
          )}
        </article>
      </div>
    </main>
  );
}
