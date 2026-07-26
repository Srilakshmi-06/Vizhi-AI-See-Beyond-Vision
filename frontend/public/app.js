/**
 * Vizhi AI Dashboard - Main Application
 */

// ============================================
// Configuration
// ============================================
const API_BASE = window.location.origin;

// ============================================
// State
// ============================================
const state = {
    stream: null,
    monitoring: false,
    monitoringInterval: null,
    framesAnalyzed: 0,
    warningsIssued: 0,
    responseTimes: [],
    isRecording: false,
    mediaRecorder: null,
    audioChunks: [],
    voiceImageFile: null,
};

// Page metadata
const pageMeta = {
    'dashboard': { title: 'Dashboard', subtitle: 'Real-time accessibility monitoring' },
    'live-camera': { title: 'Live Camera', subtitle: 'Continuous obstacle detection with safety alerts' },
    'detection': { title: 'Object Detection', subtitle: 'YOLOv8-powered image analysis' },
    'ocr': { title: 'Read Text', subtitle: 'Extract text from signs, labels, and documents' },
    'scene': { title: 'Scene Description', subtitle: 'AI-generated environment descriptions' },
    'voice-assistant': { title: 'Voice Assistant', subtitle: 'Complete voice-to-voice interaction' },
    'speech': { title: 'Speech to Text', subtitle: 'Convert audio to text with Whisper' },
    'tts': { title: 'Text to Speech', subtitle: 'Natural voice synthesis with Edge TTS' },
    'navigation': { title: 'Navigation', subtitle: 'Smart directions with obstacle awareness' },
    'emergency': { title: 'Emergency SOS', subtitle: 'Instant emergency alert system' },
    'api-docs': { title: 'API Reference', subtitle: 'Complete endpoint documentation' },
};

// API endpoints for documentation
const apiEndpoints = [
    { method: 'POST', path: '/api/stream/analyze', description: 'Analyze camera frame for safety warnings', tag: 'Core' },
    { method: 'POST', path: '/api/assistant/', description: 'Process voice command with image (unified endpoint)', tag: 'Core' },
    { method: 'POST', path: '/api/detect/', description: 'Detect objects in an image using YOLOv8', tag: 'Vision' },
    { method: 'POST', path: '/api/ocr/', description: 'Extract text from an image using EasyOCR', tag: 'Vision' },
    { method: 'POST', path: '/api/scene/', description: 'Generate natural language scene description', tag: 'Vision' },
    { method: 'POST', path: '/api/speech/', description: 'Transcribe audio to text using Whisper', tag: 'Voice' },
    { method: 'POST', path: '/api/tts/', description: 'Convert text to speech audio (MP3)', tag: 'Voice' },
    { method: 'GET', path: '/api/tts/voices', description: 'List all available TTS voices', tag: 'Voice' },
    { method: 'POST', path: '/api/planner/', description: 'Route user query to correct agent', tag: 'AI' },
    { method: 'POST', path: '/api/navigation/navigate', description: 'Get navigation instructions', tag: 'Assist' },
    { method: 'POST', path: '/api/navigation/direction', description: 'Get directional guidance', tag: 'Assist' },
    { method: 'POST', path: '/api/emergency/trigger', description: 'Trigger emergency SOS alert', tag: 'Safety' },
    { method: 'POST', path: '/api/emergency/cancel', description: 'Cancel active emergency', tag: 'Safety' },
    { method: 'GET', path: '/api/stream/health', description: 'Check stream service health', tag: 'Health' },
    { method: 'GET', path: '/api/emergency/health', description: 'Check emergency service health', tag: 'Health' },
    { method: 'GET', path: '/health', description: 'System health check', tag: 'Health' },
];

// ============================================
// Utilities
// ============================================
function $(selector) { return document.querySelector(selector); }
function $$(selector) { return document.querySelectorAll(selector); }

function showToast(message, type = 'info', duration = 3500) {
    const icons = { success: 'circle-check', error: 'circle-xmark', warning: 'triangle-exclamation', info: 'circle-info' };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<i class="fa-solid fa-${icons[type]}"></i><span>${message}</span>`;
    $('#toast-container').appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(20px)';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

function setLoading(button, loading = true) {
    if (loading) {
        button.dataset.originalHtml = button.innerHTML;
        button.disabled = true;
        button.innerHTML = '<div class="spinner"></div><span>Processing...</span>';
    } else {
        button.disabled = false;
        if (button.dataset.originalHtml) {
            button.innerHTML = button.dataset.originalHtml;
        }
    }
}

// ============================================
// Tab Navigation
// ============================================
function switchTab(tabId) {
    $$('.tab-content').forEach(tab => tab.classList.remove('active'));
    $$('.nav-item').forEach(item => item.classList.remove('active'));
    
    const targetTab = $(`#tab-${tabId}`);
    const targetNav = $(`[data-tab="${tabId}"]`);
    
    if (targetTab) targetTab.classList.add('active');
    if (targetNav && targetNav.classList.contains('nav-item')) targetNav.classList.add('active');
    
    // Update page title
    const meta = pageMeta[tabId];
    if (meta) {
        $('#page-title').textContent = meta.title;
        $('#page-subtitle').textContent = meta.subtitle;
    }
    
    // Close mobile sidebar
    $('.sidebar').classList.remove('open');
    
    // Scroll to top
    window.scrollTo(0, 0);
    
    // Update URL hash
    history.replaceState(null, '', `#${tabId}`);
}

// ============================================
// Initialize Navigation
// ============================================
function initNavigation() {
    // Sidebar navigation
    $$('[data-tab]').forEach(element => {
        element.addEventListener('click', (e) => {
            e.preventDefault();
            const tabId = element.dataset.tab;
            switchTab(tabId);
        });
    });
    
    // Menu toggle for mobile
    $('#menu-toggle').addEventListener('click', () => {
        $('.sidebar').classList.toggle('open');
    });
    
    // Initial tab from hash
    const hash = window.location.hash.replace('#', '');
    if (hash && pageMeta[hash]) {
        switchTab(hash);
    }
}

// ============================================
// System Health Check
// ============================================
async function checkSystemHealth() {
    try {
        const response = await fetch(`${API_BASE}/health`);
        if (response.ok) {
            $('#system-status-text').textContent = 'Online';
            $('.status-indicator').classList.remove('offline');
        } else {
            throw new Error('Backend unreachable');
        }
    } catch (error) {
        $('#system-status-text').textContent = 'Offline';
        $('.status-indicator').classList.add('offline');
        showToast('Backend service unreachable', 'error');
    }
}

// ============================================
// Live Camera Feature
// ============================================
async function startCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
        });
        
        const video = $('#camera-video');
        video.srcObject = stream;
        state.stream = stream;
        
        $('#camera-placeholder').style.display = 'none';
        $('#start-camera-btn').disabled = true;
        $('#start-monitoring-btn').disabled = false;
        $('#stop-camera-btn').disabled = false;
        
        showToast('Camera started', 'success');
    } catch (error) {
        showToast('Camera access denied. Please grant permission.', 'error', 5000);
        console.error('Camera error:', error);
    }
}

function stopCamera() {
    if (state.stream) {
        state.stream.getTracks().forEach(track => track.stop());
        state.stream = null;
    }
    
    stopMonitoring();
    
    $('#camera-placeholder').style.display = 'flex';
    $('#start-camera-btn').disabled = false;
    $('#start-monitoring-btn').disabled = true;
    $('#stop-camera-btn').disabled = true;
    
    showToast('Camera stopped', 'info');
}

function captureFrame() {
    const video = $('#camera-video');
    const canvas = $('#camera-canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    return new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.85));
}

async function analyzeFrame() {
    if (!state.stream || !state.monitoring) return;
    
    const startTime = Date.now();
    
    try {
        const blob = await captureFrame();
        const formData = new FormData();
        formData.append('file', blob, 'frame.jpg');
        
        const response = await fetch(`${API_BASE}/api/stream/analyze`, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) throw new Error('Analysis failed');
        
        const data = await response.json();
        const responseTime = Date.now() - startTime;
        
        // Update stats
        state.framesAnalyzed++;
        state.responseTimes.push(responseTime);
        if (state.responseTimes.length > 20) state.responseTimes.shift();
        
        $('#frames-analyzed').textContent = state.framesAnalyzed;
        const avgTime = Math.round(state.responseTimes.reduce((a, b) => a + b, 0) / state.responseTimes.length);
        $('#avg-response-time').textContent = avgTime;
        
        // Update warnings
        if (data.warnings && data.warnings.length > 0) {
            state.warningsIssued += data.warnings.length;
            $('#warnings-issued').textContent = state.warningsIssued;
            updateWarnings(data.warnings, data.dangerous_objects);
            
            // Play audio warning
            if (data.audio_warning) {
                playAudioFile(data.audio_warning);
            }
        }
        
        // Update objects
        updateObjectsList(data.objects || []);
        
    } catch (error) {
        console.error('Frame analysis error:', error);
    }
}

function playAudioFile(audioPath) {
    const audio = $('#warning-audio');
    // Convert local path to serving URL
    const filename = audioPath.split('/').pop();
    audio.src = `${API_BASE}/api/assistant/audio/${filename}`;
    audio.play().catch(err => console.error('Audio play error:', err));
}

function startMonitoring() {
    state.monitoring = true;
    state.framesAnalyzed = 0;
    state.warningsIssued = 0;
    state.responseTimes = [];
    
    $('#frames-analyzed').textContent = '0';
    $('#warnings-issued').textContent = '0';
    $('#avg-response-time').textContent = '-';
    
    $('#stream-status').classList.add('active');
    $('#stream-status span:last-child').textContent = 'Monitoring';
    $('#start-monitoring-btn').innerHTML = '<i class="fa-solid fa-pause"></i><span>Pause Monitoring</span>';
    $('#start-monitoring-btn').onclick = pauseMonitoring;
    
    // Analyze every 800ms
    state.monitoringInterval = setInterval(analyzeFrame, 800);
    
    showToast('Live monitoring started', 'success');
}

function pauseMonitoring() {
    stopMonitoring();
    $('#start-monitoring-btn').innerHTML = '<i class="fa-solid fa-shield-halved"></i><span>Start Monitoring</span>';
    $('#start-monitoring-btn').onclick = startMonitoring;
    showToast('Monitoring paused', 'info');
}

function stopMonitoring() {
    state.monitoring = false;
    if (state.monitoringInterval) {
        clearInterval(state.monitoringInterval);
        state.monitoringInterval = null;
    }
    $('#stream-status').classList.remove('active');
    $('#stream-status span:last-child').textContent = 'Not Monitoring';
}

function updateWarnings(warnings, dangerousObjects) {
    const list = $('#warnings-list');
    list.innerHTML = '';
    
    if (warnings.length === 0) {
        list.innerHTML = '<div class="empty-state"><i class="fa-solid fa-shield-check"></i><p>Environment is safe</p></div>';
        return;
    }
    
    warnings.forEach((warning, idx) => {
        const obj = dangerousObjects[idx];
        const priority = obj ? getPriority(obj.name) : 'high';
        const item = document.createElement('div');
        item.className = `warning-item ${priority}`;
        item.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i><span>${warning}</span>`;
        list.appendChild(item);
    });
    
    // Auto-clear old warnings after 8 seconds
    setTimeout(() => {
        if (list.children.length > 0 && list.firstElementChild.classList.contains('warning-item')) {
            list.firstElementChild.style.opacity = '0.5';
        }
    }, 8000);
}

function getPriority(objectName) {
    const high = ['car', 'truck', 'bus', 'motorcycle', 'bicycle', 'stairs', 'escalator'];
    const medium = ['person', 'dog', 'cat', 'chair', 'bench'];
    if (high.includes(objectName)) return 'high';
    if (medium.includes(objectName)) return 'medium';
    return 'low';
}

function updateObjectsList(objects) {
    const list = $('#objects-list');
    list.innerHTML = '';
    
    if (objects.length === 0) {
        list.innerHTML = '<div class="empty-state"><i class="fa-solid fa-object-group"></i><p>No objects detected</p></div>';
        return;
    }
    
    objects.slice(0, 8).forEach(obj => {
        const item = document.createElement('div');
        item.className = 'object-item';
        const confidence = Math.round(obj.confidence * 100);
        item.innerHTML = `
            <span class="object-name">${obj.name}</span>
            <div class="object-meta">
                <span class="object-position">${obj.position}</span>
                <div class="confidence-bar"><div class="confidence-fill" style="width: ${confidence}%"></div></div>
                <span>${confidence}%</span>
            </div>
        `;
        list.appendChild(item);
    });
}

// ============================================
// Object Detection Feature
// ============================================
function initDetection() {
    setupUpload('#detection-upload', '#detection-file', handleDetectionFile);
}

async function handleDetectionFile(file) {
    const preview = $('#detection-image-preview');
    preview.src = URL.createObjectURL(file);
    $('#detection-results').style.display = 'block';
    
    const list = $('#detection-objects-list');
    list.innerHTML = '<div class="empty-state"><div class="spinner"></div><p>Analyzing image...</p></div>';
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
        const response = await fetch(`${API_BASE}/api/detect/`, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) throw new Error('Detection failed');
        
        const data = await response.json();
        renderDetectedObjects(data.objects, list);
        showToast(`Detected ${data.objects.length} objects`, 'success');
    } catch (error) {
        list.innerHTML = '<div class="empty-state"><i class="fa-solid fa-circle-xmark"></i><p>Detection failed. Please try again.</p></div>';
        showToast('Detection failed', 'error');
    }
}

function renderDetectedObjects(objects, container) {
    container.innerHTML = '';
    
    if (objects.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fa-solid fa-eye-slash"></i><p>No objects detected</p></div>';
        return;
    }
    
    objects.forEach(obj => {
        const item = document.createElement('div');
        item.className = 'object-item';
        const confidence = Math.round(obj.confidence * 100);
        item.innerHTML = `
            <span class="object-name">${obj.name}</span>
            <div class="object-meta">
                <span class="object-position">${obj.position}</span>
                <div class="confidence-bar"><div class="confidence-fill" style="width: ${confidence}%"></div></div>
                <span>${confidence}%</span>
            </div>
        `;
        container.appendChild(item);
    });
}

// ============================================
// OCR Feature
// ============================================
function initOCR() {
    setupUpload('#ocr-upload', '#ocr-file', handleOCRFile);
}

async function handleOCRFile(file) {
    $('#ocr-image-preview').src = URL.createObjectURL(file);
    $('#ocr-results').style.display = 'block';
    $('#ocr-text-result').innerHTML = '<div class="spinner"></div> Extracting text...';
    $('#ocr-play-audio').style.display = 'none';
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
        const response = await fetch(`${API_BASE}/api/ocr/`, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) throw new Error('OCR failed');
        
        const data = await response.json();
        const text = data.text || 'No text detected in the image.';
        $('#ocr-text-result').textContent = text;
        
        if (data.text && data.text.trim()) {
            $('#ocr-play-audio').style.display = 'inline-flex';
            $('#ocr-play-audio').onclick = () => speakText(text);
            showToast('Text extracted successfully', 'success');
        } else {
            showToast('No text found in image', 'warning');
        }
    } catch (error) {
        $('#ocr-text-result').textContent = 'Failed to extract text. Please try again.';
        showToast('OCR failed', 'error');
    }
}

// ============================================
// Scene Description Feature
// ============================================
function initScene() {
    setupUpload('#scene-upload', '#scene-file', handleSceneFile);
}

async function handleSceneFile(file) {
    $('#scene-image-preview').src = URL.createObjectURL(file);
    $('#scene-results').style.display = 'block';
    $('#scene-text-result').innerHTML = '<div class="spinner"></div> Analyzing scene...';
    $('#scene-objects-list').innerHTML = '';
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
        const response = await fetch(`${API_BASE}/api/scene/`, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) throw new Error('Scene analysis failed');
        
        const data = await response.json();
        $('#scene-text-result').textContent = data.description || 'Unable to describe the scene.';
        
        if (data.objects && data.objects.length > 0) {
            const list = document.createElement('div');
            list.style.cssText = 'display: flex; flex-direction: column; gap: 6px;';
            data.objects.forEach(obj => {
                const item = document.createElement('div');
                item.className = 'object-item';
                item.innerHTML = `
                    <span class="object-name">${obj.name}</span>
                    <span class="object-position">${obj.position}</span>
                `;
                list.appendChild(item);
            });
            $('#scene-objects-list').appendChild(list);
        }
        
        showToast('Scene analyzed', 'success');
    } catch (error) {
        $('#scene-text-result').textContent = 'Failed to analyze scene. Note: Scene description requires Ollama.';
        showToast('Scene analysis failed. Requires Ollama.', 'error', 5000);
    }
}

// ============================================
// Voice Assistant Feature
// ============================================
function initVoiceAssistant() {
    const micButton = $('#mic-button');
    micButton.addEventListener('click', toggleRecording);
    
    $('#voice-submit-btn').addEventListener('click', submitVoiceCommand);
    $('#voice-input-text').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') submitVoiceCommand();
    });
    
    $('#voice-image-file').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            state.voiceImageFile = file;
            $('#voice-image-preview').src = URL.createObjectURL(file);
            $('#voice-image-preview-container').style.display = 'block';
        }
    });
    
    $('#clear-conversation').addEventListener('click', () => {
        $('#conversation-messages').innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-comments"></i>
                <p>Start a conversation with Vizhi AI</p>
            </div>
        `;
    });
}

async function toggleRecording() {
    if (state.isRecording) {
        stopRecording();
    } else {
        await startRecording();
    }
}

async function startRecording() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        state.mediaRecorder = new MediaRecorder(stream);
        state.audioChunks = [];
        
        state.mediaRecorder.ondataavailable = (e) => state.audioChunks.push(e.data);
        state.mediaRecorder.onstop = async () => {
            const audioBlob = new Blob(state.audioChunks, { type: 'audio/webm' });
            stream.getTracks().forEach(t => t.stop());
            await processVoiceAudio(audioBlob);
        };
        
        state.mediaRecorder.start();
        state.isRecording = true;
        
        $('#mic-button').classList.add('recording');
        $('#voice-status').textContent = '🎙️ Recording... Click to stop';
    } catch (error) {
        showToast('Microphone access denied', 'error');
    }
}

function stopRecording() {
    if (state.mediaRecorder && state.isRecording) {
        state.mediaRecorder.stop();
        state.isRecording = false;
        $('#mic-button').classList.remove('recording');
        $('#voice-status').textContent = '⏳ Transcribing audio...';
    }
}

async function processVoiceAudio(audioBlob) {
    try {
        // Transcribe audio
        const formData = new FormData();
        formData.append('file', audioBlob, 'recording.webm');
        
        const response = await fetch(`${API_BASE}/api/speech/`, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) throw new Error('Transcription failed');
        
        const data = await response.json();
        const transcription = data.text || '';
        
        if (!transcription.trim()) {
            $('#voice-status').textContent = 'Could not hear anything. Try again.';
            showToast('No speech detected', 'warning');
            return;
        }
        
        $('#voice-input-text').value = transcription;
        $('#voice-status').textContent = `📝 "${transcription}"`;
        
        // Auto-submit if we have an image
        if (state.voiceImageFile) {
            await submitVoiceCommand();
        } else {
            showToast('Transcription complete. Add image or send.', 'info');
        }
    } catch (error) {
        $('#voice-status').textContent = 'Transcription failed';
        showToast('Failed to transcribe audio', 'error');
    }
}

async function submitVoiceCommand() {
    const text = $('#voice-input-text').value.trim();
    if (!text) {
        showToast('Please enter a command', 'warning');
        return;
    }
    
    if (!state.voiceImageFile) {
        showToast('Please attach an image for vision agents', 'warning');
        return;
    }
    
    const button = $('#voice-submit-btn');
    setLoading(button, true);
    
    // Add user message
    addConversationMessage('user', text);
    
    try {
        const formData = new FormData();
        formData.append('user_input', text);
        formData.append('image', state.voiceImageFile);
        formData.append('include_audio', 'true');
        
        const response = await fetch(`${API_BASE}/api/assistant/`, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) throw new Error('Request failed');
        
        const data = await response.json();
        addConversationMessage('ai', data.response, data.agent, data.audio_path);
        
        $('#voice-input-text').value = '';
        $('#voice-status').textContent = '✓ Response received';
        
        showToast(`Response from ${data.agent} agent`, 'success');
    } catch (error) {
        addConversationMessage('ai', 'Sorry, I encountered an error processing your request.', 'Error');
        showToast('Request failed', 'error');
    } finally {
        setLoading(button, false);
    }
}

function addConversationMessage(role, text, agent = null, audioPath = null) {
    const messages = $('#conversation-messages');
    
    // Clear empty state
    const emptyState = messages.querySelector('.empty-state');
    if (emptyState) emptyState.remove();
    
    const message = document.createElement('div');
    message.className = `message ${role}`;
    
    const avatar = role === 'user' ? '<i class="fa-solid fa-user"></i>' : '<i class="fa-solid fa-robot"></i>';
    
    let audioHtml = '';
    if (audioPath) {
        const filename = audioPath.split('/').pop();
        audioHtml = `<audio class="message-audio" controls autoplay src="${API_BASE}/api/assistant/audio/${filename}"></audio>`;
    }
    
    message.innerHTML = `
        <div class="message-avatar">${avatar}</div>
        <div>
            <div class="message-content">${text}</div>
            <div class="message-meta">
                ${agent ? `<span class="agent-badge">${agent}</span>` : ''}
                <span>${new Date().toLocaleTimeString()}</span>
            </div>
            ${audioHtml}
        </div>
    `;
    
    messages.appendChild(message);
    messages.scrollTop = messages.scrollHeight;
}

// ============================================
// Speech to Text Feature
// ============================================
function initSpeech() {
    setupUpload('#speech-upload', '#speech-file', handleSpeechFile);
}

async function handleSpeechFile(file) {
    $('#speech-results').style.display = 'block';
    $('#speech-text-result').innerHTML = '<div class="spinner"></div> Transcribing...';
    $('#speech-language').textContent = '-';
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
        const response = await fetch(`${API_BASE}/api/speech/`, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) throw new Error('Transcription failed');
        
        const data = await response.json();
        $('#speech-text-result').textContent = data.text || 'No speech detected';
        $('#speech-language').textContent = (data.language || 'unknown').toUpperCase();
        showToast('Audio transcribed', 'success');
    } catch (error) {
        $('#speech-text-result').textContent = 'Transcription failed';
        showToast('Transcription failed', 'error');
    }
}

// ============================================
// Text to Speech Feature
// ============================================
function initTTS() {
    $('#tts-generate-btn').addEventListener('click', generateTTS);
    
    // Preset buttons
    $$('.preset-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            $('#tts-text').value = btn.dataset.preset;
        });
    });
}

async function generateTTS() {
    const text = $('#tts-text').value.trim();
    const voice = $('#tts-voice').value;
    
    if (!text) {
        showToast('Please enter text to convert', 'warning');
        return;
    }
    
    const button = $('#tts-generate-btn');
    setLoading(button, true);
    
    try {
        const formData = new FormData();
        formData.append('text', text);
        formData.append('voice', voice);
        
        const response = await fetch(`${API_BASE}/api/tts/`, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) throw new Error('TTS failed');
        
        const blob = await response.blob();
        const audioUrl = URL.createObjectURL(blob);
        
        const player = $('#tts-audio-player');
        player.src = audioUrl;
        $('#tts-audio-container').style.display = 'block';
        player.play();
        
        showToast('Audio generated', 'success');
    } catch (error) {
        showToast('TTS generation failed', 'error');
    } finally {
        setLoading(button, false);
    }
}

async function speakText(text, voice = 'en-US-AriaNeural') {
    try {
        const formData = new FormData();
        formData.append('text', text);
        formData.append('voice', voice);
        
        const response = await fetch(`${API_BASE}/api/tts/`, {
            method: 'POST',
            body: formData
        });
        
        const blob = await response.blob();
        const audio = new Audio(URL.createObjectURL(blob));
        audio.play();
    } catch (error) {
        showToast('Playback failed', 'error');
    }
}

// ============================================
// Navigation Feature
// ============================================
function initNavigationFeature() {
    $('#nav-navigate-btn').addEventListener('click', getNavigation);
    
    $$('.direction-btn').forEach(btn => {
        btn.addEventListener('click', () => getDirection(btn.dataset.direction));
    });
}

async function getNavigation() {
    const destination = $('#nav-destination').value.trim();
    const currentLocation = $('#nav-current-location').value.trim();
    
    if (!destination) {
        showToast('Please enter a destination', 'warning');
        return;
    }
    
    const button = $('#nav-navigate-btn');
    setLoading(button, true);
    
    try {
        const formData = new FormData();
        formData.append('destination', destination);
        if (currentLocation) formData.append('current_location', currentLocation);
        formData.append('include_audio', 'true');
        
        const response = await fetch(`${API_BASE}/api/navigation/navigate`, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) throw new Error('Navigation failed');
        
        const data = await response.json();
        $('#nav-result').style.display = 'block';
        $('#nav-instruction').textContent = data.instruction;
        
        if (data.audio_path) {
            const filename = data.audio_path.split('/').pop();
            const audioUrl = `${API_BASE}/api/assistant/audio/${filename}`;
            $('#nav-audio').src = audioUrl;
            $('#nav-audio').play();
        }
        
        showToast('Directions received', 'success');
    } catch (error) {
        showToast('Navigation failed', 'error');
    } finally {
        setLoading(button, false);
    }
}

async function getDirection(direction) {
    try {
        const formData = new FormData();
        formData.append('direction', direction);
        formData.append('include_audio', 'true');
        
        const response = await fetch(`${API_BASE}/api/navigation/direction`, {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        showToast(data.instruction, 'info');
        
        if (data.audio_path) {
            const filename = data.audio_path.split('/').pop();
            const audio = new Audio(`${API_BASE}/api/assistant/audio/${filename}`);
            audio.play();
        }
    } catch (error) {
        showToast('Direction request failed', 'error');
    }
}

// ============================================
// Emergency SOS Feature
// ============================================
function initEmergency() {
    $('#sos-button').addEventListener('click', triggerSOS);
}

async function triggerSOS() {
    const type = $('#emergency-type').value;
    const location = $('#emergency-location').value.trim();
    
    if (!confirm('Are you sure you want to trigger an emergency alert?')) return;
    
    const button = $('#sos-button');
    setLoading(button, true);
    
    try {
        const formData = new FormData();
        formData.append('emergency_type', type);
        if (location) formData.append('location', location);
        formData.append('include_audio', 'true');
        
        const response = await fetch(`${API_BASE}/api/emergency/trigger`, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) throw new Error('SOS failed');
        
        const data = await response.json();
        
        const resultDiv = $('#emergency-result');
        resultDiv.style.display = 'block';
        resultDiv.innerHTML = `
            <div class="alert alert-success" style="margin-top: 24px;">
                <i class="fa-solid fa-circle-check"></i>
                <div>
                    <strong>Emergency Alert Sent</strong>
                    <p style="margin-top: 4px; font-size: 12px;">${data.message}</p>
                    <p style="margin-top: 8px; font-family: var(--font-mono); font-size: 11px; opacity: 0.8;">ID: ${data.emergency_id}</p>
                </div>
            </div>
        `;
        
        if (data.audio_path) {
            const filename = data.audio_path.split('/').pop();
            const audio = new Audio(`${API_BASE}/api/assistant/audio/${filename}`);
            audio.play();
        }
        
        showToast('SOS triggered successfully', 'success');
    } catch (error) {
        showToast('SOS trigger failed', 'error');
    } finally {
        setLoading(button, false);
        button.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i><span>TRIGGER SOS</span>';
    }
}

// ============================================
// API Docs
// ============================================
function initAPIDocs() {
    const list = $('#api-list');
    apiEndpoints.forEach(endpoint => {
        const item = document.createElement('div');
        item.className = 'api-item';
        item.innerHTML = `
            <span class="api-method method-${endpoint.method.toLowerCase()}">${endpoint.method}</span>
            <span class="api-path">${endpoint.path}</span>
            <span class="api-description">${endpoint.description}</span>
            <span class="api-tag">${endpoint.tag}</span>
        `;
        list.appendChild(item);
    });
}

// ============================================
// File Upload Handling
// ============================================
function setupUpload(uploadSelector, inputSelector, handler) {
    const uploadArea = $(uploadSelector);
    const fileInput = $(inputSelector);
    
    uploadArea.addEventListener('click', () => fileInput.click());
    
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        if (file) handler(file);
    });
    
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) handler(file);
    });
}

// ============================================
// Initialize Application
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initDetection();
    initOCR();
    initScene();
    initVoiceAssistant();
    initSpeech();
    initTTS();
    initNavigationFeature();
    initEmergency();
    initAPIDocs();
    
    // Camera controls
    $('#start-camera-btn').addEventListener('click', startCamera);
    $('#start-monitoring-btn').addEventListener('click', startMonitoring);
    $('#stop-camera-btn').addEventListener('click', stopCamera);
    
    // Health check
    checkSystemHealth();
    setInterval(checkSystemHealth, 30000);
    
    // Welcome toast
    setTimeout(() => {
        showToast('Vizhi AI Dashboard loaded successfully', 'success');
    }, 500);
});
