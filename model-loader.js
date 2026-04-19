/**
 * model-loader.js
 * ─────────────────────────────────────────────────────────
 * Handles loading and running the Google Teachable Machine
 * image classification model via TensorFlow.js.
 * ─────────────────────────────────────────────────────────
 */

const ModelLoader = (() => {

  let model = null;
  let isDemo = false;

  // ── DEMO CLASS NAMES (used when no real model is loaded) ──
  const DEMO_CLASSES = ['Healthy', 'Leaf Spot', 'Blight'];

  /**
   * Load model from a Teachable Machine URL.
   * URL format: https://teachablemachine.withgoogle.com/models/XXXXXXXX/
   */
  async function loadFromURL(modelURL) {
    if (!modelURL.endsWith('/')) modelURL += '/';
    const modelJsonURL = modelURL + 'model.json';
    const metadataURL  = modelURL + 'metadata.json';

    try {
      model = await tmImage.load(modelJsonURL, metadataURL);
      isDemo = false;
      console.log('[ModelLoader] Model loaded. Classes:', model.getTotalClasses());
      return { success: true, classes: getClassNames() };
    } catch (err) {
      console.error('[ModelLoader] Failed to load model:', err);
      return { success: false, error: err.message };
    }
  }

  /**
   * Enable demo mode — uses simulated predictions without a real model.
   * Useful for testing the UI before training a model.
   */
  function enableDemo() {
    model = null;
    isDemo = true;
    console.log('[ModelLoader] Demo mode enabled.');
    return { success: true, classes: DEMO_CLASSES };
  }

  /**
   * Run prediction on an HTMLImageElement or HTMLVideoElement.
   * Returns array of { className, probability }
   */
  async function predict(imageElement) {
    if (isDemo) {
      return simulatePrediction();
    }
    if (!model) throw new Error('Model not loaded.');

    const predictions = await model.predict(imageElement);
    return predictions.map(p => ({
      className: p.className,
      probability: p.probability
    }));
  }

  /**
   * Returns class names from the loaded model or demo list.
   */
  function getClassNames() {
    if (isDemo) return DEMO_CLASSES;
    if (!model)  return [];
    // tmImage stores class names internally
    return model.getClassLabels ? model.getClassLabels() : DEMO_CLASSES;
  }

  /**
   * Simulate a prediction for demo mode.
   * Returns randomised but realistic-looking probabilities.
   */
  function simulatePrediction() {
    const roll = Math.random();
    let probs;

    if (roll < 0.4) {
      // Healthy
      probs = [0.82 + Math.random() * 0.10, 0.06 + Math.random() * 0.06, 0.02 + Math.random() * 0.06];
    } else if (roll < 0.7) {
      // Leaf Spot
      probs = [0.08 + Math.random() * 0.08, 0.78 + Math.random() * 0.12, 0.06 + Math.random() * 0.08];
    } else {
      // Blight
      probs = [0.05 + Math.random() * 0.05, 0.10 + Math.random() * 0.08, 0.78 + Math.random() * 0.12];
    }

    // Normalise so they sum to 1
    const sum = probs.reduce((a, b) => a + b, 0);
    const names = DEMO_CLASSES;

    return names.map((className, i) => ({
      className,
      probability: probs[i] / sum
    }));
  }

  /**
   * Check if a model is ready (real or demo).
   */
  function isReady() {
    return isDemo || model !== null;
  }

  // Public API
  return { loadFromURL, enableDemo, predict, getClassNames, isReady, isDemo: () => isDemo };

})();
