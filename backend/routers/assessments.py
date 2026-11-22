import os
import uuid
import shutil
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from sqlalchemy import desc

from ..config import UPLOADS_DIR, GRADCAM_DIR, SAMPLES_DIR
from ..database import get_db
from ..models import Assessment, Patient, Doctor, WoundProgressRecord
from ..schemas import AssessmentOut, DoctorVerificationRequest
from ..ai_engine.tf_model_loader import dfu_model_service
from ..ai_engine.clinical_guidelines import get_clinical_recommendations, get_default_treatment_plan
from .auth import get_current_doctor

router = APIRouter(prefix="/api/assessments", tags=["Assessments"])

@router.get("", response_model=List[AssessmentOut])
def list_assessments(
    patient_id: Optional[int] = None,
    grade: Optional[int] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Assessment)
    if patient_id:
        query = query.filter(Assessment.patient_id == patient_id)
    if grade:
        query = query.filter(Assessment.ai_predicted_grade == grade)
    if status and status != "all":
        query = query.filter(Assessment.verification_status == status)

    assessments = query.order_by(desc(Assessment.created_at)).all()
    
    results = []
    for a in assessments:
        results.append({
            "id": a.id,
            "patient_id": a.patient_id,
            "doctor_id": a.doctor_id,
            "created_by_doctor_id": a.created_by_doctor_id,
            "created_by_doctor_name": a.created_by_doctor.full_name if a.created_by_doctor else (a.doctor.full_name if a.doctor else None),
            "verified_by_doctor_id": a.verified_by_doctor_id,
            "verified_by_doctor_name": a.verified_by_doctor.full_name if a.verified_by_doctor else None,
            "original_image_url": a.original_image_url,
            "gradcam_image_url": a.gradcam_image_url,
            "lesion_location": a.lesion_location,
            "affected_foot": a.affected_foot,
            "ulcer_diameter_mm": a.ulcer_diameter_mm,
            "ulcer_depth_mm": a.ulcer_depth_mm,
            "wound_area_cm2": a.wound_area_cm2,
            "exudate_level": a.exudate_level,
            "wound_odor": a.wound_odor,
            "perilesional_erythema": a.perilesional_erythema,
            "pain_score": a.pain_score,
            "granulation_percentage": a.granulation_percentage,
            "slough_percentage": a.slough_percentage,
            "necrotic_percentage": a.necrotic_percentage,
            "peripheral_pulses_palpable": a.peripheral_pulses_palpable,
            "ai_predicted_grade": a.ai_predicted_grade,
            "ai_confidence_score": a.ai_confidence_score,
            "ai_probabilities": a.ai_probabilities,
            "risk_severity": a.risk_severity,
            "ai_rationale": a.ai_rationale,
            "clinical_recommendations": a.clinical_recommendations or [],
            "verification_status": a.verification_status,
            "doctor_verified_grade": a.doctor_verified_grade,
            "doctor_override_reason": a.doctor_override_reason,
            "doctor_clinical_notes": a.doctor_clinical_notes,
            "treatment_plan": a.treatment_plan or {},
            "verified_at": a.verified_at,
            "created_at": a.created_at,
            "patient_name": a.patient.full_name if a.patient else None,
            "patient_mrn": a.patient.mrn if a.patient else None,
            "doctor_name": a.doctor.full_name if a.doctor else None
        })
    return results

@router.post("", response_model=AssessmentOut)
async def create_assessment(
    patient_id: int = Form(...),
    lesion_location: str = Form("Plantar - 1st Metatarsal Head"),
    affected_foot: str = Form("Right"),
    ulcer_diameter_mm: float = Form(18.0),
    ulcer_depth_mm: float = Form(2.5),
    wound_area_cm2: float = Form(3.5),
    exudate_level: str = Form("Moderate / Serosanguinous"),
    wound_odor: bool = Form(False),
    perilesional_erythema: bool = Form(True),
    pain_score: int = Form(2),
    granulation_percentage: int = Form(65),
    slough_percentage: int = Form(25),
    necrotic_percentage: int = Form(10),
    peripheral_pulses_palpable: bool = Form(True),
    sample_key: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    doctor = Depends(get_current_doctor)
):
    # Verify patient exists
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    unique_id = str(uuid.uuid4())[:8]
    raw_img_filename = f"ulcer_{patient.mrn}_{unique_id}.jpg"
    gradcam_filename = f"gradcam_{patient.mrn}_{unique_id}.jpg"
    
    saved_img_path = UPLOADS_DIR / raw_img_filename
    saved_gradcam_path = GRADCAM_DIR / gradcam_filename

    # Save uploaded file OR copy chosen sample image
    if image and image.filename:
        with open(saved_img_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)
    elif sample_key:
        sample_path = SAMPLES_DIR / f"{sample_key}.jpg"
        if not sample_path.exists():
            sample_path = SAMPLES_DIR / "sample_grade2.jpg"
        shutil.copy(sample_path, saved_img_path)
    else:
        # Default fallback sample
        shutil.copy(SAMPLES_DIR / "sample_grade2.jpg", saved_img_path)

    # Prepare clinical context
    clinical_ctx = {
        "ulcer_diameter_mm": ulcer_diameter_mm,
        "ulcer_depth_mm": ulcer_depth_mm,
        "wound_area_cm2": wound_area_cm2,
        "exudate_level": exudate_level,
        "wound_odor": wound_odor,
        "perilesional_erythema": perilesional_erythema,
        "granulation_percentage": granulation_percentage,
        "necrotic_percentage": necrotic_percentage
    }

    # Execute AI Inference and Grad-CAM generation
    ai_result = dfu_model_service.predict_and_explain(
        image_path=str(saved_img_path),
        output_gradcam_path=str(saved_gradcam_path),
        clinical_context=clinical_ctx
    )

    # Clinical guidelines recommendations
    recommendations = get_clinical_recommendations(
        wagner_grade=ai_result.predicted_grade,
        wound_area_cm2=wound_area_cm2,
        has_odor=wound_odor,
        is_erythematous=perilesional_erythema,
        exudate_level=exudate_level
    )

    default_plan = get_default_treatment_plan(ai_result.predicted_grade)

    assessment = Assessment(
        patient_id=patient_id,
        doctor_id=doctor.id if doctor else None,
        created_by_doctor_id=doctor.id if doctor else None,
        verified_by_doctor_id=None,
        original_image_url=f"/static/uploads/{raw_img_filename}",
        gradcam_image_url=f"/static/gradcam/{gradcam_filename}",
        lesion_location=lesion_location,
        affected_foot=affected_foot,
        ulcer_diameter_mm=ulcer_diameter_mm,
        ulcer_depth_mm=ulcer_depth_mm,
        wound_area_cm2=wound_area_cm2,
        exudate_level=exudate_level,
        wound_odor=wound_odor,
        perilesional_erythema=perilesional_erythema,
        pain_score=pain_score,
        granulation_percentage=granulation_percentage,
        slough_percentage=slough_percentage,
        necrotic_percentage=necrotic_percentage,
        peripheral_pulses_palpable=peripheral_pulses_palpable,
        ai_predicted_grade=ai_result.predicted_grade,
        ai_confidence_score=ai_result.confidence_score,
        ai_probabilities=ai_result.probabilities,
        risk_severity=ai_result.risk_severity,
        ai_rationale=ai_result.ai_rationale,
        clinical_recommendations=recommendations,
        verification_status="pending_review",
        treatment_plan=default_plan,
        created_at=datetime.utcnow()
    )

    db.add(assessment)
    db.commit()
    db.refresh(assessment)

    # Also automatically append a wound progress record
    progress = WoundProgressRecord(
        patient_id=patient_id,
        assessment_id=assessment.id,
        visit_date=datetime.utcnow().strftime("%Y-%m-%d"),
        wound_area_cm2=wound_area_cm2,
        granulation_percentage=granulation_percentage,
        exudate_level=exudate_level,
        wagner_grade=ai_result.predicted_grade,
        healing_trajectory="improving",
        notes=f"New clinical assessment: Wagner Grade {ai_result.predicted_grade} ({ai_result.risk_severity})",
        thumbnail_url=f"/static/uploads/{raw_img_filename}"
    )
    db.add(progress)
    db.commit()

    return {
        "id": assessment.id,
        "patient_id": assessment.patient_id,
        "doctor_id": assessment.doctor_id,
        "created_by_doctor_id": assessment.created_by_doctor_id,
        "created_by_doctor_name": doctor.full_name if doctor else None,
        "verified_by_doctor_id": None,
        "verified_by_doctor_name": None,
        "original_image_url": assessment.original_image_url,
        "gradcam_image_url": assessment.gradcam_image_url,
        "lesion_location": assessment.lesion_location,
        "affected_foot": assessment.affected_foot,
        "ulcer_diameter_mm": assessment.ulcer_diameter_mm,
        "ulcer_depth_mm": assessment.ulcer_depth_mm,
        "wound_area_cm2": assessment.wound_area_cm2,
        "exudate_level": assessment.exudate_level,
        "wound_odor": assessment.wound_odor,
        "perilesional_erythema": assessment.perilesional_erythema,
        "pain_score": assessment.pain_score,
        "granulation_percentage": assessment.granulation_percentage,
        "slough_percentage": assessment.slough_percentage,
        "necrotic_percentage": assessment.necrotic_percentage,
        "peripheral_pulses_palpable": assessment.peripheral_pulses_palpable,
        "ai_predicted_grade": assessment.ai_predicted_grade,
        "ai_confidence_score": assessment.ai_confidence_score,
        "ai_probabilities": assessment.ai_probabilities,
        "risk_severity": assessment.risk_severity,
        "ai_rationale": assessment.ai_rationale,
        "clinical_recommendations": assessment.clinical_recommendations or [],
        "verification_status": assessment.verification_status,
        "doctor_verified_grade": assessment.doctor_verified_grade,
        "doctor_override_reason": assessment.doctor_override_reason,
        "doctor_clinical_notes": assessment.doctor_clinical_notes,
        "treatment_plan": assessment.treatment_plan or {},
        "verified_at": assessment.verified_at,
        "created_at": assessment.created_at,
        "patient_name": patient.full_name,
        "patient_mrn": patient.mrn,
        "doctor_name": doctor.full_name if doctor else None
    }

@router.get("/{assessment_id}", response_model=AssessmentOut)
def get_assessment(assessment_id: int, db: Session = Depends(get_db)):
    a = db.query(Assessment).filter(Assessment.id == assessment_id).first()
    if not a:
        raise HTTPException(status_code=404, detail="Assessment not found")

    return {
        "id": a.id,
        "patient_id": a.patient_id,
        "doctor_id": a.doctor_id,
        "created_by_doctor_id": a.created_by_doctor_id,
        "created_by_doctor_name": a.created_by_doctor.full_name if a.created_by_doctor else (a.doctor.full_name if a.doctor else None),
        "verified_by_doctor_id": a.verified_by_doctor_id,
        "verified_by_doctor_name": a.verified_by_doctor.full_name if a.verified_by_doctor else None,
        "original_image_url": a.original_image_url,
        "gradcam_image_url": a.gradcam_image_url,
        "lesion_location": a.lesion_location,
        "affected_foot": a.affected_foot,
        "ulcer_diameter_mm": a.ulcer_diameter_mm,
        "ulcer_depth_mm": a.ulcer_depth_mm,
        "wound_area_cm2": a.wound_area_cm2,
        "exudate_level": a.exudate_level,
        "wound_odor": a.wound_odor,
        "perilesional_erythema": a.perilesional_erythema,
        "pain_score": a.pain_score,
        "granulation_percentage": a.granulation_percentage,
        "slough_percentage": a.slough_percentage,
        "necrotic_percentage": a.necrotic_percentage,
        "peripheral_pulses_palpable": a.peripheral_pulses_palpable,
        "ai_predicted_grade": a.ai_predicted_grade,
        "ai_confidence_score": a.ai_confidence_score,
        "ai_probabilities": a.ai_probabilities,
        "risk_severity": a.risk_severity,
        "ai_rationale": a.ai_rationale,
        "clinical_recommendations": a.clinical_recommendations or [],
        "verification_status": a.verification_status,
        "doctor_verified_grade": a.doctor_verified_grade,
        "doctor_override_reason": a.doctor_override_reason,
        "doctor_clinical_notes": a.doctor_clinical_notes,
        "treatment_plan": a.treatment_plan or {},
        "verified_at": a.verified_at,
        "created_at": a.created_at,
        "patient_name": a.patient.full_name if a.patient else None,
        "patient_mrn": a.patient.mrn if a.patient else None,
        "doctor_name": a.doctor.full_name if a.doctor else None
    }

@router.post("/{assessment_id}/verify", response_model=AssessmentOut)
def verify_assessment(
    assessment_id: int,
    req: DoctorVerificationRequest,
    db: Session = Depends(get_db),
    doctor: Doctor = Depends(get_current_doctor)
):
    a = db.query(Assessment).filter(Assessment.id == assessment_id).first()
    if not a:
        raise HTTPException(status_code=404, detail="Assessment not found")

    a.doctor_id = doctor.id
    a.verified_by_doctor_id = doctor.id
    a.doctor_verified_grade = req.verified_grade
    a.verification_status = "overridden" if req.verified_grade != a.ai_predicted_grade else "verified"
    a.doctor_override_reason = req.override_reason if req.verified_grade != a.ai_predicted_grade else None
    a.doctor_clinical_notes = req.clinical_notes
    a.treatment_plan = req.treatment_plan.dict()
    a.verified_at = datetime.utcnow()

    # Update patient status if Grade 4/3
    if a.patient:
        if req.verified_grade == 4:
            a.patient.status = "Critical (Gangrene/Vascular)"
        elif req.verified_grade == 3:
            a.patient.status = "High Risk Monitoring"
        elif req.verified_grade in [1, 2]:
            a.patient.status = "Active Ulcer / Under Care"

    db.commit()
    db.refresh(a)

    return {
        "id": a.id,
        "patient_id": a.patient_id,
        "doctor_id": a.doctor_id,
        "created_by_doctor_id": a.created_by_doctor_id,
        "created_by_doctor_name": a.created_by_doctor.full_name if a.created_by_doctor else (a.doctor.full_name if a.doctor else None),
        "verified_by_doctor_id": a.verified_by_doctor_id,
        "verified_by_doctor_name": doctor.full_name,
        "original_image_url": a.original_image_url,
        "gradcam_image_url": a.gradcam_image_url,
        "lesion_location": a.lesion_location,
        "affected_foot": a.affected_foot,
        "ulcer_diameter_mm": a.ulcer_diameter_mm,
        "ulcer_depth_mm": a.ulcer_depth_mm,
        "wound_area_cm2": a.wound_area_cm2,
        "exudate_level": a.exudate_level,
        "wound_odor": a.wound_odor,
        "perilesional_erythema": a.perilesional_erythema,
        "pain_score": a.pain_score,
        "granulation_percentage": a.granulation_percentage,
        "slough_percentage": a.slough_percentage,
        "necrotic_percentage": a.necrotic_percentage,
        "peripheral_pulses_palpable": a.peripheral_pulses_palpable,
        "ai_predicted_grade": a.ai_predicted_grade,
        "ai_confidence_score": a.ai_confidence_score,
        "ai_probabilities": a.ai_probabilities,
        "risk_severity": a.risk_severity,
        "ai_rationale": a.ai_rationale,
        "clinical_recommendations": a.clinical_recommendations or [],
        "verification_status": a.verification_status,
        "doctor_verified_grade": a.doctor_verified_grade,
        "doctor_override_reason": a.doctor_override_reason,
        "doctor_clinical_notes": a.doctor_clinical_notes,
        "treatment_plan": a.treatment_plan or {},
        "verified_at": a.verified_at,
        "created_at": a.created_at,
        "patient_name": a.patient.full_name if a.patient else None,
        "patient_mrn": a.patient.mrn if a.patient else None,
        "doctor_name": doctor.full_name
    }

@router.get("/{assessment_id}/report")
def get_assessment_report_data(assessment_id: int, db: Session = Depends(get_db)):
    """Generate structured payload for official printable / downloadable clinical consultation report."""
    a = db.query(Assessment).filter(Assessment.id == assessment_id).first()
    if not a:
        raise HTTPException(status_code=404, detail="Assessment not found")

    p = a.patient
    doc = a.doctor or db.query(Doctor).first()

    return {
        "report_id": f"DFU-RPT-{a.id:05d}",
        "generated_at": datetime.utcnow().strftime("%B %d, %Y - %H:%M UTC"),
        "hospital_header": {
            "name": doc.hospital if doc else "St. Jude Advanced Wound Care Institute",
            "department": "Diabetic Limb Salvage & Comprehensive Wound Care Service",
            "contact": "Tel: +1 (800) 555-DFU-CARE | Email: clinical@dfu-ai.med"
        },
        "patient": {
            "name": p.full_name if p else "Unknown",
            "mrn": p.mrn if p else "N/A",
            "age": p.age if p else "N/A",
            "gender": p.gender if p else "N/A",
            "dob": p.date_of_birth if p else "N/A",
            "diabetes_type": p.diabetes_type if p else "Type 2",
            "hba1c": p.hba1c_current if p else "N/A",
            "neuropathy": "Yes (Loss of protective sensation)" if p and p.neuropathy_diagnosed else "No",
            "abi_score": p.abi_score if p else "N/A"
        },
        "doctor": {
            "name": doc.full_name if doc else "Attending Specialist",
            "specialty": doc.specialty if doc else "Wound Care Specialist",
            "license": doc.license_number if doc else "MD-984210"
        },
        "assessment": {
            "date": a.created_at.strftime("%B %d, %Y"),
            "location": f"{a.affected_foot} Foot - {a.lesion_location}",
            "diameter": f"{a.ulcer_diameter_mm} mm",
            "depth": f"{a.ulcer_depth_mm} mm",
            "wound_area": f"{a.wound_area_cm2} cm²",
            "tissue_breakdown": {
                "granulation": f"{a.granulation_percentage}%",
                "slough": f"{a.slough_percentage}%",
                "necrotic": f"{a.necrotic_percentage}%"
            },
            "exudate": a.exudate_level,
            "pain_score": f"{a.pain_score}/10",
            "pulses": "Palpable" if a.peripheral_pulses_palpable else "Diminished / Absent"
        },
        "ai_findings": {
            "predicted_grade": f"Wagner Grade {a.ai_predicted_grade}",
            "confidence": f"{round(a.ai_confidence_score * 100, 1)}%",
            "risk_level": a.risk_severity,
            "probabilities": a.ai_probabilities,
            "rationale": a.ai_rationale,
            "original_image": a.original_image_url,
            "gradcam_image": a.gradcam_image_url
        },
        "doctor_verification": {
            "status": a.verification_status.replace("_", " ").title(),
            "final_grade": f"Wagner Grade {a.doctor_verified_grade}" if a.doctor_verified_grade else f"Wagner Grade {a.ai_predicted_grade} (Pending Final Sign-off)",
            "clinical_notes": a.doctor_clinical_notes or "Clinical assessment verified. Proceed with indicated offloading and moisture balance protocol.",
            "override_reason": a.doctor_override_reason,
            "signed_at": a.verified_at.strftime("%B %d, %Y %H:%M") if a.verified_at else "Pending Signature"
        },
        "treatment_plan": a.treatment_plan or get_default_treatment_plan(a.ai_predicted_grade),
        "guidelines": a.clinical_recommendations or get_clinical_recommendations(a.ai_predicted_grade)
    }
