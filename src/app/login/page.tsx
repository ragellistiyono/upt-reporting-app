'use client';

import { useState, useEffect, Suspense, type FormEvent } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSearchParams } from 'next/navigation';
import { MESSAGES } from '@/lib/constants';
import Image from 'next/image';

// Force dynamic rendering - prevent static caching
export const dynamic = 'force-dynamic';

const EMAIL_DOMAIN = '@digitalcommtrack.com';

function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, isAuthenticated, role, isLoading: authLoading } = useAuth();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');

  // Check if user is already authenticated and redirect
  useEffect(() => {
    if (!authLoading && isAuthenticated && role) {
      // User is already authenticated, redirect them
      let redirectUrl = '/';
      
      if (redirect && redirect !== '/login') {
        redirectUrl = redirect;
      } else if (role === 'admin') {
        redirectUrl = '/admin';
      } else if (role === 'uptuser') {
        redirectUrl = '/upt';
      }
      
      window.location.href = redirectUrl;
    }
  }, [isAuthenticated, role, authLoading, redirect]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const email = username.trim().toLowerCase() + EMAIL_DOMAIN;
      await login(email, password);
      
      // Login successful - redirect appropriately
      setTimeout(() => {
        const redirectUrl = redirect && redirect !== '/login' ? redirect : '/';
        window.location.href = redirectUrl;
      }, 200);
      
    } catch {
      setError(MESSAGES.ERROR.INVALID_CREDENTIALS);
      setIsLoading(false);
    }
  };

  // Show loading while checking auth status
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-linear-to-br from-pln-blue to-pln-blue-dark">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-white text-sm">Memeriksa sesi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-linear-to-br from-pln-blue to-pln-blue-dark">
      {/* Login Card */}
      <div className="w-full max-w-md animate-scaleIn">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header with PLN Branding */}
          <div className="bg-pln-blue px-8 py-6 text-center">
            {/* PLN Logo */}
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="relative w-14 h-14">
                <Image 
                  src="/Logo_PLN.png" 
                  alt="Logo PLN" 
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <div className="text-left">
                <h1 className="text-2xl font-bold text-white">PLN</h1>
                <p className="text-pln-yellow text-xs font-medium">UPT Reporting</p>
              </div>
            </div>
            <p className="text-blue-100 text-sm mt-2">Sistem Pelaporan Kinerja Unit Pelaksana Teknis</p>
          </div>

          {/* Form Section */}
          <div className="px-8 py-8">
            {/* Welcome Text */}
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Selamat Datang</h2>
              <p className="text-gray-500 text-sm mt-1">Silakan masuk ke akun Anda</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4 animate-fadeIn">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Username Input */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={isLoading}
                  autoComplete="username"
                  className="w-full bg-white border border-gray-300 text-gray-800 px-4 py-3 rounded-lg
                            focus:border-pln-blue focus:ring-2 focus:ring-pln-blue/20 focus:outline-none
                            disabled:bg-gray-100 disabled:cursor-not-allowed
                            transition-all duration-200 placeholder:text-gray-400"
                  placeholder="username"
                />
              </div>

              {/* Password Input */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Kata Sandi
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="w-full bg-white border border-gray-300 text-gray-800 px-4 py-3 rounded-lg
                            focus:border-pln-blue focus:ring-2 focus:ring-pln-blue/20 focus:outline-none
                            disabled:bg-gray-100 disabled:cursor-not-allowed
                            transition-all duration-200 placeholder:text-gray-400"
                  placeholder="••••••••"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-pln-blue text-white font-semibold py-3 px-6 rounded-lg
                           hover:bg-pln-blue-dark
                           disabled:bg-gray-300 disabled:cursor-not-allowed
                           transition-all duration-200 transform hover:scale-[1.01] active:scale-[0.99]
                           shadow-lg hover:shadow-xl"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Memproses...
                  </span>
                ) : (
                  'Masuk'
                )}
              </button>
            </form>
          </div>

          {/* Footer */}
          <div className="px-8 py-4 bg-gray-50 border-t border-gray-100">
            <p className="text-gray-400 text-xs text-center">
              © 2025 PLN Indonesia. Hak Cipta Dilindungi.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center px-4 bg-linear-to-br from-pln-blue to-pln-blue-dark">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-white text-sm">Memuat...</p>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
