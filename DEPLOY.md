# Deploy Návod - ssvk.sk

## Architektúra

```
ssvk.sk
├── Frontend (statické súbory) → Caddy
├── Backend API (/api/*) → Express (Docker)
└── PostgreSQL (Docker)
```

## Prvotná inštalácia na serveri

### 1. Príprava servera

```bash
ssh alldevs-hetzner

# Vytvorenie adresárov
mkdir -p ~/ssvk/pdfs
cd ~/ssvk

# Dôležité: Nastavenie oprávnení pre uploads (backend beží ako uid 1001 v kontajneri)
chown -R 1001:1001 ~/ssvk/pdfs
```

### 2. Nahratie súborov

```bash
# Z lokálneho počítača
rsync -avz --progress \
  docker-compose.yml \
  .env.example \
  backend/ \
  alldevs-hetzner:~/ssvk/
```

### 3. Konfigurácia environment variables

```bash
ssh alldevs-hetzner
cd ~/ssvk

# Vytvorenie .env súboru
cp .env.example .env

# Úprava hodnôt (použite bezpečné heslá!)
nano .env
```

**Dôležité premenné v `.env`:**
- `POSTGRES_PASSWORD` - silné heslo pre PostgreSQL
- `SESSION_SECRET` - náhodný reťazec min. 32 znakov
- `ADMIN_PASSWORD` - heslo pre admin účet

### 4. Aktualizácia Caddy konfigurácie

Pridajte do Caddyfile pre `ssvk.sk`:

```caddyfile
ssvk.sk, www.ssvk.sk {
    # API proxy
    handle /api/* {
        reverse_proxy localhost:3001
    }
    
    # Static files
    handle {
        root * /root/ssvk
        file_server
        try_files {path} /index.html
    }
}
```

Reštart Caddy:
```bash
cd ~/caddy && docker compose restart caddy
```

### 5. Spustenie backend služieb

```bash
cd ~/ssvk

# Build a spustenie
docker compose up -d --build

# Kontrola logov
docker compose logs -f backend
```

### 6. Seed databázy (admin user + dokumenty)

```bash
cd ~/ssvk

# Spustenie seed scriptu
docker compose exec backend npx tsx prisma/seed.ts
```

## Pravidelný Deploy

### Frontend (statické súbory)

```bash
# Lokálne
cd /home/david/PhpstormProjects/private/ssvk-wp/landing-page

# Build s produkčnou API URL
VITE_API_URL=https://ssvk.sk/api npm run build

# Upload
rsync -avz --progress dist/ alldevs-hetzner:~/ssvk/
```

### Backend (pri zmene kódu)

```bash
# Lokálne - nahratie súborov
rsync -avz --progress \
  /home/david/PhpstormProjects/private/ssvk-wp/backend/ \
  --exclude node_modules \
  --exclude dist \
  --exclude .env \
  alldevs-hetzner:~/ssvk/backend/

# Na serveri - rebuild
ssh alldevs-hetzner "cd ~/ssvk && docker compose up -d --build backend"
```

### Migrácie databázy

```bash
# Na serveri po zmene schema.prisma
ssh alldevs-hetzner "cd ~/ssvk && docker compose exec backend npx prisma migrate deploy"
```

## Rýchly Deploy (všetko naraz)

```bash
# Frontend + Backend
cd /home/david/PhpstormProjects/private/ssvk-wp/landing-page && \
VITE_API_URL=https://ssvk.sk/api npm run build && \
rsync -avz --progress dist/ alldevs-hetzner:~/ssvk/ && \
rsync -avz --progress ../backend/ --exclude node_modules --exclude dist --exclude .env alldevs-hetzner:~/ssvk/backend/ && \
ssh alldevs-hetzner "cd ~/ssvk && docker compose up -d --build backend"
```

## Údržba

### Logy

```bash
# Backend logy
ssh alldevs-hetzner "cd ~/ssvk && docker compose logs -f backend"

# PostgreSQL logy
ssh alldevs-hetzner "cd ~/ssvk && docker compose logs -f postgres"
```

### Záloha databázy

```bash
ssh alldevs-hetzner "cd ~/ssvk && docker compose exec postgres pg_dump -U ssvk ssvk > backup_$(date +%Y%m%d).sql"
```

### Reštart služieb

```bash
ssh alldevs-hetzner "cd ~/ssvk && docker compose restart"
```

## Riešenie problémov

### EACCES: permission denied na /app/uploads

Backend beží ako používateľ `expressjs` (uid 1001). Ak host adresár pre PDF má zlé oprávnenia:

```bash
ssh alldevs-hetzner
chown -R 1001:1001 ~/ssvk/pdfs
docker compose -f ~/ssvk/docker-compose.yml restart backend
```

## Server Info

- **Server:** alldevs-hetzner (Hetzner)
- **IP:** 49.13.94.193
- **Cesta:** `/root/ssvk/`
- **Web server:** Caddy (Docker)
- **URL:** https://ssvk.sk, https://www.ssvk.sk
- **Admin:** https://ssvk.sk/#/admin/login

## Prístupy

- **Admin účet:** admin@ssvk.sk (heslo nastavené v .env ako ADMIN_PASSWORD)
