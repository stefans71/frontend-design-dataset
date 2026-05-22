#!/usr/bin/env bash
# Push project to AutoDL for generate/render stages
# Usage: bash scripts/rsync-to-autodl.sh <PORT> [HOST]
# HOST defaults to <your-autodl-host> — override with second arg
SSH_KEY=${SSH_KEY:-~/.ssh/id_ed25519}
PORT=${1:-<PORT>}
HOST=${2:-<your-autodl-host>}
rsync -avz \
  --exclude='node_modules' \
  --exclude='.git' \
  --exclude='output/' \
  --exclude='.env' \
  ./ \
  -e "ssh -i $SSH_KEY -p $PORT" \
  root@${HOST}:/root/autodl-tmp/frontend-design-dataset/
echo "✓ Sync complete."
