import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { pagesApi } from '../api/client'

interface PageTreeItem {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  sortOrder: number;
  parentId: string | null;
  children: PageTreeItem[];
}

interface School {
  id: string
  name: string
  shortName: string
  url: string
  logo: string
  color: string
}

interface MenuItem {
  label: string
  href?: string
  external?: boolean
  children?: MenuItem[]
}

interface NavbarProps {
  schools: School[]
}

const ziackeKnizkySubmenu: MenuItem[] = [
  { label: 'Edupage GAHSVK', href: 'https://gahsvk.edupage.org/login/', external: true },
  { label: 'Edupage SOSVK', href: 'https://sosvk.edupage.org/login/', external: true },
  { label: 'Edupage SOSZEL', href: 'https://sos-zelovce.edupage.org/', external: true },
  { label: 'Edupage SSMK', href: 'https://ssmk.edupage.org/', external: true },
]

function hasPublishedDescendant(page: PageTreeItem): boolean {
  if (page.published) return true
  return page.children?.some(child => hasPublishedDescendant(child)) || false
}

function pageTreeToMenuItem(page: PageTreeItem, parentPath = ''): MenuItem | null {
  const fullPath = parentPath ? `${parentPath}/${page.slug}` : page.slug
  const href = page.published ? `/stranka/${fullPath}` : undefined
  
  const visibleChildren = page.children?.filter(child => hasPublishedDescendant(child)) || []
  const childMenuItems = visibleChildren
    .map(child => pageTreeToMenuItem(child, fullPath))
    .filter((item): item is MenuItem => item !== null)
  
  if (childMenuItems.length > 0) {
    return {
      label: page.title,
      href,
      children: childMenuItems,
    }
  }
  
  if (page.published) {
    return {
      label: page.title,
      href,
    }
  }
  
  return null
}

function buildMenu(pages: PageTreeItem[]): MenuItem[] {
  const oNasPage = pages.find(p => p.slug === 'o-nas')
  const studiumPage = pages.find(p => p.slug === 'studium')

  const oNasVisibleChildren = oNasPage?.children.filter(c => hasPublishedDescendant(c)) || []
  const oNasChildren: MenuItem[] = oNasVisibleChildren
    .map(child => pageTreeToMenuItem(child, 'o-nas'))
    .filter((item): item is MenuItem => item !== null)
  oNasChildren.push({ label: 'Dokumenty', href: '/pz' })

  const studiumVisibleChildren = studiumPage?.children.filter(c => hasPublishedDescendant(c)) || []
  const studiumChildren: MenuItem[] = studiumVisibleChildren
    .map(child => pageTreeToMenuItem(child, 'studium'))
    .filter((item): item is MenuItem => item !== null)
  studiumChildren.push({ label: 'Žiacke knižky', children: ziackeKnizkySubmenu })

  return [
    { label: 'Domov', href: '/' },
    { 
      label: 'O nás', 
      href: oNasPage?.published ? '/stranka/o-nas' : undefined,
      children: oNasChildren,
    },
    { 
      label: 'Štúdium', 
      href: studiumPage?.published ? '/stranka/studium' : undefined,
      children: studiumChildren,
    },
    { label: 'Kontakt', href: '/#kontakt' },
  ]
}

export function Navbar({ schools }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null)
  const [mobileAccordion, setMobileAccordion] = useState<string | null>(null)
  const [menuConfig, setMenuConfig] = useState<MenuItem[]>(() => buildMenu([]))
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    pagesApi.tree(true).then((pages: PageTreeItem[]) => {
      setMenuConfig(buildMenu(pages))
    }).catch(console.error)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  const handleContactClick = (e: React.MouseEvent) => {
    e.preventDefault()
    setMenuOpen(false)
    setOpenDropdown(null)
    
    if (location.pathname === '/') {
      const contactSection = document.getElementById('kontakt')
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' })
      }
    } else {
      navigate('/')
      setTimeout(() => {
        const contactSection = document.getElementById('kontakt')
        if (contactSection) {
          contactSection.scrollIntoView({ behavior: 'smooth' })
        }
      }, 100)
    }
  }

  const handleLinkClick = (item: MenuItem, e?: React.MouseEvent) => {
    if (item.href === '/#kontakt') {
      handleContactClick(e!)
      return
    }
    setMenuOpen(false)
    setOpenDropdown(null)
    setOpenSubmenu(null)
  }

  const renderMenuItem = (item: MenuItem, depth = 0) => {
    const hasChildren = item.children && item.children.length > 0
    const isOpen = depth === 0 ? openDropdown === item.label : openSubmenu === item.label

    if (hasChildren) {
      return (
        <li 
          key={item.label} 
          className={`nav-dropdown ${isOpen ? 'open' : ''}`}
          onMouseEnter={() => depth === 0 ? setOpenDropdown(item.label) : setOpenSubmenu(item.label)}
          onMouseLeave={() => depth === 0 ? setOpenDropdown(null) : setOpenSubmenu(null)}
        >
          <div className="nav-dropdown-trigger">
            {item.href ? (
              <Link to={item.href} className="nav-dropdown-link" onClick={() => handleLinkClick(item)}>
                {item.label}
              </Link>
            ) : (
              <span className="nav-dropdown-label">{item.label}</span>
            )}
            <svg className="dropdown-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </div>
          <ul className={`nav-dropdown-menu ${depth > 0 ? 'submenu' : ''}`}>
            {item.children!.map(child => renderMenuItem(child, depth + 1))}
          </ul>
        </li>
      )
    }

    if (item.external) {
      return (
        <li key={item.label}>
          <a 
            href={item.href} 
            target="_blank" 
            rel="noopener noreferrer"
            onClick={() => handleLinkClick(item)}
          >
            {item.label}
            <svg className="external-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" />
            </svg>
          </a>
        </li>
      )
    }

    if (item.href === '/#kontakt') {
      return (
        <li key={item.label}>
          <a href="#kontakt" onClick={handleContactClick}>
            {item.label}
          </a>
        </li>
      )
    }

    return (
      <li key={item.label}>
        <Link to={item.href!} onClick={() => handleLinkClick(item)}>
          {item.label}
        </Link>
      </li>
    )
  }

  const renderMobileMenuItem = (item: MenuItem, depth = 0) => {
    const hasChildren = item.children && item.children.length > 0
    const isOpen = mobileAccordion === item.label

    if (hasChildren) {
      return (
        <div key={item.label} className="mobile-accordion">
          <div className={`mobile-accordion-trigger ${isOpen ? 'open' : ''}`}>
            {item.href ? (
              <Link 
                to={item.href} 
                className="mobile-accordion-link"
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            ) : (
              <span className="mobile-accordion-label">{item.label}</span>
            )}
            <button 
              className="mobile-accordion-toggle"
              onClick={() => setMobileAccordion(isOpen ? null : item.label)}
              aria-label={isOpen ? 'Zavrieť' : 'Otvoriť'}
            >
              <svg className="accordion-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
          </div>
          {isOpen && (
            <div className="mobile-accordion-content">
              {item.children!.map(child => renderMobileMenuItem(child, depth + 1))}
            </div>
          )}
        </div>
      )
    }

    if (item.external) {
      return (
        <a
          key={item.label}
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          className="mobile-menu-link"
          style={{ paddingLeft: `${depth * 16 + 16}px` }}
          onClick={() => setMenuOpen(false)}
        >
          {item.label}
          <svg className="external-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" />
          </svg>
        </a>
      )
    }

    if (item.href === '/#kontakt') {
      return (
        <a
          key={item.label}
          href="#kontakt"
          className="mobile-menu-link"
          style={{ paddingLeft: `${depth * 16 + 16}px` }}
          onClick={handleContactClick}
        >
          {item.label}
        </a>
      )
    }

    return (
      <Link
        key={item.label}
        to={item.href!}
        className="mobile-menu-link"
        style={{ paddingLeft: `${depth * 16 + 16}px` }}
        onClick={() => setMenuOpen(false)}
      >
        {item.label}
      </Link>
    )
  }

  return (
    <>
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="navbar-container">
          <Link to="/" className="navbar-logo">
            <img src="/images/logo.svg" alt="SSVK" />
            <span>Stredné školy VK</span>
          </Link>

          <button 
            className={`menu-toggle ${menuOpen ? 'active' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          <ul className="navbar-menu">
            {menuConfig.map(item => renderMenuItem(item))}
            <li className="nav-divider"></li>
            {schools.map((school) => (
              <li key={school.id}>
                <a 
                  href={school.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ '--item-color': school.color } as React.CSSProperties}
                  className="school-link"
                >
                  <span className="school-dot"></span>
                  {school.shortName}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      <div 
        className={`mobile-menu-overlay ${menuOpen ? 'open' : ''}`}
        onClick={() => setMenuOpen(false)}
      >
        <button 
          className="mobile-menu-close"
          onClick={() => setMenuOpen(false)}
          aria-label="Zavrieť menu"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
        <div className="mobile-menu-content" onClick={(e) => e.stopPropagation()}>
          <div className="mobile-menu-header">
            <img src="/images/logo.svg" alt="SSVK" className="mobile-menu-logo" />
            <span>Navigácia</span>
          </div>
          <nav className="mobile-menu-nav">
            {menuConfig.map(item => renderMobileMenuItem(item))}
            
            <div className="mobile-menu-divider">
              <span>Školy</span>
            </div>
            {schools.map((school) => (
              <a
                key={school.id}
                href={school.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mobile-menu-link mobile-menu-school"
                style={{ '--school-color': school.color } as React.CSSProperties}
                onClick={() => setMenuOpen(false)}
              >
                <img src={school.logo} alt={school.shortName} className="mobile-menu-school-logo" />
                <div className="mobile-menu-school-info">
                  <span className="mobile-menu-school-name">{school.name}</span>
                  <span className="mobile-menu-school-url">Navštíviť web →</span>
                </div>
              </a>
            ))}
          </nav>
        </div>
      </div>
    </>
  )
}
