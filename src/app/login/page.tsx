'use client';

import { useState, type FormEvent } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { MESSAGES } from '@/lib/constants';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      // Redirect will be handled by middleware based on role
      router.push('/');
    } catch (err) {
      console.error('Login failed:', err);
      setError(MESSAGES.ERROR.INVALID_CREDENTIALS);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Cyberpunk Background Effects */}
      <div className="absolute inset-0 bg-linear-to-br from-cyber-darker via-cyber-dark to-cyber-light opacity-50" />
      
      {/* Animated Grid Lines */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-1/4 w-px h-full bg-linear-to-b from-transparent via-neon-blue to-transparent animate-pulse" />
        <div className="absolute top-0 left-2/4 w-px h-full bg-linear-to-b from-transparent via-neon-pink to-transparent animate-pulse delay-75" />
        <div className="absolute top-0 left-3/4 w-px h-full bg-linear-to-b from-transparent via-neon-green to-transparent animate-pulse delay-150" />
      </div>

      {/* Login Terminal Card */}
      <div className="relative z-10 w-full max-w-md">
        {/* Terminal Header */}
        <div className="bg-cyber-light border-2 border-neon-blue rounded-t-lg p-3 flex items-center gap-2 shadow-glow-blue-sm">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-neon-pink shadow-glow-pink-sm" />
            <div className="w-3 h-3 rounded-full bg-neon-green shadow-glow-green-sm" />
            <div className="w-3 h-3 rounded-full bg-neon-blue shadow-glow-blue-sm" />
          </div>
          <div className="flex-1 text-center">
            <span className="text-neon-blue font-mono text-sm tracking-wider">
              SYSTEM_ACCESS.exe
            </span>
          </div>
        </div>

        {/* Terminal Body */}
        <div className="bg-cyber-darker border-x-2 border-b-2 border-neon-blue rounded-b-lg p-8 shadow-glow-blue">
          {/* ASCII Art Header */}
          <div className="mb-6 font-mono text-neon-green text-xs leading-tight opacity-80">
            <pre className="text-center">
{`
╔═══════════════════════════════════╗
║      UPT REPORTING SYSTEM v1.0    ║
║  Build with 🔥 by Ragel Listiyono ║
╚═══════════════════════════════════╝`}
            </pre>
          </div>

          {/* System Message */}
          <div className="mb-6 border-l-2 border-neon-pink pl-3">
            <p className="text-cyber-text-dim font-mono text-xs">
              <span className="text-neon-pink">{'>'}</span> INITIALIZING AUTHENTICATION PROTOCOL...
            </p>
            <p className="text-cyber-text-dim font-mono text-xs">
              <span className="text-neon-green">{'>'}</span> NEURAL INTERFACE: READY
            </p>
            <p className="text-cyber-text-dim font-mono text-xs">
              <span className="text-neon-blue">{'>'}</span> ENTER CREDENTIALS TO PROCEED
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 bg-red-950/50 border border-red-500 rounded p-3 shadow-[0_0_10px_rgba(239,68,68,0.3)]">
              <p className="text-red-400 font-mono text-xs flex items-center gap-2">
                <span className="text-red-500">⚠</span>
                {error}
              </p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-neon-blue font-mono text-sm mb-2 tracking-wide">
                {'>'} USER_ID:
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="w-full bg-cyber-dark border-2 border-cyber-light text-cyber-text font-mono px-4 py-3 rounded
                          focus:border-neon-blue focus:shadow-glow-blue-sm focus:outline-none
                          disabled:opacity-50 disabled:cursor-not-allowed
                          transition-all duration-300"
                placeholder="user@system.pln"
              />
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-neon-pink font-mono text-sm mb-2 tracking-wide">
                {'>'} ACCESS_KEY:
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="w-full bg-cyber-dark border-2 border-cyber-light text-cyber-text font-mono px-4 py-3 rounded
                          focus:border-neon-pink focus:shadow-glow-pink-sm focus:outline-none
                          disabled:opacity-50 disabled:cursor-not-allowed
                          transition-all duration-300"
                placeholder="••••••••"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-neon-blue text-cyber-dark font-mono font-bold py-3 px-6 rounded
                         shadow-glow-blue hover:bg-neon-green hover:shadow-glow-green
                         disabled:bg-cyber-light disabled:text-cyber-text-dim disabled:shadow-none
                         transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]
                         disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="inline-block w-4 h-4 border-2 border-cyber-dark border-t-transparent rounded-full animate-spin" />
                  AUTHENTICATING...
                </span>
              ) : (
                '[ INITIATE_CONNECTION ]'
              )}
            </button>
          </form>

          {/* Footer Text */}
          <div className="mt-6 pt-6 border-t border-cyber-light">
            <p className="text-cyber-text-dim font-mono text-xs text-center">
              <span className="text-neon-purple">⬢</span> SECURED BY QUANTUM ENCRYPTION
            </p>
            <p className="text-cyber-text-dim font-mono text-xs text-center mt-1 opacity-60">
              PLN INDONESIA © 2025 - All Rights Reserved
            </p>
          </div>
        </div>
      </div>

      {/* Floating Particles Effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-neon-blue rounded-full opacity-20 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
