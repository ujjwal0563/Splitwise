import React from 'react';
import { cn } from '../../utils/cn';

export const Input = React.forwardRef(({ className, type, label, error, ...props }, ref) => {
    return (
        <div className="space-y-2 w-full">
            {label && (
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">
                    {label}
                </label>
            )}
            <div className="relative group">
                <input
                    type={type}
                    className={cn(
                        'flex h-12 w-full rounded-2xl border-2 border-slate-200/50 bg-white/50 px-5 py-3 text-sm font-medium transition-all duration-300',
                        'placeholder:text-slate-400',
                        'focus:bg-white focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none',
                        'hover:border-slate-300',
                        'disabled:cursor-not-allowed disabled:opacity-50',
                        error && 'border-rose-500/50 focus:border-rose-500 focus:ring-rose-500/10',
                        className
                    )}
                    ref={ref}
                    {...props}
                />
            </div>
            {error && (
                <p className="text-xs font-semibold text-rose-500 ml-1 transition-all animate-in fade-in slide-in-from-top-1">
                    {error}
                </p>
            )}
        </div>
    );
});

Input.displayName = 'Input';
