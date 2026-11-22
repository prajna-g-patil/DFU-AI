import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  User, 
  AlertTriangle, 
  Calendar, 
  Clock, 
  ShieldCheck, 
  Sparkles, 
  Stethoscope, 
  ChevronRight,
  FileText,
  Activity,
  CheckCircle2,
  RefreshCw,
  PhoneCall
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface PatientRecord {
  id: number;
  name: string;
  mrn: string;
  age: number;
  gender: string;
  doctor: string;
  specialty: string;
  wagnerGrade: number;
  ulcerLocation: string;
  woundArea: string;
  hba1c: string;
  offloading: string;
  dressing: string;
  antibiotics: string;
  nextAppt: string;
  emergencySigns: string[];
}

const INDIAN_PATIENTS: PatientRecord[] = [
  {
    id: 1,
    name: 'Rameshwar Prasad Gupta',
    mrn: 'AIIDC-2024-8492',
    age: 64,
    gender: 'Male',
    doctor: 'Dr. Rajesh Sharma, MS, MCh, FACS',
    specialty: 'Chief of Diabetic Foot Surgery & Limb Salvage',
    wagnerGrade: 2,
    ulcerLocation: 'Plantar - 1st Metatarsal Head (Right Foot)',
    woundArea: '3.8 cm²',
    hba1c: '8.8%',
    offloading: 'Removable Rigid Cast Walker (RCW) with plantar aperture cutout',
    dressing: 'Silver-impregnated Hydrofiber Foam Dressing every 48 hours',
    antibiotics: 'Tab Amoxicillin-Clavulanate 625mg BD (Day 3 of 7)',
    nextAppt: 'Wednesday, 25 Nov 2026 at 11:00 AM (Room 208, Clinic Wing B)',
    emergencySigns: [
      'Redness spreading beyond 2 cm from wound margin (cellulitis)',
      'Foul odor or thick yellowish/green purulent discharge',
      'Body temperature above 100.4°F (38°C) or severe chills',
      'Sudden localized swelling or deep throbbing pain in the foot'
    ]
  },
  {
    id: 2,
    name: 'Sunita Devi Sharma',
    mrn: 'AIIDC-2024-3392',
    age: 58,
    gender: 'Female',
    doctor: 'Dr. Priya Patel, MD, CWS',
    specialty: 'Senior Consultant Diabetologist & Wound Care',
    wagnerGrade: 1,
    ulcerLocation: 'Plantar Heel - Medial Aspect (Left Foot)',
    woundArea: '1.2 cm²',
    hba1c: '7.5%',
    offloading: 'Cushioned therapeutic diabetic insole with silicone heel cup',
    dressing: 'Hydrocolloid dressing with border changed every 72 hours',
    antibiotics: 'No active systemic antibiotics required (clean granulating bed)',
    nextAppt: 'Friday, 27 Nov 2026 at 02:30 PM (OPD Suite 4)',
    emergencySigns: [
      'New blister or skin breakdown around heel margin',
      'Fever or unexpected sharp increase in blood glucose (> 250 mg/dL)',
      'Warmth or dark discoloration extending up the Achilles tendon'
    ]
  },
  {
    id: 3,
    name: 'Vikramaditya Singhania',
    mrn: 'AIIDC-2024-6037',
    age: 71,
    gender: 'Male',
    doctor: 'Dr. Rajesh Sharma, MS, MCh, FACS',
    specialty: 'Chief of Diabetic Foot Surgery & Limb Salvage',
    wagnerGrade: 4,
    ulcerLocation: 'Distal Hallux (Right Great Toe) - Focal Necrosis',
    woundArea: '8.2 cm²',
    hba1c: '10.2%',
    offloading: 'Strict non-weight bearing (Wheelchair & Crutches)',
    dressing: 'Dry povidone-iodine gauze with daily surgical inspection',
    antibiotics: 'IV Piperacillin-Tazobactam in Daycare Infusion Unit',
    nextAppt: 'Tomorrow, 22 Nov 2026 at 09:30 AM (Emergency Surgical Review, OR 2C)',
    emergencySigns: [
      'Blackish discoloration spreading to adjacent 2nd toe',
      'Crepitus (crackling feeling under skin) or severe foot edema',
      'Confusion, rapid breathing, or signs of systemic sepsis'
    ]
  },
  {
    id: 4,
    name: 'Harish Chandra Verma',
    mrn: 'APOLLO-RMH-6512',
    age: 61,
    gender: 'Male',
    doctor: 'Dr. K. S. Narayanan Iyer, DPM, FACFAS',
    specialty: 'Podiatric Biomechanist & Reconstructive Surgeon',
    wagnerGrade: 2,
    ulcerLocation: 'Plantar - 3rd Metatarsal Base (Left Foot)',
    woundArea: '4.1 cm²',
    hba1c: '8.7%',
    offloading: 'Custom molded rocker-bottom orthotic shoe',
    dressing: 'Calcium alginate packing with secondary absorbent pad',
    antibiotics: 'Tab Cefuroxime Axetil 500mg BD for 10 days',
    nextAppt: 'Monday, 30 Nov 2026 at 10:15 AM (Biomechanics Lab)',
    emergencySigns: [
      'Increased serous drainage soaking through bandage in < 12 hours',
      'Loss of sensation or numbness moving into the ankle',
      'Fever > 100°F or persistent nausea'
    ]
  }
];

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
  isImportant?: boolean;
}

export const ChatbotView: React.FC = () => {
  const { doctor } = useAuth();
  const [selectedPatient, setSelectedPatient] = useState<PatientRecord>(INDIAN_PATIENTS[0]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'bot',
      text: `Namaste. I am your DFU-AI Clinical Assistant for ${selectedPatient.name} (MRN: ${selectedPatient.mrn}), supervised by ${selectedPatient.doctor}. I have your verified electronic health record open. How can I guide you with your wound care, dressing, or recovery instructions today?`,
      timestamp: 'Just now'
    }
  ]);

  // When patient selection changes, reset greeting tailored to that patient
  const handleSelectPatient = (p: PatientRecord) => {
    setSelectedPatient(p);
    setMessages([
      {
        id: 'm-init',
        sender: 'bot',
        text: `Active Patient Switched to ${p.name} (MRN: ${p.mrn}). Diagnosed with Wagner Grade ${p.wagnerGrade} ulcer at ${p.ulcerLocation}. Attending Specialist: ${p.doctor}. How may I help you regarding this patient's clinical plan?`,
        timestamp: 'Just now'
      }
    ]);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const quickPrompts = [
    `What is ${selectedPatient.name.split(' ')[0]}'s current ulcer status?`,
    'How often should the wound dressing be changed?',
    'Can the patient walk without an offloading device?',
    `When is the next appointment with ${selectedPatient.doctor.split(',')[0]}?`,
    'What are the emergency red-flag warning signs?'
  ];

  const handleSendMessage = (textToSend?: string) => {
    const query = (textToSend || inputMessage).trim();
    if (!query) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');
    setIsTyping(true);

    setTimeout(() => {
      const botResponse = generateClinicalResponse(query, selectedPatient);
      setMessages((prev) => [
        ...prev,
        {
          id: `b-${Date.now()}`,
          sender: 'bot',
          text: botResponse.text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isImportant: botResponse.isImportant
        }
      ]);
      setIsTyping(false);
    }, 600);
  };

  function generateClinicalResponse(query: string, p: PatientRecord): { text: string; isImportant?: boolean } {
    const q = query.toLowerCase();

    if (q.includes('wagner') || q.includes('grade') || q.includes('status') || q.includes('ulcer') || q.includes('condition')) {
      return {
        text: `${p.name}'s current clinical diagnosis is **Wagner Grade ${p.wagnerGrade}** located at **${p.ulcerLocation}**, measuring **${p.woundArea}**. 
\n• **Clinical Staging:** ${
          p.wagnerGrade === 1 
            ? 'Superficial diabetic ulcer without tendon or capsule penetration. Clean healing trajectory.' 
            : p.wagnerGrade === 2 
            ? 'Deep ulcer extending into tendon or joint capsule without osteomyelitis/abscess. Active healing under debridement.' 
            : p.wagnerGrade === 3 
            ? 'Deep ulcer complicated by osteitis, abscess formation, or deep tissue tracking.' 
            : 'Focal necrosis/gangrene of the digital digits. High risk of amputation requiring immediate salvage intervention.'
        }
\n• **Latest HbA1c:** ${p.hba1c} (Target: < 7.0% for optimal tissue granulation).
\n• **Primary Specialist:** ${p.doctor}.`,
        isImportant: false
      };
    }

    if (q.includes('dressing') || q.includes('bandage') || q.includes('clean') || q.includes('wash') || q.includes('change')) {
      return {
        text: `**Dressing Protocol for ${p.name}:**
\n1. **Prescribed Protocol:** ${p.dressing}.
\n2. **Technique:**
• Clean the peri-wound skin with normal sterile saline (0.9% NaCl). Avoid harsh antiseptic solutions like Betadine directly on clean granulating tissue unless advised by ${p.doctor.split(',')[0]}.
• Apply the prescribed dressing gently without excessive tension.
• Keep the outer bandage completely dry. If the dressing becomes soaked or soiled before the scheduled change, replace it promptly.`,
        isImportant: false
      };
    }

    if (q.includes('walk') || q.includes('pressure') || q.includes('boot') || q.includes('offload') || q.includes('weight')) {
      return {
        text: `**CRITICAL OFFLOADING DIRECTIVE:**
\n${p.name} must adhere strictly to: **${p.offloading}**.
\n• **Walking Guidance:** ${
          p.wagnerGrade >= 3 
            ? 'NO direct weight-bearing permitted on the affected limb. Crutches or a wheelchair must be used at all times to prevent mechanical shear and bone penetration.' 
            : 'Do NOT take even a few steps barefoot or in regular slippers. Peak plantar pressure on the metatarsal head causes rapid tissue maceration and prevents microvascular blood flow.'
        }
\n• Always wear the prescribed offloading device whenever putting the foot down.`,
        isImportant: true
      };
    }

    if (q.includes('appointment') || q.includes('next') || q.includes('doctor') || q.includes('sharma') || q.includes('patel') || q.includes('visit') || q.includes('when')) {
      return {
        text: `**Upcoming Clinical Consultation:**
\n• **Scheduled Date & Time:** ${p.nextAppt}
\n• **Attending Specialist:** ${p.doctor} (${p.specialty})
\n• **Preparation:** Please bring your current fasting blood sugar log, HbA1c report, and do not remove the dressing at home prior to arrival (it will be inspected and changed in the clinical triage room).`,
        isImportant: false
      };
    }

    if (q.includes('emergency') || q.includes('warning') || q.includes('danger') || q.includes('fever') || q.includes('red') || q.includes('pain') || q.includes('smell')) {
      return {
        text: `**EMERGENCY WARNING SIGNS FOR ${p.name.toUpperCase()}:**
\nIf you or the patient notice any of the following, do not wait for the scheduled appointment. Seek emergency hospital triage immediately:
\n${p.emergencySigns.map((sign, idx) => `${idx + 1}. **${sign}**`).join('\n')}
\n• **AIIDC Diabetic Emergency Helpline:** +91 (011) 2658-8500 / Ext. 4410
• **Ambulance:** 102 / 108`,
        isImportant: true
      };
    }

    if (q.includes('medicine') || q.includes('antibiotic') || q.includes('drug') || q.includes('tablet')) {
      return {
        text: `**Current Medication Regimen for ${p.name}:**
\n• **Antimicrobial:** ${p.antibiotics}
\n• **Compliance Note:** Please complete the full prescribed course. Do not skip doses even if local wound appearance improves, as sub-clinical bone contamination in diabetes can relapse rapidly.`,
        isImportant: false
      };
    }

    // Default contextual assistance
    return {
      text: `Regarding ${p.name} (MRN: ${p.mrn}):
\nAccording to the hospital clinical registry under ${p.doctor}, the patient is currently on **Wagner Grade ${p.wagnerGrade}** management with **${p.offloading}**.
\nNext scheduled clinical visit is on **${p.nextAppt}**.
\nFeel free to ask about specific dressing procedures, offloading rules, glycemic targets, or warning symptoms!`,
      isImportant: false
    };
  }

  return (
    <div className="max-w-[1520px] mx-auto space-y-5">
      
      {/* Top Banner: Patient Selector & Clinical Header */}
      <div className="bg-white rounded-lg border border-[#E2D9CF] p-4 sm:p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Left: Patient Badge & Active Doctor */}
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-lg bg-[#1C1E20] text-white flex items-center justify-center shrink-0 border border-[#2D3135]">
            <Bot className="w-5 h-5 text-[#F7B955]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base sm:text-lg font-bold text-[#1C1E20]">
                Diabetic Patient Clinical Chatbot
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#FDF1DC] text-[#1C1E20] border border-[#F7B955]/40">
                AIIDC Live Record
              </span>
            </div>
            <p className="text-xs text-[#6A6E73]">
              Real-time clinical intelligence grounded in the patient's verified electronic medical record.
            </p>
          </div>
        </div>

        {/* Right: Quick Patient Switcher Dropdown */}
        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-[#6A6E73] whitespace-nowrap">Active Patient:</span>
          <select
            value={selectedPatient.id}
            onChange={(e) => {
              const p = INDIAN_PATIENTS.find(pt => pt.id === Number(e.target.value));
              if (p) handleSelectPatient(p);
            }}
            className="bg-[#FAF7F4] border border-[#E2D9CF] text-xs font-bold text-[#1C1E20] rounded-md px-3 py-2 focus:outline-none focus:border-[#F7B955] transition-colors cursor-pointer"
          >
            {INDIAN_PATIENTS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} (Grade {p.wagnerGrade} • {p.mrn})
              </option>
            ))}
          </select>
        </div>

      </div>

      {/* Main Two-Column Chatbot Layout: Left Clinical Profile + Right Interactive Chat */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* Left Column (4 cols): Active Patient's Verified Medical Record Summary */}
        <div className="lg:col-span-4 bg-white rounded-lg border border-[#E2D9CF] p-5 shadow-sm space-y-4">
          
          <div className="flex items-center justify-between border-b border-[#E2D9CF] pb-3">
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#6A6E73] flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-[#F7B955]" />
              Verified Electronic Chart
            </span>
            <span className="text-[10px] font-mono font-bold text-[#8E8B88]">
              {selectedPatient.mrn}
            </span>
          </div>

          {/* Patient Core Demographics */}
          <div className="space-y-1">
            <h2 className="text-base font-bold text-[#1C1E20]">{selectedPatient.name}</h2>
            <p className="text-xs text-[#6A6E73]">
              {selectedPatient.gender}, {selectedPatient.age} years old • Type 2 Diabetes
            </p>
          </div>

          {/* Staging & Severity Indicator */}
          <div className="p-3 rounded-md bg-[#FAF7F4] border border-[#E2D9CF] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#6A6E73] font-semibold">Wagner Classification:</span>
              <span className={`text-xs font-extrabold px-2 py-0.5 rounded border ${
                selectedPatient.wagnerGrade === 1 
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : selectedPatient.wagnerGrade === 2
                  ? 'bg-amber-50 text-amber-800 border-amber-300'
                  : 'bg-rose-50 text-rose-800 border-rose-300'
              }`}>
                Grade {selectedPatient.wagnerGrade}
              </span>
            </div>

            <div className="text-[11px] text-[#1C1E20] space-y-1 pt-1 border-t border-[#E2D9CF]/60">
              <div className="flex justify-between">
                <span className="text-[#6A6E73]">Anatomical Location:</span>
                <span className="font-semibold text-right max-w-[180px] truncate">{selectedPatient.ulcerLocation}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6A6E73]">Current Wound Area:</span>
                <span className="font-semibold">{selectedPatient.woundArea}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6A6E73]">Current HbA1c:</span>
                <span className="font-semibold text-[#DC2626]">{selectedPatient.hba1c}</span>
              </div>
            </div>
          </div>

          {/* Attending Doctor */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[11px] font-bold text-[#6A6E73] uppercase tracking-wider block">
              Attending Specialist
            </span>
            <div className="p-2.5 rounded-md bg-[#FAF7F4] border border-[#E2D9CF] flex items-center space-x-2.5">
              <div className="w-7 h-7 rounded-md bg-[#1C1E20] text-white flex items-center justify-center font-bold text-xs shrink-0">
                Dr
              </div>
              <div>
                <p className="text-xs font-bold text-[#1C1E20]">{selectedPatient.doctor}</p>
                <p className="text-[10px] text-[#6A6E73]">{selectedPatient.specialty}</p>
              </div>
            </div>
          </div>

          {/* Prescriptions Summary */}
          <div className="space-y-2 text-xs">
            <span className="text-[11px] font-bold text-[#6A6E73] uppercase tracking-wider block">
              Active Prescriptions
            </span>
            <div className="p-2.5 rounded-md bg-[#FAF7F4] border border-[#E2D9CF] space-y-1.5">
              <div>
                <span className="text-[10px] font-bold text-[#6A6E73] block">Offloading Device:</span>
                <span className="font-semibold text-[#1C1E20] text-[11px]">{selectedPatient.offloading}</span>
              </div>
              <div className="pt-1 border-t border-[#E2D9CF]/60">
                <span className="text-[10px] font-bold text-[#6A6E73] block">Dressing Regimen:</span>
                <span className="font-semibold text-[#1C1E20] text-[11px]">{selectedPatient.dressing}</span>
              </div>
              <div className="pt-1 border-t border-[#E2D9CF]/60">
                <span className="text-[10px] font-bold text-[#6A6E73] block">Systemic Medication:</span>
                <span className="font-semibold text-[#1C1E20] text-[11px]">{selectedPatient.antibiotics}</span>
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="p-3 rounded-md bg-rose-50 border border-rose-200 text-xs text-rose-900 space-y-1">
            <p className="font-bold flex items-center gap-1.5 text-rose-800">
              <PhoneCall className="w-3.5 h-3.5" />
              Hospital Emergency Helplines
            </p>
            <p className="text-[11px] text-rose-700">
              AIIDC Limb Salvage ER: 011-2658-8500 (Ext. 4410)
            </p>
          </div>

        </div>

        {/* Right Column (8 cols): Real-Time Interactive Conversation Stream */}
        <div className="lg:col-span-8 bg-white rounded-lg border border-[#E2D9CF] shadow-sm flex flex-col h-[680px]">
          
          {/* Chat Header Bar */}
          <div className="p-4 border-b border-[#E2D9CF] flex items-center justify-between bg-[#FAF7F4] rounded-t-lg">
            <div className="flex items-center space-x-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <div>
                <span className="text-xs font-bold text-[#1C1E20] block">
                  AI Clinical Consultation Engine
                </span>
                <span className="text-[10px] text-[#6A6E73]">
                  Supervised by {selectedPatient.doctor}
                </span>
              </div>
            </div>

            <button
              onClick={() => handleSelectPatient(selectedPatient)}
              className="text-xs text-[#6A6E73] hover:text-[#1C1E20] flex items-center gap-1 font-semibold"
              title="Reset conversation"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%] rounded-lg p-3.5 text-xs leading-relaxed space-y-1.5 ${
                  msg.sender === 'user'
                    ? 'bg-[#1C1E20] text-white'
                    : msg.isImportant
                    ? 'bg-rose-50 border border-rose-200 text-rose-950'
                    : 'bg-[#FAF7F4] border border-[#E2D9CF] text-[#1C1E20]'
                }`}>
                  <div className="flex items-center justify-between gap-3 text-[10px] opacity-75 font-semibold">
                    <span>{msg.sender === 'user' ? 'You (Clinician / Patient)' : 'DFU-AI Clinical Assistant'}</span>
                    <span>{msg.timestamp}</span>
                  </div>

                  <div className="whitespace-pre-line font-normal">
                    {msg.text}
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-[#FAF7F4] border border-[#E2D9CF] rounded-lg p-3 text-xs flex items-center space-x-2 text-[#6A6E73]">
                  <div className="w-2 h-2 rounded-full bg-[#F7B955] animate-bounce" />
                  <div className="w-2 h-2 rounded-full bg-[#F7B955] animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 rounded-full bg-[#F7B955] animate-bounce [animation-delay:0.4s]" />
                  <span className="text-[11px] font-medium ml-1">Analyzing patient electronic chart...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Quick Prompt Chips */}
          <div className="px-4 py-2 bg-[#FAF7F4] border-t border-[#E2D9CF] flex items-center gap-2 overflow-x-auto">
            <span className="text-[10px] font-bold text-[#6A6E73] uppercase tracking-wider shrink-0">
              Suggested:
            </span>
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(prompt)}
                className="shrink-0 text-[11px] font-semibold px-2.5 py-1 rounded bg-white hover:bg-[#FDF1DC] border border-[#E2D9CF] text-[#1C1E20] transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Message Input Box */}
          <div className="p-3.5 border-t border-[#E2D9CF] bg-white rounded-b-lg">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center space-x-2"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={`Ask about ${selectedPatient.name.split(' ')[0]}'s ulcer grade, dressing, walking restrictions...`}
                className="flex-1 bg-[#FAF7F4] border border-[#E2D9CF] rounded-md px-3.5 py-2.5 text-xs text-[#1C1E20] placeholder-[#8E8B88] focus:outline-none focus:border-[#F7B955] transition-colors"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isTyping}
                className="px-4 py-2.5 rounded-md bg-[#1C1E20] hover:bg-black text-white text-xs font-bold transition-all disabled:opacity-40 flex items-center space-x-1.5 shrink-0"
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5 text-[#F7B955]" />
              </button>
            </form>
          </div>

        </div>

      </div>

    </div>
  );
};
