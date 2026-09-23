"""
Local Ultra-Low Latency Piper TTS HTTP Server for TFT AI Voice Coach
Runs on http://127.0.0.1:5000/tts?text=...
Latency: ~30ms - 50ms (Warm cache)
"""

import os
import io
import time
import wave
import urllib.parse
from http.server import HTTPServer, BaseHTTPRequestHandler
from piper import PiperVoice

MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "models", "vi_VN-vivos-x_low.onnx")

# Number & Gaming Term Text Normalizer for clear Vietnamese speech
NUMBER_MAP = {
    "0": "không", "1": "một", "2": "hai", "3": "ba", "4": "bốn",
    "5": "năm", "6": "sáu", "7": "bảy", "8": "tám", "9": "chín",
    "10": "mười", "2-1": "hai một", "2-5": "hai năm", "3-2": "ba hai",
    "4-1": "bốn một", "4-2": "bốn hai", "5-1": "năm một"
}

def normalize_text(text: str) -> str:
    """Expands numbers and acronyms to phonetic Vietnamese words"""
    for k, v in NUMBER_MAP.items():
        text = text.replace(k, v)
    return text

print("[VoiceServer] Loading Piper TTS Vietnamese Model...")
voice = PiperVoice.load(MODEL_PATH)
print("[VoiceServer] Model loaded successfully! Warming up engine...")

# Warm up JIT
dummy_io = io.BytesIO()
with wave.open(dummy_io, "wb") as wav:
    voice.synthesize_wav("Khởi động hệ thống giọng nói thành công!", wav)
print("[VoiceServer] Engine warmed up. Ready for instant speech synthesis!")

class TTSHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path == "/tts":
            query = urllib.parse.parse_qs(parsed.query)
            raw_text = query.get("text", [""])[0]
            
            if not raw_text.strip():
                self.send_response(400)
                self.end_headers()
                self.wfile.write(b"Missing text parameter")
                return

            clean_text = normalize_text(raw_text)
            start_t = time.time()
            
            wav_io = io.BytesIO()
            with wave.open(wav_io, "wb") as wav_out:
                voice.synthesize_wav(clean_text, wav_out)
            
            audio_bytes = wav_io.getvalue()
            latency_ms = (time.time() - start_t) * 1000
            print(f"[TTS Synthesized] '{clean_text}' ({len(audio_bytes)} bytes) in {latency_ms:.1f}ms")

            # Send response with CORS headers
            self.send_response(200)
            self.send_header("Content-Type", "audio/wav")
            self.send_header("Content-Length", str(len(audio_bytes)))
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
            self.end_headers()
            self.wfile.write(audio_bytes)
        elif parsed.path == "/health":
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(b'{"status": "healthy", "engine": "piper-tts"}')
        else:
            self.send_response(404)
            self.end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "*")
        self.end_headers()

    def log_message(self, format, *args):
        # Suppress verbose default http log
        return

def run_server(host="127.0.0.1", port=5000):
    server = HTTPServer((host, port), TTSHandler)
    print(f"\n=======================================================")
    print(f" [*] PIPER TTS VOICE SERVER IS RUNNING ON:")
    print(f"     http://{host}:{port}/tts?text=...")
    print(f"=======================================================\n")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n[VoiceServer] Shutting down...")
        server.server_close()

if __name__ == "__main__":
    run_server()
