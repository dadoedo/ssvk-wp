export interface Document {
  id: string
  filename: string  // Cesta k súboru v public priečinku (napr. '/pdfs/nazov.pdf')
  name: string      // Názov dokumentu zobrazený v zozname
  dateAdded: string // Dátum pridania vo formáte YYYY-MM-DD
  tags: string[]    // Tagy pre filtrovanie (môže byť prázdne pole)
}

/**
 * Zoznam dokumentov na povinné zverejňovanie
 * 
 * Pre pridanie nového dokumentu:
 * 1. Nahraj PDF do priečinka /public/pdfs/
 * 2. Pridaj nový objekt do tohto poľa
 */
export const documents: Document[] = [
  {
    id: '1',
    filename: '/pdfs/vyhlasenie-volieb-sp-02-2026.pdf',
    name: 'Vyhlásenie volieb Školského parlamentu',
    dateAdded: '2026-02-06',
    tags: ['voľby', 'školský parlament'],
  },
  // Pridaj ďalšie dokumenty tu...
]
