import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar } from './components/Sidebar';
import { LandingLogin } from './pages/LandingLogin';
import { Dashboard } from './pages/Dashboard';
import { PatientsList } from './pages/PatientsList';
import { PatientDetail } from './pages/PatientDetail';
import { NewAssessment } from './pages/NewAssessment';
import { AssessmentsList } from './pages/AssessmentsList';
import { AssessmentDetail } from './pages/AssessmentDetail';
import { ModelIntegrationGuide } from './pages/ModelIntegrationGuide';
import { ChatbotView } from './pages/ChatbotView';
import { NewPatientModal } from './components/NewPatientModal';

const AppContent: React.FC = () => {
  const { doctor, loading } = useAuth();
  
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<number | null>(null);
  const [isNewPatientOpen, setIsNewPatientOpen] = useState<boolean>(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F6F0EA] flex items-center justify-center text-[#1C1E20]">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-8 h-8 border-2 border-[#F7B955] border-t-[#1C1E20] rounded-md animate-spin" />
          <span className="text-xs font-semibold tracking-wider text-[#6A6E73] uppercase">
            Initializing DFU-AI Clinical Workspace...
          </span>
        </div>
      </div>
    );
  }

  // Not logged in -> Landing page + Doctor / Patient auth
  if (!doctor) {
    return <LandingLogin />;
  }

  const navigateTo = (tab: string, id?: number) => {
    if (tab === 'patient-detail' && id) {
      setSelectedPatientId(id);
      setCurrentTab('patient-detail');
    } else if (tab === 'assessment-detail' && id) {
      setSelectedAssessmentId(id);
      setCurrentTab('assessment-detail');
    } else if (tab === 'new-assessment-for-patient' && id) {
      setSelectedPatientId(id);
      setCurrentTab('new-assessment');
    } else {
      setCurrentTab(tab);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#F6F0EA] flex text-[#25282B] selection:bg-[#F7B955]/30">
      
      {/* MedSync / DFU-AI Left Sidebar */}
      <Sidebar 
        currentTab={currentTab} 
        setCurrentTab={(tab) => {
          if (tab === 'new-assessment') {
            setSelectedPatientId(null);
          }
          setCurrentTab(tab);
        }}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden">
        <main className="flex-1 p-4 sm:p-5 lg:p-6">
          
          {currentTab === 'dashboard' && (
            <Dashboard 
              onNavigate={(tab, id) => navigateTo(tab, id)} 
              onOpenNewPatient={() => setIsNewPatientOpen(true)}
            />
          )}

          {currentTab === 'patients' && (
            <PatientsList
              onSelectPatient={(id) => navigateTo('patient-detail', id)}
              onOpenNewPatient={() => setIsNewPatientOpen(true)}
              onNewAssessmentForPatient={(id) => navigateTo('new-assessment-for-patient', id)}
            />
          )}

          {currentTab === 'patient-detail' && selectedPatientId && (
            <PatientDetail
              patientId={selectedPatientId}
              onBack={() => setCurrentTab('patients')}
              onNewAssessment={(id) => navigateTo('new-assessment-for-patient', id)}
              onViewAssessment={(id) => navigateTo('assessment-detail', id)}
            />
          )}

          {currentTab === 'new-assessment' && (
            <NewAssessment
              initialPatientId={selectedPatientId}
              onAssessmentCompleted={(id) => navigateTo('assessment-detail', id)}
            />
          )}

          {currentTab === 'assessments' && (
            <AssessmentsList
              onSelectAssessment={(id) => navigateTo('assessment-detail', id)}
              onNewAssessment={() => {
                setSelectedPatientId(null);
                setCurrentTab('new-assessment');
              }}
            />
          )}

          {currentTab === 'assessment-detail' && selectedAssessmentId && (
            <AssessmentDetail
              assessmentId={selectedAssessmentId}
              onBack={() => setCurrentTab('assessments')}
              onViewPatient={(id) => navigateTo('patient-detail', id)}
            />
          )}

          {currentTab === 'chats' && (
            <ChatbotView />
          )}

          {currentTab === 'model-guide' && (
            <ModelIntegrationGuide />
          )}

        </main>
      </div>

      {/* Global New Patient Registration Modal */}
      <NewPatientModal
        isOpen={isNewPatientOpen}
        onClose={() => setIsNewPatientOpen(false)}
        onPatientCreated={(newPatient) => {
          navigateTo('patient-detail', newPatient.id);
        }}
      />

    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
