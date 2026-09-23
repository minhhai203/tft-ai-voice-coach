---
phase: 2
title: "Event adapter and session ledger"
status: pending
priority: P1
effort: "3–4 ngày tập trung; không gồm chờ Windows/source gate"
dependencies: [1]
---

# Pha 2 — Adapter sự kiện và sổ bằng chứng phiên

## Phạm vi và owner

Chỉ tạo module adapter/normalizer/reducer/session cùng test và fixture mới. Không sửa background, manifest, UI, voice, advisors, package hay README; P5 là owner ghép runtime. Đầu vào chuẩn là [contracts.md](./contracts.md) mục 1–3 và toàn bộ clarification §9; [source map](../reports/260923-1401-xia-source-analysis/overwolf-source-map.md) là bằng chứng nguồn. Port ý tưởng lifecycle độc lập, không copy nguyên code/assets thiếu license grant.

P1 khóa contract và capability gate. Core synthetic được xây khi gate live chưa đạt, nhưng không giả fixture là capture Windows. Import P1 `src/core/contracts.js`: CONTRACT_VERSION, DEFAULT_FLAGS và validators thật; không tạo validator shape cạnh tranh trong adapter/codec. P2 bàn giao core độc lập để P3 dùng cùng `CompletedSession`, P5 dùng cùng lifecycle.

## Source → target và exports

| Nguồn / vấn đề local | Target mới P2 sở hữu | Public API đúng contract |
|---|---|---|
| Overwolf sample retained callback refs, startup discovery; local `background.js:121-138` bind sai | `src/platform/overwolf-adapter.js` | `createOverwolfAdapter({ow,clock,timers,onEnvelope,onStatus,getSessionContext,capabilities}) -> {start(),stop()}` |
| Native TFT field contract; local parser bare-array và giả default | `src/core/normalize-events.js` | `normalizeGepUpdate(raw,context) -> {patch,warnings}` |
| Atomic updates/provenance; local stage trigger trước merge | `src/core/game-state.js` | `reduceState(previous,envelope) -> next` |
| Session/evidence immutability, không có ở demo | `src/core/session-manager.js` | `createSessionManager({clock,newId})` trả `start`, `ingest`, `finish`, `getLive`, `getCompleted`, `reviseSummary` như mục 3 |
| Import/export không có ở sample | `src/core/session-codec.js` | `importSession(input)->{ok,session:null\|CompletedSession,errors:[]}`, `exportSession(completed)->string` |
| Demo chỉ console, không assertions | `test/overwolf-adapter.test.js`, `test/state-replay.test.js`, `test/session-manager.test.js`, `test/session-codec.test.js` | `node:test`, strict assertions, fake SDK/timers; không runtime export |
| Payload được P1 kiểm chứng hoặc synthetic ghi nhãn | `test/fixtures/gep-v1-synthetic.jsonl`, `test/fixtures/completed-session-v1.json` | schemaVersion 1, expected output/observation source; không raw private capture |

Node xuất CommonJS; browser nạp IIFE vào `window.TftCoach` cùng tên exports. Không dùng `require` trong browser branch; import module không mở listener/timer/network. Mục9 normative khóa `clock={now,isoNow}`, `newId`, `timers={setTimeout,clearTimeout}`; không agent tự thêm public API.

## Task graph và bước thực hiện

| ID | Phụ thuộc | Công việc / đầu ra |
|---|---|---|
| P2.1 | P1 contract gate | Khóa fake SDK, clock/timers, session identity và fixtures; ghi contract revision được dùng |
| P2.2 | P2.1 | Implement normalizer + reducer thuần và assertion các lỗi local đã xác nhận |
| P2.3 | P2.1,P2.2 | Implement adapter bootstrap/discovery, subscription, resync và cancellation |
| P2.4 | P2.2 | Implement session ledger, finalize và immutable summary revisions |
| P2.5 | P2.3,P2.4 | Replay xuyên adapter → manager, publish exports/fixture handoff; chưa wire background |

1. **P2.1 — Contract first.** Theo mục9, manager là identity owner: start trả `{sessionId,epoch}`, active start trả cùng context; getLive trả GameState/null; ingest trả `{accepted,state,warnings}`; finish trả CompletedSession/null; reviseSummary trả revision mới hoặc unchanged nếu duplicate/invalid. State có lastSeq; ledger nằm manager. Adapter nhận getSessionContext và capabilities callbacks, onStatus `{type:'detecting'|'tftConfirmed'|'otherGame'|'unavailable'|'stopped',reason:null|string}`; capabilities trả `{metadataAllowed,capture}` theo config P1. Background nhận tftConfirmed đồng bộ start manager rồi adapter mới lấy context để emit. Async callback giữ epoch ban đầu, không gán event cũ vào context mới.
2. **P2.2 — Parse đúng và không suy diễn.** Chỉ own-player fields theo mục 2: `me.gold`, `me.health`, level từ `me.xp`, stage từ `match_info.round_type`; nhận object/nested JSON string theo fixture. Field absent không đổi; 0 hợp lệ; null/malformed reject field + warning, không làm mất field hợp lệ khác. `game_mode` là metadata bootstrap, không evidence chiến thuật. Không ingest augments/shop/board/items/opponents. Reducer không mutate input, reject wrong session/epoch/old seq; merge cả envelope rồi tăng revision đúng một lần.
3. **P2.3 — Bootstrap không vòng chờ.** `getRunningGameInfo`/game-info update nhận class5426 chỉ đưa app vào detecting. Nếu metadataAllowed false thì unavailable và không đăng ký features; nếu true phát detecting trước rồi đăng ký tối thiểu `match_info`, nhận game_mode từ event hoặc metadata-only `getInfo` bootstrap. Không đợi TFT mới đăng ký chính field dùng để nhận diện TFT. LOL/unknown không ingest own fields. Chỉ sau TFT confirmed mới đăng ký đúng own-field features đã được gate cho phép; capture flag false không được biến thành capture thật vì sample hoạt động.
4. **P2.3 — SDK và retry.** Dùng response `success` + `supportedFeatures` của `setRequiredFeatures`; partial support báo degraded và giới hạn field ingestion. Failure tối đa initial + 3 retries, delays 250/1000/3000 ms. Listener references cố định; start/stop idempotent; stop hủy retry, request generation và subscriptions đúng emitter. Hai discovery callbacks, game-info không liên quan, event trễ sau stop phải không tạo listener/session thứ hai.
5. **P2.3 — Snapshot race.** `getInfo` nhận `{success,res}`, bọc `{info:res}` qua cùng allowlist. Capture revision từng field tại request; response chỉ điền field unknown và chưa đổi kể từ request. Event mới luôn giữ quyền ưu tiên; không lấy local receivedAt/seq làm server ordering. Snapshot thất bại hoặc thứ tự không rõ báo warning/unknown; không tự bịa state. Reconnect/session change trong active phải emit matchEnd(reason interrupted) cho context cũ, chờ manager finish đồng bộ rồi tftConfirmed để start context mới trước dữ liệu tiếp; unknown/otherGame cũng finish interrupted trước cleanup. Không gọi start(active) để mong reset; không ghép trận chỉ theo pseudo_match_id.
6. **P2.4 — Evidence ledger.** Manager nhận các accepted field updates tạo IDs `sessionId:seq:field`, phân biệt observed/manual/synthetic/plan. Cap 5,000 rows/session, cảnh báo evidence_truncated khi vượt và không tuyên bố đủ timeline. Không log raw payload. Kế hoạch freeze lúc start; ledger và live state không tham chiếu object mà caller còn mutate được.
7. **P2.4 — End transaction.** `finish` freeze state+ledger+plan thành CompletedSession trước clear live; duplicate end trả cùng object/revision. Crash/stop thiếu end => interrupted, không tự ended. Late summary chỉ whitelist placement1..8/duration có nguồn thật và tạo revision mới; không mutate revision1. Giữ tối đa 5 completed trong RAM, không database. ReviewGeneration/audio thuộc controller P5; manager chỉ tạo data revision và trả kết quả theo contract.
8. **P2.5 — Codec và handoff.** Implement session-codec kiểm limits 2 MiB/5,000 rows/schema/fields; import source chuyển manual, original source chỉ annotation sanitized, không live; export không raw executable/html/provider fields. Không file picker/network trong core. Chạy replay từ fake SDK tới completed object bằng clock/ID cố định. Gửi P3 fixture/exports; gửi P5 contract result/status shapes + end/revision ordering. Giá trị observed lặp vẫn được evidence seq mới để chứng minh fields đồng thời, không dedupe ledger theo value gây mất provenance.

## Tests và tiêu chí merge

Chạy `node --test test/overwolf-adapter.test.js test/state-replay.test.js test/session-manager.test.js test/session-codec.test.js`; dùng fake SDK/timers thuần, không cài package hoặc gọi Overwolf/TTS/cloud thật.

- [ ] Bootstrap class5426/unknown chỉ metadata; confirmed TFT mới own fields; LOL không capture; forbidden feature list luôn rỗng đối với augments/opponents.
- [ ] 10 lần start và 2 lần stop: một listener/emitter khi chạy, không listener/timer sau stop; retry initial + 3 đúng delay; stop/new session vô hiệu callback cũ.
- [ ] `success:false`, partial supportedFeatures, getInfo failure không được log ready giả; property `status` không làm API mock pass sai.
- [ ] Numeric zero, nested JSON, malformed một field, missing field, wrong epoch/session/duplicate seq; state cũ không mutate, update atomic.
- [ ] Snapshot đang chờ thì gold live đổi: snapshot cũ không ghi đè; unknown field chưa đổi được bổ sung. Snapshot response tới sau epoch đổi bị bỏ.
- [ ] Same-envelope gold+stage tạo được evidence cùng nguồn; stage mới với gold cũ không thành quan sát cùng mốc. Replay hai lần có cùng state/evidence IDs.
- [ ] End rồi process exit, duplicate end, interrupted stop, late summary, new match trước summary; revision1 vẫn nguyên, evidence không mất và không ghi vào live trận mới.
- [ ] hơn 5,000 ledger rows và hơn 5 completed sessions có hành vi giới hạn rõ; fixture/import oversized hoặc schema sai bị reject theo contract.
- [ ] Node import + browser IIFE smoke dùng vm chỉ nạp exports, không app startup; không side effects/provider requests.

## Gate, rollback và rủi ro

P2 pass chỉ chứng minh contracts/replay. Initial Windows capability thuộc P1; real smoke/races qua P5 và nghiệm thu P6. Không chuyển status live-ready bằng test macOS. Unknown mode hoặc không được cấp nguồn giữ adapter off, manual/synthetic có nhãn.

Rollback phần P2 là revert đúng module/test mới của phase, không sửa hoặc restore hàng loạt file của owner khác. P5 chưa wire thì runtime cũ không bị động tới; nếu rollback sau integration, P5 tắt adapter và cho desktop manual/text chạy, không tái bật legacy advisors/mock. Estimate 3–4 ngày giả định contracts đã khóa, không gồm sửa source rights hoặc đợi máy Windows.

Contract final §9 định nghĩa matchEnd.reason, summary.durationSeconds/source, GameState.status/quality và shared validators P1; dùng đúng shape, không thêm variant riêng.
