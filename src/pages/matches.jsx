
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRoomieAuth } from '@/lib/roomieAuth';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Phone, Copy, Check, ArrowLeft, Heart, Clock } from 'lucide-react';

export default function Matches() {
  const { token, logout } = useRoomieAuth();
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [numberInputs, setNumberInputs] = useState({});
  const [submittingId, setSubmittingId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke('roomie_get_matches', { token });
      setMatches(res.data.matches || []);
    } catch (e) {} finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const submitNumber = async (matchId) => {
    const num = numberInputs[matchId];
    if (!num || !num.trim()) return;
    setSubmittingId(matchId);
    try {
      await base44.functions.invoke('roomie_submit_number', { token, matchId, number: num });
      await load();
    } catch (e) {} finally { setSubmittingId(null); }
  };

  const copyNumber = (matchId, num) => {
    navigator.clipboard?.writeText(num);
    setCopiedId(matchId);
    setTimeout(() => setCopiedId(null), 2000);
  };  

 return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFD3A5] via-[#C8A8E9] to-[#A8E6CF]">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate('/swipe')} className="rounded-full">
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-2xl font-extrabold text-slate-800">Your Matches</h1>
          </div>
          <Button variant="ghost" size="sm" onClick={logout} className="rounded-full text-slate-600">Logout</Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-rose-500" /></div>
        ) : matches.length === 0 ? (
          <div className="text-center py-20 text-slate-600">
            <div className="text-5xl mb-3">💔</div>
            <p className="font-semibold">No matches yet</p>
            <p className="text-sm text-slate-500 mt-1">Keep swiping to find your roommate!</p>
            <Button onClick={() => navigate('/swipe')} className="mt-4 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white">Start swiping</Button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {matches.map((m) => (
              <div key={m.matchId} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="p-4 flex items-center gap-3 bg-gradient-to-r from-pink-50 to-rose-50">
                  {m.otherProfile?.photoUrl ? (
                    <img src={m.otherProfile.photoUrl} alt={m.otherProfile.name} className="w-12 h-12 rounded-full object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-rose-200" />
                  )}
                  <div className="flex-1">
                    <div className="font-bold text-slate-800">{m.otherProfile?.name || 'Roommate'}</div>
                    <div className="text-xs text-slate-500">{m.otherProfile?.city} · {m.otherProfile?.accommodationType}</div>
                  </div>
                  <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
                </div>

                <div className="p-4">
                  {!m.myNumber ? (
                    <>
                      <p className="text-sm text-slate-600 mb-2">Enter your number to connect:</p>
                      <div className="flex gap-2">
                        <Input value={numberInputs[m.matchId] || ''} onChange={(e) => setNumberInputs((s) => ({ ...s, [m.matchId]: e.target.value }))}
                          placeholder="Your phone number" className="h-11 rounded-xl" />
                        <Button onClick={() => submitNumber(m.matchId)} disabled={!numberInputs[m.matchId] || submittingId === m.matchId}
                          className="rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white">
                          {submittingId === m.matchId ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit'}
                        </Button>
                      </div>
                    </>
                  ) : m.bothSubmitted ? (
                    <>
                      <p className="text-sm font-medium text-emerald-600 mb-1">You're connected! 🎉</p>
                      <p className="text-xs text-slate-500 mb-2">{m.otherProfile?.name}'s number:</p>
                      <div className="flex items-center gap-2 bg-slate-50 rounded-xl p-2">
                        <Phone className="w-4 h-4 text-rose-500" />
                        <span className="flex-1 font-mono text-sm text-slate-700">{m.otherNumber}</span>
                        <button onClick={() => copyNumber(m.matchId, m.otherNumber)} className="p-1.5 rounded-lg hover:bg-slate-200">
                          {copiedId === m.matchId ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-slate-500" />}
                        </button>
                        <a href__={`tel:${m.otherNumber}`} className="p-1.5 rounded-lg hover:bg-slate-200">
                          <Phone className="w-4 h-4 text-emerald-500" />
                        </a>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center gap-2 text-slate-500 text-sm">
                      <Clock className="w-4 h-4 animate-pulse" />
                      Waiting for {m.otherProfile?.name} to share their number…
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}