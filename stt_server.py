"""
STT Server: real-time speech-to-text with simple speaker diarization.
- HTTP POST /transcribe-chunk on port 8766 (receives base64 PCM audio from backend)
- WebSocket broadcast on port 8765 (sends {speaker, text, id} to renderer)
"""

import asyncio
import base64
import json
import threading
import uuid
from collections import deque

import numpy as np
import websockets
from flask import Flask, request, jsonify
from flask_cors import CORS
from faster_whisper import WhisperModel

# ---------------------------------------------------------------------------
# Globals
# ---------------------------------------------------------------------------
app = Flask(__name__)
CORS(app)

model = WhisperModel('small', device='cpu', compute_type='int8')

audio_buffer: deque[bytes] = deque()
buffer_lock = threading.Lock()

ws_clients: set = set()
ws_loop: asyncio.AbstractEventLoop | None = None

current_speaker = 'Speaker 1'
last_segment_end: float = 0.0
SILENCE_THRESHOLD_SEC = 1.5

SAMPLE_RATE = 16000
CHUNK_SECONDS = 4  # process every 4 seconds of audio


# ---------------------------------------------------------------------------
# WebSocket server (port 8765)
# ---------------------------------------------------------------------------
async def ws_handler(websocket):
    ws_clients.add(websocket)
    try:
        await websocket.wait_closed()
    finally:
        ws_clients.discard(websocket)


async def broadcast(message: dict):
    if not ws_clients:
        return
    data = json.dumps(message)
    await asyncio.gather(*[c.send(data) for c in list(ws_clients)], return_exceptions=True)


def run_ws_server():
    global ws_loop
    ws_loop = asyncio.new_event_loop()
    asyncio.set_event_loop(ws_loop)

    async def _serve():
        async with websockets.serve(ws_handler, '0.0.0.0', 8765):
            await asyncio.Future()  # run forever

    ws_loop.run_until_complete(_serve())


def send_transcript(speaker: str, text: str):
    if ws_loop is None:
        return
    msg = {'speaker': speaker, 'text': text, 'id': str(uuid.uuid4())}
    asyncio.run_coroutine_threadsafe(broadcast(msg), ws_loop)


# ---------------------------------------------------------------------------
# Audio processing thread
# ---------------------------------------------------------------------------
def process_loop():
    global current_speaker, last_segment_end
    accumulated: list[bytes] = []
    target_bytes = SAMPLE_RATE * CHUNK_SECONDS * 2  # int16 = 2 bytes/sample

    while True:
        with buffer_lock:
            while audio_buffer:
                accumulated.append(audio_buffer.popleft())

        total = sum(len(c) for c in accumulated)
        if total < target_bytes:
            threading.Event().wait(0.5)
            continue

        # Convert to numpy float32
        raw = b''.join(accumulated)
        accumulated = []
        audio_np = np.frombuffer(raw[:target_bytes], dtype=np.int16).astype(np.float32) / 32768.0

        # Transcribe
        segments, _ = model.transcribe(audio_np, beam_size=1, language='hu')
        for seg in segments:
            text = seg.text.strip()
            if not text:
                continue

            # Speaker diarization: gap > threshold = new speaker
            if seg.start - last_segment_end > SILENCE_THRESHOLD_SEC and last_segment_end > 0:
                current_speaker = 'Speaker 2' if current_speaker == 'Speaker 1' else 'Speaker 1'

            last_segment_end = seg.end
            send_transcript(current_speaker, text)

        # Keep leftover bytes
        if len(raw) > target_bytes:
            accumulated.append(raw[target_bytes:])

        threading.Event().wait(0.1)


# ---------------------------------------------------------------------------
# Flask HTTP endpoint (port 8766)
# ---------------------------------------------------------------------------
@app.route('/transcribe-chunk', methods=['POST'])
def transcribe_chunk():
    data = request.get_json(force=True)
    chunk_b64 = data.get('chunk', '')
    if not chunk_b64:
        return jsonify({'error': 'no chunk'}), 400

    raw = base64.b64decode(chunk_b64)
    with buffer_lock:
        audio_buffer.append(raw)

    return jsonify({'ok': True})


@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'speaker': current_speaker})


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
if __name__ == '__main__':
    # Start WebSocket server in background thread
    ws_thread = threading.Thread(target=run_ws_server, daemon=True)
    ws_thread.start()

    # Start audio processing thread
    proc_thread = threading.Thread(target=process_loop, daemon=True)
    proc_thread.start()

    print('STT server: HTTP on :8766, WebSocket on :8765')
    app.run(host='0.0.0.0', port=8766, threaded=True)
