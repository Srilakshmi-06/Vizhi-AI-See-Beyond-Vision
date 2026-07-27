#!/bin/bash
# Ensure llama3.2:1b is available. Called after ollama server is up.
sleep 8  # wait for ollama server to be ready
for i in $(seq 1 20); do
  if curl -sf http://localhost:11434/api/version >/dev/null 2>&1; then
    break
  fi
  sleep 2
done
if ! /usr/local/bin/ollama list 2>/dev/null | grep -q "llama3.2:1b"; then
  echo "[$(date)] Pulling llama3.2:1b..." >> /app/ollama_model_ensure.log
  /usr/local/bin/ollama pull llama3.2:1b >> /app/ollama_model_ensure.log 2>&1
fi
