from typing import List, Dict, Any

def get_clinical_recommendations(
    wagner_grade: int,
    wound_area_cm2: float = 3.0,
    has_odor: bool = False,
    is_erythematous: bool = True,
    exudate_level: str = "Moderate"
) -> List[str]:
    """
    Generate evidence-based clinical recommendations aligning with IWGDF 
    (International Working Group on the Diabetic Foot) guidelines.
    """
    recommendations = []

    if wagner_grade == 1:
        recommendations.extend([
            "Non-surgical debridement: Gently remove hyperkeratotic callus edge to reduce peak plantar pressure points.",
            "Offloading Strategy: Recommend custom-molded insole or therapeutic footwear with 30-50% pressure reduction.",
            "Moisture Balance: Apply hydrogel or non-adherent foam dressing; replace every 48-72 hours.",
            "Glycemic & Metabolic Control: Target HbA1c < 7.0-7.5% in collaboration with primary endocrinologist.",
            "Follow-up Protocol: Clinical re-evaluation within 7-14 days to confirm >15% weekly area reduction."
        ])
    elif wagner_grade == 2:
        recommendations.extend([
            "Sharp Surgical Debridement: Remove non-viable tissue down to clean bleeding base while protecting exposed tendon/capsule.",
            "Advanced Offloading: Implement Removable Cast Walker (RCW) or Total Contact Cast (TCC) - gold standard for plantar neuropathic ulcers.",
            "Antimicrobial / Silver Dressings: Apply Ionic Silver Collagen matrix dressing to suppress high bioburden without cytotoxic toxicity.",
            "Deep Tissue Culture: Obtain sterile curettage or tissue biopsy (avoid superficial swab) if signs of secondary infection are present.",
            "Vascular Assessment: Confirm distal perfusion (ABI > 0.7 or triphasic Doppler waveforms).",
            "Follow-up Protocol: Strict weekly clinical follow-up; check for tendon sheath propagation."
        ])
    elif wagner_grade == 3:
        recommendations.extend([
            "URGENT Surgical Consultation: Urgent evaluation for operative debridement, incision and drainage of deep fascial space abscess.",
            "Radiologic Staging: Order Plain Radiographs (AP, Lateral, Oblique) & Consider Contrast MRI or Probe-to-Bone test to rule out osteomyelitis.",
            "Targeted Systemic Antimicrobial Therapy: Initiate broad-spectrum empiric IV/Oral antibiotics covering MRSA and Gram-negative anaerobes pending culture results.",
            "Strict Non-Weight Bearing Offloading: Absolute non-weight bearing with crutches, wheelchair, or knee scooter until infection control is achieved.",
            "Infectious Disease & Orthopedic/Podiatric Co-management: Inpatient or day-hospital admission recommended for IV therapy and deep bone biopsy.",
            "Daily to 48-Hour Dressing Changes: Negative Pressure Wound Therapy (NPWT / VAC) may be indicated post-surgical clearance."
        ])
    elif wagner_grade == 4:
        recommendations.extend([
            "EMERGENCY Inpatient Admission & Surgical Triage: Immediate podiatric/vascular surgical consult for limb salvage and localized amputation evaluation.",
            "Urgent Vascular Diagnostic Workup: Urgent Arterial Duplex Ultrasound, CT Angiography, or Digital Subtraction Angiography (DSA) to assess revascularization feasibility (bypass vs endovascular angioplasty).",
            "Broad-Spectrum Intravenous Antibiotic Regimen: Immediate IV coverage against polymicrobial gas-forming organisms and resistant pathogens.",
            "Demarcation Monitoring: Keep gangrenous necrotic area dry with Betadine paint if uninfected pending vascular revascularization; do not debride dry gangrene before perfusion restoration.",
            "Cardiovascular & Renal Risk Optimization: Perioperative cardiac and nephrology clearance."
        ])

    # Contextual modifiers
    if has_odor or "Purulent" in exudate_level:
        recommendations.append("Infection Warning: Foul odor/purulence indicates anaerobic or polymicrobial infection. Urgent culture and gram stain indicated.")
    
    if wound_area_cm2 > 5.0:
        recommendations.append("Large Wound Area Alert (>5 cm²): Consider advanced biological skin substitutes (acellular dermal matrix / living cellular constructs) if <50% reduction at 4 weeks.")

    return recommendations

def get_default_treatment_plan(wagner_grade: int) -> Dict[str, Any]:
    """Provide intelligent default treatment plans based on predicted grade."""
    if wagner_grade == 1:
        return {
            "offloading": "Therapeutic diabetic footwear with custom accommodative orthosis",
            "dressing": "Hydrocolloid / Polyurethane non-adherent foam dressing",
            "debridement": "Conservative bedside callus reduction",
            "antimicrobials": "None required (no overt infection)",
            "vascular_referral": False,
            "follow_up_days": 14,
            "additional_notes": "Educate patient on daily foot inspection and temperature monitoring."
        }
    elif wagner_grade == 2:
        return {
            "offloading": "Removable Cast Walker (RCW) with foam relief aperture",
            "dressing": "Hydrofiber with Ionic Silver + secondary absorbent pad",
            "debridement": "Sharp curettage debridement of ulcer edge",
            "antimicrobials": "Amoxicillin-Clavulanate 875/125mg PO BID x 10 days",
            "vascular_referral": False,
            "follow_up_days": 7,
            "additional_notes": "Probe-to-bone test was negative. Tendon sheath intact."
        }
    elif wagner_grade == 3:
        return {
            "offloading": "Strict Non-Weight Bearing (Wheelchair / Crutches)",
            "dressing": "Alginate dressing with antiseptic solution / NPWT",
            "debridement": "Surgical operating room debridement and bone curettage",
            "antimicrobials": "Empiric Piperacillin-Tazobactam IV + Vancomycin pending deep bone culture",
            "vascular_referral": True,
            "follow_up_days": 2,
            "additional_notes": "Urgent MRI ordered. Suspected cortical breach on 1st metatarsal head."
        }
    else:
        return {
            "offloading": "Absolute bedrest / Non-weight bearing",
            "dressing": "Dry sterile Betadine painting (dry gangrene protocol)",
            "debridement": "Urgent surgical debridement / Partial forefoot ray amputation",
            "antimicrobials": "Broad-spectrum IV Meropenem + Vancomycin",
            "vascular_referral": True,
            "follow_up_days": 1,
            "additional_notes": "Emergency vascular surgery and podiatric limb salvage team activated."
        }
