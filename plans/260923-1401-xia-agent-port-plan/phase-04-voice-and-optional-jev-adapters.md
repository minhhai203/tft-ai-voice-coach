---
phase: 4
title: "Voice and optional Jev adapters"
status: pending
effort: "3–4 ngày baseline; Jev extension 1–2 ngày riêng"
dependencies: [1]
---

# Pha 4: Voice adapter và Jev tùy chọn

## Bối cảnh và ownership

Đọc [contracts v1](./contracts.md), [challenge decisions](../reports/260923-1401-xia-source-analysis/challenge-decisions.md), [engine source map](../reports/260923-1401-xia-source-analysis/engines-source-map.md). Contract là chuẩn ghép; agent không tự đổi field/status. P4 chạy song song P2/P3 sau P1; P5 tích hợp, P6 nghiệm thu Windows. P1 phải kiểm bootstrap/API/Origin sớm, không đợi P6 mới phát hiện kiến trúc không chạy.

P4 chỉ sở hữu path trong bảng. Không sửa manifest/background/UI; gửi dependency/script/permission seam cho P5. Không vendor Python engine/SDK. Baseline không Jev, paid inference hoặc Web Speech fallback tự động. Các bước đều là kế hoạch, chưa chạy Windows.

| Target từ repo root | Hành động | Source → thích ứng |
|---|---|---|
| `src/voice/voiceEngine.js` | Modify | Bỏ GET `/tts`, queue giả; createVoiceEngine theo contracts, CJS/IIFE |
| `src/voice/serviceClient.js` | Create | Read-file Overwolf, HMAC health, protected synth; injected API/fetch/crypto |
| `test/voice-engine.test.js` | Create | Fake clock/Audio/fetch, queue/cache/cancel/deadline |
| `test/voice-service-client.test.js` | Create | Bootstrap/schema/HMAC/nonce/origin/bodycap, không token thật |
| `services/tts/server.py` | Create | Thin stdlib HTTP wrapper; không copy Piper Flask server |
| `services/tts/engine.py` | Create | PiperVoice.load/synthesize_wav, fixed model CPU và một synth slot |
| `services/tts/requirements.in` | Create | Chỉ runtime dependency đã chọn; không training/GPU extras |
| `services/tts/requirements-win.lock` | Create sau artifact gate | Exact Windows dependency/wheel hashes thực; không checksum giả |
| `services/tts/tests/test_server.py` | Create | unittest fake voice: HTTP/auth/Origin/limits/concurrency |
| `services/tts/tests/test_engine.py` | Create | WAV writer contract; model load một lần; không tự tải voice |
| `services/tts/README.md` | Create | Protocol/config, artifact/license gate, STOP/cancel semantics |

Nguồn Piper SHA `5b355b110aecf3de8f4e000ede1ce06831acff35`: [load:123](https://github.com/OHF-Voice/piper1-gpl/blob/5b355b110aecf3de8f4e000ede1ce06831acff35/src/piper/voice.py#L123), [synthesize_wav:455](https://github.com/OHF-Voice/piper1-gpl/blob/5b355b110aecf3de8f4e000ede1ce06831acff35/src/piper/voice.py#L455). Model load eager; eSpeak lazy có khóa không chứng minh toàn bộ server thread-safe. Integrate package; không port ONNX/eSpeak sang JS.

## Hợp đồng thực thi

- Public voice API và job theo contracts §5; P5 tạo batch PLAY_REVIEW và enqueue từng câu khi eligible theo §9, không enqueue3câu cùng TTL từ đầu. Engine enqueue trả terminal-result Promise; onStatus callback shape lấy §9. Một active +3 pending FIFO, full drop oldest pending, dedupe trong scope; TTL15s check lại trước play/cache hit. Mute reject enqueue; unmute không khôi phục queue.
- Cache LRU <=50 WAV/20MiB, key text+voiceArtifactHash+settingsVersion; không cache lỗi, không persist baseline. Revoke URL sau ended/error/cancel và dọn timer; cache bytes khác playback URL.
- Deadline5s xuyên fetch/body, không retry; cap8MiB ngay cả khi thiếu Content-Length bằng bounded streaming reader. Check audio/wav, RIFF/WAVE và X-Request-Id trước play. Generation invalidation chặn late body/play/cache results.
- Server một synth slot, concurrent synth trả503 BUSY. Health không đợi ONNX xong; HTTP tối đa4 handler/connection active, socket read timeout5s, deadline5s tổng cho header+body trước synth và backlog4; vượt cap đóng connection sớm, không tạo thread/queue vô hạn. Khóa synth riêng thay vì giả định Piper thread-safe.
- Text<=300 Unicode codepoints, body<=8KiB; count JS codepoints thay UTF16 length. Validate text/requestId/types và reject field/path/model/URL tùy ý trước inference. HTTP statuses lấy đúng contracts.
- Load một model đã pin CPU `use_cuda=False`, alignments tắt. WAV: BytesIO → wave.open('wb') → synthesize_wav → close writer → getvalue; return của synthesize_wav không phải audio bytes.
- Không auto-download hoặc model fallback. Thiếu/khác hash/voice license chưa rõ => NOT_READY hoặc TTS disabled; fake tests không cần import Piper/model.
- Chỉ health/synthesize theo contracts; không stock `/download`, `/all-voices`, `/info` hoặc UI. Bind127.0.0.1; bearer+exact Origin+content-type+limits trước engine. CORS không thay auth; expose X-Request-Id.
- Mute: pause/currentTime0/revoke/abort+generation. ORT có thể synth hết câu dù client abort; không claim cooperative compute cancel. Dispose không kill process, launcher P6 là owner.

## Bootstrap Windows và seam với P5/P6

Đường API được chọn có [Overwolf IO docs](https://dev.overwolf.com/ow-native/reference/io/ow-io/#readtextfilepath-options-callback) và [paths docs](https://dev.overwolf.com/ow-native/reference/io/paths/), chưa có runtime proof. Dùng `serviceClient.js` đọc localAppData + `/TftVoiceCoach/runtime/session.json` qua readTextFile theo contracts §9; FileSystem, encoding enum/callback eof phải được P1 xác nhận theo SDK Windows. Không dùng Node fs trong browser, không hardcode username/ổ đĩa.

P6 tạo atomic file ACL current user; bootstrap schema/secretHex/nonce/HMAC hex64 chính xác contracts. P4 require success/string/eof/<=8KiB, validate loopback/protocol/port/instance/artifact. Secret chỉ background memory; không log/file export/localStorage/UI. Kết nối: trusted file → crypto random nonce → health không bearer → Web Crypto HMAC verify instance → mới gửi bearer/text. Exact background Origin nằm allowlist đã đo; null/missing/crypto unavailable/API fail => text-only. Restart: invalidate generation, user Retry re-read bootstrap; không poll token vô hạn.

API freeze: `createServiceClient({ow,crypto,fetch,clock,timers}) -> {connect(),synthesize({requestId,text,signal}),dispose()}`; connect trả `{ready,voiceArtifactHash,error}`, synthesize trả `{blob,requestId}` hoặc normalized error. Engine nhận injected service, transport/deadline ở serviceClient, queue/Audio ở engine, không double fetch/discover filesystem. P5 load module một lần và chỉ gửi status tới UI. P6 nhận config path/health/ownership schema, launch args chỉ path không secret. P1 bootstrap capability test là gate sớm; P6 lặp end-to-end với release thật.

## Task packets

| ID | Dependency | Công việc / artifact |
|---|---|---|
| V4.1 | P1 freeze contract | Fake fixtures và tests thất bại cho old engine; imports không khởi động app |
| V4.2 | V4.1 | Queue/cache/cancel/deadline; engine public API và status seam đúng contracts |
| V4.3 | P1 license/artifact gate | Engine wrapper CPU, fake tests không model; lockfile chỉ pin hash đã kiểm |
| V4.4 | V4.3 | Server guards, identity proof, one synth slot, bounded HTTP; ready sau load/warmup |
| V4.5 | V4.2,V4.4 | serviceClient bootstrap fake integration; gửi P5/P6 seam và fixtures |
| V4.6 | V4.5 | Contract review, test results; Windows/model pending ghi đúng, không suy fake audio=benchmark |

## Kiểm thử và acceptance

Lệnh sau implement: `node --test test/voice-engine.test.js test/voice-service-client.test.js`; `python -m unittest discover -s services/tts/tests -p "test_*.py"`. Fake tests không mạng/provider, không đòi Piper install tại module import.

| Test | Input/failure | Assertion |
|---|---|---|
| VT01 | 100 jobs/full/dedupe/expired | <=1 active/3 pending; không phát TTL stale hoặc duplicate scope |
| VT02 | mute/cancel/dispose lúc fetch/body/play pending | Audio dừng; late result discard; không unhandled promise |
| VT03 | Cache50/20MiB, đổi artifact/settings | Evict bounded; no stale hit; không leak URL/timer |
| VT04 | Slow/oversized body, wrong MIME/WAV/requestId | Abort/status lỗi trước play; không retry/Web Speech |
| VT05 | Bad/missing token/origin/preflight/oversize | Reject trước engine counter tăng; exact statuses; không wildcard CORS |
| VT06 | Hai synth/slow HTTP client/health lúc synth | BUSY bounded; một engine active; health phản hồi; handler cap có hiệu lực |
| VT07 | Forged HMAC/nonce replay/instance mismatch/file invalid | 0 bearer/text gửi trước identity verify; không secret log/UI |
| VT08 | Missing model/config/hash mismatch | NOT_READY, không download hoặc đổi voice |
| VT09 | Abort fetch trong synth | Chỉ assert stop playback/discard; không assert ORT stopped |

- [ ] V4.1–V4.6 pass deterministic, đúng contracts và module seam bàn giao P5.
- [ ] Windows/mute200ms/TTFA/model-quality pending được ghi riêng; no fake benchmark claim.
- [ ] Model revision/hash/license install-ready hoặc TTS disabled; engine/model notices tách app MIT.
- [ ] Zero Jev/provider calls và SDK không thuộc baseline dependency.

## Extension Jev — packet chỉ giao riêng

Không nằm trong baseline install/start hoặc thời gian baseline. Khi coordinator giao: create `services/jev/package.json`, `package-lock.json`, `server.js`, `adapter.js`, `test/adapter.test.js`; modify `src/ai/jevClient.js` thành local transport. Không đụng dependency root P1 đã bỏ. Node>=20, SDK0.6.0 exact; không vendor SDK/source/tests.

Source SHA `66880ccded6cb642dc1809620c2b108c33730214`: [client:311](https://github.com/typesafe-ai/typesafe-sdk-js/blob/66880ccded6cb642dc1809620c2b108c33730214/src/client.ts#L311), [types:72](https://github.com/typesafe-ai/typesafe-sdk-js/blob/66880ccded6cb642dc1809620c2b108c33730214/src/types.ts#L72), [retry:5](https://github.com/typesafe-ai/typesafe-sdk-js/blob/66880ccded6cb642dc1809620c2b108c33730214/src/retry.ts#L5). Use systemOne/questions/choice/noul; response probabilities map, not array; validate finite[0,1]/known labels. Không gọi confidence winrate hoặc tạo lý do chiến thuật từ scalar.

J4.1 fake transport contract → J4.2 protected endpoint riêng identity/auth giống TTS → J4.3 sanitized postgame result/generation discard → J4.4 benchmark riêng khi provider được phép. Set maxRetries0, total deadline5s, SDK logging off; key backend env/private config ngoài Git, không frontend. Test 401/403/422/429/5xx/timeout/abort/malformed→typed status/abstain; disabled/missing authorization/key=0 network; no provider change/mock success. Không gọi paid inference để hoàn tất packet.

## Rollback

Tắt voice/jev capability, cancel queue, text review giữ hoạt động; không restore GET /tts/silent mock thành fallback thật. Revert module revision riêng, giữ contract tests phát hiện drift. Model/hashes rollback cùng release P6, không xóa user data. BLOCKED cho runtime chưa có máy/voice artifact; DONE_WITH_CONCERNS nếu fake contracts xong nhưng Windows gate pending. Không hạ security guards để demo.

Contract final: health trả proofHex với key decode từ secretHex ra bytes, message UTF8(instanceId+":"+nonce); không HMAC bằng hex string làm key. Fresh nonce mỗi connect. Cache TTFA N/A, đo eligible-to-play riêng; metrics theo acceptance-tests.md.
