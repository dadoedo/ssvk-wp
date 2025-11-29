# SSVK WordPress Projekt

## O projekte

WordPress web pre organizáciu SSVK, ktorá spája 4 školy. Projekt kombinuje AI-generovaný frontend kód s WordPress admin rozhraním pre správu obsahu.

## Architektúra

### Koncept
- **Frontend (HTML/CSS/JS)**: Generovaný AI agentom - plná kontrola nad dizajnom a kódom
- **Backend (WordPress)**: Správa obsahu cez WP admin - články, školy, dokumenty
- **Kombinácia**: Frontend načítava obsah z WordPress databázy cez PHP funkcie

### Technológie
- **WordPress**: CMS pre správu obsahu
- **Docker**: Lokálne prostredie (docker-compose)
- **Custom WordPress téma**: `ssvk-theme` v `wp-content/themes/ssvk-theme/`
- **Custom Post Types**: Školy, Články
- **Custom Taxonomy**: Kategórie článkov (Spoločné, Škola 1-4)

## Štruktúra projektu

```
ssvk-wp/
├── docker-compose.yml          # Docker konfigurácia
├── wp-content/
│   └── themes/
│       └── ssvk-theme/         # Naša custom téma
│           ├── style.css       # Téma header
│           ├── functions.php   # WordPress funkcie, CPT, taxonomie
│           ├── header.php      # Hlavička
│           ├── footer.php      # Pätka
│           ├── front-page.php  # Homepage
│           ├── single-skola.php    # Šablóna pre školy
│           ├── single-clanok.php   # Šablóna pre články
│           ├── archive-clanok.php  # Zoznam článkov
│           └── assets/
│               ├── css/
│               │   └── main.css    # Všetky štýly (CSS premenné!)
│               └── js/
│                   └── main.js     # JavaScript
└── README.md
```

## Funkcionalita

### Homepage
- **Hero sekcia**: Názov a popis organizácie
- **Rozcestník**: Štvorlistok (2x2 grid) s 4 školami
- **Info sekcia**: Editovateľná cez WordPress stránku "info"
- **Spoločné novinky**: Posledné články s kategóriou "Spoločné"

### Školy
- Custom Post Type `skola`
- Každá škola má vlastnú podstránku
- Zobrazuje obsah školy a články pre danú školu

### Články
- Custom Post Type `clanok`
- Kategórie: Spoločné, Škola 1, Škola 2, Škola 3, Škola 4
- Filterovanie podľa kategórie
- Editovateľné cez WP admin

## Ako to funguje

### Pre užívateľa (WordPress Admin)

1. **Pridávanie škôl**
   - Příspěvky → Školy → Pridať novú
   - Názov, obrázok, popis, obsah

2. **Pridávanie článkov**
   - Články → Pridať nový
   - **Dôležité**: Pri vytváraní vybrať kategóriu:
     - "Spoločné" → zobrazí sa na homepage
     - "Škola 1-4" → zobrazí sa na stránke danej školy

3. **Vytvorenie kategórií**
   - Články → Kategórie článkov
   - Pridať: Spoločné, Škola 1, Škola 2, Škola 3, Škola 4

4. **Nastavenie menu**
   - Vzhľad → Menu
   - Vytvoriť menu a priradiť k pozícii "Hlavné menu"

### Pre AI agenta

1. **Frontend kód (HTML/CSS/JS)**
   - AI generuje a upravuje všetky šablóny v `ssvk-theme/`
   - CSS je v `assets/css/main.css` s premennými na začiatku
   - Zmena farieb: upraviť CSS premenné v `:root`

2. **WordPress integrácia**
   - Používať WordPress funkcie: `get_posts()`, `get_the_terms()`, `get_permalink()`, atď.
   - Načítavať obsah z databázy, nie hardcodovať

3. **Štruktúra šablón**
   - `front-page.php` - homepage
   - `single-skola.php` - detail školy
   - `single-clanok.php` - detail článku
   - `archive-clanok.php` - zoznam článkov
   - `header.php` / `footer.php` - spoločné časti

## CSS premenné (zmena farieb)

Všetky farby sú v CSS premenných na začiatku `assets/css/main.css`:

```css
:root {
    --color-primary: #667eea;      /* Hlavná farba */
    --color-secondary: #764ba2;    /* Sekundárna farba */
    --color-text: #333;            /* Text */
    /* ... */
}
```

**Zmena farieb**: Upraviť tieto premenné, nie hľadať farby v celom súbore!

## Spustenie projektu

### Prvýkrát
```bash
docker compose up -d
```

### Prístup
- **Frontend**: http://localhost:8000
- **WP Admin**: http://localhost:8000/wp-admin

### Užitočné príkazy
```bash
# Zastavenie
docker compose down

# Zastavenie + vymazanie dát
docker compose down -v

# Logy
docker compose logs -f wordpress

# Reštart
docker compose restart
```

## Workflow - Ako budeme pracovať

### 1. AI generuje frontend kód
- AI vytvára/upravuje PHP šablóny, CSS, JavaScript
- Všetky zmeny v `wp-content/themes/ssvk-theme/`
- CSS organizovaný s premennými

### 2. Užívateľ spravuje obsah
- Pridáva školy, články cez WP admin
- Vyberá kategórie pri článkoch
- Upravuje texty, obrázky, dokumenty

### 3. Kombinácia
- Frontend načítava obsah z WordPress
- AI môže meniť dizajn bez ovplyvnenia obsahu
- Obsah zostáva v databáze, dizajn v kóde

## Dôležité poznámky

### Pre AI
- **Nikdy nehardcodovať obsah** - vždy načítať z WordPress
- **Používať WordPress funkcie** - `get_posts()`, `the_title()`, `get_permalink()`, atď.
- **CSS premenné** - všetky farby cez premenné, nie priamo v kóde
- **Responzívny dizajn** - vždy myslieť na mobile

### Pre užívateľa
- **Články**: Pri vytváraní vždy vybrať kategóriu
- **Školy**: Pridať 4 školy s obrázkami a popisom
- **Menu**: Nastaviť v Vzhľad → Menu
- **Info sekcia**: Vytvoriť stránku "info" pre homepage

## Ďalšie funkcie (budúce)

- [ ] Dokumenty (PDF upload a zobrazenie)
- [ ] Kontaktná stránka
- [ ] Pokročilejšie filtrovanie článkov
- [ ] Galéria
- [ ] Eventy/udalosti

## Verzovanie

- Git inicializovaný
- `.gitignore` nastavený (ignoruje WP core, commitne len našu tému)
- Téma je v `wp-content/themes/ssvk-theme/`

---

**Poznámka**: Tento README slúži ako základ pre AI agenta aj pre užívateľa. Aktualizuj podľa potreby.
