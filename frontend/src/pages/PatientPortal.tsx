import React from 'react';
import { 
  HeartPulse, 
  Calendar, 
  Clock, 
  User, 
  Stethoscope, 
  FileText, 
  LogOut, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  PhoneCall, 
  Activity, 
  TrendingDown, 
  Layers, 
  Pill, 
  Award,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Printer
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { useAuth } from '../context/AuthContext';

export const PatientPortal: React.FC = () => {
  const { doctor, logout } = useAuth();

  // Patient session state from context or demo Indian EHR record
  const patientSession: any = {
    patient_name: 'Rameshwar Prasad Gupta',
    mrn: 'AIIDC-2024-8492',
    phone: '+91 98101 23456',
    consulting_doctor: doctor?.full_name || 'Dr. Rajesh Sharma, MS, MCh, FACS',
    assessments: [
      {
        ai_predicted_grade: 2,
        lesion_location: 'Plantar - 1st Metatarsal Head',
        affected_foot: 'Right',
        wound_area_cm2: 3.8,
        doctor_clinical_notes: 'Confirmed Wagner Grade 2 neuropathic plantar ulcer. Debrided hyperkeratotic rim. Offloading footwear applied.',
        original_image_url: '/static/samples/sample_grade2.jpg',
        gradcam_image_url: '/static/samples/sample_grade2_gradcam.jpg'
      }
    ]
  };

  const latestAssessment = patientSession.assessments?.[0] || {
    ai_predicted_grade: 3,
    lesion_location: 'Plantar - 1st Metatarsal Head',
    affected_foot: 'Right',
    wound_area_cm2: 3.8,
    doctor_clinical_notes: 'Confirmed Wagner Grade 2-3 neuropathic plantar ulcer. Debrided hyperkeratotic rim. Total contact casting applied.',
    original_image_url: '/static/samples/sample_grade2.jpg',
    gradcam_image_url: '/static/samples/sample_grade2_gradcam.jpg'
  };

  // Mock longitudinal healing curve for patient's chart
  const healingProgressData = [
    { week: 'Week 1', area: 5.6, status: 'Initial Presentation' },
    { week: 'Week 2', area: 4.9, status: 'Debridement & Offload' },
    { week: 'Week 3', area: 4.2, status: 'Granulation Phase' },
    { week: 'Week 4 (Current)', area: latestAssessment.wound_area_cm2 || 3.8, status: 'Healing Progression' },
    { week: 'Target (Wk 8)', area: 0.8, status: 'Projected Epithelial Closure' }
  ];

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-[#202938] flex flex-col justify-between selection:bg-[#8B1538] selection:text-white">
      
      {/* Top Patient Care Notification Strip */}
      <div className="bg-[#650D28] text-white px-4 sm:px-6 lg:px-8 py-2 text-xs border-b border-[#4A0A1E]">
        <div className="max-w-[1440px] mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-[#13866A] animate-pulse" />
            <span className="font-semibold text-white uppercase text-[11px] tracking-wide">
              Patient Healing Portal • Indian Diabetic Limb Care Network
            </span>
          </div>
          <div className="flex items-center space-x-3 text-[11px]">
            <span className="text-white font-mono">24/7 Limb Helpline: 1800-DFU-CARE (Toll-Free)</span>
            <span>•</span>
            <span className="text-emerald-300 flex items-center gap-1 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Active Clinical Protocol</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Patient Header */}
      <header className="bg-white border-b border-[#E5E7EB] shadow-sm sticky top-0 z-40">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#8B1538] to-[#650D28] flex items-center justify-center shadow-sm">
              <HeartPulse className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-base font-bold text-[#8B1538]">
                  DFU-AI HEALTH <span className="text-[#64748B] font-medium text-xs">• Patient Portal</span>
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#13866A]/10 text-[#13866A] border border-[#13866A]/20">
                  Verified Patient
                </span>
              </div>
              <p className="text-[11px] text-[#64748B] font-mono">
                MRN: {patientSession.mrn} • {patientSession.full_name} ({patientSession.age}y, {patientSession.gender})
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={logout}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-[#8B1538] hover:bg-[#8B1538]/5 border border-[#E5E7EB] hover:border-[#8B1538] rounded-lg transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Patient Dashboard Content */}
      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 flex-1 w-full">
        
        {/* Welcome Greeting Card */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8B1538] bg-[#8B1538]/10 px-2.5 py-0.5 rounded-md border border-[#8B1538]/20">
                Personal Wound Recovery Workspace
              </span>
              <h1 className="text-2xl font-bold text-[#202938] mt-1.5">
                Namaste, {patientSession.full_name}
              </h1>
              <p className="text-xs text-[#64748B] mt-1 max-w-2xl leading-relaxed">
                Welcome to your diabetic wound healing monitor. Review your wound measurements, track tissue closure trends, view care instructions, and stay in touch with your care team.
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-[#F7F8FA] border border-[#E5E7EB] text-right">
              <div className="text-[10px] font-semibold text-[#64748B] uppercase">Primary Attending Specialist</div>
              <div className="text-xs font-bold text-[#8B1538] mt-0.5">{patientSession.doctor?.full_name}</div>
              <div className="text-[10px] text-[#64748B] mt-0.5">{patientSession.doctor?.hospital}</div>
            </div>
          </div>
        </div>

        {/* 2-Column Clinical Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Current Ulcer Status & Healing Curve */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Active Wound Status Card */}
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
                <div className="flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-[#8B1538]" />
                  <h2 className="text-xs font-bold text-[#202938] uppercase tracking-wider">
                    Current Ulcer Assessment & Wagner Stage
                  </h2>
                </div>
                <span className={`px-2.5 py-0.5 rounded-md text-xs font-semibold border ${
                  latestAssessment.ai_predicted_grade >= 3 
                    ? 'bg-[#8B1538]/10 text-[#8B1538] border-[#8B1538]/20' 
                    : 'bg-[#D99124]/10 text-[#D99124] border-[#D99124]/20'
                }`}>
                  Wagner Grade {latestAssessment.ai_predicted_grade}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-[#F7F8FA] border border-[#E5E7EB]">
                  <span className="text-[10px] text-[#64748B] block font-semibold">Affected Foot</span>
                  <span className="font-semibold text-[#202938] mt-0.5 block">{latestAssessment.affected_foot || 'Right'} Foot</span>
                </div>
                <div className="p-3 rounded-lg bg-[#F7F8FA] border border-[#E5E7EB]">
                  <span className="text-[10px] text-[#64748B] block font-semibold">Current Ulcer Area</span>
                  <span className="font-semibold text-[#8B1538] mt-0.5 block">{latestAssessment.wound_area_cm2 || '3.8'} cm²</span>
                </div>
                <div className="p-3 rounded-lg bg-[#F7F8FA] border border-[#E5E7EB]">
                  <span className="text-[10px] text-[#64748B] block font-semibold">Latest HbA1c</span>
                  <span className="font-semibold text-[#202938] mt-0.5 block">{patientSession.hba1c_current}%</span>
                </div>
                <div className="p-3 rounded-lg bg-[#F7F8FA] border border-[#E5E7EB]">
                  <span className="text-[10px] text-[#64748B] block font-semibold">Healing Trajectory</span>
                  <span className="font-semibold text-[#13866A] mt-0.5 flex items-center gap-0.5">
                    <TrendingDown className="w-3.5 h-3.5" /> -32% Area
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-[#F7F8FA] border border-[#E5E7EB] text-xs">
                <span className="font-bold text-[#8B1538] block mb-1">Attending Clinician's Directives:</span>
                <p className="text-[#202938] leading-relaxed">
                  {latestAssessment.doctor_clinical_notes || 
                    "Wagner Grade 2-3 neuropathic plantar ulcer. Debridement completed. Healthy pink granulation tissue forming. Continue total contact cast offloading."}
                </p>
              </div>
            </div>

            {/* Longitudinal Healing Curve Chart */}
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 shadow-sm space-y-3.5">
              <div className="flex items-center justify-between pb-2 border-b border-[#E5E7EB]">
                <div>
                  <h2 className="text-xs font-bold text-[#202938] uppercase tracking-wider flex items-center gap-1.5">
                    <TrendingDown className="w-4 h-4 text-[#13866A]" />
                    Ulcer Area Reduction Trajectory (Healing Curve)
                  </h2>
                  <p className="text-[11px] text-[#64748B] mt-0.5">
                    Weekly wound surface area measurement in cm² showing continuous tissue closure
                  </p>
                </div>
                <span className="text-[10px] font-semibold text-[#13866A] bg-[#13866A]/10 px-2.5 py-0.5 rounded-md border border-[#13866A]/20">
                  Target: Complete Closure
                </span>
              </div>

              <div className="h-56 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={healingProgressData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="patientHealingGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8B1538" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="#8B1538" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="week" stroke="#64748B" fontSize={11} tickLine={false} />
                    <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#202938', color: '#FFFFFF', borderRadius: '8px', fontSize: '11px', border: 'none' }} />
                    <Area type="monotone" dataKey="area" name="Wound Area (cm²)" stroke="#8B1538" strokeWidth={2.5} fill="url(#patientHealingGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="flex justify-between items-center text-xs text-[#64748B] pt-2 border-t border-[#E5E7EB]">
                <span>Starting Area: <strong className="text-[#202938]">5.6 cm²</strong></span>
                <span className="text-[#13866A] font-semibold">Net Reduction: 1.8 cm² healed (32.1%)</span>
                <span>Target: <strong className="text-[#202938]">&lt; 0.5 cm²</strong></span>
              </div>
            </div>

            {/* Medical Consultation Summary Card */}
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 shadow-sm flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-[#8B1538]">Official Medical Consultation Report</h3>
                <p className="text-[11px] text-[#64748B] mt-0.5">
                  Signed and stamped with digital hospital QR verification by {patientSession.doctor?.full_name}
                </p>
              </div>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-[#8B1538] hover:bg-[#650D28] text-white text-xs font-semibold rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Official PDF</span>
              </button>
            </div>

          </div>

          {/* Right Column: Doctor's Orders & Emergency Contacts */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Upcoming Appointment Card */}
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 shadow-sm space-y-3">
              <div className="text-xs font-bold text-[#202938] uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-[#E5E7EB]">
                <Calendar className="w-4 h-4 text-[#D99124]" />
                <span>Next Scheduled Clinic Visit</span>
              </div>

              <div className="p-3.5 rounded-lg bg-[#F7F8FA] border border-[#E5E7EB] space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#202938]">Wound Dressing & Debridement</span>
                  <span className="text-[10px] font-semibold text-[#D99124] bg-[#D99124]/10 px-2 py-0.5 rounded-md border border-[#D99124]/20">Confirmed</span>
                </div>
                <div className="text-[11px] text-[#64748B] space-y-1">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#8B1538]" />
                    <span>Thursday, 28th Nov 2026 at 10:30 AM</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Stethoscope className="w-3.5 h-3.5 text-[#8B1538]" />
                    <span>{patientSession.doctor?.full_name} • Limb Salvage OPD</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Doctor's Daily Treatment & Home-Care Protocol */}
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 shadow-sm space-y-3">
              <div className="text-xs font-bold text-[#202938] uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-[#E5E7EB]">
                <Pill className="w-4 h-4 text-[#8B1538]" />
                <span>Doctor's Daily Care Orders</span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-lg bg-[#13866A]/5 border border-[#13866A]/20 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#13866A] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[#202938] block">1. Offloading Protection:</strong>
                    <span className="text-[11px] text-[#64748B] leading-tight block">Wear your prescribed total contact cast or pneumatic boot at all times when standing. Do not walk barefoot under any circumstance.</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-[#D99124]/5 border border-[#D99124]/20 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#D99124] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[#202938] block">2. Daily Dressing Protocol:</strong>
                    <span className="text-[11px] text-[#64748B] leading-tight block">Cleanse ulcer with sterile normal saline; apply hydrogel/silver alginate dressing as prescribed. Keep dry during bathing.</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-[#F7F8FA] border border-[#E5E7EB] flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#8B1538] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[#202938] block">3. Blood Sugar Target:</strong>
                    <span className="text-[11px] text-[#64748B] leading-tight block">Maintain fasting blood glucose below 110 mg/dL and post-prandial glucose below 140 mg/dL to accelerate vascular healing.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Red-Flag Emergency Guidance */}
            <div className="bg-red-50/50 rounded-xl border border-red-200 p-5 shadow-sm space-y-3">
              <div className="text-xs font-bold text-[#D94848] uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-[#D94848]" />
                <span>When to Call Doctor Immediately</span>
              </div>

              <p className="text-[11px] text-[#64748B] leading-relaxed">
                Contact your limb preservation team immediately if you observe any of the following warning signs:
              </p>

              <ul className="text-xs text-[#D94848] space-y-1 pl-5 list-disc font-medium">
                <li>Spreading redness expanding &gt; 2 cm from ulcer edge</li>
                <li>Fever above 100.4°F (38°C) or sudden chills</li>
                <li>Foul odor or sudden heavy yellow/green drainage</li>
                <li>Dark or black tissue appearing around toes</li>
              </ul>

              <div className="pt-2 border-t border-red-200 flex items-center justify-between">
                <span className="text-xs font-semibold text-[#202938]">24/7 Helpline:</span>
                <span className="font-mono text-xs font-bold text-[#8B1538] bg-white px-2.5 py-1 rounded-md border border-red-200">
                  1800-DFU-CARE (Toll-Free)
                </span>
              </div>
            </div>

          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-[#E5E7EB] py-4 text-xs text-[#64748B]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <strong className="text-[#8B1538]">DFU-AI Health Systems</strong> • Indian Diabetic Limb Salvage Portal
          </div>
          <div className="text-[11px] font-mono">
            Encrypted Patient Session • All India Institute of Diabetic Care
          </div>
        </div>
      </footer>

    </div>
  );
};
