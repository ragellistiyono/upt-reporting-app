'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState, useMemo } from 'react';
import { databases } from '@/lib/appwrite';
import { APPWRITE_CONFIG, INDICATOR_TYPE_LABELS } from '@/lib/constants';
import { Query } from 'appwrite';
import type { Submission, Instruction, InstructionReadStatus } from '@/types';
import InstructionDetailModal from '@/components/InstructionDetailModal';

export default function UPTDashboardPage() {
  const { user, role, uptName, isLoading, logout } = useAuth();
  const router = useRouter();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [instructions, setInstructions] = useState<Instruction[]>([]);
  const [instructionReads, setInstructionReads] = useState<InstructionReadStatus[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isLoadingInstructions, setIsLoadingInstructions] = useState(true);
  
  // Notification state
  const [showBellDropdown, setShowBellDropdown] = useState(false);
  const [selectedInstruction, setSelectedInstruction] = useState<Instruction | null>(null);
  const [showInstructionModal, setShowInstructionModal] = useState(false);
  
  // Filter state
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth()); // 0-11
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

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

  // Fetch instructions for this UPT
  useEffect(() => {
    const fetchInstructions = async () => {
      if (!uptName || role !== 'uptuser') return;

      try {
        setIsLoadingInstructions(true);
        const response = await databases.listDocuments(
          APPWRITE_CONFIG.DATABASE_ID,
          APPWRITE_CONFIG.COLLECTIONS.INSTRUCTIONS,
          [
            Query.equal('status', 'PUBLISHED'),
            Query.orderDesc('published_at'),
            Query.limit(50)
          ]
        );

        // Filter instructions: ALL or contains this UPT
        const filtered = (response.documents as unknown as Instruction[]).filter((inst) => {
          if (inst.target_type === 'ALL') return true;
          if (inst.target_type === 'SPECIFIC' && inst.target_upt) {
            return inst.target_upt.includes(uptName);
          }
          return false;
        });

        setInstructions(filtered);
      } catch (error) {
        console.error('Failed to fetch instructions:', error);
      } finally {
        setIsLoadingInstructions(false);
      }
    };

    fetchInstructions();
  }, [uptName, role]);

  // Fetch instruction read status for current user
  useEffect(() => {
    const fetchReadStatus = async () => {
      if (!user?.$id) return;

      try {
        const response = await databases.listDocuments(
          APPWRITE_CONFIG.DATABASE_ID,
          APPWRITE_CONFIG.COLLECTIONS.INSTRUCTION_READS,
          [Query.equal('user_id', user.$id), Query.limit(100)]
        );

        setInstructionReads(response.documents as unknown as InstructionReadStatus[]);
      } catch (error) {
        console.error('Failed to fetch read status:', error);
      }
    };

    if (user) {
      fetchReadStatus();
    }
  }, [user]);

  // Calculate unread instructions
  const unreadInstructions = useMemo(() => {
    const readIds = new Set(instructionReads.map((r) => r.instruction_id));
    return instructions.filter((inst) => !readIds.has(inst.$id));
  }, [instructions, instructionReads]);

  const unreadCount = unreadInstructions.length;

  // Refresh read status after marking as read
  const handleRefreshReadStatus = async () => {
    if (!user?.$id) return;

    try {
      const response = await databases.listDocuments(
        APPWRITE_CONFIG.DATABASE_ID,
        APPWRITE_CONFIG.COLLECTIONS.INSTRUCTION_READS,
        [Query.equal('user_id', user.$id), Query.limit(100)]
      );

      setInstructionReads(response.documents as unknown as InstructionReadStatus[]);
    } catch (error) {
      console.error('Failed to refresh read status:', error);
    }
  };

  const handleViewInstruction = (instruction: Instruction) => {
    setSelectedInstruction(instruction);
    setShowInstructionModal(true);
    setShowBellDropdown(false);
  };

  // Calculate filtered stats based on selected month and year
  const filteredSubmissions = useMemo(() => {
    return submissions.filter((sub) => {
      const submissionDate = new Date(sub.submission_date);
      return (
        submissionDate.getMonth() === selectedMonth &&
        submissionDate.getFullYear() === selectedYear
      );
    });
  }, [submissions, selectedMonth, selectedYear]);

  // Calculate indicator counts from filtered submissions
  const indicatorCounts = useMemo(() => {
    const counts = Object.fromEntries(
      Object.keys(INDICATOR_TYPE_LABELS).map(key => [key, 0])
    );
    for (const sub of filteredSubmissions) {
      if (counts[sub.indicator_type] !== undefined) {
        counts[sub.indicator_type]++;
      }
    }
    return counts;
  }, [filteredSubmissions]);


  // Reset filter to current month and year
  const handleResetFilter = () => {
    const now = new Date();
    setSelectedMonth(now.getMonth());
    setSelectedYear(now.getFullYear());
  };

  // Month names for dropdown
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Generate year options (current year ± 5 years)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-neon-green border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-neon-green font-mono">LOADING UPT INTERFACE...</p>
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
              <div className="w-12 h-12 bg-neon-green rounded-lg flex items-center justify-center shadow-glow-green">
                <span className="text-cyber-dark font-mono font-bold text-xl">⬡</span>
              </div>
              <div>
                <h1 className="text-neon-green text-3xl font-mono font-bold tracking-wider">
                  UPT DASHBOARD
                </h1>
                <p className="text-cyber-text-dim font-mono text-sm">
                  {uptName ? uptName.toUpperCase() : 'UPT USER'} {'//'} REPORTER ACCESS
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Bell Icon with Notification Badge */}
              <div className="relative">
                <button
                  onClick={() => setShowBellDropdown(!showBellDropdown)}
                  className="relative bg-cyber-dark border-2 border-neon-blue text-neon-blue px-4 py-2 rounded font-mono
                             hover:bg-neon-blue hover:text-cyber-dark hover:shadow-glow-blue-sm
                             transition-all duration-300"
                  title="Instructions from Admin"
                >
                  🔔 NOTIFICATIONS
                  {unreadCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-neon-pink text-cyber-dark w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-glow-pink animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Dropdown */}
                {showBellDropdown && (
                  <div className="absolute right-0 top-full mt-2 w-96 bg-cyber-darker border-2 border-neon-blue rounded-lg shadow-glow-blue-sm z-50 max-h-96 overflow-y-auto">
                    <div className="bg-cyber-light border-b-2 border-neon-blue p-3">
                      <h3 className="text-neon-blue font-mono font-bold text-sm">
                        INSTRUCTIONS FROM ADMIN
                      </h3>
                      <p className="text-cyber-text-dim font-mono text-xs mt-1">
                        {unreadCount > 0 ? `${unreadCount} unread` : 'All read'}
                      </p>
                    </div>

                    {isLoadingInstructions ? (
                      <div className="p-4 text-center">
                        <div className="inline-block w-6 h-6 border-2 border-neon-blue border-t-transparent rounded-full animate-spin" />
                      </div>
                    ) : instructions.length === 0 ? (
                      <div className="p-6 text-center">
                        <p className="text-cyber-text-dim font-mono text-sm">
                          No instructions yet
                        </p>
                      </div>
                    ) : (
                      <div className="divide-y divide-neon-blue/20">
                        {instructions.map((instruction) => {
                          const isRead = instructionReads.some((r) => r.instruction_id === instruction.$id);
                          return (
                            <button
                              key={instruction.$id}
                              onClick={() => handleViewInstruction(instruction)}
                              className={`
                                w-full text-left p-4 hover:bg-cyber-light/50 transition-colors
                                ${isRead ? 'opacity-60' : 'bg-neon-blue/5'}
                              `}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    {!isRead && (
                                      <span className="w-2 h-2 bg-neon-pink rounded-full animate-pulse" />
                                    )}
                                    <span className={`
                                      font-mono text-xs px-2 py-0.5 rounded
                                      ${instruction.sub_category === 'INFLUENCER'
                                        ? 'bg-neon-blue/20 text-neon-blue'
                                        : 'bg-neon-purple/20 text-neon-purple'
                                      }
                                    `}>
                                      {instruction.sub_category}
                                    </span>
                                  </div>
                                  <p className="text-cyber-text font-mono text-sm font-bold truncate">
                                    {instruction.title}
                                  </p>
                                  <p className="text-cyber-text-dim font-mono text-xs mt-1 truncate">
                                    {instruction.sub_category} • {new Date(instruction.published_at || instruction.$createdAt).toLocaleDateString('id-ID')}
                                  </p>
                                  <p className="text-cyber-text-dim font-mono text-xs mt-1">
                                    {new Date(instruction.published_at || '').toLocaleDateString('id-ID', {
                                      day: '2-digit',
                                      month: 'short',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </p>
                                </div>
                                <span className="text-neon-blue text-xl">→</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>

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

        {/* Notification Banner (if there are unread instructions) */}
        {unreadCount > 0 && (
          <div className="bg-linear-to-r from-neon-pink/20 to-neon-purple/20 border-2 border-neon-pink rounded-lg p-4 mb-6 shadow-glow-pink-sm animate-[slideDown_0.3s_ease-out]">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-neon-pink rounded-lg flex items-center justify-center shadow-glow-pink shrink-0 animate-pulse">
                <span className="text-cyber-dark font-mono font-bold text-2xl">📢</span>
              </div>
              <div className="flex-1">
                <h3 className="text-neon-pink text-lg font-mono font-bold mb-2">
                  ADA INSTRUKSI BARU DARI ADMIN!
                </h3>
                <p className="text-cyber-text font-mono text-sm mb-3">
                  Terdapat <span className="text-neon-pink font-bold">{unreadCount}</span> instruksi yang belum dibaca untuk pengisian form indikator{' '}
                  <span className="text-neon-blue font-bold">INFLUENCER DAN SMR</span>.
                </p>
                <div className="flex flex-wrap gap-2">
                  {unreadInstructions.slice(0, 3).map((instruction) => (
                    <button
                      key={instruction.$id}
                      onClick={() => handleViewInstruction(instruction)}
                      className="bg-neon-pink/10 border border-neon-pink text-neon-pink px-4 py-2 rounded font-mono text-xs font-bold
                                 hover:bg-neon-pink hover:text-cyber-dark hover:shadow-glow-pink-sm
                                 transition-all duration-300"
                    >
                      📋 {instruction.title}
                    </button>
                  ))}
                  {unreadCount > 3 && (
                    <button
                      onClick={() => setShowBellDropdown(true)}
                      className="bg-neon-purple/10 border border-neon-purple text-neon-purple px-4 py-2 rounded font-mono text-xs font-bold
                                 hover:bg-neon-purple hover:text-cyber-dark hover:shadow-glow-purple
                                 transition-all duration-300"
                    >
                      +{unreadCount - 3} lainnya
                    </button>
                  )}
                </div>
                <p className="text-cyber-text-dim font-mono text-xs mt-3">
                  {'>'} Klik tombol di atas untuk melihat detail instruksi, atau gunakan icon 🔔 di header untuk melihat semua instruksi.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Card */}
        <div className="grid grid-cols-1 gap-6 mb-6">
          {/* MY SUBMISSIONS Card with Filters */}
          <div className="bg-cyber-darker border-2 border-neon-blue rounded-lg p-6 shadow-glow-blue-sm hover:shadow-glow-blue transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-neon-blue rounded flex items-center justify-center">
                <span className="text-cyber-dark font-bold">📝</span>
              </div>
              <h3 className="text-neon-blue font-mono font-bold">MY SUBMISSIONS</h3>
            </div>
            
            {/* Filter Controls */}
            <div className="flex flex-wrap items-center gap-3 mb-6 p-4 bg-cyber-light rounded border border-neon-blue/30">
              <div className="flex-1 min-w-[150px]">
                <label className="block text-cyber-text-dim font-mono text-xs mb-1">MONTH</label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="w-full bg-cyber-dark border border-neon-blue text-cyber-text px-3 py-2 rounded font-mono text-sm
                             focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-transparent
                             hover:border-neon-green transition-colors"
                >
                  {monthNames.map((month, index) => (
                    <option key={index} value={index}>
                      {month}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex-1 min-w-[120px]">
                <label className="block text-cyber-text-dim font-mono text-xs mb-1">YEAR</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="w-full bg-cyber-dark border border-neon-blue text-cyber-text px-3 py-2 rounded font-mono text-sm
                             focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-transparent
                             hover:border-neon-green transition-colors"
                >
                  {yearOptions.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="shrink-0 self-end">
                <button
                  onClick={handleResetFilter}
                  className="bg-cyber-dark border border-neon-blue text-neon-blue px-4 py-2 rounded font-mono text-sm
                             hover:bg-neon-blue hover:text-cyber-dark hover:shadow-glow-blue-sm
                             transition-all duration-300"
                >
                  RESET
                </button>
              </div>
            </div>

            {/* Indicator Breakdown */}
            <div className="space-y-2">
              {isLoadingData ? (
                <p className="text-cyber-text-dim font-mono text-center py-4">Loading...</p>
              ) : filteredSubmissions.length === 0 ? (
                <p className="text-cyber-text-dim font-mono text-center py-4">
                  No submissions for {monthNames[selectedMonth]} {selectedYear}
                </p>
              ) : (
                <>
                  {Object.entries(INDICATOR_TYPE_LABELS).map(([key, label]) => (
                    <div key={key} className="flex justify-between items-center font-mono text-sm">
                      <span className="text-neon-blue capitalize">{label.toLowerCase()}</span>
                      <span className="text-cyber-text font-bold text-lg">
                        {indicatorCounts[key] || 0}
                      </span>
                    </div>
                  ))}
                  

                </>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* New Submission Card */}
          <div className="bg-cyber-darker border-2 border-neon-blue rounded-lg p-8 shadow-glow-blue-sm hover:shadow-glow-blue transition-all">
            <div className="text-center">
              <div className="inline-block p-4 bg-cyber-light border-2 border-neon-blue rounded-lg mb-4">
                <span className="text-neon-blue text-5xl">➕</span>
              </div>
              <h3 className="text-neon-blue text-xl font-mono font-bold mb-3">
                NEW SUBMISSION
              </h3>
              <p className="text-cyber-text-dim font-mono text-sm mb-6">
                Submit a new performance indicator report
              </p>
              <Link
                href="/upt/submit-report"
                className="inline-block bg-neon-blue text-cyber-dark px-6 py-3 rounded font-mono font-bold
                           shadow-glow-blue hover:bg-neon-green hover:shadow-glow-green
                           transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                CREATE REPORT
              </Link>
            </div>
          </div>

          {/* View History Card */}
          <div className="bg-cyber-darker border-2 border-neon-pink rounded-lg p-8 shadow-glow-pink-sm hover:shadow-glow-pink transition-all">
            <div className="text-center">
              <div className="inline-block p-4 bg-cyber-light border-2 border-neon-pink rounded-lg mb-4">
                <span className="text-neon-pink text-5xl">📋</span>
              </div>
              <h3 className="text-neon-pink text-xl font-mono font-bold mb-3">
                MY REPORTS
              </h3>
              <p className="text-cyber-text-dim font-mono text-sm mb-6">
                View your submission history
              </p>
              <Link
                href="/upt/history"
                className="inline-block bg-neon-pink text-cyber-dark px-6 py-3 rounded font-mono font-bold
                           shadow-glow-pink hover:bg-neon-purple hover:shadow-glow-purple
                           transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                VIEW HISTORY
              </Link>
            </div>
          </div>
        </div>

        {/* Info Panel */}
        <div className="bg-cyber-darker border-2 border-neon-green rounded-lg p-8 shadow-glow-green-sm">
          <div className="text-center">
            <h2 className="text-neon-green text-2xl font-mono font-bold mb-4">
              WELCOME TO {uptName ? uptName.toUpperCase() : 'UPT SYSTEM'}
            </h2>
            
            <p className="text-cyber-text font-mono mb-6 max-w-2xl mx-auto">
              Kamu terhubung ke UPT Reporting System. 
              Kirimkan indikator kinerja Anda dan pantau kontribusi Anda untuk PLN.
            </p>

            <div className="border-t border-cyber-light pt-6 mt-6">
              <p className="text-neon-green font-mono text-sm">
                {'>'} System Status: ONLINE
              </p>
              <p className="text-cyber-text-dim font-mono text-sm mt-2">
                {'>'} All features operational
              </p>
              <p className="text-cyber-text-dim font-mono text-sm mt-2">
                {'>'} Database sync: Active
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-cyber-text-dim font-mono text-xs">
            <span className="text-neon-green">⬡</span> UPT REPORTING SYSTEM v1.0 Build with 🔥 by Ragel Listiyono 
          </p>
        </div>
      </div>

      {/* Instruction Detail Modal */}
      <InstructionDetailModal
        instruction={selectedInstruction}
        isOpen={showInstructionModal}
        onClose={() => setShowInstructionModal(false)}
        currentUserId={user?.$id || ''}
        currentUptName={uptName || ''}
        onMarkAsRead={handleRefreshReadStatus}
      />
    </div>
  );
}
