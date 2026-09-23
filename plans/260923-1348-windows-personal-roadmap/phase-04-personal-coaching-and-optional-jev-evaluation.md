---
phase: 4
title: "Personal coaching and optional Jev evaluation"
status: pending
priority: P2
effort: "3–5 ngày"
dependencies: [3]
---

# Pha 4: Coaching cá nhân và đánh giá Jev tùy chọn

## Bối cảnh

Phụ thuộc [pha 3](./phase-03-vietnamese-voice-and-reliable-hud.md). Mục tiêu là ít nhưng đúng, không phải tăng số advisor. Jev bắt buộc hay thay được vẫn chưa có trả lời; không coi đề xuất bỏ phụ thuộc bắt buộc là quyết định của người dùng.

## Tổng quan

Hoàn thiện hướng khuyến nghị: một kế hoạch trước trận, HUD giữ nguyên kế hoạch, tối đa ba bài học sau trận có bằng chứng. Coaching thích ứng trực tiếp vẫn là nhánh có gate; chỉ thử nghiệm bằng synthetic/replay cho tới khi nguồn dữ liệu và hành vi được xác nhận phù hợp.

## Yêu cầu

- Bản đầu một lối chơi người dùng chọn, một patch/set được khóa; không hứa hỗ trợ mọi comp/meta.
- Mỗi nhận xét có evidence reference, phạm vi dữ liệu, thời điểm/patch, điều kiện và lý do. Không biết thì nói không đủ dữ liệu hoặc bỏ nhận xét.
- Tách quan sát khỏi khuyến nghị. Dữ liệu match summary chỉ hỗ trợ điều nó thực sự chứa, không đủ tự dựng lại các lần roll/level/giữ vàng.
- Không crawl Tactics.tools/MetaTFT ở MVP; ưu tiên gói dữ liệu nhỏ do người dùng nhập/nguồn cho phép, ghi xuất xứ và giấy phép. Tài nguyên Riot không tự chứng minh tỷ lệ thắng/meta.
- Không gọi mô hình có phí nếu chưa được người dùng xác nhận. Không ghi key vào frontend, Git hoặc logs.
- Giữ hands-free: tùy chọn bật tự review sau trận một lần trong cài đặt, không hỏi lại mỗi trận; chỉ phát sau khi trận kết thúc và chưa vào trận mới. Mute hotkey luôn có tác dụng.

## Kiến trúc

`Pregame: chọn mục tiêu + gói tri thức đúng patch → kế hoạch cố định`.

`Trong trận: hiển thị lại kế hoạch tĩnh; không tính lại, sắp xếp lại hay phát nhắc theo state`.

`Sau trận: completedSession đã finalize ở pha 2 + nguồn được phép → kiểm tra đủ bằng chứng → tối đa ba bài học → bài luyện trận sau`. Desktop window pha 3 nhận kết quả và lưu lựa chọn người dùng; reviewGeneration độc lập cleanup live nhưng bị hủy phát khi có trận mới/mute. Nếu chỉ dùng import thủ công và không có tín hiệu end đáng tin thì người dùng bấm review, không hứa tự động hands-free.

Lõi rule nhỏ làm baseline với điều kiện rõ ràng; `unknown` và abstention là đầu ra hợp lệ. Không cần mô hình để kết luận dữ kiện xác định. Advisors cũ chỉ còn chạy trong simulation hoặc được tái sử dụng có chọn lọc cho phân tích sau trận. `augmentAdvisor` không nằm trong đường runtime MVP.

Jev chỉ là adapter tùy chọn sau baseline. SDK hiện tại không khớp code `evaluate/decisions/new Choice`; tài liệu dùng `systemOne({state, questions})` và `answers.<name>.noul/choice`. Nếu cần cloud, dùng adapter server local tối thiểu sau khi được chấp thuận để giữ credential; một launcher/supervisor quản lý lifecycle, ghi và đo tổng số runtime child thực tế, không giả định Jev/Piper chung executable; không bật `dangerouslyAllowBrowser` theo phản xạ. Nếu chưa có sidecar và chưa chứng minh lợi ích, hoãn Jev để tránh thêm hạ tầng.

## File liên quan

| Hành động dự kiến | Đường dẫn tuyệt đối | Mục đích |
|---|---|---|
| Sửa file hiện có | `/Users/minhhai/workspace/ai/projects/tft-ai-voice-coach/src/ai/jevClient.js` | Bỏ mock âm thầm; adapter tùy chọn đúng hợp đồng khi được chọn |
| Sửa file hiện có | `/Users/minhhai/workspace/ai/projects/tft-ai-voice-coach/src/advisors/economyAdvisor.js` | Điều kiện đủ bằng chứng; simulation/postgame |
| Sửa file hiện có | `/Users/minhhai/workspace/ai/projects/tft-ai-voice-coach/src/advisors/itemAdvisor.js` | Recipe đúng patch; abstain khi thiếu thông tin |
| Sửa file hiện có | `/Users/minhhai/workspace/ai/projects/tft-ai-voice-coach/src/advisors/shopAdvisor.js` | Bỏ comp hardcode khỏi runtime mặc định |
| Sửa file hiện có | `/Users/minhhai/workspace/ai/projects/tft-ai-voice-coach/src/background/background.js` | Chỉ nối coaching mode đã xác nhận; không gọi augment advisor runtime |
| Sửa file được tạo ở pha 3 | `/Users/minhhai/workspace/ai/projects/tft-ai-voice-coach/src/desktop/desktop.js`, `/Users/minhhai/workspace/ai/projects/tft-ai-voice-coach/src/desktop/desktop.html` | Nối pregame/settings/postgame vào core và completedSession |
| Tạo mới, chưa tồn tại | `/Users/minhhai/workspace/ai/projects/tft-ai-voice-coach/src/coaching/personal-coach.js` | Kế hoạch trước trận và nhận xét sau trận |
| Tạo mới, chưa tồn tại | `/Users/minhhai/workspace/ai/projects/tft-ai-voice-coach/data/coaching-pack.json` | Nội dung nhỏ có patch/set/source/conditions |
| Tạo mới, chưa tồn tại | `/Users/minhhai/workspace/ai/projects/tft-ai-voice-coach/test/coaching-evidence.test.js` | Evidence, patch, abstention và fallback |
| Tạo mới, chưa tồn tại | `/Users/minhhai/workspace/ai/projects/tft-ai-voice-coach/docs/coaching-evaluation.md` | Bộ ca gán nhãn và kết quả baseline/Jev |

## Các bước thực hiện

1. Chốt một mục tiêu học cụ thể, ví dụ nhận diện sai sót kinh tế sau trận; không lấy thắng/thua đơn lẻ làm nhãn đúng/sai cho lời khuyên.
2. Chuẩn bị gói kiến thức nhỏ đúng patch, ghi rõ nguồn và giới hạn. Gói stale chỉ dùng như tài liệu lịch sử, không được giới thiệu là meta hiện tại.
3. Viết 30 ca gán nhãn cùng người dùng: dữ kiện đầy đủ, thiếu dữ kiện, mâu thuẫn, patch khác, edge cases. Nhãn có thể là “không đủ thông tin”; chia ít nhất 20 ca đủ dữ liệu để trả lời và 10 ca bắt buộc abstain; báo riêng coverage và số output để tránh pass bằng cách im lặng mọi ca.
4. Xây baseline deterministic cho pregame/postgame; mỗi bài học link tới evidence. Nếu chỉ có match summary, chỉ phân tích kết quả/đội hình/đồ thực sự có trong summary, không nhận xét timing roll/level.
5. Kiểm tra thay đổi state live không thay đổi HUD kế hoạch hoặc tự phát voice trong mode static. Kế hoạch chỉ chỉnh giữa các trận.
6. Nếu người dùng vẫn muốn Jev, kiểm tra quota/chi phí/điều kiện, pin SDK/version hợp lệ và làm một request thử có kiểm soát khi được phép. Tách type-validity khỏi độ đúng chiến thuật: output đúng schema không có nghĩa đề xuất đúng.
7. So sánh Jev với baseline trên cùng bộ ca và ca giữ riêng. Kiểm tra timeout, lỗi SDK, câu trả lời ngoài phạm vi; fallback phải có nhãn hoặc abstain, không giả làm kết quả AI.
8. Quyết định giữ/hoãn Jev dựa trên tỷ lệ lỗi, số nhận xét hữu ích thêm, latency và chi phí. Không có cải thiện rõ thì không đưa vào critical path.

## Tiêu chí hoàn tất

- [ ] Người dùng tạo một kế hoạch trước trận và nhận tối đa ba bài học sau trận; mỗi bài học truy được về dữ liệu thật hoặc được gắn nhãn synthetic trong test.
- [ ] 100% ca bắt buộc abstain không tạo lời khuyên chắc chắn; không suy ra timeline từ match summary.
- [ ] Mục tiêu đề xuất: ≥80% trong ít nhất 20 ca answerable tạo nhận xét hữu ích; không quan sát thấy mâu thuẫn với dữ kiện. Báo coverage/output count và tỷ lệ hữu ích; mẫu nhỏ không phải bảo đảm chiến thuật.
- [ ] Sai patch, thiếu dữ liệu, SDK lỗi và quota hết không làm app crash hoặc đưa mock vào UI như khuyến nghị thật.
- [ ] Auto-review chỉ chạy khi opt-in và có end signal đáng tin; import thủ công cần bấm review; new-match/mute hủy voice/job cũ, evidence còn để đọc.
- [ ] Không có khuyến nghị thích ứng trong runtime in-game mặc định; test chứng minh state thay đổi không đổi nội dung kế hoạch.
- [ ] Jev có quyết định giữ/hoãn với bằng chứng; nếu chưa được phép gọi API thì ghi “chưa đánh giá”, không chặn MVP baseline.

## Rủi ro và xử lý

Coaching chiến thuật khó chấm đúng tuyệt đối: giữ mục tiêu học hẹp, giải thích bằng chứng và để người dùng sửa đánh giá. Dữ liệu patch trôi nhanh: gói tri thức phải hết hiệu lực rõ ràng. Nếu người dùng yêu cầu giữ toàn bộ vision live, cần kế hoạch nhánh riêng sau gate chính sách/dữ liệu; ước lượng 10–16 ngày không bao gồm lời hứa hoàn thành nhánh đó.
