#!/usr/bin/env bash
# Pull generated output back from AutoDL to VPS for critique stage
# Usage: bash scripts/rsync-from-autodl.sh <PORT> [HOST]
# HOST defaults to <your-autodl-host> — override with second arg
SSH_KEY=${SSH_KEY:-~/.ssh/id_ed25519}
PORT=${1:-<PORT>}
HOST=${2:-<your-autodl-host>}
rsync -avz \
  -e "ssh -i $SSH_KEY -p $PORT" \
  root@${HOST}:/root/autodl-tmp/frontend-design-dataset/output/ \
  output/
echo "✓ Pull complete."
