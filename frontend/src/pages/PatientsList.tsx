import React, { useEffect, useState } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  PlusCircle, 
  ChevronRight, 
  AlertTriangle, 
  HeartPulse, 
  Activity, 
  FileText,
  Clock,
  Share2,
  UserCheck,
  Stethoscope,
  ArrowRight,
  Bot
} from 'lucide-react';
import { Patient } from '../types';
import { api } from '../services/api';

interface PatientsListProps {
  onSelectPatient: (patientId: number) => void;
  onOpenNewPatient: () => void;
  onNewAssessmentForPatient: (patientId: number) => void;
}

export const PatientsList: React.FC<PatientsListProps> = ({
  onSelectPatient,
  onOpenNewPatient,
  onNewAssessmentForPatient,
}) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [scope, setScope] = useState<'my' | 'shared'>('my');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [diabetesFilter, setDiabetesFilter] = useState('all');
  const [myCount, setMyCount] = useState<number>(0);
  const [sharedCount, setSharedCount] = useState<number>(0);

  const loadCounts = async () => {
    try {
      const [myData, sharedData] = await Promise.all([
        api.getPatients({ scope: 'my' }),
        api.getPatients({ scope: 'shared' })
      ]);
      setMyCount(myData.length);
      setSharedCount(sharedData.length);
    } catch (e) {
      console.warn("Error fetching tab counts:", e);
    }
  };

  const loadPatients = async () => {
    setLoading(true);
    try {
      const data = await api.getPatients({
        scope,
        search: search || undefined,
        status_filter: statusFilter !== 'all' ? statusFilter : undefined,
        diabetes_type: diabetesFilter !== 'all' ? diabetesFilter : undefined,
      });
      setPatients(data);
      loadCounts();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, [scope, statusFilter, diabetesFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadPatients();
  };

  return (
    <div className="max-w-[1520px] mx-auto space-y-5">
      
      {/* Header & Actions */}
      <div className="bg-white rounded-lg border border-[#E2D9CF] p-5 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#FDF1DC] text-[#1C1E20] border border-[#F7B955]/40">
              Clinical Registry
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-display tracking-tight text-[#1C1E20] mt-1">
            Diabetic Foot Patient Directory
          </h1>
          <p className="text-xs text-[#6A6E73] mt-0.5">
            Cohort management, longitudinal wound monitoring, and multi-disciplinary clinical team collaboration.
          </p>
        </div>

        <button
          onClick={onOpenNewPatient}
          className="flex items-center space-x-2 px-4 py-2.5 bg-[#1C1E20] hover:bg-black text-white text-xs font-bold rounded-md shadow-sm transition-all"
        >
          <PlusCircle className="w-4 h-4 text-[#F7B955]" />
          <span>Enroll New Patient</span>
        </button>
      </div>

      {/* Scope Switcher Tabs */}
      <div className="flex border-b border-[#E2D9CF] space-x-6 text-xs font-bold bg-white px-5 pt-3 rounded-t-lg">
        <button
          onClick={() => setScope('my')}
          className={`pb-3 flex items-center space-x-2 border-b-2 transition-all ${
            scope === 'my'
              ? 'border-[#1C1E20] text-[#1C1E20]'
              : 'border-transparent text-[#6A6E73] hover:text-[#1C1E20]'
          }`}
        >
          <span>My Assigned Patients</span>
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
            scope === 'my' ? 'bg-[#FDF1DC] text-[#1C1E20] border border-[#F7B955]/40' : 'bg-sand-100 text-[#6A6E73]'
          }`}>
            {myCount}
          </span>
        </button>

        <button
          onClick={() => setScope('shared')}
          className={`pb-3 flex items-center space-x-2 border-b-2 transition-all ${
            scope === 'shared'
              ? 'border-[#1C1E20] text-[#1C1E20]'
              : 'border-transparent text-[#6A6E73] hover:text-[#1C1E20]'
          }`}
        >
          <span className="flex items-center gap-1">
            <Share2 className="w-3.5 h-3.5" />
            Cross-Consultation Shared
          </span>
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
            scope === 'shared' ? 'bg-[#FDF1DC] text-[#1C1E20] border border-[#F7B955]/40' : 'bg-sand-100 text-[#6A6E73]'
          }`}>
            {sharedCount}
          </span>
        </button>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white p-4 rounded-lg border border-[#E2D9CF] shadow-sm flex flex-wrap items-center justify-between gap-4 text-xs">
        
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex-1 min-w-[260px] max-w-md relative">
          <Search className="w-4 h-4 text-[#8E8B88] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search patient name, MRN, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#FAF7F4] border border-[#E2D9CF] rounded-md text-[#1C1E20] text-xs placeholder:text-[#8E8B88] focus:bg-white focus:outline-none focus:border-[#F7B955]"
          />
        </form>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-3">
          
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-[#6A6E73]">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#FAF7F4] border border-[#E2D9CF] rounded-md px-2.5 py-1.5 font-bold text-[#1C1E20] focus:outline-none focus:border-[#F7B955]"
            >
              <option value="all">All Statuses</option>
              <option value="Active">Active Treatment</option>
              <option value="High Risk">High Risk</option>
              <option value="Healed">Healed / Closed</option>
              <option value="Follow-up">Routine Follow-up</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="font-semibold text-[#6A6E73]">Diabetes:</span>
            <select
              value={diabetesFilter}
              onChange={(e) => setDiabetesFilter(e.target.value)}
              className="bg-[#FAF7F4] border border-[#E2D9CF] rounded-md px-2.5 py-1.5 font-bold text-[#1C1E20] focus:outline-none focus:border-[#F7B955]"
            >
              <option value="all">All Types</option>
              <option value="Type 2">Type 2 DM</option>
              <option value="Type 1">Type 1 DM</option>
            </select>
          </div>

        </div>

      </div>

      {/* Patient Listing Table */}
      <div className="bg-white rounded-lg border border-[#E2D9CF] shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-[#6A6E73] flex flex-col items-center gap-2">
            <div className="w-6 h-6 border-2 border-[#F7B955] border-t-[#1C1E20] rounded-md animate-spin" />
            <span>Loading patient records...</span>
          </div>
        ) : patients.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#6A6E73]">
            No patient records found in this view.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF7F4] text-[#6A6E73] font-bold uppercase tracking-wider text-[10px] border-b border-[#E2D9CF]">
                <tr>
                  <th className="py-3 px-4">Patient Name & MRN</th>
                  <th className="py-3 px-4">Demographics</th>
                  <th className="py-3 px-4">Diabetes & HbA1c</th>
                  <th className="py-3 px-4">Vascular & Neuro</th>
                  <th className="py-3 px-4">Clinical Status</th>
                  <th className="py-3 px-4">Attending Doctor</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2D9CF]">
                {patients.map((p) => (
                  <tr key={p.id} className="hover:bg-[#FAF7F4] transition-colors">
                    
                    {/* Patient Name & MRN */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-[#1C1E20] text-xs">{p.full_name}</div>
                      <div className="text-[10px] text-[#6A6E73] font-mono">{p.mrn}</div>
                    </td>

                    {/* Age & Gender */}
                    <td className="py-3.5 px-4 text-[#1C1E20]">
                      <div>{p.age} yrs • {p.gender}</div>
                      <div className="text-[10px] text-[#6A6E73]">{p.contact_phone || 'No phone'}</div>
                    </td>

                    {/* Diabetes & HbA1c */}
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-[#1C1E20]">{p.diabetes_type} ({p.diabetes_duration_years}y)</div>
                      <div className="text-[10px] font-bold text-amber-800">
                        HbA1c: {p.hba1c_current}%
                      </div>
                    </td>

                    {/* Vascular & Neuropathy */}
                    <td className="py-3.5 px-4 text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${p.neuropathy_diagnosed ? 'bg-amber-600' : 'bg-emerald-600'}`} />
                        <span>{p.neuropathy_diagnosed ? 'Neuropathy' : 'Sensation Intact'}</span>
                      </div>
                      <div className="text-[10px] text-[#6A6E73] mt-0.5">
                        ABI: {p.abi_score} {p.peripheral_vascular_disease && '• PVD'}
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        p.status === 'High Risk' ? 'bg-rose-50 text-rose-800 border border-rose-300' :
                        p.status === 'Active' ? 'bg-amber-50 text-amber-800 border border-amber-300' :
                        p.status === 'Healed' ? 'bg-emerald-50 text-emerald-800 border border-emerald-300' :
                        'bg-sand-100 text-[#6A6E73] border border-[#E2D9CF]'
                      }`}>
                        {p.status}
                      </span>
                    </td>

                    {/* Attending Doctor */}
                    <td className="py-3.5 px-4">
                      <div className="text-xs font-semibold text-[#1C1E20]">
                        {p.primary_doctor_name || 'Assigned Staff'}
                      </div>
                      {p.is_shared && (
                        <span className="text-[10px] text-amber-800 font-medium flex items-center gap-1">
                          <Share2 className="w-2.5 h-2.5" />
                          Shared by {p.shared_by_doctor_name}
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => onNewAssessmentForPatient(p.id)}
                          className="px-2.5 py-1 bg-[#1C1E20] hover:bg-black text-white rounded-md text-xs font-bold transition-all shadow-xs flex items-center gap-1"
                          title="Launch AI Ulcer Staging"
                        >
                          <PlusCircle className="w-3 h-3 text-[#F7B955]" />
                          <span>Stage Ulcer</span>
                        </button>

                        <button
                          onClick={() => onSelectPatient(p.id)}
                          className="px-2.5 py-1 bg-white hover:bg-sand-50 text-[#1C1E20] border border-[#E2D9CF] hover:border-[#F7B955] rounded-md text-xs font-semibold transition-all inline-flex items-center gap-1"
                        >
                          <span>Profile</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
