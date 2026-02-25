#!/bin/bash
set -e

echo "[1/4] Building cinny-custom..."
cd /opt/cinny-custom
npm run build

echo "[2/4] Copying dist to docker mount..."
rm -rf /opt/matrix/cinny-custom-dist/*
cp -r /opt/cinny-custom/dist/* /opt/matrix/cinny-custom-dist/

echo "[3/4] Restarting cinny container..."
cd /opt/matrix
docker compose restart cinny

echo "[4/4] Verifying deployment..."
sleep 2
docker exec cinny ls /usr/share/nginx/html/assets/index-*.js | head -1

echo ""
echo "✅ Build and deploy complete!"
