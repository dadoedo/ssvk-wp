import { Link } from 'react-router-dom';

interface BreadcrumbItem {
  id?: string;
  title: string;
  slug: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  currentTitle: string;
}

export function Breadcrumbs({ items, currentTitle }: BreadcrumbsProps) {
  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      <ol>
        <li>
          <Link to="/">Domov</Link>
        </li>
        {items.map((item, index) => {
          const path = items.slice(0, index + 1).map(i => i.slug).join('/');
          return (
            <li key={item.id || item.slug}>
              <span className="breadcrumb-separator">/</span>
              <Link to={`/stranka/${path}`}>{item.title}</Link>
            </li>
          );
        })}
        <li>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">{currentTitle}</span>
        </li>
      </ol>
    </nav>
  );
}
