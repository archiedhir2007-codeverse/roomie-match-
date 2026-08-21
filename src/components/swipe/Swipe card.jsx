import React from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';

export default function SwipeCard({ profile, onSwipe, draggable = true }) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const likeOpacity = useTransform(x, [0, 100], [0, 1]);
  const passOpacity = useTransform(x, [-100, 0], [1, 0]);

  const handleDragEnd = (e, info) => {
    if (info.offset.x > 100) onSwipe?.('like');
    else if (info.offset.x < -100) onSwipe?.('pass');
  };

  return (
    <motion.div drag={draggable} dragConstraints={{ left: 0, right: 0 }} dragElastic={0.7}
      onDragEnd={draggable ? handleDragEnd : undefined} style={{ x, rotate }}
      className="absolute inset-0 cursor-grab active:cursor-grabbing">
      <div className="relative w-full h-full bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="relative h-[68%] bg-gradient-to-br from-pink-200 to-rose-200">
          {profile.photoUrl ? (
            <img src={profile.photoUrl} alt={profile.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl">👤</div>
          )}
          <div className="absolute top-3 right-3 px-3 py-1.5 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white text-sm font-bold shadow-lg">
            {profile.compatibility}% match
          </div>
          <motion.div style={{ opacity: likeOpacity }} className="absolute top-6 left-6 px-3 py-1 rounded-full border-4 border-emerald-400 text-emerald-500 font-bold text-lg rotate-[-15deg]">LIKE</motion.div>
          <motion.div style={{ opacity: passOpacity }} className="absolute top-6 right-6 px-3 py-1 rounded-full border-4 border-rose-400 text-rose-500 font-bold text-lg rotate-[15deg]">NOPE</motion.div>
        </div>
        <div className="p-4 h-[32%] flex flex-col justify-center">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-xl font-bold text-slate-800">{profile.name}</h3>
            {profile.age ? <span className="text-slate-500">{profile.age}</span> : null}
          </div>
          <div className="text-sm text-slate-500 flex items-center gap-2 mt-0.5">
            <span>📍 {profile.city}</span>
            <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-600 text-xs font-semibold">{profile.accommodationType}</span>
          </div>
          {profile.tags && profile.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {profile.tags.map((t) => (
                <span key={t} className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs">{t}</span>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}