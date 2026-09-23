# Adversarial validation và consistency sweep

23/09/2026. Phạm vi: **plan/documentation**, không phải code review của bản implementation chưa có. Ba agent đọc source/soạn packet rồi phản biện contracts; coordinator kiểm cross-phase, scope/complexity và đối chiếu official API. Bốn góc kiểm: assumptions, failure/lifecycle, service security, scope/coordination. Sửa trực tiếp lỗi kỹ thuật trong phạm vi người dùng yêu cầu viết plan; không coi đây là chấp thuận deployment/provider.

## Findings đã áp dụng

| # | Severity | Evidence trong plan/source | Decision delta |
|---|---|---|---|
| 1 | High | `contracts.md:26`, Overwolf sample main.js qua source map | Shared5426 không đủ nhận diện TFT; bootstrap match_info có metadata gate trước own capture |
| 2 | High | `contracts.md:85`, P2 phase task P2.1 | Single identity owner=session manager; adapter inject context, old callbacks giữ epoch, end trước newstart |
| 3 | Medium | `contracts.md:74`, official Windows API MessageReceivedEvent chỉ id/content | Bỏ fake sender authentication; getMainWindow facade cho intents, outbound message cho updates |
| 4 | High | `contracts.md:64`, P4 queue và P5 PLAY_REVIEW | Terminal Promise + onStatus; batch enqueue từng câu sau ended, TTL từ eligible, test3clip8s |
| 5 | High | `acceptance-tests.md:39`, local `test/mock_game_events.js:1`, optional service test path P4 | Root runner enumerate explicit test/*.test.js; không discover mock/network/optionalSDK |
| 6 | Medium | `acceptance-tests.md:49`, P6 WA05 | Batch-first-audible, per-item eligible latency, queueWait riêng; cache TTFA=N/A |
| 7 | Medium | `contracts.md:14`, P2 normalizer/session contracts | Explicit matchEnd/summary shape, units durationSeconds, state.status/quality và validator exports |
| 8 | High | `contracts.md:69`, P4/P6 bootstrap | proofHex key bytes/UTF8 wire exact, freshnonce, launchconfig trước child/bootstrap sau verifiedready |
| 9 | Medium | `contracts.md:36`, P5 import/review selection | Imported artifact riêng bounded2MiB; không ingest live, selection/revision hủy batch |
| 10 | Medium | P1/P3 contracts validators, `contracts.md:54` | Pure invalid=>TypeError, validators result; review missing/mismatch pack status precedence chốt |
| 11 | Medium | P2/P4/P5 phase effort vs root overview | Estimate tổng14–20 ngày công; không giữ số roadmap10–16 như commitment implementation |
| 12 | Medium | P4 Python test command vs acceptance matrix | Một test directory services/tts/tests và command thống nhất; fake tests không cần model |

5 High +7 Medium, 12 accepted, 0 rejected. Đây danh sách deduplicated các vấn đề đã sửa, không có nghĩa hệ thống đã pass Windows. Các references dòng trỏ vùng contract gốc/bằng chứng vấn đề; clarification giải quyết ở §9 và đã đồng bộ phase tiêu thụ.

## Whole-plan consistency sweep

- Đọc plan +6phase +contracts/source/handoff/acceptance; không còn generated stub.
- CLI giữ6phase pending; dependency graph P1→{P2,P3,P4}→P5→P6, optionalJev riêng. Old roadmap blockedBy new detail plan; không có vòng.
- Ghép single owner cho package/contracts/config; adapter/core/voice độc lập; background/manifest/UI một integration owner; Windows scripts P6.
- Source→target mapping có SHA pin cho4repo, source reports có permalinks và limitations; không claim upstream binary/model đã kiểm trên Windows.
- API identity/IPC/import/audio return/status/HMAC/metrics/test paths đã đồng bộ. Root tests không import Jev nếu chưa cài; stale promise/snapshot/session có cases.
- Không code ứng dụng, dependencies, provider settings hay Windows runtime bị sửa trong lượt này. Chỉ tài liệu dưới plans/ và link từ roadmap được cập nhật.

## Gates thực thi còn mở (không phải mâu thuẫn trong plan)

Windows actual shell/GEP/FileSystem/Origin/WebCrypto, source/model rights và ONNX/JSON revision+hash, actual wheel compatibility, độ phân giải/DPI/audio, quality hữu ích16/20 và5match pilot. Coding agent có đường làm core/fake tests độc lập; không được nhận những gate chưa chạy là pass. Jev vẫn optional, chưa có provider authorization. Live adaptive là scope riêng chưa có lịch triển khai.
