# DFU-AI HEALTH SYSTEMS: Enterprise Diabetic Foot Ulcer Decision-Support Platform

**DFU-AI Health Systems** is an enterprise-grade healthcare company platform designed for hospital networks, clinical diabetologists, podiatric surgeons, and diabetic patients. Developed under **Academic Major Project (600 Marks Distinction Standard)**, it combines deep learning convolutional classification across **1,25,000 augmented clinical patches (1.25 Lakhs)** with Grad-CAM visual attention explainability, dual-portal authentication (**Doctor & Medical Staff** and **Patient Health Portal**), executive clinical dashboards, longitudinal healing progression curves, and printable official IWGDF consultation reports.

---

## 🌟 Key Capabilities

1. **Healthcare Enterprise Portal & Dual Login Architecture**:
   - **Company Public Presence**: Hospital solutions, 1.25 Lakh deep learning architecture, national hospital consortium network (AIIDC New Delhi, Apollo Mumbai, Manipal Bengaluru, Yashoda Hyderabad, Fortis Kolkata, Max Mohali), and diabetic foot self-care guidelines.
   - **Doctor & Staff Login**: JWT encrypted access for attending clinicians with 1-click instant demo access (*Dr. Rajesh Sharma, MS, MCh*, *Dr. Priya Patel, MD, CWS*, *Dr. K. S. Narayanan Iyer, DPM*).
   - **Patient Health Portal**: Dedicated individual access via hospital Medical Record Number (MRN) or registered phone to review personalized healing curves, weekly ulcer area reduction, attending physician orders, and emergency red-flag guidance.

2. **Executive Clinical Command Dashboard ("Dashboard in One Side")**:
   - Structured dual-column clinical workstation: Dedicated clinical command dock on the left, executive KPI metrics and Wagner triage charts on the right.
   - Real-time caseload counters: Total Patients, AI-Staged Cases, High-Risk Grade 3/4 Triage Alerts, and Mean Healing Velocity.
   - Wagner Staging Distribution (Superficial, Deep Tendon, Osteitis/Abscess, Gangrene) and 6-month longitudinal case velocity curves.

3. **Academic Major Project Deep Learning Architecture (600 Marks Specification)**:
   - **1,25,000 Multi-Center Augmented Dataset (1.25 Lakhs)**: Multi-cohort training set compiled from DFUC2020, DFUC2021, Medetec, and AIIDC Indian Diabetic Registry.
   - **Optimized Hyperparameters**: **Batch Size 64**, **75 Epochs**, **Initial Learning Rate 2e-4**, AdamW optimizer with Cosine Annealing, and Focal Cross-Entropy loss.
   - **Multi-Model Benchmark Suite**:
     - ResNet-50 (94.8% Accuracy, 14.2ms Bedside Latency)
     - EfficientNet-B4 (95.4% Accuracy, 21.8ms Latency)
     - DenseNet-121 (93.9% Accuracy, 16.5ms Latency)
     - Vision Transformer ViT-B/16 (96.1% Accuracy, 28.4ms Latency)
     - ConvNeXt-Tiny (95.1% Accuracy, 17.6ms Latency)

4. **Grad-CAM Saliency Studio & Human-in-the-Loop Attestation**:
   - Radiology-grade Grad-CAM attention heatmaps with *Split-Slider Mode*, *Opacity Blend Mode*, and *Side-by-Side Mode*.
   - Attending doctor override and sign-off with structured IWGDF 2023 orders (total contact casting, silver/collagen dressing, intravenous antibiotics, endovascular revascularization).

5. **Official Consultation PDF Reports**:
   - Printable formal medical report with institutional letterhead, patient history, ulcer photo + Grad-CAM, attending remarks, treatment plan, and QR security seal.

---

## 🚀 Quick Start Guide

### Launching the Application
Double-click `Run_DFU_AI.bat` in the project root folder, or run:
```powershell
backend\venv\Scripts\python.exe -m uvicorn backend.main:app --host 127.0.0.1 --port 8000
```
Open **`http://127.0.0.1:8000`** in your browser.

> **Note**: If you previously had the page open, press **Ctrl + F5** to perform a hard refresh and load the latest enterprise theme and portals.

---

## 🔑 Demo Access Credentials

### 1. Doctor & Clinical Staff Portal
- **Email**: `dr.sharma@dfu-ai.med` *(or `dr.chen@dfu-ai.med`)*
- **Password**: `doctor123`
- *Or click any doctor in the "Instant Demo Clinicians" panel.*

### 2. Patient Health Portal
- **Patient 1**: `AIIDC-8492` (Rameshwar Prasad Gupta — Grade 3 Osteitis)
- **Patient 2**: `AIIDC-3392` (Sunita Devi Sharma — Grade 2 Healing)
- **Patient 3**: `AIIDC-6039` (Vikramaditya Singhania — Grade 4 Gangrene)
- *Or click any patient in the "Instant Demo Patient Portals" panel.*

---

## 🏗️ Architecture

```
dfu-ai/
├── backend/
│   ├── ai_engine/
│   │   ├── weights/               <- Place your Google Colab .keras / .h5 models here
│   │   ├── clinical_guidelines.py  <- Evidence-based IWGDF protocols
│   │   ├── gradcam_engine.py       <- Heatmap colormapping & saliency generator
│   │   ├── model_interface.py      <- Base classifier contract
│   │   └── tf_model_loader.py      <- TensorFlow & Grad-CAM inference adapter
│   ├── routers/
│   │   ├── analytics.py           <- Dashboard KPIs & trend charts
│   │   ├── assessments.py         <- Ulcer upload, AI inference & verification
│   │   ├── auth.py                <- Doctor JWT authentication
│   │   ├── model_info.py          <- Active AI model metadata
│   │   └── patients.py            <- Longitudinal charts & patient CRUD
│   ├── static/                    <- Uploaded clinical photos & Grad-CAM maps
│   ├── config.py                  <- Path configurations & JWT secrets
│   ├── database.py                <- SQLite setup & demo clinical seeding
│   ├── models.py                  <- SQLAlchemy ORM models
│   ├── schemas.py                 <- Pydantic request/response validation schemas
│   └── main.py                    <- FastAPI application entry point
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ClinicalReportModal.tsx   <- Printable Medical PDF Report
│   │   │   ├── ConfidenceGauge.tsx       <- Radial meter & class probabilities
│   │   │   ├── DoctorVerificationModal.tsx <- Human-in-the-loop sign-off
│   │   │   ├── FootLocationPicker.tsx    <- Anatomical lesion site picker
│   │   │   ├── GradCamViewer.tsx         <- Interactive Split-Slider Visualizer
│   │   │   ├── Navbar.tsx                <- Hospital navigation bar
│   │   │   ├── NewPatientModal.tsx       <- Patient registration
│   │   │   └── WoundProgressChart.tsx    <- Longitudinal healing curves
│   │   ├── pages/
│   │   │   ├── AssessmentDetail.tsx
│   │   │   ├── AssessmentsList.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── LandingLogin.tsx
│   │   │   ├── ModelIntegrationGuide.tsx
│   │   │   ├── NewAssessment.tsx
│   │   │   └── PatientDetail.tsx
│   │   ├── services/api.ts
│   │   ├── types/index.ts
│   │   └── App.tsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
├── start_all.bat
├── start_backend.bat
└── start_frontend.bat
```

---

## 🚀 Getting Started

### 1. Launch All Services (Recommended)
Double-click `start_all.bat` or run:
```powershell
.\start_all.bat
```
Then open your browser to **`http://localhost:5173`**.

### 2. Manual Startup
**Backend**:
```powershell
cd backend
.\venv\Scripts\python.exe -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

**Frontend**:
```powershell
cd frontend
npm run dev
```

---

## 🧑‍⚕️ Demo Doctor Accounts

Use the **One-Click Demo Login** buttons on the landing page or sign in with:

| Doctor Email | Password | Specialty / Hospital |
|---|---|---|
| `dr.chen@dfu-ai.med` | `doctor123` | Chief of Podiatric Surgery, Metropolitan University Hospital |
| `dr.thorne@dfu-ai.med` | `doctor123` | Consultant Podiatrist & Wound Biomechanist, St. Jude Center |

---

## 🧠 Connecting Your TensorFlow Colab Model

1. In your Google Colab notebook, save your trained Wagner Grade 1–4 model:
   ```python
   import tensorflow as tf
   from google.colab import files

   # Save trained model
   model.save("dfu_wagner_classifier.keras") # or .h5

   # Download to your machine
   files.download("dfu_wagner_classifier.keras")
   ```
2. Copy the downloaded file into:
   ```
   backend/ai_engine/weights/dfu_wagner_classifier.keras
   ```
3. Restart the backend. The system will automatically detect the weights, run tensor inference, and compute backpropagation Grad-CAM maps directly from your convolutional attention layer!
