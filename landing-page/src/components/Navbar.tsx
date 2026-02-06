import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'

interface School {
  id: string
  name: string
  shortName: string
  url: string
  logo: string
  color: string
}

interface NavbarProps {
  schools: School[]
}

export function Navbar({ schools }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

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
    
    if (location.pathname === '/') {
      // Already on homepage, just scroll
      const contactSection = document.getElementById('kontakt')
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' })
      }
    } else {
      // Navigate to homepage first, then scroll
      navigate('/')
      setTimeout(() => {
        const contactSection = document.getElementById('kontakt')
        if (contactSection) {
          contactSection.scrollIntoView({ behavior: 'smooth' })
        }
      }, 100)
    }
  }

  return (
    <>
      {/* Navbar */}
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

          <ul className={`navbar-menu ${menuOpen ? 'open' : ''}`}>
            <li>
              <Link to="/" onClick={() => setMenuOpen(false)}>
                Domov
              </Link>
            </li>
            <li>
              <Link to="/pz" onClick={() => setMenuOpen(false)}>
                Povinné zverejňovanie
              </Link>
            </li>
            <li>
              <a href="#kontakt" onClick={handleContactClick}>
                Kontakt
              </a>
            </li>
            {schools.map((school) => (
              <li key={school.id}>
                <a 
                  href={school.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ '--item-color': school.color } as React.CSSProperties}
                  onClick={() => setMenuOpen(false)}
                >
                  <span className="school-dot"></span>
                  {school.shortName}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Mobile menu overlay */}
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
            <Link to="/" onClick={() => setMenuOpen(false)} className="mobile-menu-link">
              <span className="mobile-menu-icon">🏠</span>
              Domov
            </Link>
            <Link to="/pz" onClick={() => setMenuOpen(false)} className="mobile-menu-link">
              <span className="mobile-menu-icon">📄</span>
              Povinné zverejňovanie
            </Link>
            <a href="#kontakt" onClick={handleContactClick} className="mobile-menu-link">
              <span className="mobile-menu-icon">📞</span>
              Kontakt
            </a>
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
