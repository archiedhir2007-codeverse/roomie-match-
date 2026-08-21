import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import PillToggle from './PillToggle';
import { FLOOR_OPTIONS, SEATER_OPTIONS, WEEKDAYS } from '@/lib/roomieConstants';

const QUESTIONS = [
  { key: 'lateNights', label: 'Is it okay if your roommate stays up late?' },
  { key: 'lightOn', label: 'Is it okay to keep the light on late at night?' },
  { key: 'coolerAc', label: 'Is a cooler or AC acceptable / preferred?' },
  { key: 'guests', label: 'Are outsiders / guests allowed?' },
  { key: 'noise', label: 'Are you comfortable with noise / music?' },
];

function SectionTitle({ children }) {
  return <h3 className="font-semibold text-slate-800 pt-2">{children}</h3>;
}

export default function StepLifestyle({ data, update }) {
  const toggleHoliday = (day) => {
    const set = new Set(data.weeklyHolidays || []);
    if (set.has(day)) set.delete(day); else set.add(day);
    update({ weeklyHolidays: Array.from(set) });
  };

  return (
    <div className="space-y-5">
      <p className="text-sm text-rose-500 font-medium">Answer honestly — this drives your match score.</p>

      <div className="space-y-4">
        {QUESTIONS.map((q) => (
          <div key={q.key} className="bg-white rounded-xl p-3 border border-slate-100">
            <Label className="block mb-2 text-sm">{q.label}</Label>
            <PillToggle value={data[q.key]} onChange={(v) => update({ [q.key]: v })} />
          </div>
        ))}
      </div>

      <SectionTitle>Personal preferences</SectionTitle>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label className="block mb-2 text-sm">Preferred floor</Label>
          <div className="flex flex-wrap gap-2">
            {FLOOR_OPTIONS.map((f) => (
              <button key={f} type="button" onClick={() => update({ preferredFloor: f })}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  data.preferredFloor === f ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white border-transparent' : 'bg-white text-slate-600 border-slate-200'
                }`}>{f}</button>
            ))}
          </div>
        </div>
        <div>
          <Label className="block mb-2 text-sm">Room / flat mates (seater)</Label>
          <div className="flex flex-wrap gap-2">
            {SEATER_OPTIONS.map((s) => (
              <button key={s} type="button" onClick={() => update({ seater: s })}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  data.seater === s ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white border-transparent' : 'bg-white text-slate-600 border-slate-200'
                }`}>{s}</button>
            ))}
          </div>
        </div>
      </div>

      <SectionTitle>Health & routine</SectionTitle>
      <div className="space-y-3">
        <div className="space-y-2">
          <Label className="text-sm">Health issues or allergies</Label>
          <Input value={data.healthIssues || ''} onChange={(e) => update({ healthIssues: e.target.value })}
            placeholder="e.g. Dust allergy, none" className="h-11 rounded-xl" />
        </div>
        <div>
          <Label className="block mb-2 text-sm">Weekly holidays / days off</Label>
          <div className="flex flex-wrap gap-2">
            {WEEKDAYS.map((d) => (
              <button key={d} type="button" onClick={() => toggleHoliday(d)}
                className={`w-11 h-11 rounded-full text-xs font-semibold border transition-all ${
                  (data.weeklyHolidays || []).includes(d) ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white border-transparent' : 'bg-white text-slate-600 border-slate-200'
                }`}>{d}</button>
            ))}
          </div>
        </div>
      </div>

      <SectionTitle>Non-negotiables</SectionTitle>
      <div className="space-y-2">
        <Label className="text-sm">Any other important query or preference</Label>
        <Textarea value={data.nonNegotiables || ''} onChange={(e) => update({ nonNegotiables: e.target.value })}
          placeholder="e.g. Strictly vegetarian roommate only" className="rounded-xl min-h-[80px]" />
      </div>
    </div>
  );
}