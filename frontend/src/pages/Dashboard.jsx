import React, { useState, useEffect } from 'react';
import { Layout } from '../components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import {
    Plus, ArrowUpRight, ArrowDownLeft, Wallet,
    History, TrendingUp, ChevronRight, DollarSign, CheckCircle
} from 'lucide-react';
import api from '../api/axios';
import { motion } from 'framer-motion';
import { cn } from '../utils/cn';

const Dashboard = () => {
    // balances = BalanceDetail[]: { from_user, to_user, amount }
    // "from_user owes to_user the amount"
    const [balances, setBalances] = useState([]);
    const [settlements, setSettlements] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const currentUserId = currentUser.id || currentUser._id || '';

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [balRes, setRes, usersRes] = await Promise.all([
                    api.get('/users/balances'),
                    api.get('/users/settlements'),
                    api.get('/users'),
                ]);
                setBalances(Array.isArray(balRes.data) ? balRes.data : []);
                setSettlements(Array.isArray(setRes.data) ? setRes.data : []);
                setAllUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
            } catch (err) {
                console.error('Failed to fetch dashboard data', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Build id -> name lookup
    const userMap = allUsers.reduce((acc, u) => {
        acc[u.id] = u.name || u.email || 'User';
        return acc;
    }, {});

    // Where current user is debtor (owes money)
    const iOwe = balances.filter(b => b.from_user === currentUserId);
    // Where current user is creditor (owed money)
    const owedToMe = balances.filter(b => b.to_user === currentUserId);

    const totalOwe = iOwe.reduce((sum, b) => sum + b.amount, 0);
    const totalOwed = owedToMe.reduce((sum, b) => sum + b.amount, 0);
    const netBalance = totalOwed - totalOwe;

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    if (loading) return (
        <Layout>
            <div className="flex-center min-h-[60vh]">
                <div className="relative w-16 h-16">
                    <div className="absolute inset-0 border-4 border-emerald-500/20 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-emerald-500 rounded-full border-t-transparent animate-spin"></div>
                </div>
            </div>
        </Layout>
    );

    return (
        <Layout>
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-10 pb-20"
            >
                {/* ── Hero — Net Balance ── */}
                <motion.section
                    variants={itemVariants}
                    className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 p-8 lg:p-12 text-white shadow-2xl"
                >
                    <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-[100px]" />
                    <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px]" />

                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                        <div>
                            <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-400 mb-2">
                                {currentUser.name ? `Hey, ${currentUser.name} 👋` : 'Total Net Balance'}
                            </p>
                            <h1 className={cn(
                                "text-5xl lg:text-7xl font-black tracking-tighter mb-4",
                                netBalance >= 0 ? "text-emerald-400" : "text-rose-400"
                            )}>
                                {netBalance >= 0 ? '+' : '-'}${Math.abs(netBalance).toFixed(2)}
                            </h1>
                            <p className="text-slate-400 font-medium">
                                {netBalance > 0
                                    ? `${owedToMe.length} ${owedToMe.length === 1 ? 'person owes' : 'people owe'} you money`
                                    : netBalance < 0
                                        ? `You owe money to ${iOwe.length} ${iOwe.length === 1 ? 'person' : 'people'}`
                                        : "You're all settled up! 🎉"}
                            </p>
                            <div className="flex items-center mt-4">
                                <div className="flex items-center bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10">
                                    <TrendingUp className="w-4 h-4 text-emerald-400 mr-2" />
                                    <span className="text-sm font-bold">Net Financial Standing</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button
                                className="rounded-2xl group"
                                variant="primary"
                                size="lg"
                                onClick={() => window.location.href = '/groups'}
                            >
                                <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform" />
                                New Group
                            </Button>
                        </div>
                    </div>
                </motion.section>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <motion.div variants={itemVariants}>
                        <Card className="bg-emerald-500/5 border-emerald-500/10 group hover:border-emerald-500/30 transition-all">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-bold uppercase tracking-widest text-emerald-600">You are owed</CardTitle>
                                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex-center group-hover:scale-110 transition-transform">
                                    <ArrowUpRight className="w-5 h-5 text-emerald-600" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-4xl font-black text-emerald-700 tracking-tight">${totalOwed.toFixed(2)}</div>
                                <p className="text-xs font-bold text-emerald-600/60 mt-2 uppercase tracking-wide">
                                    From {owedToMe.length} {owedToMe.length === 1 ? 'person' : 'people'}
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div variants={itemVariants}>
                        <Card className="bg-rose-500/5 border-rose-500/10 group hover:border-rose-500/30 transition-all">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-bold uppercase tracking-widest text-rose-600">You owe</CardTitle>
                                <div className="w-10 h-10 rounded-xl bg-rose-100 flex-center group-hover:scale-110 transition-transform">
                                    <ArrowDownLeft className="w-5 h-5 text-rose-600" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-4xl font-black text-rose-700 tracking-tight">${totalOwe.toFixed(2)}</div>
                                <p className="text-xs font-bold text-rose-600/60 mt-2 uppercase tracking-wide">
                                    To {iOwe.length} {iOwe.length === 1 ? 'person' : 'people'}
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Individual Balances */}
                    <motion.div variants={itemVariants} className="lg:col-span-2">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 rounded-2xl bg-white shadow-sm flex-center border border-slate-100">
                                    <Wallet className="w-5 h-5 text-slate-600" />
                                </div>
                                <h2 className="text-2xl font-black tracking-tight text-slate-800">Your Balances</h2>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {/* People who owe ME */}
                            {owedToMe.length > 0 && (
                                <>
                                    <p className="text-xs font-black uppercase tracking-widest text-slate-400 px-1 mb-2">owed to you</p>
                                    {owedToMe.map((b, idx) => (
                                        <BalanceRow key={`owed-${idx}`} name={userMap[b.from_user] || b.from_user?.slice(0,8) || 'Unknown'} amount={b.amount} positive />
                                    ))}
                                </>
                            )}
                            {/* People I owe */}
                            {iOwe.length > 0 && (
                                <>
                                    <p className="text-xs font-black uppercase tracking-widest text-slate-400 px-1 mb-2 mt-4">you owe</p>
                                    {iOwe.map((b, idx) => (
                                        <BalanceRow key={`owe-${idx}`} name={userMap[b.to_user] || b.to_user?.slice(0,8) || 'Unknown'} amount={b.amount} positive={false} />
                                    ))}
                                </>
                            )}
                            {owedToMe.length === 0 && iOwe.length === 0 && (
                                <Card className="py-12 border-dashed flex-center flex-col text-slate-400" animate={false}>
                                    <CheckCircle className="w-12 h-12 mb-4 text-emerald-300" />
                                    <p className="font-bold text-emerald-600">All settled up!</p>
                                    <p className="text-xs font-medium text-slate-400 mt-1">No outstanding balances</p>
                                </Card>
                            )}
                        </div>
                    </motion.div>

                    {/* Recent Settlements */}
                    <motion.div variants={itemVariants}>
                        <div className="flex items-center space-x-3 mb-6">
                            <div className="w-10 h-10 rounded-2xl bg-white shadow-sm flex-center border border-slate-100">
                                <History className="w-5 h-5 text-slate-600" />
                            </div>
                            <h2 className="text-2xl font-black tracking-tight text-slate-800">Activity</h2>
                        </div>

                        <div className="space-y-4">
                            {settlements.length === 0 ? (
                                <Card className="py-12 border-dashed flex-center flex-col text-slate-400" animate={false}>
                                    <DollarSign className="w-8 h-8 mb-3 opacity-20" />
                                    <p className="font-bold text-sm">No recent activity</p>
                                </Card>
                            ) : (
                                settlements.slice(0, 8).map((s, idx) => (
                                    <div key={s.id || idx} className="bg-white/40 border border-slate-100 p-4 rounded-2xl relative overflow-hidden group hover:bg-white transition-all">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500/20 group-hover:bg-emerald-500 transition-colors rounded-l-2xl" />
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                                {userMap[s.paid_by] || 'Someone'} → {userMap[s.paid_to] || 'Someone'}
                                            </span>
                                            <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg ml-2 shrink-0">SETTLED</span>
                                        </div>
                                        <div className="mt-2 text-lg font-black text-slate-900">${s.amount.toFixed(2)}</div>
                                        <p className="text-[10px] text-slate-400 mt-1 font-medium">
                                            {new Date(s.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </Layout>
    );
};

/* ── Balance Row Sub-Component ── */
const BalanceRow = ({ name, amount, positive }) => (
    <motion.div
        whileHover={{ x: 6 }}
        className="group flex items-center justify-between bg-white/60 hover:bg-white p-4 rounded-2xl border border-slate-100 shadow-sm transition-all cursor-default"
    >
        <div className="flex items-center space-x-4">
            <div className={cn(
                "w-12 h-12 rounded-xl flex-center font-black text-lg",
                positive ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
            )}>
                {name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
                <h3 className="font-extrabold text-slate-800">{name}</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    {positive ? 'Owes you' : 'You owe'}
                </p>
            </div>
        </div>
        <div className="flex items-center space-x-3">
            <span className={cn(
                "text-xl font-black tabular-nums",
                positive ? "text-emerald-600" : "text-rose-600"
            )}>
                ${amount.toFixed(2)}
            </span>
            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-500 transition-colors" />
        </div>
    </motion.div>
);

export default Dashboard;
