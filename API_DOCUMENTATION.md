# Vizhi AI - API Documentation

## Overview
Vizhi AI is a production-ready multi-agent accessibility companion for visually impaired users. The application provides continuous camera monitoring, voice assistance, obstacle detection, text reading, and emergency services.

## Base URL
- Local: `http://localhost:8001`
- Production: `https://your-domain.com`

## Features Implemented

### ✅ Core AI Agents
1. **Object Detection** - YOLOv8-based real-time object detection
2. **OCR** - EasyOCR for text reading (signs, labels, menus)
3. **Scene Description** - AI-powered environment description
4. **Speech-to-Text** - Faster Whisper for voice commands
5. **Text-to-Speech** - Edge TTS for voice responses

### ✅ Safety & Monitoring
6. **Live Camera Stream** - Continuous frame analysis (500-1000ms intervals)
7. **Safety Agent** - Smart obstacle warning system with no repetitions

### ✅ Assistance Services
8. **Voice Assistant** - Unified voice-to-voice interaction
9. **Navigation** - Location-based guidance (basic implementation)
10. **Emergency SOS** - Emergency alert system

---

## API Endpoints

### 1. Health Check
```
GET /
GET /health
```

**Response:**
```json
{
  "message": "Welcome to Vizhi AI 🚀",
  "version": "2.0",
  "features": [...]
}
```

---

### 2. Object Detection
```
POST /api/detect/
```

**Request:**
- `file`: Image file (multipart/form-data)

**Response:**
```json
{
  "objects": [
    {
      "name": "person",
      "confidence": 0.95,
      "position": "center"
    }
  ]
}
```

**Test:**
```bash
curl -X POST http://localhost:8001/api/detect/ \
  -F "file=@test_image.jpg"
```

---

### 3. OCR (Text Reading)
```
POST /api/ocr/
```

**Request:**
- `file`: Image file with text

**Response:**
```json
{
  "text": "Welcome to the Library"
}
```

**Test:**
```bash
curl -X POST http://localhost:8001/api/ocr/ \
  -F "file=@sign.jpg"
```

---

### 4. Scene Description
```
POST /api/scene/
```

**Request:**
- `file`: Image file

**Response:**
```json
{
  "objects": [...],
  "description": "There is a person ahead and a chair on your left."
}
```

---

### 5. Speech-to-Text
```
POST /api/speech/
```

**Request:**
- `file`: Audio file (wav, mp3, etc.)

**Response:**
```json
{
  "text": "Read the sign ahead",
  "language": "en"
}
```

**Test:**
```bash
curl -X POST http://localhost:8001/api/speech/ \
  -F "file=@voice_command.wav"
```

---

### 6. Text-to-Speech
```
POST /api/tts/
```

**Request:**
- `text`: Text to convert (form data)
- `voice`: Voice name (optional, default: "en-US-AriaNeural")

**Response:**
- Audio file (MP3)

**Test:**
```bash
curl -X POST http://localhost:8001/api/tts/ \
  -F "text=Hello, I am Vizhi AI" \
  -o output.mp3
```

**Get Available Voices:**
```
GET /api/tts/voices
```

---

### 7. Live Camera Stream (Safety Monitoring)
```
POST /api/stream/analyze
```

**Purpose:** Analyze camera frames continuously (call every 500-1000ms)

**Request:**
- `file`: Camera frame image

**Response:**
```json
{
  "objects": [...],
  "warnings": [
    "Caution! Vehicle ahead.",
    "Person on your left."
  ],
  "dangerous_objects": [...],
  "safe": false,
  "total_objects": 5,
  "audio_warning": "audio_outputs/abc123.mp3",
  "warning_text": "Caution! Vehicle ahead. Person on your left."
}
```

**Features:**
- Detects dangerous obstacles (vehicles, stairs, people, etc.)
- Prioritizes warnings (high: vehicles/stairs, medium: people, low: objects)
- Prevents repetitive warnings (5-second cooldown per object/position)
- Automatic audio warning generation

**Test:**
```bash
curl -X POST http://localhost:8001/api/stream/analyze \
  -F "file=@camera_frame.jpg"
```

---

### 8. Voice Assistant (Unified Endpoint)
```
POST /api/assistant/
```

**Purpose:** Complete voice-to-voice interaction

**Request:**
- `user_input`: User's command (transcribed text)
- `image`: Camera image
- `include_audio`: Generate audio response (optional, default: true)

**Response:**
```json
{
  "success": true,
  "agent": "OCR",
  "response": "The text reads: Room 305",
  "audio_path": "audio_outputs/xyz789.mp3"
}
```

**Workflow:**
1. User speaks → Whisper converts to text
2. Planner Agent routes to appropriate agent
3. Agent processes request
4. Response generated
5. Edge TTS converts to speech
6. User hears response

**Test:**
```bash
curl -X POST http://localhost:8001/api/assistant/ \
  -F "user_input=Read the sign" \
  -F "image=@photo.jpg"
```

---

### 9. Planner Agent
```
POST /api/planner/
```

**Purpose:** Route user queries to appropriate agents

**Request:**
```json
{
  "query": "Read the sign ahead"
}
```

**Response:**
```json
{
  "agent": "OCR"
}
```

**Supported Agents:**
- `OCR` - For text reading
- `Object Detection` - For obstacle detection
- `Scene Description` - For environment description
- `Navigation` - For directions
- `Emergency` - For SOS
- `Conversation` - For general queries

---

### 10. Navigation
```
POST /api/navigation/navigate
```

**Request:**
- `destination`: Where to go (form data)
- `current_location`: Current location (optional)
- `image`: Current view (optional)
- `include_audio`: Generate audio (optional, default: true)

**Response:**
```json
{
  "instruction": "Navigating to library. Path is clear.",
  "destination": "library",
  "obstacles": [],
  "safe_to_proceed": true,
  "audio_path": "audio_outputs/nav123.mp3"
}
```

**Get Direction:**
```
POST /api/navigation/direction
```

**Request:**
- `direction`: left/right/forward/backward
- `distance`: Distance info (optional)

---

### 11. Emergency SOS
```
POST /api/emergency/trigger
```

**Request:**
- `user_id`: User identifier (optional)
- `location`: GPS/address (optional)
- `emergency_type`: general/medical/accident (default: general)
- `include_audio`: Generate audio (optional)

**Response:**
```json
{
  "success": true,
  "message": "Emergency services have been notified.",
  "emergency_id": "EMG_20250726103045",
  "timestamp": "2025-07-26T10:30:45",
  "type": "general",
  "audio_path": "audio_outputs/emg456.mp3"
}
```

**Cancel Emergency:**
```
POST /api/emergency/cancel
```

**Request:**
- `emergency_id`: Emergency ID to cancel

---

## Safety Agent Features

### Dangerous Objects Detection
The Safety Agent monitors these object categories:

**High Priority (Immediate Warning):**
- Vehicles: car, truck, bus, motorcycle, bicycle
- Height changes: stairs, escalator

**Medium Priority:**
- Living beings: person, dog, cat
- Obstacles: chair, bench, couch

**Low Priority:**
- Street furniture: fire hydrant, stop sign, parking meter
- Tripping hazards: potted plant, backpack

### Smart Warning System
- **No Repetitions:** Same object/position warned only once per 5 seconds
- **Priority Sorting:** High-priority objects warned first
- **Position Tracking:** Tracks left, center, right positions separately
- **Automatic Cleanup:** Old warnings removed from memory

### Warning Messages
- High Priority: "Caution! Vehicle ahead."
- Medium Priority: "Person on your left."
- Low Priority: "Fire hydrant on your right."

---

## Complete User Flow

### Scenario 1: Hands-Free Navigation
```
1. User opens app
2. Live camera starts → /api/stream/analyze (every 500ms)
3. Safety Agent continuously monitors
4. Detects: Vehicle ahead
5. Audio warning plays: "Caution! Vehicle ahead."
6. User stops and waits
7. Vehicle moves away
8. Path clear, user continues
```

### Scenario 2: Voice Command
```
1. User presses mic button
2. User speaks: "Read the sign"
3. Audio → /api/speech/ → Text: "Read the sign"
4. Text + Image → /api/assistant/
5. Planner routes to OCR Agent
6. OCR extracts: "Emergency Exit"
7. Response: "The text reads: Emergency Exit"
8. TTS generates audio
9. User hears response
```

### Scenario 3: Emergency
```
1. User says: "Help"
2. Planner routes to Emergency Agent
3. /api/emergency/trigger
4. Emergency logged, contacts notified
5. Response: "Emergency services notified. Help is on the way."
6. Audio played to user
```

---

## Integration with Flutter

### Live Camera Stream (Recommended)
```dart
// Send frame every 500-1000ms
Timer.periodic(Duration(milliseconds: 500), (timer) async {
  final XFile? image = await cameraController.takePicture();
  
  final response = await http.post(
    Uri.parse('$baseUrl/api/stream/analyze'),
    body: {
      'file': await MultipartFile.fromFile(image.path),
    },
  );
  
  final data = json.decode(response.body);
  
  // Play audio warning if exists
  if (data['audio_warning'] != null) {
    playAudio(data['audio_warning']);
  }
  
  // Update UI with warnings
  setState(() {
    warnings = data['warnings'];
    isSafe = data['safe'];
  });
});
```

### Voice Assistant Integration
```dart
// Record user voice
final audioPath = await recordAudio();

// Transcribe audio
final transcription = await http.post(
  Uri.parse('$baseUrl/api/speech/'),
  body: {'file': await MultipartFile.fromFile(audioPath)},
);

final userInput = json.decode(transcription.body)['text'];

// Capture image
final image = await cameraController.takePicture();

// Process request
final response = await http.post(
  Uri.parse('$baseUrl/api/assistant/'),
  body: {
    'user_input': userInput,
    'image': await MultipartFile.fromFile(image.path),
    'include_audio': 'true',
  },
);

final data = json.decode(response.body);

// Play audio response
if (data['audio_path'] != null) {
  playAudio('$baseUrl${data['audio_path']}');
}
```

---

## Testing the System

### 1. Test Object Detection
```bash
# Create test image or use existing
curl -X POST http://localhost:8001/api/detect/ \
  -F "file=@test.jpg" | jq
```

### 2. Test Safety Agent
```bash
# Send multiple frames with same objects
curl -X POST http://localhost:8001/api/stream/analyze \
  -F "file=@frame1.jpg"

# Wait 3 seconds and send again
sleep 3
curl -X POST http://localhost:8001/api/stream/analyze \
  -F "file=@frame1.jpg"
# Should NOT repeat warnings

# Wait 6 seconds and send again
sleep 6
curl -X POST http://localhost:8001/api/stream/analyze \
  -F "file=@frame1.jpg"
# Should repeat warnings now
```

### 3. Test TTS
```bash
curl -X POST http://localhost:8001/api/tts/ \
  -F "text=Welcome to Vizhi AI. I am your accessibility companion." \
  -o test_voice.mp3

# Play the audio
# Linux: mpg123 test_voice.mp3
# Mac: afplay test_voice.mp3
```

### 4. Test Complete Flow
```bash
# 1. Create voice command
echo "Read the sign" | \
  text-to-wav > command.wav

# 2. Transcribe
curl -X POST http://localhost:8001/api/speech/ \
  -F "file=@command.wav"

# 3. Process with assistant
curl -X POST http://localhost:8001/api/assistant/ \
  -F "user_input=Read the sign" \
  -F "image=@sign.jpg"
```

---

## Production Deployment Checklist

### Backend
- [ ] Update CORS origins to specific Flutter app domain
- [ ] Set up proper error logging (Sentry, CloudWatch)
- [ ] Configure production database (if needed)
- [ ] Set up API rate limiting
- [ ] Enable HTTPS
- [ ] Configure file upload limits
- [ ] Set up monitoring (health checks, uptime)

### AI Models
- [ ] Optimize YOLO model for mobile (YOLOv8n is already lightweight)
- [ ] Configure Ollama for production
- [ ] Set up model caching
- [ ] Monitor inference times

### Safety Agent
- [ ] Fine-tune warning cooldown (currently 5 seconds)
- [ ] Add more dangerous object categories
- [ ] Implement distance estimation
- [ ] Add severity levels to warnings

### Services
- [ ] Integrate real navigation API (Google Maps, Mapbox)
- [ ] Set up emergency contact system (Twilio SMS/Call)
- [ ] Implement user authentication
- [ ] Add GPS location tracking
- [ ] Set up push notifications

### Performance
- [ ] Implement response caching
- [ ] Optimize image processing pipeline
- [ ] Add request queuing for heavy load
- [ ] Monitor memory usage
- [ ] Set up auto-scaling

---

## Environment Variables

Create `.env` file in `/app/backend/`:

```env
# App Configuration
APP_URL=https://your-domain.com

# AI Models
OLLAMA_HOST=http://localhost:11434

# Services (Future)
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
GOOGLE_MAPS_API_KEY=your_key

# Monitoring
SENTRY_DSN=your_sentry_dsn
```

---

## Architecture Diagram

```
Flutter App (Mobile)
    ↓
    ├─→ Live Camera (500ms intervals)
    │   ↓
    │   POST /api/stream/analyze
    │   ↓
    │   Object Detection (YOLO)
    │   ↓
    │   Safety Agent
    │   ↓
    │   Audio Warning (TTS)
    │
    ├─→ Voice Command
    │   ↓
    │   POST /api/speech/ (Whisper)
    │   ↓
    │   POST /api/assistant/
    │   ↓
    │   Planner Agent (Ollama)
    │   ↓
    │   ├─→ OCR (EasyOCR)
    │   ├─→ Object Detection (YOLO)
    │   ├─→ Scene Description (YOLO + Ollama)
    │   ├─→ Navigation
    │   └─→ Emergency
    │   ↓
    │   Response Generation
    │   ↓
    │   POST /api/tts/ (Edge TTS)
    │   ↓
    │   Audio Response
    │
    └─→ Emergency Button
        ↓
        POST /api/emergency/trigger
        ↓
        Emergency Services + Audio
```

---

## Support & Troubleshooting

### Common Issues

**1. Server not starting:**
```bash
# Check logs
tail -f /var/log/supervisor/backend.err.log

# Restart backend
sudo supervisorctl restart backend
```

**2. Model loading issues:**
- YOLO model: Ensure `yolov8n.pt` exists in `/app/backend/`
- EasyOCR: First run downloads models (takes time)
- Whisper: First run downloads models

**3. Audio generation fails:**
- Check Edge TTS connection
- Verify audio_outputs directory exists
- Check disk space

**4. Slow inference:**
- Use GPU if available (CUDA)
- Reduce image resolution
- Use smaller models
- Enable model quantization

---

## License
MIT License

## Contact
For support, please contact: support@vizhiai.com
