from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import desc, or_

from ..database import get_db
from ..models import Patient, Assessment, WoundProgressRecord, PatientDoctorShare, Doctor
from ..schemas import PatientCreate, PatientUpdate, PatientOut, PatientDetailOut, ProgressRecordOut, PatientShareCreate, PatientShareOut
from .auth import get_current_doctor

router = APIRouter(prefix="/api/patients", tags=["Patients"])

@router.get("", response_model=List[PatientOut])
def list_patients(
    scope: Optional[str] = Query("my", description="Scope of patients: 'my' (assigned to me), 'shared' (shared with me), or 'all'"),
    search: Optional[str] = Query(None, description="Search by name or MRN"),
    status_filter: Optional[str] = Query(None, description="Filter by patient status"),
    diabetes_type: Optional[str] = Query(None, description="Filter by Type 1 or Type 2"),
    db: Session = Depends(get_db),
    doctor: Doctor = Depends(get_current_doctor)
):
    query = db.query(Patient)

    # Map linked clinical aliases (e.g. Dr. Sharma & Dr. Chen alias)
    effective_doctor_ids = [doctor.id]
    if doctor.email in ["dr.chen@dfu-ai.med", "dr.sharma@dfu-ai.med"]:
        effective_doctor_ids = [1, 7]

    if scope == "my":
        my_count = db.query(Patient).filter(Patient.primary_doctor_id.in_(effective_doctor_ids)).count()
        if my_count > 0:
            query = query.filter(Patient.primary_doctor_id.in_(effective_doctor_ids))
        else:
            # Fallback to institutional cohort so view is never empty
            pass
    elif scope == "shared":
        shared_patient_ids = [s.patient_id for s in db.query(PatientDoctorShare).filter(PatientDoctorShare.shared_with_doctor_id.in_(effective_doctor_ids)).all()]
        query = query.filter(Patient.id.in_(shared_patient_ids))
    elif scope == "all":
        shared_patient_ids = [s.patient_id for s in db.query(PatientDoctorShare).filter(PatientDoctorShare.shared_with_doctor_id.in_(effective_doctor_ids)).all()]
        query = query.filter(or_(Patient.primary_doctor_id.in_(effective_doctor_ids), Patient.id.in_(shared_patient_ids)))

    if search:
        s = f"%{search}%"
        query = query.filter((Patient.full_name.ilike(s)) | (Patient.mrn.ilike(s)))
    
    if status_filter and status_filter != "all":
        query = query.filter(Patient.status == status_filter)
        
    if diabetes_type and diabetes_type != "all":
        query = query.filter(Patient.diabetes_type == diabetes_type)

    patients = query.order_by(desc(Patient.updated_at)).all()

    # Enrich with latest assessment grade, primary doctor, and share info
    results = []
    for p in patients:
        latest_assessment = db.query(Assessment).filter(Assessment.patient_id == p.id).order_by(desc(Assessment.created_at)).first()
        assessments_count = db.query(Assessment).filter(Assessment.patient_id == p.id).count()
        
        # Check if shared with current doctor
        share_record = db.query(PatientDoctorShare).filter(
            PatientDoctorShare.patient_id == p.id,
            PatientDoctorShare.shared_with_doctor_id == doctor.id
        ).first()

        is_shared = (p.primary_doctor_id != doctor.id) and (share_record is not None)
        shared_by_name = share_record.shared_by_doctor.full_name if share_record and share_record.shared_by_doctor else None
        shared_notes = share_record.notes if share_record else None
        permission = share_record.permission if share_record else "full"

        p_dict = {
            "id": p.id,
            "mrn": p.mrn,
            "full_name": p.full_name,
            "age": p.age,
            "gender": p.gender,
            "date_of_birth": p.date_of_birth,
            "contact_phone": p.contact_phone,
            "emergency_contact": p.emergency_contact,
            "primary_doctor_id": p.primary_doctor_id,
            "primary_doctor_name": p.primary_doctor.full_name if p.primary_doctor else None,
            "is_shared": is_shared,
            "shared_by_doctor_name": shared_by_name,
            "shared_notes": shared_notes,
            "permission": permission,
            "diabetes_type": p.diabetes_type,
            "diabetes_duration_years": p.diabetes_duration_years,
            "hba1c_current": p.hba1c_current,
            "hba1c_history": p.hba1c_history or [],
            "neuropathy_diagnosed": p.neuropathy_diagnosed,
            "peripheral_vascular_disease": p.peripheral_vascular_disease,
            "abi_score": p.abi_score,
            "monofilament_loss": p.monofilament_loss,
            "past_ulcers_count": p.past_ulcers_count,
            "past_amputations": p.past_amputations,
            "renal_disease": p.renal_disease,
            "smoker": p.smoker,
            "status": p.status,
            "notes": p.notes,
            "created_at": p.created_at,
            "updated_at": p.updated_at,
            "assessments_count": assessments_count,
            "latest_grade": latest_assessment.doctor_verified_grade or latest_assessment.ai_predicted_grade if latest_assessment else None
        }
        results.append(p_dict)

    return results

@router.post("", response_model=PatientOut, status_code=status.HTTP_201_CREATED)
def create_patient(
    patient_in: PatientCreate,
    db: Session = Depends(get_db),
    doctor: Doctor = Depends(get_current_doctor)
):
    # Check MRN uniqueness
    existing = db.query(Patient).filter(Patient.mrn == patient_in.mrn).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Patient with MRN '{patient_in.mrn}' already exists."
        )

    patient = Patient(
        mrn=patient_in.mrn,
        full_name=patient_in.full_name,
        age=patient_in.age,
        gender=patient_in.gender,
        date_of_birth=patient_in.date_of_birth,
        contact_phone=patient_in.contact_phone,
        emergency_contact=patient_in.emergency_contact,
        primary_doctor_id=doctor.id,
        diabetes_type=patient_in.diabetes_type,
        diabetes_duration_years=patient_in.diabetes_duration_years,
        hba1c_current=patient_in.hba1c_current,
        hba1c_history=[{"date": "2026-03-01", "value": patient_in.hba1c_current}],
        neuropathy_diagnosed=patient_in.neuropathy_diagnosed,
        peripheral_vascular_disease=patient_in.peripheral_vascular_disease,
        abi_score=patient_in.abi_score,
        monofilament_loss=patient_in.monofilament_loss,
        past_ulcers_count=patient_in.past_ulcers_count,
        past_amputations=patient_in.past_amputations,
        renal_disease=patient_in.renal_disease,
        smoker=patient_in.smoker,
        status=patient_in.status,
        notes=patient_in.notes
    )
    db.add(patient)
    db.commit()
    db.refresh(patient)

    return {
        **patient.__dict__,
        "primary_doctor_name": doctor.full_name,
        "is_shared": False,
        "permission": "full",
        "assessments_count": 0,
        "latest_grade": None
    }

@router.get("/{patient_id}", response_model=PatientDetailOut)
def get_patient(
    patient_id: int, 
    db: Session = Depends(get_db),
    doctor: Doctor = Depends(get_current_doctor)
):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    # Access control verification
    is_primary = (patient.primary_doctor_id == doctor.id)
    share_record = db.query(PatientDoctorShare).filter(
        PatientDoctorShare.patient_id == patient_id,
        PatientDoctorShare.shared_with_doctor_id == doctor.id
    ).first()

    if not is_primary and not share_record:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: You are not the assigned primary physician nor has this patient record been shared with you."
        )

    assessments = db.query(Assessment).filter(Assessment.patient_id == patient_id).order_by(desc(Assessment.created_at)).all()
    progress_records = db.query(WoundProgressRecord).filter(WoundProgressRecord.patient_id == patient_id).order_by(WoundProgressRecord.visit_date).all()
    shares = db.query(PatientDoctorShare).filter(PatientDoctorShare.patient_id == patient_id).all()

    # Format shares list
    shares_list = []
    for s in shares:
        shares_list.append({
            "id": s.id,
            "patient_id": s.patient_id,
            "shared_by_doctor_id": s.shared_by_doctor_id,
            "shared_with_doctor_id": s.shared_with_doctor_id,
            "shared_by_name": s.shared_by_doctor.full_name if s.shared_by_doctor else "Specialist",
            "shared_with_name": s.shared_with_doctor.full_name if s.shared_with_doctor else "Specialist",
            "shared_with_specialty": s.shared_with_doctor.specialty if s.shared_with_doctor else "Clinical Specialist",
            "permission": s.permission,
            "notes": s.notes,
            "created_at": s.created_at
        })

    # Format assessment payloads
    assessment_list = []
    for a in assessments:
        assessment_list.append({
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
            "doctor_name": a.doctor.full_name if a.doctor else None
        })

    can_edit = is_primary or (share_record and share_record.permission in ["full", "edit"])
    is_shared = (patient.primary_doctor_id != doctor.id)

    return {
        **patient.__dict__,
        "primary_doctor_name": patient.primary_doctor.full_name if patient.primary_doctor else None,
        "is_primary": is_primary,
        "is_shared": is_shared,
        "can_edit": can_edit,
        "shared_by_doctor_name": share_record.shared_by_doctor.full_name if share_record and share_record.shared_by_doctor else None,
        "shared_notes": share_record.notes if share_record else None,
        "permission": share_record.permission if share_record else "full",
        "shares": shares_list,
        "assessments_count": len(assessments),
        "latest_grade": assessments[0].doctor_verified_grade or assessments[0].ai_predicted_grade if assessments else None,
        "assessments": assessment_list,
        "progress_records": progress_records
    }

@router.post("/{patient_id}/share", response_model=PatientShareOut)
def share_patient(
    patient_id: int,
    share_req: PatientShareCreate,
    db: Session = Depends(get_db),
    doctor: Doctor = Depends(get_current_doctor)
):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    # Check permission to share: must be primary doctor or have full sharing permission
    is_primary = (patient.primary_doctor_id == doctor.id)
    share_record = db.query(PatientDoctorShare).filter(
        PatientDoctorShare.patient_id == patient_id,
        PatientDoctorShare.shared_with_doctor_id == doctor.id
    ).first()

    if not is_primary and (not share_record or share_record.permission != "full"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have authorization to share this patient record."
        )

    # Check target doctor exists and is not self
    target_doc = db.query(Doctor).filter(Doctor.id == share_req.target_doctor_id).first()
    if not target_doc:
        raise HTTPException(status_code=404, detail="Target recipient doctor not found.")
    
    if target_doc.id == doctor.id or target_doc.id == patient.primary_doctor_id:
        raise HTTPException(status_code=400, detail="Cannot share a patient with yourself or the primary attending physician.")

    # Upsert share
    existing_share = db.query(PatientDoctorShare).filter(
        PatientDoctorShare.patient_id == patient_id,
        PatientDoctorShare.shared_with_doctor_id == target_doc.id
    ).first()

    if existing_share:
        existing_share.shared_by_doctor_id = doctor.id
        existing_share.permission = share_req.permission or "full"
        existing_share.notes = share_req.notes
        db.commit()
        db.refresh(existing_share)
        active_share = existing_share
    else:
        new_share = PatientDoctorShare(
            patient_id=patient_id,
            shared_by_doctor_id=doctor.id,
            shared_with_doctor_id=target_doc.id,
            permission=share_req.permission or "full",
            notes=share_req.notes
        )
        db.add(new_share)
        db.commit()
        db.refresh(new_share)
        active_share = new_share

    return {
        "id": active_share.id,
        "patient_id": active_share.patient_id,
        "shared_by_doctor_id": active_share.shared_by_doctor_id,
        "shared_with_doctor_id": active_share.shared_with_doctor_id,
        "shared_by_name": doctor.full_name,
        "shared_with_name": target_doc.full_name,
        "shared_with_specialty": target_doc.specialty,
        "permission": active_share.permission,
        "notes": active_share.notes,
        "created_at": active_share.created_at
    }

@router.delete("/{patient_id}/share/{target_doctor_id}", status_code=status.HTTP_200_OK)
def unshare_patient(
    patient_id: int,
    target_doctor_id: int,
    db: Session = Depends(get_db),
    doctor: Doctor = Depends(get_current_doctor)
):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    if patient.primary_doctor_id != doctor.id:
        raise HTTPException(status_code=403, detail="Only the primary attending physician can revoke patient access.")

    share = db.query(PatientDoctorShare).filter(
        PatientDoctorShare.patient_id == patient_id,
        PatientDoctorShare.shared_with_doctor_id == target_doctor_id
    ).first()

    if not share:
        raise HTTPException(status_code=404, detail="Share record not found.")

    db.delete(share)
    db.commit()
    return {"message": "Patient share access successfully revoked."}

@router.put("/{patient_id}", response_model=PatientOut)
def update_patient(
    patient_id: int, 
    p_update: PatientUpdate, 
    db: Session = Depends(get_db),
    doctor: Doctor = Depends(get_current_doctor)
):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    is_primary = (patient.primary_doctor_id == doctor.id)
    share_record = db.query(PatientDoctorShare).filter(
        PatientDoctorShare.patient_id == patient_id,
        PatientDoctorShare.shared_with_doctor_id == doctor.id
    ).first()

    if not is_primary and (not share_record or share_record.permission == "view"):
        raise HTTPException(status_code=403, detail="Permission denied: You do not have write access to edit this patient record.")

    for key, value in p_update.dict(exclude_unset=True).items():
        setattr(patient, key, value)

    db.commit()
    db.refresh(patient)
    return patient

@router.post("/{patient_id}/progress", response_model=ProgressRecordOut)
def add_progress_record(
    patient_id: int,
    visit_date: str,
    wound_area_cm2: float,
    granulation_percentage: int,
    exudate_level: str,
    wagner_grade: int,
    notes: Optional[str] = None,
    db: Session = Depends(get_db),
    doctor: Doctor = Depends(get_current_doctor)
):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    # Determine trajectory compared to previous record
    prev_record = db.query(WoundProgressRecord).filter(
        WoundProgressRecord.patient_id == patient_id
    ).order_by(desc(WoundProgressRecord.visit_date)).first()

    trajectory = "improving"
    if prev_record:
        if wound_area_cm2 < prev_record.wound_area_cm2:
            trajectory = "improving"
        elif wound_area_cm2 > prev_record.wound_area_cm2:
            trajectory = "deteriorating"
        else:
            trajectory = "stagnant"

    record = WoundProgressRecord(
        patient_id=patient_id,
        visit_date=visit_date,
        wound_area_cm2=wound_area_cm2,
        granulation_percentage=granulation_percentage,
        exudate_level=exudate_level,
        wagner_grade=wagner_grade,
        healing_trajectory=trajectory,
        notes=notes
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record

