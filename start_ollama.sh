#!/bin/bash
# Vizhi AI — Ollama startup script
# Ensures ollama is installed and running. Called by supervisor on every pod start.

set -e

LOG_FILE="/app/ollama_startup.log"
echo "[$(date)] Ollama startup begin" >> "$LOG_FILE"

# 1. Ensure zstd is available (required by Ollama installer)
if ! command -v zstd >/dev/null 2>&1; then
    echo "[$(date)] Installing zstd..." >> "$LOG_FILE"
    apt-get install -y zstd >> "$LOG_FILE" 2>&1 || true
fi

# 2. If ollama binary is missing (pod restart wipes /usr/local), reinstall
if [ ! -f /usr/local/bin/ollama ] || [ ! -f /usr/local/lib/ollama/llama-server ]; then
    echo "[$(date)] Installing Ollama..." >> "$LOG_FILE"
    curl -fsSL https://ollama.com/install.sh | sh >> "$LOG_FILE" 2>&1
fi

# 3. Fix /root/.ollama if it's a broken symlink
if [ -L /root/.ollama ] && [ ! -e /root/.ollama ]; then
    echo "[$(date)] Fixing broken .ollama symlink" >> "$LOG_FILE"
    rm /root/.ollama
    mkdir -p /root/.ollama
fi

# 4. Ensure model directory exists in persistent location
mkdir -p /root/.ollama/models

# 5. Start ollama serve (foreground, so supervisor manages it)
echo "[$(date)] Starting ollama serve" >> "$LOG_FILE"
exec /usr/local/bin/ollama serve
