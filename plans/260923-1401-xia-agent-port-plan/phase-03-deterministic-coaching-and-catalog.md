---
phase: 3
title: "Deterministic coaching and catalog"
status: pending
priority: P1
effort: "2–3 ngày tập trung"
dependencies: [1]
---

# Pha 3: Coaching deterministic và catalog có nguồn

## Bối cảnh và phạm vi

Đọc [Contract v1 §4](./contracts.md), [challenge](../reports/260923-1401-xia-source-analysis/challenge-decisions.md), [source map Synapse](../reports/260923-1401-xia-source-analysis/synapse-source-map.md). Pha này song song P2/P4 sau P1 khóa contract; dùng CompletedSession fixture của chính P3, không chờ GEP hoặc sidecar chạy thật.

Chỉ tạo lõi catalog, kế hoạch trước trận và review quan sát sau trận bằng JavaScript thuần. Không sửa background/manifest/package, không nối advisor cũ, không nói trong trận, không thêm board/shop/item/augment scoring. Những focus `items|tempo` vẫn là mục tiêu tự người dùng viết, không hứa có bộ phân tích tương ứng trong v1. Windows integration và cách ly advisors legacy do P5 thực hiện.

## Source → target cần chuyển

| Bằng chứng source | Khái niệm giữ | Thiết kế local v1 |
|---|---|---|
| Synapse economy `next_interest_info` và test boundary | Arithmetic breakpoint, kết quả có ý nghĩa rõ | `nextInterestInfo` nhận thresholds từ pack; cap trả null/null đúng Contract, không copy cap50/gap0 của upstream |
| Synapse template reasoning | Reason code và tham số có thể giải thích | `buildReview` tạo tiếng Việt từ evidenceIds; không gọi score thành confidence/winrate |
| Synapse catalog + lookup | Pack/schema và validator tập trung | Pack JSON nhỏ pin patch/provenance; không YAML14.23, không index IDs, không hot fallback cũ giả current |
| Synapse session review | Review dùng bản dữ liệu hoàn tất | Chỉ đọc immutable CompletedSession; không biến planned/recommended action thành observedAction |

Đây là reimplementation theo đặc tả local, không literal translation source Rust khi grant/notice chưa rõ. Không cần Candle/Tokio/Rust build/YAML parser/Jev hay GPU.

## Quyền sở hữu file và exports

Tất cả file dưới đây **NEW**, chưa tồn tại ở baseline khảo sát; nếu P1 tạo seam trùng tên phải trao đổi coordinator trước khi ghi. Root macOS chỉ là vị trí review mã, không phải Windows deployment path.

| Tạo mới khi implement | Export public / nội dung |
|---|---|
| `/Users/minhhai/workspace/ai/projects/tft-ai-voice-coach/src/core/catalog.js` | `validateCatalog(input) -> {ok,errors}` và `nextInterestInfo(gold,thresholds) -> {nextThreshold,gap}` |
| `/Users/minhhai/workspace/ai/projects/tft-ai-voice-coach/src/core/plan.js` | `createPlan({focus,text,patchVersion},{clock,newId}) -> PlanSnapshot`; dùng `clock.isoNow()` và `newId()` theo Contract §9 |
| `/Users/minhhai/workspace/ai/projects/tft-ai-voice-coach/src/core/coach.js` | `buildReview(completed,catalog) -> Review` thuần, không side effects |
| `/Users/minhhai/workspace/ai/projects/tft-ai-voice-coach/test/catalog.test.js` | Pack shape/provenance/threshold/patch và arithmetic boundaries |
| `/Users/minhhai/workspace/ai/projects/tft-ai-voice-coach/test/plan.test.js` | Immutable snapshot, focus/text giới hạn, clock/id injection |
| `/Users/minhhai/workspace/ai/projects/tft-ai-voice-coach/test/coach.test.js` | Evidence coherence, abstain, ordering, giới hạn nội dung, purity |
| `/Users/minhhai/workspace/ai/projects/tft-ai-voice-coach/test/fixtures/coaching-v1.json` | Bộ 30 ca có input/catalog/expected reasonCodes/evidenceIds/status/limitations |
| `/Users/minhhai/workspace/ai/projects/tft-ai-voice-coach/test/fixtures/catalog-synthetic-v1.json` | Pack `mode:synthetic`, provenance url:null/revision:fixture, không giả dữ liệu current |

Exports `module.exports` ở Node; cùng tên dưới `window.TftCoach` khi browser IIFE, không hai bản implementation. Không `require()` ngoài nhánh CommonJS; không truy cập DOM/Overwolf/fetch/audio/storage trong core. P1/coordinator cập nhật script load/syntax contract nếu cần; P5 nối browser entrypoints.

## Hợp đồng không được thay

- Catalog giữ `schemaVersion:1,id,patchVersion,mode,provenance,rules,champions:[],items:[]`; v1 không dùng champion/item content. Mode verified chỉ được chấp nhận khi provenance phù hợp gate, không suy quyền chỉ từ URL tồn tại.
- `nextInterestInfo` chỉ arithmetic, không đề nghị save/roll/level. Gold số nguyên hữu hạn>=0, thresholds tăng nghiêm ngặt; `gold>=max` trả null/null. Invalid input throw TypeError theo §9, không clamp hoặc trả0 như valid; `validateCatalog` luôn trả `{ok,errors}` cho user input.
- Plan chỉ focus enum và text plain tối đa300; immutable id/createdAt/focus/text/patchVersion. Tạo bản mới khi chỉnh trước trận; active HUD dùng snapshot cũ, core không có quyền tự đổi snapshot đang chơi.
- Review có schema/sessionId/sessionRevision/status/observations/limitations/source:`rules`; tối đa3 quan sát, mỗi câu<=180 ký tự, chỉ kind:`observation`. Cùng stage/gold phải chung envelope hoặc có bằng chứng chúng còn hợp lệ; v1 ưu tiên ghép chung `seq` để tránh trộn sai.
- Thiếu/mismatch pack thì không nhận xét phụ thuộc rule. Không score/winrate, không nhận định “đã roll/level” từ gold giảm, không suy tỉ lệ thắng/nhân quả từ placement. Unknown là quyền abstain, không phải cơ hội điền default.

## Task IDs và phụ thuộc

| Task | Phụ thuộc | Handoff |
|---|---|---|
| P3.1 — Fixture/validator contract | P1.2–P1.3 | Catalog fixture, validated shape và lỗi có thể test |
| P3.2 — Arithmetic và plan snapshot | P3.1 | Hàm thuần, injection id/time rõ; boundary test |
| P3.3 — Evidence-based review | P3.1; completed schema P1 | Review deterministic trên fixture, không phụ thuộc implementation P2 |
| P3.4 — Bộ ca/đánh giá chất lượng | P3.2–P3.3 | 20 answerable +10 insufficient, coverage và contradictions |
| P3.5 — Handoff P5 | P3.4; P2 schema tests khi ghép | Exports, exact fixture/status mapping, known limitations |

P3 không tự sửa contracts để hợp logic dễ hơn. Sai khác schema P2/P3 báo coordinator và sửa contract tests trước. Không buộc P2 hoàn tất để bắt đầu P3; sau ghép phải dùng thêm CompletedSession thật của P2 trong P5.

## Các bước thực hiện

1. Đọc current files trước tạo; xác nhận owner và Contract version; utility/plan invalid throw TypeError, validator trả result theo §9; `createPlan` đã chốt DI argument thứ hai theo §9. Ghi expected divergence so với Synapse: unknown, cap null, provenance, patch mismatch và recommendation≠action.
2. Tạo catalog synthetic tối thiểu, không bundle data game hiện hành. Validate schema/types/provenance/mode, thresholds không rỗng, nguyên hữu hạn tăng nghiêm ngặt. Dữ liệu champion/item không thuộc v1 phải không kích hoạt scoring hoặc đường live.
3. Viết boundary test meaningful trước utility: gold0/9/10/49/50/51, threshold khác fixture, invalid/null/NaN/Infinity, thứ tự/cap. Không hardcode50 trong core; fixture phản ánh bộ thresholds được kiểm tra.
4. Implement utility và plan snapshot. Dùng `clock.isoNow()`/`newId()` injected theo §9, không gọi thời gian/random global; tạo deep copy/freeze các object cần thiết; không để mutate input làm đổi snapshot. Test text300/301 ký tự, focus ngoài enum, HTML như plain text; renderer P5 chịu trách nhiệm textContent.
5. Xây chỉ mục evidence sanitized trong CompletedSession; lọc đúng session, field type và envelope seq. Không đọc state mutable, không nhận input event mới hay clock thật. Ghép gold/stage cùng envelope; trường hợp khác seq chưa có chứng minh freshness phải abstain phần ghép.
6. Tạo quan sát kinh tế mô tả snapshot bằng reasonCode/evidenceIds; utility interest chỉ dùng nếu pack/match patch khớp và dữ kiện cần thiết đủ. Theo §9, thiếu/invalid pack trả insufficient_evidence, mismatch trả patch_mismatch; vẫn được có raw observations độc lập rule có evidence, kèm limitation. Ready chỉ khi pack tương thích và ít nhất một observation hợp lệ; empty observations trả insufficient_evidence, riêng mismatch vẫn giữ patch_mismatch. Không che mismatch bằng pack cũ.
7. Chọn tối đa3 quan sát không trùng, thứ tự xác định bằng seq rồi evidence ID; ưu tiên các mốc có bằng chứng theo rule selection v1 được test. Không output thêm chỉ để đủ3, không chấm sai lầm người chơi nếu dữ liệu chỉ mô tả snapshot.
8. Test purity bằng deep-frozen inputs và repeated runs; không có request/provider/side effects. Chuẩn bị 30 ca gồm≥20 có đủ evidence và≥10 thiếu/hỏng/stale/mismatch; mỗi case có expected exact reasonCode/evidenceIds/status.
9. Chấm cùng người dùng các ca answerable: ít nhất16/20 có quan sát hữu ích, 10/10 ca thiếu evidence bỏ qua đúng phần thiếu, không thấy mâu thuẫn dữ kiện. Báo số output và coverage để không pass bằng im lặng mọi ca; nếu nội dung chỉ lặp số không hữu ích, giảm scope/điều chỉnh selection trước handoff.
10. Giao P5 exports, fixture và giới hạn: review chỉ đọc theo thao tác người dùng trong baseline; auto postgame voice là tương lai. P3 không tự gọi voice hoặc nối legacy advisor để tạo demo đẹp.

## Lệnh kiểm thử dự kiến

Sau implement, từ root checkout chạy `node --test test/catalog.test.js test/plan.test.js test/coach.test.js`, sau đó coordinator chạy `node --test test/contracts-v1.test.js`. Không `npm install`, mạng, Jev, Piper, Overwolf hoặc Rust test trong bộ core. Đây là lệnh dự kiến cho phiên code; chưa chạy ở phiên lập plan.

| Nhóm ca | Kết quả cần chứng minh |
|---|---|
| Unknown/zero | Gold0 là quan sát thật khi có evidence; goldnull hoặc field absent không tạo câu khẳng định |
| Cùng snapshot | Goldseq10 và stageseq11 không bị ghép thành một mốc; cùng seq hợp lệ được ghép |
| Identity/revision | Wrong session evidence bị bỏ; summary revision2 không mutate review revision1 |
| Patch/provenance | Synthetic giữ nhãn; verified thiếu source lỗi; mismatch không đưa thông tin interest theo pack khác |
| Input boundary | Null/NaN/Infinity/âm/threshold trùng/sai thứ tự không bị clamp thành câu đúng giả |
| Determinism | Reorder ledger nhưng seq/ID giống vẫn ra cùng review; tie xử lý ổn định; max3 và <=180chars |
| No inferred action | Planned text hoặc gold giảm không sinh “bạn đã roll/lên cấp”; không replay model top-pick như chosen |
| Purity | Deep-frozen input không lỗi mutation; repeated run bằng nhau; browser import không gọi globals ngoài namespace |

## Tiêu chí hoàn tất

- [ ] P1 contract và test core pass; không dependency mới hoặc sửa file ngoài owner.
- [ ] Catalog/plan/review exports chính xác; đầu ra deterministic, immutable theo contract, giữ source/patch/evidence.
- [ ] Bộ30 ca có coverage hữu ích≥80% trên20 answerable, 10/10 insufficient abstain đúng, không mâu thuẫn dữ kiện quan sát.
- [ ] Rule-dependent output bị gate khi thiếu/mismatch pack; không tồn tại đường live-adaptive, provider call, score winrate hoặc copy YAML/Rust literal.
- [ ] P5 nhận được limitation rõ; chưa tuyên bố Windows runtime hay nâng rank từ core tests.

## Rollback và rủi ro

Các module mới chưa nối runtime trước P5 nên rollback bằng bỏ wiring P5 hoặc revert đúng diff P3, không sửa/xóa legacy files hay worktree agent khác. Catalog lỗi giữ app hoạt động với review giới hạn/abstain, không silent fallback sang patch cũ. Chất lượng quan sát có thể chưa đủ hữu ích dù test kỹ thuật pass; giữ gate đánh giá16/20, không mở rộng sang tactical live để né vấn đề. Error/status precedence đã khóa tại §9; nếu implementation phát hiện mâu thuẫn mới, báo coordinator sửa normative contract và tests trước, không tự sáng tạo API.
