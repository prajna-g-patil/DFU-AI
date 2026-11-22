import React, { useEffect, useState } from 'react';
import { 
  Search, 
  Bell, 
  ChevronDown, 
  MoreHorizontal, 
  Briefcase, 
  Stethoscope, 
  Heart, 
  User, 
  ArrowUpRight, 
  ArrowDownRight,
  PlusCircle,
  FileText,
  Activity,
  Calendar,
  Layers,
  Sparkles,
  ExternalLink,
  Bot
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
import { DashboardAnalytics, Patient, Assessment } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { DfuLogo } from '../components/DfuLogo';

interface DashboardProps {
  onNavigate: (tab: string, assessmentId?: number) => void;
  onOpenNewPatient: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate, onOpenNewPatient }) => {
  const { doctor, logout } = useAuth();
  const [data, setData] = useState<DashboardAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  // Time switchers matching the design (clean rectangular controls)
  const [statTimeRange, setStatTimeRange] = useState<'week' | 'month' | 'year'>('week');
  const [newPatientTimeRange, setNewPatientTimeRange] = useState<'today' | 'week' | 'month'>('week');
  const [scheduleRange, setScheduleRange] = useState<'today' | 'week'>('today');

  // Search input state
  const [searchQuery, setSearchQuery] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await api.getDashboardAnalytics();
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-8 h-8 border-2 border-[#F7B955] border-t-[#1C1E20] rounded-md animate-spin" />
          <span className="text-xs font-semibold text-[#6A6E73] tracking-wider uppercase">
            Loading DFU-AI Clinical Dashboard...
          </span>
        </div>
      </div>
    );
  }

  // 7-day trajectory chart data
  const chartData = [
    { day: 'Mon', male: 2.1, female: 1.2 },
    { day: 'Tue', male: 4.8, female: 2.5 },
    { day: 'Wed', male: 3.2, female: 2.0 },
    { day: 'Thu', male: 5.6, female: 4.2 },
    { day: 'Fri', male: 4.0, female: 3.1 },
    { day: 'Sat', male: 4.8, female: 2.8 },
    { day: 'Sun', male: 3.5, female: 1.8 },
  ];

  // Verified Indian Patient Directory Roster
  const indianPatientsList = [
    {
      id: 1,
      name: 'Rameshwar Prasad Gupta',
      genderAge: 'Male, 64 yrs',
      grade: 'Wagner Grade 2',
      mrn: 'AIIDC-2024-8492',
      initials: 'RG'
    },
    {
      id: 2,
      name: 'Sunita Devi Sharma',
      genderAge: 'Female, 58 yrs',
      grade: 'Wagner Grade 1',
      mrn: 'AIIDC-2024-3392',
      initials: 'SS'
    },
    {
      id: 3,
      name: 'Vikramaditya Singhania',
      genderAge: 'Male, 71 yrs',
      grade: 'Wagner Grade 4',
      mrn: 'AIIDC-2024-6037',
      initials: 'VS'
    },
    {
      id: 4,
      name: 'Harish Chandra Verma',
      genderAge: 'Male, 61 yrs',
      grade: 'Wagner Grade 2',
      mrn: 'APOLLO-RMH-6512',
      initials: 'HV'
    },
    {
      id: 5,
      name: 'Anita Desai',
      genderAge: 'Female, 59 yrs',
      grade: 'Wagner Grade 3',
      mrn: 'APOLLO-RMH-7721',
      initials: 'AD'
    }
  ];

  return (
    <div className="space-y-5 max-w-[1520px] mx-auto">
      
      {/* =========================================================================
          TOP BAR: Search Box + Notification Button + Doctor Profile
          (Using clean hospital geometric border-radius: rounded-md/rounded-lg)
          ========================================================================= */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        
        {/* Search Bar (Clean Hospital Rectangular Field) */}
        <div className="flex-1 max-w-xl relative">
          <Search className="w-4 h-4 text-[#8E8B88] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search patients by Indian name, MRN, phone, or anatomical site..."
            className="w-full bg-white rounded-md py-2.5 pl-10 pr-4 text-xs font-medium text-[#1C1E20] placeholder-[#8E8B88] shadow-sm border border-[#E2D9CF] focus:outline-none focus:border-[#F7B955] transition-all"
          />
        </div>

        {/* Right Section: Notification Circle & Profile Box */}
        <div className="flex items-center justify-end space-x-2.5">
          
          {/* Quick Chatbot Trigger Button */}
          <button
            onClick={() => onNavigate('chats')}
            className="px-3 py-2 rounded-md bg-[#1C1E20] hover:bg-black text-white text-xs font-semibold shadow-sm flex items-center space-x-1.5 transition-all"
          >
            <Bot className="w-3.5 h-3.5 text-[#F7B955]" />
            <span className="hidden sm:inline">Patient Chatbot</span>
          </button>

          {/* Notifications Button */}
          <div className="relative">
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="w-9 h-9 rounded-md bg-white border border-[#E2D9CF] text-[#1C1E20] shadow-sm flex items-center justify-center hover:bg-sand-50 transition-all focus:outline-none"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-[#F7B955]" />
            </button>

            {/* Notification Dropdown */}
            {notifOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-md shadow-lg border border-[#E2D9CF] p-3 z-50 space-y-2">
                <div className="flex items-center justify-between border-b border-[#E2D9CF] pb-2">
                  <span className="text-xs font-bold text-[#1C1E20]">Clinical Alerts</span>
                  <span className="text-[10px] text-[#8E8B88]">3 New</span>
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="p-2 rounded bg-[#FDF1DC] text-[#1C1E20] border border-[#F7B955]/30">
                    <p className="font-bold">Wagner Grade 4 Triage</p>
                    <p className="text-[11px] text-[#6A6E73]">Vikramaditya Singhania requires urgent surgical debridement review.</p>
                  </div>
                  <div className="p-2 rounded bg-sand-50 text-[#1C1E20] border border-[#E2D9CF]">
                    <p className="font-bold">OR Slot Confirmed</p>
                    <p className="text-[11px] text-[#6A6E73]">OR Prep Suite 2C reserved for Dr. Rajesh Sharma at 01:00 PM.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Doctor Profile Header */}
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="bg-white rounded-md px-3 py-1.5 flex items-center space-x-2.5 shadow-sm hover:bg-sand-50 transition-all border border-[#E2D9CF]"
            >
              <div className="w-7 h-7 rounded-md bg-[#1C1E20] text-white flex items-center justify-center text-xs font-bold">
                RS
              </div>
              <div className="text-left hidden sm:block">
                <span className="text-xs font-bold text-[#1C1E20] block leading-tight">
                  {doctor?.full_name || 'Dr. Rajesh Sharma, MS, MCh'}
                </span>
                <span className="text-[10px] text-[#6A6E73] font-medium block leading-tight">
                  {doctor?.specialty || 'Chief Podiatric Surgeon'}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#8E8B88]" />
            </button>

            {/* Profile Menu Dropdown */}
            {profileOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg border border-[#E2D9CF] p-3 z-50 space-y-2">
                <div>
                  <p className="text-xs font-bold text-[#1C1E20]">{doctor?.full_name || 'Dr. Rajesh Sharma'}</p>
                  <p className="text-[11px] text-[#6A6E73]">{doctor?.email || 'dr.sharma@dfu-ai.med'}</p>
                  <p className="text-[10px] text-[#8E8B88] mt-1 font-mono">{doctor?.hospital || 'All India Institute of Diabetic Care (AIIDC)'}</p>
                </div>
                <div className="pt-2 border-t border-[#E2D9CF] space-y-1">
                  <button
                    onClick={() => { onNavigate('model-guide'); setProfileOpen(false); }}
                    className="w-full text-left text-xs font-semibold py-1.5 text-[#1C1E20] hover:text-[#F7B955]"
                  >
                    AI Architecture & Metrics
                  </button>
                  <button
                    onClick={logout}
                    className="w-full text-left text-xs font-semibold py-1.5 text-rose-600 hover:text-rose-700"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* =========================================================================
          MAIN 2-COLUMN VIEWPORT: Center Content (Cols 1-8) + Right Schedule (Cols 9-12)
          (Using clean hospital geometric border-radius: rounded-lg/rounded-md)
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* =====================================================================
            CENTER COLUMN (Approx 66% width on desktop)
            ===================================================================== */}
        <div className="lg:col-span-8 space-y-5">

          {/* 1. Statistics Container (rounded-lg border border-[#E2D9CF]) */}
          <div className="bg-white rounded-lg p-5 shadow-sm space-y-4 border border-[#E2D9CF]">
            
            {/* Header: Title + Week/Month/Year Switcher */}
            <div className="flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-bold text-[#1C1E20] font-display">
                Clinical Overview Statistics
              </h2>

              <div className="bg-sand-100 rounded-md p-0.5 flex items-center border border-[#E2D9CF]">
                {(['week', 'month', 'year'] as const).map((range) => (
                  <button
                    key={range}
                    onClick={() => setStatTimeRange(range)}
                    className={`px-3 py-1 text-xs font-semibold rounded-sm capitalize transition-all ${
                      statTimeRange === range
                        ? 'bg-[#1C1E20] text-white'
                        : 'text-[#6A6E73] hover:text-[#1C1E20]'
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>

            {/* 4 KPI Cards Grid (rounded-md, realistic enterprise geometry) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              
              {/* Card 1: Golden Amber Highlighted Card */}
              <div 
                onClick={() => onNavigate('assessments')}
                className="bg-[#F7B955] rounded-md p-4 flex flex-col justify-between shadow-sm border border-[#EAA73B] hover:shadow transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl sm:text-3xl font-extrabold text-[#1C1E20] font-display">
                    {data.high_risk_cases || 8}
                  </span>
                  <span className="bg-white/90 text-[#1C1E20] text-[10px] font-bold px-1.5 py-0.5 rounded shadow-xs">
                    +2
                  </span>
                </div>
                <div className="mt-3">
                  <span className="text-xs font-bold text-[#1C1E20] block">
                    High-Risk Cases (G3/G4)
                  </span>
                </div>
              </div>

              {/* Card 2: White Card Total Patients */}
              <div 
                onClick={() => onNavigate('patients')}
                className="bg-white rounded-md p-4 border border-[#E2D9CF] flex flex-col justify-between shadow-xs hover:border-[#F7B955] transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl sm:text-3xl font-extrabold text-[#1C1E20] font-display">
                    {data.total_patients || 42}
                  </span>
                  <span className="bg-sand-50 text-[#1C1E20] text-[10px] font-bold px-1.5 py-0.5 rounded border border-[#E2D9CF]">
                    ↑ 5
                  </span>
                </div>
                <div className="mt-3">
                  <span className="text-xs font-semibold text-[#6A6E73] block">
                    Total Indian Patients
                  </span>
                </div>
              </div>

              {/* Card 3: White Card Time to appt. / Latency */}
              <div className="bg-white rounded-md p-4 border border-[#E2D9CF] flex flex-col justify-between shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-baseline space-x-1">
                    <span className="text-2xl sm:text-3xl font-extrabold text-[#1C1E20] font-display">
                      14.2
                    </span>
                    <span className="text-xs font-bold text-[#8E8B88]">ms</span>
                  </div>
                  <span className="bg-sand-50 text-[#1C1E20] text-[10px] font-bold px-1.5 py-0.5 rounded border border-[#E2D9CF]">
                    MobileNet
                  </span>
                </div>
                <div className="mt-3">
                  <span className="text-xs font-semibold text-[#6A6E73] block">
                    Inference Latency
                  </span>
                </div>
              </div>

              {/* Card 4: White Card PSS / Healing Rate */}
              <div className="bg-white rounded-md p-4 border border-[#E2D9CF] flex flex-col justify-between shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-2xl sm:text-3xl font-extrabold text-[#1C1E20] font-display">
                    93.2%
                  </span>
                  <span className="bg-sand-50 text-[#1C1E20] text-[10px] font-bold px-1.5 py-0.5 rounded border border-[#E2D9CF]">
                    ↑ 1.4%
                  </span>
                </div>
                <div className="mt-3">
                  <span className="text-xs font-semibold text-[#6A6E73] block">
                    Clinical Accuracy
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* 2. Diagnoses Container (Wagner Ulcer Distribution) */}
          <div className="bg-white rounded-lg p-5 shadow-sm space-y-5 border border-[#E2D9CF]">
            
            {/* Header: Title + Descending order */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-[#1C1E20] font-display">
                  Wagner Ulcer Staging & Diagnoses
                </h2>
                <p className="text-xs text-[#6A6E73]">
                  Stratified classification across clinical cohort (N=2,000 cases)
                </p>
              </div>

              <span className="text-xs text-[#6A6E73] font-semibold flex items-center space-x-1">
                <span>Cohort Breakdown</span>
              </span>
            </div>

            {/* Diagnoses Visualization: Left Vertical Bars + Right Category List */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end pt-1">
              
              {/* Left Side: 6 Vertical Bars with Percentages on top (Clean rectangular/subtle rounded bars) */}
              <div className="md:col-span-7 flex items-end justify-between px-2 sm:px-4 h-40 border-b border-[#E2D9CF] pb-2">
                
                {/* Bar 1: 37% */}
                <div className="flex flex-col items-center space-y-1.5">
                  <span className="text-xs font-bold text-[#1C1E20]">37%</span>
                  <div className="w-7 h-28 rounded-t-sm bg-[#BFA896] hover:bg-[#AD9481] transition-all" />
                  <span className="text-[10px] font-bold text-[#6A6E73]">G1</span>
                </div>

                {/* Bar 2: 28% */}
                <div className="flex flex-col items-center space-y-1.5">
                  <span className="text-xs font-bold text-[#1C1E20]">28%</span>
                  <div className="w-7 h-22 rounded-t-sm bg-[#BFA896] hover:bg-[#AD9481] transition-all" />
                  <span className="text-[10px] font-bold text-[#6A6E73]">G2</span>
                </div>

                {/* Bar 3: 20% */}
                <div className="flex flex-col items-center space-y-1.5">
                  <span className="text-xs font-bold text-[#1C1E20]">20%</span>
                  <div className="w-7 h-16 rounded-t-sm bg-[#BFA896] hover:bg-[#AD9481] transition-all" />
                  <span className="text-[10px] font-bold text-[#6A6E73]">G3</span>
                </div>

                {/* Bar 4: 11% */}
                <div className="flex flex-col items-center space-y-1.5">
                  <span className="text-xs font-bold text-[#1C1E20]">11%</span>
                  <div className="w-7 h-9 rounded-t-sm bg-[#BFA896] hover:bg-[#AD9481] transition-all" />
                  <span className="text-[10px] font-bold text-[#6A6E73]">G4</span>
                </div>

                {/* Bar 5: 11% */}
                <div className="flex flex-col items-center space-y-1.5">
                  <span className="text-xs font-bold text-[#1C1E20]">11%</span>
                  <div className="w-7 h-9 rounded-t-sm bg-[#BFA896] hover:bg-[#AD9481] transition-all" />
                  <span className="text-[10px] font-bold text-[#6A6E73]">PVD</span>
                </div>

                {/* Bar 6: 6% */}
                <div className="flex flex-col items-center space-y-1.5">
                  <span className="text-xs font-bold text-[#8E8B88]">6%</span>
                  <div className="w-7 h-5 rounded-t-sm bg-[#EAE2DA] hover:bg-[#D6CCC1] transition-all" />
                  <span className="text-[10px] font-bold text-[#6A6E73]">Other</span>
                </div>

              </div>

              {/* Right Side: Categorical Breakdown list */}
              <div className="md:col-span-5 grid grid-cols-2 gap-x-3 gap-y-2 text-xs text-[#25282B] pb-1">
                <div className="flex items-center justify-between pr-2">
                  <span className="font-semibold text-[#1C1E20]">Grade 1 Superficial</span>
                  <span className="font-bold text-[#6A6E73]">37%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#1C1E20]">Neuropathy</span>
                  <span className="font-bold text-[#6A6E73]">11%</span>
                </div>

                <div className="flex items-center justify-between pr-2">
                  <span className="font-semibold text-[#1C1E20]">Grade 2 Deep Tendon</span>
                  <span className="font-bold text-[#6A6E73]">28%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#1C1E20]">Peripheral Vascular</span>
                  <span className="font-bold text-[#6A6E73]">9%</span>
                </div>

                <div className="flex items-center justify-between pr-2">
                  <span className="font-semibold text-[#1C1E20]">Grade 3 Osteitis</span>
                  <span className="font-bold text-[#6A6E73]">20%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#1C1E20]">Microvascular</span>
                  <span className="font-bold text-[#6A6E73]">6%</span>
                </div>

                <div className="flex items-center justify-between pr-2 col-span-2 pt-1 border-t border-[#E2D9CF]">
                  <span className="font-semibold text-[#1C1E20]">Grade 4 Gangrene / Limb Threat</span>
                  <span className="font-bold text-rose-600">11%</span>
                </div>
              </div>

            </div>

          </div>

          {/* 3. Bottom Row: 2 Cards Side-by-Side (New patients Area Chart + Patients List) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            
            {/* Bottom-Left Card: New Patients / Trajectory Curve */}
            <div className="md:col-span-7 bg-white rounded-lg p-5 shadow-sm space-y-4 border border-[#E2D9CF]">
              
              {/* Header: Title with Badge + Time Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm font-bold text-[#1C1E20] font-display">
                    Weekly Patient Intake Volume
                  </h3>
                  <span className="px-2 py-0.5 rounded bg-sand-100 border border-[#E2D9CF] text-[10px] font-bold text-[#1C1E20]">
                    3 New
                  </span>
                </div>

                <div className="bg-sand-100 rounded-md p-0.5 flex items-center border border-[#E2D9CF]">
                  {(['today', 'week', 'month'] as const).map((range) => (
                    <button
                      key={range}
                      onClick={() => setNewPatientTimeRange(range)}
                      className={`px-2.5 py-0.5 text-[11px] font-semibold rounded-sm capitalize transition-all ${
                        newPatientTimeRange === range
                          ? 'bg-[#1C1E20] text-white'
                          : 'text-[#6A6E73] hover:text-[#1C1E20]'
                      }`}
                    >
                      {range}
                    </button>
                  ))}
                </div>
              </div>

              {/* Smooth Dual-Line Area Chart */}
              <div className="h-44 w-full pt-1">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="amberGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#F7B955" stopOpacity={0.35}/>
                        <stop offset="95%" stopColor="#F7B955" stopOpacity={0.0}/>
                      </linearGradient>
                      <linearGradient id="taupeGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#BFA896" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#BFA896" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F2ECE4" />
                    <XAxis 
                      dataKey="day" 
                      tickLine={false} 
                      axisLine={false} 
                      tick={{ fill: '#8E8B88', fontSize: 11, fontWeight: 500 }} 
                    />
                    <YAxis 
                      tickLine={false} 
                      axisLine={false} 
                      tick={{ fill: '#8E8B88', fontSize: 11, fontWeight: 500 }} 
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#FFFFFF', 
                        borderRadius: '6px', 
                        border: '1px solid #E2D9CF',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                        fontSize: '11px',
                        fontWeight: 600
                      }} 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="male" 
                      stroke="#F7B955" 
                      strokeWidth={2} 
                      fillOpacity={1} 
                      fill="url(#amberGrad)" 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="female" 
                      stroke="#BFA896" 
                      strokeWidth={1.8} 
                      fillOpacity={1} 
                      fill="url(#taupeGrad)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Legend: Male & Female indicators */}
              <div className="flex items-center space-x-5 pt-1 text-xs text-[#6A6E73] font-semibold">
                <div className="flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-sm bg-[#F7B955]" />
                  <span>Male Cohort</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-sm bg-[#BFA896]" />
                  <span>Female Cohort</span>
                </div>
              </div>

            </div>

            {/* Bottom-Right Card: Indian Patients List */}
            <div className="md:col-span-5 bg-white rounded-lg p-5 shadow-sm space-y-4 border border-[#E2D9CF] flex flex-col justify-between">
              
              <div>
                {/* Header: Patients list title + Badge */}
                <div className="flex items-center justify-between pb-2 border-b border-[#E2D9CF]">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-sm font-bold text-[#1C1E20] font-display">
                      Registered Patients
                    </h3>
                    <span className="px-2 py-0.5 rounded bg-sand-100 border border-[#E2D9CF] text-[10px] font-bold text-[#1C1E20]">
                      5 Active
                    </span>
                  </div>

                  <button 
                    onClick={() => onNavigate('patients')}
                    className="text-xs text-[#6A6E73] font-semibold flex items-center space-x-1 hover:text-[#1C1E20] transition-colors"
                  >
                    <span>View All</span>
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* List of Indian Patients with Initials Badges */}
                <div className="space-y-2 pt-2.5">
                  {indianPatientsList.map((patient) => (
                    <div
                      key={patient.id}
                      onClick={() => onNavigate('patient-detail', patient.id)}
                      className="flex items-center justify-between p-2 rounded-md hover:bg-sand-50 border border-transparent hover:border-[#E2D9CF] transition-all cursor-pointer group"
                    >
                      <div className="flex items-center space-x-2.5">
                        <div className="w-7 h-7 rounded-md bg-[#1C1E20] text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                          {patient.initials}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#1C1E20] group-hover:text-[#EAA73B] transition-colors">
                            {patient.name}
                          </p>
                          <p className="text-[10px] text-[#6A6E73]">
                            {patient.genderAge} • <span className="font-medium text-[#1C1E20]">{patient.grade}</span>
                          </p>
                        </div>
                      </div>

                      <button 
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onNavigate('patient-detail', patient.id);
                        }}
                        className="p-1 text-[#8E8B88] hover:text-[#1C1E20] hover:bg-[#EAE2DA] rounded transition-colors"
                      >
                        <MoreHorizontal className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Enroll Patient Action (Crisp rounded-md) */}
              <div className="pt-2">
                <button
                  onClick={onOpenNewPatient}
                  className="w-full py-2.5 rounded-md bg-sand-100 hover:bg-[#EFE8E1] text-[#1C1E20] border border-[#E2D9CF] text-xs font-bold transition-colors flex items-center justify-center space-x-2"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-[#F7B955]" />
                  <span>Enroll New Patient Record</span>
                </button>
              </div>

            </div>

          </div>

        </div>

        {/* =====================================================================
            RIGHT COLUMN: Schedule Timeline Panel (Approx 34% width on desktop)
            (Using clean hospital geometric border-radius: rounded-lg/rounded-md)
            ===================================================================== */}
        <div className="lg:col-span-4 bg-white rounded-lg p-5 shadow-sm space-y-5 border border-[#E2D9CF]">
          
          {/* Header: Title + Today/This week Toggle */}
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold text-[#1C1E20] font-display">
              Clinical Shift Schedule
            </h2>

            <div className="bg-sand-100 rounded-md p-0.5 flex items-center border border-[#E2D9CF]">
              {(['today', 'this week'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setScheduleRange(range === 'today' ? 'today' : 'week')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-sm capitalize transition-all ${
                    (range === 'today' && scheduleRange === 'today') || (range === 'this week' && scheduleRange === 'week')
                      ? 'bg-[#1C1E20] text-white'
                      : 'text-[#6A6E73] hover:text-[#1C1E20]'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>

          {/* Subheader: Date + Shift Location */}
          <div className="flex items-center justify-between text-xs pb-1 border-b border-[#E2D9CF]">
            <span className="font-bold text-[#1C1E20]">
              Today, 21 Nov 2026
            </span>

            <span className="text-[#6A6E73] text-[11px] font-medium">
              OPD Wing & Daycare OR
            </span>
          </div>

          {/* Vertical Schedule Timeline (With Realistic Indian Patient Names & Clean Corners) */}
          <div className="space-y-3.5 pt-1">
            
            {/* Event 1: 11:00 AM - Highlighted Golden-Amber Card */}
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-[#6A6E73] block">11:00 AM</span>
              
              <div 
                onClick={() => onNavigate('new-assessment')}
                className="bg-[#F7B955] rounded-md p-3.5 text-[#1C1E20] space-y-2 shadow-xs border border-[#EAA73B] hover:shadow transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="w-6 h-6 rounded bg-[#1C1E20] text-white flex items-center justify-center font-bold text-xs">
                    VS
                  </div>
                  <span className="bg-white/90 text-[10px] font-bold px-2 py-0.5 rounded text-[#1C1E20] border border-white/50">
                    Urgent Triage
                  </span>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-[#1C1E20]">Vikramaditya Singhania</h4>
                  <p className="text-[11px] text-[#1C1E20]/80">Wagner Grade 4 • Room 310, Clinic Wing B</p>
                </div>

                <div className="w-fit bg-white/95 text-[#1C1E20] text-[10px] font-bold px-2 py-0.5 rounded">
                  11:00 AM - 11:30 AM
                </div>
              </div>
            </div>

            {/* Event 2: 11:30 AM - White Card Team daily planning */}
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-[#6A6E73] block">11:30 AM</span>
              
              <div className="bg-white rounded-md p-3.5 border border-[#E2D9CF] space-y-2 shadow-xs hover:bg-sand-50 transition-colors cursor-pointer">
                <div className="flex items-center space-x-2.5">
                  <div className="w-6 h-6 rounded bg-[#1C1E20] text-white flex items-center justify-center">
                    <Briefcase className="w-3.5 h-3.5 text-[#F7B955]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#1C1E20]">Diabetic Limb Salvage Clinical Board</h4>
                    <p className="text-[10px] text-[#6A6E73]">Dr. Rajesh Sharma, Dr. Priya Patel • Conf Room A2</p>
                  </div>
                </div>

                <div className="w-fit bg-sand-100 text-[#505459] text-[10px] font-bold px-2 py-0.5 rounded border border-[#E2D9CF]">
                  11:30 AM - 12:00 PM
                </div>
              </div>
            </div>

            {/* Current Time Indicator Line (11:50 AM) */}
            <div className="relative flex items-center py-1">
              <div className="w-2 h-2 rounded-full bg-[#1C1E20]" />
              <div className="flex-1 border-t border-dashed border-[#1C1E20]/40 ml-2" />
              <span className="text-[10px] font-bold text-[#1C1E20] bg-sand-100 px-2 py-0.5 rounded ml-2 border border-[#E2D9CF]">
                11:50 AM Current
              </span>
            </div>

            {/* Event 3: 01:00 PM - Warm Taupe / Clay Card Surgical Preparation */}
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-[#6A6E73] block">01:00 PM</span>
              
              <div className="bg-[#BFA896] text-white rounded-md p-3.5 space-y-2 shadow-xs hover:opacity-95 transition-opacity cursor-pointer">
                <div className="flex items-center space-x-2.5">
                  <div className="w-6 h-6 rounded bg-[#1C1E20] text-white flex items-center justify-center">
                    <Heart className="w-3.5 h-3.5 text-[#F7B955]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Surgical Sharp Debridement</h4>
                    <p className="text-[10px] text-white/90">Patient: Harish Chandra Verma • OR Suite 2C</p>
                  </div>
                </div>

                <div className="w-fit bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                  01:00 PM - 01:45 PM
                </div>
              </div>
            </div>

            {/* Event 4: 03:00 PM - White Card Rameshwar Prasad Gupta */}
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-[#6A6E73] block">03:00 PM</span>
              
              <div 
                onClick={() => onNavigate('patient-detail', 1)}
                className="bg-white rounded-md p-3.5 border border-[#E2D9CF] space-y-2 shadow-xs hover:bg-sand-50 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-6 h-6 rounded bg-[#1C1E20] text-white flex items-center justify-center">
                      <Stethoscope className="w-3.5 h-3.5 text-[#F7B955]" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#1C1E20]">Rameshwar Prasad Gupta</h4>
                      <p className="text-[10px] text-[#6A6E73]">Plantar Ulcer Follow-up • Room 208</p>
                    </div>
                  </div>

                  <span className="bg-sand-100 text-[#1C1E20] text-[10px] font-bold px-2 py-0.5 rounded border border-[#E2D9CF]">
                    Grade 2
                  </span>
                </div>

                <div className="w-fit bg-sand-100 text-[#505459] text-[10px] font-bold px-2 py-0.5 rounded border border-[#E2D9CF]">
                  03:00 PM - 03:30 PM
                </div>
              </div>
            </div>

          </div>

          {/* Quick Schedule Clinical Action (Crisp rounded-md) */}
          <div className="pt-2">
            <button
              onClick={() => onNavigate('new-assessment')}
              className="w-full py-2.5 rounded-md bg-[#1C1E20] hover:bg-black text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center space-x-2"
            >
              <PlusCircle className="w-3.5 h-3.5 text-[#F7B955]" />
              <span>Initiate New AI Ulcer Assessment</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
