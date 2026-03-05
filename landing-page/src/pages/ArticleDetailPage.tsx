import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { articlesApi } from '../api/client';
import type { Article } from '../api/client';

export function ArticleDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadArticle = async () => {
      if (!slug) return;

      try {
        const data = await articlesApi.get(slug);
        setArticle(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Článok sa nenašiel');
      } finally {
        setIsLoading(false);
      }
    };

    loadArticle();
  }, [slug]);

  if (isLoading) {
    return (
      <main className="article-detail">
        <p>Načítavam...</p>
      </main>
    );
  }

  if (error || !article) {
    return (
      <main className="article-detail">
        <p style={{ color: 'red' }}>{error || 'Článok sa nenašiel'}</p>
        <Link to="/clanky">← Späť na články</Link>
      </main>
    );
  }

  return (
    <main className="article-detail">
      <Link to="/clanky" style={{ color: 'var(--text-muted)', marginBottom: 'var(--spacing-md)', display: 'inline-block' }}>
        ← Späť na články
      </Link>

      <header className="article-detail-header">
        <div className="article-detail-meta">
          <span>{article.author.name}</span>
          <span>•</span>
          <span>
            {article.publishedAt
              ? new Date(article.publishedAt).toLocaleDateString('sk-SK', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })
              : new Date(article.createdAt).toLocaleDateString('sk-SK', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
          </span>
        </div>
        <h1>{article.title}</h1>
        {article.tags.length > 0 && (
          <div className="article-detail-tags">
            {article.tags.map(tag => (
              <span key={tag.id} className="article-detail-tag">
                {tag.name}
              </span>
            ))}
          </div>
        )}
      </header>

      {article.coverImage && (
        <img
          src={article.coverImage}
          alt={article.title}
          className="article-detail-cover"
        />
      )}

      <div
        className="article-detail-content"
        dangerouslySetInnerHTML={{ __html: article.content }}
      />
    </main>
  );
}
