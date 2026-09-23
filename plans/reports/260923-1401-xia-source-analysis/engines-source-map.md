# Source map: Piper và Jev cho Windows

Status: **DONE_WITH_CONCERNS**. Ngày 23/09/2026. Đọc source trực tiếp do Repomix không sẵn; không chạy mã upstream, không install, không gọi inference. Báo cáo phục vụ [port plan](../../260923-1401-xia-agent-port-plan/plan.md).

## Source manifest

| Nguồn | Checkout chỉ đọc | SHA đã xác nhận | Phạm vi |
|---|---|---|---|
| OHF-Voice/piper1-gpl | `/tmp/tft-xia-zAZbep/piper` | `5b355b110aecf3de8f4e000ede1ce06831acff35` | Python API, HTTP, download, packaging, tests |
| typesafe-ai/typesafe-sdk-js | `/tmp/tft-xia-zAZbep/jev` | `66880ccded6cb642dc1809620c2b108c33730214` | client/questions/types/retry/errors/runtime/tests |

Nguồn xác nhận cấu trúc, không xác nhận wheel được phát hành từ đúng SHA này hoặc chạy tốt trên Windows đích. Windows 11/i5-12400F/16 GB/RTX2060 là thông tin người dùng; CPU baseline, chưa benchmark.

## Piper: integrate thư viện, không port engine sang JS

| Điểm source | Hợp đồng và hệ quả |
|---|---|
| [setup.py:54–79](https://github.com/OHF-Voice/piper1-gpl/blob/5b355b110aecf3de8f4e000ede1ce06831acff35/setup.py#L54-L79) | Package 1.8.0, GPL-3.0-or-later, Python >=3.9; `onnxruntime>=1,<2`, `pathvalidate>=3,<4`. Pin bản wheel + dependency đã kiểm chứng, không vendor engine vào app MIT. |
| [wheels.yml:13–33](https://github.com/OHF-Voice/piper1-gpl/blob/5b355b110aecf3de8f4e000ede1ce06831acff35/.github/workflows/wheels.yml#L13-L33) | CI có Windows, cp39 ABI target/auto64 và pytest. Chứng minh ý định build/test Windows, không chứng minh máy người dùng đã chạy. |
| [voice.py:123–200](https://github.com/OHF-Voice/piper1-gpl/blob/5b355b110aecf3de8f4e000ede1ce06831acff35/src/piper/voice.py#L123-L200) | `PiperVoice.load(model_path, config_path=None, use_cuda=False, ..., include_alignments=False)` đọc JSON và tạo ORT session ngay; không lazy model. JSON mặc định `<model>.json`; CPUExecutionProvider nếu không bật CUDA. |
| [voice.py:344–360](https://github.com/OHF-Voice/piper1-gpl/blob/5b355b110aecf3de8f4e000ede1ce06831acff35/src/piper/voice.py#L344-L360) | `synthesize(text, syn_config=None, include_alignments=False)` trả iterable AudioChunk theo câu. |
| [voice.py:455–496](https://github.com/OHF-Voice/piper1-gpl/blob/5b355b110aecf3de8f4e000ede1ce06831acff35/src/piper/voice.py#L455-L496) | `synthesize_wav(text, wave.Wave_write, syn_config=None, set_wav_format=True, include_alignments=False)` ghi WAV vào writer; trả alignments hoặc None, **không trả WAV bytes**. Wrapper cần BytesIO + wave.open rồi lấy bytes sau đóng writer. |
| [voice.py:304–312](https://github.com/OHF-Voice/piper1-gpl/blob/5b355b110aecf3de8f4e000ede1ce06831acff35/src/piper/voice.py#L304-L312) | eSpeak phonemizer lazy init và khóa global; không có căn cứ suy rộng toàn bộ voice/server thread-safe. Chọn một worker synthesis tuần tự. |

### Stock HTTP là reference, không phải server app sẵn dùng

- [http_server.py:24–104](https://github.com/OHF-Voice/piper1-gpl/blob/5b355b110aecf3de8f4e000ede1ce06831acff35/src/piper/http_server.py#L24-L104): mặc định bind **0.0.0.0:5000**; model bắt buộc; hỗ trợ speaker, length/noise scales, CUDA, data/download directory. Default model eager load; không download model chỉ vì thiếu lúc khởi động.
- [http_server.py:118–178](https://github.com/OHF-Voice/piper1-gpl/blob/5b355b110aecf3de8f4e000ede1ce06831acff35/src/piper/http_server.py#L118-L178): GET `/info` trả metadata và text/phonemes lần synth cuối; GET `/voices` liệt kê config. GET `/` là web UI.
- [http_server.py:180–214](https://github.com/OHF-Voice/piper1-gpl/blob/5b355b110aecf3de8f4e000ede1ce06831acff35/src/piper/http_server.py#L180-L214): GET `/all-voices` gọi mạng; POST `/download` nhận `{voice,force_redownload?}` và ghi model/config. Không đưa hai endpoint này vào runtime app.
- [http_server.py:216–302](https://github.com/OHF-Voice/piper1-gpl/blob/5b355b110aecf3de8f4e000ede1ce06831acff35/src/piper/http_server.py#L216-L302): POST `/synthesize` nhận `text`, tùy chọn `voice`, `speaker`, `speaker_id`, `length_scale`, `noise_scale`, **`noise_w_scale`**. Docstring ghi `length_w_scale` nhưng code đọc `noise_w_scale`; theo code. Alternate model lazy load; model không tồn tại fallback default, không phù hợp yêu cầu fail-closed app.
- [http_server.py:308–354](https://github.com/OHF-Voice/piper1-gpl/blob/5b355b110aecf3de8f4e000ede1ce06831acff35/src/piper/http_server.py#L308-L354): synth toàn bộ WAV vào RAM rồi trả raw bytes; không explicit `Content-Type: audio/wav`; không streaming HTTP, không route cancel/stop, không kiểm tra client disconnect trong loop.
- Không thấy auth, Origin guard, body limit hoặc khóa cho loaded_voices/last_synthesis trong file này. Đây là server demo cần wrapper; không sao chép toàn bộ routes và gọi đó là production-ready.
- [download_voices.py:13–18](https://github.com/OHF-Voice/piper1-gpl/blob/5b355b110aecf3de8f4e000ede1ce06831acff35/src/piper/download_voices.py#L13-L18): URL dùng nhánh `main`; không coi tên voice là pin artifact. Chuẩn bị download riêng, URL revision/hash đã review, checksum cả ONNX/JSON, không auto-download trong lúc chơi.

### Adapter địa phương đề xuất

**NEW** Python wrapper dùng PiperVoice API; **EXISTS/CONFLICT** `src/voice/voiceEngine.js` đang GET `/tts?text`, hủy fetch không hủy inference. Không rewrite ONNX/eSpeak hoặc copy HTTP server nguyên khối.

- Load đúng một model VIVOS đã chọn khi worker bắt đầu; `use_cuda=False`, alignments tắt; warmup có đo riêng. Chưa pin voice artifact vì model nằm ngoài checkout này: cần model-card/revision/SHA256 trước triển khai; không suy license model từ GPL engine hoặc MIT app.
- Endpoint app do core contract quyết định; giới hạn chỉ health và synth cần thiết. Bind `127.0.0.1`, xác thực session token, Origin allowlist, độ dài/body tối đa, không nhận đường dẫn/model/URL tùy ý từ client.
- WAV response explicit audio/wav, no-store; lỗi JSON ổn định với request ID; thiếu model/voice/speaker phải lỗi rõ, không đổi voice âm thầm. Health không trả text lịch sử/key/path riêng tư.
- Một request synthesis active và queue nhỏ có giới hạn. Single worker tránh phụ thuộc vào giả định thread-safe; không dùng mutex global để hứa browser cancellation dừng ORT.
- **STOP khác CANCEL:** mute dừng Audio ngay, tăng generation/drop kết quả cũ và abort fetch. ORT đang synth có thể tiếp tục đến hết; không có cooperative cancellation trong API đọc được. Muốn hard-stop phải terminate đúng worker do app sở hữu, rồi restart/warmup có kiểm soát; chưa cần cho baseline.
- Khi cổng bị chiếm, kiểm chứng session/app identity trước reuse; không gửi text/token cho service chưa xác định, không kill theo tên rộng.
- Đóng gói Python x64 runtime/venv riêng + wheel CPU đã pin + data eSpeak đi kèm wheel + ONNX/config đã kiểm checksum; không cài CUDA, training extras hay compiler cho người dùng nếu wheel hợp lệ. Runbook có offline startup và rollback model/config cùng version.

## Jev: adapter Node tùy chọn, không vendor SDK

| Điểm source | Hợp đồng thực |
|---|---|
| [package.json:2–31](https://github.com/typesafe-ai/typesafe-sdk-js/blob/66880ccded6cb642dc1809620c2b108c33730214/package.json#L2-L31) | Version 0.6.0, MIT, ESM/CJS, Node >=20. Pin package đã kiểm tra thay `^0.1.0`; dùng package, không copy SDK/tests/toolchain vào app. |
| [client.ts:267–288](https://github.com/typesafe-ai/typesafe-sdk-js/blob/66880ccded6cb642dc1809620c2b108c33730214/src/client.ts#L267-L288) | Browser từ chối mặc định; config > env > defaults. Private API key, injectable fetch cho test; baseURL/model có thể cấu hình. Không enable dangerouslyAllowBrowser. |
| [client.ts:311–324](https://github.com/typesafe-ai/typesafe-sdk-js/blob/66880ccded6cb642dc1809620c2b108c33730214/src/client.ts#L311-L324) | `client.systemOne({state,questions,model?}, options?)` POST `/v1/systemone`; không evaluate/decisions. |
| [questions.ts:20–57](https://github.com/typesafe-ai/typesafe-sdk-js/blob/66880ccded6cb642dc1809620c2b108c33730214/src/questions.ts#L20-L57) | `noul(instructions?, criteria?)`; `choice(instructions, labelToDescriptionMap)`. Choice array sai; không `new Noul/Choice`. |
| [types.ts:72–90](https://github.com/typesafe-ai/typesafe-sdk-js/blob/66880ccded6cb642dc1809620c2b108c33730214/src/types.ts#L72-L90) | Noul `{type:'noul',noul:number}`. Choice `{type:'choice',choice:label,confidence:number,probabilities:{label:number}}`; probabilities **map**, không array. |
| [types.ts:126–141](https://github.com/typesafe-ai/typesafe-sdk-js/blob/66880ccded6cb642dc1809620c2b108c33730214/src/types.ts#L126-L141) | Result `{model,answers:{questionName:answer},usage:{input_tokens,output_tokens}}`. Normalize adapter giữ model/source nhưng không gọi probability là win rate. |
| [retry.ts:5–22](https://github.com/typesafe-ai/typesafe-sdk-js/blob/66880ccded6cb642dc1809620c2b108c33730214/src/retry.ts#L5-L22) | Default timeout 10000ms mỗi attempt, 2 retries, retry 408/429/5xx + connection/timeout, Retry-After tối đa 60000ms. Không phù hợp đường latency ngắn nếu giữ nguyên. |
| [types.ts:198–203](https://github.com/typesafe-ai/typesafe-sdk-js/blob/66880ccded6cb642dc1809620c2b108c33730214/src/types.ts#L198-L203) | signal hủy request và pending retry; timeout per-attempt, **không total retry budget**. Adapter đặt maxRetries:0 ban đầu + AbortController deadline toàn request + kiểm tra epoch lúc trả về. |
| [client.ts:403–446](https://github.com/typesafe-ai/typesafe-sdk-js/blob/66880ccded6cb642dc1809620c2b108c33730214/src/client.ts#L403-L446) | Timeout bao cả body delivery; caller abort thành APIUserAbortError, timeout thành APITimeoutError. Không đồng nghĩa nhà cung cấp dừng compute/billing. |
| [errors.ts:68–121](https://github.com/typesafe-ai/typesafe-sdk-js/blob/66880ccded6cb642dc1809620c2b108c33730214/src/errors.ts#L68-L121) | 400/401/403/404/422/429/5xx thành typed API errors; connection/timeout/abort riêng. Map sang trạng thái unavailable/auth/config/rate-limit, không return mock success. |

SDK TypeScript types không thay runtime validation: adapter kiểm `.answers`, type, finite [0,1], nhãn thuộc candidate set, probabilities map; output invalid → abstain. Không trả lý do chiến thuật tưởng tượng từ một scalar. Log SDK để off/safe summary: debug ghi request body ([client.ts:368–370](https://github.com/typesafe-ai/typesafe-sdk-js/blob/66880ccded6cb642dc1809620c2b108c33730214/src/client.ts#L368-L370)).

**Khuyến nghị:** tùy chọn Node adapter giữ SDK/key trong backend local; core browser không phụ thuộc SDK. Nó thêm Node runtime bên cạnh Python nếu bật cả hai: launcher quản lý lifecycle, không giả định một executable. Nếu thêm runtime không đáng giá, hoãn Jev; không port SDK sang Python thủ công chỉ để giữ lời hứa một process. Không paid request trước khi được phép.

## Challenge trước khi port

| Câu hỏi | Upstream | Địa phương / rủi ro / quyết định |
|---|---|---|
| HTTP demo có dùng nguyên được? | All-interface bind, download, info lịch sử | Cá nhân cần local-only, ít routes; integrate library qua wrapper |
| Voice có lazy và thread-safe toàn bộ? | Model eager; eSpeak lazy có lock; mutable server cache | Một worker, model preload; không claim thread-safe hoặc cold-start 30ms |
| Cancel có dừng engine? | Không cancel API Piper; SDK abort network | Dừng nghe ngay, discard generation; worker kill là đường riêng |
| Type-safe có đủ đúng TFT? | Typed finite-choice output | Vẫn cần validation/patch/evidence/benchmark, không biến mock thành live |
| Cần vendor SDK/engine? | Full runtimes với dependencies/licenses | Chỉ port adapter/contract, integrate package, giữ upgrades độc lập |
| Windows/GPU đã đủ bằng chứng? | CI Windows và CPU provider | Chưa chạy máy đích; wheel hash/runtime/audio/resource smoke mới là gate |

## Contract tests cho coding agent (không gọi provider)

| Nhóm | Ca bắt buộc và assertion |
|---|---|
| Piper fake voice | load đúng một lần; synthesize_wav nhận Wave_write, WAV RIFF/WAVE mono PCM16/sample rate đúng config; empty/oversized text reject trước engine |
| Piper boundary | Sai/missing token hoặc origin reject; arbitrary voice/path/model không được chấp nhận; không /download, /all-voices; health không lộ last text |
| Piper concurrency | Hai request dồn: tối đa một synth active; queue bounded; mute epoch vô hiệu late bytes; client abort không được assert engine đã dừng |
| Piper Windows gate | Model/config thiếu hoặc checksum sai fail-closed; CPU provider; startup offline; cổng bị chiếm không reuse sai; dừng đúng PID; headset nghe thật 20 câu, cold/warm/cache đo riêng |
| Jev transport fake | Assert POST /v1/systemone + questions map; đáp án noul và choice map normalize đúng; không evaluate/decisions; key không xuất frontend/log |
| Jev invalid output | Noul NaN/out-of-range, missing answers, wrong type, unknown choice label, probabilities array → abstain/unavailable, không first-option fallback |
| Jev lifecycle | 401/403/422 không retry; 429/500 maxRetries0 → một request; timeout/body stall/abort đúng trạng thái; late result epoch cũ bị drop |
| Jev opt-in | Disabled/missing authorization → 0 network calls; provider failure không bật provider khác; benchmark fixtures chạy offline |

Tham khảo test upstream, không copy suite nguyên khối: [Piper WAV test:142–162](https://github.com/OHF-Voice/piper1-gpl/blob/5b355b110aecf3de8f4e000ede1ce06831acff35/tests/test_piper.py#L142-L162), [Jev questions/choice:263–313](https://github.com/typesafe-ai/typesafe-sdk-js/blob/66880ccded6cb642dc1809620c2b108c33730214/test/client.test.ts#L263-L313), [Jev reliability tests](https://github.com/typesafe-ai/typesafe-sdk-js/blob/66880ccded6cb642dc1809620c2b108c33730214/test/reliability.test.ts).

## Handoff và giới hạn

Port: hợp đồng adapter, validation, lifecycle, local server bảo vệ và fixture tests. Integrate: Piper wheel + voice artifact và SDK package tùy chọn. Không transplant upstream demo server, training stack, publish workflows hoặc nội dung/game strategy. Risk: medium cho CPU TTS, medium-high cho SDK cloud chưa được phép/benchmark; Windows và voice license artifact còn gate. Không sửa code ứng dụng trong phân tích này.
