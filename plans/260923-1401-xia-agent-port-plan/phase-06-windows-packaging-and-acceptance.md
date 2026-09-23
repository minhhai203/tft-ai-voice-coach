---
phase: 6
title: "Windows packaging and acceptance"
status: pending
effort: "2–3 ngày kỹ thuật + lịch chơi ít nhất 5 trận"
dependencies: [5]
---

# Pha 6: Đóng gói và nghiệm thu Windows

## Bối cảnh và ownership

Đọc [contracts](./contracts.md), [P4](./phase-04-voice-and-optional-jev-adapters.md), [challenge](../reports/260923-1401-xia-source-analysis/challenge-decisions.md). DAG P1 → {P2,P3,P4} → P5 → P6; optional Jev loại khỏi prerequisite/ước lượng. Chỉ triển khai Windows khi người dùng giao; plan không cấp quyền tự deploy từ macOS. P1 kiểm secure-bootstrap capability sớm, P6 lặp với release thật.

Máy đích Windows11/i5-12400F/16GB/RTX2060 6GB do user báo; kiểm OS/build/CPU/RAM thực. CUDA13.1 chưa chứng minh runtime và không cần CPU TTS. Không giả đường Windows giống macOS hoặc luôn ổ C.

| Target từ repo root | Action | Mục đích |
|---|---|---|
| `scripts/windows/Start-Coach.ps1` | Create | Verified idempotent startup, ACL bootstrap, artifact hash |
| `scripts/windows/Stop-Coach.ps1` | Create | Stop đúng owned instance; không kill tên rộng |
| `scripts/windows/Test-Coach.ps1` | Create | Read-only preflight mặc định, explicit smoke/pilot evidence |
| `scripts/windows/tests/coach-lifecycle.Tests.ps1` | Create | PID reuse/collision/ACL/rollback; built-in assertions nếu chưa có Pester |
| `runtime/manifest.schema.json` | Create | Artifact allowlist schema, không secrets |
| `runtime/manifest.windows.json` | Create sau gate | Exact version/revision/SHA256/URL/license thực từng artifact |
| `docs/windows-runbook.md` | Create | Prereqs/bootstrap/start/stop/degrade/troubleshoot/rollback |
| `docs/windows-acceptance.md` | Create | 30case/5match và phép đo Windows; chưa chạy ghi pending |
| `docs/third-party-notices.md` | Create | Engine/model/data/license riêng, không gộp MIT |

P6 không sửa UI/background/protocol; giao lỗi đúng owner. Release payload ngoài source/ignored directory P1 đã xác định, không commit model/secret. Không thêm installer framework/auto-update/autorun cho pilot.

## Artifact gate

- Manifest mỗi artifact: logicalId/kind/version/pinnedSourceRevision/URL/SHA256/relativeDestination/licenseNotice; gồm Python runtime, dependencies/Piper wheel, ONNX/JSON và app revision tương thích. Voice revision/hash/quyền còn thiếu thì TTS disabled; không fake hash hoặc resolve main/latest lúc startup.
- Check SHA256 trước load/extract; reject missing/mismatch/unlisted, traversal hoặc destination ngoài release root. Download là bước chuẩn bị riêng được giao, nguồn HTTPS đã review; không iex remote script. Startup offline sau chuẩn bị.
- Windows x64 wheel phù hợp Python minor đã pin; smoke ONNX CPU trên máy thật. Không build engine/source compiler, cài CUDA/GPU/train extras hoặc đổi provider để vượt lỗi.
- Engine GPL-3.0-or-later khác quyền voice/model/data; kiểm artifact notices cụ thể. Personal pilot không được mô tả là clearance thương mại.

## Secure bootstrap và lifecycle

File private `%LOCALAPPDATA%\TftVoiceCoach\runtime\session.json`, record process riêng cùng ACL. LocalAppData lấy Windows user hiện tại, không dùng đường checkout. Directory/file giới hạn current user và SYSTEM, loại inherited broad grants, kiểm effective ACL; không temp/repo/world-readable. Secret CSPRNG mới mỗi instance, không commandline/env dump/log/toast.

Start-Coach:
1. Resolve release/manifest/config, verify artifacts/capability; không admin thường. Nếu record có PID, đối chiếu PID+creationTime+executable+instanceId; PID đơn lẻ/health string không đủ.
2. Instance đúng còn sống: HMAC health/protocol verify trước reuse. Record hỏng/khác instance: report, không bearer/text/kill. Stale record chỉ dọn khi process cũ không còn; PID reused phải giữ process lạ.
3. Port baseline17861 cấu hình được; tối đa3 bind attempts với candidate17861–17863, hết thì fail collision/text-only; không probe/reuse service lạ. Chọn loopback port theo config, tạo private launch-config đã ACL trước rồi launch child bằng config path không secret trong command line. Nếu bind race/collision, fail/reselect bounded; không reuse listener lạ. Chỉ started sau verified ready.
4. Private launch-config chứa session secret/model path được tạo trước child; public-to-background bootstrap là file riêng chỉ publish atomic temp+rename sau identity kiểm chứng theo contracts §9. Model-loading ready:false chưa cho synth. Health nonce/HMAC wire encoding lấy nguyên contracts; ownership record private.
5. P4 background đọc readTextFile qua FileSystem, path từ overwolf.io.paths.localAppData; P5 đã wire. Verify HMAC bằng Web Crypto trước bearer/text. Windows evidence chỉ success/origin/crypto/status, không token content.
6. Mở app bằng cơ chế P1 đã xác nhận, hoặc runbook hướng dẫn load Overwolf app. Không invent URI/launch command. Không listener/audio player thứ hai.

[Overwolf IO](https://dev.overwolf.com/ow-native/reference/io/ow-io/#readtextfilepath-options-callback) hỗ trợ readTextFile; callback/enum/FileSystem/Origin/Web Crypto vẫn phải xác minh runtime ở P1 rồi P6. Grant/API thiếu hoặc Origin null => TTS tắt/text-only, không public-token endpoint/query token/wildcard CORS.

Stop-Coach:
1. Yêu cầu UI mute/dispose qua đường P5 hỗ trợ nếu app đáp ứng; HTTP đóng không tự dừng Audio blob. App không đáp ứng: hướng dẫn đóng đúng app qua Overwolf UI, không kill toàn Overwolf.
2. Verify ownership lại ngay trước stop để tránh PID reuse. Dừng đúng child; ONNX không có cooperative cancel có thể cần terminate worker app-owned, ghi rõ process termination.
3. Wait bounded process exit/port release; process lạ/record sai => báo blocked stop, giữ nguyên. Xóa bootstrap đúng instance vừa dừng; giữ user exports/config.

Restart/release switch rotate token/instance, P5 invalidate generation/reconnect. Không unknown-process reuse/kill. Cơ chế ACL/HMAC không phải sandbox trước malware cùng Windows user; không claim quá mức.

## Task packets

| ID | Depends | Work | Exit evidence |
|---|---|---|---|
| W6.1 | P5 pass | Freeze revision/manifest/runtime/model/notice | Hash thật hoặc TTS explicitly disabled |
| W6.2 | W6.1 | Scripts start/stop/ownership/ACL | PID reuse/collision/stale record tests pass |
| W6.3 | W6.2,P4/P5 | Lặp bootstrap/origin/HMAC Windows proof, offline startup | Không secret leak; forged health nhận0 bearer/text |
| W6.4 | W6.3 | Shell/game/hotkey/click-through/alt-tab smoke | SDK/OS/DPI/headset/version và pass/fail |
| W6.5 | W6.4,P3 cases | 30case quality + >=5match + benchmarks | Raw counts/coverage/p50/p95, no winrate claim |
| W6.6 | W6.5 | Runbook/rollback rehearsal/known limits | Start/stop/revert tái hiện, user data giữ |

Test-Coach `-Mode Preflight` mặc định chỉ đọc environment/artifact/ownership, không launch/download/install/provider. `-Mode Smoke` bounded actions rõ trong help; `-Mode Pilot` ghi evidence khi người dùng chơi. Không bắt cài Pester nếu chưa có: dùng PowerShell assertion harness nhỏ.

## Acceptance matrix

| Test | Cách thử | Điều kiện đạt |
|---|---|---|
| WA01 | Start2 lần/stale PID/PID reused/foreign port | Một owned instance; không secret/kill process lạ |
| WA02 | Broad ACL/missing/truncated file/forged HMAC/restart | TTS fail closed, text-only; atomic read; logs không secret |
| WA03 | Artifact đổi byte/offline/missing | Reject trước load; không auto-download/provider fallback |
| WA04 | Load app/LoL/TFT/unknown/DPI/alt-tab/display mode | Không own-data ingest LoL/unknown; native click-through/mute đúng |
| WA05 | 20 câu nghe (>=18 rõ nghĩa), cold/warm/cache50 lượt mỗi nhóm | TTFA/E2E median+p95+max cold/warm/cache riêng; warm/cache E2E p95<=2s theo root acceptance, không giữ mục tiêu cũ250ms/1s |
| WA06 | Mute target200ms/sidecar crash/body slow/new match | Không chồng/stale; old review audio không lọt trận mới |
| WA07 | >=20 answerable +10 abstain | >=80% answerable có observation hữu ích; 100% required abstain; no evidence contradiction; report coverage |
| WA08 | >=5 trận đầy đủ mode đã qua gate | No crash/hang/input swallowing; voice user-triggered; usefulness>=4/5, disturbance<=1/5 mục tiêu |
| WA09 | Game-only vs app settings tương đương nhiều khoảng | Mục tiêu FPS overhead<=5%, app+sidecar steady RAM<=1GiB, CPU warm mean<=5% total, GPU gần0; Overwolf base riêng |
| WA10 | Stop/previous release+model manifest/start | Token rotate; compatibility pass; user data giữ; archive không secrets |

Timeline đồng nhất root acceptance: decisionReady→enqueue→requestStart→bodyComplete→playStarted→ended; TTFA=playStarted-requestStart, E2E=playStarted-decisionReady. Ghi playback telemetry và kiểm tai nghe thực riêng; play() resolve không tự chứng minh âm thanh đã nghe. Ghi timestamps, apps nền và headroom16GB; mẫu5 trận không chứng minh tăng rank hoặc causal FPS. Không đạt mục tiêu: phân tích, giảm phạm vi hoặc điều chỉnh có lý do user chấp nhận; không sửa số để gọi pass. Synthetic/manual pilot gắn nhãn riêng, không thay live capture evidence.

- [ ] P1–P5 tests cùng revision pass; Windows API/permission/bootstrap thực kiểm hoặc runtime gate BLOCKED.
- [ ] Manifest/hash/notice đủ, idempotent scripts, no process damage/credential leak.
- [ ] Core30case + Windows5match có evidence/caveats; text-only không được gọi voice acceptance đạt.
- [ ] Người dùng tái hiện start/mute/stop/reconnect/rollback; no paid API/autorun ngoài lựa chọn riêng.

## Rollback và báo cáo

Giữ previous release+manifest; stop đúng instance, chuyển release pointer, rotate secret/restart/health. Không downgrade auth/origin/schema để chạy bản cũ; incompatible => text-only cho tới khi giải quyết. Không xóa exports, đổi CUDA/driver hay terminate game/Overwolf rộng. Jev extension rollback disabled độc lập.

Handoff gồm revision/files/commands/results/evidence paths/unknowns và DONE/DONE_WITH_CONCERNS/BLOCKED/NEEDS_CONTEXT. Hiện mọi gate pending, chưa deployment hoặc Windows acceptance. Scope bị chặn cần báo phần đã hoàn tất riêng, không báo macOS test là Windows pass.

Đo batch-first-audible và per-item eligible-to-play theo acceptance-tests.md; TTFA chỉ request synth thật, cache TTFA=N/A. Không tính thời gian phát câu trước vào SLA inference của câu sau.
