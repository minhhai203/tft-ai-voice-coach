/**
 * Ultra-Low Latency Voice Engine for TFT In-Game Coach
 * Supports:
 *  1. Local Piper TTS (HTTP endpoint: http://127.0.0.1:5000/tts)
 *  2. Native Web Speech API fallback (Chromium built-in, zero dependencies)
 */

class VoiceEngine {
  constructor(options = {}) {
    this.piperUrl = options.piperUrl || "http://127.0.0.1:5000/tts";
    this.lang = options.lang || "vi-VN";
    this.rate = options.rate || 1.15; // slightly faster for gaming reflexes
    this.lastSpokenText = "";
    this.lastSpokenTime = 0;
    this.cooldownMs = options.cooldownMs || 3000;
    this.isSpeaking = false;
    this.queue = [];
  }

  /**
   * Speak a phrase immediately with low latency
   */
  async speak(text, priority = false) {
    if (!text || text.trim() === "") return;

    const now = Date.now();
    if (text === this.lastSpokenText && now - this.lastSpokenTime < this.cooldownMs) {
      return; // prevent duplicate spamming
    }

    this.lastSpokenText = text;
    this.lastSpokenTime = now;

    console.log(`[VoiceEngine] Speaking: "${text}"`);

    // Try Piper TTS local endpoint first for highest performance & natural voice
    const piperSuccess = await this._speakPiper(text);
    if (!piperSuccess) {
      // Fallback to Chromium Web Speech API
      this._speakWebSpeech(text);
    }
  }

  async _speakPiper(text) {
    if (typeof fetch === 'undefined') return false;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 300); // 300ms timeout check

      const response = await fetch(`${this.piperUrl}?text=${encodeURIComponent(text)}`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        await audio.play();
        return true;
      }
    } catch (e) {
      // Piper not running or timed out, will fallback to Web Speech
    }
    return false;
  }

  _speakWebSpeech(text) {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      console.log(`[VoiceEngine] (Console-only mode) "${text}"`);
      return;
    }

    window.speechSynthesis.cancel(); // cancel pending speech for zero latency

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = this.lang;
    utterance.rate = this.rate;

    // Pick best Vietnamese voice if available
    const voices = window.speechSynthesis.getVoices();
    const viVoice = voices.find(v => v.lang.includes("vi") || v.lang.includes("VN"));
    if (viVoice) {
      utterance.voice = viVoice;
    }

    window.speechSynthesis.speak(utterance);
  }
}

// Support both Node and browser environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = VoiceEngine;
} else {
  window.VoiceEngine = VoiceEngine;
}
