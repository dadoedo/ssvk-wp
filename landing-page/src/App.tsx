import { useState, useEffect } from 'react'
import './App.css'

// Dáta škôl - aktualizuj URL podľa potreby
const schools = [
  {
    id: 'gahsvk',
    name: 'Gymnázium A. H. Škultétyho',
    shortName: 'GAHŠVK',
    url: 'https://gahsvk.edupage.org/',
    logo: '/images/gahsvk-logo-clean.png',
    position: 'top-left',
    color: '#FED512',
    textColor: '#1e293b',
  },
  {
    id: 'sosvk',
    name: 'SOŠ Veľký Krtíš',
    shortName: 'SOŠ VK',
    url: 'http://www.sos-vk.sk/',
    logo: '/images/sos-vk-logo-clean.png',
    position: 'top-right',
    color: '#26AA4B',
    textColor: '#ffffff',
  },
  {
    id: 'sosz',
    name: 'SOŠ Želovce',
    shortName: 'SOŠŽ',
    url: 'https://sos-zelovce.edupage.org/',
    logo: '/images/sosz-logo-clean.png',
    position: 'bottom-left',
    color: '#1781BD',
    textColor: '#ffffff',
  },
  {
    id: 'ssmk',
    name: 'Spojená škola Modrý Kameň',
    shortName: 'SŠMK',
    url: 'https://ssmk.sk/',
    logo: '/images/ssmk-logo-clean.png',
    position: 'bottom-right',
    color: '#F58825',
    textColor: '#ffffff',
  },
]

function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

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

  return (
    <>
      {/* Navbar */}
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="navbar-container">
          <a href="/" className="navbar-logo">
            <img src="/images/logo.svg" alt="SSVK" />
            <span>Stredné školy VK</span>
          </a>

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
              <a href="#domov" onClick={() => setMenuOpen(false)}>
                Domov
              </a>
            </li>
            <li>
              <a href="#kontakt" onClick={() => setMenuOpen(false)}>
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
            <a href="#domov" onClick={() => setMenuOpen(false)} className="mobile-menu-link">
              <span className="mobile-menu-icon">🏠</span>
              Domov
            </a>
            <a href="#kontakt" onClick={() => setMenuOpen(false)} className="mobile-menu-link">
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

      {/* Main Content */}
      <main>
        <section id="domov" className="hero">
          <div className="hero-content">
            <h1 className="hero-title">Stredné školy okresu Veľký Krtíš</h1>
            <p className="hero-subtitle">
              Vitajte na spoločnom portáli stredných škôl v zriaďovateľskej pôsobnosti 
              Banskobystrického samosprávneho kraja v okrese Veľký Krtíš.
            </p>
          </div>

          {/* Štvorlistok */}
          <div className="stvorlistok-wrapper">
            <div className="stvorlistok-container">
              <div className="stvorlistok-svg">
                <img src="/images/logo.svg" alt="Štvorlistok škôl" />
              </div>
              
              <div className="stvorlistok-zones">
                {schools.map((school) => (
                  <a
                    key={school.id}
                    href={school.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`leaf-zone zone-${school.position}`}
                    style={{
                      '--hover-color': school.color,
                      '--hover-text': school.textColor,
                    } as React.CSSProperties}
                    title={school.name}
                  >
                    <img 
                      src={school.logo} 
                      alt={school.name}
                      className="zone-logo"
                    />
                    <span className="zone-title">{school.name}</span>
                  </a>
                ))}
              </div>
            </div>

            <div className="stvorlistok-hint">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
              </svg>
              Klikni na logo školy pre prechod na jej stránku
            </div>
          </div>
        </section>

        {/* Kontakt sekcia */}
        <section id="kontakt" className="contact-section">
          <div className="contact-container">
            <h2 className="contact-title">Kontakt</h2>
            <div className="contact-card">
              <div className="contact-header">
                <img src="/images/logo.svg" alt="SSVK" className="contact-logo" />
                <div className="contact-header-text">
                  <h3>Gymnázium Augusta Horislava Škultétyho, Obchodná akadémia a Stredná odborná škola</h3>
                </div>
              </div>
              
              <div className="contact-grid">
                <div className="contact-item">
                  <div className="contact-icon">📍</div>
                  <div className="contact-info">
                    <span className="contact-label">Adresa</span>
                    <span className="contact-value">Školská 21, 990 01 Veľký Krtíš</span>
                  </div>
                </div>
                
                <div className="contact-item">
                  <div className="contact-icon">🏢</div>
                  <div className="contact-info">
                    <span className="contact-label">IČO</span>
                    <span className="contact-value">57 046 492</span>
                  </div>
                </div>
                
                <div className="contact-item">
                  <div className="contact-icon">📞</div>
                  <div className="contact-info">
                    <span className="contact-label">Sekretariát školy</span>
                    <a href="tel:+421474870271" className="contact-value contact-link">047 / 48 702 71</a>
                  </div>
                </div>
                
                <div className="contact-item">
                  <div className="contact-icon">✉️</div>
                  <div className="contact-info">
                    <span className="contact-label">E-mail</span>
                    <a href="mailto:sekretariat@ssvk.sk" className="contact-value contact-link">sekretariat@ssvk.sk</a>
                  </div>
                </div>
              </div>

              <div className="contact-footer">
                <div className="contact-zriadovatel">
                  <span className="contact-label">Zriaďovateľ</span>
                  <span className="contact-value">Banskobystrický samosprávny kraj</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-eu">
            <p className="footer-eu-text">Projekt je spolufinancovaný:</p>
            <img 
              src="/images/eu-logo.png" 
              alt="Spolufinancovaný Európskou úniou - Program Slovensko - Ministerstvo školstva, výskumu, vývoja a mládeže SR" 
              className="footer-eu-logo"
            />
          </div>

          <div className="footer-divider"></div>

          <div className="footer-bottom">
            <div className="footer-links">
              {schools.map((school) => (
                <a
                  key={school.id}
                  href={school.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ '--item-color': school.color } as React.CSSProperties}
                >
                  <span className="school-dot"></span>
                  {school.shortName}
                </a>
              ))}
            </div>
            <p className="footer-copyright">
              © {new Date().getFullYear()} Stredné školy okresu Veľký Krtíš. Všetky práva vyhradené.
            </p>
          </div>
        </div>
      </footer>
    </>
  )
}

export default App
