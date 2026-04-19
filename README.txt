═══════════════════════════════════════════════════════════
  PlantScan AI — Plant Disease Detector
  University of Northern Philippines · BSCS-3A · 2026
  Pilotin, Gemaimah Joy S. & Villanueva, Jane Nicole P.
═══════════════════════════════════════════════════════════

FILES IN THIS FOLDER
────────────────────
  index.html       ← Open this in your browser to run the app
  style.css        ← All visual styling
  app.js           ← Main app logic (camera, upload, results)
  model-loader.js  ← AI model integration (Teachable Machine)
  README.txt       ← This file


HOW TO RUN (Quick Start)
────────────────────────
  OPTION A — Demo Mode (no AI model needed, for testing UI):
    1. Open index.html in any modern browser (Chrome recommended)
    2. When the modal appears, click "Use Demo (No Real Model)"
    3. Upload any leaf image → click Analyze → see simulated results

  OPTION B — With Real AI Model (for actual plant detection):
    Follow STEP 1 below to train your model first, then paste
    the URL into the app.


STEP 1: TRAIN YOUR AI MODEL (Google Teachable Machine)
──────────────────────────────────────────────────────
  1. Go to:  https://teachablemachine.withgoogle.com/train/image

  2. Create 3 classes:
       • "Healthy"    ← upload healthy leaf photos here
       • "Leaf Spot"  ← upload leaf spot disease photos here
       • "Blight"     ← upload blight disease photos here

     ⚠️  IMPORTANT: The class names MUST be exactly:
         Healthy / Leaf Spot / Blight
         (same capitalisation and spelling)

  3. For each class, upload at least 50–100 images.
     More images = better accuracy.

  4. Click "Train Model" and wait for it to finish.

  5. Click "Export Model" → choose "Upload (shareable link)"
     → click "Upload my model"

  6. Copy the URL shown (looks like):
     https://teachablemachine.withgoogle.com/models/XXXXXXXX/

  7. Paste this URL into the app when it asks for the Model URL.


WHERE TO GET LEAF IMAGES FOR TRAINING
──────────────────────────────────────
  • PlantVillage Dataset (free, most popular):
    https://www.kaggle.com/datasets/emmarex/plantdisease

  • Plant Disease Recognition Dataset:
    https://www.kaggle.com/datasets/rashikrahmanpritom/plant-disease-recognition-dataset

  • GitHub - PlantVillage:
    https://github.com/spMohanty/PlantVillage-Dataset

  Download images, then sort them into folders by class
  before uploading to Teachable Machine.


STEP 2: RUN THE APP
───────────────────
  1. Open  index.html  in Google Chrome or Microsoft Edge
     (Firefox works too but camera may need permission)

  2. A setup dialog will appear. Paste your Teachable Machine
     model URL and click "Load Model".

  3. Wait for "Model ready" in the top-right corner.

  4. To analyse a leaf:
       UPLOAD TAB:  Click the green area or drag-and-drop
                    an image file → click "Analyze Plant"
       CAMERA TAB:  Click "Start Camera" → point at a leaf
                    → click "Capture Photo" → click "Analyze Plant"

  5. Results show:
       • Diagnosis (Healthy / Leaf Spot / Blight)
       • Confidence percentage
       • Breakdown of all class probabilities
       • Recommended action for the farmer


RUNNING ON A PHONE (Optional)
──────────────────────────────
  Method 1 — Same Wi-Fi network:
    1. Install "Live Server" VS Code extension, OR
       run: python -m http.server 8000  (in this folder)
    2. Find your computer's local IP (e.g. 192.168.1.5)
    3. On your phone browser, go to: http://192.168.1.5:8000
    4. The camera tab will use the phone's back camera.

  Method 2 — Free hosting (permanent URL):
    Upload all 4 files to any of these free hosts:
      • Netlify Drop:  https://app.netlify.com/drop
        (drag the whole folder onto the page)
      • GitHub Pages:  Put files in a repo, enable Pages
      • Vercel:        https://vercel.com (import from GitHub)

  Method 3 — GitHub Pages (recommended for school submission):
    1. Create a free account at github.com
    2. Create a new repository
    3. Upload all 4 files
    4. Go to Settings → Pages → Source: main branch → /root
    5. Your app will be live at:
       https://YOUR-USERNAME.github.io/REPO-NAME/


BROWSER REQUIREMENTS
────────────────────
  ✅ Google Chrome 80+      (best)
  ✅ Microsoft Edge 80+
  ✅ Firefox 75+
  ✅ Safari 14+ (Mac/iPhone)
  ❌ Internet Explorer      (not supported)

  Camera feature requires:
    - HTTPS connection (for phones/remote access), OR
    - localhost (for local testing on same computer)


CUSTOMISING CLASS NAMES
────────────────────────
  If you train a model with DIFFERENT class names (e.g. you
  add "Rust" or "Mildew"), open app.js and add entries to the
  DISEASE_INFO object following the existing pattern:

    'Rust': {
      icon:   '🍂',
      theme:  'warning',
      label:  'Rust Disease Detected',
      barClass: 'warning',
      recommendation: 'Your recommendation text here...'
    },

  Any class not in DISEASE_INFO will still work — it'll just
  use a default message and styling.


TROUBLESHOOTING
────────────────
  "Model URL not working"
    → Make sure URL ends with a slash: .../models/XXXX/
    → The model must be published (not just trained locally)
    → Check your internet connection

  "Camera not working"
    → Use Chrome and allow camera permission when asked
    → On phones, use HTTPS (not http://)
    → Try the Upload tab as an alternative

  "Low accuracy predictions"
    → Train with more images (100+ per class)
    → Make sure training images are similar to real field photos
    → Ensure good lighting when capturing leaves


REFERENCES (from Concept Paper)
────────────────────────────────
  Khalid & Karan (2023). Deep learning for plant disease detection.
    DOI: 10.59543/ijmscs.v2i.8343

  Liu & Wang (2021). Plant diseases and pests detection based on
    deep learning: A review. DOI: 10.1186/s13007-021-00722-9

  Nyawose et al. (2025). A review on the detection of plant disease
    using machine learning and deep learning approaches.
    DOI: 10.3390/jimaging11100326

  Pacal et al. (2024). A systematic review of deep learning
    techniques for plant diseases.
    DOI: 10.1007/s10462-024-10944-7

═══════════════════════════════════════════════════════════
