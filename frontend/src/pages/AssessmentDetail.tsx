import React, { useEffect, useState } from 'react';
import { 
  ArrowLeft, 
  FileText, 
  UserCheck, 
  Calendar, 
  MapPin, 
  Activity, 
  Stethoscope, 
  CheckCircle2, 
  AlertTriangle,
  Printer,
  ShieldCheck,
  User,
  Clock
} from 'lucide-react';
import { Assessment, ClinicalReportData, TreatmentPlan } from '../types';
import { api } from '../services/api';
import { GradCamViewer } from '../components/GradCamViewer';
import { ConfidenceGauge } from '../components/ConfidenceGauge';
import { DoctorVerificationModal } from '../components/DoctorVerificationModal';
import { ClinicalReportModal } from '../components/ClinicalReportModal';

interface AssessmentDetailProps {
  assessmentId: number;
  onBack: () => void;
  onViewPatient: (patientId: number) => void;
}

export const AssessmentDetail: React.FC<AssessmentDetailProps> = ({
  assessmentId,
  onBack,
  onViewPatient,
}) => {
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [isVerifyOpen, setIsVerifyOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportData, setReportData] = useState<ClinicalReportData | null>(null);

  const loadAssessment = async () => {
    setLoading(true);
    try {
      const data = await api.getAssessment(assessmentId);
      setAssessment(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssessment();
  }, [assessmentId]);

  const handleVerifySubmit = async (verifyData: {
    verified_grade: number;
    status: 'verified' | 'overridden';
    override_reason?: string;
    clinical_notes?: string;
    treatment_plan: TreatmentPlan;
  }) => {
    if (!assessment) return;
    const updated = await api.verifyAssessment(assessment.id, verifyData);
    setAssessment(updated);
  };

  const handleOpenReport = async () => {
    if (!assessment) return;
    try {
      const rData = await api.getAssessmentReport(assessment.id);
      setReportData(rData);
      setIsReportOpen(true);
    } catch (e) {
      console.error(e);
      alert('Failed to generate report');
    }
  };

  if (loading || !assessment) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-3 border-[#1C1E20] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="flex items-center space-x-1.5 text-xs font-bold text-[#64748B] hover:text-[#1C1E20] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Assessments Audit Log</span>
        </button>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => setIsVerifyOpen(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-[#13866A] hover:bg-[#0E6C55] text-white text-xs font-bold rounded-md shadow-sm transition-all"
          >
            <UserCheck className="w-4 h-4" />
            <span>Doctor Sign-Off</span>
          </button>

          <button
            onClick={handleOpenReport}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-[#1C1E20] hover:bg-[#000000] text-white text-xs font-bold rounded-md shadow-sm transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Generate Clinical PDF</span>
          </button>
        </div>
      </div>

      {/* Patient & Assessment Identity Card */}
      <div className="bg-white rounded-lg p-6 border border-[#E5E7EB] shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#E5E7EB]">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block">
              Clinical Assessment Case Record #{assessment.id}
            </span>
            <h2 className="text-xl font-extrabold text-[#202938] mt-0.5">
              {assessment.patient_name || 'Patient Assessment'}
            </h2>
            <div className="flex flex-wrap items-center gap-3 text-xs text-[#64748B] mt-1">
              <span className="font-mono text-[#202938] font-bold">MRN: {assessment.patient_mrn}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#94A3B8]" />
                {new Date(assessment.created_at).toLocaleDateString()}
              </span>
              <span>•</span>
              <button
                onClick={() => onViewPatient(assessment.patient_id)}
                className="text-[#1C1E20] font-bold hover:underline"
              >
                View Patient Trajectory Profile →
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="text-right">
              <span className="text-[10px] font-bold text-[#64748B] uppercase block">Doctor Verification</span>
              <span className={`px-2 py-0.5 rounded text-[11px] font-bold inline-block mt-0.5 ${
                assessment.verification_status === 'verified' ? 'bg-[#F0FDF4] text-[#13866A] border border-[#BBF7D0]' :
                assessment.verification_status === 'overridden' ? 'bg-[#FEFCE8] text-[#D99124] border border-[#FDE047]' :
                'bg-[#F7F8FA] text-[#64748B] border border-[#E5E7EB]'
              }`}>
                {assessment.verification_status.replace('_', ' ').toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Clinical Physical Parameters Matrix */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 pt-4 text-xs">
          <div>
            <span className="text-[#64748B] block text-[11px]">Lesion Location</span>
            <span className="font-bold text-[#202938]">{assessment.lesion_location}</span>
          </div>

          <div>
            <span className="text-[#64748B] block text-[11px]">Affected Foot</span>
            <span className="font-bold text-[#202938]">{assessment.affected_foot} Foot</span>
          </div>

          <div>
            <span className="text-[#64748B] block text-[11px]">Wound Area</span>
            <span className="font-bold text-[#1C1E20]">{assessment.wound_area_cm2} cm²</span>
          </div>

          <div>
            <span className="text-[#64748B] block text-[11px]">Dimensions</span>
            <span className="font-bold text-[#202938]">{assessment.ulcer_diameter_mm}mm × {assessment.ulcer_depth_mm}mm</span>
          </div>

          <div>
            <span className="text-[#64748B] block text-[11px]">Exudate Level</span>
            <span className="font-bold text-[#202938]">{assessment.exudate_level}</span>
          </div>

          <div>
            <span className="text-[#64748B] block text-[11px]">Tissue Breakdown</span>
            <span className="font-bold text-[#202938]">{assessment.granulation_percentage}% Gran / {assessment.necrotic_percentage}% Necrotic</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Confidence & Grad-CAM, Right Recommendations & Doctor Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Visual AI Intelligence */}
        <div className="lg:col-span-7 space-y-5">
          <ConfidenceGauge
            grade={assessment.ai_predicted_grade}
            confidenceScore={assessment.ai_confidence_score}
            probabilities={assessment.ai_probabilities}
            riskSeverity={assessment.risk_severity}
          />

          <GradCamViewer
            originalImageUrl={assessment.original_image_url}
            gradcamImageUrl={assessment.gradcam_image_url}
            predictedGrade={assessment.ai_predicted_grade}
            confidenceScore={assessment.ai_confidence_score}
            rationale={assessment.ai_rationale}
          />
        </div>

        {/* Right Column: Recommendations & Doctor Sign-Off Status */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* IWGDF Clinical Guidelines */}
          <div className="bg-white rounded-lg p-5 border border-[#E5E7EB] shadow-card space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-[#202938] uppercase tracking-wider flex items-center gap-1.5">
                <Stethoscope className="w-4 h-4 text-[#1C1E20]" />
                IWGDF Clinical Treatment Protocol
              </h4>
              <span className="text-[10px] px-2 py-0.5 rounded bg-[#FDF1DC] text-[#1C1E20] font-bold border border-[#E2D9CF]">
                Wagner Grade {assessment.ai_predicted_grade}
              </span>
            </div>

            <ul className="space-y-2 text-xs text-[#64748B] leading-relaxed">
              {assessment.clinical_recommendations.map((rec, i) => (
                <li key={i} className="flex items-start space-x-2 bg-[#F7F8FA] p-2.5 rounded-md border border-[#E5E7EB]">
                  <CheckCircle2 className="w-4 h-4 text-[#13866A] shrink-0 mt-0.5" />
                  <span className="text-[#202938]">{rec}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Doctor Verified Plan (if signed off) */}
          {assessment.treatment_plan && (
            <div className="bg-white rounded-lg p-5 border border-[#E5E7EB] shadow-card space-y-3">
              <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-2">
                <h4 className="text-xs font-bold text-[#202938] uppercase tracking-wider flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-[#13866A]" />
                  Attending Doctor Verification Record
                </h4>
                <span className="text-[10px] text-[#64748B]">
                  {assessment.verified_at ? new Date(assessment.verified_at).toLocaleDateString() : 'Signed'}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-[#64748B] block text-[11px]">Attending Clinician</span>
                  <span className="font-bold text-[#202938]">{assessment.verified_by_doctor_name || 'Dr. Specialist'}</span>
                </div>

                <div>
                  <span className="text-[#64748B] block text-[11px]">Offloading Strategy</span>
                  <span className="font-medium text-[#202938]">{assessment.treatment_plan.offloading || 'Standard offloading'}</span>
                </div>

                <div>
                  <span className="text-[#64748B] block text-[11px]">Primary Dressing</span>
                  <span className="font-medium text-[#202938]">{assessment.treatment_plan.dressing || 'Standard dressing'}</span>
                </div>

                <div>
                  <span className="text-[#64748B] block text-[11px]">Follow-up Schedule</span>
                  <span className="font-medium text-[#202938]">{assessment.treatment_plan.follow_up_days || 7} Days</span>
                </div>

                {assessment.doctor_clinical_notes && (
                  <div className="pt-2 border-t border-[#E5E7EB]">
                    <span className="text-[#64748B] block text-[11px]">Clinical Notes</span>
                    <p className="text-xs text-[#202938] bg-[#F7F8FA] p-2.5 rounded-md border border-[#E5E7EB] mt-1">
                      {assessment.doctor_clinical_notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Verification Modal */}
      <DoctorVerificationModal
        assessment={assessment}
        isOpen={isVerifyOpen}
        onClose={() => setIsVerifyOpen(false)}
        onVerified={(updated) => setAssessment(updated)}
        onVerifySubmit={handleVerifySubmit}
      />

      {/* Clinical Report Preview Modal */}
      <ClinicalReportModal
        reportData={reportData}
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
      />

    </div>
  );
};
