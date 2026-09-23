/**
 * Mock Simulation Test for TFT AI Voice Coach
 * Runs the advisor pipeline & Jev decision engine locally without launching TFT.
 */

const JevClient = require('../src/ai/jevClient');
const VoiceEngine = require('../src/voice/voiceEngine');
const EconomyAdvisor = require('../src/advisors/economyAdvisor');
const AugmentAdvisor = require('../src/advisors/augmentAdvisor');
const ItemAdvisor = require('../src/advisors/itemAdvisor');
const ShopAdvisor = require('../src/advisors/shopAdvisor');

async function runMockSimulation() {
  console.log("=== BẮT ĐẦU GIẢ LẬP TRẬN ĐẤU TFT (MOCK TEST) ===\n");

  const jev = new JevClient();
  const voice = new VoiceEngine();
  const mockOverlay = {
    showAdvice: (advice) => console.log(`[HUD Overlay] Hiển thị [${advice.type.toUpperCase()}]: ${advice.title} - ${advice.message}`),
    highlightWidget: (id, active) => console.log(`[HUD Overlay] Viền sáng widget: ${id} -> ${active}`),
    highlightAugment: (name) => console.log(`[HUD Overlay] Khung sáng Lõi: ${name}`),
    highlightShopSlot: (slots) => console.log(`[HUD Overlay] Viền sáng shop tướng:`, slots)
  };

  const economyAdvisor = new EconomyAdvisor(jev, voice, mockOverlay);
  const augmentAdvisor = new AugmentAdvisor(jev, voice, mockOverlay);
  const itemAdvisor = new ItemAdvisor(jev, voice, mockOverlay);
  const shopAdvisor = new ShopAdvisor(jev, voice, mockOverlay);
  shopAdvisor.setTargetComp("Ahri AP Carry", ["Ahri", "Poppy", "Zoe"]);

  // 1. Giả lập vòng 2-1: Xuất hiện 3 Lõi nâng cấp
  console.log("\n--- [ROUND 2-1] CHỌN LÕI NÂNG CẤP ---");
  await augmentAdvisor.onAugmentsOffered(
    ["Spellweaver Crown", "Rich Get Richer", "Tiny Titans"],
    { stage: "2-1", gold: 10, hp: 100, level: 3, streak: 0 }
  );

  // 2. Giả lập vòng 2-5: Nhặt được đồ
  console.log("\n--- [ROUND 2-5] KHO ĐỒ CÓ MẢNH MỚI ---");
  await itemAdvisor.onBenchUpdated(
    ["B.F. Sword", "Tear of the Goddess"],
    { stage: "2-5", gold: 18, hp: 92, level: 5, streak: 2 }
  );

  // 3. Giả lập vòng 3-2: Bước ngoặt lên cấp
  console.log("\n--- [ROUND 3-2] BƯỚC NGOẶT KINH TẾ (POWER SPIKE) ---");
  await economyAdvisor.onRoundStart(
    { stage: "3-2", gold: 34, hp: 80, level: 6, streak: 3 }
  );

  // 4. Giả lập Cửa hàng xuất hiện tướng chủ lực
  console.log("\n--- [SHOP REFRESH] TƯỚNG CHỦ LỰC XUẤT HIỆN TRONG CỬA HÀNG ---");
  await shopAdvisor.onShopUpdated(
    ["Kassadin", "Ahri", "Tristana", "Shen", "Blitzcrank"],
    { stage: "3-2", gold: 34, hp: 80, level: 6, streak: 3 }
  );

  console.log("\n=== GIẢ LẬP HOÀN TẤT THÀNH CÔNG! ===");
}

runMockSimulation().catch(console.error);
