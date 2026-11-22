import React from 'react';
import { MapPin, Check } from 'lucide-react';

interface FootLocationPickerProps {
  selectedLocation: string;
  onChangeLocation: (location: string) => void;
  affectedFoot: string;
  onChangeFoot: (foot: string) => void;
}

const COMMON_LOCATIONS = [
  { id: 'Plantar - 1st Metatarsal Head', label: 'Plantar 1st MTP Head', desc: 'Highest peak pressure zone', zone: 'Forefoot' },
  { id: 'Plantar - 5th Metatarsal Base', label: 'Plantar 5th Metatarsal', desc: 'Lateral prominence', zone: 'Midfoot' },
  { id: 'Heel - Calcaneus (Plantar)', label: 'Plantar Calcaneus / Heel', desc: 'Deep weight-bearing zone', zone: 'Hindfoot' },
  { id: 'Hallux (Great Toe) - Distal Plantar', label: 'Hallux Distal / Apical', desc: 'Toe friction & ischemia', zone: 'Digits' },
  { id: 'Lesser Digits (2nd-4th Toes)', label: 'Lesser Digits Hammer-Toe', desc: 'PIP joint dorsal/distal', zone: 'Digits' },
  { id: 'Lateral 5th Digit (Little Toe)', label: 'Lateral 5th Digit', desc: 'Footwear compression site', zone: 'Digits' },
  { id: 'Midfoot Plantar (Charcot Arch)', label: 'Plantar Midfoot (Rocker)', desc: 'Charcot arthropathy collapse', zone: 'Midfoot' },
  { id: 'Dorsum of Foot / Anterior Ankle', label: 'Dorsal Tendon Margin', desc: 'Extensor tendon exposure', zone: 'Dorsum' },
];

export const FootLocationPicker: React.FC<FootLocationPickerProps> = ({
  selectedLocation,
  onChangeLocation,
  affectedFoot,
  onChangeFoot,
}) => {
  return (
    <div className="bg-[#F7F8FA] rounded-lg p-4 border border-[#E5E7EB]">
      
      {/* Foot Side Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 pb-3 border-b border-[#E5E7EB]">
        <div>
          <label className="text-xs font-bold text-[#202938] uppercase tracking-wider block">
            Affected Limb / Foot
          </label>
          <span className="text-[11px] text-[#64748B]">Specify anatomical lateralization</span>
        </div>

        <div className="flex items-center space-x-1.5 bg-white p-1 rounded-md border border-[#E5E7EB] shadow-subtle">
          {['Right', 'Left', 'Bilateral'].map((foot) => (
            <button
              key={foot}
              type="button"
              onClick={() => onChangeFoot(foot)}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                affectedFoot === foot
                  ? 'bg-[#1C1E20] text-white shadow-sm'
                  : 'text-[#64748B] hover:text-[#202938] hover:bg-[#F7F8FA]'
              }`}
            >
              {foot} Foot
            </button>
          ))}
        </div>
      </div>

      {/* Anatomical Locations Grid */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold text-[#202938] uppercase tracking-wider flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#1C1E20]" />
            Ulcer Lesion Anatomical Site
          </label>
          <span className="text-[11px] text-[#1C1E20] font-semibold">
            {selectedLocation}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {COMMON_LOCATIONS.map((loc) => {
            const isSelected = selectedLocation === loc.id;
            return (
              <button
                key={loc.id}
                type="button"
                onClick={() => onChangeLocation(loc.id)}
                className={`flex items-start text-left p-2.5 rounded-md border transition-all ${
                  isSelected
                    ? 'bg-[#FDF1DC] border-[#1C1E20] text-[#202938] ring-1 ring-[#1C1E20] shadow-subtle'
                    : 'bg-white border-[#E5E7EB] text-[#202938] hover:border-[#CBD5E1] hover:bg-[#F7F8FA]'
                }`}
              >
                <div className={`w-4 h-4 rounded-full border mt-0.5 mr-2.5 flex items-center justify-center shrink-0 ${
                  isSelected ? 'border-[#1C1E20] bg-[#1C1E20] text-white' : 'border-[#CBD5E1] bg-white'
                }`}>
                  {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                </div>

                <div className="min-w-0">
                  <div className="text-xs font-bold leading-tight flex items-center gap-1.5">
                    <span>{loc.label}</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#F7F8FA] text-[#64748B] border border-[#E5E7EB] font-normal">
                      {loc.zone}
                    </span>
                  </div>
                  <div className="text-[10px] text-[#64748B] mt-0.5 truncate">
                    {loc.desc}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
};
