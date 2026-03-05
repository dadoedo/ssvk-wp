import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { articlesApi, tagsApi } from '../api/client';
import type { Article, Tag } from '../api/client';

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
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [articlesData, tagsData] = await Promise.all([
          articlesApi.list({ tag: selectedTag || undefined }),
          tagsApi.list(),
        ]);
        setArticles(articlesData);
        setTags(tagsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Chyba pri načítaní');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [selectedTag]);

  if (isLoading) {
    return (
      <main className="articles-page">
        <p>Načítavam...</p>
      </main>
    );
  }

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

      {tags.length > 0 && (
        <div className="articles-filter">
          <button
            className={`articles-filter-tag ${selectedTag === null ? 'active' : ''}`}
            onClick={() => setSelectedTag(null)}
          >
            Všetky
          </button>
          {tags.map(tag => (
            <button
              key={tag.id}
              className={`articles-filter-tag ${selectedTag === tag.slug ? 'active' : ''}`}
              onClick={() => setSelectedTag(tag.slug)}
            >
              {tag.name}
            </button>
          ))}
        </div>
      )}

      {articles.length > 0 ? (
        <div className="articles-list">
          {articles.map(article => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      ) : (
        <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
          Žiadne články
        </p>
      )}
    </main>
  );
}
