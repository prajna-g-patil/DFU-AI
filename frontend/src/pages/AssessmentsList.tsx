import React, { useEffect, useState } from 'react';
import { 
  FileText, 
  Search, 
  Filter, 
  Eye, 
  Calendar, 
  MapPin, 
  CheckCircle2, 
  AlertTriangle, 
  Activity,
  PlusCircle,
  ArrowRight
} from 'lucide-react';
import { Assessment } from '../types';
import { api } from '../services/api';

interface AssessmentsListProps {
  onSelectAssessment: (assessmentId: number) => void;
  onNewAssessment: () => void;
}

export const AssessmentsList: React.FC<AssessmentsListProps> = ({
  onSelectAssessment,
  onNewAssessment,
}) => {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [gradeFilter, setGradeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const loadAssessments = async () => {
    setLoading(true);
    try {
      const data = await api.getAssessments({
        grade: gradeFilter !== 'all' ? Number(gradeFilter) : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      });
      setAssessments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssessments();
  }, [gradeFilter, statusFilter]);

  return (
    <div className="max-w-[1520px] mx-auto space-y-5">
      
      {/* Header */}
      <div className="bg-white rounded-lg border border-[#E2D9CF] p-5 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#FDF1DC] text-[#1C1E20] border border-[#F7B955]/40">
              Hospital Clinical Registry
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-display tracking-tight text-[#1C1E20] mt-1">
            Ulcer Assessment & Audit Registry
          </h1>
          <p className="text-xs text-[#6A6E73] mt-0.5">
            Audit repository of all AI-classified diabetic foot ulcer cases, Grad-CAM attention heatmaps, and doctor verifications.
          </p>
        </div>

        <button
          onClick={onNewAssessment}
          className="flex items-center space-x-2 px-4 py-2.5 bg-[#1C1E20] hover:bg-black text-white text-xs font-bold rounded-md shadow-sm transition-all"
        >
          <PlusCircle className="w-4 h-4 text-[#F7B955]" />
          <span>New AI Assessment</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-lg border border-[#E2D9CF] shadow-sm flex flex-wrap items-center justify-between gap-4 text-xs">
        
        <div className="flex flex-wrap items-center gap-3">
          
          <div className="flex items-center space-x-2">
            <Filter className="w-3.5 h-3.5 text-[#6A6E73]" />
            <span className="font-semibold text-[#6A6E73]">Wagner Grade:</span>
            <select
              value={gradeFilter}
              onChange={(e) => setGradeFilter(e.target.value)}
              className="bg-[#FAF7F4] border border-[#E2D9CF] rounded-md px-2.5 py-1.5 font-bold text-[#1C1E20] focus:outline-none focus:border-[#F7B955]"
            >
              <option value="all">All Grades (1–4)</option>
              <option value="1">Grade 1: Superficial</option>
              <option value="2">Grade 2: Deep / Tendon</option>
              <option value="3">Grade 3: Osteitis / Abscess</option>
              <option value="4">Grade 4: Gangrene / Necrosis</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="font-semibold text-[#6A6E73]">Doctor Verification:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#FAF7F4] border border-[#E2D9CF] rounded-md px-2.5 py-1.5 font-bold text-[#1C1E20] focus:outline-none focus:border-[#F7B955]"
            >
              <option value="all">All Statuses</option>
              <option value="pending_review">Pending Review</option>
              <option value="verified">Verified by Doctor</option>
              <option value="overridden">Overridden</option>
            </select>
          </div>

        </div>

        <div className="text-xs text-[#6A6E73] font-semibold">
          Showing {assessments.length} clinical records
        </div>

      </div>

      {/* Main Table */}
      <div className="bg-white rounded-lg border border-[#E2D9CF] shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-[#6A6E73] flex flex-col items-center gap-2">
            <div className="w-6 h-6 border-2 border-[#F7B955] border-t-[#1C1E20] rounded-md animate-spin" />
            <span>Loading assessment records...</span>
          </div>
        ) : assessments.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#6A6E73]">
            No assessment records match the selected filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF7F4] text-[#6A6E73] font-bold uppercase tracking-wider text-[10px] border-b border-[#E2D9CF]">
                <tr>
                  <th className="py-3 px-4">Ulcer & Grad-CAM</th>
                  <th className="py-3 px-4">Patient & MRN</th>
                  <th className="py-3 px-4">Date Staged</th>
                  <th className="py-3 px-4">Anatomical Site</th>
                  <th className="py-3 px-4">Wagner Grade</th>
                  <th className="py-3 px-4">Confidence</th>
                  <th className="py-3 px-4">Doctor Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2D9CF]">
                {assessments.map((a) => (
                  <tr key={a.id} className="hover:bg-[#FAF7F4] transition-colors">
                    
                    {/* Thumbnail */}
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <img 
                          src={a.original_image_url} 
                          alt="Ulcer" 
                          className="w-9 h-9 rounded-md object-cover border border-[#E2D9CF]"
                        />
                        {a.gradcam_image_url && (
                          <img 
                            src={a.gradcam_image_url} 
                            alt="Grad-CAM" 
                            className="w-9 h-9 rounded-md object-cover border border-[#F7B955]/40 hidden sm:block"
                          />
                        )}
                      </div>
                    </td>

                    {/* Patient */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-[#1C1E20]">{a.patient_name || 'Patient'}</div>
                      <div className="text-[10px] text-[#6A6E73] font-mono">{a.patient_mrn}</div>
                    </td>

                    {/* Date */}
                    <td className="py-3 px-4 text-[#6A6E73] whitespace-nowrap">
                      {new Date(a.created_at).toLocaleDateString()}
                    </td>

                    {/* Site */}
                    <td className="py-3 px-4 text-[#1C1E20]">
                      <div className="font-medium text-xs">{a.lesion_location}</div>
                      <div className="text-[10px] text-[#6A6E73]">{a.affected_foot} Foot • {a.wound_area_cm2} cm²</div>
                    </td>

                    {/* Grade Badge */}
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        a.ai_predicted_grade === 4 ? 'bg-rose-50 text-rose-800 border border-rose-300' :
                        a.ai_predicted_grade === 3 ? 'bg-amber-50 text-amber-800 border border-amber-300' :
                        a.ai_predicted_grade === 2 ? 'bg-[#FDF1DC] text-[#1C1E20] border border-[#F7B955]/40' :
                        'bg-emerald-50 text-emerald-800 border border-emerald-300'
                      }`}>
                        Wagner Grade {a.ai_predicted_grade}
                      </span>
                    </td>

                    {/* Confidence */}
                    <td className="py-3 px-4 font-bold text-[#1C1E20]">
                      {Math.round(a.ai_confidence_score * 100)}%
                    </td>

                    {/* Doctor Status */}
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        a.verification_status === 'verified' 
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-300' 
                          : a.verification_status === 'overridden'
                          ? 'bg-amber-50 text-amber-800 border border-amber-300'
                          : 'bg-sand-100 text-[#6A6E73] border border-[#E2D9CF]'
                      }`}>
                        {a.verification_status.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onSelectAssessment(a.id)}
                        className="px-2.5 py-1 bg-white hover:bg-sand-50 text-[#1C1E20] hover:text-[#1C1E20] border border-[#E2D9CF] hover:border-[#F7B955] rounded-md transition-colors inline-flex items-center gap-1 font-semibold text-xs"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#F7B955]" />
                        <span>Review</span>
                      </button>
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
