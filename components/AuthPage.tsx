import React, { useState } from 'react';
import { GraduationCap, Eye, EyeOff, AlertCircle, Loader } from 'lucide-react';
import { login, signup } from '../services/apiService';

interface AuthPageProps {
  onAuthSuccess: (userId: string, token: string, name?: string, role?: string) => void;
  initialMode?: 'login' | 'signup';
}

export const AuthPage: React.FC<AuthPageProps> = ({ onAuthSuccess, initialMode = 'login' }) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'graduate',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleSubmit = async () => {
    setError(null);
    setSuccess(null);

    // Basic validation
    if (!form.email || !form.password) {
      setError('Please fill in all required fields.');
      return;
    }
    if (mode === 'signup' && !form.name) {
      setError('Please enter your name.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await login({ email: form.email, password: form.password });
        if (res.token) {
          onAuthSuccess(res.user_id || '', res.token, (res as any).name, (res as any).role);
        } else {
          setError('Invalid email or password. Please try again.');
        }
      } else {
        const res = await signup({ name: form.name, email: form.email, password: form.password, role: form.role });
        if (res.user_id) {
          setSuccess('Account created! Please log in.');
          setMode('login');
          setForm({ ...form, password: '' });
        } else {
          setError(res.error || 'Signup failed. Please try again.');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">

      {/* Logo */}
      <div className="flex items-center gap-3 mb-12">
        <div className="bg-indigo-600 p-3 rounded-2xl shadow-xl shadow-indigo-100">
          <GraduationCap className="text-white w-8 h-8" />
        </div>
        <span className="font-serif font-black text-4xl tracking-tight text-slate-900">
          Graduate
        </span>
      </div>

      {/* Card */}
      <div className="w-full max-w-md bg-white rounded-[3rem] shadow-2xl shadow-slate-200 p-10 border border-slate-100">

        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-serif font-black text-slate-900 mb-2">
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </h1>
          <p className="text-slate-400 font-medium text-sm">
            {mode === 'login'
              ? 'Sign in to access your Graduate dashboard'
              : 'Join the Graduate professional network'}
          </p>
        </div>

        {/* Toggle */}
        <div className="flex bg-slate-50 rounded-2xl p-1 mb-8">
          <button
            onClick={() => { setMode('login'); setError(null); }}
            className={`flex-1 py-3 rounded-xl font-black uppercase tracking-widest text-xs transition-all ${
              mode === 'login'
                ? 'bg-white text-slate-900 shadow-md'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setMode('signup'); setError(null); }}
            className={`flex-1 py-3 rounded-xl font-black uppercase tracking-widest text-xs transition-all ${
              mode === 'signup'
                ? 'bg-white text-slate-900 shadow-md'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-3 text-rose-600">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-600">
            <p className="text-sm font-medium">{success}</p>
          </div>
        )}

        {/* Form */}
        <div className="space-y-4">
          {mode === 'signup' && (
            <>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="e.g. Alex Johnson"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 p-4 rounded-2xl font-medium text-slate-900 outline-none transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                  I am a...
                </label>
                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange as any}
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 p-4 rounded-2xl font-medium text-slate-900 outline-none transition-all"
                >
                  <option value="student">Student</option>
                  <option value="graduate">Graduate</option>
                  <option value="employer">Employer</option>
                  <option value="professor">Professor</option>
                  <option value="recruiter">Recruiter</option>
                </select>
              </div>
            </>
          )}

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 p-4 rounded-2xl font-medium text-slate-900 outline-none transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Min. 6 characters"
                value={form.password}
                onChange={handleChange}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 p-4 pr-12 rounded-2xl font-medium text-slate-900 outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full mt-4 py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-900 transition-all shadow-xl shadow-indigo-100 active:scale-95 flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader size={16} className="animate-spin" />
                {mode === 'login' ? 'Signing in...' : 'Creating account...'}
              </>
            ) : (
              mode === 'login' ? 'Sign In' : 'Create Account'
            )}
          </button>
        </div>

        {/* Footer note */}
        <p className="text-center text-[10px] text-slate-400 font-medium mt-8 uppercase tracking-widest">
          {mode === 'login'
            ? "Don't have an account? "
            : 'Already have an account? '}
          <button
            onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(null); }}
            className="text-indigo-600 font-black hover:underline"
          >
            {mode === 'login' ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </div>

      <p className="mt-8 text-[10px] text-slate-400 font-black uppercase tracking-widest">
        Graduate — Career & Education Hub
      </p>
    </div>
  );
};