import os
import io
import base64

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

import pytesseract
from PIL import Image

# Configuración de Tesseract
# Solo establecer la ruta en Windows
if os.name == "nt":
     pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

app = FastAPI(
    title="Alerta Digital - Microservicio IA OCR",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ImagePayload(BaseModel):
    image_base64: str

@app.get("/")
def root():
    return {
        "status": "Online",
        "service": "OCR Engine",
        "engine": "Tesseract OCR"
    }

@app.get("/health")
def health():
    return {
        "status": "healthy"
    }

@app.post("/api/ia/ocr")
def extract_text(payload: ImagePayload):
    try:

        # Elimina el prefijo data:image/...;base64,
        image_data = payload.image_base64

        if "," in image_data:
            image_data = image_data.split(",")[1]

        # Decodifica Base64
        decoded = base64.b64decode(image_data)

        # Abre la imagen
        image = Image.open(io.BytesIO(decoded))

        # OCR
        text = pytesseract.image_to_string(
            image,
            lang="spa"
        )

        return {
            "success": True,
            "text": text.strip()
        }

    except Exception as e:

        return {
            "success": False,
            "error": str(e)
        }