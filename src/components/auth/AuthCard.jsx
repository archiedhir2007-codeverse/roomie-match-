
import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useRoomieAuth } from '@/lib/roomieAuth';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { SECURITY_QUESTIONS } from '@/lib/roomieConstants';

export default function AuthCard() {
  const { login, signup, token, account } = useRoomieAuth();
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [gender, setGender] = useState('');
  const [question, setQuestion] = useState(SECURITY_QUESTIONS[0]);
  const [customQuestion, setCustomQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState('');
  const [recoveredQuestion, setRecoveredQuestion] = useState('');
  const [forgotStep, setForgotStep] = useState('email');

  if (token && account) {
    return <Navigate to={account.profileCompleted ? '/swipe' : '/onboarding'} replace />;
  }

  const reset = () => { setError(''); setInfo(''); };

  const handleLogin = async (e) => {
    e.preventDefault(); reset(); setLoading(true);
    try { await login(email, password); }
    catch (err) { setError(err.response?.data?.error || err.message || 'Invalid email or password'); }
    finally { setLoading(false); }
  };

  const handleSignup = async (e) => {
    e.preventDefault(); reset();
    if (!gender) { setError('Please select Girl or Boy'); return; }
    const finalQuestion = question === 'Custom question' ? customQuestion.trim() : question;
    if (!finalQuestion) { setError('Please choose or write a security question'); return; }
    if (!answer.trim()) { setError('Please answer your security question'); return; }
    setLoading(true);
    try {
      await signup({ email, password, gender, securityQuestion: finalQuestion, securityAnswer: answer });
    } catch (err) { setError(err.response?.data?.error || err.message || 'Signup failed'); }
    finally { setLoading(false); }
  };

  const handleGetQuestion = async (e) => {
    e.preventDefault(); reset(); setLoading(true);
    try {
      const res = await base44.functions.invoke('roomie_recover_question', { email });
      setRecoveredQuestion(res.data.question);
      setForgotStep('answer');
    } catch (err) { setError(err.response?.data?.error || 'Could not
 find account'); }
    finally { setLoading(false); }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault(); reset(); setLoading(true);
    try {
      await base44.functions.invoke('roomie_recover_reset', { email, securityAnswer: answer, newPassword });
      setInfo('Password reset! Redirecting to login…');
      setTimeout(() => {
        setMode('login'); setForgotStep('email'); setAnswer(''); setNewPassword(''); setRecoveredQuestion(''); setInfo('');
      }, 1500);
    } catch (err) { setError(err.response?.data?.error || 'Reset failed'); }
    finally { setLoading(false); }
  };

  const pillBtn = (active, onClick, label) => (
    <button type="button" onClick={onClick}
      className={`flex-1 py-2.5 rounded-full text-sm font-semibold transition-all ${
        active ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md' : 'bg-white/70 text-slate-600 hover:bg-white'
      }`}>{label}</button>
  );

  return (
    <div className="w-full max-w-md mx-auto bg-white/95 backdrop-blur rounded-3xl shadow-xl p-6 sm:p-8">
      <div className="flex gap-2 mb-6 p-1 bg-rose-50 rounded-full">
        {pillBtn(mode === 'login', () => { setMode('login'); reset(); }, 'Log In')}
        {pillBtn(mode === 'signup', () => { setMode('signup'); reset(); }, 'Create Account')}
      </div>

      {mode === 'forgot' && (
        <div className="mb-4 text-center">
          <button type="button" onClick={() => { setMode('login'); setForgotStep('email'); reset(); }}
            className="text-xs text-rose-500 hover:underline">← Back to login</button>
        </div>
      )}

      {error && <div className="mb-4 p-3 rounded-xl bg-rose-50 text-rose-600 text-sm">{error}</div>}
      {info && <div className="mb-4 p-3 rounded-xl bg-emerald-50 text-emerald-600 text-sm">{info}</div>}

      {mode === 'login' && (
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@example.com" value={email}
              onChange={(e) => setEmail(e.target.value)} className="h-12 rounded-xl" required />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="password">Password</Label>
              <button type="button" onClick={() => { setMode('forgot'); setForgotStep('email'); reset(); }}
                className="text-xs text-rose-500 hover:underline">Forgot password?</button>
            </div>
            <Input id="password" type="password" placeholder="••••••••" value={password}
              onChange={(e) => setPassword(e.target.value)} className="h-12 rounded-xl" required />
          </div>
          <Button type="submit" disabled={loading}
            className="w-full h-12 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Log In'}
          </Button>
        </form>
      )}
{mode === 'signup' && (
        <form onSubmit={handleSignup} className="space-y-4">
          <div className="space-y-2">
            <Label>Email</Label>
            <Input type="email" placeholder="you@example.com" value={email}
              onChange={(e) => setEmail(e.target.value)} className="h-12 rounded-xl" required />
          </div>
          <div className="space-y-2">
            <Label>Password</Label>
            <Input type="password" placeholder="Min 6 characters" value={password}
              onChange={(e) => setPassword(e.target.value)} className="h-12 rounded-xl" required />
          </div>
          <div className="space-y-2">
            <Label>I am a</Label>
            <div className="flex gap-2">
              {pillBtn(gender === 'Girl', () => setGender('Girl'), 'Girl')}
              {pillBtn(gender === 'Boy', () => setGender('Boy'), 'Boy')}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="question">Security question</Label>
            <select id="question" value={question} onChange={(e) => setQuestion(e.target.value)}
              className="w-full h-12 rounded-xl border border-input bg-white px-3 text-sm">
              {SECURITY_QUESTIONS.map((q) => <option key={q} value={q}>{q}</option>)}
            </select>
          </div>
          {question === 'Custom question' && (
            <div className="space-y-2">
              <Label>Your custom question</Label>
              <Input value={customQuestion} onChange={(e) => setCustomQuestion(e.target.value)}
                placeholder="Type your question" className="h-12 rounded-xl" required />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="answer">Your answer</Label>
            <Input id="answer" value={answer} onChange={(e) => setAnswer(e.target.value)}
              placeholder="This helps reset your password" className="h-12 rounded-xl" required />
          </div>
          <Button type="submit" disabled={loading}
            className="w-full h-12 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Account'}
          </Button>
        </form>
      )}

      {mode === 'forgot' && forgotStep === 'email' && (
        <form onSubmit={handleGetQuestion} className="space-y-4">
          <p className="text-sm text-slate-500 text-center">Enter your registered email to recover your password.</p>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input type="email" placeholder="you@example.com" value={email}
              onChange={(e) => setEmail(e.target.value)} className="h-12 rounded-xl" required />
          </div>
          <Button type="submit" disabled={loading}
            className="w-full h-12 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Continue'}
          </Button>
        </form>
      )}

      {mode === 'forgot' && forgotStep === 'answer' && (
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div className="p-3 rounded-xl bg-rose-50 text-sm text-slate-700">
            <span className="font-medium">Security question:</span><br />
            {recoveredQuestion}
          </div>
          <div className="space-y-2">
            <Label>Your answer</Label>
            <Input value={answer} onChange={(e) => setAnswer(e.target.value)}
              placeholder="Type your answer" className="h-12 rounded-xl" required />
          </div>
          <div className="space-y-2">
            <Label>New password</Label>
            <Input type="password" placeholder="Min 6 characters" value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)} className="h-12 rounded-xl" required />
          </div>
          <Button type="submit" disabled={loading}
            className="w-full h-12 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Reset Password'}
          </Button>
        </form>
      )}
    </div>
  );
}