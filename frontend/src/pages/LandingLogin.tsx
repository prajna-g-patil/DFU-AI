import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  User, 
  Stethoscope, 
  Building2, 
  Award, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  AlertCircle,
  PhoneCall,
  UserCircle2,
  Calendar,
  FileText,
  Activity,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { DfuLogo } from '../components/DfuLogo';

export const LandingLogin: React.FC = () => {
  const { login, loginDemo, register } = useAuth();
  
  const [activePortalTab, setActivePortalTab] = useState<'doctor' | 'patient'>('doctor');
  const [isRegister, setIsRegister] = useState(false);
  
  // Doctor form state
  const [email, setEmail] = useState('dr.sharma@dfu-ai.med');
  const [password, setPassword] = useState('doctor123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Registration fields
  const [fullName, setFullName] = useState('');
  const [specialty, setSpecialty] = useState('Podiatric Surgery & Limb Salvage');
  const [hospital, setHospital] = useState('All India Institute of Diabetic Care (AIIDC)');
  const [licenseNumber, setLicenseNumber] = useState('MCI-784920-DL');

  // Patient consultation form state
  const [patientName, setPatientName] = useState('Rameshwar Prasad Gupta');
  const [patientPhone, setPatientPhone] = useState('+91 98101 23456');
  const [patientMrn, setPatientMrn] = useState('AIIDC-2024-8492');
  const [selectedConsultingDoctor, setSelectedConsultingDoctor] = useState('Dr. Rajesh Sharma, MS, MCh, FACS (Podiatric Surgery)');
  const [consultationReason, setConsultationReason] = useState('Follow-up Wagner Grade 2 Plantar Ulcer Review & Offloading Inspection');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const indianDoctors = [
    {
      email: 'dr.sharma@dfu-ai.med',
      name: 'Dr. Rajesh Sharma, MS, MCh, FACS',
      specialty: 'Chief of Diabetic Foot Surgery & Limb Salvage',
      department: 'Dept. of Podiatric Surgery',
      initials: 'RS'
    },
    {
      email: 'dr.patel@dfu-ai.med',
      name: 'Dr. Priya Patel, MD, CWS',
      specialty: 'Senior Consultant Diabetologist & Wound Care',
      department: 'Dept. of Endocrinology & Diabetology',
      initials: 'PP'
    },
    {
      email: 'dr.iyer@dfu-ai.med',
      name: 'Dr. K. S. Narayanan Iyer, DPM, FACFAS',
      specialty: 'Podiatric Biomechanist & Reconstructive Surgeon',
      department: 'Dept. of Biomechanics & Foot Orthotics',
      initials: 'NI'
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (activePortalTab === 'patient') {
        // Patient portal log in using primary demo doctor for viewer session
        await login('dr.sharma@dfu-ai.med', 'doctor123');
        return;
      }

      if (isRegister) {
        await register({
          email: email.trim(),
          password,
          full_name: fullName.trim(),
          specialty,
          hospital,
          license_number: licenseNumber
        });
      } else {
        await login(email.trim(), password);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDoctorClick = (docEmail: string) => {
    setEmail(docEmail);
    setPassword('doctor123');
    setError(null);
    loginDemo(docEmail).catch((err) => {
      setError(err.message || 'Quick login failed');
    });
  };

  return (
    <div className="min-h-screen bg-[#F6F0EA] flex flex-col justify-between text-[#25282B] selection:bg-[#F7B955]/30">
      
      {/* 1. Hospital Header Bar */}
      <header className="bg-white border-b border-[#E2D9CF] py-4 px-4 sm:px-8 shadow-xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <DfuLogo size="md" showSubtitle={true} />
          
          <div className="flex items-center space-x-2 text-xs font-semibold text-[#6A6E73]">
            <span className="hidden sm:inline">Clinical Network:</span>
            <span className="px-2.5 py-1 rounded bg-sand-100 text-[#1C1E20] border border-[#E2D9CF] font-bold">
              AIIDC Delhi & Network Hospitals
            </span>
          </div>
        </div>
      </header>

      {/* 2. Centered Focused Hospital Sign-In Container (Properly Sized & Perfectly Centered in Middle) */}
      <main className="flex-1 flex items-center justify-center py-10 sm:py-16 px-4 sm:px-6">
        <div className="max-w-2xl sm:max-w-3xl w-full bg-white rounded-lg border border-[#E2D9CF] shadow-card p-7 sm:p-11 space-y-7">
          
          {/* Header & Portal Switcher */}
          <div className="space-y-4">
            
            <div className="text-center space-y-1.5">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded bg-[#FDF1DC] text-[#1C1E20] border border-[#F7B955]/40 text-xs font-bold uppercase tracking-wider mb-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#F7B955]" />
                <span>Verified Clinical Healthcare Access</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1C1E20] font-display">
                Hospital Clinical Access Portal
              </h1>
              <p className="text-xs sm:text-sm text-[#6A6E73] max-w-lg mx-auto">
                AI-Powered Diabetic Foot Ulcer Staging, Limb Salvage & Patient Tele-Triage
              </p>
            </div>

            {/* Clean Rectangular Tabs (Comfortable Height & Text) */}
            <div className="grid grid-cols-2 p-1.5 bg-sand-100 rounded-md border border-[#E2D9CF]">
              <button
                type="button"
                onClick={() => { setActivePortalTab('doctor'); setError(null); }}
                className={`py-2.5 sm:py-3 text-xs sm:text-sm font-bold rounded-sm transition-all ${
                  activePortalTab === 'doctor'
                    ? 'bg-[#1C1E20] text-white shadow-xs'
                    : 'text-[#6A6E73] hover:text-[#1C1E20]'
                }`}
              >
                Doctor / Clinical Staff Sign In
              </button>
              <button
                type="button"
                onClick={() => { setActivePortalTab('patient'); setError(null); }}
                className={`py-2.5 sm:py-3 text-xs sm:text-sm font-bold rounded-sm transition-all ${
                  activePortalTab === 'patient'
                    ? 'bg-[#1C1E20] text-white shadow-xs'
                    : 'text-[#6A6E73] hover:text-[#1C1E20]'
                }`}
              >
                Patient Consultation Access
              </button>
            </div>

          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-rose-50 border border-rose-200 p-3.5 rounded-md flex items-start space-x-2.5 text-xs text-rose-800">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span className="font-semibold">{error}</span>
            </div>
          )}

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {activePortalTab === 'doctor' ? (
              <>
                {/* DOCTOR LOGIN TAB */}
                {isRegister ? (
                  <>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#1C1E20] mb-1.5">
                        Doctor Full Name (with Degrees)
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Dr. Rajesh Sharma, MS, MCh, FACS"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full px-4 py-3 text-xs sm:text-sm bg-sand-50 border border-[#E2D9CF] rounded-md text-[#1C1E20] focus:outline-none focus:border-[#F7B955]"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#1C1E20] mb-1.5">
                          Clinical Specialty
                        </label>
                        <input
                          type="text"
                          required
                          value={specialty}
                          onChange={(e) => setSpecialty(e.target.value)}
                          className="w-full px-4 py-3 text-xs sm:text-sm bg-sand-50 border border-[#E2D9CF] rounded-md text-[#1C1E20] focus:outline-none focus:border-[#F7B955]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#1C1E20] mb-1.5">
                          MCI Registration No.
                        </label>
                        <input
                          type="text"
                          required
                          value={licenseNumber}
                          onChange={(e) => setLicenseNumber(e.target.value)}
                          className="w-full px-4 py-3 text-xs sm:text-sm bg-sand-50 border border-[#E2D9CF] rounded-md text-[#1C1E20] focus:outline-none focus:border-[#F7B955]"
                        />
                      </div>
                    </div>
                  </>
                ) : null}

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#1C1E20] mb-1.5">
                    Institutional Medical Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#8E8B88] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="dr.sharma@dfu-ai.med"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 text-xs sm:text-sm bg-sand-50 border border-[#E2D9CF] rounded-md text-[#1C1E20] focus:outline-none focus:border-[#F7B955]"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#1C1E20]">
                      Password
                    </label>
                    {!isRegister && (
                      <span className="text-xs text-[#6A6E73]">
                        Default demo password: <strong className="text-[#1C1E20]">doctor123</strong>
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#8E8B88] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-3 text-xs sm:text-sm bg-sand-50 border border-[#E2D9CF] rounded-md text-[#1C1E20] focus:outline-none focus:border-[#F7B955]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-1 text-[#8E8B88] hover:text-[#1C1E20] absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Primary Sign In Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-md bg-[#1C1E20] hover:bg-black text-white text-xs sm:text-sm font-bold transition-all shadow-sm flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-[#F7B955] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>{isRegister ? 'Register Clinician Profile' : 'Sign In as Doctor'}</span>
                      <ArrowRight className="w-4 h-4 text-[#F7B955]" />
                    </>
                  )}
                </button>

                {/* 1-Click Indian Doctor Quick Access */}
                {!isRegister && (
                  <div className="pt-4 border-t border-[#E2D9CF] space-y-2.5">
                    <span className="text-[11px] font-bold text-[#6A6E73] uppercase tracking-wider block">
                      Quick Institutional Doctor Access:
                    </span>
                    <div className="space-y-2">
                      {indianDoctors.map((doc, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleQuickDoctorClick(doc.email)}
                          className="w-full p-3 rounded-md bg-sand-50 hover:bg-[#FDF1DC] border border-[#E2D9CF] hover:border-[#F7B955] flex items-center justify-between text-left transition-colors group"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded bg-[#1C1E20] text-white flex items-center justify-center text-xs font-bold">
                              {doc.initials}
                            </div>
                            <div>
                              <p className="text-xs sm:text-sm font-bold text-[#1C1E20]">{doc.name}</p>
                              <p className="text-[11px] text-[#6A6E73]">{doc.specialty}</p>
                            </div>
                          </div>
                          <span className="text-xs font-bold text-[#1C1E20] group-hover:text-[#F7B955] transition-colors">
                            Sign In →
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                {/* PATIENT CONSULTATION ACCESS TAB */}
                <div className="p-4 rounded-md bg-[#FDF1DC] border border-[#F7B955]/40 text-xs sm:text-sm text-[#1C1E20] space-y-1">
                  <p className="font-bold flex items-center gap-2 text-[#1C1E20]">
                    <ShieldCheck className="w-4 h-4 text-[#1C1E20]" />
                    Diabetic Patient Consultation & Tele-Monitoring Access
                  </p>
                  <p className="text-xs text-[#6A6E73] leading-relaxed">
                    View your active wound recovery trajectory, upload follow-up foot photographs, and directly communicate with your assigned clinical specialist.
                  </p>
                </div>

                {/* Patient Name */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#1C1E20] mb-1.5">
                    Patient Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#8E8B88] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="Rameshwar Prasad Gupta"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 text-xs sm:text-sm bg-sand-50 border border-[#E2D9CF] rounded-md text-[#1C1E20] focus:outline-none focus:border-[#F7B955]"
                    />
                  </div>
                </div>

                {/* Contact Phone & MRN */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#1C1E20] mb-1.5">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98101 23456"
                      value={patientPhone}
                      onChange={(e) => setPatientPhone(e.target.value)}
                      className="w-full px-4 py-3 text-xs sm:text-sm bg-sand-50 border border-[#E2D9CF] rounded-md text-[#1C1E20] focus:outline-none focus:border-[#F7B955]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#1C1E20] mb-1.5">
                      Patient MRN / ID
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="AIIDC-2024-8492"
                      value={patientMrn}
                      onChange={(e) => setPatientMrn(e.target.value)}
                      className="w-full px-4 py-3 text-xs sm:text-sm bg-sand-50 border border-[#E2D9CF] rounded-md text-[#1C1E20] focus:outline-none focus:border-[#F7B955] font-mono"
                    />
                  </div>
                </div>

                {/* WHICH DOCTOR DO YOU WANT TO CONSULT? */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#1C1E20] mb-1.5 flex items-center justify-between">
                    <span>Which doctor do you want to consult?</span>
                    <span className="text-[11px] text-amber-700 font-bold lowercase">* required</span>
                  </label>
                  <select
                    value={selectedConsultingDoctor}
                    onChange={(e) => setSelectedConsultingDoctor(e.target.value)}
                    className="w-full px-4 py-3 text-xs sm:text-sm bg-sand-50 border border-[#E2D9CF] rounded-md text-[#1C1E20] font-semibold focus:outline-none focus:border-[#F7B955] cursor-pointer"
                  >
                    <option value="Dr. Rajesh Sharma, MS, MCh, FACS (Podiatric Surgery)">
                      Dr. Rajesh Sharma, MS, MCh, FACS — Chief of Diabetic Foot Surgery & Limb Salvage
                    </option>
                    <option value="Dr. Priya Patel, MD, CWS (Diabetology)">
                      Dr. Priya Patel, MD, CWS — Senior Consultant Diabetologist & Advanced Wound Care
                    </option>
                    <option value="Dr. K. S. Narayanan Iyer, DPM, FACFAS (Biomechanics)">
                      Dr. K. S. Narayanan Iyer, DPM, FACFAS — Podiatric Biomechanist & Reconstructive Surgeon
                    </option>
                    <option value="Dr. Venkat Reddy, MS (Ortho) (Orthopedics)">
                      Dr. Venkat Reddy, MS (Ortho) — Consultant Orthopedic Diabetic Limb Salvage Specialist
                    </option>
                  </select>
                </div>

                {/* Reason for Consultation */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#1C1E20] mb-1.5">
                    Reason for Consultation / Ulcer Condition
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Follow-up Wagner Grade 2 review, offloading evaluation, dressing check"
                    value={consultationReason}
                    onChange={(e) => setConsultationReason(e.target.value)}
                    className="w-full px-4 py-3 text-xs sm:text-sm bg-sand-50 border border-[#E2D9CF] rounded-md text-[#1C1E20] focus:outline-none focus:border-[#F7B955]"
                  />
                </div>

                {/* Enter Patient Portal Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-md bg-[#1C1E20] hover:bg-black text-white text-xs sm:text-sm font-bold transition-all shadow-sm flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-[#F7B955] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Enter Patient Consultation Portal</span>
                      <ArrowRight className="w-4 h-4 text-[#F7B955]" />
                    </>
                  )}
                </button>
              </>
            )}

          </form>

        </div>
      </main>

      {/* 3. Hospital Footer */}
      <footer className="bg-white border-t border-[#E2D9CF] py-4 px-4 text-xs text-[#6A6E73]">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-bold text-[#1C1E20]">DFU-AI Clinical Decision-Support Network</span>
            <span>•</span>
            <span>All India Institute of Diabetic Care (AIIDC)</span>
          </div>
          <div className="text-[11px] text-[#8E8B88]">
            IWGDF 2023 Compliant • 256-Bit TLS Healthcare Security
          </div>
        </div>
      </footer>

    </div>
  );
};
