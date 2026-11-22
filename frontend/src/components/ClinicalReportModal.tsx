import React from 'react';
import { 
  Printer, 
  X, 
  Activity, 
  ShieldCheck, 
  Calendar, 
  MapPin, 
  CheckCircle2, 
  Stethoscope
} from 'lucide-react';
import { ClinicalReportData } from '../types';

interface ClinicalReportModalProps {
  reportData: ClinicalReportData | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ClinicalReportModal: React.FC<ClinicalReportModalProps> = ({
  reportData,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !reportData) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#202938]/50 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-lg shadow-card border border-[#E5E7EB] max-w-4xl w-full overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Floating Action Controls */}
        <div className="no-print bg-[#202938] text-white px-6 py-3 flex items-center justify-between border-b border-[#334155] shrink-0">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-[4px] bg-[#1C1E20] flex items-center justify-center text-white">
              <Activity className="w-3.5 h-3.5" />
            </div>
            <span className="text-sm font-bold text-white">
              Hospital Clinical Consultation & AI Assessment Report
            </span>
            <span className="text-xs text-[#94A3B8] font-mono">
              [{reportData.report_id}]
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-[#1C1E20] hover:bg-[#000000] text-white rounded-md text-xs font-bold shadow-sm transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-[#94A3B8] hover:text-white hover:bg-[#334155] rounded-md transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Paper Area */}
        <div className="p-8 sm:p-10 overflow-y-auto space-y-6 text-[#202938] bg-white text-xs" id="clinical-report-content">
          
          {/* Hospital Letterhead Header */}
          <div className="border-b-2 border-[#202938] pb-4 flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center space-x-3.5">
              <div className="w-11 h-11 rounded-md bg-[#1C1E20] text-white flex items-center justify-center font-bold text-xl shadow-sm">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tight text-[#202938] font-display">
                  {reportData.hospital_header?.name || 'Metropolitan Hospital Center'}
                </h1>
                <p className="text-xs font-semibold text-[#1C1E20]">
                  {reportData.hospital_header?.department || 'Diabetic Foot & Limb Salvage Service'}
                </p>
                <p className="text-[11px] text-[#64748B]">
                  {reportData.hospital_header?.contact || 'Clinical Inquiries: ext. 4410'}
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                Official Clinical Consultation
              </div>
              <div className="text-sm font-bold font-mono text-[#202938] mt-0.5">
                {reportData.report_id}
              </div>
              <div className="text-[11px] text-[#64748B]">
                Issued: {reportData.generated_at}
              </div>
            </div>
          </div>

          {/* Patient Demographics Matrix */}
          <div className="bg-[#F7F8FA] p-4 rounded-md border border-[#E5E7EB] grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <span className="text-[10px] font-bold text-[#64748B] uppercase block">Patient Name</span>
              <span className="font-bold text-[#202938] text-sm">{reportData.patient?.name}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#64748B] uppercase block">Medical Record No.</span>
              <span className="font-bold font-mono text-[#202938]">{reportData.patient?.mrn}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#64748B] uppercase block">Age / Gender</span>
              <span className="font-bold text-[#202938]">{reportData.patient?.age} Y • {reportData.patient?.gender}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#64748B] uppercase block">Attending Clinician</span>
              <span className="font-bold text-[#1C1E20]">{reportData.doctor?.name || 'Attending Podiatric Surgeon'}</span>
            </div>
          </div>

          {/* Physical Lesion & Staging Findings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div className="border border-[#E5E7EB] rounded-md p-4 space-y-2 bg-white">
              <h3 className="font-bold text-[#202938] text-xs uppercase tracking-wider border-b border-[#E5E7EB] pb-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#1C1E20]" />
                Ulcer Lesion Physical Parameters
              </h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[#64748B] block text-[11px]">Anatomical Location</span>
                  <span className="font-bold text-[#202938]">{reportData.assessment?.location}</span>
                </div>
                <div>
                  <span className="text-[#64748B] block text-[11px]">Dimensions</span>
                  <span className="font-bold text-[#202938]">{reportData.assessment?.diameter} × {reportData.assessment?.depth}</span>
                </div>
                <div>
                  <span className="text-[#64748B] block text-[11px]">Calculated Wound Area</span>
                  <span className="font-bold text-[#1C1E20]">{reportData.assessment?.wound_area}</span>
                </div>
                <div>
                  <span className="text-[#64748B] block text-[11px]">Exudate Level</span>
                  <span className="font-medium text-[#202938]">{reportData.assessment?.exudate}</span>
                </div>
              </div>
            </div>

            {/* AI Diagnosis */}
            <div className="border border-[#E5E7EB] rounded-md p-4 space-y-2 bg-[#F7F8FA]">
              <h3 className="font-bold text-[#202938] text-xs uppercase tracking-wider border-b border-[#E5E7EB] pb-1 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-[#1C1E20]" />
                Convolutional Wagner Classification
              </h3>
              <div className="flex items-center justify-between pt-1">
                <div>
                  <span className="text-xs font-bold text-[#202938] block">AI Predicted Staging:</span>
                  <span className="text-base font-extrabold text-[#1C1E20]">
                    {reportData.ai_findings?.predicted_grade}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-[#64748B] block">Model Confidence</span>
                  <span className="text-xs font-bold text-[#202938]">
                    {reportData.ai_findings?.confidence}
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-[#64748B] leading-relaxed pt-1">
                {reportData.ai_findings?.rationale}
              </p>
            </div>

          </div>

          {/* Prescribed Treatment Orders */}
          <div className="border border-[#E5E7EB] rounded-md p-4 space-y-2.5 bg-white">
            <h3 className="font-bold text-[#202938] text-xs uppercase tracking-wider flex items-center gap-1.5 border-b border-[#E5E7EB] pb-1">
              <Stethoscope className="w-3.5 h-3.5 text-[#13866A]" />
              Prescribed Treatment Orders & Clinical Directives
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[#64748B] block text-[11px]">Offloading Strategy</span>
                <span className="font-medium text-[#202938]">{reportData.treatment_plan?.offloading || 'Standard offloading'}</span>
              </div>
              <div>
                <span className="text-[#64748B] block text-[11px]">Primary Dressing Protocol</span>
                <span className="font-medium text-[#202938]">{reportData.treatment_plan?.dressing || 'Collagen silver matrix'}</span>
              </div>
              <div>
                <span className="text-[#64748B] block text-[11px]">Surgical Debridement</span>
                <span className="font-medium text-[#202938]">{reportData.treatment_plan?.debridement || 'None indicated'}</span>
              </div>
              <div>
                <span className="text-[#64748B] block text-[11px]">Follow-Up Schedule</span>
                <span className="font-medium text-[#202938]">{reportData.treatment_plan?.follow_up_days || 7} Days</span>
              </div>
            </div>
          </div>

          {/* Attending Doctor Sign-Off & Legal Block */}
          <div className="border-t-2 border-[#202938] pt-4 flex flex-wrap items-end justify-between gap-4 text-xs">
            <div className="max-w-md space-y-1">
              <span className="font-bold text-[#202938] text-[11px] uppercase tracking-wider block">
                Clinical Attestation & Decision Support Notice
              </span>
              <p className="text-[10px] text-[#64748B] leading-normal">
                This document was generated using DFU-AI Clinical Decision Support System v2.4. All automated inferences are subject to review by licensed medical practitioners under IWGDF 2023 Guidelines.
              </p>
            </div>

            <div className="text-right space-y-1 min-w-[200px]">
              <div className="h-10 border-b border-dashed border-[#CBD5E1] flex items-end justify-end pb-1 font-serif italic text-sm text-[#202938]">
                {reportData.doctor?.name || 'Dr. Attending'}
              </div>
              <div className="font-bold text-[#202938] text-xs">
                {reportData.doctor?.name}
              </div>
              <div className="text-[10px] text-[#64748B]">
                License: {reportData.doctor?.license || 'MD-784920'} • Date: {reportData.doctor_verification?.signed_at || reportData.generated_at}
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
