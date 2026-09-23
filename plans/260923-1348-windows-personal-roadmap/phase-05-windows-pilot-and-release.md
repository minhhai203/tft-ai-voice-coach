---
phase: 5
title: "Windows pilot and release"
status: pending
priority: P1
effort: "2–3 ngày"
dependencies: [4]
---

# Pha 5: Pilot và bàn giao trên Windows

## Bối cảnh

Phụ thuộc [pha 4](./phase-04-personal-coaching-and-optional-jev-evaluation.md). Mã chạy hoặc test pass trên macOS không xác nhận overlay, voice hay hiệu năng trên Windows. Pha này chỉ được tiến hành trong phiên triển khai đã được người dùng yêu cầu; hiện tại mới lập kế hoạch.

## Tổng quan

Chạy pilot cá nhân trên đúng Windows 11/i5-12400F/RAM16/RTX2060, có báo cáo tái hiện được và đường quay lại phiên bản ổn định. Không công bố app đa người dùng hay cam kết an toàn tuyệt đối.

## Yêu cầu

- Chuẩn bị gói/revision riêng, cấu hình local ngoài Git, dependency/model được pin và có nguồn/license/checksum khi cần.
- Một lệnh khởi động và một thao tác dừng/rollback rõ ràng; không tự thêm autorun trước khi pilot đạt.
- Mặc định chỉ bật mode đã qua gate. Voice trong trận vẫn tắt nếu phạm vi cho phép chưa rõ.
- Log chỉ chứa lỗi, latency, trạng thái pipeline và evidence tối thiểu; không lưu token, chat, tên/ID người chơi khác. Cho phép xóa dữ liệu cục bộ và quy định thời gian lưu.
- Không giả định tên ổ đĩa, thư mục checkout Windows hay tài khoản máy đích giống macOS.

## Kiến trúc

Phân phối shell Overwolf cùng cấu hình/tri thức/cache tối thiểu; thêm sidecar CPU chỉ khi được pha 3 chọn. Khởi chạy idempotent: chỉ tái sử dụng sau khi kiểm tra app ID/protocol version và session ownership (PID/nonce/token do launcher sở hữu). Nếu cổng đã bị dịch vụ khác chiếm, báo collision/degrade, không gửi payload/credential và không kill dịch vụ đó; không mở hai HTTP server/audio player. Dừng app phải dừng đúng tiến trình do app sở hữu; không kill theo tên rộng.

Artifact có revision, phiên bản Overwolf/TFT/Windows, resolution/DPI, model/SDK version nếu dùng, mode bật, kết quả kiểm thử và known limitations. Rollback quay lại gói/revision trước cùng dữ liệu tương thích; không xóa dữ liệu cá nhân khi rollback.

## File liên quan

| Hành động dự kiến | Đường dẫn tuyệt đối | Mục đích |
|---|---|---|
| Sửa file hiện có | `/Users/minhhai/workspace/ai/projects/tft-ai-voice-coach/README.md` | Cài/chạy Windows đúng khả năng đã kiểm chứng |
| Tạo mới, chưa tồn tại | `/Users/minhhai/workspace/ai/projects/tft-ai-voice-coach/docs/windows-runbook.md` | Prerequisites, startup, mute, shutdown, upgrade, rollback |
| Tạo mới, chưa tồn tại | `/Users/minhhai/workspace/ai/projects/tft-ai-voice-coach/docs/windows-pilot-report.md` | Năm trận và ma trận thử lỗi, số đo cùng giới hạn |
| Tạo mới khi cần | `/Users/minhhai/workspace/ai/projects/tft-ai-voice-coach/scripts/start-local.ps1` | Kiểm tra config, khởi động idempotent |
| Tạo mới khi cần | `/Users/minhhai/workspace/ai/projects/tft-ai-voice-coach/scripts/stop-local.ps1` | Dừng đúng tiến trình sở hữu, không kill rộng |
| Tạo mới, chưa tồn tại | `/Users/minhhai/workspace/ai/projects/tft-ai-voice-coach/docs/third-party-notices.md` | Phiên bản và nghĩa vụ license engine/model/dữ liệu |

Các file dự kiến vẫn ở checkout để review; Windows runbook phải dùng đường dẫn máy đích được xác nhận lúc triển khai, không sao chép đường dẫn macOS thành lệnh Windows.

## Các bước thực hiện

1. Chạy toàn bộ test hợp đồng, replay, voice lifecycle và coaching evidence. Ghi lệnh, revision và kết quả; chỉ bổ sung test nếu thay đổi hoặc lỗi mới yêu cầu.
2. Đo baseline game không app ở cùng thiết lập; đo RAM/CPU/FPS và âm thanh nền. Sau đó đo app với cùng thiết lập, ưu tiên so sánh nhiều khoảng chơi tương đương để giảm nhiễu.
3. Chạy smoke Windows: load app trước khi mở game, desktop settings/pregame, game start/end, native click-through, hotkey mute, alt-tab, overlay bị đóng, relaunch app, hai lần start liên tiếp, đọc review trên desktop sau khi game process đã thoát, settings còn sau relaunch.
4. Chạy ít nhất 5 trận đầy đủ với mode đã qua gate. Mỗi trận ghi crash/freeze, lời nhắc không mong muốn, hiểu giọng nói, số bài học có căn cứ và cảm nhận gián đoạn. Custom mode không được dùng làm lý do bỏ qua gate chính sách.
5. Tiêm lỗi có kiểm soát: offline, sidecar không khởi động/chết giữa câu, SDK timeout nếu có, payload malformed/stale, GEP mất dữ liệu, patch mismatch, port TTS bị dịch vụ không thuộc app chiếm, token sai/thiếu. Xác nhận text-only/abstain và không còn lời nhắc cũ khi hồi phục.
6. Điều chỉnh budget theo baseline thực tế. Mục tiêu đề xuất ban đầu: FPS giảm không quá 5% ở điều kiện tương đương; app và sidecar cộng thêm RAM ≤750 MB, CPU trung bình ≤5% tổng CPU khi warm, GPU gần 0. Ghi riêng overhead nền Overwolf nếu vốn chưa chạy.
7. Đóng gói hướng dẫn, notices và known limitations. Thử dừng sạch và rollback một lần; bật autorun chỉ sau khi người dùng chọn và pilot đạt.

## Tiêu chí hoàn tất

- [ ] 5 trận đầy đủ không crash/hang app; không chặn chuột/phím game; không âm thanh chồng hoặc stale xuyên trận.
- [ ] Mute hoạt động trong game và khi app không focus; đóng/relaunch/stop không để sidecar do app tạo bị mồ côi.
- [ ] Offline/degraded không phá game hoặc buộc gọi provider khác; trạng thái dễ hiểu, ưu tiên im lặng.
- [ ] Có số đo cold/warm/cache TTS và overhead RAM/CPU/FPS trên máy đích; ngưỡng đề xuất được đạt hoặc điều chỉnh có lý do người dùng chấp nhận.
- [ ] Người dùng đánh giá hữu ích ≥4/5 và gián đoạn ≤1/5 sau pilot; giữ số câu ít, tối đa ba bài học sau mỗi trận.
- [ ] Runbook tái hiện được từ trạng thái dừng, rollback đã thử, model/dữ liệu/engine có notices phù hợp.
- [ ] Báo cáo nêu rõ nguồn kiểm chứng, phạm vi chưa xác nhận và điều kiện phải kiểm tra lại sau patch; không suy ra “tăng rank” từ 5 trận.

## Rủi ro và xử lý

RAM 16 GB phải chia cho game, trình duyệt và hệ thống: ưu tiên cache/text, không thêm local LLM. FPS biến động theo trận nên mẫu nhỏ chỉ là pilot; ghi baseline và điều kiện đo thay vì kết luận nhân quả quá mức. Update TFT/Overwolf có thể làm sai hợp đồng: chuyển mode cần dữ liệu sang degraded, giữ pregame/static nếu vẫn phù hợp, chạy lại smoke trước khi tiếp tục.
