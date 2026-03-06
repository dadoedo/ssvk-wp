import { Link } from 'react-router-dom';

interface SidebarItem {
  id: string;
  title: string;
  slug: string;
}

interface PageSidebarProps {
  parent: SidebarItem | null;
  current: { id: string; title: string; slug: string };
  siblings: SidebarItem[];
  children: SidebarItem[];
  basePath: string;
}

export function PageSidebar({ parent, current, siblings, children, basePath }: PageSidebarProps) {
  const parentPath = basePath.split('/').slice(0, -1).join('/');

  return (
    <aside className="page-sidebar">
      <nav>
        {parent && (
          <div className="sidebar-section">
            <Link to={`/stranka/${parentPath}`} className="sidebar-parent">
              ← {parent.title}
            </Link>
          </div>
        )}

        {siblings.length > 0 && (
          <div className="sidebar-section">
            <ul className="sidebar-list">
              {siblings.map(sibling => (
                <li key={sibling.id}>
                  <Link
                    to={`/stranka/${parentPath ? `${parentPath}/${sibling.slug}` : sibling.slug}`}
                    className={sibling.id === current.id ? 'active' : ''}
                  >
                    {sibling.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {children.length > 0 && (
          <div className="sidebar-section sidebar-children">
            <span className="sidebar-label">Podstránky</span>
            <ul className="sidebar-list">
              {children.map(child => (
                <li key={child.id}>
                  <Link to={`/stranka/${basePath}/${child.slug}`}>
                    {child.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </nav>
    </aside>
  );
}
