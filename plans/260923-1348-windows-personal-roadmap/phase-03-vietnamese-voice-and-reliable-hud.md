---
phase: 3
title: "Vietnamese voice and reliable HUD"
status: pending
priority: P1
effort: "2–3 ngày"
dependencies: [2]
---

# Pha 3: Tiếng Việt và HUD tin cậy

## Bối cảnh

Phụ thuộc [pha 2](./phase-02-event-state-and-replay-foundation.md). Code hiện tại chưa có backend TTS, queue chưa được vận hành, request không bao phủ toàn bộ vòng đời blob/playback; overlay message gọi sai số tham số. Đây là độ tin cậy của đầu ra, không phải quyền bật coaching trực tiếp.

## Tổng quan

Làm đúng một đường phát âm thanh có thể hủy và một HUD ít gây phân tâm. Test voice trong pregame/postgame/synthetic; voice trong trận mặc định tắt tới khi phạm vi cho phép được xác nhận.

## Yêu cầu

- Mute bằng hotkey riêng; dừng cả audio đang chạy và request đang chờ. Không bắt người dùng dùng micro.
- Tối đa một luồng âm thanh, hàng đợi tối đa 3, giữ bản mới nhất theo semantic key; bỏ hết câu hết TTL/khác epoch.
- UI dùng text an toàn, không nội suy nội dung bên ngoài vào `innerHTML`; message có ID, payload version và callback xử lý lỗi.
- HUD static dùng nội dung chốt trước trận, không thay đổi theo state giữa trận, không highlight chọn lõi/shop/level. Vẫn cần kiểm tra phạm vi sử dụng ở pha 1.
- Không giả định Windows có sẵn giọng Web Speech tiếng Việt. Thiếu voice thì hiển thị text và trạng thái, không âm thầm đọc bằng giọng sai.

## Kiến trúc

`Nội dung được mode cho phép → lọc/dedupe/TTL → queue → cache WAV hoặc TTS CPU → một audio player`.

Ưu tiên cache câu cố định. Chỉ thêm **một sidecar Piper CPU** khi nội dung động cần nó và benchmark đạt. Tài liệu Piper hiện hành dùng POST `/synthesize` với JSON `text`, trả WAV; adapter phải đúng server được chọn, không giữ mặc định GET `/tts` chưa tồn tại. Pin phiên bản/model `vi_VN-vivos-x_low` sau kiểm tra giấy phép và nghe thử. Không dùng CUDA/GPU ở bản đầu.

Local server chỉ bind loopback, allowlist origin app thực tế, giới hạn độ dài text/body, không shell-interpolate nội dung. Mỗi phiên có token ngẫu nhiên truyền qua header và kiểm tra phía server trước xử lý; CORS không phải authentication. Launcher đưa token cho app qua IPC/config cục bộ có quyền user, không qua URL/log/Git; xác minh hành vi Origin thật của Overwolf, không allow mọi origin null. Nếu HTTP server chuẩn không hỗ trợ các guard này thì cần adapter local tối thiểu, không giả định cấu hình sẵn. Thiếu dịch vụ phải degrade nhanh sang cache/text; không lặp request vô hạn hoặc tạo sidecar thứ hai. Hủy xuyên suốt `fetch → response body → blob → play → ended`, revoke object URL và clear timer kể cả khi thất bại.

Desktop surface: thêm đúng một cửa sổ HTML/CSS/JS ngoài game cho chọn kế hoạch, cài auto-review/mute và đọc kết quả. Lifecycle riêng với overlay; background sở hữu settings, lưu cục bộ qua API được kiểm chứng ở pha 1. Không dựng tài khoản/dashboard mới.

## File liên quan

| Hành động dự kiến | Đường dẫn tuyệt đối | Mục đích |
|---|---|---|
| Sửa file hiện có | `/Users/minhhai/workspace/ai/projects/tft-ai-voice-coach/src/voice/voiceEngine.js` | Queue, cache, cancellation, fallback và telemetry |
| Sửa file hiện có | `/Users/minhhai/workspace/ai/projects/tft-ai-voice-coach/src/background/background.js` | Message đúng API, mute/lifecycle |
| Sửa file hiện có | `/Users/minhhai/workspace/ai/projects/tft-ai-voice-coach/src/overlay/overlay.js` | Message contract, safe text, trạng thái degraded |
| Sửa file hiện có | `/Users/minhhai/workspace/ai/projects/tft-ai-voice-coach/src/overlay/overlay.html` | HUD static và trạng thái mute |
| Sửa file hiện có | `/Users/minhhai/workspace/ai/projects/tft-ai-voice-coach/src/overlay/overlay.css` | Responsive/DPI, ít che nội dung |
| Sửa file hiện có | `/Users/minhhai/workspace/ai/projects/tft-ai-voice-coach/manifest.json` | Hotkey và kích thước/click-through theo API đã xác minh |
| Tạo mới, chưa tồn tại | `/Users/minhhai/workspace/ai/projects/tft-ai-voice-coach/src/desktop/desktop.html`, `/Users/minhhai/workspace/ai/projects/tft-ai-voice-coach/src/desktop/desktop.js`, `/Users/minhhai/workspace/ai/projects/tft-ai-voice-coach/src/desktop/desktop.css` | Surface pregame/settings/postgame và kết nối background |
| Tạo mới có điều kiện | `/Users/minhhai/workspace/ai/projects/tft-ai-voice-coach/src/local/tts-service.py` | Adapter Piper nếu server chuẩn thiếu token/origin/health guards; chỉ thêm khi chọn TTS động |
| Tạo mới, chưa tồn tại | `/Users/minhhai/workspace/ai/projects/tft-ai-voice-coach/test/voice-lifecycle.test.js` | Timeout, queue, mute, race và cleanup |
| Tạo mới, chưa tồn tại | `/Users/minhhai/workspace/ai/projects/tft-ai-voice-coach/docs/voice-benchmark.md` | Quy trình/số đo cold-warm/cache và nghe thử |
| Tạo mới có điều kiện | `/Users/minhhai/workspace/ai/projects/tft-ai-voice-coach/scripts/start-tts.ps1` | Một launcher sidecar nếu benchmark chứng minh cần |

Cache âm thanh là output build cục bộ, không mặc định đưa model/audio dung lượng lớn vào Git. Thêm manifest/hash và ghi nguồn/license nếu đóng gói.

## Các bước thực hiện

1. Chọn 20 câu tiếng Việt ngắn đại diện: số vàng, tên tướng/đồ, tộc hệ, chỉ dẫn pregame và nhận xét postgame. Người dùng nghe và đánh dấu câu khó hiểu; không đánh giá tiếng Việt bằng log console.
2. Tạo cache thử nghiệm và đo trên Windows: thời gian eligible/queued đến âm thanh đầu tiên (TTFA), thời gian nhận event đến âm thanh đầu tiên (E2E), và tổng thời gian sinh audio; báo cáo cold start, warm dynamic và cache hit riêng. Ghi timestamps từng chặng và kiểm tra âm thanh thực nghe trên Windows; `audio.play()` resolve không chứng minh thời điểm có âm thanh. E2E live chỉ đo trong simulation đến khi qua gate.
3. Nếu cache không đủ, thử Piper CPU theo hợp đồng HTTP đã xác minh, một model duy nhất; xác nhận response WAV/CORS/timeout và voice quality trước khi tích hợp.
4. Cài queue có priority/key/TTL/epoch; coalesce câu cùng key, chọn câu mới nhất, drop câu cũ. Mute/stop/new match vô hiệu hóa cả kết quả đang hoàn thành.
5. Sửa Overwolf `sendMessage(windowId, messageId, messageContent, callback)` và receiver tương ứng; đợi overlay sẵn sàng, không gửi vào window ID null.
6. Dùng DOM text nodes cho nội dung ngoài; bỏ highlight theo tọa độ 1920×1080 hardcode khỏi đường MVP. Xác nhận native click-through; `pointer-events: none` không thay thế kiểm tra thực tế.
7. Khai báo desktop window trong manifest, mở được khi game chưa chạy/đã đóng; lưu và tải lại settings qua background. Khi trận kết thúc cập nhật nội dung desktop, không ép focus khỏi ứng dụng đang dùng.
8. Test lỗi fetch, body chậm, play bị từ chối, ended/error, thiếu tiếng Việt, sidecar chết, alt-tab và game thoát. Đối chiếu lần cuối tiêu chí tài nguyên trên máy đích.

## Tiêu chí hoàn tất

- [ ] 20 câu nghe rõ theo người dùng; tên riêng khó đọc được sửa/phát âm quy ước.
- [ ] Mục tiêu đề xuất: cache TTFA p95 ≤250 ms; warm dynamic p95 ≤1 giây. Đo ít nhất 50 lần mỗi nhóm, báo cold start riêng; đây chưa phải số đo đã đạt.
- [ ] 100 lượt request giả lập dồn dập không nói chồng, queue không quá 3, không phát câu hết TTL/khác epoch.
- [ ] Mute dừng playback và chặn kết quả request trễ; mục tiêu phản hồi ≤200 ms trên Windows.
- [ ] Không rò object URL/timer qua 100 chu kỳ play/cancel; test không cần backend thật.
- [ ] Request thiếu/sai token hoặc origin không hợp lệ bị từ chối trước TTS/inference; không có token trong URL/logs.
- [ ] Desktop mở được trước/sau game, settings tồn tại sau relaunch; UI nhận completedSession độc lập overlay.
- [ ] HUD không cản thao tác game ở độ phân giải/DPI người dùng; nội dung static giữ nguyên trong toàn bộ trận.

## Rủi ro và xử lý

Piper Windows wheel có trên kho phân phối không có nghĩa runtime đã hoạt động trên máy đích. Nếu model/voice chất lượng kém hoặc sidecar vượt ngân sách, dùng câu thu/cached được phép hoặc text-only để giữ ổn định. Nếu không đạt latency, báo phân bố thật và giảm tính năng; không quay lại tuyên bố 100 ms thiếu bằng chứng. Giấy phép engine/model cần đi kèm gói phân phối thực tế.
