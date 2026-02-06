# DNS Zmena pre ssvk.sk

## Prehľad zmien

**Dátum:** 6. február 2026

### DNS Záznamy

**Pôvodná IP adresa:** `185.102.21.32`

**Nová IP adresa:** `49.13.94.193` (Hetzner server: alldevs-hetzner)

### Nastavenie A záznamov

```
Typ: A
Názov: @
Hodnota: 49.13.94.193

Typ: A  
Názov: www
Hodnota: 49.13.94.193
```

## Server Setup

- **Umiestnenie web súborov:** `/root/ssvk/`
- **Web server:** Caddy (Docker)
- **Konfigurácia:** `/root/caddy/Caddyfile`
- **SSL certifikát:** Automaticky cez Let's Encrypt
- **Protokoly:** HTTP → HTTPS redirect (automaticky)

## Čo je hotové

✅ Landing page vybuildovaná (`landing-page/dist/`)  
✅ Súbory nakopírované na server do `/root/ssvk/`  
✅ Caddy nakonfigurované pre `ssvk.sk` a `www.ssvk.sk`  
✅ Automatický SSL certifikát po propagácii DNS  

## Po propagácii DNS

Web bude dostupný na:
- `https://ssvk.sk`
- `https://www.ssvk.sk`

Propagácia DNS trvá zvyčajne 5-30 minút, maximálne 24 hodín.
