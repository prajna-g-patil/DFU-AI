import os
from pathlib import Path

# Base directories
BASE_DIR = Path(__file__).resolve().parent
STATIC_DIR = BASE_DIR / "static"
UPLOADS_DIR = STATIC_DIR / "uploads"
GRADCAM_DIR = STATIC_DIR / "gradcam"
SAMPLES_DIR = STATIC_DIR / "samples"
WEIGHTS_DIR = BASE_DIR / "ai_engine" / "weights"

# Ensure essential directories exist
for directory in [STATIC_DIR, UPLOADS_DIR, GRADCAM_DIR, SAMPLES_DIR, WEIGHTS_DIR]:
    directory.mkdir(parents=True, exist_ok=True)

# Database
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR / 'dfu_medical.db'}")

# Security & Authentication
SECRET_KEY = os.getenv("SECRET_KEY", "dfu_ai_clinical_secure_jwt_secret_key_2026_x893jf938210")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

# AI Model Configuration
MODEL_WEIGHTS_FILE = os.getenv("MODEL_WEIGHTS_FILE", str(WEIGHTS_DIR / "dfu_wagner_classifier.keras"))
IMAGE_INPUT_SIZE = (224, 224)

# Grade labels & descriptions
WAGNER_GRADES = {
    1: {
        "title": "Grade 1: Superficial Ulcer",
        "description": "Partial or full thickness skin involvement not extending to subcutaneous tissue or deep structures.",
        "risk_severity": "Low to Moderate",
        "badge_color": "emerald"
    },
    2: {
        "title": "Grade 2: Deep Ulcer (Tendon/Capsule)",
        "description": "Deep ulcer penetrating to tendon, bone, or joint capsule without abscess or osteomyelitis.",
        "risk_severity": "Moderate to High",
        "badge_color": "amber"
    },
    3: {
        "title": "Grade 3: Deep Ulcer with Osteitis / Abscess",
        "description": "Deep ulcer complicated by osteomyelitis, deep abscess, or tendonitis. High risk of systemic infection.",
        "risk_severity": "High / Severe",
        "badge_color": "orange"
    },
    4: {
        "title": "Grade 4: Localized Gangrene / Necrosis",
        "description": "Gangrene or necrotic tissue localized to digits, forefoot, or heel. Immediate vascular and surgical intervention required.",
        "risk_severity": "Critical / Emergency",
        "badge_color": "rose"
    }
}
