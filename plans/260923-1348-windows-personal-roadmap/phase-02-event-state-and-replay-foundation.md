---
phase: 2
title: "Event state and replay foundation"
status: pending
priority: P1
effort: "2–3 ngày"
dependencies: [1]
---

# Pha 2: Chuẩn hóa sự kiện, trạng thái và replay

## Bối cảnh

Phụ thuộc [pha 1](./phase-01-scope-and-windows-feasibility.md). Hiện parser và test không cùng schema với tài liệu native GEP; mock gọi advisor trực tiếp nên chưa chứng minh luồng nền hoạt động.

## Tổng quan

Tạo lõi trạng thái nhỏ, thuần JavaScript, nhận payload chuẩn hóa và phát snapshot xác định. Tất cả logic live-adaptive chỉ chạy synthetic/replay đến khi qua gate phạm vi; bản static không được dùng state để đổi lời khuyên giữa trận.

## Yêu cầu

- Mỗi trường có giá trị hoặc `unknown`, nguồn, timestamp nhận, patch/set khi biết, và match epoch. Không mặc định gold 0/hp 100/stage 1-1 rồi coi đó là quan sát thật.
- Đọc đúng `match_info.round_type` có JSON; `store.shop_pieces` dạng slot map; phân biệt `bench.bench_pieces` với `item_bench`. Mapping cuối dựa trên tài liệu và payload kiểm chứng, không suy diễn bare array.
- Bảo toàn giá trị 0; kiểm tra số hữu hạn/phạm vi; payload hỏng không ghi đè snapshot hợp lệ.
- Không đăng ký/tái sử dụng augments feed; không thêm dữ liệu scouting đối thủ trong MVP.
- Unknown, stale, khác patch hoặc source không được phép phải dẫn tới abstain; không nhắc dựa trên state không đủ dữ liệu.

## Kiến trúc

`Overwolf adapter hoặc synthetic fixture → normalize → state reducer → snapshot có provenance → mode gate → đầu ra được phép`.

Giữ module nhỏ với export có guard cho harness Node và browser globals đã có; không gọi require trong browser; chỉ bổ sung bundler khi thật sự cần, không thêm framework. Reducer không truy cập Overwolf, DOM, mạng hay TTS. Mỗi event có `matchEpoch`, `receivedAt`, `source`, `schemaVersion`; snapshot cập nhật hoàn chỉnh trước khi tạo trigger. Khi thiếu sequence đáng tin cậy, không giả vờ sắp xếp chính xác: đánh dấu stale/unknown và chờ snapshot mới.

Bàn giao hậu trận: `match_end → finalize completedSession đúng một lần → cleanup live → reviewGeneration riêng`. completedSession là bản immutable gồm matchId/patch/source/coverage và phần timeline own-player hợp lệ; giữ độc lập khỏi live epoch. Process exit thiếu match_end chỉ tạo session partial, không tự coi dữ liệu đầy đủ. Summary đến trễ tạo revision immutable mới cho đúng session ID còn được giữ; không ghi sang trận mới. Giới hạn một completedSession gần nhất ở MVP, bỏ nội dung riêng không cần thiết.

Callback/listener có reference cố định. `start/stop` idempotent, retry có giới hạn và có thể hủy. Match mới tăng epoch, reset state/cooldown/queue; phản hồi cũ không được ghi vào trận mới. Adapter `getInfo`/resync chỉ dùng khi API và nguồn được pha 1 xác nhận.

## File liên quan

| Hành động dự kiến | Đường dẫn tuyệt đối | Mục đích |
|---|---|---|
| Sửa file hiện có | `/Users/minhhai/workspace/ai/projects/tft-ai-voice-coach/src/background/background.js` | Lifecycle, routing và snapshot đầy đủ trước trigger |
| Sửa file hiện có | `/Users/minhhai/workspace/ai/projects/tft-ai-voice-coach/src/background/background.html` | Nạp module nhỏ theo thứ tự thật |
| Sửa file hiện có | `/Users/minhhai/workspace/ai/projects/tft-ai-voice-coach/test/mock_game_events.js` | Chuyển thành smoke rõ nhãn, không log “pass” thay assertion |
| Sửa file hiện có | `/Users/minhhai/workspace/ai/projects/tft-ai-voice-coach/package.json` | Thêm lệnh `node --test` không phụ thuộc package mới |
| Tạo mới, chưa tồn tại | `/Users/minhhai/workspace/ai/projects/tft-ai-voice-coach/src/core/game-state.js` | Reducer và provenance |
| Tạo mới, chưa tồn tại | `/Users/minhhai/workspace/ai/projects/tft-ai-voice-coach/src/core/normalize-events.js` | Parser theo hợp đồng native GEP |
| Tạo mới, chưa tồn tại | `/Users/minhhai/workspace/ai/projects/tft-ai-voice-coach/test/state-replay.test.js` | Contract/replay/lifecycle assertions |
| Tạo mới, chưa tồn tại | `/Users/minhhai/workspace/ai/projects/tft-ai-voice-coach/test/fixtures/gep-synthetic.jsonl` | Fixture synthetic có nhãn và expected state |

## Các bước thực hiện

1. Viết bảng hợp đồng cho đúng các field được phép và thực sự cần. Dữ liệu real nếu có lưu ngoài Git mặc định; chỉ fixture đã khử thông tin riêng mới xét đưa vào repo.
2. Tạo fixture sát schema: JSON nested/string, slot rỗng, giá trị 0, malformed JSON, field thiếu, hai field cùng update, event trễ, kết thúc và bắt đầu trận.
3. Viết assertion thất bại cho lỗi hiện tại: trigger stage dùng gold cũ; `if (gold)` bỏ mất 0; listener bind mới không gỡ listener cũ; register lặp.
4. Tách normalizer/reducer. Apply toàn bộ update rồi mới đánh giá thay đổi; dedupe round trigger, resync rõ trạng thái khi mất dữ liệu.
5. Sửa lifecycle, retry, epoch cancellation và game guard. Khi thoát game phải finalize evidence trước, đóng overlay, hủy timers/giọng nói/request và live state tương ứng; giữ completedSession cho review job riêng. Mute hủy playback, trận mới hủy reviewGeneration; giữ dữ liệu review để đọc lại nếu vẫn trong retention.
6. Replay toàn bộ fixture qua entrypoint điều phối bằng clock giả; so sánh state/output với expected. Không gọi internet, local TTS hay SDK thật trong test.
7. Cho shell Windows chạy chế độ chẩn đoán chỉ với phạm vi nguồn đã qua pha 1; ghi khác biệt giữa payload thực và fixture, cập nhật hợp đồng.

## Tiêu chí hoàn tất

- [ ] Cùng fixture chạy hai lần tạo cùng snapshot/output; không phụ thuộc tốc độ mạng/đồng hồ thật.
- [ ] Đúng với số 0, JSON lỗi, slot map và item bench; không tạo sự kiện augments ngoài phạm vi.
- [ ] Đăng ký 10 lần rồi stop chỉ có một bộ listener khi chạy và không còn listener/timer khi dừng.
- [ ] Callback trễ, event trận cũ và retry sau stop không làm thay đổi trận mới.
- [ ] Match-end trùng, process exit kế tiếp, summary đến trễ và trận mới giữa review: finalize một lần, không mất evidence, không phát câu trận cũ; thiếu tín hiệu end đáng tin thì không auto-review.
- [ ] Thiếu/stale/unknown patch dẫn tới im lặng đối với kết luận cần dữ liệu đó.
- [ ] `node --test` kiểm tra assertion thật; smoke log chỉ còn ý nghĩa demo.

## Rủi ro và xử lý

Payload thay đổi theo patch: version schema, giữ fixture đại diện và ngày xác minh; không tự nhận mọi feature được cung cấp ổn định. Snapshot sau trận không tái tạo được lịch sử kinh tế: chỉ kết luận phần quan sát được, không bịa timeline. Nếu không có nguồn live được phép, toàn bộ pha vẫn kiểm chứng bằng synthetic; kết quả đó phải ghi rõ chưa chứng minh runtime Windows.
