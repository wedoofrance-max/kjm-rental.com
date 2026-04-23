'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    setLoading(false);
    if (res.ok) {
      router.push('/admin/dashboard');
    } else {
      setError('Wrong password. Try again.');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center gap-3 justify-center mb-10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-orange-700 flex items-center justify-center">
            <span className="text-white font-bold text-lg">K</span>
          </div>
          <span className="text-white font-bold text-2xl">KJM Admin</span>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8">
          <h1 className="text-white font-bold text-xl mb-1">Sign in</h1>
          <p className="text-neutral-500 text-sm mb-6">Access the booking dashboard</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                autoFocus
                className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white placeholder-neutral-600 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-colors"
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm font-medium">{error}</p>
            )}

            <button
              type="submit"
              disabled={!password || loading}
              className="w-full py-3 bg-primary-500 hover:bg-primary-600 disabled:bg-neutral-700 disabled:text-neutral-500 text-white font-bold rounded-xl transition-colors"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>

        <p className="text-center text-neutral-600 text-xs mt-6">KJM Rental · Admin access only</p>
      </div>
    </div>
  );
}
