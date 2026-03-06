import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { articlesApi, tagsApi, uploadApi } from '../../api/client';
import type { Article, Tag } from '../../api/client';
import { RichTextEditor } from '../../components/RichTextEditor';

interface FormData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  published: boolean;
  tagIds: string[];
}

const defaultFormData: FormData = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  coverImage: '',
  published: false,
  tagIds: [],
};

export function ArticlesAdminPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [formData, setFormData] = useState<FormData>(defaultFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    try {
      const [articlesData, tagsData] = await Promise.all([
        articlesApi.listAdmin(),
        tagsApi.list(),
      ]);
      setArticles(articlesData);
      setTags(tagsData);
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
    setEditingArticle(null);
    setShowForm(false);
  };

  const handleTitleChange = (title: string) => {
    setFormData(f => ({
      ...f,
      title,
      slug: editingArticle ? f.slug : generateSlug(title),
    }));
  };

  const handleCoverImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const result = await uploadApi.image(file);
      setFormData(f => ({ ...f, coverImage: result.url }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chyba pri nahrávaní obrázka');
    }
  };

  const toggleTag = (tagId: string) => {
    setFormData(f => ({
      ...f,
      tagIds: f.tagIds.includes(tagId)
        ? f.tagIds.filter(id => id !== tagId)
        : [...f.tagIds, tagId],
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
        excerpt: formData.excerpt || null,
        content: formData.content,
        coverImage: formData.coverImage || null,
        published: formData.published,
        tagIds: formData.tagIds,
      };

      if (editingArticle) {
        await articlesApi.update(editingArticle.id, data);
      } else {
        await articlesApi.create(data);
      }

      resetForm();
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chyba pri ukladaní');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (article: Article) => {
    setEditingArticle(article);
    setFormData({
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt || '',
      content: article.content,
      coverImage: article.coverImage || '',
      published: article.published,
      tagIds: article.tags.map(t => t.id),
    });
    setShowForm(true);
  };

  const handleDelete = async (article: Article) => {
    if (!confirm(`Naozaj chcete zmazať článok "${article.title}"?`)) return;

    try {
      await articlesApi.delete(article.id);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chyba pri mazaní');
    }
  };

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
        <h1>Články</h1>
        <button onClick={() => setShowForm(true)} className="add-button">
          + Nový článok
        </button>
      </div>

      {error && <div className="admin-error">{error}</div>}

      {showForm && (
        <div className="modal-overlay" onClick={() => resetForm()}>
          <div className="modal" style={{ maxWidth: '900px' }} onClick={e => e.stopPropagation()}>
            <h2>{editingArticle ? 'Upraviť článok' : 'Nový článok'}</h2>
            <form onSubmit={handleSubmit} className="admin-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="title">Nadpis</label>
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

              <div className="form-group">
                <label htmlFor="excerpt">Krátky popis (excerpt)</label>
                <textarea
                  id="excerpt"
                  value={formData.excerpt}
                  onChange={e => setFormData(f => ({ ...f, excerpt: e.target.value }))}
                  disabled={isSubmitting}
                  rows={2}
                />
              </div>

              <div className="form-group">
                <label>Obsah</label>
                <RichTextEditor
                  content={formData.content}
                  onChange={content => setFormData(f => ({ ...f, content }))}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="coverImage">Titulný obrázok</label>
                  <input
                    type="file"
                    id="coverImage"
                    accept="image/*"
                    onChange={handleCoverImageUpload}
                    disabled={isSubmitting}
                  />
                  {formData.coverImage && (
                    <img src={formData.coverImage} alt="Preview" className="cover-image-preview" />
                  )}
                </div>

                <div className="form-group">
                  <label>Tagy</label>
                  <div className="tag-select">
                    {tags.map(tag => (
                      <label
                        key={tag.id}
                        className={`tag-chip ${tag.type === 'SCHOOL' ? 'school' : ''} ${formData.tagIds.includes(tag.id) ? 'active' : ''}`}
                        style={{ cursor: 'pointer', opacity: formData.tagIds.includes(tag.id) ? 1 : 0.5 }}
                      >
                        <input
                          type="checkbox"
                          checked={formData.tagIds.includes(tag.id)}
                          onChange={() => toggleTag(tag.id)}
                          style={{ display: 'none' }}
                        />
                        {tag.name}
                      </label>
                    ))}
                    {tags.length === 0 && <span style={{ color: 'var(--text-muted)' }}>Žiadne tagy</span>}
                  </div>
                </div>
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
                  {isSubmitting ? 'Ukladám...' : (editingArticle ? 'Uložiť' : 'Vytvoriť')}
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
              <th>Nadpis</th>
              <th>Stav</th>
              <th>Autor</th>
              <th>Dátum</th>
              <th>Tagy</th>
              <th>Akcie</th>
            </tr>
          </thead>
          <tbody>
            {articles.map(article => (
              <tr key={article.id}>
                <td>{article.title}</td>
                <td>
                  <span className={`status-badge ${article.published ? 'published' : 'draft'}`}>
                    {article.published ? 'Publikované' : 'Koncept'}
                  </span>
                </td>
                <td>{article.author.name}</td>
                <td>
                  {article.publishedAt
                    ? new Date(article.publishedAt).toLocaleDateString('sk-SK')
                    : new Date(article.createdAt).toLocaleDateString('sk-SK')}
                </td>
                <td>
                  {article.tags.map(tag => (
                    <span key={tag.id} className={`tag ${tag.type === 'SCHOOL' ? 'school' : ''}`}>
                      {tag.name}
                    </span>
                  ))}
                </td>
                <td className="actions">
                  <button onClick={() => handleEdit(article)} className="edit-btn">
                    Upraviť
                  </button>
                  <button onClick={() => handleDelete(article)} className="delete-btn">
                    Zmazať
                  </button>
                </td>
              </tr>
            ))}
            {articles.length === 0 && (
              <tr>
                <td colSpan={6} className="empty-state">
                  Žiadne články
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
