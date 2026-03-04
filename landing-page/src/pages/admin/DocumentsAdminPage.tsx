import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { documentsApi } from '../../api/client';
import type { Document } from '../../api/client';

export function DocumentsAdminPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editingDoc, setEditingDoc] = useState<Document | null>(null);
  const [formData, setFormData] = useState({ name: '', tags: '' });
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadDocuments = async () => {
    try {
      const docs = await documentsApi.list();
      setDocuments(docs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chyba pri načítaní dokumentov');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const resetForm = () => {
    setFormData({ name: '', tags: '' });
    setFile(null);
    setEditingDoc(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      if (editingDoc) {
        await documentsApi.update(editingDoc.id, {
          name: formData.name,
          tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        });
      } else {
        if (!file) {
          setError('Vyberte súbor');
          setIsSubmitting(false);
          return;
        }

        const uploadResult = await documentsApi.upload(file);
        await documentsApi.create({
          name: formData.name,
          filename: uploadResult.filename,
          filePath: uploadResult.filePath,
          tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        });
      }

      resetForm();
      await loadDocuments();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chyba pri ukladaní');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (doc: Document) => {
    setEditingDoc(doc);
    setFormData({
      name: doc.name,
      tags: doc.tags.join(', '),
    });
    setShowForm(true);
  };

  const handleDelete = async (doc: Document) => {
    if (!confirm(`Naozaj chcete zmazať dokument "${doc.name}"?`)) return;

    try {
      await documentsApi.delete(doc.id);
      await loadDocuments();
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
        <h1>Povinné zverejňovanie</h1>
        <button onClick={() => setShowForm(true)} className="add-button">
          + Pridať dokument
        </button>
      </div>

      {error && <div className="admin-error">{error}</div>}

      {showForm && (
        <div className="modal-overlay" onClick={() => resetForm()}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{editingDoc ? 'Upraviť dokument' : 'Nový dokument'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Názov dokumentu</label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
                  required
                  disabled={isSubmitting}
                />
              </div>

              {!editingDoc && (
                <div className="form-group">
                  <label htmlFor="file">PDF súbor</label>
                  <input
                    type="file"
                    id="file"
                    accept=".pdf"
                    onChange={e => setFile(e.target.files?.[0] || null)}
                    required
                    disabled={isSubmitting}
                  />
                </div>
              )}

              <div className="form-group">
                <label htmlFor="tags">Tagy (oddelené čiarkou)</label>
                <input
                  type="text"
                  id="tags"
                  value={formData.tags}
                  onChange={e => setFormData(f => ({ ...f, tags: e.target.value }))}
                  placeholder="napr. zápisnica, rada školy"
                  disabled={isSubmitting}
                />
              </div>

              <div className="modal-actions">
                <button type="button" onClick={resetForm} disabled={isSubmitting}>
                  Zrušiť
                </button>
                <button type="submit" className="primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Ukladám...' : (editingDoc ? 'Uložiť' : 'Vytvoriť')}
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
              <th>Dátum pridania</th>
              <th>Tagy</th>
              <th>Akcie</th>
            </tr>
          </thead>
          <tbody>
            {documents.map(doc => (
              <tr key={doc.id}>
                <td>
                  <a href={doc.filePath} target="_blank" rel="noopener noreferrer">
                    {doc.name}
                  </a>
                </td>
                <td>{new Date(doc.dateAdded).toLocaleDateString('sk-SK')}</td>
                <td>
                  {doc.tags.map(tag => (
                    <span key={tag} className="tag">{tag}</span>
                  ))}
                </td>
                <td className="actions">
                  <button onClick={() => handleEdit(doc)} className="edit-btn">
                    Upraviť
                  </button>
                  <button onClick={() => handleDelete(doc)} className="delete-btn">
                    Zmazať
                  </button>
                </td>
              </tr>
            ))}
            {documents.length === 0 && (
              <tr>
                <td colSpan={4} className="empty-state">
                  Žiadne dokumenty
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
