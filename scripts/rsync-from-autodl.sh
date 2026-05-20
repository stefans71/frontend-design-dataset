#!/usr/bin/env bash
# Pull generated output back from AutoDL to VPS for critique stage
# Usage: bash scripts/rsync-from-autodl.sh <PORT> [HOST]
# HOST defaults to connect.westd.seetacloud.com
PORT=${1:-33472}
HOST=${2:-connect.westd.seetacloud.com}
rsync -avz \
  -e "ssh -i /root/.ssh/id_ed25519 -p $PORT" \
  root@${HOST}:/root/autodl-tmp/frontend-design-dataset/output/ \
  /root/tinkering/Local-LLMs/Local-LLM-Agent/frontend-design-dataset/output/
echo "✓ Pull complete."
