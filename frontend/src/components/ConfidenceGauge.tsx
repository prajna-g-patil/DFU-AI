import React from 'react';
import { ShieldCheck, AlertTriangle, AlertOctagon, CheckCircle2 } from 'lucide-react';

interface ConfidenceGaugeProps {
  grade: number;
  confidenceScore: number;
  probabilities: { [key: string]: number };
  riskSeverity: string;
}

export const ConfidenceGauge: React.FC<ConfidenceGaugeProps> = ({
  grade,
  confidenceScore,
  probabilities,
  riskSeverity,
}) => {
  const percentage = Math.round(confidenceScore * 1000) / 10;

  const getGradeInfo = (g: number) => {
    switch (g) {
      case 1:
        return {
          title: 'Grade 1: Superficial Ulcer',
          badge: 'bg-[#F0FDF4] text-[#13866A] border-[#BBF7D0]',
          barColor: 'bg-[#13866A]',
          icon: CheckCircle2,
          desc: 'Skin-deep lesion without subcutaneous tissue breach.'
        };
      case 2:
        return {
          title: 'Grade 2: Deep Ulcer (Tendon/Capsule)',
          badge: 'bg-[#FEFCE8] text-[#D99124] border-[#FDE047]',
          barColor: 'bg-[#D99124]',
          icon: AlertTriangle,
          desc: 'Deep penetration to tendon, joint capsule, or ligament.'
        };
      case 3:
        return {
          title: 'Grade 3: Deep Ulcer + Osteitis / Abscess',
          badge: 'bg-[#FFF7ED] text-[#EA580C] border-[#FDBA74]',
          barColor: 'bg-[#EA580C]',
          icon: AlertOctagon,
          desc: 'Deep bone involvement (osteomyelitis) or complex abscess.'
        };
      case 4:
        return {
          title: 'Grade 4: Localized Gangrene / Necrosis',
          badge: 'bg-[#FEF2F2] text-[#D94848] border-[#FCA5A5]',
          barColor: 'bg-[#D94848]',
          icon: AlertOctagon,
          desc: 'Gangrene localized to forefoot, heel, or digital rays.'
        };
      default:
        return {
          title: `Grade ${g}`,
          badge: 'bg-[#F7F8FA] text-[#64748B] border-[#E5E7EB]',
          barColor: 'bg-[#1C1E20]',
          icon: ShieldCheck,
          desc: 'Standard assessment.'
        };
    }
  };

  const currentInfo = getGradeInfo(grade);
  const Icon = currentInfo.icon;

  const gradeList = [
    { key: 'Grade 1', label: 'Wagner 1 (Superficial)', color: 'bg-[#13866A]', textColor: 'text-[#13866A]' },
    { key: 'Grade 2', label: 'Wagner 2 (Deep Tendon)', color: 'bg-[#D99124]', textColor: 'text-[#D99124]' },
    { key: 'Grade 3', label: 'Wagner 3 (Osteitis / Abscess)', color: 'bg-[#EA580C]', textColor: 'text-[#EA580C]' },
    { key: 'Grade 4', label: 'Wagner 4 (Necrosis / Gangrene)', color: 'bg-[#D94848]', textColor: 'text-[#D94848]' },
  ];

  return (
    <div className="bg-white rounded-lg p-5 border border-[#E5E7EB] shadow-card space-y-4">
      
      {/* Header with Risk Level */}
      <div className="flex items-start justify-between">
        <div>
          <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block">
            AI Classification Result
          </span>
          <h4 className="text-base font-bold text-[#202938] mt-0.5">
            {currentInfo.title}
          </h4>
        </div>

        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border flex items-center gap-1 ${currentInfo.badge}`}>
          <Icon className="w-3.5 h-3.5" />
          {riskSeverity}
        </span>
      </div>

      {/* Main Confidence Metric Hero */}
      <div className="flex items-center space-x-4 bg-[#F7F8FA] p-3.5 rounded-md border border-[#E5E7EB]">
        
        {/* Radial meter visual */}
        <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            <path
              className="text-[#E5E7EB]"
              strokeWidth="3.5"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className={grade === 4 ? "text-[#D94848]" : grade === 3 ? "text-[#EA580C]" : grade === 2 ? "text-[#D99124]" : "text-[#13866A]"}
              strokeDasharray={`${percentage}, 100`}
              strokeWidth="3.5"
              strokeLinecap="round"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <div className="absolute text-center">
            <span className="text-xs font-bold text-[#202938] block leading-tight">
              {percentage}%
            </span>
          </div>
        </div>

        <div className="text-xs text-[#202938] leading-relaxed">
          <div className="font-bold text-[#202938] mb-0.5">
            Model Certainty: {percentage}% Diagnostic Confidence
          </div>
          <p className="text-[#64748B] text-[11px]">
            {currentInfo.desc}
          </p>
        </div>

      </div>

      {/* Multi-class Probability Breakdown */}
      <div className="space-y-2 pt-1">
        <div className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
          Class Probability Distribution
        </div>

        <div className="space-y-1.5">
          {gradeList.map((item) => {
            const rawProb = probabilities ? (probabilities[item.key] || probabilities[item.key.replace('Wagner ', 'Grade ')] || 0) : 0;
            const probPct = Math.round(rawProb * 100);

            return (
              <div key={item.key} className="space-y-0.5">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-[#202938]">{item.label}</span>
                  <span className={`font-bold ${item.textColor}`}>{probPct}%</span>
                </div>
                <div className="w-full h-1.5 bg-[#E5E7EB] rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${item.color}`}
                    style={{ width: `${Math.max(2, probPct)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
