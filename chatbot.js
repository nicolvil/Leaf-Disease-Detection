/**
 * chatbot.js — PlantScan AI
 * Uses gemini-1.5-flash (free tier compatible)
 */

const GEMINI_API_KEY = "AIzaSyBq9Wwwmv-H0AKl0c1qjrBAVO5vM-gME1E";
const GEMINI_URL     = `https://generativelanguage.googleapis.com/v1b/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

let chatHistory    = [];
let currentDisease = null;
let isChatOpen     = false;
let isTyping       = false;

function buildSystemPrompt() {
  const diseaseContext = currentDisease
    ? `The farmer just scanned a leaf and the AI detected: "${currentDisease}". Use this as context when answering.`
    : `No disease scan has been done yet.`;

  return `You are PlantScan AI Assistant, a helpful agricultural chatbot designed 
specifically to help Filipino farmers manage plant diseases and crop health.

${diseaseContext}

Your role:
- Answer questions about plant diseases, symptoms, treatments, and prevention
- Give practical, affordable advice suitable for small farmers in the Philippines
- Recommend locally available pesticides or organic alternatives when possible
- Be simple and clear — farmers may not have technical backgrounds
- You may respond in English or Filipino/Tagalog depending on what the farmer uses
- Keep answers concise and actionable

You only answer questions related to:
- Plant diseases and symptoms
- Crop management and treatment
- Pesticides and organic remedies
- Farming practices and prevention
- The detected disease (if any)

If asked about unrelated topics, politely redirect the conversation back to plant health.
Always be warm, encouraging, and supportive to farmers.`;
}

function toggleChat() {
  isChatOpen = !isChatOpen;
  const chatWindow = document.getElementById('chatWindow');
  const chatBubble = document.getElementById('chatBubble');
  chatWindow.style.display = isChatOpen ? 'flex' : 'none';
  chatBubble.classList.toggle('open', isChatOpen);

  if (isChatOpen && chatHistory.length === 0) {
    appendMessage('bot', getWelcomeMessage());
  }
  if (isChatOpen) {
    document.getElementById('chatInput').focus();
  }
}

function getWelcomeMessage() {
  if (currentDisease) {
    return `Hello! 👋 I see your plant was diagnosed with <strong>${currentDisease}</strong>. I'm here to help! Ask me anything about this disease — treatment, prevention, what products to use, and more.`;
  }
  return `Hello! 👋 I'm your PlantScan AI Assistant. Scan a leaf first, or feel free to ask me anything about plant diseases and crop health!`;
}

async function sendChatMessage() {
  const input   = document.getElementById('chatInput');
  const message = input.value.trim();
  if (!message || isTyping) return;

  input.value = '';
  appendMessage('user', message);
  chatHistory.push({ role: 'user', parts: [{ text: message }] });

  showTypingIndicator();

  try {
    const contents = chatHistory.map(m => ({
      role: m.role,
      parts: m.parts
    }));

    const response = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: buildSystemPrompt() }]
        },
        contents: contents
      })
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message);
    }

    const reply = data.candidates[0].content.parts[0].text;
    chatHistory.push({ role: 'model', parts: [{ text: reply }] });

    hideTypingIndicator();
    appendMessage('bot', reply);

  } catch (err) {
    hideTypingIndicator();
    console.error('[Chatbot] Error:', err);
    appendMessage('bot', `⚠️ ${err.message}`);
  }
}

function appendMessage(sender, text) {
  const messages = document.getElementById('chatMessages');
  const bubble   = document.createElement('div');
  bubble.className = `chat-bubble ${sender}`;

  const formatted = text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br>');

  bubble.innerHTML = formatted;
  messages.appendChild(bubble);
  messages.scrollTop = messages.scrollHeight;
}

function showTypingIndicator() {
  isTyping = true;
  document.getElementById('sendChatBtn').disabled = true;
  const messages  = document.getElementById('chatMessages');
  const indicator = document.createElement('div');
  indicator.className = 'chat-bubble bot typing-indicator';
  indicator.id        = 'typingIndicator';
  indicator.innerHTML = '<span></span><span></span><span></span>';
  messages.appendChild(indicator);
  messages.scrollTop = messages.scrollHeight;
}

function hideTypingIndicator() {
  isTyping = false;
  document.getElementById('sendChatBtn').disabled = false;
  const indicator = document.getElementById('typingIndicator');
  if (indicator) indicator.remove();
}

function handleChatKeydown(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendChatMessage();
  }
}

function notifyDiagnosis(diseaseName) {
  currentDisease = diseaseName;
  if (isChatOpen && chatHistory.length > 0) {
    appendMessage('bot', `🔍 New scan result: <strong>${diseaseName}</strong> detected. Feel free to ask me about this!`);
  }
  document.getElementById('chatBubble').classList.add('has-result');
}
