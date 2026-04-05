# import cv2
# import pytesseract
# import torch
# import requests
# from fastapi import FastAPI
# from fastapi.middleware.cors import CORSMiddleware
# from fastapi.responses import StreamingResponse

# import threading
# import time
# import logging
# from pydantic import BaseModel
# import re
# import os
# import numpy as np
# from datetime import datetime

# class VehicleLogCreate(BaseModel):
#     licensePlate: str
#     status: str
#     confidence: float
#     timestamp: str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

# # ---------------- CONFIG ----------------
# logging.basicConfig(level=logging.INFO)
# logger = logging.getLogger("LPR")

# NODE_BACKEND_URL = "http://localhost:8000"   # Node.js backend URL
# WEIGHTS = "best.pt"                          # YOLO weights
# CONF_THRESHOLD = 0.25

# # Load YOLOv5 model
# logger.info("Loading YOLOv5 model...")
# model = torch.hub.load(
#     'ultralytics/yolov5',
#     'custom',
#     path=WEIGHTS,
#     force_reload=False
# )
# model.conf = CONF_THRESHOLD
# model.iou = 0.45
# model.to('cpu')

# # Tesseract path
# pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

# # ---------------- FASTAPI APP ----------------
# app = FastAPI(title="Society Security AI Service")

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["http://localhost:5173", "http://localhost:3000"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # ---------------- GLOBAL VARS ----------------
# global_frame = None
# camera_lock = threading.Lock()
# stop_signal = threading.Event()

# # ---------------- Pydantic MODELS ----------------
# class VehicleCheckResponse(BaseModel):
#     isAllowed: bool
#     flatNumber: str = "N/A"
#     ownerName: str = "N/A"

# class VehicleLogCreate(BaseModel):
#     licensePlate: str
#     status: str
#     confidence: float

# # ---------------- HELPERS ----------------
# def clean_text(t):
#     return re.sub(r'[^A-Z0-9]', '', t.upper())

# def is_valid_plate(t):
#     return len(t) >= 6 and any(c.isalpha() for c in t) and any(c.isdigit() for c in t)

# def is_vehicle_allowed(license_plate: str) -> VehicleCheckResponse:
#     try:
#         response = requests.get(
#             f"{NODE_BACKEND_URL}/api/vehicles/check",
#             params={"plate": license_plate},
#             timeout=5
#         )
#         if response.status_code == 200:
#             return VehicleCheckResponse(**response.json())
#         return VehicleCheckResponse(isAllowed=False)
#     except requests.exceptions.RequestException as e:
#         logger.error(f"Error checking backend: {e}")
#         return VehicleCheckResponse(isAllowed=False)

# def add_vehicle_log(log_data: VehicleLogCreate) -> bool:
#     try:
#         response = requests.post(
#             f"{NODE_BACKEND_URL}/api/vehicles/logs",
#             json=log_data.dict(),
#             timeout=3
#         )
#         return response.status_code == 201
#     except requests.exceptions.RequestException as e:
#         logger.error(f"Error sending log to backend: {e}")
#         return False

# # ---------------- FRAME PROCESSING ----------------
# def process_frame(frame):
#     output_frame = frame.copy()

#     results = model(frame)
#     df = results.pandas().xyxy[0]

#     for _, row in df.iterrows():
#         x1, y1, x2, y2 = int(row['xmin']), int(row['ymin']), int(row['xmax']), int(row['ymax'])
#         conf = float(row['confidence'])

#         crop = frame[y1:y2, x1:x2]
#         if crop.size == 0:
#             continue

#         gray = cv2.cvtColor(crop, cv2.COLOR_BGR2GRAY)
#         h, w = gray.shape
#         new_w = 400
#         new_h = max(20, int(h * new_w / max(1, w)))
#         gray = cv2.resize(gray, (new_w, new_h))
#         _, th = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

#         cfg = r'--psm 6 -c tessedit_char_whitelist=ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
#         text = pytesseract.image_to_string(th, config=cfg)
#         text = clean_text(text)

#         if is_valid_plate(text):
#             vehicle_info = is_vehicle_allowed(text)
#             status = "ALLOWED" if vehicle_info.isAllowed else "NOT_ALLOWED"

#             log_data = VehicleLogCreate(
#                 licensePlate=text,
#                 status=status,
#                 confidence=conf
#             )
#             logger.info(f"Logging detection: {log_data.dict()}")  # Debug print
#             add_vehicle_log(log_data)

#             color = (0, 255, 0) if vehicle_info.isAllowed else (0, 0, 255)
#         else:
#             color = (0, 0, 255)

#         cv2.rectangle(output_frame, (x1, y1), (x2, y2), color, 2)
#         cv2.putText(output_frame, f"{text} {conf:.2f}", (x1, max(10, y1-10)),
#                     cv2.FONT_HERSHEY_SIMPLEX, 0.8, color, 2)

#     return output_frame

# # ---------------- CAMERA THREAD ----------------
# def video_capture_worker():
#     global global_frame
#     cap = None

#     for source in [0, 1, 2]:
#         cap = cv2.VideoCapture(source)
#         if cap.isOpened():
#             logger.info(f"Camera opened successfully on source {source}")
#             cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
#             cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
#             break

#     if not cap or not cap.isOpened():
#         logger.error("No camera available.")
#         return

#     logger.info("Video capture worker started.")
#     frame_counter = 0
#     process_every_n_frames = 1

#     try:
#         while not stop_signal.is_set():
#             ret, frame = cap.read()
#             if not ret:
#                 time.sleep(0.1)
#                 continue

#             frame_counter += 1
#             if frame_counter % process_every_n_frames == 0:
#                 processed_frame = process_frame(frame)
#             else:
#                 processed_frame = frame

#             ret, jpeg = cv2.imencode('.jpg', processed_frame, [cv2.IMWRITE_JPEG_QUALITY, 80])
#             if ret:
#                 with camera_lock:
#                     global_frame = jpeg.tobytes()
#     finally:
#         cap.release()
#         logger.info("Video capture worker stopped.")

# def generate_mjpeg_stream():
#     while not stop_signal.is_set():
#         with camera_lock:
#             frame_data = global_frame
#         if frame_data is None:
#             placeholder = np.zeros((480, 640, 3), dtype=np.uint8)
#             cv2.putText(placeholder, "No camera feed", (50, 240),
#                         cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
#             ret, jpeg = cv2.imencode('.jpg', placeholder)
#             frame_data = jpeg.tobytes() if ret else None
#         if frame_data:
#             yield (b'--frame\r\n'
#                    b'Content-Type: image/jpeg\r\n\r\n' + frame_data + b'\r\n\r\n')
#         time.sleep(0.033)

# # ---------------- ROUTES ----------------
# @app.on_event("startup")
# async def startup_event():
#     logger.info("Starting service...")
#     video_thread = threading.Thread(target=video_capture_worker, daemon=True)
#     video_thread.start()
#     time.sleep(2)

# @app.on_event("shutdown")
# async def shutdown_event():
#     logger.info("Shutting down...")
#     stop_signal.set()

# @app.get("/")
# async def root():
#     return {"message": "YOLO + Tesseract LPR Service is running"}

# @app.get("/video_feed")
# async def video_feed():
#     return StreamingResponse(
#         generate_mjpeg_stream(),
#         media_type="multipart/x-mixed-replace; boundary=frame"
#     )

# @app.get("/api/health")
# async def health_check():
#     with camera_lock:
#         camera_status = "healthy" if global_frame is not None else "camera_not_ready"
#     backend_status = "online"
#     try:
#         response = requests.get(f"{NODE_BACKEND_URL}/api/health", timeout=2)
#         if response.status_code != 200:
#             backend_status = "unreachable"
#     except:
#         backend_status = "offline"
#     return {"status": camera_status, "backend": backend_status, "timestamp": time.time()}

# if __name__ == "__main__":
#     import uvicorn
#     uvicorn.run(app, host="0.0.0.0", port=8001, log_level="info")
import cv2
import pytesseract
import torch
import requests
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from contextlib import asynccontextmanager

import threading
import time
import logging
import re
import os
import numpy as np
from datetime import datetime
from pydantic import BaseModel

# ---------------- CONFIG ----------------
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("LPR")

NODE_BACKEND_URL = os.getenv("NODE_BACKEND_URL", "http://localhost:8000")
WEIGHTS = os.getenv("WEIGHTS_PATH", "best.pt")
CONF_THRESHOLD = float(os.getenv("CONF_THRESHOLD", "0.25"))

# Tesseract: auto-detect path (Windows vs Linux)
_win_tess = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
if os.path.exists(_win_tess):
    pytesseract.pytesseract.tesseract_cmd = _win_tess

# ---------------- MODEL (lazy load) ----------------
_model = None
_model_lock = threading.Lock()

def get_model():
    global _model
    if _model is None:
        with _model_lock:
            if _model is None:
                logger.info("Loading YOLOv5 model...")
                _model = torch.hub.load(
                    "ultralytics/yolov5", "custom",
                    path=WEIGHTS, force_reload=False
                )
                _model.conf = CONF_THRESHOLD
                _model.iou = 0.45
                _model.to("cpu")
                logger.info("Model loaded.")
    return _model

# ---------------- GLOBAL CAMERA STATE ----------------
global_frame = None
camera_lock = threading.Lock()
camera_thread: threading.Thread = None
stop_signal = threading.Event()

# Deduplicate: don't log the same plate more than once per N seconds
_last_logged: dict[str, float] = {}
DEDUPE_SECONDS = 10

# ---------------- PYDANTIC MODELS ----------------
class VehicleCheckResponse(BaseModel):
    isAllowed: bool
    flatNumber: str = "N/A"
    ownerName: str = "N/A"

class VehicleLogCreate(BaseModel):
    licensePlate: str
    status: str
    confidence: float

# ---------------- HELPERS ----------------
def clean_text(t: str) -> str:
    return re.sub(r"[^A-Z0-9]", "", t.upper())

def is_valid_plate(t: str) -> bool:
    return len(t) >= 6 and any(c.isalpha() for c in t) and any(c.isdigit() for c in t)

def is_vehicle_allowed(license_plate: str) -> VehicleCheckResponse:
    try:
        r = requests.get(
            f"{NODE_BACKEND_URL}/api/vehicles/check",
            params={"plate": license_plate},
            timeout=5,
        )
        if r.status_code == 200:
            return VehicleCheckResponse(**r.json())
    except requests.exceptions.RequestException as e:
        logger.error(f"Backend check failed: {e}")
    return VehicleCheckResponse(isAllowed=False)

def add_vehicle_log(log: VehicleLogCreate) -> bool:
    try:
        r = requests.post(
            f"{NODE_BACKEND_URL}/api/vehicles/logs",
            json=log.dict(),
            timeout=3,
        )
        return r.status_code == 201
    except requests.exceptions.RequestException as e:
        logger.error(f"Log post failed: {e}")
        return False

def should_log_plate(plate: str) -> bool:
    now = time.time()
    last = _last_logged.get(plate, 0)
    if now - last >= DEDUPE_SECONDS:
        _last_logged[plate] = now
        return True
    return False

# ---------------- FRAME PROCESSING ----------------
def process_frame(frame: np.ndarray) -> np.ndarray:
    output = frame.copy()
    results = get_model()(frame)
    df = results.pandas().xyxy[0]

    for _, row in df.iterrows():
        x1, y1, x2, y2 = int(row["xmin"]), int(row["ymin"]), int(row["xmax"]), int(row["ymax"])
        conf = float(row["confidence"])

        crop = frame[y1:y2, x1:x2]
        if crop.size == 0:
            continue

        gray = cv2.cvtColor(crop, cv2.COLOR_BGR2GRAY)
        h, w = gray.shape
        new_w = 400
        new_h = max(20, int(h * new_w / max(1, w)))
        gray = cv2.resize(gray, (new_w, new_h))
        _, th = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

        cfg = r"--psm 6 -c tessedit_char_whitelist=ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
        text = clean_text(pytesseract.image_to_string(th, config=cfg))

        if is_valid_plate(text):
            if should_log_plate(text):
                vehicle_info = is_vehicle_allowed(text)
                status = "ALLOWED" if vehicle_info.isAllowed else "NOT_ALLOWED"
                add_vehicle_log(VehicleLogCreate(licensePlate=text, status=status, confidence=conf))
                logger.info(f"Logged: {text} → {status} ({conf:.2f})")
            color = (0, 255, 0)
        else:
            color = (0, 0, 255)

        cv2.rectangle(output, (x1, y1), (x2, y2), color, 2)
        cv2.putText(output, f"{text} {conf:.2f}", (x1, max(10, y1 - 10)),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.8, color, 2)

    return output

# ---------------- CAMERA THREAD ----------------
def video_capture_worker():
    global global_frame
    cap = None

    for source in [0, 1, 2]:
        cap = cv2.VideoCapture(source)
        if cap.isOpened():
            cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
            cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
            logger.info(f"Camera opened on source {source}")
            break

    if not cap or not cap.isOpened():
        logger.error("No camera available.")
        return

    # Process every Nth frame to reduce CPU load
    PROCESS_EVERY = 5
    frame_counter = 0

    try:
        while not stop_signal.is_set():
            ret, frame = cap.read()
            if not ret:
                time.sleep(0.1)
                continue

            frame_counter += 1
            processed = process_frame(frame) if frame_counter % PROCESS_EVERY == 0 else frame

            ret2, jpeg = cv2.imencode(".jpg", processed, [cv2.IMWRITE_JPEG_QUALITY, 80])
            if ret2:
                with camera_lock:
                    global_frame = jpeg.tobytes()
    finally:
        cap.release()
        with camera_lock:
            global_frame = None
        logger.info("Camera stopped.")

def start_camera():
    global camera_thread
    if camera_thread and camera_thread.is_alive():
        return False  # already running
    stop_signal.clear()
    camera_thread = threading.Thread(target=video_capture_worker, daemon=True)
    camera_thread.start()
    return True

def stop_camera():
    stop_signal.set()
    if camera_thread:
        camera_thread.join(timeout=5)
    return True

# ---------------- MJPEG STREAM ----------------
def generate_mjpeg_stream():
    while not stop_signal.is_set():
        with camera_lock:
            frame_data = global_frame

        if frame_data is None:
            placeholder = np.zeros((480, 640, 3), dtype=np.uint8)
            cv2.putText(placeholder, "Camera not active", (120, 240),
                        cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
            ret, jpeg = cv2.imencode(".jpg", placeholder)
            frame_data = jpeg.tobytes() if ret else None

        if frame_data:
            yield (b"--frame\r\nContent-Type: image/jpeg\r\n\r\n" + frame_data + b"\r\n\r\n")
        time.sleep(0.033)  # ~30 fps cap

# ---------------- LIFESPAN ----------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Service starting — warming up model...")
    get_model()   # keep this (model load is fine)
    
    yield

    logger.info("Service shutting down...")
    stop_camera()

# ---------------- APP ----------------
app = FastAPI(title="UrbanNest ANPR Service", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- ROUTES ----------------
@app.get("/")
async def root():
    return {"message": "UrbanNest ANPR Service is running"}

@app.get("/video_feed")
async def video_feed():
    return StreamingResponse(
        generate_mjpeg_stream(),
        media_type="multipart/x-mixed-replace; boundary=frame",
    )

@app.post("/api/camera/start")
async def camera_start():
    started = start_camera()
    return {"success": True, "message": "Camera started" if started else "Camera already running"}

@app.post("/api/camera/stop")
async def camera_stop():
    stop_camera()
    return {"success": True, "message": "Camera stopped"}

@app.get("/api/camera/status")
async def camera_status():
    with camera_lock:
        active = global_frame is not None and not stop_signal.is_set()
    return {"active": active}

@app.get("/api/health")
async def health_check():
    with camera_lock:
        cam_status = "healthy" if global_frame is not None else "camera_not_ready"

    backend_status = "online"
    try:
        r = requests.get(f"{NODE_BACKEND_URL}/api/health", timeout=2)
        if r.status_code != 200:
            backend_status = "unreachable"
    except Exception:
        backend_status = "offline"

    return {"status": cam_status, "backend": backend_status, "timestamp": time.time()}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001, log_level="info")