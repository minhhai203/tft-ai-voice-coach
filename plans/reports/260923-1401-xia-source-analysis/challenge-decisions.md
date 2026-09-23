# Xia challenge và quyết định cho bản plan

Ngày 23/09/2026; mode `--port`; chỉ phân tích/lập plan. Người dùng yêu cầu viết plan từ roadmap, không yêu cầu triển khai. Các lựa chọn dưới đây là baseline đề xuất để coding agent thực hiện khi được giao, không phải bằng chứng người dùng đã duyệt provider/phát hành/copy license.

| Câu hỏi challenge | Câu trả lời từ source | Câu trả lời cho app này | Rủi ro nếu sai / quyết định |
|---|---|---|---|
| Cần chép nguyên project? | Overwolf demo, Synapse Rust app, Piper Python engine, Jev SDK có mục tiêu khác | Giữ shell JS; chỉ mượn lifecycle, evidence/review, integrate thư viện | Rewrite lớn >2 ngày; không transplant stack |
| Demo listener có đủ ổn định? | Retry vô hạn, cleanup thiếu; launcher remove sai emitter | Adapter idempotent, callback refs, retry hữu hạn, epoch và stop | Dữ liệu xuyên trận; viết lại adapter và kiểm thử |
| Có thể coi class 5426 là TFT? | Demo dùng chung lớp game với LoL | Bootstrap chỉ match_info, xác nhận game_mode=TFT rồi mới ingest own-player | Thu nhầm game; unknown/LOL không capture coaching |
| Có thể coi zero là dữ liệu thật? | Synapse defaults 0/empty và ước lượng stage | null + provenance + snapshot reconciliation | Review bịa; không suy trường thiếu |
| Port tactical engine có đúng phạm vi? | Synapse prioritizes live economy/item/board | Pregame plan đóng băng, HUD tĩnh; postgame mô tả có evidence | Chính sách và >2 ngày rework; live adaptive excluded |
| Có thể lấy review như upstream? | Recommendation được ghi như chosen action | Ledger chỉ observed event hoặc user annotation | Gán hành động người chơi sai; tách observed/inferred/planned |
| Nên lấy cả data/meta? | YAML meta14.23, IDs theo vị trí; loader bỏ metadata | Pack schema+patch+provenance; fixture synthetic; chưa có pack thật thì abstain | Sai set/patch; không copy data/ML |
| Có thể chép code với MIT badge? | Overwolf không tìm thấy grant; Synapse README MIT nhưng thiếu LICENSE | Reference kiến trúc; tự triển khai đặc tả local. Literal copy chờ bằng chứng quyền/notice | Critical rights gate; không suy license từ badge |
| Piper stock HTTP có đủ dùng? | 0.0.0.0, routes download, thiếu auth/body guard | Thin loopback wrapper, CPU, một worker, token + Origin + identity | Critical local boundary; không port demo server |
| Mute có dừng tính toán? | Piper không có cancel compute | Dừng nghe/queue ngay, generation bỏ kết quả cũ; compute có thể chạy hết | Sai UX/resources; test đúng mức cancel |
| Jev có bắt buộc? | Cloud SDK, Node>=20, typed output, retries | Optional backend riêng, disabled mặc định, fake transport test | Chi phí/runtime tăng; chưa bật provider |
| Windows đã khả thi? | CI/package docs, chưa máy đích | Gate Windows shell/GEP/audio/CPU trước tích hợp đầy đủ | Critical >2 ngày rework; không lấy macOS pass làm runtime pass |

## Decision matrix

| Thành phần | Source way | Local hiện tại | Quyết định |
|---|---|---|---|
| Lifecycle | Demo callback/retry | Bind lặp, cleanup lệch | Port pattern; viết adapter mới, không copy lỗi |
| State | Rust defaults | JS defaults + mutable updates | Reducer JS thuần + envelope + immutable completedSession |
| Coaching | Tactical priority + scores | 4 advisors gọi voice trực tiếp | New deterministic review; disable legacy runtime |
| Data | Embedded YAML/index IDs | Hard-coded Ahri/mock | Versioned pack; manual/synthetic trước, không giả dữ liệu live |
| UI | Demo hidden body / egui | Overlay in_game_only | Giữ HTML, thêm desktop pre/postgame và HUD static |
| TTS | Piper library và demo HTTP | GET /tts?text, timeout sai | Integrate library qua wrapper riêng; cache-first, bounded queue |
| AI | SDK systemOne | evaluate/decisions/mock fallback | Optional isolated Node package; zero provider calls baseline |
| Distribution | Nhiều license/runtime | App MIT declaration | Inventory notice/hash mỗi artifact; không đổi nhãn license engine/model |

## Inline trade-off

Ba mục tiêu cạnh tranh: hands-free, độ chính xác và độ nhẹ. Chọn giữ shell Overwolf nếu chạy được; bỏ live adaptive khỏi MVP; thêm đúng một Python sidecar khi TTS cần thiết. Không GEP nhưng shell chạy: tiếp tục core bằng fixtures/import, live pilot chưa đạt. Không shell: dừng Windows integration và lập lại phương án, không tự thêm OCR/framework. Đánh đổi rõ: nhập tay làm mất auto hands-free, cần người dùng chọn trước phát hành fallback.

Existing: HTML/JS shell, prototype advisors/voice, mock console. Minimum: sửa boundary/lifecycle, pure core, UI pre/post, audio, Windows runbook. >8 files cần thiết vì tách owner và test boundaries; không thêm frontend framework/database/state library. Sáu phase là sáu handoff/merge gate, không phải sáu services. Baseline có app + optional Python; Node service Jev tách riêng và hoãn.

## Risk score theo Xia

**Medium: 3 critical assumptions**: (1) quyền dùng/copy artifact và voice, (2) Windows shell/GEP capability, (3) local service identity/auth + lifecycle. Mỗi sai có thể gây vấn đề quyền/bảo mật hoặc >2 ngày làm lại. Giải quyết bằng P1 evidence gates và P4 security tests trước Windows pilot; không block việc viết plan hoặc core synthetic. Live adaptive không được đưa vào phạm vi để né gate. Jev disabled không phải prerequisite MVP. Không có benchmark Windows hay permission giả định đã đạt.
