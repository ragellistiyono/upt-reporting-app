'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { databases } from '@/lib/appwrite';
import { APPWRITE_CONFIG, INDICATOR_TYPES, UPT_NAMES, INDICATOR_TYPE_LABELS, SUB_CATEGORY_LABELS } from '@/lib/constants';
import { Query } from 'appwrite';
import type { Submission, Instruction, Target } from '@/types';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
  type ColumnFiltersState,
} from '@tanstack/react-table';
import * as XLSX from 'xlsx';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import CreateInstructionModal from '@/components/CreateInstructionModal';
import ManageTargetsModal from '@/components/ManageTargetsModal';

export default function AdminDashboardPage() {
  const { user, role, isLoading, logout } = useAuth();
  const router = useRouter();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [instructions, setInstructions] = useState<Instruction[]>([]);
  const [targets, setTargets] = useState<Target[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isLoadingInstructions, setIsLoadingInstructions] = useState(true);
  const [isLoadingTargets, setIsLoadingTargets] = useState(true);
  
  // Modal state
  const [showCreateInstruction, setShowCreateInstruction] = useState(false);
  const [showManageTargets, setShowManageTargets] = useState(false);
  
  // UI state
  const [showDataTable, setShowDataTable] = useState(false);
  
  // Table state
  const [sorting, setSorting] = useState<SortingState>([{ id: 'submission_date', desc: true }]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  
  // Filter state
  const [uptFilter, setUptFilter] = useState<string>('all');
  const [indicatorFilter, setIndicatorFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');

  // Verify admin role
  useEffect(() => {
    if (!isLoading && role !== 'admin') {
      router.push('/login');
    }
  }, [role, isLoading, router]);

  // Fetch ALL submissions (admin can see everything)
  useEffect(() => {
    const fetchSubmissions = async () => {
      if (role !== 'admin') return;

      try {
        setIsLoadingData(true);
        const response = await databases.listDocuments(
          APPWRITE_CONFIG.DATABASE_ID,
          APPWRITE_CONFIG.COLLECTIONS.SUBMISSIONS,
          [Query.orderDesc('$createdAt'), Query.limit(1000)] // Fetch up to 1000 submissions
        );

        setSubmissions(response.documents as unknown as Submission[]);
      } catch (error) {
        console.error('Failed to fetch submissions:', error);
      } finally {
        setIsLoadingData(false);
      }
    };

    if (role === 'admin') {
      fetchSubmissions();
    }
  }, [role]);

  // Fetch ALL instructions
  useEffect(() => {
    const fetchInstructions = async () => {
      if (role !== 'admin') return;

      try {
        setIsLoadingInstructions(true);
        const response = await databases.listDocuments(
          APPWRITE_CONFIG.DATABASE_ID,
          APPWRITE_CONFIG.COLLECTIONS.INSTRUCTIONS,
          [Query.orderDesc('$createdAt'), Query.limit(100)]
        );

        setInstructions(response.documents as unknown as Instruction[]);
      } catch (error) {
        console.error('Failed to fetch instructions:', error);
      } finally {
        setIsLoadingInstructions(false);
      }
    };

    if (role === 'admin') {
      fetchInstructions();
    }
  }, [role]);

  // Fetch ALL targets
  useEffect(() => {
    const fetchTargets = async () => {
      if (role !== 'admin') return;

      try {
        setIsLoadingTargets(true);
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth() + 1;
        const currentSemester = currentMonth <= 6 ? 1 : 2;

        const response = await databases.listDocuments(
          APPWRITE_CONFIG.DATABASE_ID,
          APPWRITE_CONFIG.COLLECTIONS.TARGETS,
          [
            Query.equal('year', currentYear),
            Query.equal('semester', currentSemester),
            Query.limit(1000)
          ]
        );

        setTargets(response.documents as unknown as Target[]);
      } catch (error) {
        console.error('Failed to fetch targets:', error);
      } finally {
        setIsLoadingTargets(false);
      }
    };

    if (role === 'admin') {
      fetchTargets();
    }
  }, [role]);

  // Refresh targets after update
  const handleTargetsSuccess = async () => {
    try {
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1;
      const currentSemester = currentMonth <= 6 ? 1 : 2;

      const response = await databases.listDocuments(
        APPWRITE_CONFIG.DATABASE_ID,
        APPWRITE_CONFIG.COLLECTIONS.TARGETS,
        [
          Query.equal('year', currentYear),
          Query.equal('semester', currentSemester),
          Query.limit(1000)
        ]
      );
      setTargets(response.documents as unknown as Target[]);
    } catch (error) {
      console.error('Failed to refresh targets:', error);
    }
  };

  // Refresh instructions after create/update
  const handleInstructionSuccess = async () => {
    try {
      const response = await databases.listDocuments(
        APPWRITE_CONFIG.DATABASE_ID,
        APPWRITE_CONFIG.COLLECTIONS.INSTRUCTIONS,
        [Query.orderDesc('$createdAt'), Query.limit(100)]
      );
      setInstructions(response.documents as unknown as Instruction[]);
    } catch (error) {
      console.error('Failed to refresh instructions:', error);
    }
  };

  // Delete instruction
  const handleDeleteInstruction = async (instructionId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus instruksi ini?')) {
      return;
    }

    try {
      await databases.deleteDocument(
        APPWRITE_CONFIG.DATABASE_ID,
        APPWRITE_CONFIG.COLLECTIONS.INSTRUCTIONS,
        instructionId
      );
      await handleInstructionSuccess();
    } catch (error) {
      console.error('Failed to delete instruction:', error);
      alert('Gagal menghapus instruksi');
    }
  };

  // Publish draft instruction
  const handlePublishInstruction = async (instructionId: string) => {
    try {
      await databases.updateDocument(
        APPWRITE_CONFIG.DATABASE_ID,
        APPWRITE_CONFIG.COLLECTIONS.INSTRUCTIONS,
        instructionId,
        {
          status: 'PUBLISHED',
          published_at: new Date().toISOString()
        }
      );
      await handleInstructionSuccess();
    } catch (error) {
      console.error('Failed to publish instruction:', error);
      alert('Gagal mempublish instruksi');
    }
  };

  // Apply custom filters to data
  const filteredData = useMemo(() => {
    let filtered = submissions;

    // UPT filter
    if (uptFilter !== 'all') {
      filtered = filtered.filter((sub) => sub.submitted_by_upt === uptFilter);
    }

    // Indicator filter
    if (indicatorFilter !== 'all') {
      filtered = filtered.filter((sub) => sub.indicator_type === indicatorFilter);
    }

    // Date range filter
    if (dateFrom) {
      filtered = filtered.filter((sub) => {
        const subDate = new Date(sub.submission_date);
        return subDate >= new Date(dateFrom);
      });
    }

    if (dateTo) {
      filtered = filtered.filter((sub) => {
        const subDate = new Date(sub.submission_date);
        return subDate <= new Date(dateTo);
      });
    }

    return filtered;
  }, [submissions, uptFilter, indicatorFilter, dateFrom, dateTo]);

  // Calculate chart data for visualization
  const chartData = useMemo(() => {
    // Group filtered submissions by UPT
    const submissionsByUPT: Record<string, number> = {};
    filteredData.forEach((sub) => {
      const uptName = sub.submitted_by_upt;
      submissionsByUPT[uptName] = (submissionsByUPT[uptName] || 0) + 1;
    });

    // Get targets for the selected indicator (or all if 'all')
    const targetsByUPT: Record<string, number> = {};
    targets.forEach((target) => {
      // If indicator filter is set, only show targets for that indicator
      if (indicatorFilter === 'all' || target.indicator_type === indicatorFilter) {
        const existingTarget = targetsByUPT[target.upt_name] || 0;
        targetsByUPT[target.upt_name] = existingTarget + target.target_value;
      }
    });

    // Build chart data for all UPTs
    return UPT_NAMES.map((uptName) => ({
      name: uptName.replace('UPT ', ''), // Shorter name for chart
      realisasi: submissionsByUPT[uptName] || 0,
      target: targetsByUPT[uptName] || 0,
    }));
  }, [filteredData, targets, indicatorFilter]);

  // Calculate summary statistics
  const totalRealisasi = useMemo(() => {
    return chartData.reduce((sum, item) => sum + item.realisasi, 0);
  }, [chartData]);

  const totalTarget = useMemo(() => {
    return chartData.reduce((sum, item) => sum + item.target, 0);
  }, [chartData]);

  const capaianPercentage = useMemo(() => {
    if (totalTarget === 0) return 0;
    return Math.round((totalRealisasi / totalTarget) * 100);
  }, [totalRealisasi, totalTarget]);

  // Calculate stats
  const totalSubmissions = submissions.length;
  const activeUPTs = useMemo(() => {
    const uniqueUPTs = new Set(submissions.map((sub) => sub.submitted_by_upt));
    return uniqueUPTs.size;
  }, [submissions]);

  const thisMonthSubmissions = useMemo(() => {
    return submissions.filter((sub) => {
      const submissionDate = new Date(sub.submission_date);
      const now = new Date();
      return (
        submissionDate.getMonth() === now.getMonth() &&
        submissionDate.getFullYear() === now.getFullYear()
      );
    }).length;
  }, [submissions]);

  // Table columns
  const columnHelper = createColumnHelper<Submission>();
  
  const columns = useMemo(
    () => [
      columnHelper.accessor('submission_date', {
        header: 'DATE',
        cell: (info) => {
          const date = new Date(info.getValue());
          return date.toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          });
        },
      }),
      columnHelper.accessor('submitted_by_upt', {
        header: 'UPT',
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor('indicator_type', {
        header: 'INDICATOR',
        cell: (info) => INDICATOR_TYPE_LABELS[info.getValue()] || info.getValue(),
      }),
      columnHelper.accessor('sub_category', {
        header: 'SUB-CATEGORY',
        cell: (info) => {
          const value = info.getValue();
          return value ? SUB_CATEGORY_LABELS[value] || value : '—';
        },
      }),
      columnHelper.accessor('title', {
        header: 'TITLE',
        cell: (info) => (
          <div className="max-w-md truncate" title={info.getValue()}>
            {info.getValue()}
          </div>
        ),
      }),
      columnHelper.accessor('documentation_link', {
        header: 'DOCUMENTATION',
        cell: (info) => {
          const link = info.getValue();
          return link ? (
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-neon-blue hover:text-neon-pink transition-colors underline"
            >
              View
            </a>
          ) : (
            <span className="text-cyber-text-dim">—</span>
          );
        },
      }),
    ],
    [columnHelper]
  );

  // Initialize table
  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
      columnFilters,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  // Export to Excel function
  const handleExportExcel = () => {
    if (filteredData.length === 0) {
      alert('No data to export');
      return;
    }

    // Prepare data for Excel
    const excelData = filteredData.map((sub) => ({
      Date: new Date(sub.submission_date).toLocaleDateString('id-ID'),
      UPT: sub.submitted_by_upt,
      'Indicator Type': INDICATOR_TYPE_LABELS[sub.indicator_type] || sub.indicator_type,
      'Sub-Category': sub.sub_category
        ? SUB_CATEGORY_LABELS[sub.sub_category] || sub.sub_category
        : '',
      Title: sub.title,
      Narasi: sub.narasi,
      'Documentation Link': sub.documentation_link || '',
    }));

    // Create worksheet and workbook
    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Submissions');

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `UPT_Submissions_${timestamp}.xlsx`;

    // Download
    XLSX.writeFile(wb, filename);
  };

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
          <div className="inline-block w-12 h-12 border-4 border-neon-blue border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-neon-blue font-mono">LOADING ADMIN INTERFACE...</p>
        </div>
      </div>
    );
  }

  if (role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen p-8">
      {/* Cyberpunk Header */}
      <div className="max-w-7xl mx-auto">
        {/* Top Bar */}
        <div className="bg-cyber-light border-2 border-neon-pink rounded-lg p-4 mb-6 shadow-glow-pink-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-neon-pink rounded-lg flex items-center justify-center shadow-glow-pink">
                <span className="text-cyber-dark font-mono font-bold text-xl">⬢</span>
              </div>
              <div>
                <h1 className="text-neon-pink text-3xl font-mono font-bold tracking-wider">
                  ADMIN DASHBOARD
                </h1>
                <p className="text-cyber-text-dim font-mono text-sm">
                  SYSTEM ADMINISTRATOR // FULL ACCESS
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
                className="bg-cyber-dark border-2 border-neon-pink text-neon-pink px-4 py-2 rounded font-mono
                           hover:bg-neon-pink hover:text-cyber-dark hover:shadow-glow-pink-sm
                           transition-all duration-300"
              >
                LOGOUT
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Card 1 */}
          <div className="bg-cyber-darker border-2 border-neon-blue rounded-lg p-6 shadow-glow-blue-sm hover:shadow-glow-blue transition-all">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-neon-blue rounded flex items-center justify-center">
                <span className="text-cyber-dark font-bold">📊</span>
              </div>
              <h3 className="text-neon-blue font-mono font-bold">TOTAL SUBMISSIONS</h3>
            </div>
            <p className="text-cyber-text text-4xl font-mono font-bold">
              {isLoadingData ? '...' : totalSubmissions}
            </p>
            <p className="text-cyber-text-dim font-mono text-sm mt-1">Across all UPTs</p>
          </div>

          {/* Card 2 */}
          <div className="bg-cyber-darker border-2 border-neon-green rounded-lg p-6 shadow-glow-green-sm hover:shadow-glow-green transition-all">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-neon-green rounded flex items-center justify-center">
                <span className="text-cyber-dark font-bold">👥</span>
              </div>
              <h3 className="text-neon-green font-mono font-bold">ACTIVE UPTs</h3>
            </div>
            <p className="text-cyber-text text-4xl font-mono font-bold">
              {isLoadingData ? '...' : activeUPTs}
            </p>
            <p className="text-cyber-text-dim font-mono text-sm mt-1">Connected to network</p>
          </div>

          {/* Card 3 */}
          <div className="bg-cyber-darker border-2 border-neon-purple rounded-lg p-6 shadow-glow-purple transition-all">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-neon-purple rounded flex items-center justify-center">
                <span className="text-cyber-dark font-bold">📅</span>
              </div>
              <h3 className="text-neon-purple font-mono font-bold">THIS MONTH</h3>
            </div>
            <p className="text-cyber-text text-4xl font-mono font-bold">
              {isLoadingData ? '...' : thisMonthSubmissions}
            </p>
            <p className="text-cyber-text-dim font-mono text-sm mt-1">New reports submitted</p>
          </div>
        </div>

        {/* Instructions Section */}
        <div className="bg-cyber-darker border-2 border-neon-blue rounded-lg p-6 mb-6 shadow-glow-blue-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-neon-blue rounded flex items-center justify-center">
                <span className="text-cyber-dark font-bold text-xl">📋</span>
              </div>
              <h3 className="text-neon-blue text-xl font-mono font-bold">INSTRUCTIONS MANAGEMENT</h3>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowManageTargets(true)}
                className="bg-neon-green text-cyber-dark px-6 py-3 rounded font-mono font-bold shadow-glow-purple
                           hover:bg-neon-blue hover:shadow-glow-blue
                           transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                🎯 MANAGE TARGETS
              </button>
              <button
                onClick={() => setShowCreateInstruction(true)}
                className="bg-neon-cyan text-cyber-dark px-6 py-3 rounded font-mono font-bold shadow-glow-pink
                           hover:bg-neon-blue hover:shadow-glow-blue
                           transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                ➕ CREATE INSTRUCTION
              </button>
            </div>
          </div>

          {/* Instructions Table */}
          {isLoadingInstructions ? (
            <div className="text-center py-12">
              <div className="inline-block w-12 h-12 border-4 border-neon-pink border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-neon-pink font-mono">LOADING INSTRUCTIONS...</p>
            </div>
          ) : instructions.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-block p-6 bg-cyber-light border-2 border-neon-pink rounded-lg mb-4">
                <span className="text-neon-pink text-4xl">📋</span>
              </div>
              <h4 className="text-neon-pink text-lg font-mono font-bold mb-2">
                NO INSTRUCTIONS YET
              </h4>
              <p className="text-cyber-text-dim font-mono text-sm">
                {'>'} Click CREATE INSTRUCTION to send templates to UPTs
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-neon-pink/30">
                    <th className="text-left p-4 text-neon-pink font-mono font-bold text-sm">STATUS</th>
                    <th className="text-left p-4 text-neon-pink font-mono font-bold text-sm">SUB-CATEGORY</th>
                    <th className="text-left p-4 text-neon-pink font-mono font-bold text-sm">TARGET</th>
                    <th className="text-left p-4 text-neon-pink font-mono font-bold text-sm">TITLE</th>
                    <th className="text-left p-4 text-neon-pink font-mono font-bold text-sm">GOOGLE DRIVE</th>
                    <th className="text-left p-4 text-neon-pink font-mono font-bold text-sm">CREATED</th>
                    <th className="text-left p-4 text-neon-pink font-mono font-bold text-sm">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {instructions.map((instruction, index) => (
                    <tr
                      key={instruction.$id}
                      className={`
                        border-b border-neon-pink/10
                        hover:bg-cyber-light/50 transition-colors
                        ${index % 2 === 0 ? 'bg-cyber-darker' : 'bg-cyber-dark/50'}
                      `}
                    >
                      <td className="p-4">
                        <span
                          className={`
                            px-3 py-1 rounded font-mono text-xs font-bold
                            ${instruction.status === 'PUBLISHED'
                              ? 'bg-neon-green/20 text-neon-green border border-neon-green'
                              : 'bg-cyber-light/50 text-cyber-text-dim border border-cyber-light'
                            }
                          `}
                        >
                          {instruction.status}
                        </span>
                      </td>
                      <td className="p-4 text-cyber-text font-mono text-sm">
                        {instruction.sub_category}
                      </td>
                      <td className="p-4 text-cyber-text font-mono text-sm">
                        {instruction.target_type === 'ALL' ? (
                          <span className="text-neon-blue">All UPTs</span>
                        ) : (
                          <span className="text-neon-purple">
                            {instruction.target_upt?.length || 0} UPT
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-cyber-text font-mono text-sm max-w-xs truncate" title={instruction.title}>
                        {instruction.title}
                      </td>
                      <td className="p-4 text-cyber-text font-mono text-sm">
                        {instruction.content_link ? (
                          <a
                            href={instruction.content_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-neon-blue hover:text-neon-pink transition-colors underline"
                          >
                            📁 View
                          </a>
                        ) : (
                          <span className="text-cyber-text-dim">—</span>
                        )}
                      </td>
                      <td className="p-4 text-cyber-text-dim font-mono text-xs">
                        {new Date(instruction.$createdAt).toLocaleDateString('id-ID', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          {instruction.status === 'DRAFT' && (
                            <button
                              onClick={() => handlePublishInstruction(instruction.$id)}
                              className="bg-neon-green/20 border border-neon-green text-neon-green px-3 py-1 rounded font-mono text-xs font-bold
                                         hover:bg-neon-green hover:text-cyber-dark
                                         transition-all duration-300"
                              title="Publish"
                            >
                              📢 PUBLISH
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteInstruction(instruction.$id)}
                            className="bg-red-900/20 border border-red-500 text-red-400 px-3 py-1 rounded font-mono text-xs font-bold
                                       hover:bg-red-500 hover:text-white
                                       transition-all duration-300"
                            title="Delete"
                          >
                            🗑 DELETE
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Create Instruction Modal */}
        <CreateInstructionModal
          isOpen={showCreateInstruction}
          onClose={() => setShowCreateInstruction(false)}
          onSuccess={handleInstructionSuccess}
          adminUserId={user?.$id || ''}
          adminName={user?.name || 'Admin'}
        />

        {/* Manage Targets Modal */}
        <ManageTargetsModal
          isOpen={showManageTargets}
          onClose={() => setShowManageTargets(false)}
          onSuccess={handleTargetsSuccess}
        />

        {/* Filter Panel */}
        <div className="bg-cyber-darker border-2 border-neon-blue rounded-lg p-6 mb-6 shadow-glow-blue-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-neon-blue rounded flex items-center justify-center">
              <span className="text-cyber-dark font-bold text-xl">⚙</span>
            </div>
            <h3 className="text-neon-blue text-xl font-mono font-bold">FILTER CONTROLS</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* UPT Filter */}
            <div>
              <label className="text-cyber-text font-mono text-sm mb-2 block">UPT:</label>
              <select
                value={uptFilter}
                onChange={(e) => setUptFilter(e.target.value)}
                className="w-full bg-cyber-light border-2 border-cyber-light text-cyber-text font-mono px-3 py-2 rounded
                           focus:border-neon-pink focus:shadow-glow-pink-sm focus:outline-none
                           transition-all duration-300"
              >
                <option value="all">All UPTs</option>
                {UPT_NAMES.map((upt) => (
                  <option key={upt} value={upt}>
                    {upt}
                  </option>
                ))}
              </select>
            </div>

            {/* Indicator Filter */}
            <div>
              <label className="text-cyber-text font-mono text-sm mb-2 block">Indicator:</label>
              <select
                value={indicatorFilter}
                onChange={(e) => setIndicatorFilter(e.target.value)}
                className="w-full bg-cyber-light border-2 border-cyber-light text-cyber-text font-mono px-3 py-2 rounded
                           focus:border-neon-pink focus:shadow-glow-pink-sm focus:outline-none
                           transition-all duration-300"
              >
                <option value="all">All Indicators</option>
                {INDICATOR_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {INDICATOR_TYPE_LABELS[type]}
                  </option>
                ))}
              </select>
            </div>

            {/* Date From */}
            <div>
              <label className="text-cyber-text font-mono text-sm mb-2 block">From Date:</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full bg-cyber-light border-2 border-cyber-light text-cyber-text font-mono px-3 py-2 rounded
                           focus:border-neon-pink focus:shadow-glow-pink-sm focus:outline-none
                           transition-all duration-300"
              />
            </div>

            {/* Date To */}
            <div>
              <label className="text-cyber-text font-mono text-sm mb-2 block">To Date:</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full bg-cyber-light border-2 border-cyber-light text-cyber-text font-mono px-3 py-2 rounded
                           focus:border-neon-pink focus:shadow-glow-pink-sm focus:outline-none
                           transition-all duration-300"
              />
            </div>
          </div>

          {/* Filter Summary */}
          <div className="mt-4 pt-4 border-t border-neon-pink/20">
            <p className="text-cyber-text-dim font-mono text-sm">
              {'>'} Showing <span className="text-neon-green font-bold">{filteredData.length}</span> of{' '}
              <span className="text-neon-green font-bold">{totalSubmissions}</span> submissions
            </p>
          </div>
        </div>

        {/* Recap Visualization Section */}
        {isLoadingData || isLoadingTargets ? (
          <div className="bg-cyber-darker border-2 border-neon-blue rounded-lg p-12 mb-6 shadow-glow-blue-sm">
            <div className="text-center">
              <div className="inline-block w-16 h-16 border-4 border-neon-blue border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-neon-blue font-mono text-lg">LOADING VISUALIZATION DATA...</p>
            </div>
          </div>
        ) : (
          <div className="bg-cyber-darker border-2 border-neon-blue rounded-lg p-6 mb-6 shadow-glow-blue-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-neon-blue rounded flex items-center justify-center">
                <span className="text-cyber-dark font-bold text-xl">📊</span>
              </div>
              <h3 className="text-neon-blue text-xl font-mono font-bold">RECAP VISUALIZATION</h3>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Realisasi Card */}
              <div className="bg-cyber-light border-2 border-neon-blue rounded-lg p-6 shadow-glow-blue-sm hover:shadow-glow-blue transition-all">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-neon-blue text-sm font-mono font-bold tracking-wider">REALISASI</h4>
                  <div className="w-10 h-10 bg-neon-blue/20 rounded-full flex items-center justify-center border-2 border-neon-blue">
                    <span className="text-2xl">🏃‍♂️</span>
                  </div>
                </div>
                <p className="text-neon-blue text-5xl font-mono font-bold mb-2">{totalRealisasi}</p>
                <p className="text-cyber-text-dim text-xs font-mono">Submissions Completed</p>
              </div>

              {/* Target Card */}
              <div className="bg-cyber-light border-2 border-neon-purple rounded-lg p-6 shadow-glow-purple transition-all hover:shadow-glow-purple">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-neon-purple text-sm font-mono font-bold tracking-wider">TARGET</h4>
                  <div className="w-10 h-10 bg-neon-purple/20 rounded-full flex items-center justify-center border-2 border-neon-purple">
                    <span className="text-2xl">🎯</span>
                  </div>
                </div>
                <p className="text-neon-purple text-5xl font-mono font-bold mb-2">{totalTarget}</p>
                <p className="text-cyber-text-dim text-xs font-mono">Total Target Set</p>
              </div>

              {/* Capaian Card */}
              <div className="bg-cyber-light border-2 border-neon-green rounded-lg p-6 shadow-glow-green-sm hover:shadow-glow-green transition-all">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-neon-green text-sm font-mono font-bold tracking-wider">CAPAIAN</h4>
                  <div className="w-10 h-10 bg-neon-green/20 rounded-full flex items-center justify-center border-2 border-neon-green">
                    <span className="text-2xl">🏵️</span>
                  </div>
                </div>
                <p className="text-neon-green text-5xl font-mono font-bold mb-2">{capaianPercentage}%</p>
                <p className="text-cyber-text-dim text-xs font-mono">Achievement Rate</p>
              </div>
            </div>

            {/* Bar Chart */}
            <div className="bg-cyber-light border-2 border-neon-blue/30 rounded-lg p-6">
              <h4 className="text-neon-blue text-lg font-mono font-bold mb-4">
                {'>'} PERFORMANCE BY UPT
              </h4>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1A1A2E" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#00F0FF" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    style={{ fontSize: '12px', fontFamily: 'monospace', fill: '#00F0FF' }}
                  />
                  <YAxis 
                    stroke="#00F0FF"
                    style={{ fontSize: '12px', fontFamily: 'monospace', fill: '#00F0FF' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0A0A1A',
                      border: '2px solid #00F0FF',
                      borderRadius: '8px',
                      fontFamily: 'monospace',
                      color: '#E0E0E0'
                    }}
                    labelStyle={{ color: '#00F0FF', fontWeight: 'bold' }}
                  />
                  <Legend 
                    wrapperStyle={{
                      fontFamily: 'monospace',
                      fontSize: '14px'
                    }}
                  />
                  <Bar dataKey="target" fill="#BD00FF" name="Target" opacity={0.3} />
                  <Bar dataKey="realisasi" name="Realisasi">
                    {chartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`}
                        fill={entry.realisasi >= entry.target ? '#39FF14' : '#00F0FF'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 flex items-center justify-center gap-6 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-neon-blue rounded"></div>
                  <span className="text-cyber-text">Below Target</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-neon-green rounded"></div>
                  <span className="text-cyber-text">Target Achieved</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Toggle Button for Data Table */}
        <div className="mb-6">
          <button
            onClick={() => setShowDataTable(!showDataTable)}
            className="w-full bg-cyber-darker border-2 border-neon-blue text-neon-blue px-6 py-4 rounded-lg font-mono font-bold
                       shadow-glow-blue-sm hover:shadow-glow-blue hover:bg-cyber-light
                       transition-all duration-300 transform hover:scale-[1.01] active:scale-[0.99]
                       flex items-center justify-center gap-3"
          >
            <span className="text-2xl">
              {showDataTable ? '⬆️' : '⬇️'}
            </span>
            <span>
              {showDataTable ? 'HIDE DETAILED DATA TABLE' : 'VIEW DETAILED DATA TABLE'}
            </span>
          </button>
        </div>

        {/* Loading State */}
        {isLoadingData && showDataTable && (
          <div className="bg-cyber-darker border-2 border-neon-pink rounded-lg p-12 shadow-glow-pink-sm">
            <div className="text-center">
              <div className="inline-block w-16 h-16 border-4 border-neon-pink border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-neon-pink font-mono text-lg">LOADING SUBMISSION DATA...</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoadingData && submissions.length === 0 && showDataTable && (
          <div className="bg-cyber-darker border-2 border-neon-pink rounded-lg p-12 shadow-glow-pink-sm">
            <div className="text-center">
              <div className="inline-block p-6 bg-cyber-light border-2 border-neon-pink rounded-lg mb-4">
                <span className="text-neon-pink text-6xl">📊</span>
              </div>
              <h2 className="text-neon-pink text-2xl font-mono font-bold mb-4">
                NO SUBMISSIONS YET
              </h2>
              <p className="text-cyber-text-dim font-mono">
                {'>'} Waiting for UPT users to submit their first reports...
              </p>
            </div>
          </div>
        )}

        {/* Data Table */}
        {!isLoadingData && submissions.length > 0 && showDataTable && (
          <div className="bg-cyber-darker border-2 border-neon-pink rounded-lg shadow-glow-pink-sm overflow-hidden">
            {/* Table Header */}
            <div className="bg-cyber-light border-b-2 border-neon-pink p-4">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <h2 className="text-neon-pink text-xl font-mono font-bold">
                  ALL SUBMISSIONS DATABASE
                </h2>
                <button
                  onClick={handleExportExcel}
                  disabled={filteredData.length === 0}
                  className="bg-neon-pink text-cyber-dark px-6 py-3 rounded font-mono font-bold
                             shadow-glow-pink hover:bg-neon-purple hover:shadow-glow-purple
                             transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]
                             disabled:bg-cyber-light disabled:text-cyber-text-dim disabled:shadow-none disabled:cursor-not-allowed"
                >
                  📥 DOWNLOAD EXCEL
                </button>
              </div>
            </div>

            {/* Table Content */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id} className="border-b border-neon-pink/30">
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          className="text-left p-4 text-neon-pink font-mono font-bold text-sm cursor-pointer hover:bg-cyber-light/50 transition-colors"
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          <div className="flex items-center gap-2">
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {header.column.getIsSorted() === 'asc' && <span>🔼</span>}
                            {header.column.getIsSorted() === 'desc' && <span>🔽</span>}
                          </div>
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  {table.getRowModel().rows.length === 0 ? (
                    <tr>
                      <td colSpan={columns.length} className="p-8 text-center">
                        <p className="text-cyber-text-dim font-mono">
                          {'>'} No data matches current filters
                        </p>
                      </td>
                    </tr>
                  ) : (
                    table.getRowModel().rows.map((row, index) => (
                      <tr
                        key={row.id}
                        className={`
                          border-b border-neon-pink/10
                          hover:bg-cyber-light/50 transition-colors
                          ${index % 2 === 0 ? 'bg-cyber-darker' : 'bg-cyber-dark/50'}
                        `}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <td key={cell.id} className="p-4 text-cyber-text font-mono text-sm">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="bg-cyber-light border-t-2 border-neon-pink p-4">
              <p className="text-cyber-text-dim font-mono text-sm">
                {'>'} Total records displayed: <span className="text-neon-pink font-bold">{table.getRowModel().rows.length}</span>
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-cyber-text-dim font-mono text-xs">
            <span className="text-neon-pink">⬢</span> UPT REPORTING SYSTEM v1.0 Build with 🔥 by Ragel Listiyono
          </p>
        </div>
      </div>
    </div>
  );
}
