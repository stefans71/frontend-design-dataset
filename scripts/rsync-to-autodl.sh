#!/usr/bin/env bash
# Usage: bash scripts/rsync-to-autodl.sh <PORT> [HOST]
# HOST defaults to connect.westd.seetacloud.com
PORT=${1:-33472}
HOST=${2:-connect.westd.seetacloud.com}
rsync -avz \
  --exclude='node_modules' \
  --exclude='.git' \
  --exclude='output/' \
  --exclude='.env' \
  /root/tinkering/Local-LLMs/Local-LLM-Agent/frontend-design-dataset/ \
  -e "ssh -i /root/.ssh/id_ed25519 -p $PORT" \
  root@${HOST}:/root/autodl-tmp/frontend-design-dataset/
echo "✓ Sync complete."
