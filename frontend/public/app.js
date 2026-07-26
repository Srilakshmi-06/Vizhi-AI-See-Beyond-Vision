/**
 * Vizhi AI Dashboard v3
 * Accessibility-first frontend for the multi-agent AI companion
 */

// ============================================================
// Configuration
// ============================================================
const API_BASE = window.location.origin;

const RISK = {
    HIGH: 'high',
    MEDIUM: 'medium',
    LOW: 'low',
};

// COCO objects classified by risk level for visually impaired users
const RISK_MAP = {
    // HIGH — immediate danger
    'car': RISK.HIGH,
    'truck': RISK.HIGH,
    'bus': RISK.HIGH,
    'motorcycle': RISK.HIGH,
    'bicycle': RISK.HIGH,
    'train': RISK.HIGH,
    'boat': RISK.HIGH,
    'airplane': RISK.HIGH,
    'fire hydrant': RISK.HIGH,
    'stop sign': RISK.HIGH,
    'traffic light': RISK.HIGH,
    'parking meter': RISK.HIGH,
    'stairs': RISK.HIGH,
    'escalator': RISK.HIGH,
    'pole': RISK.HIGH,
    'fire': RISK.HIGH,
    'knife': RISK.HIGH,
    'scissors': RISK.HIGH,

    // MEDIUM — obstacles at body level
    'person': RISK.MEDIUM,
    'chair': RISK.MEDIUM,
    'couch': RISK.MEDIUM,
    'bed': RISK.MEDIUM,
    'dining table': RISK.MEDIUM,
    'bench': RISK.MEDIUM,
    'door': RISK.MEDIUM,
    'toilet': RISK.MEDIUM,
    'dog': RISK.MEDIUM,
    'cat': RISK.MEDIUM,
    'horse': RISK.MEDIUM,
    'sheep': RISK.MEDIUM,
    'cow': RISK.MEDIUM,
    'bear': RISK.MEDIUM,
    'suitcase': RISK.MEDIUM,
    'skateboard': RISK.MEDIUM,
    'surfboard': RISK.MEDIUM,
    'tv': RISK.MEDIUM,
    'refrigerator': RISK.MEDIUM,
    'oven': RISK.MEDIUM,
    'microwave': RISK.MEDIUM,
    'sink': RISK.MEDIUM,
};

// Icons for common object categories
const OBJECT_ICONS = {
    'person': 'fa-person',
    'car': 'fa-car',
    'truck': 'fa-truck',
    'bus': 'fa-bus',
    'motorcycle': 'fa-motorcycle',
    'bicycle': 'fa-bicycle',
    'chair': 'fa-chair',
    'couch': 'fa-couch',
    'bed': 'fa-bed',
    'dining table': 'fa-utensils',
    'bench': 'fa-bench',
    'dog': 'fa-dog',
    'cat': 'fa-cat',
    'bottle': 'fa-wine-bottle',
    'cup': 'fa-mug-hot',
    'book': 'fa-book',
    'laptop': 'fa-laptop',
    'keyboard': 'fa-keyboard',
    'mouse': 'fa-computer-mouse',
    'cell phone': 'fa-mobile-screen',
    'tv': 'fa-tv',
    'clock': 'fa-clock',
    'backpack': 'fa-backpack',
    'stop sign': 'fa-hand',
    'traffic light': 'fa-traffic-light',
    'fire hydrant': 'fa-fire-flame-curved',
    'parking meter': 'fa-parking',
    'refrigerator': 'fa-jar',
    'oven': 'fa-fire',
    'microwave': 'fa-square',
    'sink': 'fa-sink',
};

function getRisk(name) {
    return RISK_MAP[name.toLowerCase()] || RISK.LOW;
}

function getObjectIcon(name) {
    return OBJECT_ICONS[name.toLowerCase()] || 'fa-shapes';
}

// Page metadata for topbar
const PAGE_META = {
    'dashboard': { title: 'Live Mode', subtitle: 'Real-time obstacle detection • Voice-first accessibility' },
    'detection': { title: 'Object Detection', subtitle: 'YOLOv8 image analysis with risk classification' },
    'ocr': { title: 'Read Text', subtitle: 'Extract text from signs, labels, and documents' },
    'scene': { title: 'Scene Description', subtitle: 'AI-narrated environment descriptions' },
    'voice-assistant': { title: 'Voice Assistant', subtitle: 'Speak commands, receive spoken responses' },
    'speech': { title: 'Speech to Text', subtitle: 'Whisper-powered audio transcription' },
    'tts': { title: 'Text to Speech', subtitle: 'Natural voice synthesis with Edge TTS' },
    'navigation': { title: 'Navigation', subtitle: 'Directions with obstacle awareness' },
    'emergency': { title: 'Emergency SOS', subtitle: 'Instant alerts to emergency services' },
    'api-docs': { title: 'API Reference', subtitle: 'All backend endpoints' },
};

// API endpoint catalogue
const API_ENDPOINTS = [
    { m: 'POST', p: '/api/stream/analyze', d: 'Analyze live camera frame + safety warnings', t: 'Core' },
    { m: 'POST', p: '/api/assistant/', d: 'Unified voice-to-voice interaction', t: 'Core' },
    { m: 'POST', p: '/api/detect/', d: 'YOLOv8 object detection', t: 'Vision' },
    { m: 'POST', p: '/api/ocr/', d: 'EasyOCR text extraction', t: 'Vision' },
    { m: 'POST', p: '/api/scene/', d: 'Natural language scene description', t: 'Vision' },
    { m: 'POST', p: '/api/speech/', d: 'Faster Whisper speech-to-text', t: 'Voice' },
    { m: 'POST', p: '/api/tts/', d: 'Edge TTS text-to-speech (MP3)', t: 'Voice' },
    { m: 'GET', p: '/api/tts/voices', d: 'List available voices', t: 'Voice' },
    { m: 'POST', p: '/api/planner/', d: 'Route query to correct agent', t: 'AI' },
    { m: 'POST', p: '/api/navigation/navigate', d: 'Get directions to destination', t: 'Assist' },
    { m: 'POST', p: '/api/navigation/direction', d: 'Directional guidance', t: 'Assist' },
    { m: 'POST', p: '/api/emergency/trigger', d: 'Trigger emergency SOS', t: 'Safety' },
    { m: 'POST', p: '/api/emergency/cancel', d: 'Cancel emergency', t: 'Safety' },
    { m: 'GET', p: '/health', d: 'System health check', t: 'Health' },
];

// ============================================================
// Global State
// ============================================================
const state = {
    stream: null,
    monitoring: false,
    monitoringInterval: null,
    lastSceneUpdate: 0,
    framesAnalyzed: 0,
    alertsTriggered: 0,
    responseTimes: [],
    warningCooldown: new Map(),

    voiceState: 'idle',           // idle | listening | processing | speaking
    isRecording: false,
    mediaRecorder: null,
    audioChunks: [],
    voiceImageFile: null,
    lastSceneText: null,
    lastVoiceAgent: null,
    lastResponseAudio: null,
    aiHealth: {},
};

// ============================================================
// DOM helpers
// ============================================================
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

function announce(message) {
    const el = $('#a11y-announcer');
    if (el) {
        el.textContent = '';
        setTimeout(() => { el.textContent = message; }, 50);
    }
}

function showToast(message, type = 'info', duration = 3500) {
    const icons = {
        success: 'circle-check',
        error: 'circle-xmark',
        warning: 'triangle-exclamation',
        info: 'circle-info',
    };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.setAttribute('role', type === 'error' ? 'alert' : 'status');
    toast.innerHTML = `<i class="fa-solid fa-${icons[type]}" aria-hidden="true"></i><span>${message}</span>`;
    $('#toast-stack').appendChild(toast);
    announce(message);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(30px)';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

function setBusy(button, busy, busyText = 'Working…') {
    if (!button) return;
    if (busy) {
        button.dataset._html = button.innerHTML;
        button.disabled = true;
        button.setAttribute('aria-busy', 'true');
        button.innerHTML = `<i class="fa-solid fa-spinner fa-spin" aria-hidden="true"></i><span>${busyText}</span>`;
    } else {
        button.disabled = false;
        button.removeAttribute('aria-busy');
        if (button.dataset._html) {
            button.innerHTML = button.dataset._html;
            delete button.dataset._html;
        }
    }
}

// ============================================================
// Tab navigation
// ============================================================
function switchTab(tabId) {
    $$('.tab-panel').forEach(el => el.classList.remove('active'));
    $$('.nav-btn').forEach(el => {
        el.classList.remove('active');
        el.removeAttribute('aria-current');
    });

    const targetPanel = $(`#tab-${tabId}`);
    const targetBtn = document.querySelector(`.nav-btn[data-tab="${tabId}"]`);

    if (targetPanel) targetPanel.classList.add('active');
    if (targetBtn) {
        targetBtn.classList.add('active');
        targetBtn.setAttribute('aria-current', 'page');
    }

    const meta = PAGE_META[tabId];
    if (meta) {
        $('#page-title').textContent = meta.title;
        $('#page-subtitle').textContent = meta.subtitle;
        document.title = `${meta.title} — Vizhi AI`;
        announce(`${meta.title} page loaded`);
    }

    // Close mobile sidebar
    $('#sidebar').classList.remove('mobile-open');
    $('#sidebar-overlay').classList.remove('open');

    history.replaceState(null, '', `#${tabId}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============================================================
// Sidebar
// ============================================================
function initSidebar() {
    $$('[data-tab]').forEach(el => {
        el.addEventListener('click', (e) => {
            const tabId = el.dataset.tab;
            if (tabId) {
                e.preventDefault();
                switchTab(tabId);
            }
        });
    });

    $('#sidebar-collapse').addEventListener('click', () => {
        document.querySelector('.app-shell').classList.toggle('sidebar-collapsed');
    });

    $('#mobile-menu-toggle').addEventListener('click', () => {
        $('#sidebar').classList.add('mobile-open');
        $('#sidebar-overlay').classList.add('open');
    });

    $('#sidebar-overlay').addEventListener('click', () => {
        $('#sidebar').classList.remove('mobile-open');
        $('#sidebar-overlay').classList.remove('open');
    });

    // Load initial tab from hash
    const hash = window.location.hash.replace('#', '');
    if (hash && PAGE_META[hash]) {
        switchTab(hash);
    }
}

// ============================================================
// System health
// ============================================================
async function pingSystem() {
    try {
        const res = await fetch(`${API_BASE}/health`, { cache: 'no-store' });
        if (res.ok) {
            $('#system-status-text').textContent = 'Online';
            $('.pulse-dot').classList.remove('offline');
            return true;
        }
    } catch (e) { /* handled below */ }
    $('#system-status-text').textContent = 'Offline';
    $('.pulse-dot').classList.add('offline');
    return false;
}

// ============================================================
// AI Services status panel
// ============================================================
function setServiceStatus(service, status) {
    const el = document.querySelector(`.ai-service[data-service="${service}"]`);
    if (!el) return;
    el.setAttribute('data-status', status);
    const statusText = el.querySelector('.service-status');
    if (statusText) {
        statusText.textContent = status === 'online' ? 'Online' :
                                 status === 'offline' ? 'Offline' :
                                 status === 'processing' ? 'Working' :
                                 status === 'degraded' ? 'Degraded' : 'Loading…';
    }
}

async function checkAiServices() {
    // Backend service = required for all others
    const backendOk = await pingSystem();
    if (!backendOk) {
        ['planner', 'detection', 'ocr', 'scene', 'stt', 'tts'].forEach(s => setServiceStatus(s, 'offline'));
        return;
    }

    // Non-LLM services are online whenever backend is
    setServiceStatus('detection', 'online');
    setServiceStatus('ocr', 'online');
    setServiceStatus('stt', 'online');
    setServiceStatus('tts', 'online');

    // Planner + Scene require Ollama — check by calling planner endpoint quickly
    try {
        const res = await fetch(`${API_BASE}/api/planner/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: 'ping' }),
        });
        if (res.ok) {
            const data = await res.json();
            if (data && data.agent) {
                setServiceStatus('planner', 'online');
                setServiceStatus('scene', 'online');
                return;
            }
        }
        setServiceStatus('planner', 'degraded');
        setServiceStatus('scene', 'degraded');
    } catch (e) {
        setServiceStatus('planner', 'degraded');
        setServiceStatus('scene', 'degraded');
    }
}

// ============================================================
// Camera — Live Mode
// ============================================================
function setHudStatus(status, text) {
    const el = $('#camera-hud-status');
    el.setAttribute('data-status', status);
    $('#camera-hud-status-text').textContent = text;
}

function showCameraState(which) {
    $('#camera-idle').hidden = which !== 'idle';
    $('#camera-error').hidden = which !== 'error';
    $('#camera-loading').hidden = which !== 'loading';
    if (which === 'ready') {
        setHudStatus('ready', 'Camera Ready');
    } else if (which === 'idle') {
        setHudStatus('', 'Camera Off');
    }
}

async function startCamera() {
    showCameraState('loading');
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: 'environment',
                width: { ideal: 1280 },
                height: { ideal: 720 },
            },
        });
        const video = $('#camera-video');
        video.srcObject = stream;
        await video.play().catch(() => {});
        state.stream = stream;

        showCameraState('ready');
        $('#start-camera-btn').disabled = true;
        $('#start-monitoring-btn').disabled = false;
        $('#stop-camera-btn').disabled = false;

        showToast('Camera started', 'success');
        announce('Camera is now active. Press Start Monitoring to begin obstacle detection.');
    } catch (err) {
        console.error('Camera error', err);
        const msg = err.name === 'NotAllowedError'
            ? "Camera permission denied. Please allow camera access in your browser settings."
            : err.name === 'NotFoundError'
                ? 'No camera found on this device.'
                : `Could not access camera (${err.name || 'error'}).`;
        $('#camera-error-text').textContent = msg;
        showCameraState('error');
        showToast(msg, 'error', 5000);
    }
}

function stopCamera() {
    stopMonitoring();
    if (state.stream) {
        state.stream.getTracks().forEach(t => t.stop());
        state.stream = null;
    }
    $('#camera-video').srcObject = null;
    showCameraState('idle');
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
    canvas.getContext('2d').drawImage(video, 0, 0);
    return new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.82));
}

async function analyzeFrame() {
    if (!state.stream || !state.monitoring) return;
    const startTime = performance.now();

    try {
        const blob = await captureFrame();
        if (!blob) return;

        const fd = new FormData();
        fd.append('file', blob, 'frame.jpg');

        setServiceStatus('detection', 'processing');
        const res = await fetch(`${API_BASE}/api/stream/analyze`, { method: 'POST', body: fd });
        setServiceStatus('detection', 'online');

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        state.framesAnalyzed++;
        const elapsed = Math.round(performance.now() - startTime);
        state.responseTimes.push(elapsed);
        if (state.responseTimes.length > 20) state.responseTimes.shift();

        const avg = Math.round(state.responseTimes.reduce((a, b) => a + b, 0) / state.responseTimes.length);
        $('#hud-frames').textContent = state.framesAnalyzed;
        $('#hud-latency').textContent = `${avg} ms`;

        updateLiveDetections(data.objects || []);

        if (data.warnings && data.warnings.length) {
            state.alertsTriggered += data.warnings.length;
            $('#hud-alerts').textContent = state.alertsTriggered;
            showLiveWarning(data.warning_text || data.warnings.join(' '));
            if (data.audio_warning) playAudioPath(data.audio_warning);
        }
    } catch (err) {
        console.error('Frame analyze error', err);
        setServiceStatus('detection', 'degraded');
    }
}

function showLiveWarning(text) {
    const banner = $('#camera-warning-banner');
    $('#camera-warning-text').textContent = text;
    banner.hidden = false;
    clearTimeout(banner._t);
    banner._t = setTimeout(() => { banner.hidden = true; }, 4200);
}

function updateLiveDetections(objects) {
    const list = $('#live-detection-list');
    if (!objects.length) {
        if (!list.querySelector('.empty-panel')) {
            list.innerHTML = '<div class="empty-panel"><i class="fa-solid fa-eye-slash"></i><p>No objects detected in view. Environment is safe.</p></div>';
        }
        return;
    }

    // Sort: high risk → medium → low, then by confidence
    const priority = { [RISK.HIGH]: 0, [RISK.MEDIUM]: 1, [RISK.LOW]: 2 };
    const sorted = [...objects].sort((a, b) => {
        const ra = priority[getRisk(a.name)];
        const rb = priority[getRisk(b.name)];
        if (ra !== rb) return ra - rb;
        return b.confidence - a.confidence;
    }).slice(0, 12);

    list.innerHTML = sorted.map(renderDetection).join('');
}

function renderDetection(obj) {
    const risk = getRisk(obj.name);
    const icon = getObjectIcon(obj.name);
    const confidence = Math.round(obj.confidence * 100);
    const positionLabel = obj.position === 'center' ? 'Ahead' : obj.position === 'left' ? 'On Left' : 'On Right';
    return `
        <div class="detection-item risk-${risk}" role="listitem">
            <div class="detection-icon"><i class="fa-solid ${icon}" aria-hidden="true"></i></div>
            <div class="detection-info">
                <span class="detection-name">${obj.name}</span>
                <div class="detection-meta">
                    <span><i class="fa-solid fa-location-crosshairs" aria-hidden="true"></i>${positionLabel}</span>
                    <span><i class="fa-solid fa-ruler" aria-hidden="true"></i>~ Distance</span>
                </div>
            </div>
            <div class="detection-right">
                <span class="risk-tag risk-${risk}">${risk === 'high' ? 'Danger' : risk === 'medium' ? 'Caution' : 'Safe'}</span>
                <span class="confidence">${confidence}%</span>
            </div>
        </div>
    `;
}

function startMonitoring() {
    if (!state.stream) return;
    state.monitoring = true;
    state.framesAnalyzed = 0;
    state.alertsTriggered = 0;
    state.responseTimes = [];
    $('#hud-frames').textContent = '0';
    $('#hud-alerts').textContent = '0';
    $('#hud-latency').textContent = '— ms';
    setHudStatus('monitoring', 'Live Monitoring');

    // Analyze frame every 900 ms for smooth response
    state.monitoringInterval = setInterval(analyzeFrame, 900);

    // Also refresh scene description every 20 seconds automatically
    state.sceneInterval = setInterval(refreshLiveScene, 20000);
    refreshLiveScene();  // initial

    const btn = $('#start-monitoring-btn');
    btn.innerHTML = '<i class="fa-solid fa-pause" aria-hidden="true"></i><span>Pause Monitoring</span>';
    btn.onclick = pauseMonitoring;
    showToast('Live monitoring started', 'success');
    announce('Live monitoring is now active. Warnings will be spoken automatically.');
}

function pauseMonitoring() {
    stopMonitoring();
    const btn = $('#start-monitoring-btn');
    btn.innerHTML = '<i class="fa-solid fa-shield-halved" aria-hidden="true"></i><span>Start Monitoring</span>';
    btn.onclick = startMonitoring;
    setHudStatus('ready', 'Camera Ready');
    showToast('Monitoring paused', 'info');
}

function stopMonitoring() {
    state.monitoring = false;
    if (state.monitoringInterval) clearInterval(state.monitoringInterval);
    if (state.sceneInterval) clearInterval(state.sceneInterval);
    state.monitoringInterval = null;
    state.sceneInterval = null;
}

// ============================================================
// Scene description (Live mode)
// ============================================================
async function refreshLiveScene() {
    if (!state.stream) return;
    const body = $('#live-scene-body');
    body.innerHTML = `<div class="scene-text loading"><i class="fa-solid fa-spinner fa-spin" aria-hidden="true"></i>Analyzing surroundings…</div>`;
    setServiceStatus('scene', 'processing');

    try {
        const blob = await captureFrame();
        if (!blob) throw new Error('No frame');

        const fd = new FormData();
        fd.append('file', blob, 'scene.jpg');

        const res = await fetch(`${API_BASE}/api/scene/`, { method: 'POST', body: fd });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        const desc = data.description || 'Unable to describe the scene right now.';
        state.lastSceneText = desc;
        body.innerHTML = `<div class="scene-text">${escapeHtml(desc)}</div>`;

        $('#scene-footer').hidden = false;
        $('#scene-timestamp').textContent = `Updated ${new Date().toLocaleTimeString()}`;
        setServiceStatus('scene', 'online');
    } catch (err) {
        console.error('Scene error', err);
        body.innerHTML = '<div class="scene-text" style="color: var(--text-3)">Scene description unavailable. Ollama may be offline.</div>';
        setServiceStatus('scene', 'degraded');
    }
}

// ============================================================
// Voice assistant
// ============================================================
function setVoiceState(newState, orbSelector, chipSelector, instructionText) {
    state.voiceState = newState;
    const orb = $(orbSelector);
    const chip = $(chipSelector);
    if (orb) orb.setAttribute('data-state', newState);
    if (chip) {
        chip.setAttribute('data-state', newState);
        chip.textContent = newState.charAt(0).toUpperCase() + newState.slice(1);
    }
    if (instructionText) {
        const targetSel = orbSelector === '#voice-orb' ? '#voice-instruction' : '#va-status-text';
        const el = $(targetSel);
        if (el) el.textContent = instructionText;
    }
}

async function startVoiceRecording(orbSel, chipSel) {
    try {
        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        state.mediaRecorder = new MediaRecorder(audioStream);
        state.audioChunks = [];
        state.mediaRecorder.ondataavailable = (e) => state.audioChunks.push(e.data);
        state.mediaRecorder.onstop = async () => {
            audioStream.getTracks().forEach(t => t.stop());
            const audioBlob = new Blob(state.audioChunks, { type: 'audio/webm' });
            await handleTranscription(audioBlob, orbSel, chipSel);
        };
        state.mediaRecorder.start();
        state.isRecording = true;
        setVoiceState('listening', orbSel, chipSel, 'Listening… Tap again to stop');
        announce('Recording voice');
    } catch (err) {
        console.error(err);
        showToast('Microphone access denied', 'error');
    }
}

function stopVoiceRecording(orbSel, chipSel) {
    if (state.mediaRecorder && state.isRecording) {
        state.mediaRecorder.stop();
        state.isRecording = false;
        setVoiceState('processing', orbSel, chipSel, 'Transcribing…');
    }
}

async function handleTranscription(audioBlob, orbSel, chipSel) {
    try {
        const fd = new FormData();
        fd.append('file', audioBlob, 'voice.webm');
        setServiceStatus('stt', 'processing');
        const res = await fetch(`${API_BASE}/api/speech/`, { method: 'POST', body: fd });
        setServiceStatus('stt', 'online');
        const data = await res.json();
        const transcription = (data.text || '').trim();

        if (!transcription) {
            setVoiceState('idle', orbSel, chipSel, 'I didn\'t catch that. Tap to try again.');
            showToast('No speech detected', 'warning');
            return;
        }

        // Different behavior for Live Mode vs full VA page
        if (orbSel === '#voice-orb') {
            await handleLiveVoiceCommand(transcription, orbSel, chipSel);
        } else {
            $('#va-text-input').value = transcription;
            setVoiceState('idle', orbSel, chipSel, `Heard: "${transcription}"`);
            if (state.voiceImageFile) {
                await submitVoiceAssistant();
            } else {
                showToast('Please attach an image, then send.', 'info');
            }
        }
    } catch (err) {
        console.error(err);
        setVoiceState('idle', orbSel, chipSel, 'Transcription failed. Tap to retry.');
        setServiceStatus('stt', 'degraded');
        showToast('Failed to transcribe audio', 'error');
    }
}

async function handleLiveVoiceCommand(text, orbSel, chipSel) {
    setVoiceState('processing', orbSel, chipSel, `"${text}" — processing…`);

    try {
        // If we have camera, capture a frame; otherwise send text-only via planner
        let imageBlob = null;
        if (state.stream) {
            imageBlob = await captureFrame();
        }

        if (imageBlob) {
            const fd = new FormData();
            fd.append('user_input', text);
            fd.append('image', imageBlob, 'frame.jpg');
            fd.append('include_audio', 'true');
            const res = await fetch(`${API_BASE}/api/assistant/`, { method: 'POST', body: fd });
            const data = await res.json();

            setVoiceState('speaking', orbSel, chipSel, data.response || 'Done.');
            if (data.audio_path) {
                playAudioPath(data.audio_path, () => {
                    setVoiceState('idle', orbSel, chipSel, 'Tap the microphone to speak');
                });
            } else {
                setTimeout(() => setVoiceState('idle', orbSel, chipSel, 'Tap the microphone to speak'), 3000);
            }
        } else {
            // Text-only planner
            const res = await fetch(`${API_BASE}/api/planner/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: text }),
            });
            const data = await res.json();
            const response = `To handle "${text}", the ${data.agent} agent is needed. Please start the camera first for vision-based tasks.`;
            setVoiceState('speaking', orbSel, chipSel, response);
            speakText(response, () => setVoiceState('idle', orbSel, chipSel, 'Tap the microphone to speak'));
        }
    } catch (err) {
        console.error(err);
        setVoiceState('idle', orbSel, chipSel, 'Something went wrong. Tap to try again.');
        showToast('Voice command failed', 'error');
    }
}

async function submitVoiceAssistant() {
    const text = $('#va-text-input').value.trim();
    if (!text) return showToast('Enter or speak a command first', 'warning');
    if (!state.voiceImageFile) return showToast('Attach an image for vision commands', 'warning');

    setVoiceState('processing', null, '#va-state-chip', null);
    const btn = $('#va-submit-btn');
    setBusy(btn, true, 'Processing');

    addConversationMessage('user', text);

    try {
        const fd = new FormData();
        fd.append('user_input', text);
        fd.append('image', state.voiceImageFile);
        fd.append('include_audio', 'true');

        const res = await fetch(`${API_BASE}/api/assistant/`, { method: 'POST', body: fd });
        const data = await res.json();
        addConversationMessage('ai', data.response, data.agent, data.audio_path);
        $('#va-text-input').value = '';
        setVoiceState('idle', null, '#va-state-chip', 'Tap microphone to speak again');
    } catch (err) {
        addConversationMessage('ai', 'Sorry, I ran into an error processing that request.', 'Error');
        showToast('Request failed', 'error');
    } finally {
        setBusy(btn, false);
    }
}

function addConversationMessage(role, text, agent, audioPath) {
    const list = $('#va-conversation');
    const empty = list.querySelector('.empty-panel');
    if (empty) empty.remove();

    const iconClass = role === 'user' ? 'fa-user' : 'fa-robot';
    const audioHtml = audioPath
        ? `<audio class="msg-audio" controls autoplay src="${API_BASE}/api/assistant/audio/${audioPath.split('/').pop()}"></audio>`
        : '';
    const agentHtml = agent ? `<span class="agent-tag">${agent}</span>` : '';

    const el = document.createElement('div');
    el.className = `msg ${role}`;
    el.innerHTML = `
        <div class="msg-avatar"><i class="fa-solid ${iconClass}" aria-hidden="true"></i></div>
        <div class="msg-body">
            <div class="msg-bubble">${escapeHtml(text)}</div>
            <div class="msg-meta">${agentHtml}<span>${new Date().toLocaleTimeString()}</span></div>
            ${audioHtml}
        </div>
    `;
    list.appendChild(el);
    list.scrollTop = list.scrollHeight;
}

// ============================================================
// Audio playback helper
// ============================================================
function playAudioPath(path, onEnded) {
    const filename = path.split('/').pop();
    const src = `${API_BASE}/api/assistant/audio/${filename}`;
    const audio = $('#warning-audio');
    audio.src = src;
    audio.play().catch(err => console.warn('Audio play blocked:', err));
    if (onEnded) audio.onended = onEnded;
}

async function speakText(text, onEnded) {
    try {
        const fd = new FormData();
        fd.append('text', text);
        fd.append('voice', 'en-US-AriaNeural');
        setServiceStatus('tts', 'processing');
        const res = await fetch(`${API_BASE}/api/tts/`, { method: 'POST', body: fd });
        setServiceStatus('tts', 'online');
        const blob = await res.blob();
        const audio = $('#warning-audio');
        audio.src = URL.createObjectURL(blob);
        audio.play();
        if (onEnded) audio.onended = onEnded;
    } catch (err) {
        console.error(err);
        setServiceStatus('tts', 'degraded');
    }
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

// ============================================================
// Individual feature tabs
// ============================================================
function setupUpload(zoneSel, inputSel, handler) {
    const zone = $(zoneSel);
    const input = $(inputSel);
    if (!zone || !input) return;

    zone.addEventListener('click', () => input.click());
    zone.addEventListener('dragover', (e) => { e.preventDefault(); zone.classList.add('dragover'); });
    zone.addEventListener('dragleave', () => zone.classList.remove('dragover'));
    zone.addEventListener('drop', (e) => {
        e.preventDefault();
        zone.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        if (file) handler(file);
    });
    input.addEventListener('change', (e) => { if (e.target.files[0]) handler(e.target.files[0]); });
}

async function handleDetection(file) {
    $('#detection-image-preview').src = URL.createObjectURL(file);
    $('#detection-results').hidden = false;
    const list = $('#detection-objects-list');
    list.innerHTML = '<div class="empty-panel"><i class="fa-solid fa-spinner fa-spin"></i><p>Analyzing image…</p></div>';

    try {
        const fd = new FormData();
        fd.append('file', file);
        const res = await fetch(`${API_BASE}/api/detect/`, { method: 'POST', body: fd });
        const data = await res.json();
        if (!data.objects || !data.objects.length) {
            list.innerHTML = '<div class="empty-panel"><i class="fa-solid fa-eye-slash"></i><p>No objects detected in this image.</p></div>';
            return;
        }
        list.innerHTML = data.objects.map(renderDetection).join('');
        showToast(`Detected ${data.objects.length} objects`, 'success');
    } catch (err) {
        list.innerHTML = '<div class="empty-panel"><i class="fa-solid fa-circle-xmark"></i><p>Detection failed. Please try again.</p></div>';
        showToast('Detection failed', 'error');
    }
}

async function handleOCR(file) {
    $('#ocr-image-preview').src = URL.createObjectURL(file);
    $('#ocr-results').hidden = false;
    const result = $('#ocr-text-result');
    result.innerHTML = '<div class="loading"><i class="fa-solid fa-spinner fa-spin"></i>Extracting text…</div>';
    $('#ocr-play-audio').hidden = true;

    try {
        const fd = new FormData();
        fd.append('file', file);
        const res = await fetch(`${API_BASE}/api/ocr/`, { method: 'POST', body: fd });
        const data = await res.json();
        const text = data.text || 'No text detected in this image.';
        result.textContent = text;
        if (data.text && data.text.trim()) {
            const btn = $('#ocr-play-audio');
            btn.hidden = false;
            btn.onclick = () => speakText(text);
            showToast('Text extracted', 'success');
        } else {
            showToast('No text found', 'warning');
        }
    } catch (err) {
        result.textContent = 'Failed to extract text. Please try again.';
        showToast('OCR failed', 'error');
    }
}

async function handleScene(file) {
    $('#scene-image-preview').src = URL.createObjectURL(file);
    $('#scene-results').hidden = false;
    const result = $('#scene-text-result');
    const objList = $('#scene-page-objects');
    result.innerHTML = '<div class="loading"><i class="fa-solid fa-spinner fa-spin"></i>Analyzing scene…</div>';
    objList.innerHTML = '';

    try {
        const fd = new FormData();
        fd.append('file', file);
        const res = await fetch(`${API_BASE}/api/scene/`, { method: 'POST', body: fd });
        const data = await res.json();
        result.textContent = data.description || 'Unable to describe this scene.';
        if (data.objects && data.objects.length) {
            objList.innerHTML = data.objects.map(renderDetection).join('');
        }
        showToast('Scene analyzed', 'success');
    } catch (err) {
        result.textContent = 'Scene analysis failed. Ollama may be offline.';
        showToast('Scene analysis failed. Requires Ollama.', 'error');
    }
}

async function handleSpeech(file) {
    $('#speech-results').hidden = false;
    const result = $('#speech-text-result');
    result.innerHTML = '<div class="loading"><i class="fa-solid fa-spinner fa-spin"></i>Transcribing…</div>';
    $('#speech-language').textContent = '—';

    try {
        const fd = new FormData();
        fd.append('file', file);
        const res = await fetch(`${API_BASE}/api/speech/`, { method: 'POST', body: fd });
        const data = await res.json();
        result.textContent = data.text || 'No speech detected.';
        $('#speech-language').textContent = (data.language || 'unknown').toUpperCase();
        showToast('Audio transcribed', 'success');
    } catch (err) {
        result.textContent = 'Transcription failed.';
        showToast('Transcription failed', 'error');
    }
}

async function generateTTS() {
    const text = $('#tts-text').value.trim();
    const voice = $('#tts-voice').value;
    if (!text) return showToast('Enter text to convert', 'warning');

    const btn = $('#tts-generate-btn');
    setBusy(btn, true, 'Generating');
    try {
        const fd = new FormData();
        fd.append('text', text);
        fd.append('voice', voice);
        const res = await fetch(`${API_BASE}/api/tts/`, { method: 'POST', body: fd });
        if (!res.ok) throw new Error();
        const blob = await res.blob();
        $('#tts-audio-player').src = URL.createObjectURL(blob);
        $('#tts-audio-wrap').hidden = false;
        $('#tts-audio-player').play();
        showToast('Audio generated', 'success');
    } catch (err) {
        showToast('TTS failed', 'error');
    } finally {
        setBusy(btn, false);
    }
}

async function requestNavigation() {
    const dest = $('#nav-destination').value.trim();
    if (!dest) return showToast('Enter a destination', 'warning');

    const btn = $('#nav-navigate-btn');
    setBusy(btn, true, 'Routing');
    try {
        const fd = new FormData();
        fd.append('destination', dest);
        const cur = $('#nav-current-location').value.trim();
        if (cur) fd.append('current_location', cur);
        fd.append('include_audio', 'true');
        const res = await fetch(`${API_BASE}/api/navigation/navigate`, { method: 'POST', body: fd });
        const data = await res.json();
        $('#nav-result').hidden = false;
        $('#nav-instruction').textContent = data.instruction;
        if (data.audio_path) {
            const filename = data.audio_path.split('/').pop();
            $('#nav-audio').src = `${API_BASE}/api/assistant/audio/${filename}`;
            $('#nav-audio').play();
        }
        showToast('Directions ready', 'success');
    } catch (err) {
        showToast('Navigation failed', 'error');
    } finally {
        setBusy(btn, false);
    }
}

async function requestDirection(direction) {
    try {
        const fd = new FormData();
        fd.append('direction', direction);
        fd.append('include_audio', 'true');
        const res = await fetch(`${API_BASE}/api/navigation/direction`, { method: 'POST', body: fd });
        const data = await res.json();
        showToast(data.instruction, 'info');
        if (data.audio_path) {
            const filename = data.audio_path.split('/').pop();
            const audio = new Audio(`${API_BASE}/api/assistant/audio/${filename}`);
            audio.play();
        }
    } catch (err) {
        showToast('Direction request failed', 'error');
    }
}

async function triggerSOS() {
    if (!confirm('Trigger an emergency alert?')) return;

    const btn = $('#sos-btn');
    setBusy(btn, true, 'Alerting');
    try {
        const fd = new FormData();
        fd.append('emergency_type', $('#emergency-type').value);
        const loc = $('#emergency-location').value.trim();
        if (loc) fd.append('location', loc);
        fd.append('include_audio', 'true');

        const res = await fetch(`${API_BASE}/api/emergency/trigger`, { method: 'POST', body: fd });
        const data = await res.json();

        $('#emergency-result').hidden = false;
        $('#emergency-result').innerHTML = `
            <div class="alert alert-success">
                <i class="fa-solid fa-circle-check" aria-hidden="true"></i>
                <div>
                    <strong>Emergency Alert Sent</strong>
                    <p style="margin-top:6px">${data.message}</p>
                    <p style="margin-top:8px;font-family:monospace;font-size:0.85rem;opacity:0.8">ID: ${data.emergency_id}</p>
                </div>
            </div>
        `;
        if (data.audio_path) {
            const filename = data.audio_path.split('/').pop();
            new Audio(`${API_BASE}/api/assistant/audio/${filename}`).play();
        }
        showToast('SOS triggered', 'success');
        announce('Emergency alert sent successfully.');
    } catch (err) {
        showToast('SOS trigger failed', 'error');
    } finally {
        setBusy(btn, false);
        btn.innerHTML = '<i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i><span>TRIGGER SOS</span>';
    }
}

// ============================================================
// API docs
// ============================================================
function renderApiList() {
    const list = $('#api-list');
    list.innerHTML = API_ENDPOINTS.map(e => `
        <div class="api-item">
            <span class="api-method method-${e.m.toLowerCase()}">${e.m}</span>
            <span class="api-path">${e.p}</span>
            <span class="api-desc">${e.d}</span>
            <span class="api-tag">${e.t}</span>
        </div>
    `).join('');
}

// ============================================================
// Quick actions
// ============================================================
function handleQuickAction(action) {
    switch (action) {
        case 'read':
            if (state.stream) {
                captureAndDo('/api/ocr/', 'file', (data) => {
                    const text = data.text || 'No text detected in view.';
                    showToast(text.length > 60 ? text.slice(0, 60) + '…' : text, 'info', 5000);
                    speakText(text);
                });
            } else {
                switchTab('ocr');
            }
            break;
        case 'describe':
            if (state.stream) {
                refreshLiveScene().then(() => {
                    if (state.lastSceneText) speakText(state.lastSceneText);
                });
            } else {
                switchTab('scene');
            }
            break;
        case 'navigate':
            switchTab('navigation');
            break;
        case 'sos':
            switchTab('emergency');
            break;
    }
}

async function captureAndDo(endpoint, fieldName, callback) {
    try {
        const blob = await captureFrame();
        const fd = new FormData();
        fd.append(fieldName, blob, 'capture.jpg');
        const res = await fetch(`${API_BASE}${endpoint}`, { method: 'POST', body: fd });
        const data = await res.json();
        callback(data);
    } catch (err) {
        showToast('Capture failed', 'error');
    }
}

// ============================================================
// Initialize
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    initSidebar();

    // Live Mode camera controls
    $('#start-camera-btn').addEventListener('click', startCamera);
    $('#stop-camera-btn').addEventListener('click', stopCamera);
    $('#idle-start-btn').addEventListener('click', startCamera);
    $('#error-retry-btn').addEventListener('click', startCamera);
    $('#start-monitoring-btn').addEventListener('click', startMonitoring);
    $('#scene-refresh-btn').addEventListener('click', refreshLiveScene);
    $('#scene-replay-btn').addEventListener('click', () => {
        if (state.lastSceneText) speakText(state.lastSceneText);
    });

    // Live voice orb
    $('#voice-orb').addEventListener('click', () => {
        if (state.isRecording) {
            stopVoiceRecording('#voice-orb', '#voice-state-chip');
        } else {
            startVoiceRecording('#voice-orb', '#voice-state-chip');
        }
    });

    $$('[data-suggestion]').forEach(btn => {
        btn.addEventListener('click', () => {
            const text = btn.dataset.suggestion;
            handleLiveVoiceCommand(text, '#voice-orb', '#voice-state-chip');
        });
    });

    // Quick actions
    $$('[data-quick-action]').forEach(btn => {
        btn.addEventListener('click', () => handleQuickAction(btn.dataset.quickAction));
    });

    // Individual feature tabs
    setupUpload('#detection-upload', '#detection-file', handleDetection);
    setupUpload('#ocr-upload', '#ocr-file', handleOCR);
    setupUpload('#scene-upload', '#scene-file', handleScene);
    setupUpload('#speech-upload', '#speech-file', handleSpeech);

    // Voice Assistant page
    $('#va-mic-btn').addEventListener('click', () => {
        if (state.isRecording) {
            stopVoiceRecording('#va-mic-btn', '#va-state-chip');
        } else {
            startVoiceRecording('#va-mic-btn', '#va-state-chip');
        }
    });
    $('#va-submit-btn').addEventListener('click', submitVoiceAssistant);
    $('#va-text-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') submitVoiceAssistant();
    });
    $('#va-image-file').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            state.voiceImageFile = file;
            $('#va-image-preview').src = URL.createObjectURL(file);
            $('#va-image-preview-wrap').hidden = false;
        }
    });
    $('#va-clear').addEventListener('click', () => {
        $('#va-conversation').innerHTML = `
            <div class="empty-panel">
                <i class="fa-solid fa-comments" aria-hidden="true"></i>
                <p>Start a conversation with Vizhi AI</p>
            </div>
        `;
    });

    // TTS
    $('#tts-generate-btn').addEventListener('click', generateTTS);
    $$('.preset-item').forEach(btn => {
        btn.addEventListener('click', () => {
            $('#tts-text').value = btn.dataset.preset;
            $('#tts-text').focus();
        });
    });

    // Navigation
    $('#nav-navigate-btn').addEventListener('click', requestNavigation);
    $$('.direction-btn').forEach(btn => {
        btn.addEventListener('click', () => requestDirection(btn.dataset.direction));
    });

    // Emergency
    $('#sos-btn').addEventListener('click', triggerSOS);

    // API list
    renderApiList();

    // AI services status
    checkAiServices();
    setInterval(checkAiServices, 45000);

    // Greeting
    setTimeout(() => showToast('Vizhi AI ready — press Start Camera to begin', 'success', 4000), 400);
});
