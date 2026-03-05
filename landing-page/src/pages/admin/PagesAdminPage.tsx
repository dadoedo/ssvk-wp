import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { pagesApi } from '../../api/client';
import type { Page } from '../../api/client';
import { RichTextEditor } from '../../components/RichTextEditor';

interface FormData {
  title: string;
  slug: string;
  content: string;
  published: boolean;
  sortOrder: number;
  parentId: string | null;
}

const defaultFormData: FormData = {
  title: '',
  slug: '',
  content: '',
  published: false,
  sortOrder: 0,
  parentId: null,
};

export function PagesAdminPage() {
  const [pages, setPages] = useState<Page[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [formData, setFormData] = useState<FormData>(defaultFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    try {
      const pagesData = await pagesApi.listAdmin();
      setPages(pagesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chyba pri načítaní');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const resetForm = () => {
    setFormData(defaultFormData);
    setEditingPage(null);
    setShowForm(false);
  };

  const handleTitleChange = (title: string) => {
    setFormData(f => ({
      ...f,
      title,
      slug: editingPage ? f.slug : generateSlug(title),
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const data = {
        title: formData.title,
        slug: formData.slug,
        content: formData.content,
        published: formData.published,
        sortOrder: formData.sortOrder,
        parentId: formData.parentId,
      };

      if (editingPage) {
        await pagesApi.update(editingPage.id, data);
      } else {
        await pagesApi.create(data);
      }

      resetForm();
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chyba pri ukladaní');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (page: Page) => {
    setEditingPage(page);
    setFormData({
      title: page.title,
      slug: page.slug,
      content: page.content,
      published: page.published,
      sortOrder: page.sortOrder,
      parentId: page.parentId,
    });
    setShowForm(true);
  };

  const handleDelete = async (page: Page) => {
    if (!confirm(`Naozaj chcete zmazať stránku "${page.title}"?`)) return;

    try {
      await pagesApi.delete(page.id);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chyba pri mazaní');
    }
  };

  const togglePublished = async (page: Page) => {
    try {
      await pagesApi.update(page.id, { published: !page.published });
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chyba pri zmene stavu');
    }
  };

  const getAvailableParents = () => {
    return pages.filter(p => p.id !== editingPage?.id);
  };

  const getPagePath = (page: Page): string => {
    if (page.fullPath) return page.fullPath;
    if (!page.parent) return page.slug;
    return `${page.parent.slug}/${page.slug}`;
  };

  const getIndentLevel = (page: Page): number => {
    let level = 0;
    let current = page;
    while (current.parentId) {
      level++;
      const parent = pages.find(p => p.id === current.parentId);
      if (!parent) break;
      current = parent;
    }
    return level;
  };

  const sortedPages = [...pages].sort((a, b) => {
    const pathA = getPagePath(a);
    const pathB = getPagePath(b);
    return pathA.localeCompare(pathB);
  });

  if (isLoading) {
    return (
      <div className="admin-page">
        <p>Načítavam...</p>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <Link to="/admin" className="back-link">← Späť</Link>
        <h1>Stránky</h1>
        <button onClick={() => setShowForm(true)} className="add-button">
          + Nová stránka
        </button>
      </div>

      {error && <div className="admin-error">{error}</div>}

      {showForm && (
        <div className="modal-overlay" onClick={() => resetForm()}>
          <div className="modal" style={{ maxWidth: '900px' }} onClick={e => e.stopPropagation()}>
            <h2>{editingPage ? 'Upraviť stránku' : 'Nová stránka'}</h2>
            <form onSubmit={handleSubmit} className="admin-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="title">Názov</label>
                  <input
                    type="text"
                    id="title"
                    value={formData.title}
                    onChange={e => handleTitleChange(e.target.value)}
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="slug">URL slug</label>
                  <input
                    type="text"
                    id="slug"
                    value={formData.slug}
                    onChange={e => setFormData(f => ({ ...f, slug: e.target.value }))}
                    required
                    disabled={isSubmitting}
                    pattern="[a-z0-9-]+"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="parentId">Rodičovská stránka</label>
                  <select
                    id="parentId"
                    value={formData.parentId || ''}
                    onChange={e => setFormData(f => ({ ...f, parentId: e.target.value || null }))}
                    disabled={isSubmitting}
                  >
                    <option value="">— Žiadna (root) —</option>
                    {getAvailableParents().map(p => (
                      <option key={p.id} value={p.id}>
                        {'  '.repeat(getIndentLevel(p))}{p.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="sortOrder">Poradie</label>
                  <input
                    type="number"
                    id="sortOrder"
                    value={formData.sortOrder}
                    onChange={e => setFormData(f => ({ ...f, sortOrder: parseInt(e.target.value) || 0 }))}
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Obsah</label>
                <RichTextEditor
                  content={formData.content}
                  onChange={content => setFormData(f => ({ ...f, content }))}
                />
              </div>

              <div className="form-group checkbox">
                <input
                  type="checkbox"
                  id="published"
                  checked={formData.published}
                  onChange={e => setFormData(f => ({ ...f, published: e.target.checked }))}
                  disabled={isSubmitting}
                />
                <label htmlFor="published">Publikovať</label>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={resetForm} disabled={isSubmitting}>
                  Zrušiť
                </button>
                <button type="submit" className="primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Ukladám...' : (editingPage ? 'Uložiť' : 'Vytvoriť')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="documents-table-container">
        <table className="documents-table">
          <thead>
            <tr>
              <th>Názov</th>
              <th>URL cesta</th>
              <th>Stav</th>
              <th>Akcie</th>
            </tr>
          </thead>
          <tbody>
            {sortedPages.map(page => (
              <tr key={page.id}>
                <td style={{ paddingLeft: `${getIndentLevel(page) * 24 + 12}px` }}>
                  {getIndentLevel(page) > 0 && <span style={{ color: 'var(--text-muted)', marginRight: '8px' }}>└</span>}
                  {page.title}
                </td>
                <td>
                  <code style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    /stranka/{getPagePath(page)}
                  </code>
                </td>
                <td>
                  <button
                    onClick={() => togglePublished(page)}
                    className={`status-badge ${page.published ? 'published' : 'draft'}`}
                    style={{ cursor: 'pointer', border: 'none' }}
                  >
                    {page.published ? 'Publikované' : 'Koncept'}
                  </button>
                </td>
                <td className="actions">
                  <button onClick={() => handleEdit(page)} className="edit-btn">
                    Upraviť
                  </button>
                  <button onClick={() => handleDelete(page)} className="delete-btn">
                    Zmazať
                  </button>
                </td>
              </tr>
            ))}
            {pages.length === 0 && (
              <tr>
                <td colSpan={4} className="empty-state">
                  Žiadne stránky
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
