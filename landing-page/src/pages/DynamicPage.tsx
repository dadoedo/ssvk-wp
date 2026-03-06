import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { pagesApi } from '../api/client';
import type { PageWithNavigation } from '../api/client';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { PageSidebar } from '../components/PageSidebar';

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
  const hasSidebar = siblings.length > 1 || children.length > 0 || parent !== null;

  return (
    <main className="page-layout">
      <Breadcrumbs items={breadcrumbs} currentTitle={page.title} />

      <div className={`page-content-wrapper ${!hasSidebar ? 'no-sidebar' : ''}`}>
        {hasSidebar && (
          <PageSidebar
            parent={parent}
            current={{ id: page.id, title: page.title, slug: page.slug }}
            siblings={siblings}
            children={children}
            basePath={pageData.fullPath}
          />
        )}

        <article className="page-content">
          <h1>{page.title}</h1>
          {page.content ? (
            <div
              className="page-content-body"
              dangerouslySetInnerHTML={{ __html: page.content }}
            />
          ) : (
            <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
              Obsah tejto stránky sa pripravuje.
            </p>
          )}
        </article>
      </div>
    </main>
  );
}
