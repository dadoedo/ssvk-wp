import { useState, useEffect } from 'react'
import { documentsApi } from '../api/client'
import type { Document } from '../api/client'
import { documents as staticDocuments } from '../data/documents'

export function PovinneZverejnovaniePage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTag, setSelectedTag] = useState<string>('all')
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest')

  useEffect(() => {
    documentsApi.list()
      .then(docs => {
        setDocuments(docs)
      })
      .catch(() => {
        // Fallback to static data if API is not available
        setDocuments(staticDocuments.map(doc => ({
          id: doc.id,
          name: doc.name,
          filename: doc.filename.split('/').pop() || doc.filename,
          filePath: doc.filename,
          dateAdded: doc.dateAdded,
          tags: doc.tags,
          createdBy: null,
          updatedAt: doc.dateAdded,
        })))
      })
      .finally(() => setIsLoading(false))
  }, [])

  // Get all unique tags from documents
  const allTags = Array.from(new Set(documents.flatMap(doc => doc.tags)))

  // Filter and sort documents
  const filteredDocuments = documents
    .filter(doc => selectedTag === 'all' || doc.tags.includes(selectedTag))
    .sort((a, b) => {
      const dateA = new Date(a.dateAdded).getTime()
      const dateB = new Date(b.dateAdded).getTime()
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB
    })

  return (
    <main>
      {/* Povinné zverejňovanie sekcia */}
      <section className="documents-section">
        <div className="documents-container">
          <h1 className="documents-title">Povinné zverejňovanie</h1>
          
          {/* Filters */}
          <div className="documents-filters">
            <div className="filter-group">
              <label htmlFor="tag-filter" className="filter-label">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
                  <path d="M7 7h.01" />
                </svg>
                Kategória
              </label>
              <select
                id="tag-filter"
                className="filter-select"
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
              >
                <option value="all">Všetky</option>
                {allTags.map(tag => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="sort-order" className="filter-label">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 6h18M3 12h12M3 18h6" />
                </svg>
                Zoradiť
              </label>
              <select
                id="sort-order"
                className="filter-select"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
              >
                <option value="newest">Najnovšie</option>
                <option value="oldest">Najstaršie</option>
              </select>
            </div>
          </div>

          {/* Documents list */}
          <div className="documents-list">
            {isLoading ? (
              <div className="documents-empty">
                <p>Načítavam dokumenty...</p>
              </div>
            ) : filteredDocuments.length === 0 ? (
              <div className="documents-empty">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p>Nenašli sa žiadne dokumenty.</p>
              </div>
            ) : (
              filteredDocuments.map(doc => (
                <a
                  key={doc.id}
                  href={doc.filePath}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="document-card"
                >
                  <div className="document-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      <path d="M12 3v6h6" />
                    </svg>
                  </div>
                  <div className="document-content">
                    <h3 className="document-name">{doc.name}</h3>
                    <div className="document-meta">
                      <span className="document-date">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                          <path d="M16 2v4M8 2v4M3 10h18" />
                        </svg>
                        {new Date(doc.dateAdded).toLocaleDateString('sk-SK')}
                      </span>
                      {doc.tags.length > 0 && (
                        <div className="document-tags">
                          {doc.tags.map(tag => (
                            <span key={tag} className="document-tag">{tag}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="document-action">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
                    </svg>
                  </div>
                </a>
              ))
            )}
          </div>

          {/* Info box */}
          <div className="documents-info">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4M12 8h.01" />
            </svg>
            <p>Dokumenty sú uložené vo formáte PDF. Pre ich zobrazenie potrebujete PDF prehliadač.</p>
          </div>
        </div>
      </section>
    </main>
  )
}
