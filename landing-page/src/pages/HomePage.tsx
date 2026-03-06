import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { articlesApi } from '../api/client'
import type { Article } from '../api/client'

interface School {
  id: string
  name: string
  url: string
  logo: string
  position: string
  color: string
  textColor: string
}

interface HomePageProps {
  schools: School[]
}

function ArticleCard({ article }: { article: Article }) {
  return (
    <Link to={`/clanky/${article.slug}`} className="article-card">
      <div className="article-card-image">
        {article.coverImage ? (
          <img src={article.coverImage} alt={article.title} />
        ) : (
          <div className="article-card-image-placeholder">📝</div>
        )}
      </div>
      <div className="article-card-content">
        <div className="article-card-meta">
          <span>
            {article.publishedAt
              ? new Date(article.publishedAt).toLocaleDateString('sk-SK')
              : new Date(article.createdAt).toLocaleDateString('sk-SK')}
          </span>
        </div>
        <h3 className="article-card-title">{article.title}</h3>
        {article.excerpt && (
          <p className="article-card-excerpt">{article.excerpt}</p>
        )}
        <span className="article-card-cta">
          Čítať viac →
        </span>
      </div>
    </Link>
  )
}

export function HomePage({ schools }: HomePageProps) {
  const [articles, setArticles] = useState<Article[]>([])
  const [articlesLoading, setArticlesLoading] = useState(true)

  useEffect(() => {
    const loadArticles = async () => {
      try {
        const { articles } = await articlesApi.list({ limit: 3 })
        setArticles(articles)
      } catch (error) {
        console.error('Failed to load articles:', error)
      } finally {
        setArticlesLoading(false)
      }
    }

    loadArticles()
  }, [])

  return (
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

      {/* Články sekcia */}
      {!articlesLoading && articles.length > 0 && (
        <section className="articles-section">
          <div className="articles-section-container">
            <div className="articles-section-header">
              <h2>Posledné pridané články</h2>
              <Link to="/clanky" className="articles-section-link">
                Všetky články →
              </Link>
            </div>
            <div className="articles-grid">
              {articles.map(article => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          </div>
        </section>
      )}

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
          </div>
        </div>
      </section>
    </main>
  )
}
