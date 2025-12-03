'use client';

import { useState } from 'react';
import { databases, ID } from '@/lib/appwrite';
import { APPWRITE_CONFIG, UPT_NAMES, VALIDATION_RULES } from '@/lib/constants';

interface CreateInstructionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  adminUserId: string;
  adminName: string;
}

export default function CreateInstructionModal({
  isOpen,
  onClose,
  onSuccess,
  adminUserId,
  adminName
}: CreateInstructionModalProps) {
  // Form state - simplified to 4 fields only
  const [subCategory, setSubCategory] = useState<'INFLUENCER' | 'SMR' | ''>('');
  const [targetType, setTargetType] = useState<'ALL' | 'SPECIFIC'>('ALL');
  const [selectedUPTs, setSelectedUPTs] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [contentLink, setContentLink] = useState('');
  const [captionInstagram, setCaptionInstagram] = useState('');
  const [captionTwitter, setCaptionTwitter] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleUPTToggle = (uptName: string) => {
    setSelectedUPTs((prev) =>
      prev.includes(uptName)
        ? prev.filter((upt) => upt !== uptName)
        : [...prev, uptName]
    );
  };

  const resetForm = () => {
    setSubCategory('');
    setTargetType('ALL');
    setSelectedUPTs([]);
    setTitle('');
    setContentLink('');
    setCaptionInstagram('');
    setCaptionTwitter('');
    setError('');
  };

  const validateForm = (): boolean => {
    // Sub-category required
    if (!subCategory) {
      setError('Pilih sub-category (INFLUENCER atau SMR)');
      return false;
    }

    // Target UPT validation
    if (targetType === 'SPECIFIC' && selectedUPTs.length === 0) {
      setError('Pilih minimal 1 UPT untuk target specific');
      return false;
    }

    // Title required
    if (!title || title.trim().length < VALIDATION_RULES.TITLE.MIN_LENGTH) {
      setError(`Judul minimal ${VALIDATION_RULES.TITLE.MIN_LENGTH} karakter`);
      return false;
    }

    // Content link required (Google Drive link)
    if (!contentLink || contentLink.trim().length === 0) {
      setError('Link Google Drive wajib diisi');
      return false;
    }

    // Validate Google Drive URL format
    if (!contentLink.includes('drive.google.com')) {
      setError('Link harus berupa URL Google Drive yang valid');
      return false;
    }

    // Caption Instagram required
    if (!captionInstagram || captionInstagram.trim().length === 0) {
      setError('Caption Instagram wajib diisi');
      return false;
    }

    // Caption Twitter required
    if (!captionTwitter || captionTwitter.trim().length === 0) {
      setError('Caption Twitter/X wajib diisi');
      return false;
    }

    return true;
  };

  const handleSubmit = async (saveAs: 'DRAFT' | 'PUBLISHED') => {
    setError('');

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const instructionData: Record<string, unknown> = {
        status: saveAs,
        indicator_type: 'INFLUENCER DAN SMR',
        sub_category: subCategory,
        target_type: targetType,
        target_upt: targetType === 'SPECIFIC' ? selectedUPTs : null,
        created_by_user: adminUserId,
        created_by_name: adminName,
        published_at: saveAs === 'PUBLISHED' ? new Date().toISOString() : null,
        // Simplified instruction content (4 fields only)
        title: title.trim(),
        content_link: contentLink.trim(),
        caption_instagram: captionInstagram.trim(),
        caption_twitter: captionTwitter.trim()
      };

      await databases.createDocument(
        APPWRITE_CONFIG.DATABASE_ID,
        APPWRITE_CONFIG.COLLECTIONS.INSTRUCTIONS,
        ID.unique(),
        instructionData
      );

      resetForm();
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Failed to create instruction:', err);
      setError('Gagal membuat instruksi. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-cyber-darker border-2 border-neon-pink rounded-lg shadow-glow-pink w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-cyber-light border-b-2 border-neon-pink p-6 z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-neon-pink text-2xl font-mono font-bold">
              📋 CREATE INSTRUCTION
            </h2>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="text-cyber-text hover:text-neon-pink transition-colors disabled:opacity-50"
            >
              <span className="text-2xl">✕</span>
            </button>
          </div>
          <p className="text-cyber-text-dim font-mono text-sm mt-2">
            {'>'} Buat instruksi untuk UPT (INFLUENCER / SMR)
          </p>
        </div>

        {/* Form */}
        <div className="p-6 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-900/20 border-2 border-red-500 rounded p-4 animate-[slideDown_0.3s_ease-out]">
              <p className="text-red-400 font-mono text-sm">❌ {error}</p>
            </div>
          )}

          {/* Sub-Category */}
          <div>
            <label className="block text-neon-green font-mono text-sm mb-2 tracking-wide">
              {'>'} SUB_CATEGORY: <span className="text-red-400">*</span>
            </label>
            <select
              value={subCategory}
              onChange={(e) => setSubCategory(e.target.value as 'INFLUENCER' | 'SMR' | '')}
              required
              disabled={isSubmitting}
              className="w-full bg-cyber-dark border-2 border-cyber-light text-cyber-text font-mono px-4 py-3 rounded
                        focus:border-neon-green focus:shadow-glow-green-sm focus:outline-none
                        disabled:opacity-50 disabled:cursor-not-allowed
                        transition-all duration-300"
            >
              <option value="">-- Pilih Sub-Category --</option>
              <option value="INFLUENCER">INFLUENCER</option>
              <option value="SMR">SMR</option>
            </select>
            <p className="text-cyber-text-dim font-mono text-xs mt-1">
              {'>'} Pilih target audience untuk instruksi ini
            </p>
          </div>

          {/* Target Type */}
          <div>
            <label className="block text-neon-green font-mono text-sm mb-2 tracking-wide">
              {'>'} TARGET_UPT: <span className="text-red-400">*</span>
            </label>
            <div className="space-y-3">
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="targetType"
                    value="ALL"
                    checked={targetType === 'ALL'}
                    onChange={(e) => setTargetType(e.target.value as 'ALL' | 'SPECIFIC')}
                    disabled={isSubmitting}
                    className="w-4 h-4 accent-neon-pink"
                  />
                  <span className="text-cyber-text font-mono">Semua UPT</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="targetType"
                    value="SPECIFIC"
                    checked={targetType === 'SPECIFIC'}
                    onChange={(e) => setTargetType(e.target.value as 'ALL' | 'SPECIFIC')}
                    disabled={isSubmitting}
                    className="w-4 h-4 accent-neon-pink"
                  />
                  <span className="text-cyber-text font-mono">UPT Tertentu</span>
                </label>
              </div>

              {/* UPT Selection (if SPECIFIC) */}
              {targetType === 'SPECIFIC' && (
                <div className="bg-cyber-dark border border-cyber-light rounded p-4 space-y-2 animate-[slideDown_0.3s_ease-out]">
                  <p className="text-cyber-text-dim font-mono text-xs mb-2">
                    Pilih UPT yang akan menerima instruksi:
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {UPT_NAMES.map((upt) => (
                      <label key={upt} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedUPTs.includes(upt)}
                          onChange={() => handleUPTToggle(upt)}
                          disabled={isSubmitting}
                          className="w-4 h-4 accent-neon-pink"
                        />
                        <span className="text-cyber-text font-mono text-sm">{upt}</span>
                      </label>
                    ))}
                  </div>
                  <p className="text-cyber-text-dim font-mono text-xs mt-2">
                    {'>'} Selected: {selectedUPTs.length} UPT
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Title */}
          {subCategory && (
            <div className="animate-[slideDown_0.3s_ease-out]">
              <label className="block text-neon-green font-mono text-sm mb-2 tracking-wide">
                {'>'} JUDUL INSTRUKSI: <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                minLength={VALIDATION_RULES.TITLE.MIN_LENGTH}
                maxLength={VALIDATION_RULES.TITLE.MAX_LENGTH}
                disabled={isSubmitting}
                placeholder="Contoh: Konten Hari Kemerdekaan 2025"
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
          )}

          {/* Google Drive Link */}
          {subCategory && (
            <div className="animate-[slideDown_0.3s_ease-out]">
              <label className="block text-neon-green font-mono text-sm mb-2 tracking-wide">
                {'>'} LINK GOOGLE DRIVE: <span className="text-red-400">*</span>
              </label>
              <input
                type="url"
                value={contentLink}
                onChange={(e) => setContentLink(e.target.value)}
                required
                disabled={isSubmitting}
                placeholder="https://drive.google.com/..."
                className="w-full bg-cyber-dark border-2 border-cyber-light text-cyber-text font-mono px-4 py-3 rounded
                          focus:border-neon-green focus:shadow-glow-green-sm focus:outline-none
                          disabled:opacity-50 disabled:cursor-not-allowed
                          transition-all duration-300
                          placeholder:text-cyber-text-dim placeholder:italic"
              />
              <p className="text-cyber-text-dim font-mono text-xs mt-1">
                {'>'} Link folder/file Google Drive yang berisi konten untuk diupload
              </p>
            </div>
          )}

          {/* Caption Instagram */}
          {subCategory && (
            <div className="animate-[slideDown_0.3s_ease-out]">
              <label className="block text-neon-green font-mono text-sm mb-2 tracking-wide">
                {'>'} CAPTION INSTAGRAM: <span className="text-red-400">*</span>
              </label>
              <textarea
                value={captionInstagram}
                onChange={(e) => setCaptionInstagram(e.target.value)}
                required
                disabled={isSubmitting}
                rows={4}
                placeholder="Tulis caption untuk Instagram...&#10;&#10;Bisa multi-line dengan hashtags dan emoji 📸"
                className="w-full bg-cyber-dark border-2 border-cyber-light text-cyber-text font-mono px-4 py-3 rounded
                          focus:border-neon-green focus:shadow-glow-green-sm focus:outline-none
                          disabled:opacity-50 disabled:cursor-not-allowed
                          transition-all duration-300
                          placeholder:text-cyber-text-dim placeholder:italic
                          resize-vertical"
              />
              <p className="text-cyber-text-dim font-mono text-xs mt-1">
                {'>'} Caption ini akan digunakan UPT untuk upload ke Instagram
              </p>
            </div>
          )}

          {/* Caption Twitter/X */}
          {subCategory && (
            <div className="animate-[slideDown_0.3s_ease-out]">
              <label className="block text-neon-green font-mono text-sm mb-2 tracking-wide">
                {'>'} CAPTION TWITTER/X: <span className="text-red-400">*</span>
              </label>
              <textarea
                value={captionTwitter}
                onChange={(e) => setCaptionTwitter(e.target.value)}
                required
                disabled={isSubmitting}
                rows={4}
                placeholder="Tulis caption untuk Twitter/X...&#10;&#10;Max 280 karakter untuk best practice 𝕏"
                className="w-full bg-cyber-dark border-2 border-cyber-light text-cyber-text font-mono px-4 py-3 rounded
                          focus:border-neon-green focus:shadow-glow-green-sm focus:outline-none
                          disabled:opacity-50 disabled:cursor-not-allowed
                          transition-all duration-300
                          placeholder:text-cyber-text-dim placeholder:italic
                          resize-vertical"
              />
              <p className="text-cyber-text-dim font-mono text-xs mt-1">
                {'>'} Caption ini akan digunakan UPT untuk upload ke Twitter/X
              </p>
            </div>
          )}

          {/* Info Box */}
          {subCategory && (
            <div className="bg-neon-blue/10 border-2 border-neon-blue/30 rounded-lg p-4 animate-[slideDown_0.3s_ease-out]">
              <h4 className="text-neon-blue font-mono font-bold mb-2 flex items-center gap-2">
                <span>ℹ️</span> INSTRUKSI YANG AKAN DIKIRIM KE UPT:
              </h4>
              <ol className="text-cyber-text font-mono text-sm space-y-2 list-decimal list-inside">
                <li>Download konten dari Google Drive yang sudah disediakan</li>
                <li>Upload konten tersebut ke <strong>seluruh platform media sosial</strong></li>
                <li>Gunakan caption yang sudah disediakan untuk Instagram dan Twitter/X</li>
                <li>Platform lain (Facebook, TikTok, YouTube, dll) gunakan caption yang sesuai</li>
              </ol>
              <p className="text-cyber-text-dim font-mono text-xs mt-3">
                {'>'} UPT akan tetap mengisi form submission seperti biasa setelah upload
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-cyber-light border-t-2 border-neon-pink p-6 flex gap-4 justify-end">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="bg-cyber-dark border-2 border-cyber-light text-cyber-text px-6 py-3 rounded font-mono
                       hover:border-neon-pink hover:text-neon-pink
                       transition-all duration-300
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            CANCEL
          </button>
          <button
            onClick={() => handleSubmit('DRAFT')}
            disabled={isSubmitting || !subCategory}
            className="bg-cyber-dark border-2 border-neon-blue text-neon-blue px-6 py-3 rounded font-mono font-bold
                       hover:bg-neon-blue hover:text-cyber-dark hover:shadow-glow-blue-sm
                       transition-all duration-300
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'SAVING...' : '💾 SAVE AS DRAFT'}
          </button>
          <button
            onClick={() => handleSubmit('PUBLISHED')}
            disabled={isSubmitting || !subCategory}
            className="bg-neon-pink text-cyber-dark px-6 py-3 rounded font-mono font-bold shadow-glow-pink
                       hover:bg-neon-purple hover:shadow-glow-purple
                       transition-all duration-300
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'PUBLISHING...' : '📢 PUBLISH NOW'}
          </button>
        </div>
      </div>
    </div>
  );
}