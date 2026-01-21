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
    url: 'https://sosvk.edupage.org/',
    logo: '/images/sos-vk-logo-clean.png',
    position: 'top-right',
    color: '#26AA4B',
    textColor: '#ffffff',
  },
  {
    id: 'sosz',
    name: 'SOŠ Želovce',
    shortName: 'SOŠŽ',
    url: 'https://soszelovce.edupage.org/',
    logo: '/images/sosz-logo-clean.png',
    position: 'bottom-left',
    color: '#1781BD',
    textColor: '#ffffff',
  },
  {
    id: 'ssmk',
    name: 'Spojená škola Modrý Kameň',
    shortName: 'SŠMK',
    url: 'https://ssmk.edupage.org/',
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
              <a href="/" onClick={() => setMenuOpen(false)}>
                Domov
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
        
        {/* Mobile overlay */}
        <div 
          className={`mobile-overlay ${menuOpen ? 'visible' : ''}`}
          onClick={() => setMenuOpen(false)}
        ></div>
      </nav>

      {/* Main Content */}
      <main>
        <section className="hero">
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
