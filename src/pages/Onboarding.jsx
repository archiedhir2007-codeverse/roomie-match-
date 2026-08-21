import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRoomieAuth } from '@/lib/roomieAuth';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, ArrowRight, Check } from 'lucide-react';
import StepBasics from '@/components/onboarding/StepBasics';
import StepAccommodation from '@/components/onboarding/StepAccommodation';
import StepLifestyle from '@/components/onboarding/StepLifestyle';
import StepDetails from '@/components/onboarding/StepDetails';
import StepPreview from '@/components/onboarding/StepPreview';

const STEPS = ['Basics', 'Accommodation', 'Lifestyle', 'Details', 'Preview'];

const EMPTY = {
  photoUrl: '', name: '', age: null, genderDetail: '', city: '', course: '', semester: '', bio: '',
  accommodationType: '', lateNights: undefined, lightOn: undefined, coolerAc: undefined, guests: undefined, noise: undefined,
  preferredFloor: '', seater: '', healthIssues: '', weeklyHolidays: [], nonNegotiables: '', details: {},
};

export default function Onboarding() {
  const { token, account, updateAccount } = useRoomieAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [data, setData] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const update = (patch) => setData((d) => ({ ...d, ...patch }));
  const updateDetails = (patch) => setData((d) => ({ ...d, details: { ...(d.details || {}), ...patch } }));

  const canProceed = () => {
    if (step === 0) return data.photoUrl && data.name && data.genderDetail;
    if (step === 1) return !!data.accommodationType;
    if (step === 2) return [data.lateNights, data.lightOn, data.coolerAc, data.guests, data.noise].every((v) => v !== undefined);
    return true;
  };
 
 const handleFinish = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await base44.functions.invoke('roomie_save_profile', { token, profile: data });
      updateAccount({ ...account, profileCompleted: true });
      navigate('/swipe');
    } catch (err) {
      setError(err.response?.data?.error || 'Could not save profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFD3A5] via-[#C8A8E9] to-[#A8E6CF]">
      <div className="max-w-2xl mx-auto px-4 py-6 sm:py-10">
        <div className="mb-6">
          <div className="flex justify-between text-xs font-medium text-slate-600 mb-2">
            <span>Step {step + 1} of 5</span>
            <span>{STEPS[step]}</span>
          </div>
          <div className="h-2 bg-white/60 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-pink-500 to-rose-500 rounded-full transition-all duration-300"
              style={{ width: `${((step + 1) / 5) * 100}%` }} />
          </div>
        </div>

        <div className="bg-white/95 backdrop-blur rounded-3xl shadow-xl p-5 sm:p-7">
          <h2 className="text-xl font-bold text-slate-800 mb-4">{STEPS[step]}</h2>

          {step === 0 && <StepBasics data={data} update={update} />}
          {step === 1 && <StepAccommodation data={data} update={update} />}
          {step === 2 && <StepLifestyle data={data} update={update} />}
          {step === 3 && <StepDetails data={data} update={update} updateDetails={updateDetails} />}
          {step === 4 && <StepPreview data={data} onEdit={(s) => setStep(s)} />}

          {error && <div className="mt-4 p-3 rounded-xl bg-rose-50 text-rose-600 text-sm">{error}</div>}

          <div className="flex justify-between mt-6 pt-4 border-t border-slate-100">
            <Button variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}
              className="rounded-full text-slate-600">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
            {step < 4 ? (
              <Button onClick={() => setStep((s) => s + 1)} disabled={!canProceed()}
                className="rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold">
                Continue <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button onClick={handleFinish} disabled={loading}
                className="rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 mr-1" />}
                Confirm & start matching
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}