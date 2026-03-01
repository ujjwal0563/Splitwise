import React from 'react';
import { Navbar } from './Navbar';

export const Layout = ({ children }) => {
    return (
        <div className="min-h-screen bg-slate-50 relative">
            <Navbar />
            <main className="relative z-10 p-4 pt-24 sm:p-6 sm:pt-24 lg:p-8 lg:pt-28 max-w-7xl mx-auto w-full">
                {children}
            </main>
        </div>
    );
};
