/**
 * TFT AI Voice Coach - Background Service
 * Manages Overwolf Game Events, State Tracking, and AI Advisors.
 */

const g_interestedInFeatures = [
  'counters',
  'match_info',
  'me',
  'roster',
  'store',
  'board',
  'bench',
  'carousel',
  'live_client_data',
  'augments',
  'game_info'
];

class BackgroundApp {
  constructor() {
    this.gameState = {
      stage: "1-1",
      gold: 0,
      hp: 100,
      level: 1,
      streak: 0,
      benchItems: [],
      boardUnits: [],
      shopUnits: [],
      augments: []
    };

    // Initialize Subsystems
    this.jev = new JevClient();
    this.voice = new VoiceEngine();
    
    // Virtual Overlay Manager that proxies to the Overlay window
    this.overlay = {
      showAdvice: (advice) => this.sendToOverlay("NEW_ADVICE", advice),
      highlightWidget: (widgetId, active) => this.sendToOverlay("HIGHLIGHT_WIDGET", { widgetId, active }),
      highlightAugment: (augmentName) => this.sendToOverlay("HIGHLIGHT_AUGMENT", { augmentName }),
      highlightShopSlot: (slots) => this.sendToOverlay("HIGHLIGHT_SHOP", { slots })
    };

    // Initialize Advisors
    this.economyAdvisor = new EconomyAdvisor(this.jev, this.voice, this.overlay);
    this.augmentAdvisor = new AugmentAdvisor(this.jev, this.voice, this.overlay);
    this.itemAdvisor = new ItemAdvisor(this.jev, this.voice, this.overlay);
    this.shopAdvisor = new ShopAdvisor(this.jev, this.voice, this.overlay);

    // Default target comp example
    this.shopAdvisor.setTargetComp("Ahri AP Carry", ["Ahri", "Poppy", "Zoe", "Lillia"]);

    this.overlayWindowId = null;
    this.init();
  }

  init() {
    console.log("[BackgroundApp] Initializing TFT AI Voice Coach...");

    if (typeof overwolf === 'undefined') {
      console.warn("[BackgroundApp] Overwolf environment not detected. Ready for standalone/mock tests.");
      return;
    }

    this.setupOverwolfEvents();
  }

  setupOverwolfEvents() {
    overwolf.games.onGameInfoUpdated.addListener((res) => {
      if (this.isTftRunning(res)) {
        this.openOverlay();
        this.registerGameEvents();
      } else {
        this.closeOverlay();
        this.unregisterGameEvents();
      }
    });

    overwolf.games.getRunningGameInfo((res) => {
      if (this.isTftRunning(res)) {
        this.openOverlay();
        this.registerGameEvents();
      }
    });
  }

  isTftRunning(gameInfoResult) {
    if (!gameInfoResult) return false;
    const info = gameInfoResult.gameInfo || gameInfoResult;
    if (!info || !info.isRunning) return false;
    // TFT game class id
    return Math.floor(info.id / 10) === 5426;
  }

  openOverlay() {
    overwolf.windows.obtainDeclaredWindow("overlay", (result) => {
      if (result.status === "success") {
        this.overlayWindowId = result.window.id;
        overwolf.windows.restore(this.overlayWindowId, (restoreRes) => {
          console.log("[BackgroundApp] Overlay window restored:", restoreRes);
        });
      }
    });
  }

  closeOverlay() {
    if (this.overlayWindowId) {
      overwolf.windows.close(this.overlayWindowId);
    }
  }

  sendToOverlay(action, payload) {
    if (typeof overwolf !== 'undefined') {
      overwolf.windows.sendMessage(this.overlayWindowId, JSON.stringify({ action, payload }), () => {});
    }
    console.log(`[Overlay Dispatch] ${action}:`, payload);
  }

  registerGameEvents() {
    overwolf.games.events.setRequiredFeatures(g_interestedInFeatures, (info) => {
      if (info.status === "error") {
        console.warn("[BackgroundApp] Retrying setRequiredFeatures in 2s...");
        setTimeout(() => this.registerGameEvents(), 2000);
        return;
      }
      console.log("[BackgroundApp] Features set successfully:", info);
    });

    overwolf.games.events.onInfoUpdates2.addListener(this.onInfoUpdate.bind(this));
    overwolf.games.events.onNewEvents.addListener(this.onNewEvent.bind(this));
  }

  unregisterGameEvents() {
    if (typeof overwolf !== 'undefined') {
      overwolf.games.events.onInfoUpdates2.removeListener(this.onInfoUpdate.bind(this));
      overwolf.games.events.onNewEvents.removeListener(this.onNewEvent.bind(this));
    }
  }

  onInfoUpdate(info) {
    if (!info || !info.info) return;
    const data = info.info;

    // 1. Match info updates (Stage, Gold, Level)
    if (data.match_info) {
      if (data.match_info.round_type || data.match_info.stage) {
        this.gameState.stage = data.match_info.stage || this.gameState.stage;
        this.economyAdvisor.onRoundStart(this.gameState);
      }
      if (data.match_info.gold) this.gameState.gold = parseInt(data.match_info.gold, 10);
      if (data.match_info.level) this.gameState.level = parseInt(data.match_info.level, 10);
      if (data.match_info.health) this.gameState.hp = parseInt(data.match_info.health, 10);
    }

    // 2. Bench Items updates
    if (data.bench) {
      try {
        const benchData = typeof data.bench === 'string' ? JSON.parse(data.bench) : data.bench;
        if (Array.isArray(benchData)) {
          this.gameState.benchItems = benchData;
          this.itemAdvisor.onBenchUpdated(this.gameState.benchItems, this.gameState);
        }
      } catch (e) {}
    }

    // 3. Shop units updates
    if (data.store) {
      try {
        const storeData = typeof data.store === 'string' ? JSON.parse(data.store) : data.store;
        if (Array.isArray(storeData)) {
          this.gameState.shopUnits = storeData;
          this.shopAdvisor.onShopUpdated(this.gameState.shopUnits, this.gameState);
        }
      } catch (e) {}
    }

    // 4. Augments updates
    if (data.augments) {
      try {
        const augData = typeof data.augments === 'string' ? JSON.parse(data.augments) : data.augments;
        if (Array.isArray(augData) && augData.length > 0) {
          this.gameState.augments = augData;
          this.augmentAdvisor.onAugmentsOffered(this.gameState.augments, this.gameState);
        }
      } catch (e) {}
    }
  }

  onNewEvent(events) {
    if (!events || !events.events) return;
    for (const evt of events.events) {
      console.log("[BackgroundApp] Event fired:", evt.name, evt.data);
      if (evt.name === "round_start") {
        this.economyAdvisor.onRoundStart(this.gameState);
      }
    }
  }
}

// Start app
const app = new BackgroundApp();
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BackgroundApp;
}
