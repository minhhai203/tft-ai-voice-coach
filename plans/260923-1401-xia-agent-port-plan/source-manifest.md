# Nguồn, phạm vi port và inventory

Baseline local: `86cd906b66d33b453ae64a433539f075685739ec` (main, 23/09/2026). Source chưa sửa. Source snapshot upstream đọc trực tiếp trong checkout tạm; không execute/install. Repomix CLI/MCP không có nên dùng fallback direct-file theo ck:xia. Coding agent fetch lại đúng SHA, không dựa vào đường dẫn `/tmp` tồn tại lâu dài.

| Repo / ref được resolve | SHA pin | Scope đọc | Dùng như thế nào |
|---|---|---|---|
| [overwolf/events-sample-apps](https://github.com/overwolf/events-sample-apps) / master | `d9b94954289a7d629502675a70d63f12bcc8e912` | tft-events-sample-app main.js/manifest/index; lol-launcher sample | Reference callback lifecycle, bootstrap; tự triển khai adapter mới |
| [Mattbusel/tft-synapse](https://github.com/Mattbusel/tft-synapse) / main | `df7c08393b1f8edf89aa2498d70abc63aa6ceb9c` | crates tft-types/data/game-state/advisor/synapse; YAML | Reference state/session/review, arithmetic interest; không copy tactical scores/data |
| [OHF-Voice/piper1-gpl](https://github.com/OHF-Voice/piper1-gpl) / main | `5b355b110aecf3de8f4e000ede1ce06831acff35` | src/piper voice/http/download, setup, wheels/tests | Integrate Piper Python API qua wrapper app; không vendor engine/server |
| [typesafe-ai/typesafe-sdk-js](https://github.com/typesafe-ai/typesafe-sdk-js) / main | `66880ccded6cb642dc1809620c2b108c33730214` | src client/questions/types/errors/retry và tests | Optional integrate SDK0.6.0 trong backend Node riêng |

File path/line/permalink cụ thể và rationale: [Overwolf](../reports/260923-1401-xia-source-analysis/overwolf-source-map.md), [Synapse](../reports/260923-1401-xia-source-analysis/synapse-source-map.md), [Piper/Jev](../reports/260923-1401-xia-source-analysis/engines-source-map.md). Nếu SHA không fetch được, báo BLOCKED phần source verification; không silent dùng HEAD mới. Pin source phân tích không chứng minh wheel/model build từ SHA tương ứng.

## Port inventory và dependency matrix

| Packet | Nguồn / layer | Local equivalent | Trạng thái | Deliverable |
|---|---|---|---|---|
| X01 | Overwolf listener lifecycle | background.js | CONFLICT | New platform adapter; P5 đổi wiring |
| X02 | GEP fields/snapshot, official API | background parser defaults | CONFLICT | New normalizer/reducer, fixtures đúng payload |
| X03 | Synapse GameState/session | mutable app state | NEW | Immutable ledger/completed revision; không invent observed action |
| X04 | Synapse economy interest helper | economyAdvisor hardcoded | CONFLICT | Pure arithmetic utility, chỉ descriptive postgame |
| X05 | Synapse catalog | hard-coded Ahri/mock | NEW | Validated pack schema; synthetic fixture, verified pack gate |
| X06 | Synapse explanation format | voice text rải trong advisors | CONFLICT | EvidenceIds/reasonCode review templates, max3 observations |
| X07 | Piper Python voice/WAV | GET /tts?text voiceEngine | CONFLICT | Queue/cache browser + thin authenticated Python wrapper |
| X08 | SDK questions/errors/retries | SDK^0.1.0 evaluate/decisions | CONFLICT | Optional isolated backend0.6.0; baseline no SDK |
| X09 | Local shell | in_game_only overlay | EXISTS + NEW | Preserve HTML stack, add desktop pre/post, static HUD |
| X10 | Windows operational lifecycle | README instructions only | NEW | Start/Stop/Test PowerShell, owned PIDs, artifact hashes |

## Quyền và dependency inventory

- Overwolf sample: không tìm thấy grant trong tracked license files ở snapshot; Synapse README nói MIT nhưng LICENSE không có. Chỉ tham khảo kiến trúc và triển khai từ đặc tả local. Không gọi đó là clean-room. Nếu cần literal copy, phải ghi bằng chứng license và notice trước merge; không suy từ badge.
- Piper engine GPL-3.0-or-later; voice model/dataset có điều kiện riêng. `THIRD_PARTY.md` tương lai phải phân biệt app, engine, SDK, model. Không relicense GPL thành MIT; tách process không tự giải quyết toàn bộ nghĩa vụ phân phối. Baseline cá nhân: chuẩn bị isolated runtime; redistributable installer là gate riêng.
- SDK0.6.0 MIT/Node>=20, dùng package exact khi được giao optional packet. Không thêm nó vào browser bundle/root dependencies.
- Không copy Synapse YAML/meta14.23, ML model, screenshots, trained weights, source tests nguyên khối. Test fixtures app tự viết/sanitized từ nguồn được phép.
- Python baseline candidate3.11 x64, Piper1.8.0 candidate từ source; P1/P4 kiểm wheel published compatibility trước lock. Không claim có wheel đã thử. ONNX/config voice revision/SHA256 đang **TBD**, chưa install-ready.
- Root baseline `node:test`, không dependency mới cho core. Piper CPU dependencies cần thiết cho optional TTS; không GPU/CUDA hoặc training extras. Không paid network/API baseline.

## Ngoài phạm vi port

OCR/capture model, augment feed, opponent scouting, board optimization, auto click, live tactical suggestions, Rust/Candle/egui stack, broad telemetry, cloud database, multiuser, auto updater, provider router. Đây là backlog khác, không để coding agent tự thêm khi thiếu dữ liệu.
