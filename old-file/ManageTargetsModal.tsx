'use client';

import { useState, useEffect } from 'react';
import { databases, ID } from '@/lib/appwrite';
import { Query } from 'appwrite';
import { APPWRITE_CONFIG, UPT_NAMES, INDICATOR_TYPES, INDICATOR_TYPE_LABELS } from '@/lib/constants';
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
  const [selectedSemester, setSelectedSemester] = useState<number>(currentSemester);
  const [targetValues, setTargetValues] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isFetching, setIsFetching] = useState(false);

  // Fetch existing targets when indicator/year/semester changes
  useEffect(() => {
    if (!isOpen || !selectedIndicator) return;

    const fetchExistingTargets = async () => {
      setIsFetching(true);
      try {
        const response = await databases.listDocuments(
          APPWRITE_CONFIG.DATABASE_ID,
          APPWRITE_CONFIG.COLLECTIONS.TARGETS,
          [
            Query.equal('indicator_type', selectedIndicator),
            Query.equal('year', selectedYear),
            Query.equal('semester', selectedSemester),
            Query.limit(100)
          ]
        );

        const targets = response.documents as unknown as Target[];
        const targetMap: Record<string, number> = {};
        
        targets.forEach(target => {
          targetMap[target.upt_name] = target.target_value;
        });

        setTargetValues(targetMap);
      } catch (err) {
        console.error('Failed to fetch existing targets:', err);
      } finally {
        setIsFetching(false);
      }
    };

    fetchExistingTargets();
  }, [isOpen, selectedIndicator, selectedYear, selectedSemester]);

  const handleTargetChange = (uptName: string, value: string) => {
    const numValue = parseInt(value, 10);
    setTargetValues(prev => ({
      ...prev,
      [uptName]: isNaN(numValue) ? 0 : numValue
    }));
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
      const response = await databases.listDocuments(
        APPWRITE_CONFIG.DATABASE_ID,
        APPWRITE_CONFIG.COLLECTIONS.TARGETS,
        [
          Query.equal('indicator_type', selectedIndicator),
          Query.equal('year', selectedYear),
          Query.equal('semester', selectedSemester),
          Query.limit(100)
        ]
      );

      const existingTargets = response.documents as unknown as Target[];
      const existingMap = new Map(existingTargets.map(t => [t.upt_name, t]));

      // Process each UPT
      for (const uptName of UPT_NAMES) {
        const targetValue = targetValues[uptName] || 0;
        const existing = existingMap.get(uptName);

        if (existing) {
          // Update existing target
          await databases.updateDocument(
            APPWRITE_CONFIG.DATABASE_ID,
            APPWRITE_CONFIG.COLLECTIONS.TARGETS,
            existing.$id,
            { target_value: targetValue }
          );
        } else {
          // Create new target
          await databases.createDocument(
            APPWRITE_CONFIG.DATABASE_ID,
            APPWRITE_CONFIG.COLLECTIONS.TARGETS,
            ID.unique(),
            {
              upt_name: uptName,
              indicator_type: selectedIndicator,
              target_value: targetValue,
              year: selectedYear,
              semester: selectedSemester
            }
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
    setTargetValues({});
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-cyber-darker border-2 border-neon-pink rounded-lg shadow-glow-pink max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-cyber-light border-b-2 border-neon-pink p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-mono font-bold text-neon-pink tracking-wider">
                🎯 MANAGE TARGETS
              </h2>
              <p className="text-sm font-mono text-cyber-text-dim mt-1">
                {'>'} Set performance targets for each UPT
              </p>
            </div>
            <button
              onClick={handleClose}
              className="text-cyber-text hover:text-neon-pink transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-950/50 border-2 border-red-500 rounded-lg p-4">
              <p className="text-red-400 font-mono text-sm">{'>'} {error}</p>
            </div>
          )}

          {/* Selection Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Indicator Type */}
            <div>
              <label className="block text-sm font-mono text-neon-blue mb-2">
                {'>'} INDICATOR TYPE
              </label>
              <select
                value={selectedIndicator}
                onChange={(e) => setSelectedIndicator(e.target.value as IndicatorType)}
                className="w-full bg-cyber-light border-2 border-cyber-light focus:border-neon-blue text-cyber-text font-mono px-4 py-2 rounded transition-colors outline-none"
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
              <label className="block text-sm font-mono text-neon-blue mb-2">
                {'>'} YEAR
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
                className="w-full bg-cyber-light border-2 border-cyber-light focus:border-neon-blue text-cyber-text font-mono px-4 py-2 rounded transition-colors outline-none"
              >
                <option value={currentYear - 1}>{currentYear - 1}</option>
                <option value={currentYear}>{currentYear}</option>
                <option value={currentYear + 1}>{currentYear + 1}</option>
              </select>
            </div>

            {/* Semester */}
            <div>
              <label className="block text-sm font-mono text-neon-blue mb-2">
                {'>'} SEMESTER
              </label>
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(parseInt(e.target.value, 10))}
                className="w-full bg-cyber-light border-2 border-cyber-light focus:border-neon-blue text-cyber-text font-mono px-4 py-2 rounded transition-colors outline-none"
              >
                <option value={1}>Semester 1 (Jan - Jun)</option>
                <option value={2}>Semester 2 (Jul - Dec)</option>
              </select>
            </div>
          </div>

          {/* Target Input Grid */}
          {selectedIndicator ? (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <h3 className="text-lg font-mono font-bold text-neon-pink">
                  TARGET VALUES
                </h3>
                {isFetching && (
                  <div className="w-4 h-4 border-2 border-neon-pink border-t-transparent rounded-full animate-spin" />
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {UPT_NAMES.map((uptName) => (
                  <div
                    key={uptName}
                    className="bg-cyber-light border-2 border-neon-blue/30 rounded-lg p-4 hover:border-neon-blue transition-colors"
                  >
                    <label className="block text-sm font-mono text-neon-green mb-2">
                      {uptName}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={targetValues[uptName] || 0}
                      onChange={(e) => handleTargetChange(uptName, e.target.value)}
                      className="w-full bg-cyber-darker border-2 border-cyber-light focus:border-neon-blue text-cyber-text font-mono text-lg px-4 py-2 rounded transition-colors outline-none"
                      placeholder="0"
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-cyber-light rounded-full border-2 border-neon-blue mb-4">
                <span className="text-3xl">🎯</span>
              </div>
              <p className="text-cyber-text-dim font-mono">
                {'>'} Pilih Indicator Type untuk mulai set target
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t-2 border-neon-pink p-6 bg-cyber-light">
          <div className="flex justify-end gap-4">
            <button
              onClick={handleClose}
              disabled={loading}
              className="px-6 py-2 bg-cyber-darker border-2 border-cyber-text text-cyber-text font-mono font-bold rounded hover:border-neon-blue hover:text-neon-blue transition-colors disabled:opacity-50"
            >
              CANCEL
            </button>
            <button
              onClick={handleSave}
              disabled={loading || !selectedIndicator}
              className="px-6 py-2 bg-neon-pink text-cyber-dark font-mono font-bold rounded shadow-glow-pink hover:bg-neon-green hover:shadow-glow-green transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'SAVING...' : 'SAVE TARGETS'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 