import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../api/client';
import type { User, Role } from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';

export function UsersAdminPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'SCHOOL_ADMIN' as Role,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadUsers = async () => {
    try {
      const userList = await adminApi.listUsers();
      setUsers(userList);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chyba pri načítaní používateľov');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const resetForm = () => {
    setFormData({ name: '', email: '', password: '', role: 'SCHOOL_ADMIN' });
    setEditingUser(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      if (editingUser) {
        const updateData: { name?: string; email?: string; password?: string; role?: Role } = {
          name: formData.name,
          email: formData.email,
          role: formData.role,
        };
        if (formData.password) {
          updateData.password = formData.password;
        }
        await adminApi.updateUser(editingUser.id, updateData);
      } else {
        await adminApi.createUser(formData);
      }

      resetForm();
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chyba pri ukladaní');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
    });
    setShowForm(true);
  };

  const handleDelete = async (user: User) => {
    if (user.id === currentUser?.id) {
      setError('Nemôžete zmazať svoj vlastný účet');
      return;
    }
    if (!confirm(`Naozaj chcete zmazať používateľa "${user.name}"?`)) return;

    try {
      await adminApi.deleteUser(user.id);
      await loadUsers();
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
        <h1>Používatelia</h1>
        <button onClick={() => setShowForm(true)} className="add-button">
          + Pridať používateľa
        </button>
      </div>

      {error && <div className="admin-error">{error}</div>}

      {showForm && (
        <div className="modal-overlay" onClick={() => resetForm()}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{editingUser ? 'Upraviť používateľa' : 'Nový používateľ'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Meno</label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">E-mail</label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={e => setFormData(f => ({ ...f, email: e.target.value }))}
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">
                  Heslo {editingUser && '(ponechajte prázdne pre zachovanie)'}
                </label>
                <input
                  type="password"
                  id="password"
                  value={formData.password}
                  onChange={e => setFormData(f => ({ ...f, password: e.target.value }))}
                  required={!editingUser}
                  minLength={8}
                  disabled={isSubmitting}
                />
              </div>

              <div className="form-group">
                <label htmlFor="role">Rola</label>
                <select
                  id="role"
                  value={formData.role}
                  onChange={e => setFormData(f => ({ ...f, role: e.target.value as Role }))}
                  disabled={isSubmitting}
                >
                  <option value="SCHOOL_ADMIN">Správca školy</option>
                  <option value="ADMIN">Administrátor</option>
                </select>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={resetForm} disabled={isSubmitting}>
                  Zrušiť
                </button>
                <button type="submit" className="primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Ukladám...' : (editingUser ? 'Uložiť' : 'Vytvoriť')}
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
              <th>Meno</th>
              <th>E-mail</th>
              <th>Rola</th>
              <th>Akcie</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>
                  <span className={`role-badge role-${user.role.toLowerCase()}`}>
                    {user.role === 'ADMIN' ? 'Administrátor' : 'Správca školy'}
                  </span>
                </td>
                <td className="actions">
                  <button onClick={() => handleEdit(user)} className="edit-btn">
                    Upraviť
                  </button>
                  <button
                    onClick={() => handleDelete(user)}
                    className="delete-btn"
                    disabled={user.id === currentUser?.id}
                  >
                    Zmazať
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={4} className="empty-state">
                  Žiadni používatelia
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
