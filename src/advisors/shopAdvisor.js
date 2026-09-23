/**
 * Shop Advisor: Detects key champions appearing in the shop.
 */

class ShopAdvisor {
  constructor(jevClient, voiceEngine, overlayManager) {
    this.jev = jevClient;
    this.voice = voiceEngine;
    this.overlay = overlayManager;
    this.keyChampions = [];
  }

  setTargetComp(compName, desiredChampions) {
    this.targetComp = compName;
    this.keyChampions = desiredChampions || [];
  }

  async onShopUpdated(shopUnits, gameState) {
    if (!shopUnits || shopUnits.length === 0) return;

    // Filter units matching key champions
    const foundKeys = shopUnits.filter(unit => 
      this.keyChampions.some(key => key.toLowerCase() === (unit.name || unit).toLowerCase())
    );

    if (foundKeys.length > 0) {
      const champName = foundKeys[0].name || foundKeys[0];
      const voiceText = `Có ${champName} trong cửa hàng kìa, mua ngay!`;

      if (this.voice) {
        this.voice.speak(voiceText);
      }

      if (this.overlay) {
        this.overlay.showAdvice({
          type: "shop",
          title: "Tướng Cần Mua",
          message: `Shop có: ${champName}`,
          color: "accent"
        });
        this.overlay.highlightShopSlot(foundKeys);
      }
    }
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ShopAdvisor;
} else {
  window.ShopAdvisor = ShopAdvisor;
}
