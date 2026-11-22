import os
import shutil
from datetime import datetime, timedelta
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from passlib.context import CryptContext

from .config import DATABASE_URL, UPLOADS_DIR, GRADCAM_DIR, SAMPLES_DIR
from .models import Base, Doctor, Patient, Assessment, WoundProgressRecord, PatientDoctorShare
from .ai_engine.gradcam_engine import generate_clinical_saliency_heatmap
from .ai_engine.clinical_guidelines import get_clinical_recommendations, get_default_treatment_plan

# Password hashing (pbkdf2_sha256 works reliably on all environments)
pwd_context = CryptContext(schemes=["pbkdf2_sha256", "bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """Create tables and seed initial clinical data for Indian doctors and assigned Indian patients."""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Check if Indian patient database is already seeded
        indian_patient = db.query(Patient).filter(Patient.full_name.like("%Gupta%")).first()
        if indian_patient and db.query(Doctor).count() >= 6:
            print("[DFU-AI] Indian Clinical Cohort database already initialized.")
            return

        print("[DFU-AI] Initializing Indian Specialist Doctor accounts and Indian Clinical Cohort records...")

        # Reset cleanly to ensure proper foreign key associations
        db.query(PatientDoctorShare).delete()
        db.query(WoundProgressRecord).delete()
        db.query(Assessment).delete()
        db.query(Patient).delete()
        db.query(Doctor).delete()
        db.commit()

        # 1. Seed 6 Distinguished Indian Clinical Specialists (also aliased for quick demo access)
        doc1 = Doctor(
            email="dr.sharma@dfu-ai.med",
            hashed_password=get_password_hash("doctor123"),
            full_name="Dr. Rajesh Sharma, MS, MCh, FACS",
            specialty="Chief of Diabetic Foot Surgery & Limb Salvage",
            hospital="All India Institute of Diabetic Care (AIIDC), New Delhi",
            license_number="MCI-784920-DL",
            avatar_url="https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300"
        )
        doc2 = Doctor(
            email="dr.patel@dfu-ai.med",
            hashed_password=get_password_hash("doctor123"),
            full_name="Dr. Priya Patel, MD, CWS",
            specialty="Senior Consultant in Diabetology & Advanced Wound Care",
            hospital="Apollo Center for Advanced Diabetic Foot Care, Mumbai",
            license_number="MMC-339201-MH",
            avatar_url="https://images.unsplash.com/photo-1594824813689-42b7d41a4a40?auto=format&fit=crop&q=80&w=300"
        )
        doc3 = Doctor(
            email="dr.iyer@dfu-ai.med",
            hashed_password=get_password_hash("doctor123"),
            full_name="Dr. K. S. Narayanan Iyer, DPM, FACFAS",
            specialty="Podiatric Biomechanist & Reconstructive Foot Surgeon",
            hospital="Manipal Advanced Limb Preservation Center, Bengaluru",
            license_number="KMC-449102-KA",
            avatar_url="https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=300"
        )
        doc4 = Doctor(
            email="dr.reddy@dfu-ai.med",
            hashed_password=get_password_hash("doctor123"),
            full_name="Dr. Venkat Reddy, MS (Ortho), FDFU",
            specialty="Orthopedic Reconstructive Surgeon & Foot Specialist",
            hospital="Yashoda Institute of Advanced Wound Research, Hyderabad",
            license_number="TSMC-610283-TG",
            avatar_url="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300"
        )
        doc5 = Doctor(
            email="dr.mukherjee@dfu-ai.med",
            hashed_password=get_password_hash("doctor123"),
            full_name="Dr. Ananya Mukherjee, MD, DM (Endo)",
            specialty="Chief Clinical Diabetologist & Neuropathy Specialist",
            hospital="Fortis Center for Diabetes & Metabolism, Kolkata",
            license_number="WBMC-551042-WB",
            avatar_url="https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&q=80&w=300"
        )
        doc6 = Doctor(
            email="dr.singh@dfu-ai.med",
            hashed_password=get_password_hash("doctor123"),
            full_name="Dr. Gurpreet Singh, MD, FACC",
            specialty="Endovascular Surgeon & Peripheral Angioplasty Specialist",
            hospital="Max Super Speciality Diabetic Vascular Institute, Mohali",
            license_number="PMC-892015-PB",
            avatar_url="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=300"
        )

        # Also add classic alias accounts for immediate backwards compatibility
        doc_legacy = Doctor(
            email="dr.chen@dfu-ai.med",
            hashed_password=get_password_hash("doctor123"),
            full_name="Dr. Rajesh Sharma, MS, MCh, FACS",
            specialty="Chief of Diabetic Foot Surgery & Limb Salvage",
            hospital="All India Institute of Diabetic Care (AIIDC), New Delhi",
            license_number="MCI-784920-DL",
            avatar_url="https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300"
        )

        db.add_all([doc1, doc2, doc3, doc4, doc5, doc6, doc_legacy])
        db.commit()
        for d in [doc1, doc2, doc3, doc4, doc5, doc6, doc_legacy]:
            db.refresh(d)

        # 2. Seed Indian Patients Assigned to Doctors
        # --- Dr. Rajesh Sharma's Patients ---
        p1 = Patient(
            mrn="AIIDC-2026-8492",
            full_name="Rameshwar Prasad Gupta",
            primary_doctor_id=doc1.id,
            age=64,
            gender="Male",
            date_of_birth="1962-04-12",
            contact_phone="+91 98101 23456",
            emergency_contact="Sunita Gupta (Wife) - +91 98101 23457",
            diabetes_type="Type 2",
            diabetes_duration_years=18,
            hba1c_current=8.8,
            hba1c_history=[
                {"date": "2025-08-10", "value": 9.4},
                {"date": "2025-11-15", "value": 9.0},
                {"date": "2026-02-20", "value": 8.8}
            ],
            neuropathy_diagnosed=True,
            peripheral_vascular_disease=False,
            abi_score=0.92,
            monofilament_loss=True,
            past_ulcers_count=2,
            past_amputations=False,
            status="Active Ulcer",
            notes="Loss of protective sensation in bilateral plantar regions. High focal plantar pressure at 1st metatarsal head. Deep tendon ulceration."
        )

        p2 = Patient(
            mrn="AIIDC-2026-3392",
            full_name="Sunita Devi Sharma",
            primary_doctor_id=doc1.id,
            age=58,
            gender="Female",
            date_of_birth="1968-03-15",
            contact_phone="+91 94140 56789",
            emergency_contact="Mahesh Sharma (Husband) - +91 94140 56790",
            diabetes_type="Type 2",
            diabetes_duration_years=12,
            hba1c_current=7.5,
            hba1c_history=[
                {"date": "2025-10-12", "value": 8.0},
                {"date": "2026-01-20", "value": 7.5}
            ],
            neuropathy_diagnosed=True,
            peripheral_vascular_disease=False,
            abi_score=1.04,
            monofilament_loss=True,
            past_ulcers_count=1,
            past_amputations=False,
            status="Healing",
            notes="Superficial plantar calcaneal erosion. Excellent granulation tissue forming under hydrogel dressings and offloading footwear."
        )

        p3 = Patient(
            mrn="AIIDC-2026-6039",
            full_name="Vikramaditya Singhania",
            primary_doctor_id=doc1.id,
            age=71,
            gender="Male",
            date_of_birth="1955-01-18",
            contact_phone="+91 99350 11223",
            emergency_contact="Aman Singhania (Son) - +91 99350 11224",
            diabetes_type="Type 2",
            diabetes_duration_years=24,
            hba1c_current=10.2,
            hba1c_history=[
                {"date": "2025-06-18", "value": 10.7},
                {"date": "2025-11-04", "value": 10.5},
                {"date": "2026-01-29", "value": 10.2}
            ],
            neuropathy_diagnosed=True,
            peripheral_vascular_disease=True,
            abi_score=0.48,
            monofilament_loss=True,
            past_ulcers_count=3,
            past_amputations=False,
            status="Critical (Gangrene/Vascular)",
            notes="Localized forefoot necrosis and dry gangrenous eschar on hallux with severe critical limb ischemia. Urgent endovascular revascularization planned."
        )

        # --- Dr. Priya Patel's Patients (Apollo Mumbai) ---
        p4 = Patient(
            mrn="APOLLO-MUM-5512",
            full_name="Harish Chandra Verma",
            primary_doctor_id=doc2.id,
            age=61,
            gender="Male",
            date_of_birth="1965-08-20",
            contact_phone="+91 98200 44556",
            emergency_contact="Radhika Verma (Daughter) - +91 98200 44557",
            diabetes_type="Type 2",
            diabetes_duration_years=15,
            hba1c_current=8.7,
            hba1c_history=[
                {"date": "2025-09-14", "value": 9.1},
                {"date": "2026-01-05", "value": 8.7}
            ],
            neuropathy_diagnosed=True,
            peripheral_vascular_disease=True,
            abi_score=0.74,
            monofilament_loss=True,
            past_ulcers_count=2,
            past_amputations=False,
            status="Active Ulcer",
            notes="Moderate plantar midfoot neuropathic ulcer with perilesional hyperkeratosis. Undergoing specialized total contact casting."
        )

        p5 = Patient(
            mrn="APOLLO-MUM-7721",
            full_name="Anita Desai",
            primary_doctor_id=doc2.id,
            age=59,
            gender="Female",
            date_of_birth="1967-11-09",
            contact_phone="+91 98211 78901",
            emergency_contact="Rajesh Desai (Husband) - +91 98211 78902",
            diabetes_type="Type 1",
            diabetes_duration_years=22,
            hba1c_current=9.4,
            hba1c_history=[
                {"date": "2025-07-10", "value": 9.9},
                {"date": "2025-11-28", "value": 9.4}
            ],
            neuropathy_diagnosed=True,
            peripheral_vascular_disease=True,
            abi_score=0.68,
            monofilament_loss=True,
            past_ulcers_count=2,
            past_amputations=False,
            status="High Risk Monitoring",
            notes="Deep ulcer on 5th metatarsal base with purulent slough and suspected cortical erosion on X-ray."
        )

        # --- Dr. K. S. Narayanan Iyer's Patients (Manipal Bengaluru) ---
        p6 = Patient(
            mrn="MANIPAL-BLR-9104",
            full_name="Lakshmi Bai Kulkarni",
            primary_doctor_id=doc3.id,
            age=60,
            gender="Female",
            date_of_birth="1966-09-24",
            contact_phone="+91 98450 33445",
            emergency_contact="Venkatesh Kulkarni (Son) - +91 98450 33446",
            diabetes_type="Type 2",
            diabetes_duration_years=16,
            hba1c_current=8.3,
            hba1c_history=[
                {"date": "2025-09-05", "value": 8.9},
                {"date": "2025-12-12", "value": 8.5},
                {"date": "2026-03-01", "value": 8.3}
            ],
            neuropathy_diagnosed=True,
            peripheral_vascular_disease=False,
            abi_score=0.91,
            monofilament_loss=True,
            past_ulcers_count=2,
            past_amputations=False,
            status="Active Ulcer",
            notes="Wagner Grade 3 plantar fascial abscess with positive probe-to-bone. Surgical debridement scheduled."
        )

        p7 = Patient(
            mrn="MANIPAL-BLR-1829",
            full_name="Meenakshi Sundaram",
            primary_doctor_id=doc3.id,
            age=52,
            gender="Female",
            date_of_birth="1974-02-14",
            contact_phone="+91 98440 12345",
            emergency_contact="S. Sundaram (Husband) - +91 98440 12346",
            diabetes_type="Type 2",
            diabetes_duration_years=10,
            hba1c_current=7.2,
            hba1c_history=[
                {"date": "2025-10-01", "value": 7.7},
                {"date": "2026-02-11", "value": 7.2}
            ],
            neuropathy_diagnosed=True,
            peripheral_vascular_disease=False,
            abi_score=1.02,
            monofilament_loss=True,
            past_ulcers_count=1,
            past_amputations=False,
            status="Healing",
            notes="Superficial plantar erosion on left heel. Healthy pink granulation beds with epithelial migration."
        )

        # --- Dr. Venkat Reddy's Patients (Yashoda Hyderabad) ---
        p8 = Patient(
            mrn="YASHODA-HYD-6401",
            full_name="Arjun Pratap Rao",
            primary_doctor_id=doc4.id,
            age=49,
            gender="Male",
            date_of_birth="1977-06-19",
            contact_phone="+91 98480 99887",
            emergency_contact="Padma Rao (Wife) - +91 98480 99888",
            diabetes_type="Type 1",
            diabetes_duration_years=20,
            hba1c_current=8.1,
            hba1c_history=[
                {"date": "2025-08-20", "value": 8.6},
                {"date": "2026-01-14", "value": 8.1}
            ],
            neuropathy_diagnosed=True,
            peripheral_vascular_disease=False,
            abi_score=0.96,
            monofilament_loss=True,
            past_ulcers_count=1,
            past_amputations=False,
            status="Active Ulcer",
            notes="Superficial neuropathic callus ulcer at plantar hallux. Prescribed rocker-bottom orthotics."
        )

        p9 = Patient(
            mrn="YASHODA-HYD-8823",
            full_name="Devendra Mohan Joshi",
            primary_doctor_id=doc4.id,
            age=69,
            gender="Male",
            date_of_birth="1957-10-30",
            contact_phone="+91 98490 66778",
            emergency_contact="Manoj Joshi (Son) - +91 98490 66779",
            diabetes_type="Type 2",
            diabetes_duration_years=21,
            hba1c_current=9.8,
            hba1c_history=[
                {"date": "2025-09-22", "value": 10.2},
                {"date": "2026-02-05", "value": 9.8}
            ],
            neuropathy_diagnosed=True,
            peripheral_vascular_disease=True,
            abi_score=0.55,
            monofilament_loss=True,
            past_ulcers_count=3,
            past_amputations=False,
            status="Critical (Gangrene/Vascular)",
            notes="Extensive dry necrosis of 2nd toe with ascending cellulitis. Hospitalized for intravenous antibiotics and angiogram."
        )

        # --- Dr. Ananya Mukherjee's Patients (Fortis Kolkata) ---
        p10 = Patient(
            mrn="FORTIS-KOL-4491",
            full_name="Aniruddha Sen",
            primary_doctor_id=doc5.id,
            age=63,
            gender="Male",
            date_of_birth="1963-07-08",
            contact_phone="+91 98300 77112",
            emergency_contact="Sharmila Sen (Wife) - +91 98300 77113",
            diabetes_type="Type 2",
            diabetes_duration_years=17,
            hba1c_current=8.4,
            hba1c_history=[
                {"date": "2025-10-10", "value": 8.9},
                {"date": "2026-01-15", "value": 8.4}
            ],
            neuropathy_diagnosed=True,
            peripheral_vascular_disease=False,
            abi_score=0.95,
            monofilament_loss=True,
            past_ulcers_count=1,
            past_amputations=False,
            status="Active Ulcer",
            notes="Midfoot rocker-bottom Charcot neuroarthropathy ulceration. Strict non-weightbearing protocol."
        )

        p11 = Patient(
            mrn="FORTIS-KOL-9012",
            full_name="Kavita Ranganathan",
            primary_doctor_id=doc5.id,
            age=57,
            gender="Female",
            date_of_birth="1969-04-03",
            contact_phone="+91 98310 44332",
            emergency_contact="R. Ranganathan (Husband) - +91 98310 44333",
            diabetes_type="Type 2",
            diabetes_duration_years=11,
            hba1c_current=7.1,
            hba1c_history=[
                {"date": "2025-11-05", "value": 7.6},
                {"date": "2026-02-18", "value": 7.1}
            ],
            neuropathy_diagnosed=True,
            peripheral_vascular_disease=False,
            abi_score=1.01,
            monofilament_loss=True,
            past_ulcers_count=0,
            past_amputations=False,
            status="Healing",
            notes="First presentation Wagner Grade 1 ulcer healing ahead of projection."
        )

        # --- Dr. Gurpreet Singh's Patients (Max Mohali) ---
        p12 = Patient(
            mrn="MAX-MOH-7210",
            full_name="Balwinder Kaur Dhillon",
            primary_doctor_id=doc6.id,
            age=66,
            gender="Female",
            date_of_birth="1960-11-03",
            contact_phone="+91 98760 11223",
            emergency_contact="Harpreet Dhillon (Son) - +91 98760 11224",
            diabetes_type="Type 2",
            diabetes_duration_years=23,
            hba1c_current=9.2,
            hba1c_history=[
                {"date": "2025-07-22", "value": 9.7},
                {"date": "2025-10-30", "value": 9.4},
                {"date": "2026-02-14", "value": 9.2}
            ],
            neuropathy_diagnosed=True,
            peripheral_vascular_disease=True,
            abi_score=0.62,
            monofilament_loss=True,
            past_ulcers_count=3,
            past_amputations=False,
            status="High Risk Monitoring",
            notes="Deep medial malleolar ulceration with peripheral ischemia. Scheduled for balloon angioplasty."
        )

        p13 = Patient(
            mrn="MAX-MOH-6129",
            full_name="Tariq Ahmed Khan",
            primary_doctor_id=doc6.id,
            age=68,
            gender="Male",
            date_of_birth="1958-09-12",
            contact_phone="+91 98720 88990",
            emergency_contact="Farooq Khan (Brother) - +91 98720 88991",
            diabetes_type="Type 2",
            diabetes_duration_years=19,
            hba1c_current=8.9,
            hba1c_history=[
                {"date": "2025-10-18", "value": 9.3},
                {"date": "2026-01-22", "value": 8.9}
            ],
            neuropathy_diagnosed=True,
            peripheral_vascular_disease=False,
            abi_score=0.89,
            monofilament_loss=True,
            past_ulcers_count=2,
            past_amputations=False,
            status="Active Ulcer",
            notes="Plantar sub-hallux lesion under active advanced offloading therapy."
        )

        all_patients = [p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12, p13]
        db.add_all(all_patients)
        db.commit()
        for p in all_patients:
            db.refresh(p)

        # 3. Setup Seed Images and Assessments
        sample_grade2_src = SAMPLES_DIR / "sample_grade2.jpg"
        sample_grade1_src = SAMPLES_DIR / "sample_grade1.jpg"
        sample_grade3_src = SAMPLES_DIR / "sample_grade3.jpg"
        sample_grade4_src = SAMPLES_DIR / "sample_grade4.jpg"

        def prepare_assessment_images(src_file, base_name, grade):
            dest_img = UPLOADS_DIR / f"{base_name}.jpg"
            dest_cam = GRADCAM_DIR / f"{base_name}_gradcam.jpg"
            if src_file.exists():
                shutil.copy(src_file, dest_img)
                generate_clinical_saliency_heatmap(str(dest_img), grade, str(dest_cam))
            return f"/static/uploads/{base_name}.jpg", f"/static/gradcam/{base_name}_gradcam.jpg"

        img1, cam1 = prepare_assessment_images(sample_grade2_src, "seed_assessment_p1_wagner2", 2)
        img2, cam2 = prepare_assessment_images(sample_grade1_src, "seed_assessment_p2_wagner1", 1)
        img3, cam3 = prepare_assessment_images(sample_grade3_src, "seed_assessment_p3_wagner3", 3)
        img4, cam4 = prepare_assessment_images(sample_grade4_src, "seed_assessment_p4_wagner4", 4)

        # Assessments for Dr. Rajesh Sharma's Patients (p1: Rameshwar Prasad Gupta, p2: Sunita Devi Sharma, p3: Vikramaditya Singhania)
        a1 = Assessment(
            patient_id=p1.id,
            doctor_id=doc1.id,
            created_by_doctor_id=doc1.id,
            verified_by_doctor_id=doc1.id,
            original_image_url=img1,
            gradcam_image_url=cam1,
            lesion_location="Plantar - 1st Metatarsal Head",
            affected_foot="Right",
            ulcer_diameter_mm=18.0,
            ulcer_depth_mm=3.2,
            wound_area_cm2=3.8,
            exudate_level="Moderate / Serosanguinous",
            wound_odor=False,
            perilesional_erythema=True,
            pain_score=2,
            granulation_percentage=65,
            slough_percentage=25,
            necrotic_percentage=10,
            peripheral_pulses_palpable=True,
            ai_predicted_grade=2,
            ai_confidence_score=0.942,
            ai_probabilities={"Grade 1": 0.04, "Grade 2": 0.94, "Grade 3": 0.02, "Grade 4": 0.00},
            risk_severity="Moderate to High",
            ai_rationale="AI identified full-thickness ulcer extending to subcutaneous layer and tendon sheath with hyperkeratotic callous border. Grad-CAM localized max attention to the deep tendon base.",
            clinical_recommendations=get_clinical_recommendations(2, 3.8, False, True, "Moderate"),
            verification_status="verified",
            doctor_verified_grade=2,
            doctor_clinical_notes="Confirmed Wagner Grade 2 neuropathic plantar ulcer. Good capillary refill. Debrided hyperkeratotic rim.",
            treatment_plan=get_default_treatment_plan(2),
            verified_at=datetime.utcnow() - timedelta(days=7),
            created_at=datetime.utcnow() - timedelta(days=7)
        )

        a2 = Assessment(
            patient_id=p2.id,
            doctor_id=doc1.id,
            created_by_doctor_id=doc1.id,
            verified_by_doctor_id=doc1.id,
            original_image_url=img2,
            gradcam_image_url=cam2,
            lesion_location="Plantar Heel - Medial",
            affected_foot="Left",
            ulcer_diameter_mm=10.5,
            ulcer_depth_mm=1.0,
            wound_area_cm2=1.2,
            exudate_level="Low / Serous",
            wound_odor=False,
            perilesional_erythema=False,
            pain_score=1,
            granulation_percentage=85,
            slough_percentage=15,
            necrotic_percentage=0,
            peripheral_pulses_palpable=True,
            ai_predicted_grade=1,
            ai_confidence_score=0.965,
            ai_probabilities={"Grade 1": 0.96, "Grade 2": 0.03, "Grade 3": 0.01, "Grade 4": 0.00},
            risk_severity="Low to Moderate",
            ai_rationale="Superficial epidermal erosion with healthy granulation tissue.",
            clinical_recommendations=get_clinical_recommendations(1, 1.2, False, False, "Low"),
            verification_status="verified",
            doctor_verified_grade=1,
            doctor_clinical_notes="Grade 1 superficial lesion progressing well under foam dressings.",
            treatment_plan=get_default_treatment_plan(1),
            verified_at=datetime.utcnow() - timedelta(days=10),
            created_at=datetime.utcnow() - timedelta(days=10)
        )

        a3 = Assessment(
            patient_id=p3.id,
            doctor_id=doc1.id,
            created_by_doctor_id=doc1.id,
            verified_by_doctor_id=None,
            original_image_url=img4,
            gradcam_image_url=cam4,
            lesion_location="Hallux (Great Toe) - Distal",
            affected_foot="Right",
            ulcer_diameter_mm=32.0,
            ulcer_depth_mm=6.5,
            wound_area_cm2=8.2,
            exudate_level="Moderate / Serosanguinous",
            wound_odor=True,
            perilesional_erythema=True,
            pain_score=6,
            granulation_percentage=20,
            slough_percentage=20,
            necrotic_percentage=60,
            peripheral_pulses_palpable=False,
            ai_predicted_grade=4,
            ai_confidence_score=0.958,
            ai_probabilities={"Grade 1": 0.00, "Grade 2": 0.01, "Grade 3": 0.03, "Grade 4": 0.96},
            risk_severity="Critical / Emergency",
            ai_rationale="AI detected dry black necrotic eschar localized to distal hallux with cyanotic ischemic border.",
            clinical_recommendations=get_clinical_recommendations(4, 8.2, True, True, "Moderate"),
            verification_status="pending_review",
            doctor_verified_grade=None,
            doctor_clinical_notes=None,
            treatment_plan=get_default_treatment_plan(4),
            created_at=datetime.utcnow() - timedelta(hours=2)
        )

        # Assessments for Priya's Patients (p4: Robert Sterling, p5: Anita Desai)
        a4 = Assessment(
            patient_id=p4.id,
            doctor_id=doc2.id,
            created_by_doctor_id=doc2.id,
            verified_by_doctor_id=None,
            original_image_url=img1,
            gradcam_image_url=cam1,
            lesion_location="Plantar - 3rd Metatarsal Base",
            affected_foot="Left",
            ulcer_diameter_mm=21.0,
            ulcer_depth_mm=3.5,
            wound_area_cm2=4.1,
            exudate_level="Moderate",
            wound_odor=False,
            perilesional_erythema=True,
            pain_score=3,
            granulation_percentage=60,
            slough_percentage=30,
            necrotic_percentage=10,
            peripheral_pulses_palpable=False,
            ai_predicted_grade=2,
            ai_confidence_score=0.912,
            ai_probabilities={"Grade 1": 0.06, "Grade 2": 0.91, "Grade 3": 0.03, "Grade 4": 0.00},
            risk_severity="Moderate to High",
            ai_rationale="Subcutaneous ulceration with tendon exposure under pressure.",
            clinical_recommendations=get_clinical_recommendations(2, 4.1, False, True, "Moderate"),
            verification_status="pending_review",
            treatment_plan=get_default_treatment_plan(2),
            created_at=datetime.utcnow() - timedelta(hours=6)
        )

        a5 = Assessment(
            patient_id=p5.id,
            doctor_id=doc2.id,
            created_by_doctor_id=doc2.id,
            verified_by_doctor_id=None,
            original_image_url=img3,
            gradcam_image_url=cam3,
            lesion_location="Plantar - 5th Metatarsal Base",
            affected_foot="Left",
            ulcer_diameter_mm=26.5,
            ulcer_depth_mm=5.8,
            wound_area_cm2=6.4,
            exudate_level="Heavy / Purulent",
            wound_odor=True,
            perilesional_erythema=True,
            pain_score=4,
            granulation_percentage=40,
            slough_percentage=45,
            necrotic_percentage=15,
            peripheral_pulses_palpable=False,
            ai_predicted_grade=3,
            ai_confidence_score=0.928,
            ai_probabilities={"Grade 1": 0.01, "Grade 2": 0.06, "Grade 3": 0.92, "Grade 4": 0.01},
            risk_severity="High / Severe",
            ai_rationale="AI identified deep cavitation with purulent slough, perilesional halo, and suspicion of osteitis.",
            clinical_recommendations=get_clinical_recommendations(3, 6.4, True, True, "Heavy / Purulent"),
            verification_status="pending_review",
            treatment_plan=get_default_treatment_plan(3),
            created_at=datetime.utcnow() - timedelta(hours=5)
        )

        db.add_all([a1, a2, a3, a4, a5])
        db.commit()

        # 4. Seed Longitudinal Progress Records for Arthur Pendelton (p1)
        prog1 = WoundProgressRecord(
            patient_id=p1.id,
            assessment_id=a1.id,
            visit_date=(datetime.utcnow() - timedelta(days=28)).strftime("%Y-%m-%d"),
            wound_area_cm2=5.6,
            granulation_percentage=40,
            exudate_level="Heavy",
            wagner_grade=2,
            healing_trajectory="initial_baseline",
            notes="Initial baseline visit. High plantar shear forces. Commenced RCW offloading.",
            thumbnail_url=img1
        )
        prog2 = WoundProgressRecord(
            patient_id=p1.id,
            assessment_id=a1.id,
            visit_date=(datetime.utcnow() - timedelta(days=14)).strftime("%Y-%m-%d"),
            wound_area_cm2=4.4,
            granulation_percentage=55,
            exudate_level="Moderate",
            wagner_grade=2,
            healing_trajectory="improving",
            notes="21.4% area reduction in 2 weeks. Good adherence to offloading cast.",
            thumbnail_url=img1
        )
        prog3 = WoundProgressRecord(
            patient_id=p1.id,
            assessment_id=a1.id,
            visit_date=(datetime.utcnow() - timedelta(days=7)).strftime("%Y-%m-%d"),
            wound_area_cm2=3.8,
            granulation_percentage=65,
            exudate_level="Moderate",
            wagner_grade=2,
            healing_trajectory="improving",
            notes="Continuing steady closure. Callus edge debrided. Silver matrix reapplied.",
            thumbnail_url=img1
        )

        db.add_all([prog1, prog2, prog3])
        db.commit()

        print("[DFU-AI] Multi-doctor clinical database initialized with 6 demo doctors and assigned patient cohorts.")
    except Exception as e:
        print(f"[DFU-AI] Database init error: {e}")
        db.rollback()
    finally:
        db.close()

