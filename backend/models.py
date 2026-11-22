from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, JSON, UniqueConstraint
from sqlalchemy.orm import relationship, declarative_base

Base = declarative_base()

class Doctor(Base):
    __tablename__ = "doctors"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(120), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(100), nullable=False)
    specialty = Column(String(100), default="Podiatric Medicine & Wound Care")
    hospital = Column(String(150), default="St. Jude Academic Medical Center")
    license_number = Column(String(50), default="MD-984210")
    avatar_url = Column(String(255), default="/avatars/doctor-default.png")
    created_at = Column(DateTime, default=datetime.utcnow)

    assessments = relationship("Assessment", foreign_keys="[Assessment.doctor_id]", back_populates="doctor")
    assessments_created = relationship("Assessment", foreign_keys="[Assessment.created_by_doctor_id]", back_populates="created_by_doctor")
    assessments_verified = relationship("Assessment", foreign_keys="[Assessment.verified_by_doctor_id]", back_populates="verified_by_doctor")
    primary_patients = relationship("Patient", foreign_keys="[Patient.primary_doctor_id]", back_populates="primary_doctor")
    shared_patients = relationship("PatientDoctorShare", foreign_keys="[PatientDoctorShare.shared_with_doctor_id]", back_populates="shared_with_doctor")

class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    mrn = Column(String(50), unique=True, index=True, nullable=False)  # Medical Record Number
    full_name = Column(String(100), nullable=False)
    age = Column(Integer, nullable=False)
    gender = Column(String(20), nullable=False)
    date_of_birth = Column(String(20), nullable=True)
    contact_phone = Column(String(30), nullable=True)
    emergency_contact = Column(String(100), nullable=True)
    
    # Primary Doctor Assignment
    primary_doctor_id = Column(Integer, ForeignKey("doctors.id"), nullable=True)

    # Medical profile
    diabetes_type = Column(String(20), default="Type 2")  # Type 1, Type 2, LADA, Gestational
    diabetes_duration_years = Column(Integer, default=10)
    hba1c_current = Column(Float, default=8.2)  # % HbA1c
    hba1c_history = Column(JSON, default=list)  # [{"date": "2026-01-10", "value": 8.5}]
    
    # Complications & risk factors
    neuropathy_diagnosed = Column(Boolean, default=True)
    peripheral_vascular_disease = Column(Boolean, default=False)
    abi_score = Column(Float, default=0.92)  # Ankle-Brachial Index (0.9 - 1.3 normal)
    monofilament_loss = Column(Boolean, default=True)  # 10g Semmes-Weinstein
    past_ulcers_count = Column(Integer, default=1)
    past_amputations = Column(Boolean, default=False)
    renal_disease = Column(Boolean, default=False)
    smoker = Column(Boolean, default=False)
    
    status = Column(String(30), default="Active Ulcer")  # "Active Ulcer", "Healing", "Resolved", "High Risk Monitoring"
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    primary_doctor = relationship("Doctor", foreign_keys=[primary_doctor_id], back_populates="primary_patients")
    shares = relationship("PatientDoctorShare", back_populates="patient", cascade="all, delete-orphan")
    assessments = relationship("Assessment", back_populates="patient", cascade="all, delete-orphan")
    progress_records = relationship("WoundProgressRecord", back_populates="patient", cascade="all, delete-orphan")

class PatientDoctorShare(Base):
    __tablename__ = "patient_doctor_shares"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    shared_by_doctor_id = Column(Integer, ForeignKey("doctors.id"), nullable=False)
    shared_with_doctor_id = Column(Integer, ForeignKey("doctors.id"), nullable=False)
    permission = Column(String(20), default="full")  # "full", "view", "edit"
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        UniqueConstraint('patient_id', 'shared_with_doctor_id', name='uq_patient_shared_with_doctor'),
    )

    patient = relationship("Patient", back_populates="shares")
    shared_by_doctor = relationship("Doctor", foreign_keys=[shared_by_doctor_id])
    shared_with_doctor = relationship("Doctor", foreign_keys=[shared_with_doctor_id], back_populates="shared_patients")

class Assessment(Base):
    __tablename__ = "assessments"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    doctor_id = Column(Integer, ForeignKey("doctors.id"), nullable=True)
    created_by_doctor_id = Column(Integer, ForeignKey("doctors.id"), nullable=True)
    verified_by_doctor_id = Column(Integer, ForeignKey("doctors.id"), nullable=True)
    
    # Image references
    original_image_url = Column(String(255), nullable=False)
    gradcam_image_url = Column(String(255), nullable=True)
    
    # Clinical Lesion Metadata
    lesion_location = Column(String(100), default="Plantar - 1st Metatarsal Head")
    affected_foot = Column(String(20), default="Right")  # Left, Right, Bilateral
    ulcer_diameter_mm = Column(Float, default=18.5)
    ulcer_depth_mm = Column(Float, default=3.2)
    wound_area_cm2 = Column(Float, default=3.8)
    exudate_level = Column(String(50), default="Moderate / Serosanguinous")
    wound_odor = Column(Boolean, default=False)
    perilesional_erythema = Column(Boolean, default=True)
    pain_score = Column(Integer, default=2)  # 0 to 10 scale (often reduced due to neuropathy)
    granulation_percentage = Column(Integer, default=65)  # 0 to 100%
    slough_percentage = Column(Integer, default=25)
    necrotic_percentage = Column(Integer, default=10)
    peripheral_pulses_palpable = Column(Boolean, default=True)

    # AI Model Prediction
    ai_predicted_grade = Column(Integer, nullable=False)  # Wagner Grade 1, 2, 3, 4
    ai_confidence_score = Column(Float, nullable=False)  # 0.0 - 1.0 (e.g. 0.945)
    ai_probabilities = Column(JSON, nullable=False)  # {"Grade 1": 0.05, "Grade 2": 0.91, "Grade 3": 0.03, "Grade 4": 0.01}
    risk_severity = Column(String(50), default="Moderate to High")
    ai_rationale = Column(Text, nullable=True)
    clinical_recommendations = Column(JSON, default=list)  # list of action guidelines

    # Human-in-the-Loop Doctor Verification
    verification_status = Column(String(30), default="pending_review")  # pending_review, verified, overridden
    doctor_verified_grade = Column(Integer, nullable=True)  # Final doctor grade
    doctor_override_reason = Column(String(200), nullable=True)
    doctor_clinical_notes = Column(Text, nullable=True)
    
    # Treatment prescription & protocol
    treatment_plan = Column(JSON, default=dict)
    
    verified_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    patient = relationship("Patient", back_populates="assessments")
    doctor = relationship("Doctor", foreign_keys=[doctor_id], back_populates="assessments")
    created_by_doctor = relationship("Doctor", foreign_keys=[created_by_doctor_id], back_populates="assessments_created")
    verified_by_doctor = relationship("Doctor", foreign_keys=[verified_by_doctor_id], back_populates="assessments_verified")

class WoundProgressRecord(Base):
    __tablename__ = "wound_progress_records"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    assessment_id = Column(Integer, ForeignKey("assessments.id"), nullable=True)
    visit_date = Column(String(30), nullable=False)  # YYYY-MM-DD
    wound_area_cm2 = Column(Float, nullable=False)
    granulation_percentage = Column(Integer, default=50)
    exudate_level = Column(String(50), default="Moderate")
    wagner_grade = Column(Integer, nullable=False)
    healing_trajectory = Column(String(30), default="improving")  # improving, stagnant, deteriorating
    notes = Column(String(255), nullable=True)
    thumbnail_url = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    patient = relationship("Patient", back_populates="progress_records")
