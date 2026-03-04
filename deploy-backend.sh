#!/bin/bash
set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}=== SSVK Backend Deploy ===${NC}"

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$PROJECT_DIR/backend"
IMAGE_NAME="ssvk-backend"
IMAGE_TAG="latest"
ARCHIVE_NAME="ssvk-backend.tar.gz"
REMOTE_HOST="alldevs-hetzner"
REMOTE_DIR="~/ssvk"

# 1. Build image locally
echo -e "\n${GREEN}[1/5] Building Docker image locally...${NC}"
cd "$BACKEND_DIR"
docker build -t "$IMAGE_NAME:$IMAGE_TAG" .

# 2. Save and compress
echo -e "\n${GREEN}[2/5] Saving and compressing image...${NC}"
docker save "$IMAGE_NAME:$IMAGE_TAG" | gzip > "/tmp/$ARCHIVE_NAME"
SIZE=$(du -h "/tmp/$ARCHIVE_NAME" | cut -f1)
echo "Image size: $SIZE"

# 3. Upload to server
echo -e "\n${GREEN}[3/5] Uploading to $REMOTE_HOST...${NC}"
rsync -avz --progress "/tmp/$ARCHIVE_NAME" "$REMOTE_HOST:$REMOTE_DIR/"

# 4. Load image and restart on server
echo -e "\n${GREEN}[4/5] Loading image on server...${NC}"
ssh "$REMOTE_HOST" "cd $REMOTE_DIR && \
  docker load < $ARCHIVE_NAME && \
  rm $ARCHIVE_NAME && \
  docker compose up -d backend"

# 5. Cleanup local
echo -e "\n${GREEN}[5/5] Cleanup...${NC}"
rm "/tmp/$ARCHIVE_NAME"

# Verify
echo -e "\n${GREEN}Verifying deployment...${NC}"
sleep 2
HEALTH=$(curl -s https://ssvk.sk/api/health)
if echo "$HEALTH" | grep -q '"status":"ok"'; then
  echo -e "${GREEN}✓ Backend is healthy!${NC}"
  echo "$HEALTH"
else
  echo -e "${RED}✗ Health check failed${NC}"
  echo "$HEALTH"
  exit 1
fi

echo -e "\n${GREEN}=== Deploy complete! ===${NC}"
