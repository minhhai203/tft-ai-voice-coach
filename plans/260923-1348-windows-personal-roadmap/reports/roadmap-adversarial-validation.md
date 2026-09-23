# Phản biện và kiểm tra nhất quán roadmap Windows

Ngày: 23/09/2026. Phạm vi: đánh giá kế hoạch, không triển khai.

## Cách kiểm tra

Áp dụng `ck:plan` và `ck:brainstorm`: đối chiếu repo, nghiên cứu nguồn chính thức, kiểm tra giả định, phản biện rồi sửa kế hoạch. Ba góc kiểm tra plan: failure modes, assumption/scope, security. Người viết plan tự kiểm tra scope; reviewer độc lập kiểm tra failure modes trùng hai phát hiện chính. Main phân xử và kiểm tra lại toàn bộ tài liệu. Các phát hiện trùng được gộp.

Việc chỉnh tài liệu để hoàn thiện roadmap nằm trong yêu cầu của người dùng. Không coi các đề xuất đổi phạm vi sản phẩm là đã được người dùng chấp thuận.

## Phát hiện và cách xử lý

| ID | Mức | Phát hiện / bằng chứng | Quyết định và chỉnh sửa |
|---|---|---|---|
| R1 | Medium | Chỉ đo tỷ lệ hữu ích trên output cho phép pass bằng im lặng; `test/mock_game_events.js:58` chỉ log thành công, chưa có benchmark | Accept: 30 ca, 20 đủ dữ kiện/10 phải abstain, ít nhất 16/20 có nhận xét hữu ích, báo coverage; assessment và pha 4 |
| R2 | Medium | Một process cho Node SDK + Piper là giả định chưa chứng minh; `src/ai/jevClient.js:32`, `src/voice/voiceEngine.js:51` là hai kiểu client khác nhau | Accept: chỉ cam kết launcher/supervisor quản lý lifecycle, đo toàn bộ process tree; assessment và pha 4–5 |
| R3 | Medium | TTFA từ allow-play che mất decision/queue; `voiceEngine.js:37`, `:60` không đo được âm thanh E2E | Accept: tách E2E/TTFA, cold/warm/cache và kiểm tra âm thanh thật; assessment, pha 3 và pilot |
| R4 | High | Thiếu UI trước/sau trận; `manifest.json:20–38` chỉ background + overlay in-game; `background.js:75–77` đóng overlay | Accept: desktop window nhỏ có lifecycle/settings riêng; inventory pha 3–4, gate pha 1 và smoke pha 5 |
| R5 | High | Cleanup live làm mất evidence hoặc hủy review; `background.js:22–32` chỉ mutable state, `:191–198` chưa xử lý finalize | Accept: completedSession immutable trước cleanup; reviewGeneration riêng; test end trùng/exit/late summary/new match; pha 2–4 |
| R6 | Medium | Dự phòng nhập tay không có end signal/hands-free hoặc shell; `manifest.json:24–38`, `background.js:70–85` phụ thuộc game runtime | Accept: phân biệt mất GEP với mất shell; manual import cần bấm review; shell thiếu thì lập lại phương án/ước lượng; index, pha 1/4, assessment |
| R7 | High khi bật Jev | Loopback + CORS chưa xác thực request; `voiceEngine.js:51` không token; backend tương lai có thể giữ API credential | Accept: token phiên, Origin kiểm tra server, không token qua URL/log, test từ chối trước xử lý; pha 3. TTS-only: Medium |
| R8 | Medium | Reuse port không xác minh dịch vụ; `voiceEngine.js:10`, `:56–60` tin localhost:5000 và mọi response ok | Accept: app/protocol/session ownership trước reuse; collision degrade, không gửi data/kill nhầm; pha 5 |

Tổng 8 phát hiện duy nhất được áp dụng: 3 High (một có điều kiện Jev), 5 Medium; không có phát hiện bị bác. Đây là sửa thiếu sót kế hoạch, không tuyên bố các lỗ hổng đã khai thác được.

## Những quyết định được giữ

- Giữ Overwolf/JS trước, CPU voice/cache, Jev tùy chọn; không rewrite stack hay thêm cloud cho MVP cá nhân.
- Tầm nhìn live giữ ở nhánh có điều kiện. Hướng pregame/static/postgame vẫn là đề xuất cần người dùng lựa chọn, không phải quyết định ngầm.
- Không coi mock/schema-valid/probability là bằng chứng chất lượng; không coi compile/macOS test là Windows QA.
- Dữ liệu không đủ thì abstain, đồng thời phải chứng minh coverage trên ca đủ dữ kiện.
- Không mở lại feed augment hoặc opponent scouting để lấp thiếu dữ liệu.

## Kiểm tra nhất quán toàn bộ

Sau chỉnh sửa, đọc lại index, đủ 5 phase, assessment và journal; đối chiếu các thay đổi R1–R8 với requirements, inventory, steps và success criteria. Kiểm tra đường link nội bộ, placeholder còn sót, trạng thái pending và các file source có bị thay đổi không.

Các phương án chưa chốt đã được gắn nhãn nhất quán: phạm vi MVP, Jev bắt buộc hay không, độ phân giải/DPI, quyền nền tảng và nguồn dữ liệu. Đây là unknown cần xử lý ở pha 1, không phải hợp đồng đã được xác nhận.

Không còn mâu thuẫn đã biết giữa các tài liệu sau lượt rà soát. Không chứng nhận sẵn sàng bật live coach: gate phạm vi và Windows vẫn chưa được thực hiện.

## Bằng chứng và giới hạn

- Đã đọc mọi source/manifest/test, chạy smoke mock (exit 0, console-only) và probes VM xác minh lỗi state/lifecycle/voice.
- Các đường dẫn file hiện có được đối chiếu; file tương lai được ghi rõ tạo mới hoặc sửa sau phase trước.
- Registry/SDK/Piper/Overwolf/Riot đã đối chiếu qua nguồn dẫn trong assessment; không gọi inference có phí.
- Chưa có đo Windows, dữ liệu trận thật, phản hồi chất lượng coaching thật hay approval của nền tảng cho hành vi cụ thể.
- Ước lượng 10–16 ngày là cho MVP đề xuất, không gồm chờ quyền, không bao gồm nhánh live chưa được xác nhận.
