/**
 * WizardStep Component
 * ウィザードの各ステップのラッパー - アニメーション遷移を管理
 */

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface WizardStepProps {
    children: ReactNode;
    direction: number; // 1: 進む, -1: 戻る
}

const stepVariants = {
    enter: (direction: number) => ({
        x: direction > 0 ? 200 : -200,
        opacity: 0,
    }),
    center: {
        x: 0,
        opacity: 1,
    },
    exit: (direction: number) => ({
        x: direction < 0 ? 200 : -200,
        opacity: 0,
    }),
};

// Spring transition from DESIGN_RULE.md
const stepTransition = {
    type: 'spring' as const,
    stiffness: 250,
    damping: 25,
};

export function WizardStep({ children, direction }: WizardStepProps) {
    return (
        <motion.div
            custom={direction}
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={stepTransition}
            className="w-full"
        >
            {children}
        </motion.div>
    );
}
