import os
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi import HTTPException

from .config import STATIC_DIR, BASE_DIR
from .database import init_db
from .routers import auth, patients, assessments, analytics, model_info

app = FastAPI(
    title="DFU-AI Medical Decision-Support API",
    description="Enterprise Clinical Decision-Support Backend for Diabetic Foot Ulcer Assessment, Wagner Grade 1-4 AI Inference, and Grad-CAM Explainability.",
    version="1.0.0"
)

# Enable CORS for frontend applications
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins in development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static folder for uploaded clinical photos and generated Grad-CAM heatmaps
app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")

# Include feature routers
app.include_router(auth.router)
app.include_router(patients.router)
app.include_router(assessments.router)
app.include_router(analytics.router)
app.include_router(model_info.router)

# Mount frontend production build assets if available
DIST_DIR = BASE_DIR.parent / "frontend" / "dist"
if (DIST_DIR / "assets").exists():
    app.mount("/assets", StaticFiles(directory=str(DIST_DIR / "assets")), name="assets")

@app.on_event("startup")
def on_startup():
    """Initialize DB tables and default seed data on startup."""
    init_db()

@app.get("/api/health")
def health_check():
    return {
        "system": "DFU-AI Clinical Decision-Support System",
        "status": "online",
        "api_docs": "/docs",
        "wagner_grades": ["Grade 1 (Superficial)", "Grade 2 (Deep/Tendon)", "Grade 3 (Osteitis/Abscess)", "Grade 4 (Gangrene)"],
        "model_engine": "TensorFlow Colab Ready + Saliency Grad-CAM Adapter"
    }

@app.get("/{full_path:path}")
async def serve_spa_frontend(full_path: str):
    # Do not intercept API, static, docs, or openapi routes
    if full_path.startswith("api") or full_path.startswith("static") or full_path.startswith("docs") or full_path == "openapi.json":
        raise HTTPException(status_code=404, detail="Not Found")
    
    file_path = DIST_DIR / full_path
    if file_path.is_file():
        # If it's a static asset, return it with appropriate headers
        headers = {"Cache-Control": "no-cache, no-store, must-revalidate"}
        return FileResponse(file_path, headers=headers)
    
    index_file = DIST_DIR / "index.html"
    if index_file.exists():
        headers = {
            "Cache-Control": "no-cache, no-store, must-revalidate, max-age=0",
            "Pragma": "no-cache",
            "Expires": "0"
        }
        return FileResponse(index_file, headers=headers)
    
    return {
        "system": "DFU-AI Clinical Decision-Support System",
        "status": "online",
        "api_docs": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
