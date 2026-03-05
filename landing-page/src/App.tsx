import { HashRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Navbar } from './components/Navbar'
import { Footer } from './components/Footer'
import { HomePage } from './pages/HomePage'
import { PovinneZverejnovaniePage } from './pages/PovinneZverejnovaniePage'
import { ArticlesPage } from './pages/ArticlesPage'
import { ArticleDetailPage } from './pages/ArticleDetailPage'
import { DynamicPage } from './pages/DynamicPage'
import { LoginPage } from './pages/admin/LoginPage'
import { DashboardPage } from './pages/admin/DashboardPage'
import { DocumentsAdminPage } from './pages/admin/DocumentsAdminPage'
import { UsersAdminPage } from './pages/admin/UsersAdminPage'
import { ArticlesAdminPage } from './pages/admin/ArticlesAdminPage'
import { PagesAdminPage } from './pages/admin/PagesAdminPage'
import { TagsAdminPage } from './pages/admin/TagsAdminPage'
import './App.css'

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
    id: 'sosz',
    name: 'SOŠ Želovce',
    shortName: 'SOŠŽ',
    url: 'https://sos-zelovce.edupage.org/',
    logo: '/images/sosz-logo-clean.png',
    position: 'top-right',
    color: '#26AA4B',
    textColor: '#ffffff',
  },
  {
    id: 'sosvk',
    name: 'SOŠ Veľký Krtíš',
    shortName: 'SOŠ VK',
    url: 'http://www.sos-vk.sk/',
    logo: '/images/sos-vk-logo-clean.png',
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

function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar schools={schools} />
      {children}
      <Footer schools={schools} />
    </>
  )
}

function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<PublicLayout><HomePage schools={schools} /></PublicLayout>} />
          <Route path="/pz" element={<PublicLayout><PovinneZverejnovaniePage /></PublicLayout>} />
          <Route path="/clanky" element={<PublicLayout><ArticlesPage /></PublicLayout>} />
          <Route path="/clanky/:slug" element={<PublicLayout><ArticleDetailPage /></PublicLayout>} />
          <Route path="/stranka/*" element={<PublicLayout><DynamicPage /></PublicLayout>} />

          {/* Admin routes */}
          <Route path="/admin/login" element={<LoginPage />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/documents"
            element={
              <ProtectedRoute>
                <DocumentsAdminPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute requireAdmin>
                <UsersAdminPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/articles"
            element={
              <ProtectedRoute>
                <ArticlesAdminPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/pages"
            element={
              <ProtectedRoute>
                <PagesAdminPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/tags"
            element={
              <ProtectedRoute>
                <TagsAdminPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </HashRouter>
    </AuthProvider>
  )
}

export default App
