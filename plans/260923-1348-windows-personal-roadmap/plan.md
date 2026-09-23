---
title: "TFT Voice Coach - Windows personal roadmap"
description: "Roadmap cá nhân Windows: kiểm chứng nền tảng, trạng thái tin cậy, tiếng Việt và coaching có bằng chứng."
effort: "10–16 ngày tập trung, chưa gồm thời gian chờ xác nhận"
status: pending
priority: P1
branch: "main"
tags: [docs, frontend, experimental]
blockedBy: [260923-1401-xia-agent-port-plan]
blocks: []
created: "2026-09-23T06:45:37.995Z"
createdBy: "ck:plan"
source: skill
---

# TFT Voice Coach - Windows personal roadmap

## Implementation handoff

Backlog thực thi chi tiết: [Xia agent port plan](../260923-1401-xia-agent-port-plan/plan.md). Dùng plan này khi giao coding agents; roadmap giữ vai trò mục tiêu, không thực thi song song hai bộ phase trùng nhau. Ước lượng implementation mới 14–20 ngày công phản ánh source-port/security/packaging chi tiết hơn; 10–16 ngày bên dưới là estimate roadmap ban đầu.

## Overview

Mục tiêu đã xác nhận: dùng cá nhân trên Windows, ưu tiên **ổn định, nhắc ít nhưng đúng**. Máy đích: Windows 11, i5-12400F, RAM 16 GB, RTX 2060 6 GB; thông tin “CUDA 13.1” do người dùng cung cấp, chưa kiểm tra driver/runtime. macOS hiện tại chỉ dùng đọc mã, nghiên cứu và chuẩn bị; chưa kiểm chứng khả năng chạy trên Windows.

Tầm nhìn gốc là coach TFT tự theo dõi trận, dùng Jev quyết định và nói tiếng Việt qua HUD. Mã hiện tại là prototype giả lập, chưa có bằng chứng tích hợp game/AI/TTS hoạt động thật. Đánh giá và nguồn: [Báo cáo đối chiếu kỹ thuật](./reports/project-assessment.md).

**Hướng khuyến nghị, chưa phải quyết định đổi sản phẩm đã được người dùng duyệt:** bản đầu gồm kế hoạch trước trận, HUD thông tin tĩnh không đổi suốt trận, và bài học sau trận có bằng chứng. Giữ nhánh coaching thích ứng thời gian thực ở môi trường synthetic/replay; chỉ mở trong trận khi xác nhận được nguồn dữ liệu và cách sử dụng phù hợp với yêu cầu hiện hành của Riot/Overwolf. Dùng Overwolf không tự chứng minh mọi hành vi của app đều được phép; không cam kết “an toàn 100%”. Voice trong trận mặc định tắt khi phạm vi cho phép chưa rõ.

## Quyết định thiết kế đề xuất

- Giữ HTML/CSS/JavaScript và shell Overwolf; tách lõi trạng thái thuần để kiểm thử bằng `node:test`, không thêm framework UI hay viết lại Electron/Tauri.
- Dữ liệu thiếu là `unknown`; mọi đầu ra có nguồn, patch, thời điểm và lý do. Không biến lỗi API thành “khuyến nghị thông minh” bằng mock âm thầm.
- Bắt đầu bằng nội dung/câu nói chuẩn bị sẵn. Chỉ thêm một sidecar TTS CPU khi cache không đủ; GPU/CUDA không phải điều kiện để MVP chạy.
- Jev là thử nghiệm tùy chọn sau khi pipeline ổn; chưa có trả lời rằng Jev bắt buộc. Không gọi provider trả phí khi chưa được xác nhận.
- Bản đầu không OCR, crawler meta, micro, scouting đối thủ, highlight chọn lõi, feed augments hay triển khai đa người dùng.

## Mốc thực hiện và quyết định tiếp tục

| Mốc | Ước lượng | Đầu ra để quyết định |
|---|---:|---|
| 1 | 1–2 ngày | Bảng hành vi được phép/chưa rõ; khả năng load app và lấy dữ liệu trên Windows có bằng chứng |
| 2 | 2–3 ngày | Parser đúng hợp đồng, lifecycle và replay xác định; không dữ liệu cũ xuyên trận |
| 3 | 2–3 ngày | HUD tối giản; tiếng Việt không chồng/lặp; mute tức thời; số đo Windows |
| 4 | 3–5 ngày | Kế hoạch trước trận và nhận xét sau trận; Jev chỉ tiếp tục nếu vượt baseline |
| 5 | 2–3 ngày | Pilot 5 trận đầy đủ trên Windows, báo cáo lỗi và gói chạy/rollback |

Tổng 10–16 ngày tập trung cho một người, cộng thời gian chờ quyền truy cập, xác nhận chính sách và lịch chơi. Đây là ước lượng cho hướng khuyến nghị; nhánh coach thời gian thực chưa được hứa ngày hoàn tất. Nếu shell Overwolf chạy được nhưng GEP chưa dùng được, bản nhập tay/import cần người dùng bấm review và tạm mất auto hands-free. Nếu cả shell không chạy được, dừng nhánh Windows này để lập lại phương án; không hứa cùng phạm vi/ước lượng và không tự đổi sang OCR.

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Scope and Windows feasibility](./phase-01-scope-and-windows-feasibility.md) | Pending |
| 2 | [Event state and replay foundation](./phase-02-event-state-and-replay-foundation.md) | Pending |
| 3 | [Vietnamese voice and reliable HUD](./phase-03-vietnamese-voice-and-reliable-hud.md) | Pending |
| 4 | [Personal coaching and optional Jev evaluation](./phase-04-personal-coaching-and-optional-jev-evaluation.md) | Pending |
| 5 | [Windows pilot and release](./phase-05-windows-pilot-and-release.md) | Pending |

## Dependencies

Chuỗi chính: 1 → 2 → 3 → 4 → 5. Nhánh thiếu GEP nhưng có shell: pha 2 chỉ làm contract/import/synthetic; bỏ capture GEP thật, rồi tiếp tục 3 → 4 → 5 với thao tác review thủ công đã được người dùng chọn. Chỉ thực hiện nhánh Windows khi có máy đích và môi trường phù hợp; việc viết kế hoạch hôm nay không phải triển khai. Các phép đo/tiêu chí dưới đây đều là mục tiêu đề xuất, chưa đo trên máy người dùng.

Các câu hỏi còn mở cần giải quyết ở pha 1: độ phân giải/DPI/chế độ hiển thị TFT; Jev có bắt buộc không; người dùng có chấp nhận hướng pregame/static/postgame được đề xuất không; quyền phát triển Overwolf và nguồn dữ liệu thực tế nào dùng được. Chưa gọi dịch vụ có phí để giải quyết các câu hỏi này.

## Tiêu chí hoàn tất roadmap

- [ ] Chỉ phát hành tính năng có phạm vi sử dụng và nguồn dữ liệu đã kiểm tra; các nhánh chưa rõ bị tắt theo mặc định.
- [ ] Vượt kiểm thử hợp đồng, replay và lifecycle; lỗi dữ liệu/API dẫn đến im lặng hoặc thông báo trạng thái rõ ràng.
- [ ] Hoàn thành pilot Windows và đo tài nguyên, tiếng Việt, input pass-through, mute, relaunch, offline.
- [ ] Mọi nhận xét truy được về bằng chứng; người dùng thấy hữu ích và ít gây gián đoạn. Không lấy tăng rank làm tiêu chí chứng minh với mẫu 5 trận.

## Red Team Review

Đã áp dụng 8 phát hiện duy nhất (3 High có một phụ thuộc Jev, 5 Medium): quality coverage, đo E2E, runtime ownership, desktop window, finalize evidence, fallback nhập tay, xác thực loopback và port collision. [Biên bản và kiểm tra nhất quán](./reports/roadmap-adversarial-validation.md). Tất cả phase vẫn pending; kết quả đánh giá này không phải nghiệm thu Windows hay chấp thuận đổi phạm vi của người dùng.
