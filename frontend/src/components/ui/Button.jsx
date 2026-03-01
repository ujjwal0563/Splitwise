import React from 'react';
import { cn } from '../../utils/cn';
import { motion } from 'framer-motion';

export const Button = ({
    className,
    variant = 'primary',
    size = 'md',
    isLoading,
    disabled,
    children,
    ...props
}) => {
    const variants = {
        primary: 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-[0_4px_15px_rgba(16,185,129,0.3)] hover:shadow-[0_8px_25px_rgba(16,185,129,0.4)]',
        secondary: 'bg-white/80 backdrop-blur-md text-slate-700 border border-slate-200/50 hover:bg-white hover:border-slate-300 shadow-sm',
        outline: 'bg-transparent border-2 border-emerald-500/50 text-emerald-600 hover:bg-emerald-50/50',
        ghost: 'bg-transparent text-slate-600 hover:bg-slate-100/50',
        danger: 'bg-gradient-to-br from-rose-500 to-rose-600 text-white shadow-[0_4px_15px_rgba(244,63,94,0.3)] hover:shadow-[0_8px_25px_rgba(244,63,94,0.4)]',
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-xs font-semibold',
        md: 'px-6 py-2.5 text-sm font-bold tracking-wide',
        lg: 'px-8 py-3.5 text-base font-extrabold tracking-wider',
        icon: 'p-2',
        default: 'px-6 py-2.5 text-sm font-bold tracking-wide',
    };

    const currentSize = sizes[size] || sizes.md;

    return (
        <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
            className={cn(
                'inline-flex items-center justify-center rounded-xl transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 disabled:pointer-events-none disabled:opacity-50 cursor-pointer',
                variants[variant],
                currentSize,
                className
            )}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading ? (
                <div className="flex items-center space-x-2">
                    <svg className="animate-spin h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Processing...</span>
                </div>
            ) : children}
        </motion.button>
    );
};
