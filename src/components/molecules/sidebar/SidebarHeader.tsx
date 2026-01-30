import { motion } from 'framer-motion';

/**
 * SidebarHeader Component
 * 
 * Displays the application title at the top of the sidebar.
 * Replaces the non-functional TrafficLights component with meaningful content.
 * Follows macOS Sequoia design principles from DESIGN_RULE.md.
 */
export function SidebarHeader() {
    return (
        <motion.div
            className="flex items-center px-5 h-toolbar"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
        >
            <h1 className="text-[17px] font-semibold tracking-tight text-sys-text-primary">
                Knowledge Finder
            </h1>
        </motion.div>
    );
}
