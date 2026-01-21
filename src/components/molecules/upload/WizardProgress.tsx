/**
 * WizardProgress Component
 * 進捗インジケーター - 現在のステップをビジュアルで表示
 */

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface WizardProgressProps {
    totalSteps: number;
    currentStep: number;
    labels?: string[];
}

export function WizardProgress({ totalSteps, currentStep, labels }: WizardProgressProps) {
    return (
        <div className="flex items-center justify-center gap-2">
            {Array.from({ length: totalSteps }, (_, index) => {
                const stepNumber = index + 1;
                const isCompleted = stepNumber < currentStep;
                const isCurrent = stepNumber === currentStep;

                return (
                    <div
                        key={stepNumber}
                        className="flex items-center gap-2"
                    >
                        {/* Step Indicator */}
                        <motion.div
                            initial={false}
                            animate={{
                                scale: isCurrent ? 1.1 : 1,
                                backgroundColor: isCompleted
                                    ? 'var(--action-primary)'
                                    : isCurrent
                                        ? 'var(--action-primary)'
                                        : 'var(--sys-bg-alt)',
                            }}
                            transition={{
                                type: 'spring',
                                stiffness: 300,
                                damping: 25,
                            }}
                            className={`
                                w-8 h-8 rounded-full flex items-center justify-center
                                text-footnote font-medium
                                transition-shadow duration-200
                                ${isCurrent ? 'ring-4 ring-action-primary/20' : ''}
                            `}
                        >
                            {isCompleted ? (
                                <Check className="w-4 h-4 text-white" />
                            ) : (
                                <span className={isCurrent ? 'text-white' : 'text-sys-text-tertiary'}>
                                    {stepNumber}
                                </span>
                            )}
                        </motion.div>

                        {/* Label (optional) */}
                        {labels && labels[index] && (
                            <span
                                className={`
                                    text-footnote hidden sm:inline
                                    ${isCurrent
                                        ? 'text-sys-text-primary font-medium'
                                        : isCompleted
                                            ? 'text-action-primary'
                                            : 'text-sys-text-tertiary'
                                    }
                                `}
                            >
                                {labels[index]}
                            </span>
                        )}

                        {/* Connector Line */}
                        {index < totalSteps - 1 && (
                            <div className="w-8 h-0.5 mx-1">
                                <motion.div
                                    initial={false}
                                    animate={{
                                        scaleX: isCompleted ? 1 : 0,
                                        backgroundColor: 'var(--action-primary)',
                                    }}
                                    transition={{
                                        type: 'spring',
                                        stiffness: 250,
                                        damping: 25,
                                    }}
                                    className="h-full origin-left"
                                    style={{
                                        backgroundColor: isCompleted
                                            ? 'var(--action-primary)'
                                            : 'var(--sys-separator)',
                                    }}
                                />
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
