/**
 * Jev AI Decision Engine Client (TypeSafe AI)
 * Provides structured, zero-latency probabilistic decisions (Choice, Noul, Score).
 */

class JevClient {
  constructor(apiKey) {
    this.apiKey = apiKey || (typeof process !== 'undefined' ? process.env.TYPESAFE_API_KEY : null);
    this.isMockMode = !this.apiKey;
    if (this.isMockMode) {
      console.warn("[JevClient] No TYPESAFE_API_KEY found. Running in Smart Mock Mode for local testing.");
    }
  }

  /**
   * Set API key dynamically
   */
  setApiKey(key) {
    this.apiKey = key;
    this.isMockMode = !key;
  }

  /**
   * Evaluates economic decision: Should the player level up?
   * Uses Jev Noul (Bernoulli probability [0.0 - 1.0])
   */
  async evaluateLevelUp(state) {
    const { stage, gold, hp, streak, level } = state;

    if (!this.isMockMode) {
      try {
        const { TypeSafeClient, Noul } = require('@typesafe-ai/sdk');
        const client = new TypeSafeClient({ apiKey: this.apiKey });
        const result = await client.evaluate({
          state,
          decisions: {
            shouldLevel: new Noul({
              question: `In TFT stage ${stage} with ${gold} gold, level ${level}, and streak ${streak}, should the player level up right now?`
            })
          }
        });
        return {
          shouldLevel: result.shouldLevel.probability > 0.65,
          probability: result.shouldLevel.probability,
          reason: result.shouldLevel.probability > 0.65 ? "Giữ chuỗi thắng và tăng tỉ lệ ra tướng tier cao" : "Nên tích lợi tức kinh tế"
        };
      } catch (err) {
        console.error("[JevClient] Error evaluating with Jev API:", err);
      }
    }

    // Smart heuristic mock fallback
    let prob = 0.2;
    if (stage === "2-5" && gold >= 10) prob = 0.85;
    else if (stage === "3-2" && gold >= 30) prob = 0.90;
    else if (stage === "4-1" && gold >= 40) prob = 0.88;
    else if (streak >= 3 && gold >= 20) prob = 0.78;

    return {
      shouldLevel: prob > 0.65,
      probability: prob,
      reason: prob > 0.65 ? `Đang có mốc cấp chuẩn ở ${stage}, lên cấp giữ lợi thế!` : "Tiết kiệm tiền giữ mốc 50 vàng"
    };
  }

  /**
   * Evaluates Augment selection: Which augment is best?
   * Uses Jev Choice (Select best option from list + probabilities)
   */
  async evaluateAugment(augments, state) {
    if (!augments || augments.length === 0) return null;

    if (!this.isMockMode) {
      try {
        const { TypeSafeClient, Choice } = require('@typesafe-ai/sdk');
        const client = new TypeSafeClient({ apiKey: this.apiKey });
        const result = await client.evaluate({
          state,
          decisions: {
            bestAugment: new Choice({
              question: "Given the player's current comp and stage, which augment provides the highest win rate?",
              options: augments
            })
          }
        });
        return {
          selected: result.bestAugment.selected,
          probabilities: result.bestAugment.probabilities
        };
      } catch (err) {
        console.error("[JevClient] Augment evaluation error:", err);
      }
    }

    // Default mock: choose first or prioritized augment
    return {
      selected: augments[0],
      probabilities: augments.map((aug, idx) => ({ option: aug, prob: idx === 0 ? 0.6 : 0.2 }))
    };
  }

  /**
   * Evaluates Item Crafting: Which item should be crafted now?
   * Uses Jev Choice
   */
  async evaluateItemCraft(craftableItems, state) {
    if (!craftableItems || craftableItems.length === 0) return null;

    const options = craftableItems.map(i => i.name).concat(["Hold Items (Do not craft)"]);

    if (!this.isMockMode) {
      try {
        const { TypeSafeClient, Choice } = require('@typesafe-ai/sdk');
        const client = new TypeSafeClient({ apiKey: this.apiKey });
        const result = await client.evaluate({
          state,
          decisions: {
            craftDecision: new Choice({
              question: "Which item should the player craft immediately to preserve health or maximize power?",
              options
            })
          }
        });
        return {
          selected: result.craftDecision.selected,
          probabilities: result.craftDecision.probabilities
        };
      } catch (err) {
        console.error("[JevClient] Item evaluation error:", err);
      }
    }

    return {
      selected: craftableItems[0].name,
      probabilities: options.map((opt, idx) => ({ option: opt, prob: idx === 0 ? 0.7 : 0.15 }))
    };
  }
}

// Support both Node and browser environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = JevClient;
} else {
  window.JevClient = JevClient;
}
