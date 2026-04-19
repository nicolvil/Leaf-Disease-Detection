/**
 * app.js
 * ─────────────────────────────────────────────────────────
 * Main application logic for PlantScan AI.
 * Handles UI state, image input (upload + camera),
 * and orchestrates model prediction + result display.
 * ─────────────────────────────────────────────────────────
 */

// ── STATE ──────────────────────────────────────────────────
let currentTab       = 'upload';
let currentImage     = null; // HTMLImageElement or null
let cameraStream     = null;

// ── DISEASE KNOWLEDGE BASE ─────────────────────────────────
// Maps class names (must match your Teachable Machine labels)
// to UI config and recommendations.
const DISEASE_INFO = {
  'Blight': {
    icon:   '🚨',
    theme:  'diseased',
    label:  'Blight Detected',
    barClass: 'diseased',
    recommendation: `Blight detected — act quickly to prevent crop loss. Remove all 
      infected plant material and dispose of it away from the farm. Apply an appropriate 
      fungicide (e.g., mancozeb or chlorothalonil) according to label instructions. 
      Avoid overhead irrigation. Consider crop rotation next season to reduce pathogen 
      build-up in the soil. Consult your local agricultural extension officer for further guidance.`
  },
  'Rust': {
    icon:   '🍂',
    theme:  'warning',
    label:  'Rust Disease Detected',
    barClass: 'warning',
    recommendation: `Rust disease detected. Remove and destroy all infected leaves 
      immediately. Apply a fungicide containing trifloxystrobin or mancozeb as directed. 
      Avoid wetting the foliage when watering. Improve air circulation around plants 
      and avoid overcrowding. Monitor remaining plants closely for further spread.`
  },
  'Black Spot': {
    icon:   '⚫',
    theme:  'diseased',
    label:  'Black Spot Detected',
    barClass: 'diseased',
    recommendation: `Black spot disease detected. Remove all affected leaves and avoid 
      overhead watering to reduce moisture on leaves. Apply a copper-based or 
      sulphur fungicide regularly. Rake and dispose of fallen leaves around the plant. 
      Ensure good drainage and air circulation to prevent recurrence.`
  },
  'Downy Mildew': {
    icon:   '💧',
    theme:  'warning',
    label:  'Downy Mildew Detected',
    barClass: 'warning',
    recommendation: `Downy mildew detected. Remove and destroy infected plant parts. 
      Apply a fungicide such as metalaxyl or copper hydroxide as directed. 
      Water plants in the morning so leaves dry out during the day. 
      Avoid overcrowding and improve ventilation between plants. 
      Rotate crops next season to break the disease cycle.`
  },
  'Powdery Mildew': {
    icon:   '🌫️',
    theme:  'warning',
    label:  'Powdery Mildew Detected',
    barClass: 'warning',
    recommendation: `Powdery mildew detected. Apply a sulphur-based or potassium 
      bicarbonate fungicide to affected areas. Remove heavily infected leaves. 
      Avoid excessive nitrogen fertilisation which promotes soft leafy growth 
      that is more susceptible. Ensure plants receive adequate sunlight and 
      air circulation. Avoid wetting leaves during watering.`
  }
};

// Fallback for unknown class names
function getDiseaseInfo(className) {
  return DISEASE_INFO[className] || {
    icon:   '🔍',
    theme:  'warning',
    label:  className,
    barClass: 'warning',
    recommendation: `Disease "${className}" detected. Please consult a local 
      agricultural expert or extension officer for specific treatment advice 
      and management strategies for this condition.`
  };
}

// ── INIT ───────────────────────────────────────────────────
// ← PASTE YOUR TEACHABLE MACHINE URL HERE
const MODEL_URL = "https://teachablemachine.withgoogle.com/models/E_SMOGIpY/";

window.addEventListener('DOMContentLoaded', () => {
  setModelStatus('loading', 'Loading model…');

  ModelLoader.loadFromURL(MODEL_URL).then(result => {
    if (result.success) {
      setModelStatus('ready', `Model ready · ${result.classes.length} classes`);
    } else {
      setModelStatus('error', 'Model failed to load');
    }
  });
});

// ── MODEL STATUS ───────────────────────────────────────────
function setModelStatus(state, text) {
  const dot  = document.getElementById('modelStatusDot');
  const label = document.getElementById('modelStatusText');
  dot.className = 'badge-dot';
  if (state === 'ready') dot.classList.add('ready');
  if (state === 'error') dot.classList.add('error');
  label.textContent = text;
}

// ── MODAL LOGIC ────────────────────────────────────────────
function hideModal() {
  document.getElementById('modelModal').style.display = 'none';
}

async function loadModelFromInput() {
  const url = document.getElementById('modelUrlInput').value.trim();
  const errEl = document.getElementById('modalError');
  errEl.style.display = 'none';

  if (!url) {
    showModalError('Please paste a Teachable Machine model URL.');
    return;
  }
  if (!url.includes('teachablemachine.withgoogle.com')) {
    showModalError('URL must be a Google Teachable Machine model URL.');
    return;
  }

  setModelStatus('loading', 'Loading model…');
  const result = await ModelLoader.loadFromURL(url);

  if (result.success) {
    localStorage.setItem('plantScanModelURL', url); // ← saves the URL
    hideModal();
    setModelStatus('ready', `Model ready · ${result.classes.length} classes`);
  } else {
    showModalError('Could not load model. Check the URL and try again.\n' + result.error);
    setModelStatus('error', 'Model failed');
  }
}

function loadDemoModel() {
  const result = ModelLoader.enableDemo();
  hideModal();
  setModelStatus('ready', 'Demo mode (simulated predictions)');
  console.log('[app] Demo mode active. Classes:', result.classes);
}

function showModalError(msg) {
  const el = document.getElementById('modalError');
  el.textContent = msg;
  el.style.display = 'block';
}

// ── TAB SWITCHING ──────────────────────────────────────────
function switchTab(tab) {
  currentTab = tab;
  document.getElementById('tabUpload').classList.toggle('active', tab === 'upload');
  document.getElementById('tabCamera').classList.toggle('active', tab === 'camera');
  document.getElementById('uploadSection').style.display  = tab === 'upload' ? 'block' : 'none';
  document.getElementById('cameraSection').style.display  = tab === 'camera' ? 'block' : 'none';
  if (tab !== 'camera') stopCamera();
}

// ── FILE UPLOAD ─────────────────────────────────────────────
function handleFileSelect(event) {
  const file = event.target.files[0];
  if (file) loadImageFile(file);
}

function handleDragOver(e) {
  e.preventDefault();
  document.getElementById('dropZone').classList.add('dragover');
}
function handleDragLeave(e) {
  document.getElementById('dropZone').classList.remove('dragover');
}
function handleDrop(e) {
  e.preventDefault();
  document.getElementById('dropZone').classList.remove('dragover');
  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith('image/')) loadImageFile(file);
}

function loadImageFile(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    showPreview(e.target.result);
  };
  reader.readAsDataURL(file);
}

// ── CAMERA ─────────────────────────────────────────────────
async function startCamera() {
  try {
    cameraStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } }
    });
    const video = document.getElementById('cameraFeed');
    video.srcObject = cameraStream;
    document.getElementById('captureBtn').disabled = false;
    document.getElementById('startCamBtn').textContent = '⏹ Stop Camera';
    document.getElementById('startCamBtn').onclick = stopCamera;
  } catch (err) {
    alert('Camera access denied or not available. Please use the Upload tab instead.\n\nError: ' + err.message);
  }
}

function stopCamera() {
  if (cameraStream) {
    cameraStream.getTracks().forEach(t => t.stop());
    cameraStream = null;
  }
  const video = document.getElementById('cameraFeed');
  video.srcObject = null;
  document.getElementById('captureBtn').disabled = true;
  document.getElementById('startCamBtn').textContent = '▶ Start Camera';
  document.getElementById('startCamBtn').onclick = startCamera;
}

function capturePhoto() {
  const video  = document.getElementById('cameraFeed');
  const canvas = document.getElementById('cameraCanvas');
  canvas.width  = video.videoWidth  || 640;
  canvas.height = video.videoHeight || 480;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0);
  const dataURL = canvas.toDataURL('image/jpeg');
  showPreview(dataURL);
  stopCamera();
  switchTab('upload'); // flip back so preview is visible
}

// ── PREVIEW ─────────────────────────────────────────────────
function showPreview(src) {
  const img = document.getElementById('previewImage');
  img.src = src;
  currentImage = img;
  document.getElementById('previewWrap').style.display = 'flex';
  // Reset result area
  showState('idle');
}

function clearImage() {
  currentImage = null;
  document.getElementById('previewWrap').style.display = 'none';
  document.getElementById('fileInput').value = '';
  showState('idle');
}

// ── ANALYSE ─────────────────────────────────────────────────
async function analyzeImage() {
  if (!currentImage) return alert('Please select a leaf image first.');
  if (!ModelLoader.isReady()) return alert('Model is not ready yet. Please load a model first.');

  showState('loading');

  try {
    // Give the UI a moment to render the spinner
    await new Promise(r => setTimeout(r, 80));

    const predictions = await ModelLoader.predict(currentImage);
    displayResults(predictions);
  } catch (err) {
    console.error('[app] Prediction error:', err);
    showState('idle');
    alert('Analysis failed: ' + err.message);
  }
}

// ── RESULTS ─────────────────────────────────────────────────
function displayResults(predictions) {
  showState('result');

  // Sort by probability descending
  const sorted = [...predictions].sort((a, b) => b.probability - a.probability);
  const top    = sorted[0];
  const info   = getDiseaseInfo(top.className);

  // Diagnosis card
  const card = document.getElementById('diagnosisCard');
  card.className = `diagnosis-card ${info.theme}`;
  document.getElementById('diagnosisIcon').textContent  = info.icon;
  document.getElementById('diagnosisLabel').textContent = info.label;
  document.getElementById('diagnosisConfidence').textContent =
    `Confidence: ${(top.probability * 100).toFixed(1)}%`;

  // Probability bars
  const barsContainer = document.getElementById('probabilityBars');
  barsContainer.innerHTML = '';
  sorted.forEach(pred => {
    const pInfo = getDiseaseInfo(pred.className);
    const pct   = (pred.probability * 100).toFixed(1);
    const row   = document.createElement('div');
    row.className = 'prob-bar-row';
    row.innerHTML = `
      <div class="prob-bar-header">
        <span>${pred.className}</span>
        <span>${pct}%</span>
      </div>
      <div class="prob-bar-track">
        <div class="prob-bar-fill ${pInfo.barClass}" style="width: 0%"
             data-target="${pct}"></div>
      </div>
    `;
    barsContainer.appendChild(row);
  });

  // Animate bars
  requestAnimationFrame(() => {
    document.querySelectorAll('.prob-bar-fill').forEach(bar => {
      bar.style.width = bar.dataset.target + '%';
    });
  });

  // Recommendation
  document.getElementById('recommendationText').textContent = info.recommendation;
}

// ── UI STATE MACHINE ─────────────────────────────────────────
function showState(state) {
  document.getElementById('idleState').style.display    = state === 'idle'    ? '' : 'none';
  document.getElementById('loadingState').style.display = state === 'loading' ? '' : 'none';
  document.getElementById('resultState').style.display  = state === 'result'  ? '' : 'none';
}
