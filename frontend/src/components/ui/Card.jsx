import React from 'react';
import { cn } from '../../utils/cn';
import { motion } from 'framer-motion';

export const Card = ({ className, children, animate = true, ...props }) => {
    const Component = animate ? motion.div : 'div';
    const animationProps = animate ? {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5, ease: "easeOut" }
    } : {};

    return (
        <Component
            className={cn("premium-card overflow-hidden", className)}
            {...animationProps}
            {...props}
        >
            {children}
        </Component>
    );
};

export const CardHeader = ({ className, children, ...props }) => {
    return (
        <div className={cn("p-8 pb-4", className)} {...props}>
            {children}
        </div>
    );
};

export const CardTitle = ({ className, children, ...props }) => {
    return (
        <h3 className={cn("text-2xl font-extrabold leading-tight tracking-tight text-slate-900", className)} {...props}>
            {children}
        </h3>
    );
};

export const CardContent = ({ className, children, ...props }) => {
    return (
        <div className={cn("p-8 pt-0", className)} {...props}>
            {children}
        </div>
    );
};
