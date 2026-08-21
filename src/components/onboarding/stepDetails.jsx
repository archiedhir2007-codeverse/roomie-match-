import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import PillToggle from './PillToggle';

const APPLIANCES = ['Fridge', 'Washing machine', 'Microwave', 'TV', 'AC', 'Cooler', 'Water purifier', 'Geyser', 'Other'];

function OptionRow({ label, options, value, onChange }) {
  return (
    <div>
      <Label className="block mb-2 text-sm">{label}</Label>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button key={o} type="button" onClick={() => onChange(o)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              value === o ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white border-transparent' : 'bg-white text-slate-600 border-slate-200'
            }`}>{o}</button>
        ))}
      </div>
    </div>
  );
}

export default function StepDetails({ data, update, updateDetails }) {
  const d = data.details || {};
  const accom = data.accommodationType;

  const toggleAppliance = (a) => {
    const list = new Set(d.appliances || []);
    if (list.has(a)) list.delete(a); else list.add(a);
    updateDetails({ appliances: Array.from(list) });
  };

return (
    <div className="space-y-5">
      {accom === 'Hostel' && (
        <>
          <div className="space-y-2">
            <Label className="text-sm">Preferred hostel / building</Label>
            <Input value={d.preferredHostel || ''} onChange={(e) => updateDetails({ preferredHostel: e.target.value })}
              placeholder="e.g. Block C, IIT Delhi" className="h-12 rounded-xl" />
          </div>
          <OptionRow label="AC / Cooler / Fan preference" options={['AC', 'Cooler', 'Fan']}
            value={d.acCoolerFan} onChange={(v) => updateDetails({ acCoolerFan: v })} />
        </>
      )}

      {accom === 'PG' && (
        <>
          <OptionRow label="AC or Non-AC" options={['AC', 'Non-AC']} value={d.acNonAc} onChange={(v) => updateDetails({ acNonAc: v })} />
          <div className="bg-white rounded-xl p-3 border border-slate-100">
            <Label className="block mb-2 text-sm">Is the owner living inside the property?</Label>
            <PillToggle value={d.ownerOnSite} onChange={(v) => updateDetails({ ownerOnSite: v })} />
          </div>
          <div className="bg-white rounded-xl p-3 border border-slate-100">
            <Label className="block mb-2 text-sm">Attached bathroom required?</Label>
            <PillToggle value={d.attachedBathroom} onChange={(v) => updateDetails({ attachedBathroom: v })} />
          </div>
          <OptionRow label="Tiffin / Maid / Neither" options={['Tiffin', 'Maid', 'Neither']}
            value={d.tiffinMaid} onChange={(v) => updateDetails({ tiffinMaid: v })} />
          <OptionRow label="How should bills be handled?" options={['Equal split', 'Individual usage', 'Other']}
            value={d.billSplit} onChange={(v) => updateDetails({ billSplit: v })} />
          <div className="space-y-2">
            <Label className="text-sm">Work timings</Label>
            <Input value={d.workTimings || ''} onChange={(e) => updateDetails({ workTimings: e.target.value })}
              placeholder="e.g. 9am - 6pm" className="h-12 rounded-xl" />
          </div>
        </>
      )}

      {accom === 'Flat' && (
        <>
          <div className="space-y-2">
            <Label className="text-sm">Preferred locality</Label>
            <Input value={d.locality || ''} onChange={(e) => updateDetails({ locality: e.target.value })}
              placeholder="e.g. Koramangala, Bangalore" className="h-12 rounded-xl" />
          </div>
          <OptionRow label="Furnished state" options={['Furnished', 'Semi-furnished', 'Unfurnished']}
            value={d.furnished} onChange={(v) => updateDetails({ furnished: v })} />
          <div>
            <Label className="block mb-2 text-sm">Appliances available / required</Label>
            <div className="flex flex-wrap gap-2">
              {APPLIANCES.map((a) => (
                <button key={a} type="button" onClick={() => toggleAppliance(a)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                    (d.appliances || []).includes(a) ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white border-transparent' : 'bg-white text-slate-600 border-slate-200'
                  }`}>{a}</button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-sm">Work / study timings</Label>
            <Input value={d.workTimings || ''} onChange={(e) => updateDetails({ workTimings: e.target.value })}
              placeholder="e.g. 10am - 7pm" className="h-12 rounded-xl" />
          </div>
        </>
      )}
    </div>
  );
}
