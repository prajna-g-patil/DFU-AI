import React from 'react';
import { 
  LayoutDashboard, 
  Calendar, 
  BarChart2, 
  Users, 
  FileText, 
  MessageSquare, 
  Settings, 
  LogOut, 
  ChevronsLeft,
  ChevronsRight,
  Bot
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { DfuLogo } from './DfuLogo';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const { logout } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'new-assessment', label: 'Clinical Triage', icon: Calendar },
    { id: 'assessments', label: 'Audit Registry', icon: BarChart2 },
    { id: 'patients', label: 'Patient Directory', icon: Users },
    { id: 'chats', label: 'Patient Chatbot', icon: Bot },
    { id: 'model-guide', label: 'AI Architecture', icon: FileText },
  ];

  return (
    <aside 
      className={`${
        isCollapsed ? 'w-20 px-2' : 'w-64 px-4'
      } shrink-0 flex flex-col justify-between py-5 bg-[#F6F0EA] border-r border-[#E2D9CF] min-h-screen select-none transition-all duration-200 z-30`}
    >
      
      {/* Top Brand Header */}
      <div className="space-y-6">
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between px-1'}`}>
          <div 
            onClick={() => setCurrentTab('dashboard')}
            className="cursor-pointer group"
          >
            {isCollapsed ? (
              <div className="w-9 h-9 rounded-md bg-[#1C1E20] flex items-center justify-center text-[#F7B955] font-bold text-xs">
                DFU
              </div>
            ) : (
              <DfuLogo size="sm" showSubtitle={true} />
            )}
          </div>

          <button 
            type="button" 
            onClick={onToggleCollapse}
            className={`p-1.5 rounded-md text-[#6A6E73] hover:text-[#1C1E20] hover:bg-[#EAE2DA] transition-colors ${
              isCollapsed ? 'hidden' : 'block'
            }`}
            title="Collapse sidebar"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>
        </div>

        {isCollapsed && (
          <div className="flex justify-center">
            <button
              type="button"
              onClick={onToggleCollapse}
              className="p-1.5 rounded-md text-[#6A6E73] hover:text-[#1C1E20] hover:bg-[#EAE2DA] transition-colors"
              title="Expand sidebar"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Primary Navigation Items - Realistic Enterprise Hospital Styling (rounded-md, not oversized pills) */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id || 
              (item.id === 'assessments' && currentTab === 'assessment-detail') ||
              (item.id === 'patients' && currentTab === 'patient-detail');

            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                title={isCollapsed ? item.label : undefined}
                className={`w-full flex items-center ${
                  isCollapsed ? 'justify-center px-0' : 'space-x-3 px-3'
                } py-2.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-white text-[#1C1E20] shadow-sm border border-[#E2D9CF] font-bold'
                    : 'text-[#505459] hover:text-[#1C1E20] hover:bg-[#EDE5DC]'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#1C1E20]' : 'text-[#7A7E83]'}`} />
                {!isCollapsed && <span>{item.label}</span>}
                {!isCollapsed && item.id === 'chats' && (
                  <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#FDF1DC] text-[#1C1E20] border border-[#F7B955]/40">
                    Live
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Settings & Logout */}
      <div className="pt-4 border-t border-[#E2D9CF] space-y-1">
        <button
          onClick={() => setCurrentTab('model-guide')}
          title={isCollapsed ? 'Settings' : undefined}
          className={`w-full flex items-center ${
            isCollapsed ? 'justify-center px-0' : 'space-x-3 px-3'
          } py-2 rounded-md text-xs font-semibold text-[#505459] hover:text-[#1C1E20] hover:bg-[#EDE5DC] transition-all`}
        >
          <Settings className="w-4 h-4 text-[#7A7E83] shrink-0" />
          {!isCollapsed && <span>System Settings</span>}
        </button>

        <button
          onClick={logout}
          title={isCollapsed ? 'Logout' : undefined}
          className={`w-full flex items-center ${
            isCollapsed ? 'justify-center px-0' : 'space-x-3 px-3'
          } py-2 rounded-md text-xs font-semibold text-[#505459] hover:text-[#DC2626] hover:bg-red-50 transition-all`}
        >
          <LogOut className="w-4 h-4 text-[#7A7E83] shrink-0" />
          {!isCollapsed && <span>Sign Out</span>}
        </button>
      </div>

    </aside>
  );
};
