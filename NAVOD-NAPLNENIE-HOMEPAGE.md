# 📝 Návod: Ako naplniť homepage obsahom

Tento návod ťa prevedie krok za krokom, ako pridať všetok obsah na homepage cez WordPress admin.

## 🔗 Prístup do WordPress Admin

1. Otvor prehliadač a choď na: **http://localhost:8000/wp-admin**
2. Prihlás sa (ak ešte nemáš účet, WordPress ti ho vytvorí pri prvom spustení)

---

## ✅ KROK 1: Nastavenie názvu a popisu stránky (Hero sekcia)

**Kde:** `Nastavenia` → `Všeobecné`

1. V ľavom menu klikni na **Nastavenia** → **Všeobecné**
2. Vyplň:
   - **Názov stránky** (napr. "SSVK - Spoločenstvo škôl")
   - **Slogan** (napr. "Spájame 4 školy v jednej organizácii")
3. Klikni **Uložiť zmeny**

✅ **Výsledok:** Názov a popis sa zobrazia v hero sekcii na homepage

---

## 🏫 KROK 2: Pridanie škôl (Rozcestník)

**Kde:** `Školy` → `Pridať novú`

1. V ľavom menu klikni na **Školy** → **Pridať novú**
2. Pre každú školu vyplň:
   - **Názov** (napr. "Základná škola č. 1")
   - **Krátky popis** (v poli "Výňatok" - toto sa zobrazí na karte)
   - **Obsah** (celý text o škole - zobrazí sa na detailnej stránke)
   - **Obrázok** (vpravo klikni "Nastaviť obrázok príspevku" a nahraj obrázok)
3. Klikni **Zverejniť**
4. **Zopakuj pre všetky 4 školy**

💡 **Tip:** Môžeš upraviť poradie škôl - v zozname škôl môžeš zmeniť dátum zverejnenia

✅ **Výsledok:** 4 školy sa zobrazia v rozcestníku na homepage (2x2 grid)

---

## 📄 KROK 3: Vytvorenie Info stránky (Info sekcia)

**Kde:** `Stránky` → `Pridať novú`

1. V ľavom menu klikni na **Stránky** → **Pridať novú**
2. **Dôležité:** Nastav **URL** (slug) na presne: `info`
   - Vpravo v sekcii "Stránka" klikni na "Zmeniť" vedľa URL
   - Zadaj: `info`
3. Vyplň:
   - **Názov** (napr. "O nás")
   - **Obsah** (text, ktorý sa zobrazí v info sekcii na homepage)
4. Klikni **Zverejniť**

✅ **Výsledok:** Obsah sa zobrazí v info sekcii na homepage

---

## 📰 KROK 4: Vytvorenie kategórie "Spoločné" pre články

**Kde:** `Články` → `Kategórie článkov`

1. V ľavom menu klikni na **Články** → **Kategórie článkov**
2. Pridaj novú kategóriu:
   - **Názov:** `Spoločné`
   - **Slug:** `spolocne` (nechaj automaticky, alebo zadaj ručne)
3. Klikni **Pridať novú kategóriu**

💡 **Tip:** Môžeš pridať aj ďalšie kategórie: "Škola 1", "Škola 2", "Škola 3", "Škola 4"

✅ **Výsledok:** Kategória je pripravená na priradenie k článkom

---

## 📝 KROK 5: Pridanie článkov (Spoločné novinky)

**Kde:** `Články` → `Pridať nový`

1. V ľavom menu klikni na **Články** → **Pridať nový**
2. Vyplň:
   - **Názov** (napr. "Nový školský rok 2024")
   - **Krátky popis** (v poli "Výňatok" - zobrazí sa na karte)
   - **Obsah** (celý text článku)
   - **Obrázok** (vpravo "Nastaviť obrázok príspevku")
3. **Dôležité:** Vpravo v sekcii "Kategórie článkov" začiarkni **"Spoločné"**
4. Klikni **Zverejniť**
5. **Zopakuj pre viacero článkov** (odporúčam aspoň 3-6 článkov)

✅ **Výsledok:** Články s kategóriou "Spoločné" sa zobrazia v sekcii "Spoločné novinky" na homepage

---

## 🎯 KROK 6: Nastavenie hlavného menu (voliteľné)

**Kde:** `Vzhľad` → `Menu`

1. V ľavom menu klikni na **Vzhľad** → **Menu**
2. Ak ešte nemáš menu, klikni **Vytvoriť nové menu**
3. Pridaj položky:
   - **Domov** (stránka homepage)
   - **Školy** (odkaz na zoznam škôl)
   - **Články** (odkaz na zoznam článkov)
4. Vpravo v sekcii "Nastavenia menu" začiarkni **"Hlavné menu"**
5. Klikni **Uložiť menu**

✅ **Výsledok:** Menu sa zobrazí v headeri stránky

---

## 📋 Rýchly checklist

- [ ] Nastavený názov a popis stránky (Krok 1)
- [ ] Pridané 4 školy s obrázkami (Krok 2)
- [ ] Vytvorená stránka "info" (Krok 3)
- [ ] Vytvorená kategória "Spoločné" (Krok 4)
- [ ] Pridané aspoň 3 články s kategóriou "Spoločné" (Krok 5)
- [ ] Nastavené hlavné menu (Krok 6 - voliteľné)

---

## 🔍 Kontrola výsledku

1. Choď na homepage: **http://localhost:8000**
2. Mala by sa zobraziť:
   - ✅ Hero sekcia s názvom a popisom
   - ✅ Rozcestník so 4 školami (2x2 grid)
   - ✅ Info sekcia s obsahom
   - ✅ Spoločné novinky s článkami

---

## ❓ Časté problémy

### Školy sa nezobrazujú
- Skontroluj, či sú školy **zverejnené** (nie v koncepte)
- Skontroluj, či máš aspoň 1 školu pridanú

### Info sekcia je prázdna
- Skontroluj, či máš stránku s **presným URL slugom "info"**
- Skontroluj, či je stránka **zverejnená**

### Články sa nezobrazujú
- Skontroluj, či majú články **kategóriu "Spoločné"** začiarknutú
- Skontroluj, či sú články **zverejnené**

### Obrázky sa nezobrazujú
- Skontroluj, či máš **nahraté obrázky** pre školy/články
- Skontroluj veľkosť obrázkov (odporúčané: min. 800x600px)

---

## 💡 Tipy

- **Obrázky:** Používaj kvalitné obrázky (min. 800x600px), WordPress ich automaticky zmenší
- **Výňatok:** Vždy vyplň "Výňatok" (excerpt) - zobrazí sa na kartách
- **Poradie:** Môžeš zmeniť poradie škôl/článkov zmenou dátumu zverejnenia
- **Náhľad:** Vždy klikni "Náhľad" pred zverejnením, aby si videl, ako to vyzerá

---

**Hotovo!** 🎉 Tvoja homepage by teraz mala byť plná obsahu!

