export interface Doctor {
  id: number;
  email: string;
  full_name: string;
  specialty: string;
  hospital: string;
  license_number: string;
  avatar_url?: string;
  created_at: string;
}

export interface PatientShare {
  id: number;
  patient_id: number;
  shared_by_doctor_id: number;
  shared_with_doctor_id: number;
  shared_by_name?: string;
  shared_with_name?: string;
  shared_with_specialty?: string;
  permission: 'full' | 'view' | 'edit';
  notes?: string;
  created_at: string;
}

export interface Patient {
  id: number;
  mrn: string;
  full_name: string;
  age: number;
  gender: string;
  date_of_birth?: string;
  contact_phone?: string;
  emergency_contact?: string;
  primary_doctor_id?: number;
  primary_doctor_name?: string;
  is_shared?: boolean;
  shared_by_doctor_name?: string;
  shared_notes?: string;
  permission?: 'full' | 'view' | 'edit';
  diabetes_type: string;
  diabetes_duration_years: number;
  hba1c_current: number;
  hba1c_history?: { date: string; value: number }[];
  neuropathy_diagnosed: boolean;
  peripheral_vascular_disease: boolean;
  abi_score: number;
  monofilament_loss: boolean;
  past_ulcers_count: number;
  past_amputations: boolean;
  renal_disease: boolean;
  smoker: boolean;
  status: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  assessments_count?: number;
  latest_grade?: number;
}

export interface ProgressRecord {
  id: number;
  patient_id: number;
  assessment_id?: number;
  visit_date: string;
  wound_area_cm2: number;
  granulation_percentage: number;
  exudate_level: string;
  wagner_grade: number;
  healing_trajectory: 'improving' | 'stagnant' | 'deteriorating' | 'initial_baseline';
  notes?: string;
  thumbnail_url?: string;
}

export interface PatientDetail extends Patient {
  is_primary?: boolean;
  can_edit?: boolean;
  shares?: PatientShare[];
  assessments: Assessment[];
  progress_records: ProgressRecord[];
}

export interface TreatmentPlan {
  offloading?: string;
  dressing?: string;
  debridement?: string;
  antimicrobials?: string;
  vascular_referral?: boolean;
  glycemic_optimization?: string;
  follow_up_days?: number;
  additional_notes?: string;
}

export interface Assessment {
  id: number;
  patient_id: number;
  doctor_id?: number;
  created_by_doctor_id?: number;
  created_by_doctor_name?: string;
  verified_by_doctor_id?: number;
  verified_by_doctor_name?: string;
  original_image_url: string;
  gradcam_image_url?: string;
  lesion_location: string;
  affected_foot: string;
  ulcer_diameter_mm: number;
  ulcer_depth_mm: number;
  wound_area_cm2: number;
  exudate_level: string;
  wound_odor: boolean;
  perilesional_erythema: boolean;
  pain_score: number;
  granulation_percentage: number;
  slough_percentage: number;
  necrotic_percentage: number;
  peripheral_pulses_palpable: boolean;
  
  // AI Inference
  ai_predicted_grade: number;
  ai_confidence_score: number;
  ai_probabilities: { [key: string]: number };
  risk_severity: string;
  ai_rationale?: string;
  clinical_recommendations: string[];
  
  // Doctor Verification
  verification_status: 'pending_review' | 'verified' | 'overridden';
  doctor_verified_grade?: number;
  doctor_override_reason?: string;
  doctor_clinical_notes?: string;
  treatment_plan?: TreatmentPlan;
  verified_at?: string;
  created_at: string;
  
  patient_name?: string;
  patient_mrn?: string;
  doctor_name?: string;
}

export interface DashboardAnalytics {
  total_patients: number;
  total_my_patients?: number;
  total_shared_patients?: number;
  total_assessments: number;
  high_risk_cases: number;
  pending_verifications: number;
  avg_healing_rate_percent: number;
  grade_distribution: { [key: string]: number };
  monthly_trends: { month: string; assessments: number; verified: number; highRisk: number }[];
  risk_breakdown: { [key: string]: number };
  recent_assessments: Assessment[];
  recent_patients: Patient[];
}

export interface ModelStatusInfo {
  is_custom_model_loaded: boolean;
  model_name: string;
  model_path: string;
  framework: string;
  input_shape: number[];
  classes: string[];
  last_layer_name: string;
  instructions: string;
}

export interface ClinicalReportData {
  report_id: string;
  generated_at: string;
  hospital_header: {
    name: string;
    department: string;
    contact: string;
  };
  patient: {
    name: string;
    mrn: string;
    age: number | string;
    gender: string;
    dob: string;
    diabetes_type: string;
    hba1c: number | string;
    neuropathy: string;
    abi_score: number | string;
  };
  doctor: {
    name: string;
    specialty: string;
    license: string;
  };
  assessment: {
    date: string;
    location: string;
    diameter: string;
    depth: string;
    wound_area: string;
    tissue_breakdown: {
      granulation: string;
      slough: string;
      necrotic: string;
    };
    exudate: string;
    pain_score: string;
    pulses: string;
  };
  ai_findings: {
    predicted_grade: string;
    confidence: string;
    risk_level: string;
    probabilities: { [key: string]: number };
    rationale: string;
    original_image: string;
    gradcam_image: string;
  };
  doctor_verification: {
    status: string;
    final_grade: string;
    clinical_notes: string;
    override_reason?: string;
    signed_at: string;
  };
  treatment_plan: TreatmentPlan;
  guidelines: string[];
}
