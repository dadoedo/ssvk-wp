# Ako pridať dokumenty na stránku Povinné zverejňovanie

## Postup

### 1. Nahraj PDF súbor
Skopíruj PDF súbor do priečinka:
```
landing-page/public/pdfs/
```

Príklad:
```bash
cp dokument.pdf landing-page/public/pdfs/
```

### 2. Pridaj záznam do zoznamu dokumentov
Otvor súbor:
```
landing-page/src/data/documents.ts
```

Pridaj nový objekt do poľa `documents`:
```typescript
{
  id: '2',  // Unikátne ID (postupne čísluj)
  filename: '/pdfs/nazov-dokumentu.pdf',  // Cesta k súboru
  name: 'Názov dokumentu zobrazený na stránke',
  dateAdded: '2026-02-06',  // Dátum vo formáte YYYY-MM-DD
  tags: ['kategória1', 'kategória2'],  // Tagy pre filtrovanie (alebo prázdne pole [])
},
```

### 3. Build a deploy
```bash
cd landing-page
npm run build
```

Výsledný priečinok `dist` skopíruj na produkčný server.

## Príklad

Ak chceš pridať dokument "Výročná správa 2025":

1. **Nahraj súbor:**
   ```
   landing-page/public/pdfs/vyrocna-sprava-2025.pdf
   ```

2. **Pridaj do `documents.ts`:**
   ```typescript
   {
     id: '2',
     filename: '/pdfs/vyrocna-sprava-2025.pdf',
     name: 'Výročná správa za rok 2025',
     dateAdded: '2026-02-10',
     tags: ['výročná správa', 'správy'],
   },
   ```

3. **Build:**
   ```bash
   npm run build
   ```

## URL stránky

Stránka bude dostupná na:
- Produkcia: `https://vasa-domena.sk/#/pz`
- Localhost: `http://localhost:5173/#/pz`

(Používame HashRouter, takže URL obsahuje `#`)

## Kategórie (tags)

Kategórie sa automaticky zobrazujú vo filtri na základe tagov v dokumentoch.
Ak chceš pridať novú kategóriu, jednoducho ju pridaj do poľa `tags` pri dokumente.

## Poznámky

- Dokumenty sú zoradené podľa dátumu (najnovšie prvé)
- Používatelia môžu filtrovať podľa kategórií
- Všetko je statické, bez backendu
- Po zmene v `documents.ts` je potrebné spustiť `npm run build`
