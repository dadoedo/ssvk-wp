#!/bin/bash
set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
REMOTE_HOST="alldevs-hetzner"
REMOTE_DIR="~/ssvk"

usage() {
  echo "Usage: $0 [frontend|backend|all]"
  echo ""
  echo "  frontend  - Build and deploy frontend only"
  echo "  backend   - Build and deploy backend only"
  echo "  all       - Deploy both frontend and backend"
  exit 1
}

deploy_frontend() {
  echo -e "\n${BLUE}=== Deploying Frontend ===${NC}"
  
  cd "$PROJECT_DIR/landing-page"
  
  echo -e "${GREEN}Building frontend...${NC}"
  VITE_API_URL=https://ssvk.sk/api npm run build
  
  echo -e "${GREEN}Uploading to server...${NC}"
  rsync -avz --progress dist/ "$REMOTE_HOST:$REMOTE_DIR/"
  
  echo -e "${GREEN}✓ Frontend deployed!${NC}"
}

deploy_backend() {
  echo -e "\n${BLUE}=== Deploying Backend ===${NC}"
  
  IMAGE_NAME="ssvk-backend"
  ARCHIVE_NAME="ssvk-backend.tar.gz"
  
  cd "$PROJECT_DIR/backend"
  
  echo -e "${GREEN}[1/4] Building Docker image...${NC}"
  docker build -t "$IMAGE_NAME:latest" .
  
  echo -e "${GREEN}[2/4] Compressing image...${NC}"
  docker save "$IMAGE_NAME:latest" | gzip > "/tmp/$ARCHIVE_NAME"
  echo "Size: $(du -h /tmp/$ARCHIVE_NAME | cut -f1)"
  
  echo -e "${GREEN}[3/4] Uploading...${NC}"
  rsync -avz --progress "/tmp/$ARCHIVE_NAME" "$REMOTE_HOST:$REMOTE_DIR/"
  
  echo -e "${GREEN}[4/4] Loading and restarting...${NC}"
  ssh "$REMOTE_HOST" "cd $REMOTE_DIR && \
    docker load < $ARCHIVE_NAME && \
    rm $ARCHIVE_NAME && \
    docker compose up -d backend"
  
  rm "/tmp/$ARCHIVE_NAME"
  
  echo -e "${GREEN}Verifying...${NC}"
  sleep 2
  if curl -s https://ssvk.sk/api/health | grep -q '"status":"ok"'; then
    echo -e "${GREEN}✓ Backend is healthy!${NC}"
  else
    echo -e "${RED}✗ Health check failed!${NC}"
    exit 1
  fi
}

# Main
case "${1:-all}" in
  frontend)
    deploy_frontend
    ;;
  backend)
    deploy_backend
    ;;
  all)
    deploy_frontend
    deploy_backend
    ;;
  *)
    usage
    ;;
esac

echo -e "\n${GREEN}=== Deploy complete! ===${NC}"
