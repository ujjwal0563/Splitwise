import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import {
    CreditCard, ArrowRight, Users, Receipt, TrendingUp, Shield,
    Zap, Globe, CheckCircle, Star, ChevronRight, Wallet,
    BarChart3, Send, Bell, Lock, Sparkles, Play, Menu, X
} from 'lucide-react';

/* ────────────────────── Animation Helpers ─────────────────────── */
const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: (delay = 0) => ({
        opacity: 1, y: 0,
        transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1], delay }
    })
};

const stagger = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } }
};

const AnimatedNumber = ({ target, prefix = '', suffix = '' }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (!isInView) return;
        let start = 0;
        const duration = 2000;
        const step = target / (duration / 16);
        const timer = setInterval(() => {
            start += step;
            if (start >= target) { setCount(target); clearInterval(timer); }
            else setCount(Math.floor(start));
        }, 16);
        return () => clearInterval(timer);
    }, [isInView, target]);

    return <span ref={ref}>{prefix}{count.toLocaleString()}{suffix}</span>;
};

/* ────────────────────── Feature Cards ─────────────────────── */
const features = [
    { icon: Users, title: 'Smart Group Splits', desc: 'Create groups for trips, roommates, or dinners. Manage shared costs with any number of friends effortlessly.', color: 'emerald', gradient: 'from-emerald-500 to-teal-500' },
    { icon: BarChart3, title: 'Real-time Balances', desc: 'Instantly see who owes what. Our algorithm minimizes transactions to simplify settlements across the group.', color: 'blue', gradient: 'from-blue-500 to-indigo-500' },
    { icon: Receipt, title: 'Flexible Expense Splits', desc: 'Split equally or assign custom amounts per person. Full control over every expense you add to a group.', color: 'violet', gradient: 'from-violet-500 to-purple-500' },
    { icon: Send, title: 'One-Click Settlement', desc: 'Record payments instantly. Mark debts as settled and keep your financial records crystal clear.', color: 'orange', gradient: 'from-orange-500 to-amber-500' },
    { icon: Shield, title: 'Secure & Private', desc: 'JWT-authenticated sessions ensure only you and your group members can see your shared expenses.', color: 'rose', gradient: 'from-rose-500 to-pink-500' },
    { icon: Zap, title: 'Lightning Fast', desc: 'Built with Go on the backend and React on the frontend. Sub-100ms API responses for a seamless experience.', color: 'yellow', gradient: 'from-yellow-500 to-amber-400' },
];

const colorMap = {
    emerald: { bg: 'bg-emerald-50', ring: 'ring-emerald-100', text: 'text-emerald-600' },
    blue: { bg: 'bg-blue-50', ring: 'ring-blue-100', text: 'text-blue-600' },
    violet: { bg: 'bg-violet-50', ring: 'ring-violet-100', text: 'text-violet-600' },
    orange: { bg: 'bg-orange-50', ring: 'ring-orange-100', text: 'text-orange-600' },
    rose: { bg: 'bg-rose-50', ring: 'ring-rose-100', text: 'text-rose-600' },
    yellow: { bg: 'bg-yellow-50', ring: 'ring-yellow-100', text: 'text-yellow-600' },
};

/* ────────────────────── How It Works Steps ─────────────────────── */
const steps = [
    { num: '01', title: 'Create an Account', desc: 'Sign up in seconds. No credit card required. Just your name and email.' },
    { num: '02', title: 'Build Your Group', desc: 'Create a group for any occasion—trips, housing, dining—and invite friends.' },
    { num: '03', title: 'Add Expenses & Settle', desc: 'Log shared costs as they happen. Settle up with a tap when you\'re done.' },
];

/* ────────────────────── Testimonials ─────────────────────── */
const testimonials = [
    { name: 'Priya Sharma', role: 'Software Engineer', avatar: 'P', text: 'Finally an expense app that doesn\'t feel like doing taxes. The UI is gorgeous and everything just works.' },
    { name: 'Alex Kim', role: 'Product Designer', avatar: 'A', text: 'Used this for our 10-person Goa trip. Zero arguments about money. The balance minimization is 🔥' },
    { name: 'Rohan Mehta', role: 'Startup Founder', avatar: 'R', text: 'We use SplitWise for our team off-sites. The group management and settlement tracking is spot on.' },
];

/* ─────────────────────────── Component ─────────────────────────── */
export default function Landing() {
    const [menuOpen, setMenuOpen] = useState(false);
    const { scrollY } = useScroll();
    const heroOpacity = useTransform(scrollY, [0, 500], [1, 0]);
    const heroScale = useTransform(scrollY, [0, 500], [1, 0.96]);

    return (
        <div className="overflow-x-hidden bg-[#fafafa]">

            {/* ── Navbar ── */}
            <motion.header
                initial={{ y: -80, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="fixed top-0 inset-x-0 z-50 flex justify-center px-4 pt-4"
            >
                <nav className="w-full max-w-6xl bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-2xl px-6 py-3 flex items-center justify-between shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
                    <Link to="/" className="flex items-center space-x-2.5 group">
                        <div className="w-9 h-9 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                            <CreditCard className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-lg font-black tracking-tight text-slate-900">Split<span className="text-emerald-500">Wise</span></span>
                    </Link>

                    <div className="hidden md:flex items-center space-x-8">
                        {['Features', 'How it Works', 'Pricing'].map(item => (
                            <a key={item} href={`#${item.toLowerCase().replace(' ', '-')}`} className="text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors">{item}</a>
                        ))}
                    </div>

                    <div className="hidden md:flex items-center space-x-3">
                        <Link to="/login" className="text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors px-4 py-2 rounded-xl hover:bg-slate-100">
                            Sign In
                        </Link>
                        <Link to="/register" className="text-sm font-bold text-white bg-gradient-to-r from-emerald-500 to-emerald-600 px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-0.5 transition-all">
                            Get Started Free
                        </Link>
                    </div>

                    <button className="md:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100" onClick={() => setMenuOpen(!menuOpen)}>
                        {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </nav>

                {menuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute top-20 left-4 right-4 bg-white border border-slate-200/60 rounded-2xl shadow-xl p-6 flex flex-col space-y-4"
                    >
                        {['Features', 'How it Works'].map(item => (
                            <a key={item} href={`#${item.toLowerCase().replace(' ', '-')}`} className="text-sm font-semibold text-slate-600" onClick={() => setMenuOpen(false)}>{item}</a>
                        ))}
                        <div className="pt-4 border-t border-slate-100 flex flex-col space-y-3">
                            <Link to="/login" className="text-center text-sm font-bold text-slate-700 py-3 rounded-xl border border-slate-200">Sign In</Link>
                            <Link to="/register" className="text-center text-sm font-bold text-white bg-emerald-500 py-3 rounded-xl">Get Started Free</Link>
                        </div>
                    </motion.div>
                )}
            </motion.header>

            {/* ── Hero ── */}
            <section className="relative min-h-screen flex flex-col items-center justify-center pt-20 px-4 overflow-hidden">
                {/* Mesh Gradient Background */}
                <div className="absolute inset-0 -z-10">
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-emerald-50/30" />
                    <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[700px] bg-emerald-400/10 rounded-full blur-[120px]" />
                    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-400/10 rounded-full blur-[100px]" />
                    <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-violet-400/10 rounded-full blur-[100px]" />
                    {/* Grid Pattern */}
                    <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle, #10b981 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
                </div>

                <motion.div style={{ opacity: heroOpacity, scale: heroScale }} className="max-w-5xl mx-auto text-center space-y-8">
                    <motion.div
                        variants={fadeUp}
                        initial="hidden"
                        animate="visible"
                        custom={0}
                        className="inline-flex items-center space-x-2 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full"
                    >
                        <Sparkles className="w-3 h-3" />
                        <span>The smarter way to split expenses</span>
                    </motion.div>

                    <motion.h1
                        variants={fadeUp}
                        initial="hidden"
                        animate="visible"
                        custom={0.1}
                        className="text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter text-slate-900 leading-[0.95]"
                    >
                        Split bills.{' '}
                        <span className="relative inline-block">
                            <span className="relative z-10 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 bg-clip-text text-transparent">
                                Not friendships.
                            </span>
                            <span className="absolute bottom-2 left-0 right-0 h-4 bg-emerald-200/30 blur-sm -z-0" />
                        </span>
                    </motion.h1>

                    <motion.p
                        variants={fadeUp}
                        initial="hidden"
                        animate="visible"
                        custom={0.2}
                        className="text-xl md:text-2xl text-slate-500 font-medium leading-relaxed max-w-2xl mx-auto"
                    >
                        The premium expense-sharing platform for friend groups, roommates, and travelers. Add expenses, track balances, and settle up — all in one elegant interface.
                    </motion.p>

                    <motion.div
                        variants={fadeUp}
                        initial="hidden"
                        animate="visible"
                        custom={0.3}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
                    >
                        <Link
                            to="/register"
                            className="group flex items-center space-x-2 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white font-extrabold text-base px-8 py-4 rounded-2xl shadow-[0_20px_60px_rgba(16,185,129,0.35)] hover:shadow-[0_25px_70px_rgba(16,185,129,0.5)] hover:-translate-y-1 transition-all"
                        >
                            <span>Start for Free</span>
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link
                            to="/login"
                            className="flex items-center space-x-2 bg-white/90 backdrop-blur-md text-slate-700 font-bold text-base px-8 py-4 rounded-2xl border border-slate-200 shadow-sm hover:bg-white hover:shadow-md hover:-translate-y-0.5 transition-all"
                        >
                            <span>Sign In</span>
                        </Link>
                    </motion.div>

                    <motion.p
                        variants={fadeUp}
                        initial="hidden"
                        animate="visible"
                        custom={0.4}
                        className="text-xs text-slate-400 font-semibold"
                    >
                        No credit card required · Free forever
                    </motion.p>
                </motion.div>

                {/* Hero Product Preview */}
                <motion.div
                    initial={{ opacity: 0, y: 80, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="mt-20 w-full max-w-5xl mx-auto px-4 relative"
                >
                    <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-blue-500/20 rounded-[3rem] blur-2xl" />
                    <div className="relative bg-white/90 backdrop-blur-xl rounded-[2rem] border border-slate-200/60 shadow-[0_50px_100px_rgba(0,0,0,0.12)] overflow-hidden">
                        {/* Mock App Bar */}
                        <div className="flex items-center px-6 py-4 border-b border-slate-100 bg-slate-50/80">
                            <div className="flex space-x-2">
                                <div className="w-3 h-3 rounded-full bg-rose-400" />
                                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                                <div className="w-3 h-3 rounded-full bg-emerald-400" />
                            </div>
                            <div className="mx-auto flex items-center space-x-2 bg-white rounded-xl px-4 py-1.5 border border-slate-200 text-xs text-slate-400 font-medium w-64 justify-center">
                                <Lock className="w-3 h-3" />
                                <span>splitwise.app/dashboard</span>
                            </div>
                        </div>

                        {/* Mock Dashboard UI */}
                        <div className="p-6 md:p-10 bg-gradient-to-br from-slate-50 to-white">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                {/* Net Balance Card */}
                                <div className="md:col-span-2 bg-slate-900 rounded-2xl p-6 text-white relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl translate-x-10 -translate-y-10" />
                                    <p className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-2">Net Balance</p>
                                    <p className="text-4xl font-black">+$247.50</p>
                                    <div className="mt-4 inline-flex items-center text-xs font-bold bg-white/10 px-3 py-1.5 rounded-xl">
                                        <TrendingUp className="w-3 h-3 mr-1.5 text-emerald-400" />
                                        3 people owe you
                                    </div>
                                </div>

                                {/* Quick Stats */}
                                <div className="space-y-3">
                                    <div className="bg-emerald-50 border border-emerald-100/80 rounded-2xl p-4">
                                        <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1">You're owed</p>
                                        <p className="text-2xl font-black text-emerald-700">$312.00</p>
                                    </div>
                                    <div className="bg-rose-50 border border-rose-100/80 rounded-2xl p-4">
                                        <p className="text-xs font-bold text-rose-600 uppercase tracking-widest mb-1">You owe</p>
                                        <p className="text-2xl font-black text-rose-700">$64.50</p>
                                    </div>
                                </div>
                            </div>

                            {/* Expense List Preview */}
                            <div className="space-y-3">
                                {[
                                    { name: 'Goa Trip — Hotels', amount: '₹8,500', person: 'Priya paid', bg: 'bg-emerald-50', icon: 'text-emerald-500' },
                                    { name: 'Weekend Groceries', amount: '$42.30', person: 'You paid', bg: 'bg-blue-50', icon: 'text-blue-500' },
                                    { name: 'Movie Night', amount: '$28.00', person: 'Alex paid', bg: 'bg-violet-50', icon: 'text-violet-500' },
                                ].map((exp, i) => (
                                    <div key={i} className="flex items-center justify-between bg-white rounded-xl px-5 py-4 border border-slate-100 shadow-sm">
                                        <div className="flex items-center space-x-4">
                                            <div className={`w-10 h-10 rounded-xl ${exp.bg} flex items-center justify-center`}>
                                                <Receipt className={`w-5 h-5 ${exp.icon}`} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-800">{exp.name}</p>
                                                <p className="text-xs text-slate-400 font-medium">{exp.person}</p>
                                            </div>
                                        </div>
                                        <p className="text-sm font-black text-slate-900">{exp.amount}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Scroll Cue */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5 }}
                    className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center space-y-2"
                >
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Scroll to explore</span>
                    <div className="w-px h-12 bg-gradient-to-b from-slate-300 to-transparent" />
                </motion.div>
            </section>

            {/* ── Social Proof Bar ── */}
            <section className="py-12 border-y border-slate-100 bg-white/60 backdrop-blur-sm">
                <div className="max-w-5xl mx-auto px-4">
                    <motion.div
                        variants={stagger}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
                    >
                        {[
                            { value: 12500, suffix: '+', label: 'Active Users' },
                            { value: 48000, suffix: '+', label: 'Expenses Logged' },
                            { value: 3200, suffix: '+', label: 'Groups Created' },
                            { value: 99, suffix: '.9%', label: 'Uptime' },
                        ].map((stat, i) => (
                            <motion.div key={i} variants={fadeUp} custom={i * 0.05} className="space-y-1">
                                <p className="text-3xl md:text-4xl font-black text-slate-900">
                                    <AnimatedNumber target={stat.value} suffix={stat.suffix} />
                                </p>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* ── Features ── */}
            <section id="features" className="py-28 px-4">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        variants={stagger}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: '-100px' }}
                        className="text-center space-y-4 mb-20"
                    >
                        <motion.div variants={fadeUp} className="inline-flex items-center space-x-2 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full">
                            <Sparkles className="w-3 h-3" />
                            <span>Everything you need</span>
                        </motion.div>
                        <motion.h2 variants={fadeUp} className="text-5xl md:text-6xl font-black tracking-tighter text-slate-900">
                            Built for real-world <br />
                            <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">expense sharing</span>
                        </motion.h2>
                        <motion.p variants={fadeUp} className="text-lg text-slate-500 max-w-xl mx-auto">
                            Every feature designed to remove friction from shared finances.
                        </motion.p>
                    </motion.div>

                    <motion.div
                        variants={stagger}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: '-50px' }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {features.map((feature, i) => {
                            const { bg, ring, text } = colorMap[feature.color];
                            return (
                                <motion.div
                                    key={feature.title}
                                    variants={fadeUp}
                                    custom={i * 0.05}
                                    whileHover={{ y: -8, transition: { duration: 0.3 } }}
                                    className="group relative bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-slate-200/60 transition-all"
                                >
                                    <div className={`w-14 h-14 ${bg} ring-8 ${ring} rounded-2xl flex items-center justify-center mb-6`}>
                                        <feature.icon className={`w-7 h-7 ${text}`} />
                                    </div>
                                    <h3 className="text-xl font-black text-slate-900 mb-3">{feature.title}</h3>
                                    <p className="text-sm text-slate-500 leading-relaxed">{feature.desc}</p>
                                    <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-[0.04] transition-opacity pointer-events-none`} />
                                </motion.div>
                            );
                        })}
                    </motion.div>
                </div>
            </section>

            {/* ── How It Works ── */}
            <section id="how-it-works" className="py-28 px-4 bg-slate-900 text-white relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px]" />
                    <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px]" />
                    <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
                </div>

                <div className="relative max-w-5xl mx-auto">
                    <motion.div
                        variants={stagger}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="text-center space-y-4 mb-20"
                    >
                        <motion.div variants={fadeUp} className="inline-flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full">
                            <span>Simple by design</span>
                        </motion.div>
                        <motion.h2 variants={fadeUp} className="text-5xl md:text-6xl font-black tracking-tighter">
                            Up and running in <br />
                            <span className="text-emerald-400">three steps</span>
                        </motion.h2>
                    </motion.div>

                    <div className="relative">
                        {/* Connecting line */}
                        <div className="hidden md:block absolute top-16 left-[16.67%] right-[16.67%] h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />

                        <motion.div
                            variants={stagger}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            className="grid grid-cols-1 md:grid-cols-3 gap-10"
                        >
                            {steps.map((step, i) => (
                                <motion.div key={step.num} variants={fadeUp} custom={i * 0.1} className="text-center space-y-4 relative">
                                    <div className="inline-flex w-14 h-14 rounded-full bg-emerald-500 items-center justify-center text-xl font-black text-white shadow-[0_0_30px_rgba(16,185,129,0.5)] mx-auto relative z-10">
                                        {i + 1}
                                    </div>
                                    <h3 className="text-xl font-black tracking-tight">{step.title}</h3>
                                    <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ── Testimonials ── */}
            <section className="py-28 px-4">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        variants={stagger}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="text-center space-y-4 mb-16"
                    >
                        <motion.h2 variants={fadeUp} className="text-5xl font-black tracking-tighter text-slate-900">
                            Loved by thousands
                        </motion.h2>
                        <motion.p variants={fadeUp} className="text-slate-500 text-lg">
                            Don't just take our word for it.
                        </motion.p>
                    </motion.div>

                    <motion.div
                        variants={stagger}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-6"
                    >
                        {testimonials.map((t, i) => (
                            <motion.div
                                key={t.name}
                                variants={fadeUp}
                                custom={i * 0.1}
                                whileHover={{ y: -6 }}
                                className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/60 transition-all"
                            >
                                <div className="flex space-x-1 mb-6">
                                    {[...Array(5)].map((_, j) => (
                                        <Star key={j} className="w-4 h-4 text-amber-400 fill-current" />
                                    ))}
                                </div>
                                <p className="text-slate-700 text-sm leading-relaxed mb-6">"{t.text}"</p>
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-black text-sm">
                                        {t.avatar}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900">{t.name}</p>
                                        <p className="text-xs text-slate-400">{t.role}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* ── Pricing ── */}
            <section id="pricing" className="py-16 px-4">
                <div className="max-w-3xl mx-auto">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={stagger}
                        className="text-center space-y-4 mb-12"
                    >
                        <motion.div variants={fadeUp} className="inline-flex items-center space-x-2 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full">
                            <span>Completely Free</span>
                        </motion.div>
                        <motion.h2 variants={fadeUp} className="text-5xl font-black tracking-tighter text-slate-900">Simple Pricing</motion.h2>
                        <motion.p variants={fadeUp} className="text-slate-500">SplitWise is free to use — forever.</motion.p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                        className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-10 text-white relative overflow-hidden border border-slate-700"
                    >
                        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl" />
                        <div className="relative">
                            <div className="inline-block bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-full mb-6">Free Forever</div>
                            <div className="text-6xl font-black mb-2">$0<span className="text-2xl text-slate-400 font-medium">/mo</span></div>
                            <p className="text-slate-400 mb-10">Everything you need to split expenses with friends.</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                                {[
                                    'Unlimited groups', 'Unlimited expenses',
                                    'Smart balance calculation', 'One-click settlements',
                                    'Transaction history', 'Member management',
                                    'Custom expense splits', 'Secure JWT auth',
                                ].map(feat => (
                                    <div key={feat} className="flex items-center space-x-3">
                                        <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                                            <CheckCircle className="w-3 h-3 text-emerald-400" />
                                        </div>
                                        <span className="text-sm font-medium text-slate-300">{feat}</span>
                                    </div>
                                ))}
                            </div>
                            <Link
                                to="/register"
                                className="inline-flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-400 text-white font-black text-sm px-8 py-4 rounded-2xl transition-colors shadow-[0_10px_30px_rgba(16,185,129,0.3)]"
                            >
                                <span>Get Started for Free</span>
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ── CTA Banner ── */}
            <section className="py-28 px-4">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className="relative bg-gradient-to-br from-emerald-500 to-teal-600 rounded-[3rem] p-12 md:p-20 text-white text-center overflow-hidden shadow-[0_30px_80px_rgba(16,185,129,0.4)]"
                    >
                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
                        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
                        <div className="absolute bottom-0 left-0 w-60 h-60 bg-teal-600/50 rounded-full blur-3xl" />
                        <div className="relative space-y-6">
                            <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-tight">
                                Stop chasing IOUs.<br />Start using SplitWise.
                            </h2>
                            <p className="text-emerald-100 text-lg max-w-lg mx-auto">
                                Join thousands of people who've made shared finances stress-free. Free forever.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                                <Link
                                    to="/register"
                                    className="inline-flex items-center justify-center space-x-2 bg-white text-emerald-600 font-black text-base px-10 py-4 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.15)] hover:shadow-[0_15px_40px_rgba(0,0,0,0.2)] hover:-translate-y-1 transition-all"
                                >
                                    <span>Create Free Account</span>
                                    <ArrowRight className="w-5 h-5" />
                                </Link>
                                <Link
                                    to="/login"
                                    className="inline-flex items-center justify-center space-x-2 bg-white/20 backdrop-blur-sm border border-white/30 text-white font-bold text-base px-10 py-4 rounded-2xl hover:bg-white/30 transition-all"
                                >
                                    <span>Sign In</span>
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ── Footer ── */}
            <footer className="py-16 px-4 border-t border-slate-100 bg-white">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12">
                        <Link to="/" className="flex items-center space-x-2.5">
                            <div className="w-9 h-9 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                <CreditCard className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-lg font-black tracking-tight text-slate-900">Split<span className="text-emerald-500">Wise</span></span>
                        </Link>
                        <div className="flex items-center space-x-6">
                            {['Features', 'How it Works', 'Privacy', 'Terms'].map(link => (
                                <a key={link} href="#" className="text-sm text-slate-400 hover:text-slate-700 font-medium transition-colors">{link}</a>
                            ))}
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-slate-100 gap-4">
                        <p className="text-sm text-slate-400">© 2026 SplitWise. Built with ❤️ and Go + React.</p>
                        <p className="text-sm text-slate-400">Making shared finances <span className="text-emerald-500 font-semibold">simple</span>.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
