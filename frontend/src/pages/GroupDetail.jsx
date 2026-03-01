import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import {
    ArrowLeft, Plus, Receipt, UserPlus, Send,
    ChevronRight, Search, CheckCircle2, Trash2, Info, Users, Edit3, Check, X
} from 'lucide-react';
import api from '../api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../utils/cn';

const GroupDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // Core data
    const [group, setGroup] = useState(null);
    const [expenses, setExpenses] = useState([]);
    const [balances, setBalances] = useState([]);   // BalanceDetail[]: {from_user, to_user, amount}
    const [settlements, setSettlements] = useState([]);
    const [allUsers, setAllUsers] = useState([]);    // User[]: {id, name, email}
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Modals
    const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
    const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
    const [isSettleModalOpen, setIsSettleModalOpen] = useState(false);
    // Expense form
    const [expenseData, setExpenseData] = useState({ description: '', amount: '', paid_by: '', split_type: 'equal' });

    // Group rename
    const [isRenaming, setIsRenaming] = useState(false);
    const [renameValue, setRenameValue] = useState('');

    // Settle form
    const [settlePaidBy, setSettlePaidBy] = useState('');
    const [settlePaidTo, setSettlePaidTo] = useState('');
    const [settleAmount, setSettleAmount] = useState('');

    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const currentUserId = currentUser.id || currentUser._id || '';

    useEffect(() => {
        fetchAllUsers();
    }, []);

    useEffect(() => {
        if (id) fetchData();
    }, [id]);

    const fetchAllUsers = async () => {
        try {
            const res = await api.get('/users');
            setAllUsers(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error('Failed to fetch users', err);
        }
    };

    const fetchData = async () => {
        try {
            setLoading(true);
            const [groupRes, expRes, balRes, settleRes] = await Promise.all([
                api.get(`/groups/${id}`),
                api.get(`/groups/${id}/expenses`),
                api.get(`/groups/${id}/balances`),
                api.get(`/groups/${id}/settlements`),
            ]);
            setGroup(groupRes.data);
            setExpenses(Array.isArray(expRes.data) ? expRes.data : []);
            setBalances(Array.isArray(balRes.data) ? balRes.data : []);
            setSettlements(Array.isArray(settleRes.data) ? settleRes.data : []);
        } catch (err) {
            console.error('Failed to fetch data', err);
            if (err.response?.status === 404) navigate('/groups');
        } finally {
            setLoading(false);
        }
    };

    // Build user lookup map: id -> {name, email}
    const userMap = useMemo(() => allUsers.reduce((acc, u) => {
        acc[u.id] = u;
        return acc;
    }, {}), [allUsers]);

    // Get member user objects from allUsers (since group.members = [string])
    const memberObjects = useMemo(() => {
        if (!group?.members || allUsers.length === 0) return [];
        return group.members
            .map(memberId => allUsers.find(u => u.id === memberId))
            .filter(Boolean);
    }, [group, allUsers]);

    const getUserName = (userId) => userMap[userId]?.name || userMap[userId]?.email || userId?.slice(0, 8) || 'Unknown';

    const handleAddExpense = async (e) => {
        e.preventDefault();
        if (!expenseData.paid_by) {
            alert('Please select who paid.');
            return;
        }
        try {
            await api.post(`/groups/${id}/expenses`, {
                description: expenseData.description,
                amount: parseFloat(expenseData.amount),
                paid_by: expenseData.paid_by,
                splits_type: expenseData.split_type,
            });
            setIsExpenseModalOpen(false);
            setExpenseData({ description: '', amount: '', paid_by: '', split_type: 'equal' });
            fetchData();
        } catch (err) {
            console.error('Failed to add expense:', err);
            alert(err.response?.data?.error || 'Failed to add expense');
        }
    };

    const handleDeleteExpense = async (expenseId) => {
        if (!window.confirm('Delete this expense? This will affect balances.')) return;
        try {
            await api.delete(`/expenses/${expenseId}`);
            fetchData();
        } catch (err) {
            console.error('Failed to delete expense:', err);
        }
    };

    const handleAddMember = async (userId) => {
        try {
            await api.post(`/groups/${id}/members`, { user_id: userId });
            fetchData();
        } catch (err) {
            console.error('Failed to add member:', err);
        }
    };

    const handleRemoveMember = async (userId) => {
        if (!window.confirm('Remove this member from the group?')) return;
        try {
            await api.delete(`/groups/${id}/members/${userId}`);
            fetchData();
        } catch (err) {
            console.error('Failed to remove member:', err);
        }
    };

    const handleDeleteGroup = async () => {
        if (!window.confirm('Delete this group permanently? This cannot be undone.')) return;
        try {
            await api.delete(`/groups/${id}`);
            navigate('/groups');
        } catch (err) {
            console.error('Failed to delete group:', err);
        }
    };

    const handleSettleUp = async (e) => {
        e.preventDefault();
        if (!settlePaidBy || !settlePaidTo) {
            alert('Please select both payer and payee.');
            return;
        }
        try {
            await api.post(`/groups/${id}/settle`, {
                paid_by: settlePaidBy,
                paid_to: settlePaidTo,
                amount: parseFloat(settleAmount),
            });
            setIsSettleModalOpen(false);
            setSettlePaidBy('');
            setSettlePaidTo('');
            setSettleAmount('');
            fetchData();
        } catch (err) {
            console.error('Failed to settle:', err);
            alert(err.response?.data?.error || 'Failed to record settlement');
        }
    };

    const handleDeleteSettlement = async (settlementId) => {
        if (!window.confirm('Delete this settlement record?')) return;
        try {
            await api.delete(`/settlements/${settlementId}`);
            fetchData();
        } catch (err) {
            console.error('Failed to delete settlement:', err);
        }
    };

    const handleRenameGroup = async (e) => {
        e.preventDefault();
        if (!renameValue.trim()) return;
        try {
            await api.put(`/groups/${id}`, { name: renameValue.trim() });
            setGroup(prev => ({ ...prev, name: renameValue.trim() }));
            setIsRenaming(false);
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to rename group.');
        }
    };

    // group.members is [string] (array of user IDs), filter out already-members
    const filteredUsers = useMemo(() => {
        if (!searchQuery) return [];
        const memberIds = new Set(group?.members || []);
        return allUsers.filter(u =>
            !memberIds.has(u.id) &&
            (u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                u.email?.toLowerCase().includes(searchQuery.toLowerCase()))
        ).slice(0, 5);
    }, [searchQuery, allUsers, group]);

    if (loading) return (
        <Layout>
            <div className="flex-center min-h-[60vh]">
                <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
            </div>
        </Layout>
    );

    if (!group) return null;

    return (
        <Layout>
            <div className="space-y-10 pb-20">
                {/* Header Section */}
                <div className="flex flex-col space-y-6">
                    <button
                        onClick={() => navigate('/groups')}
                        className="flex items-center text-xs font-black uppercase tracking-widest text-slate-400 hover:text-emerald-500 transition-colors w-fit"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to all groups
                    </button>

                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                        <div className="flex items-center space-x-6">
                            <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-emerald-400 to-emerald-600 flex-center shadow-2xl shadow-emerald-500/20 text-white text-4xl font-black">
                                {group.name?.[0]?.toUpperCase()}
                            </div>
                            <div>
                                    {isRenaming ? (
                                        <form onSubmit={handleRenameGroup} className="flex items-center space-x-2">
                                            <input
                                                autoFocus
                                                className="text-2xl font-black tracking-tight text-slate-800 bg-white border-2 border-emerald-400 rounded-xl px-3 py-1 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                                                value={renameValue}
                                                onChange={e => setRenameValue(e.target.value)}
                                                required
                                            />
                                            <button type="submit" className="p-2 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 transition-all">
                                                <Check className="w-4 h-4" />
                                            </button>
                                            <button type="button" onClick={() => setIsRenaming(false)} className="p-2 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 transition-all">
                                                <X className="w-4 h-4" />
                                            </button>
                                        </form>
                                    ) : (
                                        <div className="flex items-center space-x-2">
                                            <h1 className="text-4xl font-black tracking-tight text-slate-800">{group.name}</h1>
                                            {group.created_by === currentUserId && (
                                                <button
                                                    onClick={() => { setRenameValue(group.name); setIsRenaming(true); }}
                                                    className="p-1.5 rounded-xl text-slate-300 hover:text-emerald-500 hover:bg-emerald-50 transition-all"
                                                >
                                                    <Edit3 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    )}
                                <div className="flex items-center space-x-3 mt-2">
                                    <div className="flex items-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                                        <Users className="w-3 h-3 mr-1" />
                                        {(group.members || []).length} members
                                    </div>
                                    <span className="text-slate-200">·</span>
                                    <span className="text-xs font-bold text-slate-400">
                                        {expenses.length} expenses
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <Button variant="secondary" onClick={() => setIsMemberModalOpen(true)} className="rounded-2xl border-slate-200">
                                <UserPlus className="w-4 h-4 mr-2" />
                                Add Member
                            </Button>
                            <Button variant="secondary" onClick={() => setIsSettleModalOpen(true)} className="rounded-2xl border-emerald-100 text-emerald-600 hover:bg-emerald-50">
                                <Send className="w-4 h-4 mr-2" />
                                Settle Up
                            </Button>
                            <Button onClick={() => setIsExpenseModalOpen(true)} className="rounded-2xl shadow-xl hover:shadow-emerald-500/40">
                                <Plus className="w-4 h-4 mr-2" />
                                Add Expense
                            </Button>
                            <Button variant="danger" onClick={handleDeleteGroup} className="rounded-2xl">
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Left Column: Expenses */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-black tracking-tight text-slate-800">Recent Expenses</h2>
                            <div className="text-xs font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full">
                                {expenses.length} Total
                            </div>
                        </div>

                        <div className="space-y-4">
                            <AnimatePresence mode="popLayout">
                                {expenses.length === 0 ? (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-center flex-col py-20 bg-white/40 rounded-[2.5rem] border-2 border-dashed border-slate-200">
                                        <Receipt className="w-12 h-12 text-slate-200 mb-4" />
                                        <p className="text-slate-400 font-bold">No expenses yet</p>
                                    </motion.div>
                                ) : (
                                    expenses.map((exp, idx) => (
                                        <motion.div
                                            key={exp.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className="group flex items-center justify-between glass-morphism p-6 hover:shadow-xl hover:-translate-y-1"
                                        >
                                            <div className="flex items-center space-x-5">
                                                <div className="w-14 h-14 rounded-2xl bg-slate-50 flex-center group-hover:bg-emerald-50 transition-colors shrink-0">
                                                    <Receipt className="w-6 h-6 text-slate-400 group-hover:text-emerald-500" />
                                                </div>
                                                <div>
                                                    <h4 className="text-lg font-black text-slate-800 group-hover:text-emerald-700 transition-colors">
                                                        {exp.description}
                                                    </h4>
                                                    <div className="flex items-center space-x-2 mt-1">
                                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                                            Paid by {getUserName(exp.paid_by)}
                                                        </span>
                                                        <span className="w-1 h-1 rounded-full bg-slate-200" />
                                                        <span className="text-xs font-bold text-slate-400">
                                                            {new Date(exp.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-3">
                                                <div className="text-2xl font-black text-slate-900 tabular-nums">
                                                    ${exp.amount.toFixed(2)}
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteExpense(exp.id)}
                                                    className="opacity-0 group-hover:opacity-100 p-2 rounded-xl text-rose-300 hover:text-rose-500 hover:bg-rose-50 transition-all"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Right Column: Members & Balances */}
                    <div className="space-y-10">
                        {/* Group Balances */}
                        <div className="space-y-4">
                            <h2 className="text-2xl font-black tracking-tight text-slate-800">Balances</h2>
                            {balances.length === 0 ? (
                                <div className="p-5 bg-emerald-50/50 rounded-2xl border border-emerald-100 flex items-center space-x-3">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                    <p className="text-sm font-bold text-emerald-700">All settled up!</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {balances.map((bal, idx) => (
                                        <div key={idx} className="p-4 bg-white/70 rounded-2xl border border-slate-100 shadow-sm">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                                                    {getUserName(bal.from_user)}
                                                </span>
                                                <span className="text-[10px] text-slate-300 font-bold">owes</span>
                                                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                                                    {getUserName(bal.to_user)}
                                                </span>
                                            </div>
                                            <p className="text-xl font-black text-rose-600 mt-1">${bal.amount.toFixed(2)}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Settlements History */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-black tracking-tight text-slate-800">Settlements</h2>
                                <span className="text-xs font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full">{settlements.length}</span>
                            </div>
                            {settlements.length === 0 ? (
                                <p className="text-sm text-slate-400 font-medium py-2">No settlements yet.</p>
                            ) : (
                                <div className="space-y-2">
                                    {settlements.map((s, idx) => (
                                        <div key={s.id || idx} className="group flex items-center justify-between p-4 bg-white/60 rounded-2xl border border-slate-100 shadow-sm hover:bg-white transition-all">
                                            <div>
                                                <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Settled</p>
                                                <p className="text-sm font-extrabold text-slate-700">
                                                    {getUserName(s.paid_by)} → {getUserName(s.paid_to)}
                                                </p>
                                                <p className="text-[10px] text-slate-400">{new Date(s.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <p className="text-lg font-black text-slate-900">${s.amount.toFixed(2)}</p>
                                                <button
                                                    onClick={() => handleDeleteSettlement(s.id)}
                                                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-rose-300 hover:text-rose-500 hover:bg-rose-50 transition-all"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Members List */}
                        <div className="space-y-4">
                            <h2 className="text-2xl font-black tracking-tight text-slate-800">Members</h2>
                            <div className="grid grid-cols-1 gap-1">
                                {memberObjects.map(m => (
                                    <div key={m.id} className="group flex items-center justify-between p-4 hover:bg-slate-50 rounded-2xl transition-colors">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 flex-center text-sm font-black text-emerald-700">
                                                {m.name?.[0]?.toUpperCase() || '?'}
                                            </div>
                                            <div>
                                                <p className="text-sm font-extrabold text-slate-800">
                                                    {m.name}
                                                    {m.id === group.created_by && (
                                                        <span className="ml-2 text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase">Admin</span>
                                                    )}
                                                </p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{m.email}</p>
                                            </div>
                                        </div>
                                        {m.id !== group.created_by && (
                                            <button
                                                onClick={() => handleRemoveMember(m.id)}
                                                className="opacity-0 group-hover:opacity-100 p-2 text-rose-300 hover:text-rose-500 transition-all rounded-xl hover:bg-rose-50"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Expense Modal */}
            <Modal isOpen={isExpenseModalOpen} onClose={() => setIsExpenseModalOpen(false)} title="Add Expense">
                <form onSubmit={handleAddExpense} className="space-y-5">
                    <Input
                        label="Description"
                        placeholder="What was it for?"
                        required
                        value={expenseData.description}
                        onChange={e => setExpenseData({ ...expenseData, description: e.target.value })}
                    />
                    <Input
                        label="Amount ($)"
                        type="number"
                        step="0.01"
                        min="0.01"
                        placeholder="0.00"
                        required
                        value={expenseData.amount}
                        onChange={e => setExpenseData({ ...expenseData, amount: e.target.value })}
                    />
                    {/* Paid By selector */}
                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-500">Who paid?</label>
                        <div className="grid grid-cols-2 gap-2">
                            {memberObjects.map(m => (
                                <button
                                    key={m.id}
                                    type="button"
                                    onClick={() => setExpenseData({ ...expenseData, paid_by: m.id })}
                                    className={cn(
                                        "flex items-center space-x-2 p-3 rounded-2xl border-2 text-left transition-all",
                                        expenseData.paid_by === m.id
                                            ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                                            : "border-slate-100 hover:border-slate-200 bg-white text-slate-700"
                                    )}
                                >
                                    <div className="w-7 h-7 rounded-lg bg-slate-100 flex-center text-xs font-black shrink-0">
                                        {m.name?.[0]?.toUpperCase()}
                                    </div>
                                    <span className="text-xs font-extrabold truncate">{m.name?.split(' ')[0]}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-start space-x-3">
                        <Info className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                        <p className="text-xs font-bold text-emerald-700 leading-relaxed">
                            Will be split equally among all {(group.members || []).length} members
                        </p>
                    </div>
                    <div className="flex gap-4 pt-2">
                        <Button type="button" variant="secondary" className="flex-1 rounded-2xl" onClick={() => setIsExpenseModalOpen(false)}>Cancel</Button>
                        <Button type="submit" className="flex-1 rounded-2xl">Save Expense</Button>
                    </div>
                </form>
            </Modal>

            {/* Add Member Modal */}
            <Modal isOpen={isMemberModalOpen} onClose={() => setIsMemberModalOpen(false)} title="Add Member">
                <div className="space-y-6">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-200 focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition-all font-bold text-sm"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Results</h4>
                        <div className="space-y-1 min-h-[200px]">
                            {searchQuery.length > 0 && filteredUsers.length === 0 && (
                                <div className="flex-center flex-col py-10 text-slate-300">
                                    <p className="font-bold text-sm">No users found</p>
                                </div>
                            )}
                            {filteredUsers.map(user => (
                                <button
                                    key={user.id}
                                    onClick={() => {
                                        handleAddMember(user.id);
                                        setSearchQuery('');
                                    }}
                                    className="w-full flex items-center justify-between p-4 hover:bg-emerald-50 rounded-2xl transition-all group"
                                >
                                    <div className="flex items-center space-x-3 text-left">
                                        <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-white flex-center text-sm font-black text-slate-500 group-hover:text-emerald-600 transition-colors">
                                            {user.name?.[0]}
                                        </div>
                                        <div>
                                            <p className="text-sm font-extrabold text-slate-800">{user.name}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{user.email}</p>
                                        </div>
                                    </div>
                                    <Plus className="w-5 h-5 text-slate-300 group-hover:text-emerald-500 transition-colors" />
                                </button>
                            ))}
                        </div>
                    </div>

                    <Button variant="secondary" className="w-full rounded-2xl" onClick={() => setIsMemberModalOpen(false)}>Done</Button>
                </div>
            </Modal>

            {/* Settle Up Modal */}
            <Modal isOpen={isSettleModalOpen} onClose={() => setIsSettleModalOpen(false)} title="Settle Up">
                <form onSubmit={handleSettleUp} className="space-y-5">
                    {/* Quick settle suggestions from balances */}
                    {balances.length > 0 && (
                        <div className="space-y-2">
                            <p className="text-xs font-black uppercase tracking-widest text-slate-500">Suggested settlements</p>
                            <div className="space-y-2 max-h-40 overflow-y-auto">
                                {balances.map((bal, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => {
                                            setSettlePaidBy(bal.from_user);
                                            setSettlePaidTo(bal.to_user);
                                            setSettleAmount(bal.amount.toFixed(2));
                                        }}
                                        className={cn(
                                            "w-full flex items-center justify-between p-3 rounded-2xl border-2 transition-all text-left",
                                            settlePaidBy === bal.from_user && settlePaidTo === bal.to_user
                                                ? "border-emerald-500 bg-emerald-50"
                                                : "border-slate-100 hover:border-slate-200 bg-white"
                                        )}
                                    >
                                        <span className="text-xs font-extrabold text-slate-700">
                                            {getUserName(bal.from_user)} → {getUserName(bal.to_user)}
                                        </span>
                                        <span className="text-xs font-black text-rose-600">${bal.amount.toFixed(2)}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Manual payer/payee */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <p className="text-xs font-black uppercase tracking-widest text-slate-500">Paid by</p>
                            <select
                                className="w-full p-3 rounded-2xl border-2 border-slate-200 focus:border-emerald-500 focus:outline-none text-sm font-bold text-slate-700 bg-white"
                                value={settlePaidBy}
                                onChange={e => setSettlePaidBy(e.target.value)}
                                required
                            >
                                <option value="">Select...</option>
                                {memberObjects.map(m => (
                                    <option key={m.id} value={m.id}>{m.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs font-black uppercase tracking-widest text-slate-500">Paid to</p>
                            <select
                                className="w-full p-3 rounded-2xl border-2 border-slate-200 focus:border-emerald-500 focus:outline-none text-sm font-bold text-slate-700 bg-white"
                                value={settlePaidTo}
                                onChange={e => setSettlePaidTo(e.target.value)}
                                required
                            >
                                <option value="">Select...</option>
                                {memberObjects.filter(m => m.id !== settlePaidBy).map(m => (
                                    <option key={m.id} value={m.id}>{m.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <Input
                        label="Amount ($)"
                        type="number"
                        step="0.01"
                        min="0.01"
                        placeholder="0.00"
                        required
                        value={settleAmount}
                        onChange={e => setSettleAmount(e.target.value)}
                    />

                    <div className="flex gap-4 pt-2">
                        <Button type="button" variant="secondary" className="flex-1 rounded-2xl" onClick={() => setIsSettleModalOpen(false)}>Cancel</Button>
                        <Button type="submit" className="flex-1 rounded-2xl">Record Payment</Button>
                    </div>
                </form>
            </Modal>
        </Layout>
    );
};

export default GroupDetail;
