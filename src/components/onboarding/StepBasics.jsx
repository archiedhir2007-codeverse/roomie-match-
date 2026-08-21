import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AVATARS, CITY_PLACEHOLDERS, COURSE_PLACEHOLDERS } from '@/lib/roomieConstants';

const GENDER_DETAILS = ['Female', 'Male', 'Non-binary', 'Prefer not to say'];

export default function StepBasics({ data, update }) {
  return (
    <div className="space-y-5">
      <div>
        <Label className="mb-2 block">Profile photo</Label>
        <div className="grid grid-cols-4 gap-2 sm:gap-3">
          {AVATARS.map((url) => (
            <button key={url} type="button" onClick={() => update({ photoUrl: url })}
              className={`rounded-2xl overflow-hidden border-2 transition-all aspect-square ${
                data.photoUrl === url ? 'border-rose-500 ring-2 ring-rose-200' : 'border-transparent opacity-80 hover:opacity-100'
              }`}>
              <img src={url} alt="avatar" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Name</Label>
          <Input value={data.name || ''} onChange={(e) => update({ name: e.target.value })}
            placeholder="e.g. Priya Sharma" className="h-12 rounded-xl" />
        </div>
        <div className="space-y-2">
          <Label>Age</Label>
          <Input type="number" value={data.age || ''} onChange={(e) => update({ age: e.target.value ? Number(e.target.value) : null })}
            placeholder="e.g. 21" className="h-12 rounded-xl" />
        </div>
      </div>

      <div>
        <Label className="mb-2 block">Gender</Label>
        <div className="flex flex-wrap gap-2">
          {GENDER_DETAILS.map((g) => (
            <button key={g} type="button" onClick={() => update({ genderDetail: g })}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                data.genderDetail === g ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200'
              }`}>{g}</button>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>City</Label>
          <Input value={data.city || ''} onChange={(e) => update({ city: e.target.value })}
            placeholder={CITY_PLACEHOLDERS[Math.floor(Math.random() * CITY_PLACEHOLDERS.length)]} className="h-12 rounded-xl" />
        </div>
        <div className="space-y-2">
          <Label>Course of study</Label>
          <Input value={data.course || ''} onChange={(e) => update({ course: e.target.value })}
            placeholder={COURSE_PLACEHOLDERS[Math.floor(Math.random() * COURSE_PLACEHOLDERS.length)]} className="h-12 rounded-xl" />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Semester</Label>
        <Input value={data.semester || ''} onChange={(e) => update({ semester: e.target.value })}
          placeholder="e.g. 5th semester" className="h-12 rounded-xl" />
      </div>

      <div className="space-y-2">
        <Label>Short bio</Label>
        <Textarea value={data.bio || ''} onChange={(e) => update({ bio: e.target.value })}
          placeholder="Optional, but it really helps." className="rounded-xl min-h-[90px]" />
      </div>
    </div>
  );
}
