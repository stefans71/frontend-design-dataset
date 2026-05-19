#!/usr/bin/env bash
# Pull generated output back from AutoDL to VPS for critique stage
PORT=${1:-33472}
rsync -avz \
  -e "ssh -i /root/.ssh/id_ed25519 -p $PORT" \
  root@connect.westc.seetacloud.com:/root/autodl-tmp/frontend-design-dataset/output/ \
  /root/tinkering/Local-LLMs/Local-LLM-Agent/frontend-design-dataset/output/
echo "✓ Pull complete."
