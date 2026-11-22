import React, { useState } from 'react';
import { X, UserPlus, Shield, HeartPulse, Activity } from 'lucide-react';
import { Patient } from '../types';
import { api } from '../services/api';

interface NewPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPatientCreated: (patient: Patient) => void;
}

export const NewPatientModal: React.FC<NewPatientModalProps> = ({
  isOpen,
  onClose,
  onPatientCreated,
}) => {
  const [formData, setFormData] = useState({
    mrn: `MRN-${Math.floor(100000 + Math.random() * 900000)}`,
    full_name: '',
    age: 60,
    gender: 'Male',
    date_of_birth: '1965-05-14',
    contact_phone: '+1 (555) 019-2831',
    emergency_contact: 'Family Contact',
    diabetes_type: 'Type 2',
    diabetes_duration_years: 12,
    hba1c_current: 8.5,
    neuropathy_diagnosed: true,
    peripheral_vascular_disease: false,
    abi_score: 0.95,
    monofilament_loss: true,
    past_ulcers_count: 1,
    past_amputations: false,
    status: 'Active',
    notes: 'New diabetic foot ulcer consultation.',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.full_name.trim()) {
      setError('Patient full name is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const created = await api.createPatient(formData);
      onPatientCreated(created);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create patient');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#202938]/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-card border border-[#E5E7EB] max-w-2xl w-full overflow-hidden animate-in fade-in">
        
        {/* Header */}
        <div className="bg-[#202938] text-white px-6 py-4 flex items-center justify-between border-b border-[#334155]">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-md bg-[#1C1E20] text-white">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Register New Diabetic Foot Patient
              </h3>
              <p className="text-xs text-[#94A3B8]">
                Create electronic health record & baseline risk stratification profile
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-1 rounded-md text-[#94A3B8] hover:text-white hover:bg-[#334155]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="bg-[#FEF2F2] border-l-4 border-[#D94848] p-3 m-6 mb-0 text-xs text-[#991B1B] font-semibold rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
          
          {/* Row 1: Demographics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-[#202938] block mb-1">Medical Record No. (MRN)</label>
              <input
                type="text"
                required
                value={formData.mrn}
                onChange={(e) => setFormData({ ...formData, mrn: e.target.value })}
                className="w-full p-2 bg-[#F7F8FA] border border-[#E5E7EB] rounded-md font-mono text-xs font-bold text-[#202938] focus:outline-none focus:border-[#1C1E20]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-[#202938] block mb-1">Full Legal Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Eleanor Vance"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full p-2 bg-[#F7F8FA] border border-[#E5E7EB] rounded-md text-xs font-medium text-[#202938] focus:outline-none focus:border-[#1C1E20]"
              />
            </div>
          </div>

          {/* Row 2: Demographics 2 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-[#202938] block mb-1">Age</label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                className="w-full p-2 bg-[#F7F8FA] border border-[#E5E7EB] rounded-md text-xs font-medium text-[#202938] focus:outline-none focus:border-[#1C1E20]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#202938] block mb-1">Biological Gender</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full p-2 bg-[#F7F8FA] border border-[#E5E7EB] rounded-md text-xs font-medium text-[#202938] focus:outline-none focus:border-[#1C1E20]"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#202938] block mb-1">Contact Phone</label>
              <input
                type="text"
                value={formData.contact_phone}
                onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                className="w-full p-2 bg-[#F7F8FA] border border-[#E5E7EB] rounded-md text-xs font-medium text-[#202938] focus:outline-none focus:border-[#1C1E20]"
              />
            </div>
          </div>

          {/* Row 3: Diabetic History */}
          <div className="pt-2 border-t border-[#E5E7EB]">
            <h4 className="text-xs font-bold text-[#1C1E20] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <HeartPulse className="w-3.5 h-3.5" />
              Diabetic & Vascular Baseline
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-[#202938] block mb-1">Diabetes Type</label>
                <select
                  value={formData.diabetes_type}
                  onChange={(e) => setFormData({ ...formData, diabetes_type: e.target.value })}
                  className="w-full p-2 bg-[#F7F8FA] border border-[#E5E7EB] rounded-md text-xs font-medium text-[#202938] focus:outline-none focus:border-[#1C1E20]"
                >
                  <option value="Type 2">Type 2 DM</option>
                  <option value="Type 1">Type 1 DM</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#202938] block mb-1">Duration (Years)</label>
                <input
                  type="number"
                  value={formData.diabetes_duration_years}
                  onChange={(e) => setFormData({ ...formData, diabetes_duration_years: Number(e.target.value) })}
                  className="w-full p-2 bg-[#F7F8FA] border border-[#E5E7EB] rounded-md text-xs font-medium text-[#202938] focus:outline-none focus:border-[#1C1E20]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#202938] block mb-1">HbA1c Level (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.hba1c_current}
                  onChange={(e) => setFormData({ ...formData, hba1c_current: Number(e.target.value) })}
                  className="w-full p-2 bg-[#F7F8FA] border border-[#E5E7EB] rounded-md text-xs font-bold text-[#1C1E20] focus:outline-none focus:border-[#1C1E20]"
                />
              </div>
            </div>
          </div>

          {/* Row 4: Risk Factors Checkboxes */}
          <div className="bg-[#F7F8FA] p-3 rounded-md border border-[#E5E7EB] space-y-2">
            <span className="text-[11px] font-bold text-[#202938] uppercase tracking-wider block">
              Comorbid Clinical Risk Indicators
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <label className="flex items-center space-x-2 text-[#202938] cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.neuropathy_diagnosed}
                  onChange={(e) => setFormData({ ...formData, neuropathy_diagnosed: e.target.checked })}
                  className="rounded text-[#1C1E20] focus:ring-[#1C1E20]"
                />
                <span>Peripheral Neuropathy Diagnosed</span>
              </label>

              <label className="flex items-center space-x-2 text-[#202938] cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.peripheral_vascular_disease}
                  onChange={(e) => setFormData({ ...formData, peripheral_vascular_disease: e.target.checked })}
                  className="rounded text-[#1C1E20] focus:ring-[#1C1E20]"
                />
                <span>Peripheral Vascular Disease (PVD)</span>
              </label>

              <label className="flex items-center space-x-2 text-[#202938] cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.monofilament_loss}
                  onChange={(e) => setFormData({ ...formData, monofilament_loss: e.target.checked })}
                  className="rounded text-[#1C1E20] focus:ring-[#1C1E20]"
                />
                <span>Semmes-Weinstein 10g Loss</span>
              </label>

              <label className="flex items-center space-x-2 text-[#202938] cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.past_amputations}
                  onChange={(e) => setFormData({ ...formData, past_amputations: e.target.checked })}
                  className="rounded text-[#1C1E20] focus:ring-[#1C1E20]"
                />
                <span>Prior Lower Limb Amputation</span>
              </label>
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
              disabled={loading}
              className="px-5 py-2 bg-[#1C1E20] hover:bg-[#000000] active:bg-[#000000] text-white text-xs font-bold rounded-md shadow-sm disabled:opacity-50"
            >
              {loading ? 'Registering...' : 'Enroll Patient & Open Profile'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
