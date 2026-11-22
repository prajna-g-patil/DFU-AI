import React, { useEffect, useState } from 'react';
import { 
  ArrowLeft, 
  PlusCircle, 
  Activity, 
  HeartPulse, 
  AlertTriangle, 
  Calendar, 
  Phone, 
  FileText, 
  CheckCircle2, 
  Clock, 
  Eye, 
  ShieldCheck,
  TrendingDown,
  Share2,
  Stethoscope,
  X,
  Trash2,
  Lock,
  UserCheck
} from 'lucide-react';
import { PatientDetail as PatientDetailType, Assessment, Doctor } from '../types';
import { api } from '../services/api';
import { WoundProgressChart } from '../components/WoundProgressChart';

interface PatientDetailProps {
  patientId: number;
  onBack: () => void;
  onNewAssessment: (patientId: number) => void;
  onViewAssessment: (assessmentId: number) => void;
}

export const PatientDetail: React.FC<PatientDetailProps> = ({
  patientId,
  onBack,
  onNewAssessment,
  onViewAssessment,
}) => {
  const [patient, setPatient] = useState<PatientDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);
  const [doctorsList, setDoctorsList] = useState<Doctor[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState<number | null>(null);
  const [sharePermission, setSharePermission] = useState<'full' | 'view'>('full');
  const [shareNotes, setShareNotes] = useState('');
  const [sharingLoading, setSharingLoading] = useState(false);
  const [shareSuccessMessage, setShareSuccessMessage] = useState<string | null>(null);
  const [shareErrorMessage, setShareErrorMessage] = useState<string | null>(null);

  const loadPatientData = async () => {
    setLoading(true);
    try {
      const data = await api.getPatient(patientId);
      setPatient(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadDoctors = async () => {
    try {
      const docs = await api.getDoctors();
      setDoctorsList(docs);
      if (docs.length > 0) {
        const candidate = docs.find(d => d.id !== patient?.primary_doctor_id);
        if (candidate) setSelectedDoctorId(candidate.id);
      }
    } catch (e) {
      console.error("Error loading doctors:", e);
    }
  };

  useEffect(() => {
    loadPatientData();
  }, [patientId]);

  const handleOpenShareModal = async () => {
    setShowShareModal(true);
    setShareSuccessMessage(null);
    setShareErrorMessage(null);
    await loadDoctors();
  };

  const handleShareSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctorId) {
      setShareErrorMessage("Please select a recipient specialist.");
      return;
    }

    setSharingLoading(true);
    setShareErrorMessage(null);
    setShareSuccessMessage(null);

    try {
      await api.sharePatient(patientId, {
        target_doctor_id: selectedDoctorId,
        permission: sharePermission,
        notes: shareNotes.trim() || undefined
      });
      setShareSuccessMessage("Patient successfully shared with specialist!");
      setShareNotes('');
      const updated = await api.getPatient(patientId);
      setPatient(updated);
    } catch (err: any) {
      setShareErrorMessage(err.message || "Failed to share patient record.");
    } finally {
      setSharingLoading(false);
    }
  };

  const handleRevokeShare = async (targetDocId: number) => {
    if (!window.confirm("Are you sure you want to revoke this specialist's access?")) {
      return;
    }

    try {
      await api.unsharePatient(patientId, targetDocId);
      const updated = await api.getPatient(patientId);
      setPatient(updated);
    } catch (err: any) {
      alert(err.message || "Failed to revoke share access.");
    }
  };

  if (loading || !patient) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-3 border-[#1C1E20] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top Breadcrumb & Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="flex items-center space-x-1.5 text-xs font-bold text-[#64748B] hover:text-[#1C1E20] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Patient Registry</span>
        </button>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={handleOpenShareModal}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-white hover:bg-[#F7F8FA] text-[#202938] text-xs font-semibold rounded-md border border-[#E5E7EB] shadow-subtle transition-all"
          >
            <Share2 className="w-3.5 h-3.5 text-[#1C1E20]" />
            <span>Share Record</span>
          </button>

          <button
            onClick={() => onNewAssessment(patient.id)}
            className="flex items-center space-x-1.5 px-4 py-2 bg-[#1C1E20] hover:bg-[#000000] text-white text-xs font-bold rounded-md shadow-sm transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Perform AI Ulcer Assessment</span>
          </button>
        </div>
      </div>

      {/* Patient Master Demographics Card */}
      <div className="bg-white rounded-lg p-6 border border-[#E5E7EB] shadow-card space-y-5">
        
        <div className="flex flex-wrap items-start justify-between gap-4 pb-5 border-b border-[#E5E7EB]">
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-xs font-bold text-[#64748B] uppercase tracking-wider">
                {patient.mrn}
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                patient.status.includes('High Risk') ? 'bg-[#FEF2F2] text-[#D94848] border border-[#FCA5A5]' :
                patient.status === 'Active' ? 'bg-[#FFF7ED] text-[#EA580C] border border-[#FDBA74]' :
                patient.status === 'Healed' ? 'bg-[#F0FDF4] text-[#13866A] border border-[#BBF7D0]' :
                'bg-[#F7F8FA] text-[#64748B] border border-[#E5E7EB]'
              }`}>
                {patient.status}
              </span>

              {patient.is_shared && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#EAF1F7] text-[#1E3A8A] border border-[#D4E3F0] flex items-center gap-1">
                  <Share2 className="w-2.5 h-2.5" />
                  Shared with Me
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-[#202938] mt-1">
              {patient.full_name}
            </h1>
            
            <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
              {patient.age} Years Old • {patient.gender} • DOB: {patient.date_of_birth || 'N/A'} • {patient.contact_phone || 'No phone recorded'}
            </p>

            {/* Clinician Badges */}
            <div className="flex flex-wrap items-center gap-2.5 mt-3">
              <div className="flex items-center text-xs text-[#202938] bg-[#F7F8FA] px-2.5 py-1 rounded-md border border-[#E5E7EB] gap-1.5 font-medium">
                <Stethoscope className="w-3.5 h-3.5 text-[#1C1E20]" />
                <span>Primary Attending: <strong>{patient.primary_doctor_name || 'Assigned Specialist'}</strong></span>
              </div>

              {patient.is_shared && patient.shared_by_doctor_name && (
                <div className="flex items-center text-xs text-[#1E3A8A] bg-[#EAF1F7] px-2.5 py-1 rounded-md border border-[#D4E3F0] gap-1.5 font-medium">
                  <Share2 className="w-3 h-3 text-[#1E3A8A]" />
                  <span>Shared by: <strong>{patient.shared_by_doctor_name}</strong></span>
                </div>
              )}
            </div>
          </div>

          <div className="text-right text-xs">
            <span className="font-semibold text-[#64748B] uppercase block text-[10px]">Emergency Contact</span>
            <span className="font-bold text-[#202938] mt-0.5 block">{patient.emergency_contact || 'None listed'}</span>
          </div>
        </div>

        {/* Diabetic Baseline Biomarkers Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          
          <div className="bg-[#F7F8FA] p-3.5 rounded-md border border-[#E5E7EB]">
            <div className="text-[10px] font-bold text-[#64748B] uppercase">Diabetes Profile</div>
            <div className="text-base font-bold text-[#202938] mt-0.5">{patient.diabetes_type}</div>
            <div className="text-[11px] text-[#64748B]">Duration: {patient.diabetes_duration_years} Years</div>
          </div>

          <div className="bg-[#F7F8FA] p-3.5 rounded-md border border-[#E5E7EB]">
            <div className="text-[10px] font-bold text-[#64748B] uppercase">Current HbA1c</div>
            <div className={`text-base font-bold mt-0.5 ${patient.hba1c_current >= 8.5 ? 'text-[#D94848]' : 'text-[#202938]'}`}>
              {patient.hba1c_current}%
            </div>
            <div className="text-[11px] text-[#64748B]">
              {patient.hba1c_current >= 8.0 ? 'Suboptimal Control' : 'Adequate Control'}
            </div>
          </div>

          <div className="bg-[#F7F8FA] p-3.5 rounded-md border border-[#E5E7EB]">
            <div className="text-[10px] font-bold text-[#64748B] uppercase">Vascular ABI Index</div>
            <div className="text-base font-bold text-[#202938] mt-0.5">{patient.abi_score}</div>
            <div className="text-[11px] text-[#64748B]">
              {patient.peripheral_vascular_disease ? 'PVD Diagnosed' : 'Palpable Pulses'}
            </div>
          </div>

          <div className="bg-[#F7F8FA] p-3.5 rounded-md border border-[#E5E7EB]">
            <div className="text-[10px] font-bold text-[#64748B] uppercase">Loss of Sensation</div>
            <div className={`text-base font-bold mt-0.5 ${patient.neuropathy_diagnosed ? 'text-[#D94848]' : 'text-[#13866A]'}`}>
              {patient.neuropathy_diagnosed ? 'Neuropathy +' : 'Intact'}
            </div>
            <div className="text-[11px] text-[#64748B]">Semmes-Weinstein 10g</div>
          </div>

        </div>

      </div>

      {/* Longitudinal Wound Progress Trajectory Chart */}
      <WoundProgressChart progressRecords={patient.progress_records || []} />

      {/* Historical Ulcer Assessment Timeline */}
      <div className="bg-white rounded-lg border border-[#E5E7EB] shadow-card overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#202938]">
              Ulcer Assessment & Staging Audit History ({patient.assessments?.length || 0})
            </h3>
            <p className="text-xs text-[#64748B]">
              Chronological log of AI inferences, Grad-CAM maps, and clinician approvals
            </p>
          </div>

          <button
            onClick={() => onNewAssessment(patient.id)}
            className="text-xs font-bold text-[#1C1E20] hover:underline flex items-center gap-1"
          >
            + Add New Evaluation
          </button>
        </div>

        <div className="divide-y divide-[#E5E7EB]">
          {patient.assessments && patient.assessments.length > 0 ? (
            patient.assessments.map((a: Assessment) => (
              <div key={a.id} className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 hover:bg-[#F7F8FA] transition-colors">
                
                <div className="flex items-center space-x-4">
                  <img
                    src={a.original_image_url}
                    alt="Ulcer"
                    className="w-12 h-12 rounded-md object-cover border border-[#E5E7EB]"
                  />
                  {a.gradcam_image_url && (
                    <img
                      src={a.gradcam_image_url}
                      alt="Grad-CAM"
                      className="w-12 h-12 rounded-md object-cover border border-[#E2D9CF] hidden sm:block"
                    />
                  )}

                  <div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        a.ai_predicted_grade === 4 ? 'bg-[#FEF2F2] text-[#D94848] border border-[#FCA5A5]' :
                        a.ai_predicted_grade === 3 ? 'bg-[#FFF7ED] text-[#EA580C] border border-[#FDBA74]' :
                        a.ai_predicted_grade === 2 ? 'bg-[#FEFCE8] text-[#D99124] border border-[#FDE047]' :
                        'bg-[#F0FDF4] text-[#13866A] border border-[#BBF7D0]'
                      }`}>
                        Wagner Grade {a.ai_predicted_grade}
                      </span>
                      <span className="text-xs font-bold text-[#202938]">{a.lesion_location}</span>
                    </div>

                    <p className="text-[11px] text-[#64748B] mt-0.5">
                      {new Date(a.created_at).toLocaleDateString()} • {a.affected_foot} Foot • Area: {a.wound_area_cm2} cm² • Confidence: {Math.round(a.ai_confidence_score * 100)}%
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                    a.verification_status === 'verified' ? 'bg-[#F0FDF4] text-[#13866A] border border-[#BBF7D0]' :
                    a.verification_status === 'overridden' ? 'bg-[#FEFCE8] text-[#D99124] border border-[#FDE047]' :
                    'bg-[#F7F8FA] text-[#64748B] border border-[#E5E7EB]'
                  }`}>
                    {a.verification_status.replace('_', ' ').toUpperCase()}
                  </span>

                  <button
                    onClick={() => onViewAssessment(a.id)}
                    className="px-2.5 py-1 bg-white hover:bg-[#FDF1DC] text-[#202938] hover:text-[#1C1E20] border border-[#E5E7EB] hover:border-[#E2D9CF] rounded-md text-xs font-semibold inline-flex items-center gap-1 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Detail</span>
                  </button>
                </div>

              </div>
            ))
          ) : (
            <div className="p-8 text-center text-xs text-[#64748B]">
              No assessments recorded yet for this patient.
            </div>
          )}
        </div>
      </div>

      {/* Share Patient Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 bg-[#202938]/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full border border-[#E5E7EB] shadow-card p-6 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
              <h3 className="text-sm font-bold text-[#202938] flex items-center gap-1.5">
                <Share2 className="w-4 h-4 text-[#1C1E20]" />
                Cross-Specialist Clinical Referral
              </h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-[#94A3B8] hover:text-[#202938]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {shareSuccessMessage && (
              <div className="p-3 bg-[#F0FDF4] border border-[#BBF7D0] text-xs text-[#13866A] rounded-md">
                {shareSuccessMessage}
              </div>
            )}
            {shareErrorMessage && (
              <div className="p-3 bg-[#FEF2F2] border border-[#FCA5A5] text-xs text-[#D94848] rounded-md">
                {shareErrorMessage}
              </div>
            )}

            <form onSubmit={handleShareSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#202938] mb-1">Select Receiving Doctor / Specialist</label>
                <select
                  value={selectedDoctorId || ''}
                  onChange={(e) => setSelectedDoctorId(Number(e.target.value))}
                  className="w-full p-2 bg-[#F7F8FA] border border-[#E5E7EB] rounded-md text-xs font-medium text-[#202938] focus:outline-none focus:border-[#1C1E20]"
                >
                  {doctorsList.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.full_name} ({d.specialty} • {d.hospital})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#202938] mb-1">Access Level</label>
                <select
                  value={sharePermission}
                  onChange={(e) => setSharePermission(e.target.value as any)}
                  className="w-full p-2 bg-[#F7F8FA] border border-[#E5E7EB] rounded-md text-xs font-medium text-[#202938] focus:outline-none focus:border-[#1C1E20]"
                >
                  <option value="full">Full Access (View, Add Assessments & Verify)</option>
                  <option value="view">View Only (Consultation Observer)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#202938] mb-1">Clinical Consultation Notes</label>
                <textarea
                  rows={3}
                  value={shareNotes}
                  onChange={(e) => setShareNotes(e.target.value)}
                  placeholder="e.g. Requesting urgent vascular surgery consultation for Grade 4 gangrenous presentation..."
                  className="w-full p-2 bg-[#F7F8FA] border border-[#E5E7EB] rounded-md text-xs text-[#202938] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#1C1E20]"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowShareModal(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-[#64748B] hover:text-[#202938]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sharingLoading}
                  className="px-4 py-1.5 bg-[#1C1E20] hover:bg-[#000000] text-white text-xs font-bold rounded-md shadow-sm disabled:opacity-50"
                >
                  {sharingLoading ? 'Sharing...' : 'Confirm Referral'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
