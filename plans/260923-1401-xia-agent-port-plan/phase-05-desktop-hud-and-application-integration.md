---
phase: 5
title: "Desktop HUD and application integration"
status: pending
priority: P1
effort: "3–4 ngày tập trung; Windows nghiệm thu ở P6"
dependencies: [1,2,3,4]
---

# Pha 5 — Desktop, HUD tĩnh và ghép ứng dụng

## Phạm vi và owner

P5 là **owner duy nhất** sửa các entrypoint/runtime file chung: `src/background/background.js`, `background.html`, `src/overlay/overlay.js`, `overlay.html`, `overlay.css`, `manifest.json`, `test/mock_game_events.js`, `README.md`. Tạo `src/desktop/desktop.js`, `desktop.html`, `desktop.css` và integration tests. Không sửa package baseline(P1), core(P2), coaching/catalog(P3), voice/service/Jev implementation(P4); lỗi interface trả đúng owner và coordinator cập nhật [contracts.md](./contracts.md) trước khi ghép.

Source tham khảo: Overwolf sample startup/listener concepts, không copy verbatim thiếu license. Local hiện chỉ có overlay in_game_only và close khi game thoát nên chưa đủ pregame/postgame. Đây là integration mới, không transplant desktop Rust/Synapse hoặc launcher sample có lỗi cleanup. Baseline flags liveAdaptive/inGameVoice/jev/capture vẫn false tới capability gate tương ứng; không thêm mic/OCR/framework.

## Hợp đồng đầu vào và source → target

| Target P5 sở hữu | Input contract/nguồn | Thay đổi cần làm |
|---|---|---|
| `src/background/background.js` | P2 adapter/session/codec; P3 createPlan/buildReview; P4 createVoiceEngine/serviceClient | Một controller sở hữu side effects, generations và message intents; manager P2 sở hữu session identity; guarded boot |
| `src/background/background.html` | `window.TftCoach` IIFE exports của P2–P4 | Load dependency order đúng; bỏ mọi legacy advisor/AI script khỏi runtime default |
| `manifest.json` | Current OW schema đã P1 xác minh | Background+desktop interactive+overlay in-game riêng; tối thiểu permissions/hotkeys/launch config; FileSystem chỉ bootstrap P4 đã xác định; không copy version/permission từ sample |
| `src/desktop/desktop.{html,js,css}` | UI facade và outbound message protocol mục6+9 | Pregame plan/settings, completed review, import/export và voice controls; không SDK events/synth riêng |
| `src/overlay/overlay.{html,js,css}` | Chỉ `{planSnapshot,voiceStatus}` | HUD static freeze suốt active session, không highlight/choice/score; responsive theo gate máy đích |
| `test/application-integration.test.js`, `test/ui-protocol.test.js` | Fake windows+SDK+DOM+voice+clock | Kiểm contract/lifecycle ghép thật; không gọi network/game |
| `test/mock_game_events.js` | P2 fixture entrypoint, P3 review | Smoke synthetic có nhãn qua controller/core, assertions và exitcode lỗi; không gọi voice/network thật |
| `README.md` | Report P1 và phase merge results | Khả năng thật, flags/mode, lệnh test/start và giới hạn; chưa tuyên bố Windows pass trước P6 |

Không public API mới thay cho các exports P2–P4. Giữ `BackgroundApp` export để test/khởi động theo convention baseline; import Node không instantiate. Desktop/overlay không export coach decision API. `src/ai/jevClient.js` do P4 sở hữu: P5 xóa import legacy khỏi background và chỉ nối optional adapter sau contract gate, không sửa đè file của P4.

## Task graph và implementation

| ID | Phụ thuộc | Deliverable |
|---|---|---|
| P5.1 | P1,P2,P3,P4 contract handoffs | Contract import/namespace smoke, fake controller test skeleton |
| P5.2 | P5.1 | Background state machine, finalized review và voice generation integration |
| P5.3 | P5.1 | Desktop intents/view + static overlay + manifest declarations |
| P5.4 | P5.2,P5.3 | Facade intents/outbound IPC, review audio and import/export end-to-end |
| P5.5 | P5.4 | Legacy quarantine, deterministic smoke/docs, P6 handoff |

1. **P5.1 — Ghép exports, chưa bật runtime.** Confirm P2/P3/P4 browser và Node smoke cùng contract revision. Load config/capabilities.json đúng P1 schema và override local có evidence; missing/invalid mặc định false. Import validators/DEFAULT_FLAGS từ P1 contracts.js, bổ sung lifecycle checks ở controller. P5 luôn ép liveAdaptive/inGameVoice false trong MVP, dù config bị sửa. P1 định nghĩa window permission; thiếu thì chỉ test fake, không tự cấp capabilities. Official MessageReceivedEvent chỉ id/content, không sender ID: không thêm giả sender field để test auth. Node require không tạo app, fetch hoặc timer. Browser background tạo đúng một controller sau dependency readiness.
2. **P5.2 — Một owner.** Controller instantiate adapter/session/voice đúng signatures mục9: inject getSessionContext từ manager, capabilities callback trả metadataAllowed/capture từ config P1; tftConfirmed xử lý đồng bộ manager.start trước adapter emit. onStatus type chỉ detecting/tftConfirmed/otherGame/unavailable/stopped. Lifecycle idle→detecting→active→finalizing→reviewReady→idle; manager cấp session identity, controller giữ reviewGeneration và invalidates async. Shared5426 bootstrap thuộc P2; controller không tự gọi feature registration lần nữa. Manual/synthetic entry cũng đi session manager, giữ source labels rõ. Khi reconnect/sessionchange/otherGame, finish interrupted context cũ đồng bộ trước manager.start mới; lifecycle không giữ active khi context đã clear. Wire serviceClient P4 đọc bootstrap localAppData/TftVoiceCoach/runtime/session.json qua OW IO contract; không tự đọc token bằng helper khác hoặc hardcode user path. Missing/invalid bootstrap/Origin/HMAC => TTS disabled và text review vẫn chạy.
3. **P5.2 — End→review đúng thứ tự.** Adapter matchEnd/stop giao manager.finish; freeze completed trước clear live. REQUEST_REVIEW dùng completed revision, buildReview P3, không live state. Revision summary mới tăng reviewGeneration và cancelScope cũ trước replace. New match giữ completed để desktop đọc nhưng hủy queued/active voice, không auto-play review cũ. Duplicate end/request không tạo review/audio hai lần.
4. **P5.3 — Desktop thực sự hoạt động ngoài trận.** Tạo cửa sổ interactive riêng, không in_game_only/clickthrough. Mở khi người dùng launch app và có đường vào settings/pregame/review không cần game. Mặc định không auto mở gây mất focus khi đang active; quyết định hiển thị theo capability/runtime gate. Desktop tồn tại sau process game exit; chỉ overlay đóng. Người dùng chọn focus+text+patch cho plan trước trận; save trong active bị từ chối rõ, không mutate snapshot đang dùng.
5. **P5.3 — HUD chỉ kế hoạch tĩnh.** Overlay nhận planSnapshot và voiceStatus; không subscribe raw state, catalog evaluation, live review, economy/augment/shop/item decisions. Live gold/stage thay đổi không đổi text/thứ tự/độ nổi bật HUD. Bỏ HIGHLIGHT_* handlers/elements và ACTIVE giả chưa có trạng thái. Hiển thị trạng thái mute/degraded được phép; safe textContent cho mọi input/import. Native click-through/DPI cần Windows P6, CSS không phải bằng chứng.
6. **P5.4 — Facade và outbound message.** UI gọi `overwolf.windows.getMainWindow().TftCoach.controller.dispatchIntent(envelope)`; facade chỉ expose intents đã whitelist, không token/service/engine. Validate schema/lifecycle và dedupe requestId; unsolicited mutating onMessageReceived bị bỏ. Background→view dùng `sendMessage(windowId,'TFT_COACH_V1',content,callback)` bốn args, object envelope schemaVersion 1/type/requestId/sessionId/payload. Parse transport wrapper string nhiều nhất một lần nếu có; không invent sender auth. Đợi window ready, coalesce latest view, không send ID null. Callback errors đưa ERROR rõ. Ledger/export lớn chỉ lấy qua explicit facade request, không broadcast 2 MiB. Đây intra-extension trust, không bảo vệ khỏi extension code đã compromise; không load remote script/html.
7. **P5.4 — Intent allowlist.** GET_VIEW trả desktop view contract. SAVE_PLAN gọi P3 createPlan ngoài active, catch TypeError thành field validation. REQUEST_REVIEW theo selectedReview `{kind:'captured'|'imported',sessionId,revision}`: captured lookup manager, imported lookup selectedImportedSession riêng; stale revision reject. PLAY_REVIEW chỉ từ user intent, tạo batch tối đa3 observations, enqueue từng câu sau Promise câu trước played; TTL15s bắt đầu khi từng câu eligible, theo Contract §9; luôn chặn khi match active trong baseline. Subscribe engine onStatus theo §9 và forward sanitized VOICE_STATUS; MUTE/UNMUTE dùng một engine; mute tăng generation, cancel late results; unmute không replay queue cũ. Overlay script chỉ gọi intent hiển thị/mute cần thiết, không tạo active controls cho plan/import/review; đây giới hạn UI chứ không giả sender authentication.
8. **P5.4 — Import/export.** Người dùng chủ động chọn JSON bằng desktop UI, controller gọi P2 importSession kiểm 2 MiB/5,000 rows/schema/field limits trước lưu một selectedImportedSession riêng; replace/clear khi import khác/dispose, không đưa vào live manager hoặc 5 auto completed. Import hoặc đổi selection tăng reviewGeneration/cancelScope trước render. Import thành công nhận `{ok,session,errors}` và source manual theo codec; exportSession(completed) trả sanitized string, không credentials/private raw payload. Không thực thi HTML/script/unknown field; không upgrade provenance thành gep/live hoặc plan thành observed action. Unknown schema/oversize => ERROR, live session giữ nguyên. Không tạo validator cạnh tranh codec P2. New match vẫn cho đọc text cũ nhưng chặn voice mọi selection.
9. **P5.5 — Legacy quarantine.** Xóa runtime imports/new EconomyAdvisor/AugmentAdvisor/ItemAdvisor/ShopAdvisor và hardcoded Ahri target comp trong background. Legacy files có thể giữ chỉ để history/synthetic với không import mặc định; không cần delete file ngoài ownership. Old Jev script không nằm default browser load; thiếu authorization/key => disabled và 0 request, không silent first-option mock hoặc đổi provider. Item/augment/adaptive shop UI không được kích hoạt bởi legacy message.
10. **P5.5 — Handoff.** Smoke hiện có thay bằng fixture qua controller/core, không gọi trực tiếp advisors rồi log success. README tách implemented/tested/proposed, không 100% safety hoặc latency thiếu số đo. Gửi P6 exact revision, commands, capability blockers, browser load order, desktop lifecycle, optional voice status, expected artifacts và Windows checklist chưa chạy.

## Acceptance và tests

Chạy `node --test test/application-integration.test.js test/ui-protocol.test.js` và các test modules P2–P4 đã merge; mock script assertions qua lệnh P1 đã khai báo. Không chạy provider thật để pass.

- [ ] Browser background loads namespaces một lần; Node import zero side effects; legacy advisors không được instantiate/import trong default runtime.
- [ ] Không game vẫn đọc/sửa plan trên desktop; game end đóng overlay nhưng desktop/completed review còn dùng được. Fake tests ghi rõ không chứng minh native window behavior.
- [ ] Save plan active bị chặn; 100 live updates đổi gold/stage không đổi nội dung plan HUD, không tạo advice hoặc audio. Augment/legacy HIGHLIGHT message bị reject.
- [ ] End→immutable completed→review; late summary thay revision và cancel old audio; new match/mute giữa pending fetch/body/play không phát review cũ. Duplicate end/requestId không audio đôi.
- [ ] PLAY_REVIEW là explicit user intent; no autoplay baseline; missing voice/service=>text-only và status rõ, không alternate provider/WebSpeech lén.
- [ ] Facade validate schema/type/intent/lifecycle và dedupe request; unsolicited mutating IPC bị ignore. Outbound IPC đúng 4 args, object/string wrapper được xử lý đúng 1 lần, null/unready window không send, callback failure surfaced; không test sender field giả.
- [ ] Import oversized/schema sai/private unknown fields/malicious HTML không đổi live hoặc thực thi; output textContent; export sanitized đúng limits; imported không mislabeled live. Chỉ một imported artifact, selection/import mới hủy scope cũ, stale revision reject, new match chặn mọi review audio.
- [ ] GEP/capture/voice/AI flags không được bật vì fixture pass; manual fallback có nhãn và để người dùng chọn trước release, không âm thầm mất hands-free.
- [ ] Test smoke assert failure trả nonzero, không network/TTS/cloud; README không nhầm console mock pass với Windows acceptance.

## Rollback, effort và handoff gate

3–4 ngày tập trung sau P1–P4 handoff; thiếu interface/window proof phải trả owner, không thêm framework để né. Windows initial load/capability chỉ P1; smoke thực sau ghép và 5 trận nghiệm thu P6 còn pending.

Rollback bằng revert integration changes của phase đúng revision, giữ core/voice/data owner khác nguyên. Nếu cần tạm vô hiệu integration sau pilot lỗi: disable capture/in-game overlay/voice/jev, giữ desktop text/manual với source label; không quay lại legacy adaptive/mock fallback. Không xóa completed exports của người dùng hoặc kill process rộng. App code chỉ được sửa khi task implementation được giao; tài liệu này chưa triển khai gì.

Test batch3clip8s phải đọc đủ khi phiên còn hợp lệ; newmatch/mute/selectionchange dừng batch trước câu kế. Explicit PLAY_REVIEW sau batch đã hết có playbackRequestId mới để phát lại; duplicate cùng requestId không repeat.
