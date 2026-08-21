import React from 'react';
import { ACCOMMODATION_TYPES } from '@/lib/roomieConstants';
import { Check } from 'lucide-react';

const META = {
  Hostel: { emoji: '🏫', desc: 'Shared hostel rooms & buildings' },
  PG: { emoji: '🏠', desc: 'Paying guest accommodations' },
  Flat: { emoji: '🏢', desc: 'Independent flats & apartments' },
};

export default function StepAccommodation({ data, update }) {
  return (
    <div>
      <p className="text-sm text-slate-500 mb-4">Where are you looking to stay?</p>
      <div className="grid sm:grid-cols-3 gap-3">
        {ACCOMMODATION_TYPES.map((type) => {
          const selected = data.accommodationType === type;
          return (
            <button key={type} type="button" onClick={() => update({ accommodationType: type })}
              className={`relative rounded-2xl p-5 text-left border-2 transition-all ${
                selected ? 'border-rose-500 bg-rose-50' : 'border-slate-200 bg-white hover:border-rose-300'
              }`}>
              {selected && (
                <span className="absolute top-3 right-3 inline-flex items-center gap-1 text-xs font-semibold text-rose-600">
                  <Check className="w-3 h-3" /> Selected
                </span>
              )}
              <div className="text-3xl mb-2">{META[type].emoji}</div>
              <div className="font-semibold text-slate-800">{type}</div>
              <div className="text-xs text-slate-500 mt-1">{META[type].desc}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}