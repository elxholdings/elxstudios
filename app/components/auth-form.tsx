'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { getSupabaseBrowserClient } from '../lib/supabase/client';

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
    ? { eyebrow: 'Administrator access', title: 'Sign in with the Elx Holdings Google account.', button: 'Continue with Google' }
    : copy[mode];

  return (
    <div className="mx-auto grid max-w-[1180px] bg-white lg:grid-cols-[.78fr_1.22fr]">
      <aside className="bg-[#073C3E] p-8 text-white md:p-12">
        <p className="text-xs font-black uppercase tracking-[.18em] text-[#DDF65C]">Elx Studio / Secure access</p>
        <p className="mt-10 text-4xl font-black leading-[.96] tracking-[-.055em]">Projects, files and conversations stay tied to one verified account.</p>
        <p className="mt-6 text-sm leading-6 text-white/55">Private storage and row-level access controls keep client work separate. Elx staff only see projects needed for delivery.</p>
      </aside>
      <form onSubmit={submit} className="p-7 md:p-12 lg:p-16">
        <p className="text-xs font-black uppercase tracking-[.18em] text-[#F06449]">{item.eyebrow}</p>
        <h1 className="mt-4 max-w-xl text-5xl font-black leading-[.94] tracking-[-.06em] md:text-6xl">{item.title}</h1>
        {adminLogin && <p className="mt-7 border-l-2 border-[#DDF65C] pl-4 text-sm font-bold text-black/60">Only <span className="text-black">{adminEmail}</span> can open this control panel.</p>}
        {!adminLogin && mode === 'register' && <Field label="Full name"><input className="elx-field" autoComplete="name" value={fullName} onChange={(event) => setFullName(event.target.value)} required /></Field>}
        {!adminLogin && mode !== 'reset' && <Field label="Email"><input className="elx-field" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></Field>}
        {!adminLogin && mode !== 'forgot' && <Field label={mode === 'reset' ? 'New password' : 'Password'}><input className="elx-field" type="password" minLength={8} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} value={password} onChange={(event) => setPassword(event.target.value)} required /></Field>}
        {!adminLogin && (mode === 'register' || mode === 'reset') && <Field label="Confirm password"><input className="elx-field" type="password" minLength={8} autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required /></Field>}
        {error && <p className="mt-6 bg-red-50 p-4 text-sm font-bold text-red-700">{error}</p>}
        {message && <p className="mt-6 bg-[#E8F3E7] p-4 text-sm font-bold text-[#164F22]">{message}</p>}
        {adminLogin
          ? <button type="button" onClick={signInWithGoogle} disabled={loading} className="mt-8 flex items-center gap-3 border border-black/20 bg-white px-6 py-4 text-sm font-black text-black disabled:opacity-40"><span aria-hidden className="text-lg font-black text-[#4285F4]">G</span>{loading ? 'Opening Google...' : 'Continue with Google'}</button>
          : <button disabled={loading} className="mt-8 bg-[#102321] px-6 py-4 text-sm font-black text-white disabled:opacity-40">{loading ? 'Working...' : `${item.button} ->`}</button>}
        {!adminLogin && mode === 'login' && <div className="mt-5"><button type="button" onClick={signInWithGoogle} disabled={loading} className="flex items-center gap-3 border border-black/20 bg-white px-5 py-3 text-sm font-black text-black disabled:opacity-40"><span aria-hidden className="text-lg font-black text-[#4285F4]">G</span>Continue with Google</button></div>}
        {!adminLogin && <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-sm font-bold text-black/50">
          {mode !== 'login' && <Link href="/login">Already have an account?</Link>}
          {mode === 'login' && <><Link href="/register">Create an account</Link><Link href="/forgot-password">Forgot password?</Link></>}
        </div>}
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="mt-7 block"><span className="text-sm font-black">{label}</span>{children}</label>;
}
