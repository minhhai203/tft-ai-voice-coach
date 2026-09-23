---
phase: 1
title: "Contracts and source gates"
status: pending
priority: P1
effort: "1–2 ngày tập trung; không gồm chờ xác nhận/quyền Windows"
dependencies: []
---

# Pha 1: Khóa hợp đồng và kiểm tra các điều kiện nguồn

## Bối cảnh và phạm vi

Bắt buộc đọc [Contract v1](./contracts.md), [challenge](../reports/260923-1401-xia-source-analysis/challenge-decisions.md) và [source map Synapse](../reports/260923-1401-xia-source-analysis/synapse-source-map.md) và [source manifest](./source-manifest.md). Đây là packet cho coding agent ở phiên triển khai sau, chưa phải lệnh chạy/cài/deploy trong phiên lập plan.

Coordinator sở hữu pha này. Khóa biên module để P2/P3/P4 chạy độc lập rồi ghép ở P5; không sửa background/manifest/voice/advisors ở đây. Máy đích Win11/i5-12400F/RAM16/RTX2060; macOS hiện tại không chứng minh khả năng Windows. Đầu ra là hợp đồng có test, bảng quyền/khả năng và dependency baseline; không phải chứng nhận an toàn của sản phẩm.

## Source → quyết định target

| Source/hiện trạng | Cần giữ | Không được mang sang |
|---|---|---|
| Overwolf demo lifecycle, shared class5426 | Tách boundary API, callback có danh tính, kiểm tra metadata TFT | Copy source khi thiếu quyền, retry vô hạn, ingest LoL, coi SDK success là policy approval |
| Synapse typed state/catalog | Hợp đồng dữ liệu rõ, hàm deterministic, test biên | Default gold0/hp100, ID theo vị trí, YAML14.23, score thành winrate |
| Piper library | TTS CPU có version/model hash rõ | Stock HTTP server mở rộng route/model-download, giả định abort dừng inference |
| Jev SDK | API/backend contract đúng nếu sau này bật | Dependency `^0.1.0`, browser key, paid inference hoặc mocksuccess mặc định |
| Repo target | HTML/JS nhỏ, `test/`, namespace browser riêng | Cài framework/bundler/database hoặc đổi Codex/provider |

## Quyền sở hữu file

Repo root hiện tại: `/Users/minhhai/workspace/ai/projects/tft-ai-voice-coach/`; Windows dùng checkout được xác minh riêng. Không tạo các file NEW trong phiên viết plan.

| Hành động khi implement | Đường dẫn tuyệt đối | Nội dung/owner |
|---|---|---|
| Sửa hiện có | `/Users/minhhai/workspace/ai/projects/tft-ai-voice-coach/package.json` | Coordinator: scripts test thuần, runtime hỗ trợ và bỏ Jev khỏi dependency baseline |
| Tạo nếu baseline cần | `/Users/minhhai/workspace/ai/projects/tft-ai-voice-coach/package-lock.json` | Coordinator duy nhất; không kéo SDK/model/sidecar vào app install |
| Sửa tài liệu normative khi cần | `/Users/minhhai/workspace/ai/projects/tft-ai-voice-coach/plans/260923-1401-xia-agent-port-plan/contracts.md` | Version cùng contract tests; báo thay đổi cho mọi agent |
| Tạo mới | `/Users/minhhai/workspace/ai/projects/tft-ai-voice-coach/src/core/contracts.js` | `CONTRACT_VERSION=1`, frozen `DEFAULT_FLAGS`; `validateEnvelope`, `validateUiIntent`, `validateCompletedSession` trả `{ok,errors}` |
| Tạo mới | `/Users/minhhai/workspace/ai/projects/tft-ai-voice-coach/config/capabilities.json` | schemaVersion1, metadataAllowed/capture/liveAdaptive/inGameVoice/jev false; evidenceRefs[]; P1 owner |
| Tạo mới | `/Users/minhhai/workspace/ai/projects/tft-ai-voice-coach/scripts/run-tests.cjs` | Runner chỉ root/test/*.test.js, explicit sorted paths, zero tests fail; không discover services/mock |
| Tạo mới | `/Users/minhhai/workspace/ai/projects/tft-ai-voice-coach/test/contracts-v1.test.js` | Gọi validator implementation thật với valid/invalid/partial payload; assertions boundary, không chỉ kiểm fixture literals |
| Tạo mới | `/Users/minhhai/workspace/ai/projects/tft-ai-voice-coach/test/fixtures/contracts-v1.json` | Fixtures nhỏ hợp lệ/không hợp lệ do coordinator sở hữu |
| Tạo mới | `/Users/minhhai/workspace/ai/projects/tft-ai-voice-coach/docs/source-gates.md` | Artifact/source grant, policy/capability, kết quả/unknown/ngày kiểm tra |
| Tạo mới | `/Users/minhhai/workspace/ai/projects/tft-ai-voice-coach/docs/windows-feasibility.md` | Quy trình và bằng chứng shell/GEP/audio/Origin/driver thực tế |

Không agent khác được ghi package/lock hoặc fixture contract chung. Fixture P2/P3/P4 dùng file riêng trong namespace tương ứng; không sửa chung để làm test mình pass.

## Task IDs, phụ thuộc và đầu ra

| Task | Phụ thuộc | Đầu ra bắt buộc |
|---|---|---|
| P1.1 — Khóa artifact/source gates | Không | SHA/version/path/notice đã có, quyền còn thiếu, component nào chưa được copy/ship |
| P1.2 — Khóa Contract v1 và fixtures | P1.1 | API exports + implementation boundary validators, data shapes, mode defaults, units, error/unknown/cancel semantics |
| P1.3 — Làm baseline test độc lập provider | P1.2 | Script `test:contracts`, `test:core`; không SDK request hoặc auto app init |
| P1.4 — Kiểm chứng khả năng máy đích | P1.1; cần Windows hợp lệ | Shell/GEP/game_mode/Origin/headset/runtime evidence hoặc blocker cụ thể |
| P1.5 — Handoff P2/P3/P4 | P1.2–P1.3; P1.4 ghi trạng thái | Bảng owner, branch gate và contract version thống nhất |

P2/P3/P4 có thể triển khai/test synthetic sau P1.2–P1.3 ngay cả khi P1.4 còn chờ. P5 Windows integration cần gate nền tảng tương ứng đạt; P6 pilot không được đánh pass bằng fixtures.

## Các bước thực hiện theo thứ tự

1. Ghi revision target và artifact upstream đã đọc; danh mục không thi hành source/bin/install scripts. Overwolf/Synapse thiếu grant rõ thì chỉ tham khảo kiến trúc/tự viết từ đặc tả; literal copy chờ bằng chứng license/attribution. Piper engine/model có notices riêng; không gộp nhãn MIT của app.
2. Ghi ma trận hành vi pregame/static/postgame, nguồn own-player, feature allowlist và điều chưa rõ. `liveAdaptive`, `inGameVoice`, `jev`, `capture` mặc định false; không bật khi mới có kết nối SDK. Nếu thiếu quyền dữ liệu, giữ synthetic/manual có nhãn. Tạo config/capabilities.json mặc định fail closed; P1 kiểm schema/boolean/evidenceRefs, missing/malformed config giữ tất cả false và báo degraded, không merge truthy string hoặc mặc định true. Loader controller P5 dùng đúng kết quả validation/gate, không để core utility tự đọc file.
3. Khóa các điều kiện ghép: unknown khác0/empty; epoch/session/seq/revision; sanitized ledger; finalize trước cleanup; completed revision immutable; import2MiB/5,000rows; scope review generation; queue/cache/body budgets; static overlay không nhận review live. Không thêm field khác contract chỉ để thuận cho một module.
4. Áp dụng Contract §9: `clock={now,isoNow}`, `newId`, `createPlan(input,{clock,newId})`; session manager sở hữu identity/ledger, adapter nhận getSessionContext/capabilities. Áp dụng §9: utility/plan invalid throw TypeError, validators trả `{ok,errors}`; review precedence đã khóa; giữ đường load CommonJS/IIFE và namespace export đúng contract. Mọi thay đổi normative phải có fixture/test cùng version, không dùng lời nhắn riêng làm đặc tả.
5. Implement ba validator thuần theo namespace/CommonJS contract: unknown schema/type/enum/ID/seq/timestamp/field-value bị lỗi có đường dẫn field; `validateUiIntent` whitelist intent/payload, `validateCompletedSession` kiểm evidence/session references và giới hạn shape. Không I/O, không mutate; validator không tự cấp capability hoặc quyết định lifecycle. Chuẩn bị fixture valid + các trường hợp số0, null, NaN tại test JS, wrong schema, stage sai, patch khác, nguồn synthetic gắn nhãn, late summary và unknown UI message. Contract test chỉ kiểm ý nghĩa boundary; không tạo test chỉ chép lại type literals.
6. Sửa package ở phiên implementation: bỏ SDK hỏng khỏi đường baseline; chọn Node được hỗ trợ tại thời điểm đó, `node:test` không dependency mới. Root `npm test`/`test:core` gọi scripts/run-tests.cjs theo Contract §9; không bare recursive discovery. Giữ smoke cũ rõ nhãn legacy, không coi exit0 là acceptance. Nếu không còn dependency, ghi rõ quyết định không cần lockfile thay vì tạo lock giả.
7. Trên Windows trong phiên được giao: load unpacked app, kiểm manifest/assets/permission, phân biệt class5426 với metadata `game_mode`, quan sát Origin chính xác của desktop/background, xác định app storage/ACL, device output và CPU TTS feasibility. Không gửi form hay bật provider trả phí thay người dùng.
8. Chốt nhánh: shell+GEP đạt → chuẩn bị integration; shell đạt/GEP chưa đạt → core synthetic/manual, không đạt live pilot; shell không đạt → dừng integration và lập lại phương án. Nhập tay mất hands-free phải ghi là trade-off cần người dùng chọn; không tự thêm OCR.
9. Handoff contract tests và interface table cho P2/P3/P4; lưu câu hỏi/blocker còn lại bằng trạng thái cụ thể, không đổi unknown thành pass vì thời gian chờ.

## Lệnh kiểm thử dự kiến, chưa chạy trong phiên plan

Từ root checkout sau khi agent triển khai P1: `node --test test/contracts-v1.test.js`. Script dự kiến `npm run test:contracts` chạy đúng lệnh này. `npm run test:core` là aggregate sau các phase có test; không tự thêm live smoke/install/network vào `npm test`.

Test gọi trực tiếp ba validator thật và kiểm kết quả khi thay một boundary tại một thời điểm; phải chứng minh payload vi phạm boundary bị nhận diện, serialized defaults không nâng nguồn synthetic thành live, unknown không biến0, message/schema không hợp lệ không đi tiếp. Test module thật bổ sung sau P2/P3/P4; contract test giai đoạn đầu **không thay thế** kiểm thử integration của module chưa viết. Windows checks lưu bước tái hiện và kết quả thật, không gọi pass từ macOS.

## Tiêu chí hoàn tất và gate

- [ ] Mỗi source/artifact có trạng thái quyền/provenance và phần cấm copy/ship rõ; không thực thi binary upstream.
- [ ] Contract v1 không còn API bất định khiến agent tự chọn shape; fixtures và test lệnh chạy không cần paid provider.
- [ ] Owner package/lock/contracts duy nhất; P2/P3/P4 có API/export/test namespace đủ để làm độc lập.
- [ ] Windows gate có evidence hoặc blocker; branch tương ứng không bị hứa là đã chạy.
- [ ] Không tự đổi provider/Codex settings, mở OCR, thêm dependency UI hay deploy trong phiên lập kế hoạch.

## Rollback và rủi ro

Thay dependency/test scripts theo một diff độc lập; rollback đúng diff/commit P1 khi cần, không `git reset --hard` hoặc xóa công việc agent khác. Contract đổi sau handoff phải nâng version và phối hợp cập nhật mọi consumer/tests trước merge. Quyền GEP/model hoặc shell bị chặn có thể vượt 1–2 ngày; không tính thời gian chờ là effort đã hoàn thành, không dùng nhánh thay thế âm thầm.
