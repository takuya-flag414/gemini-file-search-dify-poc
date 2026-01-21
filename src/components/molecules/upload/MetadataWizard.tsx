/**
 * MetadataWizard Component
 * ファイルアップロード時のメタデータ設定ウィザード
 * 3ステップ: ファイル選択 → メタデータ設定 → 確認・アップロード
 */

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowLeft, ArrowRight, Upload, Building2, Users, FolderOpen, Check } from 'lucide-react';
import { WizardProgress } from './WizardProgress';
import { WizardStep } from './WizardStep';
import { FileDropZone } from '../FileDropZone';
import { Select } from '../../atoms';
import { FileIcon } from '../../atoms/FileIcon';
import { METADATA_OPTIONS } from '../../../types';

// ============================================
// Types
// ============================================

export interface FileMetadata {
    company: string;
    department: string;
    filetype: string;
}

interface MetadataWizardProps {
    isOpen: boolean;
    onClose: () => void;
    onUpload: (file: File, metadata: FileMetadata) => Promise<void>;
    isUploading: boolean;
}

// ============================================
// Step Labels
// ============================================

const STEP_LABELS = ['ファイル選択', 'メタデータ設定', '確認'];

// ============================================
// Helper: Format file size
// ============================================

function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ============================================
// Component
// ============================================

export function MetadataWizard({
    isOpen,
    onClose,
    onUpload,
    isUploading,
}: MetadataWizardProps) {
    // State
    const [currentStep, setCurrentStep] = useState(1);
    const [direction, setDirection] = useState(1);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [metadata, setMetadata] = useState<FileMetadata>({
        company: '',
        department: '',
        filetype: '',
    });

    // Reset state when closing
    const handleClose = useCallback(() => {
        setCurrentStep(1);
        setDirection(1);
        setSelectedFile(null);
        setMetadata({ company: '', department: '', filetype: '' });
        onClose();
    }, [onClose]);

    // Navigation
    const goNext = useCallback(() => {
        setDirection(1);
        setCurrentStep(prev => Math.min(prev + 1, 3));
    }, []);

    const goBack = useCallback(() => {
        setDirection(-1);
        setCurrentStep(prev => Math.max(prev - 1, 1));
    }, []);

    // File selection handler
    const handleFileDrop = useCallback((file: File) => {
        setSelectedFile(file);
        // Automatically advance to next step
        setTimeout(() => {
            setDirection(1);
            setCurrentStep(2);
        }, 300);
    }, []);

    // Upload handler
    const handleUpload = useCallback(async () => {
        if (!selectedFile) return;
        await onUpload(selectedFile, metadata);
        handleClose();
    }, [selectedFile, metadata, onUpload, handleClose]);

    // Check if metadata is complete
    const isMetadataComplete = Boolean(metadata.company && metadata.department && metadata.filetype);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                >
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={handleClose}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ scale: 0.95, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.95, y: 20 }}
                        transition={{
                            type: 'spring',
                            stiffness: 250,
                            damping: 25,
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="
                            relative
                            w-full max-w-lg
                            glass-hud rounded-[22px]
                            shadow-2xl
                            overflow-hidden
                        "
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-sys-separator/50">
                            <h2 className="text-headline font-semibold text-sys-text-primary">
                                ファイルをアップロード
                            </h2>
                            <button
                                onClick={handleClose}
                                className="
                                    w-8 h-8 rounded-full
                                    flex items-center justify-center
                                    text-sys-text-tertiary hover:text-sys-text-primary
                                    hover:bg-sys-bg-alt/50
                                    transition-colors
                                "
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Progress Indicator */}
                        <div className="px-6 py-4 border-b border-sys-separator/30">
                            <WizardProgress
                                totalSteps={3}
                                currentStep={currentStep}
                                labels={STEP_LABELS}
                            />
                        </div>

                        {/* Content */}
                        <div className="px-6 py-6 min-h-[320px] overflow-hidden">
                            <AnimatePresence mode="wait" custom={direction}>
                                {/* Step 1: File Selection */}
                                {currentStep === 1 && (
                                    <WizardStep key="step1" direction={direction}>
                                        <div className="space-y-4">
                                            <p className="text-subheadline text-sys-text-secondary text-center mb-4">
                                                アップロードするファイルを選択してください
                                            </p>
                                            <FileDropZone
                                                onFileDrop={handleFileDrop}
                                                isUploading={false}
                                                uploadedFileName={selectedFile?.name || null}
                                            />
                                        </div>
                                    </WizardStep>
                                )}

                                {/* Step 2: Metadata Selection */}
                                {currentStep === 2 && (
                                    <WizardStep key="step2" direction={direction}>
                                        <div className="space-y-4">
                                            <p className="text-subheadline text-sys-text-secondary text-center mb-4">
                                                メタデータを設定してください
                                            </p>

                                            {/* Company */}
                                            <div className="flex items-start gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-action-primary/10 flex items-center justify-center flex-shrink-0">
                                                    <Building2 className="w-5 h-5 text-action-primary" />
                                                </div>
                                                <div className="flex-1">
                                                    <Select
                                                        label="会社"
                                                        value={metadata.company}
                                                        onChange={(e) => setMetadata(prev => ({ ...prev, company: e.target.value }))}
                                                        options={[
                                                            { value: '', label: '選択してください...' },
                                                            ...METADATA_OPTIONS.company.map(v => ({ value: v, label: v }))
                                                        ]}
                                                    />
                                                </div>
                                            </div>

                                            {/* Department */}
                                            <div className="flex items-start gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-feedback-info/10 flex items-center justify-center flex-shrink-0">
                                                    <Users className="w-5 h-5 text-feedback-info" />
                                                </div>
                                                <div className="flex-1">
                                                    <Select
                                                        label="部署"
                                                        value={metadata.department}
                                                        onChange={(e) => setMetadata(prev => ({ ...prev, department: e.target.value }))}
                                                        options={[
                                                            { value: '', label: '選択してください...' },
                                                            ...METADATA_OPTIONS.department.map(v => ({ value: v, label: v }))
                                                        ]}
                                                    />
                                                </div>
                                            </div>

                                            {/* File Type */}
                                            <div className="flex items-start gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-feedback-warning/10 flex items-center justify-center flex-shrink-0">
                                                    <FolderOpen className="w-5 h-5 text-feedback-warning" />
                                                </div>
                                                <div className="flex-1">
                                                    <Select
                                                        label="ファイル種別"
                                                        value={metadata.filetype}
                                                        onChange={(e) => setMetadata(prev => ({ ...prev, filetype: e.target.value }))}
                                                        options={[
                                                            { value: '', label: '選択してください...' },
                                                            ...METADATA_OPTIONS.filetype.map(v => ({ value: v, label: v }))
                                                        ]}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </WizardStep>
                                )}

                                {/* Step 3: Confirmation */}
                                {currentStep === 3 && (
                                    <WizardStep key="step3" direction={direction}>
                                        <div className="space-y-4">
                                            <p className="text-subheadline text-sys-text-secondary text-center mb-4">
                                                内容を確認してアップロードしてください
                                            </p>

                                            {/* File Preview */}
                                            <div className="flex items-center gap-4 p-4 bg-sys-bg-alt/50 rounded-xl border border-sys-separator">
                                                <div className="w-12 h-12 flex-shrink-0">
                                                    <FileIcon mimeType={selectedFile?.type || ''} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-subheadline text-sys-text-primary font-medium truncate">
                                                        {selectedFile?.name}
                                                    </p>
                                                    <p className="text-footnote text-sys-text-tertiary">
                                                        {selectedFile ? formatFileSize(selectedFile.size) : ''}
                                                    </p>
                                                </div>
                                                <Check className="w-5 h-5 text-feedback-success flex-shrink-0" />
                                            </div>

                                            {/* Metadata Summary */}
                                            <div className="p-4 bg-sys-bg-alt/30 rounded-xl border border-sys-separator/50">
                                                <p className="text-footnote font-medium text-sys-text-secondary mb-3">
                                                    メタデータ
                                                </p>
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2 text-footnote">
                                                        <Building2 className="w-4 h-4 text-action-primary" />
                                                        <span className="text-sys-text-tertiary">会社:</span>
                                                        <span className="text-sys-text-primary">{metadata.company}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-footnote">
                                                        <Users className="w-4 h-4 text-feedback-info" />
                                                        <span className="text-sys-text-tertiary">部署:</span>
                                                        <span className="text-sys-text-primary">{metadata.department}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-footnote">
                                                        <FolderOpen className="w-4 h-4 text-feedback-warning" />
                                                        <span className="text-sys-text-tertiary">種別:</span>
                                                        <span className="text-sys-text-primary">{metadata.filetype}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </WizardStep>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between px-6 py-4 border-t border-sys-separator/50 bg-sys-bg-alt/30">
                            {/* Back Button */}
                            <div>
                                {currentStep > 1 && (
                                    <button
                                        onClick={goBack}
                                        disabled={isUploading}
                                        className="
                                            flex items-center gap-2 px-4 py-2
                                            text-subheadline text-sys-text-secondary
                                            hover:text-sys-text-primary
                                            disabled:opacity-50
                                            transition-colors
                                        "
                                    >
                                        <ArrowLeft className="w-4 h-4" />
                                        戻る
                                    </button>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-3">
                                {currentStep === 1 && (
                                    <button
                                        onClick={handleClose}
                                        className="
                                            px-4 py-2 rounded-lg
                                            text-subheadline text-sys-text-secondary
                                            hover:bg-sys-bg-alt/50
                                            transition-colors
                                        "
                                    >
                                        キャンセル
                                    </button>
                                )}

                                {currentStep === 2 && (
                                    <>
                                        <button
                                            onClick={goNext}
                                            disabled={!isMetadataComplete}
                                            className="
                                                flex items-center gap-2 px-5 py-2 rounded-lg
                                                bg-action-primary text-white
                                                text-subheadline font-medium
                                                hover:bg-action-hover
                                                disabled:opacity-50 disabled:cursor-not-allowed
                                                transition-colors
                                            "
                                        >
                                            次へ
                                            <ArrowRight className="w-4 h-4" />
                                        </button>
                                    </>
                                )}

                                {currentStep === 3 && (
                                    <button
                                        onClick={handleUpload}
                                        disabled={isUploading || !selectedFile}
                                        className="
                                            flex items-center gap-2 px-5 py-2 rounded-lg
                                            bg-action-primary text-white
                                            text-subheadline font-medium
                                            hover:bg-action-hover
                                            disabled:opacity-50 disabled:cursor-not-allowed
                                            transition-colors
                                        "
                                    >
                                        {isUploading ? (
                                            <>
                                                <span className="animate-spin">⏳</span>
                                                アップロード中...
                                            </>
                                        ) : (
                                            <>
                                                <Upload className="w-4 h-4" />
                                                アップロード
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
