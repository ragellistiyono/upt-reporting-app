'use client';

import { useState, useEffect } from 'react';
import { databases, ID } from '@/lib/appwrite';
import { Query } from 'appwrite';
import { APPWRITE_CONFIG, UPT_NAMES, INDICATOR_TYPES, INDICATOR_TYPE_LABELS, MONTHS } from '@/lib/constants';
import type { Target, IndicatorType } from '@/types';

interface ManageTargetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ManageTargetsModal({ isOpen, onClose, onSuccess }: ManageTargetsModalProps) {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const currentSemester = currentMonth <= 6 ? 1 : 2;

  const [selectedIndicator, setSelectedIndicator] = useState<IndicatorType | ''>('');
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedPeriodType, setSelectedPeriodType] = useState<'semester' | 'month'>('semester');
  const [selectedSemester, setSelectedSemester] = useState<number>(currentSemester);
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth);
  const [targetValues, setTargetValues] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isFetching, setIsFetching] = useState(false);

  // Fetch existing targets when indicator/year/semester/month changes
  useEffect(() => {
    if (!isOpen || !selectedIndicator) return;

    const fetchExistingTargets = async () => {
      setIsFetching(true);
      try {
        const queries = [
          Query.equal('indicator_type', selectedIndicator),
          Query.equal('year', selectedYear),
          Query.limit(100)
        ];

        // Add month or semester filter based on period type
        if (selectedPeriodType === 'month') {
          queries.push(Query.equal('month', selectedMonth));
        } else {
          queries.push(Query.equal('semester', selectedSemester));
          // For semester mode, accept both month=0 and month=null (isNull not available, so we filter after fetch)
        }

        const response = await databases.listDocuments(
          APPWRITE_CONFIG.DATABASE_ID,
          APPWRITE_CONFIG.COLLECTIONS.TARGETS,
          queries
        );

        const targets = response.documents as unknown as Target[];
        const targetMap: Record<string, number> = {};
        
        // Filter targets based on period type
        targets.forEach(target => {
          if (selectedPeriodType === 'semester') {
            // For semester mode, include targets with month = 0, null, or undefined
            if (!target.month || target.month === 0) {
              targetMap[target.upt_name] = target.target_value;
            }
          } else {
            // For month mode, only include targets with matching month
            if (target.month === selectedMonth) {
              targetMap[target.upt_name] = target.target_value;
            }
          }
        });

        setTargetValues(targetMap);
      } catch (err) {
        console.error('Failed to fetch existing targets:', err);
      } finally {
        setIsFetching(false);
      }
    };

    fetchExistingTargets();
  }, [isOpen, selectedIndicator, selectedYear, selectedSemester, selectedMonth, selectedPeriodType]);

  const handleTargetChange = (uptName: string, value: string) => {
    const numValue = parseInt(value, 10);
    setTargetValues(prev => ({
      ...prev,
      [uptName]: isNaN(numValue) ? 0 : numValue
    }));
  };

  const handleSetAllTargets = (value: number) => {
    const newTargets: Record<string, number> = {};
    UPT_NAMES.forEach((upt) => {
      newTargets[upt] = value;
    });
    setTargetValues(newTargets);
  };

  const handleSave = async () => {
    if (!selectedIndicator) {
      setError('Pilih Indicator Type terlebih dahulu');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Fetch existing targets to check if we need to update or create
      const queries = [
        Query.equal('indicator_type', selectedIndicator),
        Query.equal('year', selectedYear),
        Query.limit(100)
      ];

      // Add month or semester filter based on period type
      if (selectedPeriodType === 'month') {
        queries.push(Query.equal('month', selectedMonth));
      } else {
        queries.push(Query.equal('semester', selectedSemester));
      }

      const response = await databases.listDocuments(
        APPWRITE_CONFIG.DATABASE_ID,
        APPWRITE_CONFIG.COLLECTIONS.TARGETS,
        queries
      );

      const allTargets = response.documents as unknown as Target[];
      
      // Filter existing targets based on period type
      const existingTargets = allTargets.filter(target => {
        if (selectedPeriodType === 'semester') {
          // For semester mode, match targets with month = 0, null, or undefined
          return !target.month || target.month === 0;
        } else {
          // For month mode, match targets with the selected month
          return target.month === selectedMonth;
        }
      });
      
      const existingMap = new Map(existingTargets.map(t => [t.upt_name, t]));

      // Process each UPT - Create for ALL UPTs (original logic)
      for (const uptName of UPT_NAMES) {
        const targetValue = targetValues[uptName] || 0;
        const existing = existingMap.get(uptName);

        const targetData = {
          upt_name: uptName,
          indicator_type: selectedIndicator,
          target_value: targetValue,
          year: selectedYear,
          semester: selectedPeriodType === 'semester' ? selectedSemester : 0,
          month: selectedPeriodType === 'month' ? selectedMonth : 0
        };

        if (existing) {
          // Update existing target
          await databases.updateDocument(
            APPWRITE_CONFIG.DATABASE_ID,
            APPWRITE_CONFIG.COLLECTIONS.TARGETS,
            existing.$id,
            targetData
          );
        } else {
          // Create new target (for ALL UPTs, not just value > 0)
          await databases.createDocument(
            APPWRITE_CONFIG.DATABASE_ID,
            APPWRITE_CONFIG.COLLECTIONS.TARGETS,
            ID.unique(),
            targetData
          );
        }
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error('Failed to save targets:', err);
      setError('Gagal menyimpan target. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedIndicator('');
    setSelectedPeriodType('semester');
    setTargetValues({});
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-scaleIn">
        {/* Header */}
        <div className="sticky top-0 bg-pln-blue p-6 z-10 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Kelola Target Kinerja
              </h2>
              <p className="text-blue-100 text-sm mt-1">
                Set target kinerja untuk setiap UPT
              </p>
            </div>
            <button
              onClick={handleClose}
              className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-red-600 text-sm flex items-center gap-2">
                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </p>
            </div>
          )}

          {/* Selection Controls */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filter Target
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Indicator Type */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase">
                  Indicator Type
                </label>
                <select
                  value={selectedIndicator}
                  onChange={(e) => setSelectedIndicator(e.target.value as IndicatorType)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-gray-800 bg-white focus:ring-2 focus:ring-pln-blue focus:border-transparent transition-all"
                >
                  <option value="">-- Pilih Indicator --</option>
                  {INDICATOR_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {INDICATOR_TYPE_LABELS[type]}
                    </option>
                  ))}
                </select>
              </div>

              {/* Year */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase">
                  Tahun
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-gray-800 bg-white focus:ring-2 focus:ring-pln-blue focus:border-transparent transition-all"
                >
                  <option value={currentYear - 1}>{currentYear - 1}</option>
                  <option value={currentYear}>{currentYear}</option>
                  <option value={currentYear + 1}>{currentYear + 1}</option>
                </select>
              </div>

              {/* Period Type */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase">
                  Periode
                </label>
                <select
                  value={selectedPeriodType}
                  onChange={(e) => {
                    setSelectedPeriodType(e.target.value as 'semester' | 'month');
                    setTargetValues({}); // Reset target values when switching period type
                  }}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-gray-800 bg-white focus:ring-2 focus:ring-pln-blue focus:border-transparent transition-all"
                >
                  <option value="semester">Per Semester</option>
                  <option value="month">Per Bulan</option>
                </select>
              </div>

              {/* Semester or Month based on Period Type */}
              {selectedPeriodType === 'semester' ? (
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase">
                    Semester
                  </label>
                  <select
                    value={selectedSemester}
                    onChange={(e) => setSelectedSemester(parseInt(e.target.value, 10))}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-gray-800 bg-white focus:ring-2 focus:ring-pln-blue focus:border-transparent transition-all"
                  >
                    <option value={1}>Semester 1 (Jan - Jun)</option>
                    <option value={2}>Semester 2 (Jul - Des)</option>
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase">
                    Bulan
                  </label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-gray-800 bg-white focus:ring-2 focus:ring-pln-blue focus:border-transparent transition-all"
                  >
                    {MONTHS.map((month) => (
                      <option key={month.value} value={month.value}>
                        {month.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Target Input Grid */}
          {selectedIndicator ? (
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              {/* Header with Quick Set Actions */}
              <div className="bg-gray-50 border-b border-gray-200 p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-gray-700">Target Values</h3>
                  {isFetching && (
                    <div className="w-4 h-4 border-2 border-pln-blue border-t-transparent rounded-full animate-spin" />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 mr-2">Set semua:</span>
                  {[0, 5, 10, 15, 20].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => handleSetAllTargets(val)}
                      className="px-3 py-1 text-xs font-medium bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* UPT Target Grid */}
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {UPT_NAMES.map((uptName) => (
                  <div
                    key={uptName}
                    className="bg-gray-50 border border-gray-200 rounded-xl p-4 hover:border-pln-blue transition-colors"
                  >
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {uptName}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={targetValues[uptName] || 0}
                      onChange={(e) => handleTargetChange(uptName, e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-gray-800 text-lg font-semibold focus:ring-2 focus:ring-pln-blue focus:border-transparent transition-all text-center"
                      placeholder="0"
                    />
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="bg-pln-blue/10 border-t border-pln-blue/20 p-4 flex items-center justify-between">
                <div className="text-sm text-pln-blue">
                  <span className="font-medium">Total Target:</span>{' '}
                  <span className="font-bold">
                    {Object.values(targetValues).reduce((sum, val) => sum + (val || 0), 0)}
                  </span>
                  <span className="text-pln-blue/70 ml-1">
                    untuk {UPT_NAMES.length} UPT
                  </span>
                </div>
                <div className="text-xs text-pln-blue/70">
                  {INDICATOR_TYPE_LABELS[selectedIndicator]} • {selectedYear} • 
                  {selectedPeriodType === 'semester' 
                    ? ` Semester ${selectedSemester}` 
                    : ` ${MONTHS[selectedMonth - 1].label}`}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-8 text-center">
              <svg className="w-12 h-12 text-amber-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <h4 className="text-amber-800 font-semibold mb-1">Pilih Indicator Type</h4>
              <p className="text-amber-600 text-sm">Pilih Indicator Type untuk mulai set target</p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-4 flex gap-3 justify-end rounded-b-2xl">
          <button
            onClick={handleClose}
            disabled={loading}
            className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            disabled={loading || !selectedIndicator}
            className="px-6 py-2.5 bg-pln-blue hover:bg-pln-blue-dark text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Simpan Target
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
