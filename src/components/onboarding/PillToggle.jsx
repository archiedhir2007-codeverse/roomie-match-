import React from 'react';

export default function PillToggle({ value, onChange, yesLabel = 'Yes', noLabel = 'No' }) {
  const btn = (active, label, onClick) => (
    <button type="button" onClick={onClick}
      className={`flex-1 py-2.5 rounded-full text-sm font-semibold transition-all ${
        active ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:border-rose-300'
      }`}>{label}</button>
  );
  return (
    <div className="flex gap-2">
      {btn(value === true, yesLabel, () => onChange(true))}
      {btn(value === false, noLabel, () => onChange(false))}
    </div>
  );
}
