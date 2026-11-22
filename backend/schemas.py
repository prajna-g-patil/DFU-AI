from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, EmailStr, Field

# ----------------- DOCTOR & AUTH SCHEMAS -----------------

class DoctorBase(BaseModel):
    email: EmailStr
    full_name: str
    specialty: str = "Podiatric Medicine & Wound Care"
    hospital: str = "St. Jude Academic Medical Center"
    license_number: str = "MD-984210"

class DoctorCreate(DoctorBase):
    password: str

class DoctorLogin(BaseModel):
    email: EmailStr
    password: str

class DoctorOut(DoctorBase):
    id: int
    avatar_url: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class DoctorSummary(BaseModel):
    id: int
    email: str
    full_name: str
    specialty: str
    hospital: str
    avatar_url: Optional[str] = None

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    doctor: DoctorOut

# ----------------- PATIENT SHARING SCHEMAS -----------------

class PatientShareCreate(BaseModel):
    target_doctor_id: int
    notes: Optional[str] = "Clinical referral for specialized diabetic foot ulcer review."
    permission: Optional[str] = "full"  # "full", "view", "edit"

class PatientShareOut(BaseModel):
    id: int
    patient_id: int
    shared_by_doctor_id: int
    shared_with_doctor_id: int
    shared_by_name: Optional[str] = None
    shared_with_name: Optional[str] = None
    shared_with_specialty: Optional[str] = None
    permission: str = "full"
    notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# ----------------- PATIENT SCHEMAS -----------------

class PatientBase(BaseModel):
    mrn: str
    full_name: str
    age: int
    gender: str
    date_of_birth: Optional[str] = None
    contact_phone: Optional[str] = None
    emergency_contact: Optional[str] = None
    primary_doctor_id: Optional[int] = None
    diabetes_type: str = "Type 2"
    diabetes_duration_years: int = 8
    hba1c_current: float = 8.0
    neuropathy_diagnosed: bool = True
    peripheral_vascular_disease: bool = False
    abi_score: float = 0.95
    monofilament_loss: bool = True
    past_ulcers_count: int = 0
    past_amputations: bool = False
    renal_disease: bool = False
    smoker: bool = False
    status: str = "Active Ulcer"
    notes: Optional[str] = None

class PatientCreate(PatientBase):
    pass

class PatientUpdate(BaseModel):
    full_name: Optional[str] = None
    age: Optional[int] = None
    hba1c_current: Optional[float] = None
    status: Optional[str] = None
    neuropathy_diagnosed: Optional[bool] = None
    peripheral_vascular_disease: Optional[bool] = None
    abi_score: Optional[float] = None
    notes: Optional[str] = None

class ProgressRecordOut(BaseModel):
    id: int
    patient_id: int
    assessment_id: Optional[int] = None
    visit_date: str
    wound_area_cm2: float
    granulation_percentage: int
    exudate_level: str
    wagner_grade: int
    healing_trajectory: str
    notes: Optional[str] = None
    thumbnail_url: Optional[str] = None

    class Config:
        from_attributes = True

class PatientOut(PatientBase):
    id: int
    primary_doctor_name: Optional[str] = None
    is_shared: Optional[bool] = False
    shared_by_doctor_name: Optional[str] = None
    shared_notes: Optional[str] = None
    permission: Optional[str] = "full"
    hba1c_history: Optional[List[Dict[str, Any]]] = []
    created_at: datetime
    updated_at: datetime
    assessments_count: Optional[int] = 0
    latest_grade: Optional[int] = None

    class Config:
        from_attributes = True

class PatientDetailOut(PatientOut):
    is_primary: Optional[bool] = True
    can_edit: Optional[bool] = True
    shares: List[PatientShareOut] = []
    assessments: List[Any] = []
    progress_records: List[ProgressRecordOut] = []

# ----------------- ASSESSMENT SCHEMAS -----------------

class TreatmentPlanSchema(BaseModel):
    offloading: Optional[str] = "Removable Cast Walker (RCW) with custom felted foam aperture"
    dressing: Optional[str] = "Hydrofiber with Ionic Silver + non-adherent foam secondary layer"
    debridement: Optional[str] = "Sharp curettage of hyperkeratotic margin"
    antimicrobials: Optional[str] = "Amoxicillin-Clavulanate 875/125mg PO BID x 10 days"
    vascular_referral: Optional[bool] = False
    glycemic_optimization: Optional[str] = "Endocrinology consultation for basal-bolus adjustment"
    follow_up_days: Optional[int] = 7
    additional_notes: Optional[str] = None

class AssessmentCreate(BaseModel):
    patient_id: int
    lesion_location: str = "Plantar - 1st Metatarsal Head"
    affected_foot: str = "Right"
    ulcer_diameter_mm: float = 16.0
    ulcer_depth_mm: float = 2.5
    wound_area_cm2: float = 3.2
    exudate_level: str = "Moderate / Serosanguinous"
    wound_odor: bool = False
    perilesional_erythema: bool = True
    pain_score: int = 2
    granulation_percentage: int = 70
    slough_percentage: int = 20
    necrotic_percentage: int = 10
    peripheral_pulses_palpable: bool = True

class DoctorVerificationRequest(BaseModel):
    verified_grade: int = Field(..., ge=1, le=4)
    status: str = Field("verified", pattern="^(verified|overridden)$")
    override_reason: Optional[str] = None
    clinical_notes: Optional[str] = None
    treatment_plan: TreatmentPlanSchema

class AssessmentOut(BaseModel):
    id: int
    patient_id: int
    doctor_id: Optional[int] = None
    created_by_doctor_id: Optional[int] = None
    created_by_doctor_name: Optional[str] = None
    verified_by_doctor_id: Optional[int] = None
    verified_by_doctor_name: Optional[str] = None
    original_image_url: str
    gradcam_image_url: Optional[str] = None
    lesion_location: str
    affected_foot: str
    ulcer_diameter_mm: float
    ulcer_depth_mm: float
    wound_area_cm2: float
    exudate_level: str
    wound_odor: bool
    perilesional_erythema: bool
    pain_score: int
    granulation_percentage: int
    slough_percentage: int
    necrotic_percentage: int
    peripheral_pulses_palpable: bool
    
    # AI Results
    ai_predicted_grade: int
    ai_confidence_score: float
    ai_probabilities: Dict[str, float]
    risk_severity: str
    ai_rationale: Optional[str] = None
    clinical_recommendations: List[str]
    
    # Verification
    verification_status: str
    doctor_verified_grade: Optional[int] = None
    doctor_override_reason: Optional[str] = None
    doctor_clinical_notes: Optional[str] = None
    treatment_plan: Optional[Dict[str, Any]] = None
    verified_at: Optional[datetime] = None
    created_at: datetime

    patient_name: Optional[str] = None
    patient_mrn: Optional[str] = None
    doctor_name: Optional[str] = None

    class Config:
        from_attributes = True

# ----------------- ANALYTICS & DASHBOARD SCHEMAS -----------------

class DashboardAnalytics(BaseModel):
    total_patients: int
    total_my_patients: Optional[int] = 0
    total_shared_patients: Optional[int] = 0
    total_assessments: int
    high_risk_cases: int
    pending_verifications: int
    avg_healing_rate_percent: float
    grade_distribution: Dict[str, int]
    monthly_trends: List[Dict[str, Any]]
    risk_breakdown: Dict[str, int]
    recent_assessments: List[AssessmentOut]
    recent_patients: List[PatientOut]

# ----------------- MODEL INTEGRATION SCHEMAS -----------------

class ModelStatusInfo(BaseModel):
    is_custom_model_loaded: bool
    model_name: str
    model_path: str
    framework: str
    input_shape: List[int]
    classes: List[str]
    last_layer_name: str
    instructions: str
