import React, { useState, useRef, useEffect } from 'react';
import { 
  Activity, 
  Users, 
  PlusCircle, 
  FileText, 
  Cpu, 
  LogOut, 
  Stethoscope, 
  ChevronDown, 
  Bell, 
  CheckCircle2, 
  AlertTriangle,
  Menu,
  X,
  FileCheck2,
  ShieldCheck,
  Building2,
  FolderOpen
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab }) => {
  const { doctor, logout } = useAuth();

  // Dropdown states
  const [triageDropdownOpen, setTriageDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Refs for clicking outside
  const triageRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (triageRef.current && !triageRef.current.contains(event.target as Node)) {
        setTriageDropdownOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const isTriageActive = currentTab === 'new-assessment' || currentTab === 'assessments' || currentTab === 'assessment-detail';
  const isPatientActive = currentTab === 'patients' || currentTab === 'patient-detail';

  return (
    <header className="bg-white border-b border-[#E5E7EB] sticky top-0 z-40 shadow-sm">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Left: Brand Identity & Subtitle */}
          <div 
            onClick={() => { setCurrentTab('dashboard'); setMobileMenuOpen(false); }}
            className="flex items-center space-x-3 cursor-pointer group select-none"
          >
            <div className="w-9 h-9 rounded-lg bg-[#1C1E20] flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold tracking-tight text-[#202938] font-display">
                  DFU-AI <span className="text-[#1C1E20]">HEALTH</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-[#FDF1DC] text-[#1C1E20] border border-[#E2D9CF]">
                  Clinical
                </span>
              </div>
              <p className="text-[10px] text-[#64748B] font-medium leading-none hidden sm:block">
                Clinical Intelligence & Limb Salvage
              </p>
            </div>
          </div>

          {/* Center: Desktop Navigation Bar with Functional Dropdowns */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            
            {/* 1. Dashboard */}
            <button
              onClick={() => setCurrentTab('dashboard')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                currentTab === 'dashboard'
                  ? 'bg-[#FDF1DC] text-[#1C1E20] border border-[#E2D9CF]'
                  : 'text-[#64748B] hover:text-[#202938] hover:bg-[#F7F8FA]'
              }`}
            >
              Dashboard
            </button>

            {/* 2. Clinical Triage (Dropdown) */}
            <div className="relative" ref={triageRef}>
              <button
                type="button"
                onClick={() => setTriageDropdownOpen(!triageDropdownOpen)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  isTriageActive
                    ? 'bg-[#FDF1DC] text-[#1C1E20] border border-[#E2D9CF]'
                    : 'text-[#64748B] hover:text-[#202938] hover:bg-[#F7F8FA]'
                }`}
              >
                <span>Clinical Triage</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${triageDropdownOpen ? 'rotate-180 text-[#1C1E20]' : ''}`} />
              </button>

              {/* Triage Dropdown Menu */}
              {triageDropdownOpen && (
                <div className="absolute left-0 mt-2 w-64 bg-white rounded-lg border border-[#E5E7EB] shadow-card py-2 z-50 animate-in fade-in slide-in-from-top-1">
                  <div className="px-3 py-1.5 text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">
                    Ulcer Assessment Workflows
                  </div>
                  
                  <button
                    onClick={() => {
                      setCurrentTab('new-assessment');
                      setTriageDropdownOpen(false);
                    }}
                    className="w-full px-3.5 py-2.5 text-left flex items-start space-x-2.5 hover:bg-[#FDF1DC] group transition-colors"
                  >
                    <PlusCircle className="w-4 h-4 text-[#1C1E20] shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold text-[#202938] group-hover:text-[#1C1E20]">
                        New AI Assessment
                      </div>
                      <div className="text-[11px] text-[#64748B]">
                        Image upload, Wagner grading & Grad-CAM
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setCurrentTab('assessments');
                      setTriageDropdownOpen(false);
                    }}
                    className="w-full px-3.5 py-2.5 text-left flex items-start space-x-2.5 hover:bg-[#F7F8FA] group transition-colors"
                  >
                    <FileText className="w-4 h-4 text-[#64748B] shrink-0 mt-0.5 group-hover:text-[#202938]" />
                    <div>
                      <div className="text-xs font-semibold text-[#202938]">
                        Assessment Audit Log
                      </div>
                      <div className="text-[11px] text-[#64748B]">
                        Review all past staged cases & doctor sign-offs
                      </div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* 3. Patient Registry */}
            <button
              onClick={() => setCurrentTab('patients')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                isPatientActive
                  ? 'bg-[#FDF1DC] text-[#1C1E20] border border-[#E2D9CF]'
                  : 'text-[#64748B] hover:text-[#202938] hover:bg-[#F7F8FA]'
              }`}
            >
              Patient Registry
            </button>

            {/* 4. AI & Collaboration */}
            <button
              onClick={() => setCurrentTab('model-guide')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                currentTab === 'model-guide'
                  ? 'bg-[#FDF1DC] text-[#1C1E20] border border-[#E2D9CF]'
                  : 'text-[#64748B] hover:text-[#202938] hover:bg-[#F7F8FA]'
              }`}
            >
              AI & Collaboration
            </button>

            {/* 5. Clinical Reports (Direct shortcut to audit/report summary) */}
            <button
              onClick={() => setCurrentTab('assessments')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                currentTab === 'assessments'
                  ? 'bg-[#FDF1DC] text-[#1C1E20] border border-[#E2D9CF]'
                  : 'text-[#64748B] hover:text-[#202938] hover:bg-[#F7F8FA]'
              }`}
            >
              Clinical Reports
            </button>

          </nav>

          {/* Right: Engine Status, Notifications, Doctor Profile */}
          <div className="flex items-center space-x-3">
            
            {/* Live Inference Engine Status Badge */}
            <div className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-[#F0FDF4] border border-[#BBF7D0] text-[11px] font-medium text-[#13866A]">
              <span className="w-2 h-2 rounded-full bg-[#13866A] animate-pulse" />
              <span>Engine Active</span>
            </div>

            {/* Notifications Menu */}
            <div className="relative" ref={notifRef}>
              <button
                type="button"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 rounded-md text-[#64748B] hover:text-[#202938] hover:bg-[#F7F8FA] border border-[#E5E7EB] transition-colors"
                aria-label="View notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#D94848]" />
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg border border-[#E5E7EB] shadow-card py-2 z-50 animate-in fade-in">
                  <div className="px-4 py-2 border-b border-[#E5E7EB] flex items-center justify-between">
                    <span className="text-xs font-bold text-[#202938]">Clinical Alerts</span>
                    <span className="text-[10px] font-semibold text-[#1C1E20] bg-[#FDF1DC] px-1.5 py-0.5 rounded">
                      2 Unresolved
                    </span>
                  </div>

                  <div className="divide-y divide-[#E5E7EB] max-h-72 overflow-y-auto">
                    <div className="p-3 hover:bg-[#F7F8FA] cursor-pointer flex items-start space-x-2.5">
                      <AlertTriangle className="w-4 h-4 text-[#D94848] shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold text-[#202938]">Wagner Grade 4 Alert</p>
                        <p className="text-[11px] text-[#64748B]">Patient Arthur Pendelton requires surgical vascular consult.</p>
                        <span className="text-[10px] text-[#94A3B8]">12 mins ago</span>
                      </div>
                    </div>

                    <div className="p-3 hover:bg-[#F7F8FA] cursor-pointer flex items-start space-x-2.5">
                      <CheckCircle2 className="w-4 h-4 text-[#13866A] shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold text-[#202938]">Model Benchmark Synced</p>
                        <p className="text-[11px] text-[#64748B]">MobileNetV2 weights evaluated against 5 baseline models.</p>
                        <span className="text-[10px] text-[#94A3B8]">1 hour ago</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Doctor Profile & Dropdown */}
            {doctor && (
              <div className="relative" ref={profileRef}>
                <button
                  type="button"
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center space-x-2.5 pl-2 py-1 pr-1.5 rounded-md hover:bg-[#F7F8FA] border border-transparent hover:border-[#E5E7EB] transition-all"
                >
                  <div className="w-8 h-8 rounded-full bg-[#1C1E20] text-white font-bold flex items-center justify-center text-xs shadow-sm">
                    {doctor.full_name ? doctor.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2) : 'MD'}
                  </div>
                  
                  <div className="hidden xl:block text-left">
                    <div className="text-xs font-bold text-[#202938] leading-tight">
                      {doctor.full_name}
                    </div>
                    <div className="text-[10px] text-[#64748B] font-medium truncate max-w-[140px]">
                      {doctor.specialty || 'Attending Clinician'}
                    </div>
                  </div>

                  <ChevronDown className={`w-3.5 h-3.5 text-[#64748B] transition-transform ${profileDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Profile Dropdown Menu */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg border border-[#E5E7EB] shadow-card py-2 z-50 animate-in fade-in">
                    
                    <div className="px-4 py-2.5 border-b border-[#E5E7EB]">
                      <p className="text-xs font-bold text-[#202938]">{doctor.full_name}</p>
                      <p className="text-[11px] text-[#1C1E20] font-semibold">{doctor.specialty}</p>
                      <div className="mt-1 flex items-center gap-1 text-[10px] text-[#64748B]">
                        <Building2 className="w-3 h-3 text-[#94A3B8]" />
                        <span className="truncate">{doctor.hospital || 'Hospital Health Network'}</span>
                      </div>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          setCurrentTab('dashboard');
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left text-xs text-[#202938] hover:bg-[#F7F8FA] flex items-center space-x-2"
                      >
                        <Activity className="w-3.5 h-3.5 text-[#64748B]" />
                        <span>Clinical Dashboard</span>
                      </button>

                      <button
                        onClick={() => {
                          setCurrentTab('model-guide');
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left text-xs text-[#202938] hover:bg-[#F7F8FA] flex items-center space-x-2"
                      >
                        <Cpu className="w-3.5 h-3.5 text-[#64748B]" />
                        <span>Model Architecture Specs</span>
                      </button>
                    </div>

                    <div className="border-t border-[#E5E7EB] pt-1">
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          logout();
                        }}
                        className="w-full px-4 py-2 text-left text-xs font-semibold text-[#D94848] hover:bg-[#FEF2F2] flex items-center space-x-2"
                      >
                        <LogOut className="w-3.5 h-3.5 text-[#D94848]" />
                        <span>Sign Out of Session</span>
                      </button>
                    </div>

                  </div>
                )}
              </div>
            )}

            {/* Mobile Hamburger Menu Toggle */}
            <div className="flex md:hidden">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-md text-[#64748B] hover:text-[#202938] hover:bg-[#F7F8FA]"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>

          </div>

        </div>
      </div>

      {/* Mobile Collapsible Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#E5E7EB] bg-white px-4 pt-2 pb-4 space-y-1">
          <button
            onClick={() => { setCurrentTab('dashboard'); setMobileMenuOpen(false); }}
            className={`w-full text-left px-3 py-2 rounded-md text-xs font-semibold ${
              currentTab === 'dashboard' ? 'bg-[#FDF1DC] text-[#1C1E20]' : 'text-[#64748B]'
            }`}
          >
            Dashboard
          </button>
          
          <button
            onClick={() => { setCurrentTab('new-assessment'); setMobileMenuOpen(false); }}
            className={`w-full text-left px-3 py-2 rounded-md text-xs font-semibold ${
              currentTab === 'new-assessment' ? 'bg-[#FDF1DC] text-[#1C1E20]' : 'text-[#64748B]'
            }`}
          >
            + New AI Assessment
          </button>

          <button
            onClick={() => { setCurrentTab('assessments'); setMobileMenuOpen(false); }}
            className={`w-full text-left px-3 py-2 rounded-md text-xs font-semibold ${
              currentTab === 'assessments' ? 'bg-[#FDF1DC] text-[#1C1E20]' : 'text-[#64748B]'
            }`}
          >
            Assessment Audit Log
          </button>

          <button
            onClick={() => { setCurrentTab('patients'); setMobileMenuOpen(false); }}
            className={`w-full text-left px-3 py-2 rounded-md text-xs font-semibold ${
              currentTab === 'patients' ? 'bg-[#FDF1DC] text-[#1C1E20]' : 'text-[#64748B]'
            }`}
          >
            Patient Registry
          </button>

          <button
            onClick={() => { setCurrentTab('model-guide'); setMobileMenuOpen(false); }}
            className={`w-full text-left px-3 py-2 rounded-md text-xs font-semibold ${
              currentTab === 'model-guide' ? 'bg-[#FDF1DC] text-[#1C1E20]' : 'text-[#64748B]'
            }`}
          >
            AI & Collaboration
          </button>

          <div className="border-t border-[#E5E7EB] pt-2 mt-2">
            <button
              onClick={() => { setMobileMenuOpen(false); logout(); }}
              className="w-full text-left px-3 py-2 text-xs font-semibold text-[#D94848] flex items-center space-x-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
