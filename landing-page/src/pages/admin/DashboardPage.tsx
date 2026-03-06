import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export function DashboardPage() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>Administrácia</h1>
        <div className="admin-user-info">
          <span>{user?.name} ({user?.role === 'ADMIN' ? 'Administrátor' : 'Správca školy'})</span>
          <button onClick={handleLogout} className="logout-button">
            Odhlásiť sa
          </button>
        </div>
      </div>

      <div className="admin-menu">
        <Link to="/admin/articles" className="admin-menu-item">
          <div className="admin-menu-icon">📝</div>
          <div className="admin-menu-content">
            <h2>Články</h2>
            <p>Správa článkov a noviniek</p>
          </div>
        </Link>

        <Link to="/admin/pages" className="admin-menu-item">
          <div className="admin-menu-icon">📑</div>
          <div className="admin-menu-content">
            <h2>Stránky</h2>
            <p>Správa obsahových stránok</p>
          </div>
        </Link>

        <Link to="/admin/documents" className="admin-menu-item">
          <div className="admin-menu-icon">📄</div>
          <div className="admin-menu-content">
            <h2>Dokumenty</h2>
            <p>Správa dokumentov na povinné zverejňovanie</p>
          </div>
        </Link>

        <Link to="/admin/tags" className="admin-menu-item">
          <div className="admin-menu-icon">🏷️</div>
          <div className="admin-menu-content">
            <h2>Tagy</h2>
            <p>Správa tagov pre články</p>
          </div>
        </Link>

        {isAdmin && (
          <Link to="/admin/users" className="admin-menu-item">
            <div className="admin-menu-icon">👥</div>
            <div className="admin-menu-content">
              <h2>Používatelia</h2>
              <p>Správa administrátorov a správcov škôl</p>
            </div>
          </Link>
        )}

        <Link to="/" className="admin-menu-item admin-menu-item-secondary">
          <div className="admin-menu-icon">🏠</div>
          <div className="admin-menu-content">
            <h2>Verejná stránka</h2>
            <p>Zobraziť verejnú stránku SSVK</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
