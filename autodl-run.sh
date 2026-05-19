#!/usr/bin/env bash
export PATH="/root/autodl-tmp/bun/bin:/root/autodl-tmp/node-v22.15.0-linux-x64/bin:$PATH"
export PLAYWRIGHT_BROWSERS_PATH=/root/autodl-tmp/pw-browsers
echo "✓ PATH set (bun: $(bun --version))"
echo "✓ Playwright browsers: $PLAYWRIGHT_BROWSERS_PATH"
curl -s http://localhost:11434/health && echo "✓ llama-server healthy" || echo "✗ llama-server DOWN"
echo "Ready."
