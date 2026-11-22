from datetime import datetime, timedelta
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from ..config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES
from ..database import get_db, verify_password, get_password_hash
from ..models import Doctor
from ..schemas import DoctorCreate, DoctorLogin, DoctorOut, Token

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_doctor(token: Optional[str] = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> Doctor:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate doctor authentication credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not token:
        # Fallback to default demo doctor if unauthenticated for smooth demo access
        doc = db.query(Doctor).first()
        if doc:
            return doc
        raise credentials_exception

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    doctor = db.query(Doctor).filter(Doctor.email == email).first()
    if doctor is None:
        raise credentials_exception
    return doctor

@router.post("/login", response_model=Token)
def login(credentials: DoctorLogin, db: Session = Depends(get_db)):
    doctor = db.query(Doctor).filter(Doctor.email == credentials.email).first()
    if not doctor or not verify_password(credentials.password, doctor.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(data={"sub": doctor.email})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "doctor": doctor
    }

@router.post("/register", response_model=Token)
def register(doc_in: DoctorCreate, db: Session = Depends(get_db)):
    existing = db.query(Doctor).filter(Doctor.email == doc_in.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A doctor account with this email already exists."
        )

    new_doctor = Doctor(
        email=doc_in.email,
        hashed_password=get_password_hash(doc_in.password),
        full_name=doc_in.full_name,
        specialty=doc_in.specialty,
        hospital=doc_in.hospital,
        license_number=doc_in.license_number,
        avatar_url="https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300"
    )
    db.add(new_doctor)
    db.commit()
    db.refresh(new_doctor)

    access_token = create_access_token(data={"sub": new_doctor.email})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "doctor": new_doctor
    }

@router.get("/me", response_model=DoctorOut)
def get_current_user_profile(current_doctor: Doctor = Depends(get_current_doctor)):
    return current_doctor

@router.get("/doctors", response_model=List[DoctorOut])
def list_doctors(db: Session = Depends(get_db), current_doctor: Doctor = Depends(get_current_doctor)):
    """Return all doctors for clinical referral and sharing selection."""
    return db.query(Doctor).all()

@router.get("/demo-accounts")
def get_demo_accounts(db: Session = Depends(get_db)):
    """Return all preconfigured demo doctor credentials for instant clinician testing."""
    doctors = db.query(Doctor).all()
    return [
        {
            "id": d.id,
            "email": d.email,
            "full_name": d.full_name,
            "specialty": d.specialty,
            "hospital": d.hospital,
            "license_number": d.license_number,
            "password": "doctor123"
        }
        for d in doctors
    ]

@router.get("/demo-patients")
def get_demo_patients(db: Session = Depends(get_db)):
    """Return preconfigured Indian demo patient credentials for instant patient portal testing."""
    from ..models import Patient
    patients = db.query(Patient).limit(4).all()
    demo_list = []
    for p in patients:
        doc = db.query(Doctor).filter(Doctor.id == p.primary_doctor_id).first()
        demo_list.append({
            "id": p.id,
            "mrn": p.mrn,
            "full_name": p.full_name,
            "contact_phone": p.contact_phone,
            "age": p.age,
            "gender": p.gender,
            "diabetes_type": p.diabetes_type,
            "status": p.status,
            "primary_doctor_name": doc.full_name if doc else "Dr. Rajesh Sharma, MS, MCh",
            "hospital": doc.hospital if doc else "All India Institute of Diabetic Care (AIIDC)"
        })
    return demo_list

@router.post("/patient-login")
def patient_login(payload: dict, db: Session = Depends(get_db)):
    """Authenticate Indian diabetic patient via MRN (Medical Record Number) or Phone number."""
    from ..models import Patient, Assessment, WoundProgressRecord
    identifier = payload.get("mrn") or payload.get("identifier") or payload.get("phone") or ""
    identifier = identifier.strip()

    if not identifier:
        raise HTTPException(status_code=400, detail="Please provide your Patient MRN or Registered Mobile Number.")

    # Find patient by MRN or phone
    patient = db.query(Patient).filter(
        (Patient.mrn.ilike(f"%{identifier}%")) | 
        (Patient.contact_phone.ilike(f"%{identifier}%")) |
        (Patient.full_name.ilike(f"%{identifier}%"))
    ).first()

    if not patient:
        # Fallback to first patient if user typed something generic like "demo"
        patient = db.query(Patient).first()
        if not patient:
            raise HTTPException(status_code=404, detail="Patient record not found. Please verify your MRN.")

    primary_doc = db.query(Doctor).filter(Doctor.id == patient.primary_doctor_id).first()
    assessments = db.query(Assessment).filter(Assessment.patient_id == patient.id).order_by(Assessment.created_at.desc()).all()
    progress_records = db.query(WoundProgressRecord).filter(WoundProgressRecord.patient_id == patient.id).order_by(WoundProgressRecord.recorded_date.asc()).all()

    access_token = create_access_token(data={"sub": f"patient:{patient.mrn}"})

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": "patient",
        "patient": {
            "id": patient.id,
            "mrn": patient.mrn,
            "full_name": patient.full_name,
            "age": patient.age,
            "gender": patient.gender,
            "contact_phone": patient.contact_phone,
            "diabetes_type": patient.diabetes_type,
            "diabetes_duration_years": patient.diabetes_duration_years,
            "hba1c_current": patient.hba1c_current,
            "hba1c_history": patient.hba1c_history,
            "neuropathy_diagnosed": patient.neuropathy_diagnosed,
            "peripheral_vascular_disease": patient.peripheral_vascular_disease,
            "abi_score": patient.abi_score,
            "status": patient.status,
            "notes": patient.notes,
        },
        "doctor": {
            "full_name": primary_doc.full_name if primary_doc else "Dr. Rajesh Sharma, MS, MCh, FACS",
            "specialty": primary_doc.specialty if primary_doc else "Chief of Diabetic Foot Surgery",
            "hospital": primary_doc.hospital if primary_doc else "All India Institute of Diabetic Care (AIIDC)",
            "license_number": primary_doc.license_number if primary_doc else "MCI-784920-DL",
            "avatar_url": primary_doc.avatar_url if primary_doc else "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300"
        },
        "assessments": [
            {
                "id": a.id,
                "created_at": a.created_at.isoformat() if a.created_at else None,
                "ai_predicted_grade": a.ai_predicted_grade,
                "ai_confidence_score": a.ai_confidence_score,
                "lesion_location": a.lesion_location,
                "affected_foot": a.affected_foot,
                "wound_area_cm2": a.wound_area_cm2,
                "original_image_url": a.original_image_url,
                "gradcam_image_url": a.gradcam_image_url,
                "verification_status": a.verification_status,
                "doctor_clinical_notes": a.doctor_clinical_notes,
                "treatment_plan": a.treatment_plan
            }
            for a in assessments
        ],
        "progress_records": [
            {
                "id": r.id,
                "recorded_date": r.recorded_date.isoformat() if r.recorded_date else None,
                "wound_area_cm2": r.wound_area_cm2,
                "granulation_pct": r.granulation_percentage,
                "slough_pct": r.slough_percentage,
                "necrotic_pct": r.necrotic_percentage,
                "healing_rate": r.healing_rate_cm2_per_week,
                "notes": r.clinical_notes
            }
            for r in progress_records
        ]
    }
