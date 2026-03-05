import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { tagsApi } from '../../api/client';
import type { Tag } from '../../api/client';

interface FormData {
  name: string;
  slug: string;
}

const defaultFormData: FormData = {
  name: '',
  slug: '',
};

export function TagsAdminPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [formData, setFormData] = useState<FormData>(defaultFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    try {
      const tagsData = await tagsApi.list();
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

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const resetForm = () => {
    setFormData(defaultFormData);
    setEditingTag(null);
    setShowForm(false);
  };

  const handleNameChange = (name: string) => {
    setFormData(f => ({
      ...f,
      name,
      slug: editingTag ? f.slug : generateSlug(name),
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      if (editingTag) {
        await tagsApi.update(editingTag.id, { name: formData.name });
      } else {
        await tagsApi.create({
          name: formData.name,
          slug: formData.slug,
        });
      }

      resetForm();
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chyba pri ukladaní');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (tag: Tag) => {
    if (tag.type === 'SCHOOL') {
      setError('Školské tagy nie je možné upravovať');
      return;
    }
    setEditingTag(tag);
    setFormData({
      name: tag.name,
      slug: tag.slug,
    });
    setShowForm(true);
  };

  const handleDelete = async (tag: Tag) => {
    if (tag.type === 'SCHOOL') {
      setError('Školské tagy nie je možné mazať');
      return;
    }
    if (!confirm(`Naozaj chcete zmazať tag "${tag.name}"?`)) return;

    try {
      await tagsApi.delete(tag.id);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chyba pri mazaní');
    }
  };

  const schoolTags = tags.filter(t => t.type === 'SCHOOL');
  const customTags = tags.filter(t => t.type === 'CUSTOM');

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
        <h1>Tagy</h1>
        <button onClick={() => setShowForm(true)} className="add-button">
          + Nový tag
        </button>
      </div>

      {error && <div className="admin-error">{error}</div>}

      {showForm && (
        <div className="modal-overlay" onClick={() => resetForm()}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{editingTag ? 'Upraviť tag' : 'Nový tag'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Názov</label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={e => handleNameChange(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
              </div>

              {!editingTag && (
                <div className="form-group">
                  <label htmlFor="slug">Slug</label>
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
              )}

              <div className="modal-actions">
                <button type="button" onClick={resetForm} disabled={isSubmitting}>
                  Zrušiť
                </button>
                <button type="submit" className="primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Ukladám...' : (editingTag ? 'Uložiť' : 'Vytvoriť')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {schoolTags.length > 0 && (
        <>
          <h2 style={{ fontSize: '1.1rem', marginTop: 'var(--spacing-xl)', marginBottom: 'var(--spacing-md)' }}>
            Školské tagy (automatické)
          </h2>
          <div className="documents-table-container">
            <table className="documents-table">
              <thead>
                <tr>
                  <th>Názov</th>
                  <th>Slug</th>
                  <th>Počet článkov</th>
                </tr>
              </thead>
              <tbody>
                {schoolTags.map(tag => (
                  <tr key={tag.id}>
                    <td>
                      <span className="tag school">{tag.name}</span>
                    </td>
                    <td>
                      <code style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{tag.slug}</code>
                    </td>
                    <td>{tag._count?.articles || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <h2 style={{ fontSize: '1.1rem', marginTop: 'var(--spacing-xl)', marginBottom: 'var(--spacing-md)' }}>
        Vlastné tagy
      </h2>
      <div className="documents-table-container">
        <table className="documents-table">
          <thead>
            <tr>
              <th>Názov</th>
              <th>Slug</th>
              <th>Počet článkov</th>
              <th>Akcie</th>
            </tr>
          </thead>
          <tbody>
            {customTags.map(tag => (
              <tr key={tag.id}>
                <td>{tag.name}</td>
                <td>
                  <code style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{tag.slug}</code>
                </td>
                <td>{tag._count?.articles || 0}</td>
                <td className="actions">
                  <button onClick={() => handleEdit(tag)} className="edit-btn">
                    Upraviť
                  </button>
                  <button onClick={() => handleDelete(tag)} className="delete-btn">
                    Zmazať
                  </button>
                </td>
              </tr>
            ))}
            {customTags.length === 0 && (
              <tr>
                <td colSpan={4} className="empty-state">
                  Žiadne vlastné tagy
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
