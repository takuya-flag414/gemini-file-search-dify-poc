import type { ReactNode } from 'react';

// ============================================
// Badge Component
// ============================================

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';
type BadgeSize = 'sm' | 'md';

interface BadgeProps {
    children: ReactNode;
    variant?: BadgeVariant;
    size?: BadgeSize;
    className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
    default: 'bg-sys-bg-alt text-sys-text-secondary',
    success: 'bg-feedback-success/10 text-feedback-success',
    warning: 'bg-feedback-warning/10 text-feedback-warning',
    danger: 'bg-feedback-danger/10 text-feedback-danger',
    info: 'bg-action-primary/10 text-action-primary',
};

const sizeStyles: Record<BadgeSize, string> = {
    sm: 'px-1.5 py-0.5 text-caption-2',
    md: 'px-2 py-0.5 text-caption-1',
};

export function Badge({ children, variant = 'default', size = 'md', className = '' }: BadgeProps) {
    return (
        <span
            className={`
        inline-flex items-center 
        font-medium
        rounded-full
        ${sizeStyles[size]}
        ${variantStyles[variant]}
        ${className}
      `.trim().replace(/\s+/g, ' ')}
        >
            {children}
        </span>
    );
}

