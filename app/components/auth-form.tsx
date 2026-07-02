'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { getSupabaseBrowserClient } from '../lib/supabase/client';
import GoogleLogo from './google-logo';

type Mode = 'login' | 'register' | 'forgot' | 'reset';

const adminEmail = 'hello@elxholdings.com';
const copy = {
  login: { eyebrow: 'Welcome back', title: 'Sign in to your workspace.', button: 'Sign in' },
  register: { eyebrow: 'Client account', title: 'Create your secure workspace.', button: 'Create account' },
  forgot: { eyebrow: 'Account recovery', title: 'Reset your password.', button: 'Send reset link' },
  reset: { eyebrow: 'Choose a password', title: 'Secure your account.', button: 'Update password' },
} satisfies Record<Mode, { eyebrow: string; title: string; button: string }>;

export default function AuthForm({ mode, next = '/dashboard', initialError = '' }: { mode: Mode; next?: string; initialError?: string }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState(initialError);
  const adminLogin = mode === 'login' && next.startsWith('/admin');

  async function signInWithGoogle() {
    setLoading(true);
    setMessage('');
    setError('');
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setError('Authentication is not configured for this deployment.');
      setLoading(false);
      return;
    }

    const callback = new URL('/auth/callback', window.location.origin);
    callback.searchParams.set('next', adminLogin ? '/admin' : (next.startsWith('/') ? next : '/dashboard'));
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: callback.toString(),
        queryParams: { prompt: 'select_account' },
      },
    });
    if (authError) {
      setError(authError.message);
      setLoading(false);
    }
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setError('Authentication is not configured for this deployment.');
      setLoading(false);
      return;
    }

    try {
      if (mode === 'login') {
        if (email.trim().toLowerCase() === adminEmail) throw new Error('The administrator account must use Continue with Google.');
        const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
        if (authError) throw authError;
        window.location.assign(next.startsWith('/') ? next : '/dashboard');
        return;
      }
      if (mode === 'register') {
        if (email.trim().toLowerCase() === adminEmail) throw new Error('This address is reserved for Google administrator access.');
        if (password.length < 8) throw new Error('Use at least 8 characters for your password.');
        if (password !== confirmPassword) throw new Error('The passwords do not match.');
        const { data, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName.trim() },
            emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
          },
        });
        if (authError) throw authError;
        if (data.session) {
          window.location.assign(next);
          return;
        }
        setMessage('Check your email and confirm your address. Your workspace will open after confirmation.');
      }
      if (mode === 'forgot') {
        if (email.trim().toLowerCase() === adminEmail) throw new Error('The administrator account signs in with Google and does not use password recovery.');
        const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
        });
        if (authError) throw authError;
        setMessage('If that email has an account, a password-reset link is on its way.');
      }
      if (mode === 'reset') {
        if (password.length < 8) throw new Error('Use at least 8 characters for your password.');
        if (password !== confirmPassword) throw new Error('The passwords do not match.');
        const { error: authError } = await supabase.auth.updateUser({ password });
        if (authError) throw authError;
        window.location.assign('/dashboard');
        return;
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'We could not complete that request.');
    } finally {
      setLoading(false);
    }
  }

  const item = adminLogin
    ? { eyebrow: 'Administrator access', title: 'Sign in with the E.L.X Holdings Google account.', button: 'Continue with Google' }
    : copy[mode];

  return (
    <div className="mx-auto grid w-full max-w-[1050px] bg-white lg:grid-cols-[.68fr_1.32fr]">
      <aside className="flex flex-col justify-between bg-[#073C3E] p-7 text-white md:p-9">
        <p className="text-xs font-black uppercase tracking-[.18em] text-[#DDF65C]">E.L.X Studio / Secure access</p>
        <div><p className="mt-8 text-3xl font-black leading-[.96] tracking-[-.055em]">One account.<br />Every project in sight.</p>
        <p className="mt-4 text-xs leading-5 text-white/55">Your briefs, files, messages and delivery status stay together in one secure workspace.</p></div>
        <div className="mt-7 grid grid-cols-3 border-y border-white/15 py-3 text-center text-[8px] font-black uppercase tracking-[.1em] text-white/45"><span>Private</span><span>Verified</span><span>Organized</span></div>
      </aside>
      <form onSubmit={submit} className="p-7 md:p-9 lg:p-10">
        <p className="text-xs font-black uppercase tracking-[.18em] text-[#F06449]">{item.eyebrow}</p>
        <h1 className="mt-3 max-w-xl text-4xl font-black leading-[.94] tracking-[-.055em] md:text-5xl">{item.title}</h1>
        {adminLogin && <p className="mt-5 border-l-2 border-[#DDF65C] pl-4 text-xs font-bold text-black/60">Only <span className="text-black">{adminEmail}</span> can open this control panel.</p>}
        {!adminLogin && <div className={`mt-3 grid gap-x-6 ${mode === 'register' || mode === 'login' || mode === 'reset' ? 'md:grid-cols-2' : ''}`}>
          {mode === 'register' && <Field label="Full name"><input className="elx-field" autoComplete="name" value={fullName} onChange={(event) => setFullName(event.target.value)} required /></Field>}
          {mode !== 'reset' && <Field label="Email"><input className="elx-field" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></Field>}
          {mode !== 'forgot' && <Field label={mode === 'reset' ? 'New password' : 'Password'}><input className="elx-field" type="password" minLength={8} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} value={password} onChange={(event) => setPassword(event.target.value)} required /></Field>}
          {(mode === 'register' || mode === 'reset') && <Field label="Confirm password"><input className="elx-field" type="password" minLength={8} autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required /></Field>}
        </div>}
        {error && <p className="mt-4 bg-red-50 p-3 text-xs font-bold text-red-700">{error}</p>}
        {message && <p className="mt-4 bg-[#E8F3E7] p-3 text-xs font-bold text-[#164F22]">{message}</p>}
        {adminLogin
          ? <button type="button" onClick={signInWithGoogle} disabled={loading} className="mt-6 flex items-center gap-3 border border-black/20 bg-white px-5 py-3 text-sm font-black text-black disabled:opacity-40"><GoogleLogo />{loading ? 'Opening Google...' : 'Continue with Google'}</button>
          : <button disabled={loading} className="mt-6 bg-[#102321] px-6 py-3 text-sm font-black text-white disabled:opacity-40">{loading ? 'Working...' : `${item.button} →`}</button>}
        {!adminLogin && mode === 'login' && <button type="button" onClick={signInWithGoogle} disabled={loading} className="ml-3 mt-6 inline-flex items-center gap-3 border border-black/20 bg-white px-5 py-2.5 text-sm font-black text-black disabled:opacity-40"><GoogleLogo />Continue with Google</button>}
        {!adminLogin && <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs font-bold text-black/50">
          {mode !== 'login' && <Link href="/login">Already have an account?</Link>}
          {mode === 'login' && <><Link href="/register">Create an account</Link><Link href="/forgot-password">Forgot password?</Link></>}
        </div>}
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="mt-4 block"><span className="text-xs font-black">{label}</span>{children}</label>;
}
