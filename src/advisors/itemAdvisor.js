/**
 * Item Advisor: Suggests craftable items from the bench inventory
 */

// Basic recipe combinations
const ITEM_RECIPES = {
  "B.F. Sword + Needlessly Large Rod": "Hextech Gunblade",
  "B.F. Sword + Tear of the Goddess": "Spear of Shojin",
  "B.F. Sword + B.F. Sword": "Deathblade",
  "B.F. Sword + Recurve Bow": "Giant Slayer",
  "Needlessly Large Rod + Tear of the Goddess": "Archangel's Staff",
  "Needlessly Large Rod + Needlessly Large Rod": "Rabadon's Deathcap",
  "Tear of the Goddess + Tear of the Goddess": "Blue Buff",
  "Chain Vest + Giant's Belt": "Sunfire Cape",
  "Negatron Cloak + Negatron Cloak": "Dragon's Claw",
  "Chain Vest + Chain Vest": "Bramble Vest"
};

class ItemAdvisor {
  constructor(jevClient, voiceEngine, overlayManager) {
    this.jev = jevClient;
    this.voice = voiceEngine;
    this.overlay = overlayManager;
    this.lastCraftAdvised = null;
  }

  getPossibleRecipes(benchComponents) {
    const craftable = [];
    if (!benchComponents || benchComponents.length < 2) return craftable;

    for (let i = 0; i < benchComponents.length; i++) {
      for (let j = i + 1; j < benchComponents.length; j++) {
        const pairA = `${benchComponents[i]} + ${benchComponents[j]}`;
        const pairB = `${benchComponents[j]} + ${benchComponents[i]}`;
        const result = ITEM_RECIPES[pairA] || ITEM_RECIPES[pairB];
        if (result && !craftable.some(c => c.name === result)) {
          craftable.push({
            name: result,
            components: [benchComponents[i], benchComponents[j]]
          });
        }
      }
    }
    return craftable;
  }

  async onBenchUpdated(benchComponents, gameState) {
    const craftable = this.getPossibleRecipes(benchComponents);
    if (craftable.length === 0) return;

    const decision = await this.jev.evaluateItemCraft(craftable, gameState);
    if (!decision || decision.selected === "Hold Items (Do not craft)") return;

    if (this.lastCraftAdvised === decision.selected) return;
    this.lastCraftAdvised = decision.selected;

    const voiceText = `Ghép luôn ${decision.selected} cho tướng chủ lực đi!`;

    if (this.voice) {
      this.voice.speak(voiceText);
    }

    if (this.overlay) {
      this.overlay.showAdvice({
        type: "item",
        title: "Ghép Đồ Chuẩn",
        message: `Khuyên ghép: ${decision.selected}`,
        color: "primary"
      });
    }
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ItemAdvisor;
} else {
  window.ItemAdvisor = ItemAdvisor;
}
