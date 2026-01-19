import { forwardRef } from 'react';
import type { ButtonHTMLAttributes } from 'react';

// ============================================
// Button Variants
// ============================================

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    isLoading?: boolean;
    glowing?: boolean;
}

// ============================================
// Styles
// ============================================

const baseStyles = `
  relative inline-flex items-center justify-center gap-2
  font-medium transition-all duration-200
  focus-ring disabled:opacity-50 disabled:cursor-not-allowed
  select-none
`;

const variantStyles: Record<ButtonVariant, string> = {
    primary: `
    bg-action-primary text-white
    hover:bg-action-hover active:scale-[0.98]
    shadow-button
  `,
    secondary: `
    bg-sys-bg-alt text-sys-text-primary
    hover:bg-opacity-80 active:scale-[0.98]
    border border-sys-separator
  `,
    ghost: `
    bg-transparent text-sys-text-primary
    hover:bg-sys-bg-alt active:scale-[0.98]
  `,
    danger: `
    bg-feedback-danger text-white
    hover:opacity-90 active:scale-[0.98]
    shadow-button
  `,
};

const sizeStyles: Record<ButtonSize, string> = {
    sm: 'h-7 px-3 text-footnote rounded-button',
    md: 'h-9 px-4 text-subheadline rounded-button',
    lg: 'h-11 px-6 text-body rounded-button',
};

// ============================================
// Component
// ============================================

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({
        variant = 'primary',
        size = 'md',
        isLoading = false,
        glowing = false,
        className = '',
        children,
        disabled,
        ...props
    }, ref) => {
        const combinedClassName = `
      ${baseStyles}
      ${variantStyles[variant]}
      ${sizeStyles[size]}
      ${glowing && variant === 'primary' ? 'ai-glowing-border overflow-visible' : ''}
      ${className}
    `.trim().replace(/\s+/g, ' ');

        return (
            <button
                ref={ref}
                className={combinedClassName}
                disabled={disabled || isLoading}
                {...props}
            >
                {isLoading ? (
                    <>
                        <LoadingSpinner />
                        <span>処理中...</span>
                    </>
                ) : (
                    children
                )}
            </button>
        );
    }
);

Button.displayName = 'Button';

// ============================================
// Loading Spinner
// ============================================

function LoadingSpinner() {
    return (
        <svg
            className="animate-spin h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
        >
            <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
            />
            <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
        </svg>
    );
}
