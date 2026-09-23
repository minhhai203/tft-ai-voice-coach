/**
 * Augment Advisor: Evaluates the 3 Augments offered in stages 2-1, 3-2, 4-2.
 */

class AugmentAdvisor {
  constructor(jevClient, voiceEngine, overlayManager) {
    this.jev = jevClient;
    this.voice = voiceEngine;
    this.overlay = overlayManager;
  }

  async onAugmentsOffered(augments, gameState) {
    if (!augments || augments.length === 0) return;

    console.log("[AugmentAdvisor] Evaluating augments:", augments);

    const decision = await this.jev.evaluateAugment(augments, gameState);
    if (!decision) return;

    const bestAugment = decision.selected;
    const voiceText = `Chọn lõi ${bestAugment}, lõi này tỷ lệ thắng cao nhất!`;

    if (this.voice) {
      this.voice.speak(voiceText, true);
    }

    if (this.overlay) {
      this.overlay.showAdvice({
        type: "augment",
        title: "Gợi ý Lõi Công Nghệ",
        message: `Khuyên chọn: ${bestAugment}`,
        details: decision.probabilities,
        color: "warning"
      });
      this.overlay.highlightAugment(bestAugment);
    }
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = AugmentAdvisor;
} else {
  window.AugmentAdvisor = AugmentAdvisor;
}
