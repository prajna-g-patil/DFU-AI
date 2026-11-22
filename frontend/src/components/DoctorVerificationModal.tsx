import React, { useState } from 'react';
import { 
  CheckCircle, 
  AlertCircle, 
  X, 
  UserCheck, 
  FileText, 
  Stethoscope, 
  ShieldCheck, 
  Send
} from 'lucide-react';
import { Assessment, TreatmentPlan } from '../types';
import { useAuth } from '../context/AuthContext';

interface DoctorVerificationModalProps {
  assessment: Assessment;
  isOpen: boolean;
  onClose: () => void;
  onVerified: (updatedAssessment: Assessment) => void;
  onVerifySubmit: (data: {
    verified_grade: number;
    status: 'verified' | 'overridden';
    override_reason?: string;
    clinical_notes?: string;
    treatment_plan: TreatmentPlan;
  }) => Promise<void>;
}

export const DoctorVerificationModal: React.FC<DoctorVerificationModalProps> = ({
  assessment,
  isOpen,
  onClose,
  onVerifySubmit,
}) => {
  const { doctor } = useAuth();

  const [decision, setDecision] = useState<'agree' | 'override'>('agree');
  const [selectedGrade, setSelectedGrade] = useState<number>(assessment.ai_predicted_grade);
  const [overrideReason, setOverrideReason] = useState<string>('Clinical physical examination revealed deeper anatomical involvement');
  const [clinicalNotes, setClinicalNotes] = useState<string>(
    `Lesion reviewed by ${doctor?.full_name || 'attending clinician'}. Physical exam confirms findings. Proceed with assigned offloading and dressing regimen.`
  );
  
  const [offloading, setOffloading] = useState<string>(
    assessment.treatment_plan?.offloading || 'Removable Cast Walker (RCW) with plantar foam pressure relief'
  );
  const [dressing, setDressing] = useState<string>(
    assessment.treatment_plan?.dressing || 'Silver Collagen Matrix + Non-adherent secondary absorbent pad'
  );
  const [debridement, setDebridement] = useState<string>(
    assessment.treatment_plan?.debridement || 'Sharp curettage debridement of hyperkeratotic ulcer border'
  );
  const [antimicrobials, setAntimicrobials] = useState<string>(
    assessment.treatment_plan?.antimicrobials || 'Amoxicillin-Clavulanate 875/125mg PO BID x 10 days'
  );
  const [vascularReferral, setVascularReferral] = useState<boolean>(
    assessment.treatment_plan?.vascular_referral || false
  );
  const [followUpDays, setFollowUpDays] = useState<number>(
    assessment.treatment_plan?.follow_up_days || 7
  );

  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const finalGrade = decision === 'agree' ? assessment.ai_predicted_grade : selectedGrade;
      await onVerifySubmit({
        verified_grade: finalGrade,
        status: decision === 'agree' ? 'verified' : 'overridden',
        override_reason: decision === 'override' ? overrideReason : undefined,
        clinical_notes: clinicalNotes,
        treatment_plan: {
          offloading,
          dressing,
          debridement,
          antimicrobials,
          vascular_referral: vascularReferral,
          follow_up_days: followUpDays,
          additional_notes: clinicalNotes
        }
      });
      onClose();
    } catch (err) {
      console.error(err);
      alert('Verification submission error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#202938]/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-card border border-[#E5E7EB] max-w-3xl w-full overflow-hidden animate-in fade-in">
        
        {/* Header */}
        <div className="bg-[#202938] text-white px-6 py-4 flex items-center justify-between border-b border-[#334155]">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-md bg-[#1C1E20] text-white">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Attending Clinician Verification & Sign-Off
              </h3>
              <p className="text-xs text-[#94A3B8]">
                Review AI inference, confirm or override Wagner Grade, and approve treatment order
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-1 rounded-md text-[#94A3B8] hover:text-white hover:bg-[#334155]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
          
          {/* AI vs Doctor Decision Switcher */}
          <div className="bg-[#F7F8FA] p-4 rounded-md border border-[#E5E7EB] space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block">
                  AI Diagnostic Prediction
                </span>
                <div className="text-base font-extrabold text-[#202938] flex items-center gap-2 mt-0.5">
                  <span>Wagner Grade {assessment.ai_predicted_grade}</span>
                  <span className="text-xs text-[#1C1E20] font-bold">
                    ({Math.round(assessment.ai_confidence_score * 100)}% Confidence)
                  </span>
                </div>
              </div>

              {/* Toggle Buttons */}
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setDecision('agree')}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold border transition-all ${
                    decision === 'agree'
                      ? 'bg-[#13866A] text-white border-[#13866A] shadow-sm'
                      : 'bg-white text-[#202938] border-[#E5E7EB] hover:bg-[#F7F8FA]'
                  }`}
                >
                  Confirm AI Classification
                </button>

                <button
                  type="button"
                  onClick={() => setDecision('override')}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold border transition-all ${
                    decision === 'override'
                      ? 'bg-[#D99124] text-white border-[#D99124] shadow-sm'
                      : 'bg-white text-[#202938] border-[#E5E7EB] hover:bg-[#F7F8FA]'
                  }`}
                >
                  Doctor Clinical Override
                </button>
              </div>
            </div>

            {/* If Override, Grade Selector */}
            {decision === 'override' && (
              <div className="pt-3 border-t border-[#E5E7EB] space-y-3 animate-in fade-in">
                <div>
                  <label className="block text-xs font-bold text-[#202938] mb-1">
                    Select Revised Doctor-Verified Grade:
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[1, 2, 3, 4].map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setSelectedGrade(g)}
                        className={`p-2 rounded-md border text-center transition-all ${
                          selectedGrade === g
                            ? 'bg-[#1C1E20] text-white border-[#1C1E20] font-bold shadow-subtle'
                            : 'bg-white text-[#202938] border-[#E5E7EB] hover:bg-[#F7F8FA]'
                        }`}
                      >
                        Grade {g}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#202938] mb-1">
                    Clinical Reason for Diagnostic Override:
                  </label>
                  <input
                    type="text"
                    required
                    value={overrideReason}
                    onChange={(e) => setOverrideReason(e.target.value)}
                    className="w-full p-2 bg-white border border-[#E5E7EB] rounded-md text-xs text-[#202938] focus:outline-none focus:border-[#1C1E20]"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Treatment Orders Form */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#202938] uppercase tracking-wider flex items-center gap-1.5">
              <Stethoscope className="w-3.5 h-3.5 text-[#1C1E20]" />
              Prescribed Treatment Orders & Wound Care Plan
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-[#64748B] block mb-1">Offloading Modality</label>
                <input
                  type="text"
                  value={offloading}
                  onChange={(e) => setOffloading(e.target.value)}
                  className="w-full p-2 bg-[#F7F8FA] border border-[#E5E7EB] rounded-md text-[#202938] focus:bg-white focus:outline-none focus:border-[#1C1E20]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#64748B] block mb-1">Primary Dressing Protocol</label>
                <input
                  type="text"
                  value={dressing}
                  onChange={(e) => setDressing(e.target.value)}
                  className="w-full p-2 bg-[#F7F8FA] border border-[#E5E7EB] rounded-md text-[#202938] focus:bg-white focus:outline-none focus:border-[#1C1E20]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-[#64748B] block mb-1">Surgical Debridement Order</label>
                <input
                  type="text"
                  value={debridement}
                  onChange={(e) => setDebridement(e.target.value)}
                  className="w-full p-2 bg-[#F7F8FA] border border-[#E5E7EB] rounded-md text-[#202938] focus:bg-white focus:outline-none focus:border-[#1C1E20]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#64748B] block mb-1">Antibiotic / Antimicrobial Regimen</label>
                <input
                  type="text"
                  value={antimicrobials}
                  onChange={(e) => setAntimicrobials(e.target.value)}
                  className="w-full p-2 bg-[#F7F8FA] border border-[#E5E7EB] rounded-md text-[#202938] focus:bg-white focus:outline-none focus:border-[#1C1E20]"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div>
                <label className="text-xs font-semibold text-[#64748B] block mb-1">Clinical Follow-Up (Days)</label>
                <input
                  type="number"
                  value={followUpDays}
                  onChange={(e) => setFollowUpDays(Number(e.target.value))}
                  className="w-28 p-2 bg-[#F7F8FA] border border-[#E5E7EB] rounded-md font-bold text-[#202938] focus:bg-white focus:outline-none focus:border-[#1C1E20]"
                />
              </div>

              <div className="pt-4">
                <label className="flex items-center space-x-2 cursor-pointer text-[#202938]">
                  <input
                    type="checkbox"
                    checked={vascularReferral}
                    onChange={(e) => setVascularReferral(e.target.checked)}
                    className="rounded text-[#1C1E20] focus:ring-[#1C1E20]"
                  />
                  <span className="font-semibold">Vascular Specialist Referral Required</span>
                </label>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#64748B] block mb-1">Doctor Consultation Notes</label>
              <textarea
                rows={3}
                value={clinicalNotes}
                onChange={(e) => setClinicalNotes(e.target.value)}
                className="w-full p-2 bg-[#F7F8FA] border border-[#E5E7EB] rounded-md text-xs text-[#202938] focus:bg-white focus:outline-none focus:border-[#1C1E20]"
              />
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end space-x-2.5 pt-4 border-t border-[#E5E7EB]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#64748B] hover:text-[#202938] hover:bg-[#F7F8FA] rounded-md"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-[#13866A] hover:bg-[#0E6C55] text-white text-xs font-bold rounded-md shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <UserCheck className="w-4 h-4" />
              <span>{submitting ? 'Submitting Sign-Off...' : 'Electronically Sign & Verify Report'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
