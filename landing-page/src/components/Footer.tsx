interface School {
  id: string
  shortName: string
  url: string
  color: string
}

interface FooterProps {
  schools: School[]
}

export function Footer({ schools }: FooterProps) {
  return (
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
  )
}
