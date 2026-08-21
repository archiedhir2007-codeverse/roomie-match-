
import React from 'react';
import AuthCard from '@/components/auth/AuthCard';
import { Heart, Sparkles, MessageCircle } from 'lucide-react';

const FEATURES = [
  { icon: Heart, title: 'Hostel, PG or Flat', desc: 'Find roommates for any setup' },
  { icon: Sparkles, title: 'Compatibility score', desc: 'Matched on real habits' },
  { icon: MessageCircle, title: 'Match, then connect', desc: 'Share numbers only on match' },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFD3A5] via-[#C8A8E9] to-[#A8E6CF]">
      <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="text-center lg:text-left order-2 lg:order-1">
            <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full bg-white/60 backdrop-blur">
              <span className="text-2xl">🏠</span>
              <span className="font-semibold text-slate-700">Roomie Match</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight text-slate-800 mb-4">
              Find a roommate who{' '}
              <span className="bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">
                fits your lifestyle.
              </span>
            </h1>
            <p className="text-base sm:text-lg text-slate-600 mb-8 max-w-lg mx-auto lg:mx-0">
              Roomie Match matches students and young professionals on the things that actually cause
              fights — late nights, lights, guests, noise and AC. Swipe, match, then connect.
            </p>
            <div className="grid sm:grid-cols-3 gap-3 max-w-2xl mx-auto lg:mx-0">
              {FEATURES.map((f) => (
                <div key={f.title} className="bg-white/70 backdrop-blur rounded-2xl p-4 text-left">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 flex items-center justify-center mb-2">
                    <f.icon className="w-4 h-4 text-white" />
                  </div>
                  <div className="font-semibold text-sm text-slate-800">{f.title}</div>
                  <div className="text-xs text-slate-500">{f.desc}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <AuthCard />
          </div>
        </div>
      </div>
    </div>
  );
}