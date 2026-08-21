import React, { createContext, useState, useContext, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const RoomieAuthContext = createContext();

const STORAGE_TOKEN = 'roomie_token';
const STORAGE_ACCOUNT = 'roomie_account';

export const RoomieAuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_TOKEN));
  const [account, setAccount] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_ACCOUNT);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  });
  const [loading, setLoading] = useState(false);

  const persist = (tok, acc) => {
    setToken(tok); setAccount(acc);
    if (tok) localStorage.setItem(STORAGE_TOKEN, tok); else localStorage.removeItem(STORAGE_TOKEN);
    if (acc) localStorage.setItem(STORAGE_ACCOUNT, JSON.stringify(acc)); else localStorage.removeItem(STORAGE_ACCOUNT);
  };

  const signup = async (data) => {
    const res = await base44.functions.invoke('roomie_signup', data);
    persist(res.data.token, res.data);
    return res.data;
  };

  const login = async (email, password) => {
    const res = await base44.functions.invoke('roomie_login', { email, password });
    persist(res.data.token, res.data);
    return res.data;
  };

  const logout = () => persist(null, null);

  const updateAccount = (acc) => {
    setAccount(acc);
    if (acc) localStorage.setItem(STORAGE_ACCOUNT, JSON.stringify(acc));
  };

  return (
    <RoomieAuthContext.Provider value={{ token, account, loading, signup, login, logout, updateAccount }}>
      {children}
    </RoomieAuthContext.Provider>
  );
};

export const useRoomieAuth = () => {
  const ctx = useContext(RoomieAuthContext);
  if (!ctx) throw new Error('useRoomieAuth must be used within RoomieAuthProvider');
  return ctx;
}