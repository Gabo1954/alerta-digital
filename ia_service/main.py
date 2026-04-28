from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pytesseract
from PIL import Image
import io
import base64

pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

app = FastAPI(title="Alerta Digital - Microservicio IA OCR")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class ImagePayload(BaseModel):
    image_base64: str

@app.get("/")
def read_root():
    return {"status": "Online", "microservice": "OCR Engine Activo", "port": 8000}

@app.post("/api/ia/ocr")
def extract_text(payload: ImagePayload):
    try:
        # 1. Limpiamos y decodificamos la imagen en Base64
        encoded_data = payload.image_base64.split(',')[1] if ',' in payload.image_base64 else payload.image_base64
        decoded_data = base64.b64decode(encoded_data)
        
        # 2. Abrimos la imagen en memoria
        image = Image.open(io.BytesIO(decoded_data))
        
        # 3. Magia OCR: Extraemos el texto usando el idioma Español ('spa')
        text = pytesseract.image_to_string(image, lang='spa')
        
        return {"success": True, "text": text}
    except Exception as e:
        print(f"Error en extracción OCR: {str(e)}") # Esto mostrará el error real en tu consola de Python si falla
        return {"success": False, "error": str(e)}