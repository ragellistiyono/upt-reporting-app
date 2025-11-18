'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { databases } from '@/lib/appwrite';
import { APPWRITE_CONFIG, INDICATOR_TYPE_LABELS, SUB_CATEGORY_LABELS } from '@/lib/constants';
import { Query } from 'appwrite';
import type { Submission } from '@/types';

export default function UPTHistoryPage() {
  const { user, role, uptName, isLoading, logout } = useAuth();
  const router = useRouter();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Verify UPT user role
  useEffect(() => {
    if (!isLoading && role !== 'uptuser') {
      router.push('/login');
    }
  }, [role, isLoading, router]);

  // Fetch user's submissions
  useEffect(() => {
    const fetchSubmissions = async () => {
      if (!user?.$id) return;

      try {
        setIsLoadingData(true);
        const response = await databases.listDocuments(
          APPWRITE_CONFIG.DATABASE_ID,
          APPWRITE_CONFIG.COLLECTIONS.SUBMISSIONS,
          [Query.equal('submitted_by_user', user.$id), Query.orderDesc('$createdAt')]
        );

        setSubmissions(response.documents as unknown as Submission[]);
      } catch (error) {
        console.error('Failed to fetch submissions:', error);
      } finally {
        setIsLoadingData(false);
      }
    };

    if (role === 'uptuser' && user) {
      fetchSubmissions();
    }
  }, [user, role]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-neon-green border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-neon-green font-mono">LOADING HISTORY...</p>
        </div>
      </div>
    );
  }

  if (role !== 'uptuser') {
    return null;
  }

  return (
    <div className="min-h-screen p-8">
      {/* Cyberpunk Header */}
      <div className="max-w-7xl mx-auto">
        {/* Top Bar */}
        <div className="bg-cyber-light border-2 border-neon-green rounded-lg p-4 mb-6 shadow-glow-green-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/upt"
                className="w-12 h-12 bg-cyber-dark border-2 border-neon-green rounded-lg flex items-center justify-center 
                           hover:bg-neon-green hover:text-cyber-dark transition-all duration-300"
              >
                <span className="font-mono font-bold text-xl">←</span>
              </Link>
              <div>
                <h1 className="text-neon-green text-3xl font-mono font-bold tracking-wider">
                  MY SUBMISSION HISTORY
                </h1>
                <p className="text-cyber-text-dim font-mono text-sm">
                  {uptName ? uptName.toUpperCase() : 'UPT USER'} {'//'} REPORT ARCHIVE
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-cyber-text font-mono text-sm">{user?.name}</p>
                <p className="text-cyber-text-dim font-mono text-xs">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="bg-cyber-dark border-2 border-neon-green text-neon-green px-4 py-2 rounded font-mono
                           hover:bg-neon-green hover:text-cyber-dark hover:shadow-glow-green-sm
                           transition-all duration-300"
              >
                LOGOUT
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoadingData && (
          <div className="bg-cyber-darker border-2 border-neon-green rounded-lg p-12 shadow-glow-green-sm">
            <div className="text-center">
              <div className="inline-block w-16 h-16 border-4 border-neon-green border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-neon-green font-mono text-lg">FETCHING SUBMISSION RECORDS...</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoadingData && submissions.length === 0 && (
          <div className="bg-cyber-darker border-2 border-neon-green rounded-lg p-12 shadow-glow-green-sm">
            <div className="text-center">
              <div className="inline-block p-6 bg-cyber-light border-2 border-neon-green rounded-lg mb-4">
                <span className="text-neon-green text-6xl">📋</span>
              </div>
              <h2 className="text-neon-green text-2xl font-mono font-bold mb-4">
                NO SUBMISSIONS YET
              </h2>
              <p className="text-cyber-text-dim font-mono mb-6">
                {'>'} You haven&apos;t submitted any reports yet.
              </p>
              <Link
                href="/upt/submit-report"
                className="inline-block bg-neon-green text-cyber-dark px-6 py-3 rounded font-mono font-bold
                           shadow-glow-green hover:bg-neon-blue hover:shadow-glow-blue
                           transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                CREATE FIRST REPORT
              </Link>
            </div>
          </div>
        )}

        {/* Data Table */}
        {!isLoadingData && submissions.length > 0 && (
          <div className="bg-cyber-darker border-2 border-neon-green rounded-lg shadow-glow-green-sm overflow-hidden">
            {/* Table Header */}
            <div className="bg-cyber-light border-b-2 border-neon-green p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-neon-green text-xl font-mono font-bold">
                  SUBMISSION RECORDS
                </h2>
                <div className="text-cyber-text-dim font-mono text-sm">
                  Total: <span className="text-neon-green font-bold">{submissions.length}</span> records
                </div>
              </div>
            </div>

            {/* Table Content */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neon-green/30">
                    <th className="text-left p-4 text-neon-green font-mono font-bold text-sm">DATE</th>
                    <th className="text-left p-4 text-neon-green font-mono font-bold text-sm">INDICATOR TYPE</th>
                    <th className="text-left p-4 text-neon-green font-mono font-bold text-sm">SUB-CATEGORY</th>
                    <th className="text-left p-4 text-neon-green font-mono font-bold text-sm">TITLE</th>
                    <th className="text-left p-4 text-neon-green font-mono font-bold text-sm">DOCUMENTATION</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((submission, index) => (
                    <tr
                      key={submission.$id}
                      className={`
                        border-b border-neon-green/10
                        hover:bg-cyber-light/50 transition-colors
                        ${index % 2 === 0 ? 'bg-cyber-darker' : 'bg-cyber-dark/50'}
                      `}
                    >
                      <td className="p-4 text-cyber-text font-mono text-sm">
                        {formatDate(submission.submission_date)}
                      </td>
                      <td className="p-4 text-cyber-text font-mono text-sm">
                        <span className="bg-neon-green/20 border border-neon-green/50 px-2 py-1 rounded text-neon-green text-xs">
                          {INDICATOR_TYPE_LABELS[submission.indicator_type] || submission.indicator_type}
                        </span>
                      </td>
                      <td className="p-4 text-cyber-text font-mono text-sm">
                        {submission.sub_category ? (
                          <span className="bg-neon-blue/20 border border-neon-blue/50 px-2 py-1 rounded text-neon-blue text-xs">
                            {SUB_CATEGORY_LABELS[submission.sub_category] || submission.sub_category}
                          </span>
                        ) : (
                          <span className="text-cyber-text-dim text-xs">—</span>
                        )}
                      </td>
                      <td className="p-4 text-cyber-text font-mono text-sm max-w-md">
                        <div className="truncate" title={submission.title}>
                          {submission.title}
                        </div>
                      </td>
                      <td className="p-4 text-cyber-text font-mono text-sm">
                        {submission.documentation_link ? (
                          <a
                            href={submission.documentation_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-neon-blue hover:text-neon-green transition-colors underline"
                          >
                            View Link
                          </a>
                        ) : (
                          <span className="text-cyber-text-dim text-xs">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="bg-cyber-light border-t-2 border-neon-green p-4">
              <div className="flex items-center justify-between">
                <p className="text-cyber-text-dim font-mono text-sm">
                  {'>'} Showing all {submissions.length} submission{submissions.length !== 1 ? 's' : ''}
                </p>
                <Link
                  href="/upt"
                  className="bg-neon-green text-cyber-dark px-4 py-2 rounded font-mono font-bold
                             shadow-glow-green-sm hover:bg-neon-blue hover:shadow-glow-blue
                             transition-all duration-300"
                >
                  BACK TO DASHBOARD
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-cyber-text-dim font-mono text-xs">
            <span className="text-neon-green">⬡</span> UPT REPORTING SYSTEM v1.0 Build with 🔥 by Ragel Listiyono
          </p>
        </div>
      </div>
    </div>
  );
}
