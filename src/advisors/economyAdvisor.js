/**
 * Economy Advisor: Decides leveling up, rolling, and interest management.
 */

class EconomyAdvisor {
  constructor(jevClient, voiceEngine, overlayManager) {
    this.jev = jevClient;
    this.voice = voiceEngine;
    this.overlay = overlayManager;
    this.lastEvaluatedRound = null;
  }

  async onRoundStart(gameState) {
    const { stage, gold, hp, streak, level } = gameState;
    if (this.lastEvaluatedRound === stage) return;
    this.lastEvaluatedRound = stage;

    // Critical power spike stages in TFT
    const spikeStages = ["2-1", "2-5", "3-2", "4-1", "4-2", "5-1"];

    if (spikeStages.includes(stage) || streak >= 3) {
      const decision = await this.jev.evaluateLevelUp(gameState);

      if (decision.shouldLevel) {
        const voiceText = `Lên cấp ${level + 1} ngay round này để giữ chuỗi!`;
        const hudText = `UP CẤP ${level + 1}: ${decision.reason} (${Math.round(decision.probability * 100)}%)`;

        if (this.voice) this.voice.speak(voiceText);
        if (this.overlay) {
          this.overlay.showAdvice({
            type: "economy",
            title: "Lên cấp chuẩn",
            message: hudText,
            color: "success"
          });
          this.overlay.highlightWidget("level-button", true);
        }
      } else {
        if (this.overlay) {
          this.overlay.showAdvice({
            type: "economy",
            title: "Quản lý kinh tế",
            message: `Giữ tiền tích lợi tức (Đang có ${gold} vàng)`,
            color: "info"
          });
        }
      }
    }
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = EconomyAdvisor;
} else {
  window.EconomyAdvisor = EconomyAdvisor;
}
