# Acceptance matrix — test hành vi thay vì chỉ khớp implementation

Tất cả là test cần viết/chạy trong implementation; hiện chưa PASS. Mỗi case cần assertion observable và fake deterministic clocks/transports. Không tăng số test bằng snapshot nguyên internal object. Test source mới không copy nguyên suite upstream.

| ID | Input / trigger | Kết quả bắt buộc | Owner |
|---|---|---|---|
| C01 | New/import schema invalid; missing gold | Reject invalid schema; unknown giữ null; known0 giữ0 | P1/P2 |
| E01 | shared class5426, game_modeLOL/unknown/TFT | Metadata bootstrap không deadlock; chỉ TFT+capture gate có own data | P2 |
| E02 | Two start; three game-info callbacks; stop/start | Một registration/listener mỗi type; remove đúng callback; retry timers clear | P2 |
| E03 | feature success false/partial; stop during retry | Tối đa4attempts, bounded delays; degraded nếu thiếu feature; không retry sau stop | P2 |
| E04 | me.gold '29', me.health '82', xp JSON, round_type JSON | Parse đúng category, atomic envelope; badJSON field không crash/mất fieldkhác | P2 |
| E05 | Snapshot requested then newer delta then late snapshot | Snapshot chỉ fill unknown chưa đổi; không rollback giá trị mới | P2 |
| E06 | duplicate seq; epoch cũ; callback cũ sau reconnect | Không mutate session mới, không double ledger/review | P2 |
| E07 | matchEnd rồi late summary rồi match mới | completed v1 giữ nguyên, v2 mới; review generation tăng; audio cũ canceled | P2/P5 |
| E08 | 5001rows, oversized import, html text | truncation explicit, <=2MiB import, no executable/rendered HTML | P2/P5 |
| R01 | gold 0,9,10,49,50 và customthresholds | gap10,1,10,1,null; invalidthresholds reject; không lệnh trade | P3 |
| R02 | unknown/mismatchpatch, syntheticpack in live | Rule-dependent review abstain; synthetic nhãn rõ; no currentmeta invented | P3 |
| R03 | plan says roll, evidence only gold; suggested action | Không nói người chơi đã roll; no chosen action inferred | P3 |
| R04 | stale gold + new stage khác envelope | Không gắn hai evidence vào cùng snapshot không có chứng minh | P3 |
| R05 | completed revision1 reused, buildReview twice | Deterministic output, <=3observations, exact evidence IDs valid | P3 |
| V01 | enqueue duplicates/burst4+/expiresAt past | 1active+<=3pending; dedupe; TTL; await audioended | P4 |
| V02 | mute during fetch/body/playPromise; unmute | Audible stop mục tiêu200ms; revoke; late result discarded; no replay oldqueue | P4/P6 |
| V03 | cache modelhash changes; >50WAV/20MiB | Invalidate/versionkey; bounded memory; cachedplay still generation check | P4 |
| V04 | wrongOrigin/token, hugebody, arbitrarymodel/path, busy | 403/401/413/400/503 trước synth; no download routes/history leaks | P4 |
| V05 | fake Piper synth writes WAV, returns None | Correct RIFF/WAVE headers via writer; no attempt treat return asbytes | P4 |
| V06 | occupiedport impostor; wrongHMAC; restart oldtoken | Không gửi bearer/text trước identity; unavailable; chỉ app-owned PID stopped | P4/P6 |
| U01 | desktop without game; endgame closes overlay | Pregame/review vẫn truy cập desktop; overlay in_game_only hợp lệ | P5/P6 |
| U02 | unsolicited mutating IPC/invalidmessage; responseerror | Ignore/reject safely, no hidden throw or raw token/log | P5 |
| U03 | active match incoming live updates | HUD plan text byte-identical snapshot; no live suggestions/audio | P5 |
| U04 | app loaded via real HTML vs require in Node | Browser exports resolve; Node import no runtime startup; no SDK browserrequire | P5 |
| W01 | Start twice/Stop twice; stalePID reused byotherprocess | Oneowned service, idempotent stop, không kill unrelated | P6 |
| W02 | offline startup valid artifacts / missinghashmodel | Offline runs; corrupt/missing fails clearly, no surprise download | P6 |
| W03 | alt-tab/resolution/DPI/audiooutput changes | HUD readable/clickthrough as intended; desktop controls usable; no clickcapture game | P6 |
| J01 | Jev disabled or no provider authorization | Zero provider/network calls | Optional |
| J02 | SDK fake401/429/500/bodyhang/malformed choice | Oneattempt, finite deadline, unavailable/abstain no firstoption/mocksuccess | Optional |

## Commands dự kiến

- Root portable suite: `node scripts/run-tests.cjs` (root package script `npm test` trỏ tương đương; runner chỉ enumerate `test/*.test.js`, exclude mock entry và services/**). Node20+ candidate; P1 record phiên bản actually used. Specific phase chỉ test paths phase ghi rõ.
- Piper fake wrapper: `python -m unittest discover -s services/tts/tests -p 'test_*.py'`; fake voice không cần model/provider/network. Real model smoke là command runbook P6 riêng, không trộn vào default unit suite.
- Optional Jev tests chạy trong `services/jev` bằng fake fetch, không cần key. Root default suite không import optional package absent.
- Windows PowerShell: `./scripts/windows/Test-Coach.ps1` sau khi scripts đã được tạo; output sanitized và exit nonzero khi hardgate fail. Không dùng testmock consolelog thay pass/fail suite.

## Quality và Windows targets

- Curated 30-case review set: 20 đủ evidence (>=16 được user đánh giá đúng+hữu ích), 10 thiếu/mâu thuẫn (10/10 abstain hoặc nói rõ thiếu); zero observation không có evidence. Dataset/labels do con người kiểm, không lấy model chấm chính nó. Không đạt bằng im lặng toàn bộ.
- Pilot5trận end-to-end: zero crash, zero crossed-session/audio overlap, zero unintended live adaptive, mọi review traceable. Mẫu nhỏ không chứng minh tăngrank hoặc safety100%.
- 20 câu tiếngViệt: user nghe tên riêng/số/đơn vị; target>=18 rõ nghĩa; lỗi tên tướng không biết thì câu neutral, không thêm pack ngoài scope.
- Latency: batch t0=PLAY_REVIEW user request; firstAudible thực đo audio output, không chỉ play() called. Batch E2E=firstAudible-t0, mục tiêu warm/cache p95<=2s. Mỗi câu sau có eligibleAt lúc câu trước ended; service latency=playStarted-eligibleAt; báo queueWait riêng, không tính speech câu trước thành lỗi inference. Synth TTFA=playStarted-requestStart; cache TTFA ghi N/A và cacheEligibleToPlay riêng. Cold/warm/cache median+p95+max riêng, đồng bộ log clock với phương pháp audio-loopback/headset đo rõ. Mute<=200ms; chưa benchmark. Test3clip8s phải đọc đủ khi scope còn hợp lệ.
- CPU/RAM/FPS: đo idle, synth, 30minute gameplay và baseline game-only cùng settings; target app+sidecar steady RAM<=1GiB, average CPU<=5% total máy (normalize fullCPU), sustained FPS regression<=5%; báo spikes/max riêng. Đây budget đề xuất cho i5/16GB, chưa benchmark; nếu hụt pause TTS/giảm cache, không bắt upgrade GPU.
- Không claim GPU/CUDA compatibility từ thông tin user. Baseline CPU; driver/CUDA untouched.

## Evidence giao nộp

Báo cáo gồm command+exitcode, environment, artifact versions/hashes, expected/actual caseIDs, redacted screenshots/logs/measurements, failures/skips, quyết định tiếp tục. Không lưu token, APIkey, playername/raw sessions. Failed gate không biến thành PASS vì nhánh fallback chạy.
