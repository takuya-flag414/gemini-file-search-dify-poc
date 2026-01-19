import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';

// ============================================
// Input Component
// ============================================

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, hint, className = '', id, ...props }, ref) => {
        const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

        return (
            <div className="flex flex-col gap-1.5">
                {label && (
                    <label
                        htmlFor={inputId}
                        className="text-footnote font-medium text-sys-text-secondary"
                    >
                        {label}
                    </label>
                )}
                <input
                    ref={ref}
                    id={inputId}
                    className={`
                        h-9 px-3 
                        bg-sys-bg-alt/50 text-sys-text-primary
                        border border-sys-separator rounded-lg
                        text-subheadline
                        placeholder:text-sys-text-tertiary
                        focus:outline-none focus:ring-2 focus:ring-action-primary/50 focus:border-action-primary
                        hover:border-sys-text-tertiary/30
                        transition-all duration-200
                        disabled:opacity-50 disabled:cursor-not-allowed
                        ${error ? 'border-feedback-danger focus:ring-feedback-danger/50' : ''}
                        ${className}
                    `.trim().replace(/\s+/g, ' ')}
                    {...props}
                />
                {hint && !error && (
                    <p className="text-caption-1 text-sys-text-tertiary">{hint}</p>
                )}
                {error && (
                    <p className="text-caption-1 text-feedback-danger">{error}</p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';

// ============================================
// Textarea Component
// ============================================

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
    hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ label, error, hint, className = '', id, ...props }, ref) => {
        const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

        return (
            <div className="flex flex-col gap-1.5">
                {label && (
                    <label
                        htmlFor={textareaId}
                        className="text-footnote font-medium text-sys-text-secondary"
                    >
                        {label}
                    </label>
                )}
                <textarea
                    ref={ref}
                    id={textareaId}
                    className={`
            min-h-[80px] px-3 py-2
            bg-sys-bg-base text-sys-text-primary
            border border-sys-separator rounded-input
            text-subheadline
            placeholder:text-sys-text-tertiary
            focus-ring
            transition-colors duration-200
            resize-y
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error ? 'border-feedback-danger' : ''}
            ${className}
          `.trim().replace(/\s+/g, ' ')}
                    {...props}
                />
                {hint && !error && (
                    <p className="text-caption-1 text-sys-text-tertiary">{hint}</p>
                )}
                {error && (
                    <p className="text-caption-1 text-feedback-danger">{error}</p>
                )}
            </div>
        );
    }
);

Textarea.displayName = 'Textarea';
