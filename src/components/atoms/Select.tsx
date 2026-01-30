import { forwardRef } from 'react';
import type { SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';

// ============================================
// Select Component
// ============================================

interface SelectOption {
    value: string;
    label: string;
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
    label?: string;
    error?: string;
    hint?: string;
    options: SelectOption[];
    placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
    ({ label, error, hint, options, placeholder, className = '', id, ...props }, ref) => {
        const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

        return (
            <div className="flex flex-col gap-1.5">
                {label && (
                    <label
                        htmlFor={selectId}
                        className="text-footnote font-medium text-sys-text-secondary"
                    >
                        {label}
                    </label>
                )}
                <div className="relative">
                    <select
                        ref={ref}
                        id={selectId}
                        className={`
                            h-9 w-full px-3 pr-10
                            bg-sys-bg-base text-sys-text-primary
                            border border-sys-separator rounded-lg
                            text-subheadline
                            appearance-none cursor-pointer
                            focus:outline-none focus:ring-2 focus:ring-action-primary/50 focus:border-action-primary
                            hover:border-sys-text-tertiary/30
                            transition-all duration-200
                            disabled:opacity-50 disabled:cursor-not-allowed
                            ${error ? 'border-feedback-danger focus:ring-feedback-danger/50' : ''}
                            ${className}
                        `.trim().replace(/\s+/g, ' ')}
                        {...props}
                    >
                        {placeholder && (
                            <option value="" disabled>
                                {placeholder}
                            </option>
                        )}
                        {options.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    <ChevronDown
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sys-text-tertiary pointer-events-none"
                    />
                </div>
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

Select.displayName = 'Select';
