import React, { useState, useEffect, useMemo } from 'react';
import { Layout } from '../components/layout/Layout';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import {
    UserPlus, Users, Clock, Check, X, Trash2,
    Search, UserCheck, Send, Bell, ChevronRight
} from 'lucide-react';
import api from '../api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../utils/cn';

const TABS = ['friends', 'pending', 'sent'];

const Friends = () => {
    const [friends, setFriends] = useState([]);           // accepted friends
    const [pending, setPending] = useState([]);            // incoming requests
    const [sent, setSent] = useState([]);                  // outgoing requests
    const [allUsers, setAllUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('friends');
    const [searchQuery, setSearchQuery] = useState('');
    const [actionLoading, setActionLoading] = useState({});

    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const currentUserId = currentUser.id || currentUser._id || '';

    useEffect(() => {
        fetchAll();
    }, []);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const [friendsRes, pendingRes, sentRes, usersRes] = await Promise.all([
                api.get('/friends'),
                api.get('/friends/pending'),
                api.get('/friends/sent'),
                api.get('/users'),
            ]);
            setFriends(Array.isArray(friendsRes.data) ? friendsRes.data : []);
            setPending(Array.isArray(pendingRes.data) ? pendingRes.data : []);
            setSent(Array.isArray(sentRes.data) ? sentRes.data : []);
            setAllUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
        } catch (err) {
            console.error('Failed to fetch friends data', err);
        } finally {
            setLoading(false);
        }
    };

    // IDs of people already in some relationship with current user
    const relatedIds = useMemo(() => {
        const ids = new Set([currentUserId]);
        friends.forEach(f => f.user?.id && ids.add(f.user.id));
        pending.forEach(f => f.user?.id && ids.add(f.user.id));
        sent.forEach(f => f.user?.id && ids.add(f.user.id));
        return ids;
    }, [friends, pending, sent, currentUserId]);

    // Users available to send friend requests to
    const searchResults = useMemo(() => {
        if (!searchQuery.trim()) return [];
        return allUsers.filter(u =>
            !relatedIds.has(u.id) &&
            (u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
             u.email?.toLowerCase().includes(searchQuery.toLowerCase()))
        ).slice(0, 6);
    }, [searchQuery, allUsers, relatedIds]);

    const setAction = (id, val) => setActionLoading(prev => ({ ...prev, [id]: val }));

    const handleSendRequest = async (userId) => {
        setAction(userId, true);
        try {
            await api.post('/friends/request', { friend_id: userId });
            setSearchQuery('');
            fetchAll();
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to send friend request.');
        } finally {
            setAction(userId, false);
        }
    };

    const handleAccept = async (requestId) => {
        setAction(requestId, true);
        try {
            await api.put(`/friends/${requestId}/accept`);
            fetchAll();
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to accept request.');
        } finally {
            setAction(requestId, false);
        }
    };

    const handleReject = async (requestId) => {
        setAction(requestId, true);
        try {
            await api.put(`/friends/${requestId}/reject`);
            fetchAll();
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to reject request.');
        } finally {
            setAction(requestId, false);
        }
    };

    const handleRemoveFriend = async (friendshipId, name) => {
        if (!window.confirm(`Remove ${name} from your friends?`)) return;
        setAction(friendshipId, true);
        try {
            await api.delete(`/friends/${friendshipId}`);
            fetchAll();
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to remove friend.');
        } finally {
            setAction(friendshipId, false);
        }
    };

    const tabConfig = [
        { key: 'friends', label: 'Friends', icon: UserCheck, count: friends.length },
        { key: 'pending', label: 'Requests', icon: Bell, count: pending.length },
        { key: 'sent', label: 'Sent', icon: Send, count: sent.length },
    ];

    return (
        <Layout>
            <div className="space-y-8 pb-20 max-w-3xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-black tracking-tight text-slate-800">Friends</h1>
                        <p className="text-slate-500 font-medium mt-1">Connect with people to share expenses</p>
                    </div>
                    <div className="flex items-center space-x-2 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-2xl border border-slate-100 shadow-sm">
                        <UserCheck className="w-4 h-4 text-emerald-500" />
                        <span className="text-sm font-extrabold text-slate-700">{friends.length} friend{friends.length !== 1 ? 's' : ''}</span>
                    </div>
                </div>

                {/* Search / Add Friend */}
                <Card>
                    <CardContent className="p-6 space-y-4">
                        <div className="flex items-center space-x-3 mb-2">
                            <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center">
                                <UserPlus className="w-4 h-4 text-emerald-600" />
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-slate-800">Add a Friend</h3>
                                <p className="text-xs text-slate-400 font-medium">Search by name or email</p>
                            </div>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search users..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full pl-11 pr-4 py-3.5 rounded-2xl border-2 border-slate-200 focus:border-emerald-500/60 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition-all font-bold text-sm bg-white/80"
                            />
                        </div>

                        <AnimatePresence>
                            {searchQuery.trim().length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="space-y-1 pt-2">
                                        {searchResults.length === 0 ? (
                                            <div className="py-6 text-center text-slate-400">
                                                <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                                <p className="text-sm font-bold">No users found</p>
                                            </div>
                                        ) : (
                                            searchResults.map(user => (
                                                <div key={user.id} className="flex items-center justify-between p-3 hover:bg-emerald-50 rounded-2xl transition-all group">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center text-sm font-black text-slate-600 group-hover:from-emerald-100 group-hover:to-emerald-50 group-hover:text-emerald-700 transition-all">
                                                            {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-extrabold text-slate-800">{user.name}</p>
                                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{user.email}</p>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        size="sm"
                                                        className="rounded-xl"
                                                        disabled={actionLoading[user.id]}
                                                        onClick={() => handleSendRequest(user.id)}
                                                    >
                                                        <UserPlus className="w-3.5 h-3.5 mr-1.5" />
                                                        {actionLoading[user.id] ? 'Sending...' : 'Add'}
                                                    </Button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </CardContent>
                </Card>

                {/* Tabs */}
                <div className="flex items-center space-x-1 p-1 bg-slate-100/70 rounded-2xl border border-slate-200/50 w-full">
                    {tabConfig.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={cn(
                                "flex-1 flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl text-sm font-bold transition-all duration-200",
                                activeTab === tab.key
                                    ? "bg-white text-slate-800 shadow-sm"
                                    : "text-slate-500 hover:text-slate-700"
                            )}
                        >
                            <tab.icon className="w-4 h-4" />
                            <span>{tab.label}</span>
                            {tab.count > 0 && (
                                <span className={cn(
                                    "text-[10px] font-black px-2 py-0.5 rounded-full",
                                    tab.key === 'pending'
                                        ? "bg-amber-100 text-amber-700"
                                        : "bg-emerald-100 text-emerald-700"
                                )}>
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                {loading ? (
                    <div className="flex justify-center py-16">
                        <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                    </div>
                ) : (
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.15 }}
                        >
                            {/* Friends Tab */}
                            {activeTab === 'friends' && (
                                <div className="space-y-3">
                                    {friends.length === 0 ? (
                                        <EmptyState
                                            icon={Users}
                                            title="No friends yet"
                                            subtitle="Search for users above to send a friend request"
                                        />
                                    ) : (
                                        friends.map(f => (
                                            <FriendCard
                                                key={f.id}
                                                user={f.user}
                                                meta={<span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase">Friend</span>}
                                                action={
                                                    <button
                                                        onClick={() => handleRemoveFriend(f.id, f.user?.name)}
                                                        disabled={actionLoading[f.id]}
                                                        className="opacity-0 group-hover:opacity-100 p-2 rounded-xl text-rose-300 hover:text-rose-500 hover:bg-rose-50 transition-all"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                }
                                            />
                                        ))
                                    )}
                                </div>
                            )}

                            {/* Pending Requests Tab */}
                            {activeTab === 'pending' && (
                                <div className="space-y-3">
                                    {pending.length === 0 ? (
                                        <EmptyState
                                            icon={Bell}
                                            title="No pending requests"
                                            subtitle="All incoming friend requests will appear here"
                                        />
                                    ) : (
                                        pending.map(req => (
                                            <FriendCard
                                                key={req.id}
                                                user={req.user}
                                                meta={
                                                    <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full uppercase">
                                                        Wants to connect
                                                    </span>
                                                }
                                                action={
                                                    <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-all">
                                                        <button
                                                            onClick={() => handleReject(req.id)}
                                                            disabled={actionLoading[req.id]}
                                                            className="p-2 rounded-xl text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleAccept(req.id)}
                                                            disabled={actionLoading[req.id]}
                                                            className="flex items-center space-x-1 px-3 py-2 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 transition-all text-xs font-black"
                                                        >
                                                            <Check className="w-3.5 h-3.5" />
                                                            <span>Accept</span>
                                                        </button>
                                                    </div>
                                                }
                                            />
                                        ))
                                    )}
                                </div>
                            )}

                            {/* Sent Requests Tab */}
                            {activeTab === 'sent' && (
                                <div className="space-y-3">
                                    {sent.length === 0 ? (
                                        <EmptyState
                                            icon={Send}
                                            title="No sent requests"
                                            subtitle="Friend requests you've sent will appear here"
                                        />
                                    ) : (
                                        sent.map(req => (
                                            <FriendCard
                                                key={req.id}
                                                user={req.user}
                                                meta={
                                                    <span className="flex items-center space-x-1 text-[10px] font-black text-slate-400 uppercase">
                                                        <Clock className="w-3 h-3" />
                                                        <span>Awaiting response</span>
                                                    </span>
                                                }
                                                action={null}
                                            />
                                        ))
                                    )}
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                )}
            </div>
        </Layout>
    );
};

const FriendCard = ({ user, meta, action }) => (
    <motion.div
        layout
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="group flex items-center justify-between p-4 bg-white/60 hover:bg-white rounded-2xl border border-slate-100 shadow-sm transition-all"
    >
        <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center text-lg font-black text-emerald-700 shrink-0">
                {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?'}
            </div>
            <div>
                <div className="flex items-center space-x-2 mb-0.5">
                    <p className="text-sm font-extrabold text-slate-800">{user?.name || 'Unknown'}</p>
                    {meta}
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{user?.email}</p>
            </div>
        </div>
        {action && <div className="shrink-0">{action}</div>}
    </motion.div>
);

const EmptyState = ({ icon: Icon, title, subtitle }) => (
    <div className="flex flex-col items-center justify-center py-16 bg-white/30 rounded-[2.5rem] border-2 border-dashed border-slate-200">
        <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4">
            <Icon className="w-8 h-8 text-slate-200" />
        </div>
        <p className="text-base font-bold text-slate-400">{title}</p>
        <p className="text-sm font-medium text-slate-300 mt-1">{subtitle}</p>
    </div>
);

export default Friends;
