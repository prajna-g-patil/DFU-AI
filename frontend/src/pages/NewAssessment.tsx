import React, { useState, useEffect } from 'react';
import { 
  PlusCircle, 
  Upload, 
  Sparkles, 
  Activity, 
  Image as ImageIcon, 
  CheckCircle2, 
  AlertTriangle, 
  Stethoscope, 
  FileText, 
  Layers, 
  ArrowRight,
  ShieldCheck,
  UserCheck,
  RefreshCw,
  Info,
  ScanEye,
  Camera
} from 'lucide-react';
import { Patient, Assessment, ClinicalReportData, TreatmentPlan } from '../types';
import { api } from '../services/api';
import { FootLocationPicker } from '../components/FootLocationPicker';
import { GradCamViewer } from '../components/GradCamViewer';
import { ConfidenceGauge } from '../components/ConfidenceGauge';
import { DoctorVerificationModal } from '../components/DoctorVerificationModal';
import { ClinicalReportModal } from '../components/ClinicalReportModal';

interface NewAssessmentProps {
  initialPatientId?: number | null;
  onAssessmentCompleted: (assessmentId: number) => void;
}

export const NewAssessment: React.FC<NewAssessmentProps> = ({
  initialPatientId,
  onAssessmentCompleted,
}) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(initialPatientId || null);

  // Anatomical & physical parameters
  const [lesionLocation, setLesionLocation] = useState('Plantar - 1st Metatarsal Head');
  const [affectedFoot, setAffectedFoot] = useState('Right');
  const [diameterMm, setDiameterMm] = useState(18.0);
  const [depthMm, setDepthMm] = useState(2.8);
  const [woundAreaCm2, setWoundAreaCm2] = useState(3.6);
  const [exudateLevel, setExudateLevel] = useState('Moderate / Serosanguinous');
  const [woundOdor, setWoundOdor] = useState(false);
  const [perilesionalErythema, setPerilesionalErythema] = useState(true);
  const [painScore, setPainScore] = useState(2);
  const [granulationPct, setGranulationPct] = useState(65);
  const [sloughPct, setSloughPct] = useState(25);
  const [necroticPct, setNecroticPct] = useState(10);
  const [peripheralPulses, setPeripheralPulses] = useState(true);

  // Image upload state (AI detects grade from this image)
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>('/static/samples/sample_grade2.jpg');
  const [selectedSampleKey, setSelectedSampleKey] = useState<string | null>('sample_grade2');

  // AI inference state
  const [isInferring, setIsInferring] = useState(false);
  const [assessmentResult, setAssessmentResult] = useState<Assessment | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Verification & Report modals
  const [isVerifyOpen, setIsVerifyOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportData, setReportData] = useState<ClinicalReportData | null>(null);

  useEffect(() => {
    async function loadPatients() {
      try {
        const data = await api.getPatients();
        setPatients(data);
        if (!selectedPatientId && data.length > 0) {
          setSelectedPatientId(data[0].id);
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadPatients();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setSelectedSampleKey(null);
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Select sample photo for testing without pre-deciding the Wagner grade
  const handleSelectSample = (sampleKey: string, siteName: string) => {
    setSelectedSampleKey(sampleKey);
    setImageFile(null);
    setImagePreview(`/static/samples/${sampleKey}.jpg`);
    setLesionLocation(siteName);
  };

  const handleRunInference = async () => {
    if (!selectedPatientId) {
      setError('Please select a patient for this assessment.');
      return;
    }

    if (!imageFile && !selectedSampleKey) {
      setError('Please upload an ulcer photo or select a benchmark sample image.');
      return;
    }

    setIsInferring(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('patient_id', selectedPatientId.toString());
      formData.append('lesion_location', lesionLocation);
      formData.append('affected_foot', affectedFoot);
      formData.append('ulcer_diameter_mm', diameterMm.toString());
      formData.append('ulcer_depth_mm', depthMm.toString());
      formData.append('wound_area_cm2', woundAreaCm2.toString());
      formData.append('exudate_level', exudateLevel);
      formData.append('wound_odor', woundOdor ? 'true' : 'false');
      formData.append('perilesional_erythema', perilesionalErythema ? 'true' : 'false');
      formData.append('pain_score', painScore.toString());
      formData.append('granulation_percentage', granulationPct.toString());
      formData.append('slough_percentage', sloughPct.toString());
      formData.append('necrotic_percentage', necroticPct.toString());
      formData.append('peripheral_pulses_palpable', peripheralPulses ? 'true' : 'false');

      if (imageFile) {
        formData.append('image', imageFile);
      } else if (selectedSampleKey) {
        formData.append('sample_key', selectedSampleKey);
      }

      await new Promise(r => setTimeout(r, 600));

      const result = await api.createAssessment(formData);
      setAssessmentResult(result);
    } catch (err: any) {
      setError(err.message || 'AI Inference pipeline execution failed.');
    } finally {
      setIsInferring(false);
    }
  };

  const handleVerifySubmit = async (verifyData: {
    verified_grade: number;
    status: 'verified' | 'overridden';
    override_reason?: string;
    clinical_notes?: string;
    treatment_plan: TreatmentPlan;
  }) => {
    if (!assessmentResult) return;
    const updated = await api.verifyAssessment(assessmentResult.id, verifyData);
    setAssessmentResult(updated);
  };

  const handleOpenReport = async () => {
    if (!assessmentResult) return;
    try {
      const rData = await api.getAssessmentReport(assessmentResult.id);
      setReportData(rData);
      setIsReportOpen(true);
    } catch (e) {
      console.error(e);
      alert('Failed to load report payload');
    }
  };

  return (
    <div className="max-w-[1520px] mx-auto space-y-5">
      
      {/* Studio Header */}
      <div className="bg-white rounded-lg border border-[#E2D9CF] p-5 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded bg-[#FDF1DC] text-[#1C1E20] border border-[#F7B955]/40 text-[10px] font-bold uppercase tracking-wider mb-1">
            <ScanEye className="w-3.5 h-3.5 text-[#F7B955]" />
            <span>AI Automated Ulcer Staging Studio</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-display text-[#1C1E20] tracking-tight">
            Diabetic Foot Ulcer AI Staging & Grad-CAM Analysis
          </h1>
          <p className="text-xs text-[#6A6E73] mt-0.5">
            The AI model inspects the uploaded macro photograph to autonomously detect Wagner Grade 1, 2, 3, or 4 and render visual Grad-CAM activation heatmaps.
          </p>
        </div>

        {assessmentResult && (
          <div className="flex items-center space-x-2.5">
            <button
              onClick={() => setIsVerifyOpen(true)}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-md shadow-sm transition-all"
            >
              <UserCheck className="w-4 h-4 text-[#F7B955]" />
              <span>Doctor Verification</span>
            </button>

            <button
              onClick={handleOpenReport}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-[#1C1E20] hover:bg-black text-white text-xs font-bold rounded-md shadow-sm transition-all"
            >
              <FileText className="w-4 h-4 text-[#F7B955]" />
              <span>Generate Clinical Report</span>
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 p-3.5 rounded-md text-xs text-rose-800 font-semibold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Two Column Layout: Left Input Form, Right Inference Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* Left Column: Clinical Parameters & Photograph Upload */}
        <div className="lg:col-span-6 space-y-4">
          
          {/* 1. Patient Selection */}
          <div className="bg-white rounded-lg p-5 border border-[#E2D9CF] shadow-sm space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#1C1E20] uppercase tracking-wider">
                1. Select Registered Patient
              </label>
              <span className="text-[10px] text-[#6A6E73]">EHR Registry</span>
            </div>

            <select
              value={selectedPatientId || ''}
              onChange={(e) => setSelectedPatientId(Number(e.target.value))}
              className="w-full p-2.5 bg-[#FAF7F4] border border-[#E2D9CF] rounded-md text-xs font-bold text-[#1C1E20] focus:outline-none focus:border-[#F7B955]"
            >
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.full_name} ({p.mrn}) • {p.age}y {p.gender} • {p.diabetes_type}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Anatomical Foot Location Picker */}
          <FootLocationPicker
            selectedLocation={lesionLocation}
            onChangeLocation={setLesionLocation}
            affectedFoot={affectedFoot}
            onChangeFoot={setAffectedFoot}
          />

          {/* 3. Clinical Ulcer Image Upload (AI DETECTS GRADE DIRECTLY FROM THIS IMAGE) */}
          <div className="bg-white rounded-lg p-5 border border-[#E2D9CF] shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-[#1C1E20] uppercase tracking-wider">
                  2. Clinical Ulcer Photograph
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#FDF1DC] text-[#1C1E20] border border-[#F7B955]/40">
                  AI Input
                </span>
              </div>
              <span className="text-[11px] text-[#6A6E73]">Autonomous Deep Learning Input</span>
            </div>

            {/* Informational Guidance */}
            <div className="p-2.5 rounded-md bg-[#FAF7F4] border border-[#E2D9CF] text-[11px] text-[#6A6E73] flex items-center gap-2">
              <Info className="w-4 h-4 text-[#F7B955] shrink-0" />
              <span>
                Upload any patient ulcer photo. The AI vision network automatically analyzes tissue necrosis, erythema, and slough to detect Wagner Grade 1, 2, 3, or 4.
              </span>
            </div>

            {/* Drag & Drop Upload Zone (Primary Action) */}
            <div className="relative border-2 border-dashed border-[#CBD5E1] hover:border-[#1C1E20] rounded-md p-5 text-center transition-colors bg-[#FAF7F4]">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              
              {imagePreview ? (
                <div className="space-y-2">
                  <img
                    src={imagePreview}
                    alt="Ulcer Macro Photograph Preview"
                    className="w-32 h-32 mx-auto rounded-md object-cover border border-[#E2D9CF] shadow-xs"
                  />
                  <div className="text-xs font-bold text-[#1C1E20]">
                    Photograph loaded. Click or drop a new file to replace.
                  </div>
                  <div className="text-[10px] text-[#6A6E73]">
                    Ready for Convolutional Neural Network Analysis & Grad-CAM Heatmap
                  </div>
                </div>
              ) : (
                <div className="space-y-2 py-3">
                  <div className="w-10 h-10 rounded-md bg-white text-[#1C1E20] flex items-center justify-center mx-auto border border-[#E2D9CF]">
                    <Camera className="w-5 h-5 text-[#F7B955]" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#1C1E20]">Upload Patient Ulcer Photograph</span>
                    <p className="text-[11px] text-[#6A6E73] mt-0.5">JPEG, PNG, WebP up to 20MB</p>
                  </div>
                </div>
              )}
            </div>

            {/* Reference Benchmark Case Images (Objectively labeled without disclosing grade) */}
            <div className="space-y-2 pt-2 border-t border-[#E2D9CF]">
              <div className="text-[11px] font-semibold text-[#6A6E73] flex items-center justify-between">
                <span>Or Test with a Clinical Case Photograph:</span>
                <span className="text-[10px] text-[#8E8B88]">Cohort Benchmarks</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { key: 'sample_grade1', label: 'Case Photo A', desc: 'Plantar Heel Crater', site: 'Plantar Calcaneus / Heel' },
                  { key: 'sample_grade2', label: 'Case Photo B', desc: '1st MTP Head Lesion', site: 'Plantar 1st MTP Head' },
                  { key: 'sample_grade3', label: 'Case Photo C', desc: 'Cavitated Slough', site: 'Plantar 5th Metatarsal Base' },
                  { key: 'sample_grade4', label: 'Case Photo D', desc: 'Distal Toe Discoloration', site: 'Hallux Distal / Apical' },
                ].map((s) => (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => handleSelectSample(s.key, s.site)}
                    className={`p-2 rounded-md border text-left transition-all ${
                      selectedSampleKey === s.key 
                        ? 'bg-[#FDF1DC] border-[#1C1E20] ring-1 ring-[#1C1E20] shadow-xs' 
                        : 'bg-[#FAF7F4] border-[#E2D9CF] hover:bg-white'
                    }`}
                  >
                    <div className="text-xs font-bold text-[#1C1E20]">{s.label}</div>
                    <div className="text-[10px] text-[#6A6E73] truncate">{s.desc}</div>
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* 4. Physical Wound Measurements (Optional Clinician Context) */}
          <div className="bg-white rounded-lg p-5 border border-[#E2D9CF] shadow-sm space-y-4">
            <div className="text-xs font-bold text-[#1C1E20] uppercase tracking-wider flex items-center justify-between">
              <span>3. Physical Wound Measurements</span>
              <span className="text-[10px] text-[#6A6E73] font-normal">Physical Metrics</span>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs">
              <div>
                <label className="font-semibold text-[#6A6E73] block mb-1">Diameter (mm)</label>
                <input
                  type="number"
                  step="0.5"
                  value={diameterMm}
                  onChange={(e) => setDiameterMm(Number(e.target.value))}
                  className="w-full p-2 bg-[#FAF7F4] border border-[#E2D9CF] rounded-md font-bold text-[#1C1E20] focus:bg-white focus:outline-none focus:border-[#F7B955]"
                />
              </div>

              <div>
                <label className="font-semibold text-[#6A6E73] block mb-1">Depth (mm)</label>
                <input
                  type="number"
                  step="0.1"
                  value={depthMm}
                  onChange={(e) => setDepthMm(Number(e.target.value))}
                  className="w-full p-2 bg-[#FAF7F4] border border-[#E2D9CF] rounded-md font-bold text-[#1C1E20] focus:bg-white focus:outline-none focus:border-[#F7B955]"
                />
              </div>

              <div>
                <label className="font-semibold text-[#6A6E73] block mb-1">Area (cm²)</label>
                <input
                  type="number"
                  step="0.1"
                  value={woundAreaCm2}
                  onChange={(e) => setWoundAreaCm2(Number(e.target.value))}
                  className="w-full p-2 bg-[#FAF7F4] border border-[#E2D9CF] rounded-md font-bold text-[#1C1E20] focus:bg-white focus:outline-none focus:border-[#F7B955]"
                />
              </div>
            </div>

            {/* Exudate & Odor */}
            <div className="grid grid-cols-2 gap-3 text-xs pt-1 border-t border-[#E2D9CF]">
              <div>
                <label className="font-semibold text-[#6A6E73] block mb-1">Exudate Level</label>
                <select
                  value={exudateLevel}
                  onChange={(e) => setExudateLevel(e.target.value)}
                  className="w-full p-2 bg-[#FAF7F4] border border-[#E2D9CF] rounded-md font-medium text-[#1C1E20]"
                >
                  <option value="None">None / Dry</option>
                  <option value="Low / Serous">Low / Serous</option>
                  <option value="Moderate / Serosanguinous">Moderate / Serosanguinous</option>
                  <option value="Heavy / Purulent">Heavy / Purulent</option>
                </select>
              </div>

              <div className="flex flex-col justify-end space-y-2">
                <label className="flex items-center space-x-2 cursor-pointer text-[#1C1E20]">
                  <input
                    type="checkbox"
                    checked={woundOdor}
                    onChange={(e) => setWoundOdor(e.target.checked)}
                    className="rounded text-[#1C1E20] focus:ring-[#F7B955]"
                  />
                  <span className="text-xs">Foul Wound Odor</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer text-[#1C1E20]">
                  <input
                    type="checkbox"
                    checked={perilesionalErythema}
                    onChange={(e) => setPerilesionalErythema(e.target.checked)}
                    className="rounded text-[#1C1E20] focus:ring-[#F7B955]"
                  />
                  <span className="text-xs">Perilesional Erythema</span>
                </label>
              </div>
            </div>

          </div>

          {/* Trigger Inference Primary Button */}
          <button
            type="button"
            onClick={handleRunInference}
            disabled={isInferring}
            className="w-full py-3.5 bg-[#1C1E20] hover:bg-black text-white font-bold text-xs uppercase tracking-wider rounded-md shadow-sm transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {isInferring ? (
              <>
                <RefreshCw className="w-4 h-4 text-[#F7B955] animate-spin" />
                <span>Analyzing Image Pixels & Generating Grad-CAM...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-[#F7B955]" />
                <span>Execute AI Classification & Grad-CAM Analysis</span>
              </>
            )}
          </button>

        </div>

        {/* Right Column: AI Results & Grad-CAM Visualizer */}
        <div className="lg:col-span-6 space-y-5">
          
          {assessmentResult ? (
            <div className="space-y-4">
              
              {/* Automated Classification Announcement Badge */}
              <div className="bg-white rounded-lg p-4 border border-[#E2D9CF] shadow-sm flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#6A6E73]">
                    AI Detection Result
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-extrabold text-[#1C1E20] font-display">
                      Wagner Grade {assessmentResult.ai_predicted_grade}
                    </span>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${
                      assessmentResult.ai_predicted_grade === 4 ? 'bg-rose-50 text-rose-800 border-rose-300' :
                      assessmentResult.ai_predicted_grade === 3 ? 'bg-amber-50 text-amber-800 border-amber-300' :
                      assessmentResult.ai_predicted_grade === 2 ? 'bg-[#FDF1DC] text-[#1C1E20] border-[#F7B955]/40' :
                      'bg-emerald-50 text-emerald-800 border-emerald-300'
                    }`}>
                      {assessmentResult.risk_severity}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-[#6A6E73] block">Diagnostic Confidence</span>
                  <span className="text-base font-extrabold text-[#1C1E20]">
                    {Math.round(assessmentResult.ai_confidence_score * 100)}%
                  </span>
                </div>
              </div>

              {/* Confidence Gauge */}
              <ConfidenceGauge
                grade={assessmentResult.ai_predicted_grade}
                confidenceScore={assessmentResult.ai_confidence_score}
                probabilities={assessmentResult.ai_probabilities}
                riskSeverity={assessmentResult.risk_severity}
              />

              {/* Grad-CAM Viewer */}
              <GradCamViewer
                originalImageUrl={assessmentResult.original_image_url}
                gradcamImageUrl={assessmentResult.gradcam_image_url}
                predictedGrade={assessmentResult.ai_predicted_grade}
                confidenceScore={assessmentResult.ai_confidence_score}
                rationale={assessmentResult.ai_rationale}
              />

              {/* IWGDF Clinical Guidelines */}
              <div className="bg-white rounded-lg p-5 border border-[#E2D9CF] shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[#1C1E20] uppercase tracking-wider flex items-center gap-1.5">
                    <Stethoscope className="w-4 h-4 text-[#F7B955]" />
                    IWGDF Evidence-Based Clinical Recommendations
                  </h4>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
                    Clinical Standard of Care
                  </span>
                </div>

                <ul className="space-y-2 text-xs text-[#6A6E73] leading-relaxed">
                  {assessmentResult.clinical_recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start space-x-2 bg-[#FAF7F4] p-2.5 rounded-md border border-[#E2D9CF]">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="text-[#1C1E20]">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Doctor Review Bar */}
              <div className="bg-white p-4 rounded-lg border border-[#E2D9CF] shadow-sm flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-bold text-[#1C1E20] flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-[#F7B955]" />
                    Clinical Verification & Sign-Off
                  </h4>
                  <p className="text-[11px] text-[#6A6E73] mt-0.5">
                    Status: <span className="font-bold text-[#1C1E20]">{assessmentResult.verification_status.replace('_', ' ').toUpperCase()}</span>
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setIsVerifyOpen(true)}
                    className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-md shadow-sm transition-all"
                  >
                    Review & Sign-Off
                  </button>

                  <button
                    onClick={handleOpenReport}
                    className="px-3 py-1.5 bg-white hover:bg-sand-50 text-[#1C1E20] font-semibold text-xs rounded-md border border-[#E2D9CF] transition-all"
                  >
                    Clinical Report
                  </button>
                </div>
              </div>

            </div>
          ) : (
            /* Standby Empty State */
            <div className="bg-white rounded-lg p-10 border border-[#E2D9CF] shadow-sm text-center space-y-3">
              <div className="w-12 h-12 rounded-lg bg-[#FAF7F4] border border-[#E2D9CF] flex items-center justify-center mx-auto text-[#1C1E20]">
                <Activity className="w-6 h-6 text-[#F7B955]" />
              </div>
              <div className="max-w-sm mx-auto space-y-1">
                <h3 className="text-sm font-bold text-[#1C1E20]">
                  Awaiting Photograph Inference
                </h3>
                <p className="text-xs text-[#6A6E73] leading-relaxed">
                  Upload an ulcer photograph and click "Execute AI Classification". The deep learning vision model will independently analyze the image pixels to determine the Wagner Grade and Grad-CAM saliency.
                </p>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Verification Modal */}
      {assessmentResult && (
        <DoctorVerificationModal
          assessment={assessmentResult}
          isOpen={isVerifyOpen}
          onClose={() => setIsVerifyOpen(false)}
          onVerified={(updated) => setAssessmentResult(updated)}
          onVerifySubmit={handleVerifySubmit}
        />
      )}

      {/* Clinical Report Preview & Print Modal */}
      <ClinicalReportModal
        reportData={reportData}
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
      />

    </div>
  );
};
