 # 🚀 Vizhi AI - Multi-Agent Accessibility Companion

> **Production-ready AI accessibility application for visually impaired users**

[![Status](https://img.shields.io/badge/status-ready-brightgreen)]()
[![Version](https://img.shields.io/badge/version-2.0-blue)]()
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-blue)]()
[![Python](https://img.shields.io/badge/python-3.11+-blue)]()

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Quick Start](#quick-start)
- [API Documentation](#api-documentation)
- [Flutter Integration](#flutter-integration)
- [Production Deployment](#production-deployment)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

**Vizhi AI** is a comprehensive accessibility solution that helps visually impaired users navigate their environment through:

- 📹 **Continuous camera monitoring** with real-time safety warnings
- 🗣️ **Voice-to-voice interaction** for hands-free operation
- 🚨 **Smart obstacle detection** with priority-based alerts
- 📖 **Text reading** from signs, labels, and documents
- 🗺️ **Navigation assistance** with obstacle awareness
- 🆘 **Emergency SOS** system

### Why Vizhi AI?

- ✅ **Modular Architecture** - Clean, extensible, SOLID principles
- ✅ **Production Ready** - Comprehensive error handling and logging
- ✅ **Smart Warnings** - No repetitive alerts (cooldown system)
- ✅ **Multi-Agent System** - Specialized AI for each task
- ✅ **Hands-Free Operation** - Complete voice interaction
- ✅ **Real-Time Processing** - 500ms frame analysis

---

## ✨ Features

### Core AI Capabilities

| Feature | Technology | Status |
|---------|-----------|--------|
| **Object Detection** | YOLOv8n | ✅ Ready |
| **Text Reading (OCR)** | EasyOCR | ✅ Ready |
| **Scene Description** | YOLO + LLama 3.2 | ✅ Ready |
| **Speech-to-Text** | Faster Whisper | ✅ Ready |
| **Text-to-Speech** | Edge TTS | ✅ Ready |

### Safety & Monitoring

| Feature | Description | Status |
|---------|-------------|--------|
| **Safety Agent** | Smart obstacle warning system | ✅ Ready |
| **Live Camera Stream** | 500ms continuous monitoring | ✅ Ready |
| **Priority Alerts** | High/Medium/Low danger levels | ✅ Ready |
| **No Repetition** | 5-second cooldown per object | ✅ Ready |

### Assistance Services

| Feature | Description | Status |
|---------|-------------|--------|
| **Voice Assistant** | Unified voice interaction | ✅ Ready |
| **Navigation** | Location-based guidance | ⚠️ Basic |
| **Emergency SOS** | Alert system | ⚠️ Logging |
| **Planner Agent** | Intelligent query routing | ⚠️ Needs Ollama |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Flutter Mobile App                    │
└──────────┬──────────────────────────┬───────────────────┘
           │                          │
    Live Camera                  Voice Commands
    (500ms frames)              (User speaks)
           │                          │
           ▼                          ▼
┌──────────────────┐        ┌────────────────────┐
│ Live Stream API  │        │  Voice Assistant   │
│ /api/stream/     │        │  /api/assistant/   │
└────────┬─────────┘        └──────────┬─────────┘
         │                              │
         ▼                              ▼
┌─────────────────┐          ┌──────────────────┐
│ Object Detection│          │  Planner Agent   │
│    (YOLOv8)     │          │  (Llama 3.2)     │
└────────┬────────┘          └────────┬─────────┘
         │                            │
         ▼                            ▼
┌─────────────────┐          ┌──────────────────┐
│  Safety Agent   │          │  Specialized     │
│  (Priority +    │          │  Agents:         │
│   Cooldown)     │          │  • OCR           │
└────────┬────────┘          │  • Detection     │
         │                   │  • Scene         │
         ▼                   │  • Navigation    │
┌─────────────────┐          │  • Emergency     │
│   Edge TTS      │          └──────────┬───────┘
│  (Audio Gen)    │                     │
└────────┬────────┘                     ▼
         │                   ┌──────────────────┐
         │                   │   Edge TTS       │
         │                   │  (Audio Gen)     │
         │                   └──────────┬───────┘
         ▼                              ▼
    Audio Warning                  Audio Response
         │                              │
         └──────────┬───────────────────┘
                    ▼
            User Hears Audio
```

---

## 🚀 Quick Start

### Prerequisites

- Python 3.11+
- FastAPI
- YOLOv8 model
- (Optional) Ollama with Llama 3.2

### Installation

1. **Clone and navigate:**
   ```bash
   cd /app/backend
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Start the server:**
   ```bash
   # Using supervisor (recommended)
   sudo supervisorctl restart backend
   
   # Or manually
   uvicorn server:app --host 0.0.0.0 --port 8001 --reload
   ```

4. **Verify installation:**
   ```bash
   bash /app/test_system.sh
   ```

5. **Access documentation:**
   - Swagger UI: http://localhost:8001/docs
   - ReDoc: http://localhost:8001/redoc

### Optional: Install Ollama

For intelligent query routing and scene descriptions:

```bash
# Linux
curl -fsSL https://ollama.com/install.sh | sh
ollama pull llama3.2:3b

# macOS
brew install ollama
ollama pull llama3.2:3b
```

See [OLLAMA_SETUP.md](/app/OLLAMA_SETUP.md) for details.

---

## 📚 API Documentation

### Base URL
```
Local: http://localhost:8001
Production: https://your-domain.com
```

### Key Endpoints

#### 1. Live Camera Monitoring (Most Important!)
```bash
POST /api/stream/analyze
```

**Send camera frames every 500ms:**
```bash
curl -X POST http://localhost:8001/api/stream/analyze \
  -F "file=@camera_frame.jpg"
```

**Response:**
```json
{
  "warnings": ["Caution! Vehicle ahead."],
  "dangerous_objects": [...],
  "safe": false,
  "audio_warning": "audio_outputs/abc.mp3"
}
```

#### 2. Voice Assistant (Complete Interaction)
```bash
POST /api/assistant/
```

**Process voice command with image:**
```bash
curl -X POST http://localhost:8001/api/assistant/ \
  -F "user_input=Read the sign" \
  -F "image=@photo.jpg"
```

**Response:**
```json
{
  "agent": "OCR",
  "response": "The text reads: Emergency Exit",
  "audio_path": "audio_outputs/xyz.mp3"
}
```

#### 3. Object Detection
```bash
POST /api/detect/
```

#### 4. Text Reading (OCR)
```bash
POST /api/ocr/
```

#### 5. Scene Description
```bash
POST /api/scene/
```

#### 6. Speech-to-Text
```bash
POST /api/speech/
```

#### 7. Text-to-Speech
```bash
POST /api/tts/
```

#### 8. Emergency SOS
```bash
POST /api/emergency/trigger
```

📖 **Full API Documentation:** See [API_DOCUMENTATION.md](/app/API_DOCUMENTATION.md)

---

## 📱 Flutter Integration

### Setup

```dart
class VizhiAI {
  static const String baseUrl = 'http://your-backend-url:8001';
}
```

### Live Camera Monitoring

```dart
Timer.periodic(Duration(milliseconds: 500), (timer) async {
  // Capture frame
  final XFile image = await cameraController.takePicture();
  
  // Analyze frame
  final request = http.MultipartRequest(
    'POST',
    Uri.parse('${VizhiAI.baseUrl}/api/stream/analyze'),
  );
  request.files.add(await http.MultipartFile.fromPath('file', image.path));
  
  final response = await request.send();
  final data = json.decode(await response.stream.bytesToString());
  
  // Play warning if exists
  if (data['audio_warning'] != null) {
    playAudio('${VizhiAI.baseUrl}/${data['audio_warning']}');
  }
  
  // Update UI
  showWarnings(data['warnings']);
});
```

### Voice Commands

```dart
Future<void> processVoiceCommand() async {
  // 1. Record audio
  final audioPath = await recordAudio();
  
  // 2. Transcribe
  final transcription = await transcribeAudio(audioPath);
  final userInput = transcription['text'];
  
  // 3. Capture image
  final image = await cameraController.takePicture();
  
  // 4. Send to assistant
  final request = http.MultipartRequest(
    'POST',
    Uri.parse('${VizhiAI.baseUrl}/api/assistant/'),
  );
  request.fields['user_input'] = userInput;
  request.files.add(await http.MultipartFile.fromPath('image', image.path));
  
  final response = await request.send();
  final data = json.decode(await response.stream.bytesToString());
  
  // 5. Play audio response
  playAudio('${VizhiAI.baseUrl}/${data['audio_path']}');
}
```

📖 **Full Flutter Guide:** See [IMPLEMENTATION_SUMMARY.md](/app/IMPLEMENTATION_SUMMARY.md)

---

## 🌐 Production Deployment

### Backend Deployment

1. **Choose a platform:**
   - AWS (EC2, ECS, Lambda)
   - Google Cloud (Compute Engine, Cloud Run)
   - Azure (App Service)
   - DigitalOcean (Droplets)

2. **Deploy with Docker:**
   ```dockerfile
   FROM python:3.11-slim
   WORKDIR /app
   COPY requirements.txt .
   RUN pip install -r requirements.txt
   COPY . .
   CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8001"]
   ```

3. **Set up HTTPS:**
   - Use Nginx/Caddy as reverse proxy
   - Get SSL certificate (Let's Encrypt)

4. **Configure environment:**
   ```bash
   export OLLAMA_HOST=http://ollama-server:11434
   export SENTRY_DSN=your_sentry_dsn
   ```

5. **Enable monitoring:**
   - Set up CloudWatch/Datadog
   - Configure Sentry for error tracking
   - Set up health checks

### AI Model Optimization

1. **Use GPU instances:**
   - AWS: g4dn.xlarge
   - GCP: n1-standard-4 with T4 GPU
   - Azure: NC6

2. **Model optimization:**
   - Enable CUDA for YOLO
   - Use quantized models
   - Implement model caching

### Scaling Strategy

1. **Horizontal scaling:**
   - Use load balancer
   - Deploy multiple instances
   - Share file storage (S3, GCS)

2. **Auto-scaling:**
   - Based on CPU/memory usage
   - Based on request queue length

---

## 🧪 Testing

### Quick System Test

```bash
bash /app/test_system.sh
```

### Manual Testing

#### Test Object Detection
```bash
curl -X POST http://localhost:8001/api/detect/ \
  -F "file=@test_image.jpg"
```

#### Test Safety Agent
```bash
# Frame 1
curl -X POST http://localhost:8001/api/stream/analyze \
  -F "file=@frame.jpg"

# Wait 3 seconds and send same frame
# Should NOT repeat warning

# Wait 6 seconds and send same frame
# Should repeat warning now
```

#### Test TTS
```bash
curl -X POST http://localhost:8001/api/tts/ \
  -F "text=Hello, I am Vizhi AI" \
  -o test_audio.mp3

# Play audio
mpg123 test_audio.mp3  # Linux
afplay test_audio.mp3  # macOS
```

---

## 🐛 Troubleshooting

### Backend Won't Start

```bash
# Check logs
tail -f /var/log/supervisor/backend.err.log

# Restart backend
sudo supervisorctl restart backend

# Check Python path
which python
python --version
```

### Model Loading Issues

```bash
# Check if YOLO model exists
ls -lh /app/backend/yolov8n.pt

# Test model loading
python -c "from ultralytics import YOLO; model = YOLO('yolov8n.pt'); print('OK')"
```

### Ollama Connection Failed

```bash
# Check if Ollama is running
curl http://localhost:11434/api/version

# Start Ollama
ollama serve

# Pull model
ollama pull llama3.2:3b
```

### Audio Generation Fails

```bash
# Check audio output directory
ls -la /app/backend/audio_outputs/

# Test Edge TTS
python -c "import edge_tts; print('OK')"

# Check disk space
df -h
```

### Performance Issues

```bash
# Check CPU/Memory
htop

# Monitor API response times
curl -w "@curl-format.txt" http://localhost:8001/api/detect/ -F "file=@test.jpg"

# Check YOLO inference time
# Should be 50-200ms on CPU, 10-50ms on GPU
```

---

## 📁 Project Structure

```
/app/backend/
├── server.py                    # Entry point
├── requirements.txt             # Dependencies
├── yolov8n.pt                  # YOLO model
│
├── app/
│   ├── main.py                 # FastAPI app
│   │
│   ├── routers/                # API endpoints
│   │   ├── detection_router.py
│   │   ├── ocr_router.py
│   │   ├── scene_router.py
│   │   ├── speech_router.py
│   │   ├── tts_router.py
│   │   ├── stream_router.py
│   │   ├── assistant_router.py
│   │   ├── navigation_router.py
│   │   ├── emergency_router.py
│   │   └── planner_router.py
│   │
│   ├── services/               # Business logic
│   │   ├── vision/
│   │   │   ├── detection_service.py    # YOLO
│   │   │   ├── ocr_service.py          # EasyOCR
│   │   │   └── scene_service.py        # Scene desc
│   │   ├── speech/
│   │   │   ├── whisper_service.py      # STT
│   │   │   └── tts_service.py          # TTS
│   │   ├── safety/
│   │   │   └── safety_agent.py         # Obstacle warnings
│   │   ├── assistant/
│   │   │   └── assistant_service.py    # Orchestration
│   │   ├── planner/
│   │   │   └── planner_service.py      # Query routing
│   │   ├── navigation/
│   │   │   └── navigation_service.py   # Directions
│   │   ├── emergency/
│   │   │   └── emergency_service.py    # SOS
│   │   └── llm/
│   │       └── ollama_service.py       # LLM
│   │
│   ├── models/                 # Data models
│   │   ├── assistant_response.py
│   │   └── planner_model.py
│   │
│   └── utils/                  # Utilities
│       └── file_utils.py
│
├── uploads/                    # Uploaded images
└── audio_outputs/              # Generated audio
```

---

## 📖 Documentation Files

- **[API_DOCUMENTATION.md](/app/API_DOCUMENTATION.md)** - Complete API reference
- **[IMPLEMENTATION_SUMMARY.md](/app/IMPLEMENTATION_SUMMARY.md)** - Implementation details
- **[OLLAMA_SETUP.md](/app/OLLAMA_SETUP.md)** - Ollama installation guide
- **[test_system.sh](/app/test_system.sh)** - System test script

---

## 🎯 Next Steps

### Immediate Actions
1. ✅ Test all endpoints
2. ✅ Integrate with Flutter app
3. ✅ Test live camera streaming
4. ✅ Test voice commands

### Short Term
- [ ] Add user authentication
- [ ] Implement session management
- [ ] Add request caching
- [ ] Optimize image processing

### Long Term
- [ ] Integrate real navigation APIs
- [ ] Set up emergency contact system
- [ ] Add offline mode support
- [ ] Implement multi-language support
- [ ] Add distance estimation
- [ ] Implement indoor navigation

---

## 🤝 Contributing

This is a production project for visually impaired users. Contributions welcome!

### Areas for Improvement
1. Distance estimation using depth sensors
2. Indoor navigation
3. Multi-language support
4. Offline mode
5. Battery optimization
6. UI/UX improvements

---

## 📄 License

MIT License

---

## 🙏 Credits

**AI Models:**
- [YOLOv8](https://github.com/ultralytics/ultralytics) by Ultralytics
- [EasyOCR](https://github.com/JaidedAI/EasyOCR) by JaidedAI
- [Faster Whisper](https://github.com/SYSTRAN/faster-whisper) by Systran
- [Llama 3.2](https://ollama.com/library/llama3.2) by Meta
- [Edge TTS](https://github.com/rany2/edge-tts) by Microsoft

**Built with:**
- FastAPI
- Python
- Flutter (frontend)
- MongoDB (future)

---

## 📞 Support

For issues and questions:
- 📧 Email: support@vizhiai.com
- 🐛 Issues: GitHub Issues
- 📖 Docs: See documentation files above

---

## ⚠️ Important Notes

1. **Ollama:** Optional but recommended for intelligent features
2. **GPU:** Highly recommended for faster inference
3. **Internet:** Required for Edge TTS and Ollama (if hosted)
4. **Production:** See deployment checklist in documentation

---

**Status:** ✅ **Core features ready for production testing**

**Version:** 2.0

**Last Updated:** July 2025

---

Made with ❤️ for accessibility
