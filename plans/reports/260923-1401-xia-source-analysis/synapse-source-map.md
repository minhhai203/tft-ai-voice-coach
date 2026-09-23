# Bản đồ nguồn tft-synapse cho port JavaScript

**Trạng thái: DONE_WITH_CONCERNS.** Đọc clone tĩnh ở `/tmp/tft-xia-zAZbep/synapse`, SHA `df7c08393b1f8edf89aa2498d70abc63aa6ceb9c`; không build, chạy exe, test, cài package hoặc làm theo lệnh README. Repomix không có nên dùng đọc file trực tiếp. Các test bên dưới là test được đọc, chưa thực thi.

## Kết luận lựa chọn

Port **ý tưởng hợp đồng + hàm thuần nhỏ + lý do có điều kiện + test biên**, không sao chép toàn bộ Rust app. Mục tiêu chỉ synthetic/postgame, dùng contract do plan chính định nghĩa. Không thay Overwolf bằng capture của upstream, không mang live augment/scouting/ML online vào MVP. Các heuristic upstream không phải kiến thức TFT được kiểm chứng.

## Bản đồ kiến trúc thực tế

| Khu vực | Mã và bằng chứng tại SHA | Điều thực sự có |
|---|---|---|
| Entrypoint | [main.rs L32–62](https://github.com/Mattbusel/tft-synapse/blob/df7c08393b1f8edf89aa2498d70abc63aa6ceb9c/crates/tft-synapse/src/main.rs#L32-L62) | Chọn reader một lần, poll mỗi 500 ms, gửi AppMessage qua channel; không loop tự chuyển source khi source đang chạy hỏng |
| Kiểu state | [game_state.rs L35–51](https://github.com/Mattbusel/tft-synapse/blob/df7c08393b1f8edf89aa2498d70abc63aa6ceb9c/crates/tft-types/src/game_state.rs#L35-L51) | Struct có board/bench/shop/economy/augments/opponents; Default suy ra số 0, mảng rỗng, không có observed/unknown, patch, timestamp hoặc provenance |
| Capture | [lib.rs L23–41](https://github.com/Mattbusel/tft-synapse/blob/df7c08393b1f8edf89aa2498d70abc63aa6ceb9c/crates/tft-capture/src/lib.rs#L23-L41) | Live API → BitBlt Windows → MockReader; có thể đưa mock vào cùng pipeline |
| Điều phối | [advisor.rs L165–203](https://github.com/Mattbusel/tft-synapse/blob/df7c08393b1f8edf89aa2498d70abc63aa6ceb9c/crates/tft-advisor/src/advisor.rs#L165-L203) | `advise_full` gọi nhiều advisor, session review, tracker; `finish_game` train/save model |
| Economy | [economy_advisor.rs L82–151](https://github.com/Mattbusel/tft-synapse/blob/df7c08393b1f8edf89aa2498d70abc63aa6ceb9c/crates/tft-advisor/src/economy_advisor.rs#L82-L151) | Thứ tự luật streak → level → roll → save, trả action/reason/interest metadata |
| Board | [board_advisor.rs L72–104](https://github.com/Mattbusel/tft-synapse/blob/df7c08393b1f8edf89aa2498d70abc63aa6ceb9c/crates/tft-advisor/src/board_advisor.rs#L72-L104) | Đếm traits từ từng slot board, tạo khoảng cách breakpoint; tie order chưa ổn định vì HashMap và chỉ sort count |
| Items | [item_advisor.rs L40–112](https://github.com/Mattbusel/tft-synapse/blob/df7c08393b1f8edf89aa2498d70abc63aa6ceb9c/crates/tft-advisor/src/item_advisor.rs#L40-L112) | Lấy đồ từ tướng trên bench và coi như đồ rời; chọn tướng board theo category/traits, `confidence` là score chia 3 |
| Giải thích | [reasoning.rs L7–58](https://github.com/Mattbusel/tft-synapse/blob/df7c08393b1f8edf89aa2498d70abc63aa6ceb9c/crates/tft-advisor/src/reasoning.rs#L7-L58) | Template theo tags/stage/hp/trait và nhãn strong/solid, không phải giải thích nhân quả của model |
| Catalog | [catalog.rs L8–22](https://github.com/Mattbusel/tft-synapse/blob/df7c08393b1f8edf89aa2498d70abc63aa6ceb9c/crates/tft-data/src/catalog.rs#L8-L22), [L134–151](https://github.com/Mattbusel/tft-synapse/blob/df7c08393b1f8edf89aa2498d70abc63aa6ceb9c/crates/tft-data/src/catalog.rs#L134-L151) | Embedded YAML và override JSON chỉ champions/augments; singleton OnceLock load một lần |
| ML | [policy.rs L73–120](https://github.com/Mattbusel/tft-synapse/blob/df7c08393b1f8edf89aa2498d70abc63aa6ceb9c/crates/tft-ml/src/policy.rs#L73-L120) | NN softmax + Thompson/bandit score, lấy top làm pending action rồi train theo placement; không chứng minh action người chơi thực chọn |
| UI/config | [args.rs L10–31](https://github.com/Mattbusel/tft-synapse/blob/df7c08393b1f8edf89aa2498d70abc63aa6ceb9c/crates/tft-synapse/src/args.rs#L10-L31), [app.rs L47–78](https://github.com/Mattbusel/tft-synapse/blob/df7c08393b1f8edf89aa2498d70abc63aa6ceb9c/crates/tft-ui/src/app.rs#L47-L78) | egui panels + overlay settings; args có manual/overlay nhưng main không dùng hai cờ để chọn reader/window; disconnected chỉ đổi nhãn, không xóa recommendation |

## Những điểm README không đủ chứng minh

1. **Không có state đầy đủ từ Live API:** [live_api.rs L110–132](https://github.com/Mattbusel/tft-synapse/blob/df7c08393b1f8edf89aa2498d70abc63aa6ceb9c/crates/tft-capture/src/live_api.rs#L110-L132) mặc định gold=0, hp=100, level=1; [L46–101](https://github.com/Mattbusel/tft-synapse/blob/df7c08393b1f8edf89aa2498d70abc63aa6ceb9c/crates/tft-capture/src/live_api.rs#L46-L101) đoán stage theo thời gian. Board/bench/shop không được nhận diện. Screen reader cũng trả board rỗng/shop None/level1 ([screen_capture.rs L326–347](https://github.com/Mattbusel/tft-synapse/blob/df7c08393b1f8edf89aa2498d70abc63aa6ceb9c/crates/tft-capture/src/screen_capture.rs#L326-L347)). Không được gọi đây là dữ liệu thực đầy đủ.
2. **Meta cũ và trộn assumptions:** YAML khai `meta_version: 14.23`, có traits/champions mẫu không được xác minh set hiện tại ([champions.yaml L1–23](https://github.com/Mattbusel/tft-synapse/blob/df7c08393b1f8edf89aa2498d70abc63aa6ceb9c/crates/tft-data/data/champions.yaml#L1-L23)); loader bỏ qua `meta_version`, ID = vị trí u8, cost sai mặc định One ([loader.rs L7–32](https://github.com/Mattbusel/tft-synapse/blob/df7c08393b1f8edf89aa2498d70abc63aa6ceb9c/crates/tft-data/src/loader.rs#L7-L32), [L66–100](https://github.com/Mattbusel/tft-synapse/blob/df7c08393b1f8edf89aa2498d70abc63aa6ceb9c/crates/tft-data/src/loader.rs#L66-L100)). Không nhập YAML này làm data hiện hành.
3. **“Hot-reload” là startup override:** OnceLock không đọc lại runtime; override vẫn dùng traits/items embedded nên có thể trộn patch. Port cần bundle nguyên tử và fail closed, không copy fallback im lặng.
4. **Postgame review không ghi lựa chọn thật:** Advisor ghi top recommendation vào session; session alternatives đều score 0 và top-pick theo ngưỡng 0.7 ([advisor.rs L146–150](https://github.com/Mattbusel/tft-synapse/blob/df7c08393b1f8edf89aa2498d70abc63aa6ceb9c/crates/tft-advisor/src/advisor.rs#L146-L150), [session.rs L99–129](https://github.com/Mattbusel/tft-synapse/blob/df7c08393b1f8edf89aa2498d70abc63aa6ceb9c/crates/tft-advisor/src/session.rs#L99-L129)). Không port thành kết luận người chơi đã chọn hay học đúng.
5. **Score không phải win rate/confidence:** heuristic chia điểm và softmax/bandit không có bằng chứng hiệu chuẩn. Rule economy giữ cả loss streak trước kiểm tra HP nguy hiểm; shop “50 gold thì roll” ([shop_advisor.rs L151–177](https://github.com/Mattbusel/tft-synapse/blob/df7c08393b1f8edf89aa2498d70abc63aa6ceb9c/crates/tft-advisor/src/shop_advisor.rs#L151-L177)) không phải chiến lược tổng quát an toàn để port.

## Ranh giới không port

- Không port `tft-capture`, Win32 BitBlt, suy luận pixel/round, TLS bỏ xác minh hoặc auto fallback sang mock. Quét source không thấy `ReadProcessMemory`, `OpenProcess`, `WriteProcessMemory`, `SendInput`; không gán cho upstream hành vi đọc memory khi chưa có bằng chứng. Tuy nhiên không mang bất kỳ truy cập memory/automation/capture nào vào target.
- Không port runtime live-augment, opponent/pool tracking, positioning/scouting, online learning, pretrained/binary model hay `releases/tft-synapse.exe`.
- Không port egui/eframe/Tokio/Candle, updater network hoặc tray. Giữ JS/Overwolf shell của target; desktop surface phải theo plan chính.
- Augment reasoning chỉ là minh họa cấu trúc explanation; chọn economy/item evidence hậu kiểm làm ứng dụng đầu tiên. Không có điều khoản miễn trừ do upstream tồn tại.

## Ma trận phụ thuộc → target

Root target: `/Users/minhhai/workspace/ai/projects/tft-ai-voice-coach/`. Các tên NEW là đề xuất, phải hợp nhất với contract/phase chính trước implement.

| Trạng thái | Target / chức năng | Port và thay đổi cần thiết |
|---|---|---|
| EXISTS | `src/advisors/economyAdvisor.js` | Giữ adapter; không gọi voice trực tiếp từ hàm scoring mới |
| EXISTS | `src/advisors/itemAdvisor.js`, `shopAdvisor.js` | Giữ baseline hiện tại để so sánh; không copy recipe/traits/cost cũ |
| EXISTS | `src/ai/jevClient.js` | Không phụ thuộc Jev cho port rule thuần |
| NEW | `src/coaching/economy-rules.js`: `getInterestGap(gold,rules)` | Port ý tưởng breakpoint dưới dạng dữ liệu pin patch; validate số nguyên hữu hạn, trả evidence chứ không imperative live |
| NEW | `src/coaching/explain-review.js`: `explainObservation(observation,evidence)` | Template tiếng Việt từ reasonCode/params + evidenceRefs; score có nhãn heuristic; thiếu evidence → abstain |
| NEW | `src/data/catalog.js`: `validateCatalog`, `createCatalog` | Map theo stable string ID; schema/patch/set/provenance đầy đủ; duplicate/unknown/ref sai → lỗi, không index u8 |
| NEW | `test/ported-rules.test.js`, `test/catalog.test.js` | `node:test`, fixture synthetic; không Rust/Candle/YAML parser runtime |
| NEW có điều kiện | `src/coaching/trait-breakpoints.js`: `summarizeTraits` | Chỉ khi mục tiêu postgame cần; unique champion ID theo ruleset, tie sort có khóa ổn định; chưa cần board-strength score |
| CONFLICT | Upstream empty/default state vs target unknown/provenance | Dùng contract của plan chính, không dịch struct 1–1 hoặc coi array rỗng là đã quan sát |
| CONFLICT | Upstream score/confidence/model-chosen action | Tách observedAction/recommendation; bỏ xác suất không hiệu chuẩn, không auto train |
| CONFLICT | Upstream patch fallback + slot-index IDs | Bundle nguyên tử pin patch; ID không đổi khi sắp xếp catalog |

Không thêm dependency npm cho port lõi. Read file JSON bằng API sẵn có ở lớp ngoài; core chỉ nhận object đã validate, không I/O, clock thật hoặc state global.

## Trace kiểm thử → acceptance cần viết

| Test upstream đã đọc | Target test có ý nghĩa |
|---|---|
| [economy L220–246](https://github.com/Mattbusel/tft-synapse/blob/df7c08393b1f8edf89aa2498d70abc63aa6ceb9c/crates/tft-advisor/src/economy_advisor.rs#L220-L246): breakpoint 0/bằng/ngang/vượt cap | 0,9,10,49,50 và trên cap theo fixture rule; `null`,NaN,Infinity,số âm → không suy ra 0; patch sai → abstain |
| [reasoning L70–108](https://github.com/Mattbusel/tft-synapse/blob/df7c08393b1f8edf89aa2498d70abc63aa6ceb9c/crates/tft-advisor/src/reasoning.rs#L70-L108): chuỗi có tên/unknown/lowHP | Thay “chuỗi không rỗng” bằng exact reasonCode/evidenceRefs và tiếng Việt không khẳng định vượt evidence |
| [board L370–404](https://github.com/Mattbusel/tft-synapse/blob/df7c08393b1f8edf89aa2498d70abc63aa6ceb9c/crates/tft-advisor/src/board_advisor.rs#L370-L404): bound/unknown trait | Thứ tự input không đổi output; duplicate cùng champion không tăng count trái ruleset; unknown trait báo coverage, không silently zero |
| [features L248–273](https://github.com/Mattbusel/tft-synapse/blob/df7c08393b1f8edf89aa2498d70abc63aa6ceb9c/crates/tft-game-state/src/features.rs#L248-L273): deterministic/empty | Cùng evidence+catalog tạo output giống nhau; unknown board khác observed empty board; không cần feature-vector NN |
| [session L149–171](https://github.com/Mattbusel/tft-synapse/blob/df7c08393b1f8edf89aa2498d70abc63aa6ceb9c/crates/tft-advisor/src/session.rs#L149-L171): append decisions | Port theo contract main: dedupe event, immutable finalized evidence, recommendation không được trở thành observedAction |
| Catalog load tests | Duplicate IDs/names, cost sai, ref trait/item thiếu, patch mismatched, reorder entries; giữ known-good bundle nhưng báo lỗi mới, không gọi bundle cũ là current |

Test upstream chủ yếu kiểm tra thuật toán/form/biên; không chứng minh nguồn GEP đúng, patch hiện tại, Windows runtime hay chất lượng chiến thuật. Differential parity chỉ dùng cho hàm nhỏ đã chấp nhận; ca cố ý sửa (unknown, duplication, stale patch) phải ghi expected divergence.

## Giấy phép và nguồn dữ liệu

README [L202–204](https://github.com/Mattbusel/tft-synapse/blob/df7c08393b1f8edf89aa2498d70abc63aa6ceb9c/README.md#L202-L204) ghi MIT, badge link LICENSE nhưng `git ls-tree` tại SHA không có LICENSE/COPYING/NOTICE; Cargo package không có trường license. Do đó **chưa đủ notice để sao chép code nguyên văn kèm grant rõ ràng**. Trước literal port cần xác minh license/attribution; hiện chỉ đề xuất reimplement hành vi nhỏ từ spec, không copy source text.

Không tìm thấy asset ảnh riêng trong tracked tree; YAML game data không có nguồn/license riêng theo file đã đọc. Không chuyển nguyên YAML, binary exe hay model sang repo đích. Tạo catalog nhỏ từ nguồn được phép và ghi provenance riêng; nhãn MIT của README không tự cấp quyền tài sản Riot hoặc dữ liệu bên thứ ba.

## Đầu ra cho plan chính

Ưu tiên một vertical slice: validated synthetic/postgame snapshot → interest observation → explanation tiếng Việt có evidence → assertion suite. Catalog/trait/item scoring mở thêm khi slice này chứng minh hữu ích. Không cần Rust build, local ML hay GPU. Concerns chặn copy trực tiếp: license thiếu file; data14.23; state rỗng giả thành thật; review ghi recommendation như action; confidence không hiệu chuẩn.
