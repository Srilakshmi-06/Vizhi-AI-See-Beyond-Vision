# Ollama Setup Guide for Vizhi AI

## What is Ollama?

Ollama is used in Vizhi AI for:
1. **Planner Agent** - Routes user queries to the correct AI agent (OCR, Detection, Scene, etc.)
2. **Scene Description** - Generates natural language descriptions from detected objects

## Installation

### Option 1: Install on Local Machine (Recommended for Development)

#### Linux
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

#### macOS
```bash
brew install ollama
```

#### Windows
Download from: https://ollama.com/download

### Option 2: Run in Docker
```bash
docker run -d -v ollama:/root/.ollama -p 11434:11434 --name ollama ollama/ollama
```

## Download Required Model

After installation, download the Llama 3.2 model (used in Vizhi AI):

```bash
ollama pull llama3.2:3b
```

This will download the 3B parameter model (~1.9GB).

## Verify Installation

Check if Ollama is running:
```bash
curl http://localhost:11434/api/version
```

Expected response:
```json
{"version":"0.x.x"}
```

Test the model:
```bash
ollama run llama3.2:3b "Hello, how are you?"
```

## Configuration for Vizhi AI

The backend automatically connects to Ollama at `http://localhost:11434`.

If Ollama is running on a different host/port, update:

`/app/backend/app/services/llm/ollama_service.py`:
```python
# Add at the top
OLLAMA_HOST = os.environ.get("OLLAMA_HOST", "http://localhost:11434")
```

Then use the host in the `chat()` function calls.

## What Happens Without Ollama?

If Ollama is not running:
- ✅ **Object Detection** - Still works (YOLO)
- ✅ **OCR** - Still works (EasyOCR)
- ✅ **Speech-to-Text** - Still works (Whisper)
- ✅ **Text-to-Speech** - Still works (Edge TTS)
- ✅ **Safety Agent** - Still works (uses YOLO only)
- ❌ **Planner Agent** - Will fail (needs Ollama)
- ❌ **Scene Description** - Will fail (needs Ollama)

## Workaround Without Ollama

If you cannot install Ollama, you can modify the planner to use simple keyword matching:

Edit `/app/backend/app/services/planner/planner_service.py`:

```python
def decide_agent(query: str):
    """
    Simple keyword-based routing (no LLM needed)
    """
    query_lower = query.lower()
    
    # Keyword matching
    if any(word in query_lower for word in ["read", "text", "sign", "label"]):
        return {"agent": "OCR"}
    
    elif any(word in query_lower for word in ["detect", "what", "object", "see"]):
        return {"agent": "Object Detection"}
    
    elif any(word in query_lower for word in ["describe", "environment", "around"]):
        return {"agent": "Scene Description"}
    
    elif any(word in query_lower for word in ["navigate", "direction", "go to"]):
        return {"agent": "Navigation"}
    
    elif any(word in query_lower for word in ["help", "emergency", "sos"]):
        return {"agent": "Emergency"}
    
    else:
        return {"agent": "Conversation"}
```

And for scene description, modify `/app/backend/app/services/vision/scene_service.py`:

```python
def generate_scene_description(image_path: str):
    objects = detect_objects(image_path)
    
    # Simple template-based description
    if not objects:
        description = "I couldn't detect any significant objects around you."
    else:
        obj_descriptions = []
        for obj in objects:
            obj_descriptions.append(f"{obj['name']} {obj['position']}")
        
        description = f"I can see: {', '.join(obj_descriptions)}."
    
    return {
        "objects": objects,
        "description": description
    }
```

## Production Deployment

For production, consider:

1. **Hosted Ollama** - Run on a separate server/container
2. **API Alternative** - Use OpenAI, Anthropic, or Google Gemini API instead
3. **Edge Deployment** - Run Ollama on edge devices for offline capability

### Using OpenAI Instead

If you prefer OpenAI:

```python
import openai

def decide_agent(query: str):
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": query}
        ]
    )
    return {"agent": response.choices[0].message.content}
```

## Resource Requirements

- **CPU:** 4+ cores recommended
- **RAM:** 8GB minimum (for 3B model)
- **Disk:** 2GB for model storage
- **GPU:** Optional (NVIDIA CUDA for faster inference)

## Troubleshooting

### Ollama not starting
```bash
# Check if port is already in use
lsof -i :11434

# Start Ollama manually
ollama serve
```

### Model not found
```bash
# List installed models
ollama list

# Pull model again
ollama pull llama3.2:3b
```

### Connection refused
```bash
# Check if Ollama is running
ps aux | grep ollama

# Check port
curl http://localhost:11434
```

## Performance Tips

1. **Use smaller model for faster responses:**
   ```bash
   ollama pull llama3.2:1b  # Faster, less accurate
   ```

2. **Keep Ollama running as service:**
   ```bash
   # Linux systemd
   sudo systemctl enable ollama
   sudo systemctl start ollama
   ```

3. **Use GPU acceleration:**
   - Ollama automatically uses GPU if available
   - Ensure NVIDIA drivers are installed

## Current Status in Vizhi AI

✅ **Working Without Ollama:**
- Object Detection
- OCR
- Speech-to-Text
- Text-to-Speech
- Safety Agent (Live Camera)
- Emergency SOS
- Navigation (basic)

⚠️ **Needs Ollama:**
- Intelligent query routing (Planner Agent)
- Natural scene descriptions

**Recommendation:** Install Ollama for the full experience, but the core safety features work without it.
