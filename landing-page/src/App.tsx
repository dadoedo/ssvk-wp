import { HashRouter, Routes, Route } from 'react-router-dom'
import { Navbar } from './components/Navbar'
import { Footer } from './components/Footer'
import { HomePage } from './pages/HomePage'
import { PovinneZverejnovaniePage } from './pages/PovinneZverejnovaniePage'
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

function App() {
  return (
    <HashRouter>
      <Navbar schools={schools} />
      <Routes>
        <Route path="/" element={<HomePage schools={schools} />} />
        <Route path="/pz" element={<PovinneZverejnovaniePage />} />
      </Routes>
      <Footer schools={schools} />
    </HashRouter>
  )
}

export default App
