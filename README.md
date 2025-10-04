# 🍺 Waserzähleichmeinenfreundenimausgang

Web-App zum Teilen und Bewerten von zufälligen Fakten.

## Stack

SvelteKit 2 (Svelte 5), SQLite, Docker, Kubernetes, Lucide Icons

## Development

```bash
npm install
npm run dev
```

Open `http://localhost:5173`

Admin: `http://localhost:5173/admin` (Password: `admin123` or set `ADMIN_PASSWORD` env var)

## Build & Test

```bash
npm run check
npm run build
```

## Production

### Docker
```bash
docker build -t waserzaehleichmeinenfreundenimausgang .
docker run -p 3000:3000 -v $(pwd)/data:/app/data -e ADMIN_PASSWORD=secret waserzaehleichmeinenfreundenimausgang
```

### Kubernetes
```bash
# With inline password (not recommended for production)
helm install waserzaehleichmeinenfreundenimausgang ./helm/waserzaehleichmeinenfreundenimausgang \
  --set image.repository=ghcr.io/janlauber/waserzaehleichmeinenfreundenimausgang \
  --set image.tag=latest \
  --set adminPassword=your-secure-password

# Or use existing secret (recommended)
kubectl create secret generic my-admin-secret --from-literal=admin-password=your-secure-password
helm install waserzaehleichmeinenfreundenimausgang ./helm/waserzaehleichmeinenfreundenimausgang \
  --set image.repository=ghcr.io/janlauber/waserzaehleichmeinenfreundenimausgang \
  --set image.tag=latest \
  --set existingSecret=my-admin-secret
```

## License

MIT
