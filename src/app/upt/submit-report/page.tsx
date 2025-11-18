'use client';

import { useState, type FormEvent } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { databases, ID } from '@/lib/appwrite';
import { APPWRITE_CONFIG, INDICATOR_TYPES, SUB_CATEGORIES, VALIDATION_RULES, MESSAGES } from '@/lib/constants';
import type { IndicatorType, SubCategory } from '@/types';

export default function SubmitReportPage() {
  const { user, uptName, isLoading, role } = useAuth();
  const router = useRouter();

  // Form state
  const [indicatorType, setIndicatorType] = useState<IndicatorType | ''>('');
  const [subCategory, setSubCategory] = useState<SubCategory | ''>('');
  const [submissionDate, setSubmissionDate] = useState('');
  const [title, setTitle] = useState('');
  const [narasi, setNarasi] = useState('');
  const [documentationLink, setDocumentationLink] = useState('');
  
  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Check if sub-category should be shown
  const showSubCategory = indicatorType === 'INFLUENCER DAN SMR';

  // Redirect if not UPT user (useEffect to avoid hook order issues)
  if (!isLoading && role !== 'uptuser') {
    router.push('/login');
    return null;
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Validation
    if (!user) {
      setError('User not authenticated');
      return;
    }

    if (!uptName) {
      setError('UPT name not found in user profile');
      return;
    }

    if (title.length < VALIDATION_RULES.TITLE.MIN_LENGTH) {
      setError(`Title must be at least ${VALIDATION_RULES.TITLE.MIN_LENGTH} characters`);
      return;
    }

    if (narasi.length < VALIDATION_RULES.NARASI.MIN_LENGTH) {
      setError(`Narasi must be at least ${VALIDATION_RULES.NARASI.MIN_LENGTH} characters`);
      return;
    }

    if (!VALIDATION_RULES.DOCUMENTATION_LINK.PATTERN.test(documentationLink)) {
      setError(MESSAGES.ERROR.INVALID_URL);
      return;
    }

    try {
      setIsSubmitting(true);

      // Prepare submission data
      const submissionData = {
        indicator_type: indicatorType,
        sub_category: showSubCategory && subCategory ? subCategory : null,
        submitted_by_upt: uptName,
        submission_date: new Date(submissionDate).toISOString(),
        title: title.trim(),
        narasi: narasi.trim(),
        documentation_link: documentationLink.trim(),
        submitted_by_user: user.$id,
      };

      // Create document in Appwrite
      await databases.createDocument(
        APPWRITE_CONFIG.DATABASE_ID,
        APPWRITE_CONFIG.COLLECTIONS.SUBMISSIONS,
        ID.unique(),
        submissionData
      );

      // Success!
      setSuccess(true);
      
      // Reset form
      setIndicatorType('');
      setSubCategory('');
      setSubmissionDate('');
      setTitle('');
      setNarasi('');
      setDocumentationLink('');

      // Redirect after 2 seconds
      setTimeout(() => {
        router.push('/upt');
      }, 2000);

    } catch (err) {
      console.error('Submission error:', err);
      setError('Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-neon-green border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-neon-green font-mono">LOADING SUBMISSION INTERFACE...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-cyber-light border-2 border-neon-green rounded-lg p-4 mb-6 shadow-glow-green-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-neon-green rounded-lg flex items-center justify-center shadow-glow-green">
                <span className="text-cyber-dark font-mono font-bold text-xl">➕</span>
              </div>
              <div>
                <h1 className="text-neon-green text-3xl font-mono font-bold tracking-wider">
                  NEW SUBMISSION
                </h1>
                <p className="text-cyber-text-dim font-mono text-sm">
                  {uptName ? uptName.toUpperCase() : 'UPT USER'} {'//'} CREATE REPORT
                </p>
              </div>
            </div>
            
            <Link
              href="/upt"
              className="bg-cyber-dark border-2 border-neon-green text-neon-green px-4 py-2 rounded font-mono
                         hover:bg-neon-green hover:text-cyber-dark hover:shadow-glow-green-sm
                         transition-all duration-300"
            >
              BACK
            </Link>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-cyber-darker border-2 border-neon-green rounded-lg p-6 mb-6 shadow-glow-green">
            <div className="text-center">
              <div className="flex w-16 h-16 bg-neon-green rounded-full items-center justify-center mb-4 shadow-glow-green">
                <span className="text-cyber-dark text-3xl">✓</span>
              </div>
              <h3 className="text-neon-green text-xl font-mono font-bold mb-2">
                SUBMISSION SUCCESSFUL
              </h3>
              <p className="text-cyber-text font-mono text-sm">
                {'>'} Report has been saved to the database
              </p>
              <p className="text-cyber-text-dim font-mono text-sm mt-1">
                {'>'} Redirecting to dashboard...
              </p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-950/50 border-2 border-red-500 rounded-lg p-4 shadow-[0_0_15px_rgba(239,68,68,0.3)]">
            <p className="text-red-400 font-mono text-sm flex items-center gap-2">
              <span className="text-red-500 text-xl">⚠</span>
              {error}
            </p>
          </div>
        )}

        {/* Form Card */}
        <div className="bg-cyber-darker border-2 border-neon-green rounded-lg p-8 shadow-glow-green-sm">
          {/* Terminal Header */}
          <div className="mb-6 border-l-2 border-neon-green pl-3">
            <p className="text-cyber-text-dim font-mono text-xs">
              <span className="text-neon-green">{'>'}</span> INITIALIZING SUBMISSION PROTOCOL...
            </p>
            <p className="text-cyber-text-dim font-mono text-xs">
              <span className="text-neon-green">{'>'}</span> REPORTER: {uptName}
            </p>
            <p className="text-cyber-text-dim font-mono text-xs">
              <span className="text-neon-green">{'>'}</span> ENTER PERFORMANCE DATA BELOW
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Indicator Type */}
            <div>
              <label htmlFor="indicator_type" className="block text-neon-green font-mono text-sm mb-2 tracking-wide">
                {'>'} INDICATOR_TYPE: <span className="text-red-400">*</span>
              </label>
              <select
                id="indicator_type"
                value={indicatorType}
                onChange={(e) => {
                  setIndicatorType(e.target.value as IndicatorType);
                  setSubCategory(''); // Reset sub-category when indicator changes
                }}
                required
                disabled={isSubmitting}
                className="w-full bg-cyber-dark border-2 border-cyber-light text-cyber-text font-mono px-4 py-3 rounded
                          focus:border-neon-green focus:shadow-glow-green-sm focus:outline-none
                          disabled:opacity-50 disabled:cursor-not-allowed
                          transition-all duration-300"
              >
                <option value="">-- SELECT INDICATOR --</option>
                {INDICATOR_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Sub-Category (Conditional) */}
            {showSubCategory && (
              <div className="animate-[slideDown_0.3s_ease-out]">
                <label htmlFor="sub_category" className="block text-neon-green font-mono text-sm mb-2 tracking-wide">
                  {'>'} SUB_CATEGORY: <span className="text-red-400">*</span>
                </label>
                <select
                  id="sub_category"
                  value={subCategory}
                  onChange={(e) => setSubCategory(e.target.value as SubCategory)}
                  required={showSubCategory}
                  disabled={isSubmitting}
                  className="w-full bg-cyber-dark border-2 border-cyber-light text-cyber-text font-mono px-4 py-3 rounded
                            focus:border-neon-green focus:shadow-glow-green-sm focus:outline-none
                            disabled:opacity-50 disabled:cursor-not-allowed
                            transition-all duration-300"
                >
                  <option value="">-- SELECT SUB-CATEGORY --</option>
                  {SUB_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <p className="text-cyber-text-dim font-mono text-xs mt-1">
                  {'>'} Required for INFLUENCER DAN SMR indicator
                </p>
              </div>
            )}

            {/* Submission Date */}
            <div>
              <label htmlFor="submission_date" className="block text-neon-green font-mono text-sm mb-2 tracking-wide">
                {'>'} SUBMISSION_DATE: <span className="text-red-400">*</span>
              </label>
              <input
                id="submission_date"
                type="date"
                value={submissionDate}
                onChange={(e) => setSubmissionDate(e.target.value)}
                required
                disabled={isSubmitting}
                className="w-full bg-cyber-dark border-2 border-cyber-light text-cyber-text font-mono px-4 py-3 rounded
                          focus:border-neon-green focus:shadow-glow-green-sm focus:outline-none
                          disabled:opacity-50 disabled:cursor-not-allowed
                          transition-all duration-300"
              />
            </div>

            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-neon-green font-mono text-sm mb-2 tracking-wide">
                {'>'} TITLE: <span className="text-red-400">*</span>
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                minLength={VALIDATION_RULES.TITLE.MIN_LENGTH}
                maxLength={VALIDATION_RULES.TITLE.MAX_LENGTH}
                disabled={isSubmitting}
                placeholder="e.g., PLN Berhasil Menyelesaikan..."
                className="w-full bg-cyber-dark border-2 border-cyber-light text-cyber-text font-mono px-4 py-3 rounded
                          focus:border-neon-green focus:shadow-glow-green-sm focus:outline-none
                          disabled:opacity-50 disabled:cursor-not-allowed
                          transition-all duration-300
                          placeholder:text-cyber-text-dim placeholder:italic"
              />
              <p className="text-cyber-text-dim font-mono text-xs mt-1">
                {'>'} Min: {VALIDATION_RULES.TITLE.MIN_LENGTH} chars | Current: {title.length}
              </p>
            </div>

            {/* Narasi */}
            <div>
              <label htmlFor="narasi" className="block text-neon-green font-mono text-sm mb-2 tracking-wide">
                {'>'} NARASI: <span className="text-red-400">*</span>
              </label>
              <textarea
                id="narasi"
                value={narasi}
                onChange={(e) => setNarasi(e.target.value)}
                required
                minLength={VALIDATION_RULES.NARASI.MIN_LENGTH}
                maxLength={VALIDATION_RULES.NARASI.MAX_LENGTH}
                disabled={isSubmitting}
                rows={6}
                placeholder="Enter detailed narrative description..."
                className="w-full bg-cyber-dark border-2 border-cyber-light text-cyber-text font-mono px-4 py-3 rounded
                          focus:border-neon-green focus:shadow-glow-green-sm focus:outline-none
                          disabled:opacity-50 disabled:cursor-not-allowed
                          transition-all duration-300 resize-y
                          placeholder:text-cyber-text-dim placeholder:italic"
              />
              <p className="text-cyber-text-dim font-mono text-xs mt-1">
                {'>'} Min: {VALIDATION_RULES.NARASI.MIN_LENGTH} chars | Current: {narasi.length} / {VALIDATION_RULES.NARASI.MAX_LENGTH}
              </p>
            </div>

            {/* Documentation Link */}
            <div>
              <label htmlFor="documentation_link" className="block text-neon-green font-mono text-sm mb-2 tracking-wide">
                {'>'} DOCUMENTATION_LINK: <span className="text-red-400">*</span>
              </label>
              <input
                id="documentation_link"
                type="url"
                value={documentationLink}
                onChange={(e) => setDocumentationLink(e.target.value)}
                required
                maxLength={VALIDATION_RULES.DOCUMENTATION_LINK.MAX_LENGTH}
                disabled={isSubmitting}
                placeholder="https://drive.google.com/..."
                className="w-full bg-cyber-dark border-2 border-cyber-light text-cyber-text font-mono px-4 py-3 rounded
                          focus:border-neon-green focus:shadow-glow-green-sm focus:outline-none
                          disabled:opacity-50 disabled:cursor-not-allowed
                          transition-all duration-300
                          placeholder:text-cyber-text-dim placeholder:italic"
              />
              <p className="text-cyber-text-dim font-mono text-xs mt-1">
                {'>'} Must start with http:// or https://
              </p>
            </div>

            {/* Submit Button */}
            <div className="pt-4 border-t border-cyber-light">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-neon-green text-cyber-dark font-mono font-bold py-4 px-6 rounded
                           shadow-glow-green hover:bg-neon-blue hover:shadow-glow-blue
                           disabled:bg-cyber-light disabled:text-cyber-text-dim disabled:shadow-none
                           transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]
                           disabled:cursor-not-allowed disabled:transform-none"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="inline-block w-5 h-5 border-2 border-cyber-dark border-t-transparent rounded-full animate-spin" />
                    TRANSMITTING DATA...
                  </span>
                ) : (
                  '[ SUBMIT REPORT ]'
                )}
              </button>
            </div>
          </form>

          {/* Footer Info */}
          <div className="mt-6 pt-6 border-t border-cyber-light">
            <p className="text-cyber-text-dim font-mono text-xs text-center">
              <span className="text-neon-green">⬡</span> All fields marked with <span className="text-red-400">*</span> are required
            </p>
          </div>
        </div>

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
