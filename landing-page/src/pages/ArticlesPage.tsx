import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { articlesApi, tagsApi } from '../api/client';
import type { Article, Tag } from '../api/client';

const ARTICLES_PER_PAGE = 12;

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
          <span>{article.author.name}</span>
          <span>•</span>
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
        {article.tags.length > 0 && (
          <div className="article-card-tags">
            {article.tags.slice(0, 3).map(tag => (
              <span key={tag.id} className="article-card-tag">{tag.name}</span>
            ))}
          </div>
        )}
        <span className="article-card-cta">
          Čítať viac →
        </span>
      </div>
    </Link>
  );
}

export function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [total, setTotal] = useState(0);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const needsTags = tags.length === 0;
      const [articlesRes, tagsData] = await Promise.all([
        articlesApi.list({
          tag: selectedTag || undefined,
          limit: ARTICLES_PER_PAGE,
          page,
          q: search || undefined,
        }),
        needsTags ? tagsApi.list() : Promise.resolve([] as Tag[]),
      ]);
      setArticles(articlesRes.articles);
      setTotal(articlesRes.total);
      if (needsTags) setTags(tagsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chyba pri načítaní');
    } finally {
      setIsLoading(false);
    }
  }, [selectedTag, page, search, tags.length]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput.trim());
    setPage(1);
  };

  const totalPages = Math.ceil(total / ARTICLES_PER_PAGE) || 1;

  if (error) {
    return (
      <main className="articles-page">
        <p style={{ color: 'red' }}>{error}</p>
      </main>
    );
  }

  return (
    <main className="articles-page">
      <h1>Články</h1>

      <div className="articles-toolbar">
        <form className="articles-search" onSubmit={handleSearch}>
          <div className="articles-search-bar">
            <input
              type="search"
              placeholder="Hľadať v článkoch..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="articles-search-input"
              aria-label="Hľadať v článkoch"
            />
            <button type="submit" className="articles-search-btn" aria-label="Hľadať">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </button>
          </div>
        </form>

        {tags.length > 0 && (
          <div className="articles-filter">
            <button
              className={`articles-filter-tag ${selectedTag === null ? 'active' : ''}`}
              onClick={() => { setSelectedTag(null); setPage(1); }}
            >
              Všetky
            </button>
            {tags.map(tag => (
              <button
                key={tag.id}
                className={`articles-filter-tag ${selectedTag === tag.slug ? 'active' : ''}`}
                onClick={() => { setSelectedTag(tag.slug); setPage(1); }}
              >
                {tag.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {isLoading ? (
        <p style={{ textAlign: 'center', padding: '2rem' }}>Načítavam...</p>
      ) : articles.length > 0 ? (
        <>
          <div className="articles-list">
            {articles.map(article => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
          {totalPages > 1 && (
            <nav className="articles-pagination" aria-label="Stránkovanie článkov">
              <button
                className="articles-pagination-btn"
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
              >
                ← Predchádzajúca
              </button>
              <span className="articles-pagination-info">
                Strana {page} z {totalPages} ({total} článkov)
              </span>
              <button
                className="articles-pagination-btn"
                disabled={page >= totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              >
                Ďalšia →
              </button>
            </nav>
          )}
        </>
      ) : (
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
          {search || selectedTag ? 'Žiadne články nezodpovedajú filtrom.' : 'Žiadne články'}
        </p>
      )}
    </main>
  );
}
