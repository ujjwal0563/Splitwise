import React, { useState, useEffect } from 'react';
import { Layout } from '../components/layout/Layout';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Plus, Users, Search, ChevronRight, Info } from 'lucide-react';
import api from '../api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../utils/cn';

const Groups = () => {
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchGroups();
    }, []);

    const fetchGroups = async () => {
        try {
            const res = await api.get('/groups');
            setGroups(res.data || []);
        } catch (err) {
            console.error('Failed to fetch groups', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateGroup = async (e) => {
        e.preventDefault();
        try {
            await api.post('/groups', {
                name: newGroupName,
            });
            setNewGroupName('');
            setIsModalOpen(false);
            fetchGroups();
        } catch (err) {
            console.error('Failed to create group', err);
        }
    };

    const filteredGroups = groups.filter(g =>
        g.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <Layout>
            <div className="space-y-8 pb-20">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-black tracking-tight text-slate-800">Your Groups</h1>
                        <p className="text-slate-500 font-medium mt-1">Manage shared expenses with your circles</p>
                    </div>
                    <Button
                        onClick={() => setIsModalOpen(true)}
                        size="lg"
                        className="rounded-2xl shadow-xl hover:shadow-emerald-500/40 transition-shadow"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Create Group
                    </Button>
                </div>

                {/* Search Bar */}
                <div className="relative max-w-md w-full">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search your groups..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="block w-full pl-12 pr-4 py-4 glass rounded-2xl border-none focus:ring-2 focus:ring-emerald-500/20 text-sm font-bold placeholder:text-slate-400 placeholder:font-bold transition-all"
                    />
                </div>

                {/* Groups Grid */}
                {loading ? (
                    <div className="flex-center py-20">
                        <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        <AnimatePresence>
                            {filteredGroups.map((group) => (
                                <motion.div
                                    key={group.id}
                                    variants={itemVariants}
                                    layout
                                    className="group cursor-pointer"
                                    onClick={() => window.location.href = `/groups/${group.id}`}
                                >
                                    <Card className="h-full border-slate-100/50 hover:border-emerald-500/30 transition-all duration-500 overflow-hidden relative">
                                        <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <ChevronRight className="w-6 h-6 text-emerald-500 translate-x-2 group-hover:translate-x-0 transition-transform" />
                                        </div>

                                        <CardContent className="p-8">
                                            <div className="w-16 h-16 rounded-[1.25rem] bg-gradient-to-br from-emerald-100 to-emerald-50 flex-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                                                <Users className="w-8 h-8 text-emerald-600" />
                                            </div>

                                            <h3 className="text-xl font-black text-slate-800 mb-2 group-hover:text-emerald-700 transition-colors line-clamp-1">
                                                {group.name}
                                            </h3>

                                            <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                                                <div className="flex -space-x-3">
                                                {(group.members || []).slice(0, 3).map((memberId, i) => (
                                                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gradient-to-br from-emerald-100 to-teal-100 flex-center text-[10px] font-black text-emerald-700 shadow-sm">
                                                        {String(i + 1)}
                                                        </div>
                                                    ))}
                                                    {(group.members || []).length > 3 && (
                                                        <div className="w-8 h-8 rounded-full border-2 border-white bg-emerald-100 flex-center text-[10px] font-black text-emerald-700 shadow-sm">
                                                            +{(group.members || []).length - 3}
                                                        </div>
                                                    )}
                                                </div>
                                                <span className="text-xs font-bold text-slate-400 tracking-widest uppercase">
                                                    {(group.members || []).length} Members
                                                </span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>
                )}

                {/* Empty State */}
                {!loading && filteredGroups.length === 0 && (
                    <div className="flex-center flex-col py-20 bg-white/40 rounded-[3rem] border-2 border-dashed border-slate-200">
                        <div className="w-20 h-20 rounded-full bg-slate-50 flex-center mb-6">
                            <Info className="w-10 h-10 text-slate-200" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-400">No groups found</h3>
                        <p className="text-slate-400 font-medium">Try a different search or create a new group</p>
                    </div>
                )}
            </div>

            {/* Create Group Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-lg"
                        >
                            <Card className="shadow-2xl border-none">
                                <CardHeader className="text-center">
                                    <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex-center mx-auto mb-4">
                                        <Plus className="w-6 h-6 text-emerald-600" />
                                    </div>
                                    <CardTitle>Create New Group</CardTitle>
                                    <p className="text-slate-500 font-medium mt-1">Start tracking shared expenses with friends</p>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleCreateGroup} className="space-y-6">
                                        <Input
                                            label="Group Name"
                                            placeholder="e.g., Summer Trip 2024"
                                            required
                                            value={newGroupName}
                                            onChange={(e) => setNewGroupName(e.target.value)}
                                        />
                                        <div className="flex gap-4 pt-2">
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                className="flex-1 rounded-2xl"
                                                onClick={() => setIsModalOpen(false)}
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                type="submit"
                                                className="flex-1 rounded-2xl"
                                            >
                                                Create Group
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </Layout>
    );
};

export default Groups;
