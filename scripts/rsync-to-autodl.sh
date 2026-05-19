#!/usr/bin/env bash
# Usage: bash scripts/rsync-to-autodl.sh <AUTODL_PORT>
PORT=${1:-33472}
rsync -avz \
  --exclude='node_modules' \
  --exclude='.git' \
  --exclude='output/' \
  --exclude='.env' \
  /root/tinkering/Local-LLMs/Local-LLM-Agent/frontend-design-dataset/ \
  -e "ssh -i /root/.ssh/id_ed25519 -p $PORT" \
  root@connect.westc.seetacloud.com:/root/autodl-tmp/frontend-design-dataset/
echo "✓ Sync complete."
