# Deploy Návod - ssvk.sk Landing Page

## Lokálny Build

```bash
cd /home/david/PhpstormProjects/private/ssvk-wp/landing-page
npm run build
```

Build vytvorí statické súbory v priečinku `landing-page/dist/`

## Deploy na Server

```bash
rsync -avz --progress /home/david/PhpstormProjects/private/ssvk-wp/landing-page/dist/ alldevs-hetzner:~/ssvk/
```

## Reštart Caddy (ak potrebné)

```bash
ssh alldevs-hetzner "cd ~/caddy && docker compose restart caddy"
```

## Rýchly Deploy (všetko naraz)

```bash
cd /home/david/PhpstormProjects/private/ssvk-wp/landing-page && \
npm run build && \
rsync -avz --progress dist/ alldevs-hetzner:~/ssvk/
```

## Server Info

- **Server:** alldevs-hetzner (Hetzner)
- **IP:** 49.13.94.193
- **Cesta:** `/root/ssvk/`
- **Web server:** Caddy (Docker)
- **URL:** https://ssvk.sk, https://www.ssvk.sk

## Poznámky

- Caddy automaticky slúži statické súbory z `/root/ssvk/`
- Nie je potrebný reštart Caddy po zmene súborov
- SSL certifikát sa obnovuje automaticky
