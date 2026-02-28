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
        indicator_type: 'PENGELOLAAN INFLUENCER MEDIA SOSIAL UNIT',
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-scaleIn">
        {/* Header */}
        <div className="sticky top-0 bg-pln-blue p-6 z-10 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Buat Instruksi Baru
              </h2>
              <p className="text-blue-100 text-sm mt-1">
                Buat instruksi untuk UPT (INFLUENCER / SMR)
              </p>
            </div>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg disabled:opacity-50"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
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

          {/* Sub-Category */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Sub-Category <span className="text-red-500">*</span>
            </label>
            <select
              value={subCategory}
              onChange={(e) => setSubCategory(e.target.value as 'INFLUENCER' | 'SMR' | '')}
              required
              disabled={isSubmitting}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-800 bg-white focus:ring-2 focus:ring-pln-blue focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">-- Pilih Sub-Category --</option>
              <option value="INFLUENCER">INFLUENCER</option>
              <option value="SMR">SMR</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Pilih target audience untuk instruksi ini
            </p>
          </div>

          {/* Target Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Target UPT <span className="text-red-500">*</span>
            </label>
            <div className="space-y-4">
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="targetType"
                    value="ALL"
                    checked={targetType === 'ALL'}
                    onChange={(e) => setTargetType(e.target.value as 'ALL' | 'SPECIFIC')}
                    disabled={isSubmitting}
                    className="w-4 h-4 text-pln-blue focus:ring-pln-blue"
                  />
                  <span className="text-gray-700">Semua UPT</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="targetType"
                    value="SPECIFIC"
                    checked={targetType === 'SPECIFIC'}
                    onChange={(e) => setTargetType(e.target.value as 'ALL' | 'SPECIFIC')}
                    disabled={isSubmitting}
                    className="w-4 h-4 text-pln-blue focus:ring-pln-blue"
                  />
                  <span className="text-gray-700">UPT Tertentu</span>
                </label>
              </div>

              {/* UPT Selection (if SPECIFIC) */}
              {targetType === 'SPECIFIC' && (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
                  <p className="text-sm text-gray-600 mb-2">
                    Pilih UPT yang akan menerima instruksi:
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {UPT_NAMES.map((upt) => (
                      <label key={upt} className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-gray-100 transition-colors">
                        <input
                          type="checkbox"
                          checked={selectedUPTs.includes(upt)}
                          onChange={() => handleUPTToggle(upt)}
                          disabled={isSubmitting}
                          className="w-4 h-4 text-pln-blue rounded focus:ring-pln-blue"
                        />
                        <span className="text-gray-700 text-sm">{upt}</span>
                      </label>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Terpilih: {selectedUPTs.length} UPT
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Title */}
          {subCategory && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Judul Instruksi <span className="text-red-500">*</span>
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
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-pln-blue focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">
                Min: {VALIDATION_RULES.TITLE.MIN_LENGTH} karakter | Current: {title.length}
              </p>
            </div>
          )}

          {/* Google Drive Link */}
          {subCategory && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Link Google Drive <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </span>
                <input
                  type="url"
                  value={contentLink}
                  onChange={(e) => setContentLink(e.target.value)}
                  required
                  disabled={isSubmitting}
                  placeholder="https://drive.google.com/..."
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-pln-blue focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Link folder/file Google Drive yang berisi konten untuk diupload
              </p>
            </div>
          )}

          {/* Caption Instagram */}
          {subCategory && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Caption Instagram <span className="text-red-500">*</span>
              </label>
              <textarea
                value={captionInstagram}
                onChange={(e) => setCaptionInstagram(e.target.value)}
                required
                disabled={isSubmitting}
                rows={4}
                placeholder="Tulis caption untuk Instagram...&#10;&#10;Bisa multi-line dengan hashtags dan emoji 📸"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-pln-blue focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                Caption ini akan digunakan UPT untuk upload ke Instagram
              </p>
            </div>
          )}

          {/* Caption Twitter/X */}
          {subCategory && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Caption Twitter/X <span className="text-red-500">*</span>
              </label>
              <textarea
                value={captionTwitter}
                onChange={(e) => setCaptionTwitter(e.target.value)}
                required
                disabled={isSubmitting}
                rows={4}
                maxLength={280}
                placeholder="Tulis caption untuk Twitter/X...&#10;&#10;Max 280 karakter untuk best practice 𝕏"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-pln-blue focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed resize-none"
              />
              <p className={`text-xs mt-1 ${captionTwitter.length > 260 ? 'text-amber-600' : 'text-gray-500'}`}>
                {captionTwitter.length}/280 karakter • Caption ini akan digunakan UPT untuk upload ke Twitter/X
              </p>
            </div>
          )}

          {/* Info Box */}
          {subCategory && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <h4 className="font-semibold text-pln-blue mb-2 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Instruksi yang akan dikirim ke UPT:
              </h4>
              <ol className="text-sm text-gray-700 space-y-2 list-decimal list-inside">
                <li>Download konten dari Google Drive yang sudah disediakan</li>
                <li>Upload konten tersebut ke <strong>seluruh platform media sosial</strong></li>
                <li>Gunakan caption yang sudah disediakan untuk Instagram dan Twitter/X</li>
                <li>Platform lain (Facebook, TikTok, YouTube, dll) gunakan caption yang sesuai</li>
              </ol>
              <p className="text-xs text-gray-500 mt-3">
                UPT akan tetap mengisi form submission seperti biasa setelah upload
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-4 flex gap-3 justify-end rounded-b-2xl">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Batal
          </button>
          <button
            onClick={() => handleSubmit('DRAFT')}
            disabled={isSubmitting || !subCategory}
            className="px-6 py-2.5 border border-pln-blue text-pln-blue rounded-xl font-medium hover:bg-pln-blue hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-pln-blue border-t-transparent rounded-full animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                Simpan Draft
              </>
            )}
          </button>
          <button
            onClick={() => handleSubmit('PUBLISHED')}
            disabled={isSubmitting || !subCategory}
            className="px-6 py-2.5 bg-pln-blue hover:bg-pln-blue-dark text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Mempublikasi...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                </svg>
                Publikasikan
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
