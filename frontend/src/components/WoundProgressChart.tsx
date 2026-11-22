import React from 'react';
import { 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Area, 
  AreaChart 
} from 'recharts';
import { TrendingDown, Minus, Activity } from 'lucide-react';
import { ProgressRecord } from '../types';

interface WoundProgressChartProps {
  progressRecords: ProgressRecord[];
  className?: string;
}

export const WoundProgressChart: React.FC<WoundProgressChartProps> = ({
  progressRecords,
  className = '',
}) => {
  if (!progressRecords || progressRecords.length === 0) {
    return (
      <div className="bg-white rounded-lg p-6 border border-[#E5E7EB] text-center text-[#64748B] text-xs">
        No longitudinal wound progress data recorded yet for this patient.
      </div>
    );
  }

  // Sort chronological
  const sortedRecords = [...progressRecords].sort(
    (a, b) => new Date(a.visit_date).getTime() - new Date(b.visit_date).getTime()
  );

  const initialArea = sortedRecords[0]?.wound_area_cm2 || 1;
  const latestArea = sortedRecords[sortedRecords.length - 1]?.wound_area_cm2 || 1;
  const totalReductionPct = Math.round(((initialArea - latestArea) / initialArea) * 100);

  const chartData = sortedRecords.map(r => ({
    date: r.visit_date.slice(5), // MM-DD
    fullDate: r.visit_date,
    woundArea: r.wound_area_cm2,
    granulation: r.granulation_percentage,
    grade: r.wagner_grade,
    trajectory: r.healing_trajectory,
  }));

  return (
    <div className={`bg-white rounded-lg p-6 border border-[#E5E7EB] shadow-card space-y-6 ${className}`}>
      
      {/* Header with KPI metrics */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#E5E7EB]">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-md bg-[#FDF1DC] text-[#1C1E20]">
              <Activity className="w-4 h-4" />
            </span>
            <h3 className="text-base font-bold text-[#202938]">
              Longitudinal Wound Healing Trajectory
            </h3>
          </div>
          <p className="text-xs text-[#64748B] mt-0.5">
            Tracking ulcer area reduction (cm²) and healthy granulation progression over consecutive visits
          </p>
        </div>

        {/* Healing KPI Badge */}
        <div className="flex items-center space-x-3">
          <div className="bg-[#F7F8FA] px-3.5 py-1.5 rounded-md border border-[#E5E7EB] text-right">
            <div className="text-[10px] uppercase font-bold text-[#64748B]">Total Area Reduction</div>
            <div className="text-sm font-extrabold flex items-center justify-end gap-1 text-[#13866A]">
              {totalReductionPct > 0 ? (
                <>
                  <TrendingDown className="w-4 h-4 text-[#13866A]" />
                  <span>{totalReductionPct}% Reduction</span>
                </>
              ) : (
                <>
                  <Minus className="w-4 h-4 text-[#64748B]" />
                  <span>0% Change</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recharts Area Chart */}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1C1E20" stopOpacity={0.25}/>
                <stop offset="95%" stopColor="#1C1E20" stopOpacity={0.0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F4F8" />
            <XAxis dataKey="date" stroke="#64748B" fontSize={11} tickLine={false} />
            <YAxis stroke="#64748B" fontSize={11} tickLine={false} unit=" cm²" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#202938', color: '#FFFFFF', borderRadius: '8px', border: 'none', fontSize: '12px' }}
              formatter={(value: any) => [`${value} cm²`, 'Wound Area']}
            />
            <Area 
              type="monotone" 
              dataKey="woundArea" 
              stroke="#1C1E20" 
              strokeWidth={2.5} 
              fillOpacity={1} 
              fill="url(#areaGradient)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Trajectory Timeline Footer */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-[#E5E7EB] text-xs">
        <div>
          <span className="text-[#64748B] block text-[11px]">Initial Area</span>
          <span className="font-bold text-[#202938]">{initialArea} cm²</span>
        </div>
        <div>
          <span className="text-[#64748B] block text-[11px]">Latest Area</span>
          <span className="font-bold text-[#1C1E20]">{latestArea} cm²</span>
        </div>
        <div>
          <span className="text-[#64748B] block text-[11px]">Visits Monitored</span>
          <span className="font-bold text-[#202938]">{sortedRecords.length} Clinical Visits</span>
        </div>
        <div>
          <span className="text-[#64748B] block text-[11px]">Trajectory Verdict</span>
          <span className="font-bold text-[#13866A]">
            {totalReductionPct > 15 ? 'Active Re-epithelialization' : 'Stable / Monitoring'}
          </span>
        </div>
      </div>

    </div>
  );
};
