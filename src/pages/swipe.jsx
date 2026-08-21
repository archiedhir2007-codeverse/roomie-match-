import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRoomieAuth } from '@/lib/roomieAuth';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Heart, X, MessageCircle, LogOut } from 'lucide-react';
import confetti from 'canvas-confetti';
import SwipeCard from '@/components/swipe/SwipeCard';

export default function Swipe() {
  const { token, account, logout } = useRoomieAuth();
  const navigate = useNavigate();
  const [deck, setDeck] = useState([]);
  const [loading, setLoading] = useState(true);
  const [swiping, setSwiping] = useState(false);
  const [matchInfo, setMatchInfo] = useState(null);
  const [number, setNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadDeck = async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke('roomie_get_deck', { token });
      setDeck(res.data.deck || []);
    } catch (e) {} finally { setLoading(false); }
  };

  useEffect(() => { loadDeck(); }, []);

  const celebrate = () => {
    confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 }, colors: ['#FF4D8D', '#A855F7', '#2DD4BF', '#FBBF24'] });
    setTimeout(() => confetti({ particleCount: 80, angle: 60, spread: 70, origin: { x: 0, y: 0.7 } }), 200);
    setTimeout(() => confetti({ particleCount: 80, angle: 120, spread: 70, origin: { x: 1, y: 0.7 } }), 400);
  };

  const handleSwipe = async (action) => {
    if (swiping || deck.length === 0) return;
    const current = deck[0];
    setSwiping(true);
    try {
      const res = await base44.functions.invoke('roomie_swipe', { token, targetProfileId: current.profileId, action });
      if (action === 'like' && res.data.matched) {
        celebrate();
        setMatchInfo({ matchId: res.data.matchId, otherProfile: current });
      }
      setDeck((d) => d.slice(1));
    } catch (e) {} finally { setSwiping(false); }
  };

  const submitNumber = async () => {
    if (!number.trim() || !matchInfo) return;
    setSubmitting(true);
    try {
      await base44.functions.invoke('roomie_submit_number', { token, matchId: matchInfo.matchId, number });
      setMatchInfo(null); setNumber('');
      navigate('/matches');
    } catch (e) {} finally { setSubmitting(false); }
  };

  const current = deck[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFD3A5] via-[#C8A8E9] to-[#A8E6CF]">
      <div className="max-w-md mx-auto px-4 py-6 flex flex-col h-screen">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-extrabold text-slate-800">Roomie Match</h1>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate('/matches')} className="rounded-full">
              <MessageCircle className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={logout} className="rounded-full">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex-1 relative flex items-center justify-center">
          {loading ? (
            <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
          ) : deck.length === 0 ? (
            <div className="text-center text-slate-600 px-6">
              <div className="text-5xl mb-3">🎉</div>
              <p className="font-semibold">That's everyone for now!</p>
              <p className="text-sm text-slate-500 mt-1">Check back later for more roommates in your category.</p>
              <Button onClick={loadDeck} className="mt-4 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white">Refresh</Button>
            </div>
          ) : (
            <div className="relative w-full h-[60vh] max-h-[520px]">
              {deck[1] && (
                <div className="absolute inset-0 scale-95 opacity-60">
                  <SwipeCard profile={deck[1]} draggable={false} />
                </div>
              )}
              <SwipeCard profile={current} onSwipe={handleSwipe} />
            </div>
          )}
        </div>

        {!loading && deck.length > 0 && (
          <div className="flex justify-center gap-6 pt-4">
            <button onClick={() => handleSwipe('pass')} disabled={swiping}
              className="w-14 h-14 rounded-full bg-white shadow-lg flex items-center justify-center text-rose-500 hover:scale-110 transition-transform disabled:opacity-50">
              <X className="w-7 h-7" />
            </button>
            <button onClick={() => handleSwipe('like')} disabled={swiping}
              className="w-14 h-14 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 shadow-lg flex items-center justify-center text-white hover:scale-110 transition-transform disabled:opacity-50">
              <Heart className="w-7 h-7" />
            </button>
          </div>
        )}
      </div>

      {matchInfo && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center">
            <div className="text-4xl mb-2">💕</div>
            <h2 className="text-2xl font-bold text-slate-800">You matched!</h2>
            <p className="text-sm text-slate-500 mt-1">Enter your number to connect with {matchInfo.otherProfile.name}.</p>
            <Input value={number} onChange={(e) => setNumber(e.target.value)}
              placeholder="Your phone number" className="h-12 rounded-xl mt-4" />
            <Button onClick={submitNumber} disabled={submitting || !number.trim()}
              className="w-full mt-3 h-12 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold">
              {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Submit'}
            </Button>
            <button onClick={() => { setMatchInfo(null); setNumber(''); }}
              className="mt-3 text-xs text-slate-400 hover:underline">Skip for now</button>
          </div>
        </div>
      )}
    </div>
  );
}