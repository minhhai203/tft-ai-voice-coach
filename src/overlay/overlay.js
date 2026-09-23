/**
 * Overlay View Controller
 * Handles HUD messages, glowing highlight boxes, and animations.
 */

const adviceListEl = document.getElementById("advice-list");
const augmentFrameEl = document.getElementById("augment-highlighter");
const levelGlowEl = document.getElementById("level-button-highlighter");

// Listen for messages from background script
if (typeof overwolf !== 'undefined') {
  overwolf.windows.onMessageReceived.addListener((message) => {
    try {
      const data = JSON.parse(message.content);
      handleMessage(data.action, data.payload);
    } catch (e) {
      console.error("[Overlay] Error handling message:", e);
    }
  });
}

function handleMessage(action, payload) {
  switch (action) {
    case "NEW_ADVICE":
      addAdviceCard(payload);
      break;
    case "HIGHLIGHT_WIDGET":
      if (payload.widgetId === "level-button") {
        toggleLevelHighlight(payload.active);
      }
      break;
    case "HIGHLIGHT_AUGMENT":
      showAugmentHighlight(payload.augmentName);
      break;
    default:
      console.log("[Overlay] Unknown action:", action);
  }
}

function addAdviceCard({ type, title, message, color = "info" }) {
  const card = document.createElement("div");
  card.className = `advice-card ${color}`;
  card.innerHTML = `
    <div class="advice-title">${title}</div>
    <div class="advice-body">${message}</div>
  `;

  // Keep max 3 cards
  if (adviceListEl.children.length >= 3) {
    adviceListEl.removeChild(adviceListEl.firstChild);
  }

  adviceListEl.appendChild(card);

  // Auto remove after 12 seconds
  setTimeout(() => {
    if (card.parentNode === adviceListEl) {
      adviceListEl.removeChild(card);
    }
  }, 12000);
}

function toggleLevelHighlight(active) {
  if (active) {
    levelGlowEl.classList.remove("hidden");
    setTimeout(() => levelGlowEl.classList.add("hidden"), 8000);
  } else {
    levelGlowEl.classList.add("hidden");
  }
}

function showAugmentHighlight(name) {
  // Approximate center augment position for standard 1920x1080
  augmentFrameEl.style.width = "220px";
  augmentFrameEl.style.height = "320px";
  augmentFrameEl.style.left = "850px";
  augmentFrameEl.style.top = "360px";
  augmentFrameEl.classList.remove("hidden");

  setTimeout(() => {
    augmentFrameEl.classList.add("hidden");
  }, 10000);
}
