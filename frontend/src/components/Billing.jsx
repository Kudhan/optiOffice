import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { 
  CreditCard, 
  Shield, 
  Zap, 
  Globe, 
  Download, 
  History, 
  TrendingUp, 
  Users, 
  Calendar,
  CheckCircle2,
  Lock,
  ArrowRight,
  ChevronRight,
  Package
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

const Billing = () => {
    const [loading, setLoading] = useState(true);
    const [billingData, setBillingData] = useState(null);
    const [billingCycle, setBillingCycle] = useState('Monthly');
    const [tab, setTab] = useState('overview');

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('billing');
            setBillingData(response.data);
        } catch (error) {
            console.error("Billing Intelligence Sync Error:", error);
            toast.error("Failed to fetch billing intelligence");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleUpgrade = async (planType) => {
        try {
            const promise = apiClient.post('billing/mock-payment', { planType, billingCycle });
            await toast.promise(promise, {
                loading: `Provisioning ${planType} Node...`,
                success: "Financial Reconciliation Complete: Subscription Active",
                error: "Transaction Volatility Detected: Try again"
            });
            fetchData();
        } catch (error) {
            console.error(error);
        }
    };

    const StatCard = ({ title, value, icon, color = "sky" }) => (
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden group">
            <div className={`absolute top-0 right-0 w-32 h-32 bg-${color}-500/5 rounded-bl-[5rem] -mr-10 -mt-10 group-hover:scale-110 transition-transform`} />
            <div className="relative z-10 flex flex-col gap-4">
                <div className={`w-12 h-12 rounded-2xl bg-${color}-500/10 flex items-center justify-center text-${color}-500`}>
                    {icon}
                </div>
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</p>
                    <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{value}</p>
                </div>
            </div>
        </div>
    );

    const PricingCard = ({ plan, price, features, color = "sky", current = false }) => (
        <div className={`relative bg-white dark:bg-slate-900 p-10 rounded-[4rem] border ${current ? 'border-sky-500 shadow-2xl shadow-sky-500/10' : 'border-slate-100 dark:border-slate-800'} transition-all hover:scale-[1.02] active:scale-[0.98]`}>
            {current && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-sky-500 text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl">
                    Active Node
                </div>
            )}
            <div className="flex flex-col h-full gap-8">
                <div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-2">{plan}</h3>
                    <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">₹{price}</span>
                        <span className="text-slate-400 text-xs font-black uppercase tracking-widest">/ {billingCycle === 'Monthly' ? 'mo' : 'yr'}</span>
                    </div>
                </div>

                <div className="space-y-4 flex-grow">
                    {features.map((feature, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />
                            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{feature}</span>
                        </div>
                    ))}
                </div>

                <button 
                    onClick={() => handleUpgrade(plan)}
                    disabled={current}
                    className={`w-full py-5 rounded-3xl font-black text-[10px] uppercase tracking-[0.2em] transition-all ${
                        current 
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed' 
                        : `bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-${color}-500 hover:text-white shadow-xl`
                    }`}
                >
                    {current ? 'Current Plan' : `Initialize ${plan}`}
                </button>
            </div>
        </div>
    );

    if (loading && !billingData) {
        return (
            <div className="py-40 text-center flex flex-col items-center justify-center gap-6">
                <div className="w-16 h-16 border-4 border-slate-100 dark:border-slate-800 border-t-sky-500 rounded-full animate-spin" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] animate-pulse">Synchronizing Financial Nodes...</p>
            </div>
        );
    }

    return (
        <div className="space-y-12 animate-fade-in max-w-[1400px] mx-auto pb-20">
            {/* Strategic Header */}
            <div className="flex flex-col lg:flex-row justify-between items-center gap-8 bg-white/50 dark:bg-slate-900/50 backdrop-blur-3xl p-10 rounded-[4rem] border border-slate-100 dark:border-slate-800 shadow-2xl shadow-slate-900/5">
                <div className="flex items-center gap-8">
                    <div className="p-5 rounded-[2rem] bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl">
                        <CreditCard size={32} />
                    </div>
                    <div className="space-y-1">
                        <h2 className="text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none italic">Billings <span className="text-sky-500">& Hub</span></h2>
                        <div className="flex items-center gap-2">
                             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                             <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Financial Gateway Active</p>
                        </div>
                    </div>
                </div>

                <div className="flex gap-2 bg-slate-100 dark:bg-slate-800 p-2 rounded-3xl border border-slate-200/50 dark:border-slate-700/50 shadow-inner">
                    {['overview', 'invoices', 'plans'].map(t => (
                        <button 
                            key={t}
                            onClick={() => setTab(t)}
                            className={`px-8 py-3.5 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${tab === t ? 'bg-white dark:bg-slate-900 text-sky-500 shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            </div>

            <AnimatePresence mode="wait">
                {tab === 'overview' && (
                    <motion.div 
                        key="overview"
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                        className="space-y-12"
                    >
                        {/* Bento Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            <StatCard title="Active Sub" value={billingData?.planType} icon={<Shield size={22} />} color="sky" />
                            <StatCard title="Seat Saturation" value={`${billingData?.currentUserCount} / ${billingData?.userLimit}`} icon={<Users size={22} />} color="emerald" />
                            <StatCard title="Next Ledger" value={billingData?.nextPaymentDate ? new Date(billingData.nextPaymentDate).toLocaleDateString() : 'N/A'} icon={<Calendar size={22} />} color="amber" />
                            <StatCard title="Financial Status" value={billingData?.status} icon={<TrendingUp size={22} />} color={billingData?.status === 'Active' ? 'emerald' : 'rose'} />
                        </div>

                        {/* Recent History */}
                        <div className="bg-white dark:bg-slate-900 p-10 rounded-[4rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Recent Ledger Nodes</h3>
                                <button onClick={() => setTab('invoices')} className="text-[9px] font-black uppercase tracking-widest text-sky-500 hover:gap-2 flex items-center transition-all underline decoration-2 underline-offset-8">
                                    Full Audit <ChevronRight size={14} />
                                </button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-slate-50 dark:border-slate-800">
                                            <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Invoice Node</th>
                                            <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Reconciliation Date</th>
                                            <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Valuation</th>
                                            <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                        {(billingData?.invoices || []).map(inv => (
                                            <tr key={inv.id} className="group">
                                                <td className="py-6 text-sm font-black text-slate-900 dark:text-white">{inv.invoiceNumber}</td>
                                                <td className="py-6 text-sm font-bold text-slate-500">{new Date(inv.billingDate).toLocaleDateString()}</td>
                                                <td className="py-6 text-sm font-black text-slate-900 dark:text-white">₹{inv.amount.toLocaleString()}</td>
                                                <td className="py-6">
                                                    <span className="px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[8px] font-black uppercase tracking-widest">
                                                        {inv.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </motion.div>
                )}

                {tab === 'plans' && (
                    <motion.div 
                        key="plans"
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                        className="space-y-12"
                    >
                        {/* Cycle Toggle */}
                        <div className="flex justify-center">
                            <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-3xl flex gap-1 border border-slate-200/50 dark:border-slate-700/50">
                                {['Monthly', 'Annually'].map(cycle => (
                                    <button 
                                        key={cycle}
                                        onClick={() => setBillingCycle(cycle)}
                                        className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${billingCycle === cycle ? 'bg-white dark:bg-slate-900 text-sky-500 shadow-xl' : 'text-slate-400'}`}
                                    >
                                        {cycle} {cycle === 'Annually' && <span className="ml-2 text-emerald-500">-20%</span>}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <PricingCard 
                                plan="Free" 
                                price="0" 
                                features={['Up to 10 Personnel Nodes', 'Standard Policy Hub', 'Basic Asset Tracking', 'Community Support']} 
                                current={billingData?.planType === 'Free'}
                            />
                            <PricingCard 
                                plan="Pro" 
                                price={billingCycle === 'Monthly' ? '4,999' : '49,990'} 
                                color="sky"
                                features={['Up to 50 Personnel Nodes', 'Advanced Strategic Reports', 'RBAC Asset Hardening', 'Priority Pulse Support', 'Custom Domain Node']} 
                                current={billingData?.planType === 'Pro'}
                            />
                            <PricingCard 
                                plan="Enterprise" 
                                price={billingCycle === 'Monthly' ? '14,999' : '1,49,990'} 
                                color="indigo"
                                features={['Unlimited Personnel Nodes', 'Archival Strategic Intelligence', 'Global Site Operations', 'Dedicated Account Liaison', 'Full API Command Access']} 
                                current={billingData?.planType === 'Enterprise'}
                            />
                        </div>
                    </motion.div>
                )}

                {tab === 'invoices' && (
                    <motion.div 
                        key="invoices"
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                        className="bg-white dark:bg-slate-900 rounded-[4rem] border border-slate-100 dark:border-slate-800 shadow-sm p-12 overflow-hidden"
                    >
                        <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-10">Historical Intelligence Records</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-slate-50 dark:border-slate-800">
                                        <th className="pb-8 text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Ledger ID</th>
                                        <th className="pb-8 text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Cycle Date</th>
                                        <th className="pb-8 text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Asset Value</th>
                                        <th className="pb-8 text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Operational Status</th>
                                        <th className="pb-8 text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 text-right">Commands</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                    {(billingData?.invoices || []).map(inv => (
                                        <tr key={inv.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="py-8 px-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-500">
                                                        <Package size={14} />
                                                    </div>
                                                    <span className="text-sm font-black text-slate-900 dark:text-white tracking-tight leading-none">{inv.invoiceNumber}</span>
                                                </div>
                                            </td>
                                            <td className="py-8 px-4 text-xs font-bold text-slate-500">{new Date(inv.billingDate).toLocaleDateString()}</td>
                                            <td className="py-8 px-4 text-sm font-black text-slate-900 dark:text-white">₹{inv.amount.toLocaleString()}</td>
                                            <td className="py-8 px-4">
                                                <span className="px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[8px] font-black uppercase tracking-widest">
                                                    {inv.status}
                                                </span>
                                            </td>
                                            <td className="py-8 px-4 text-right">
                                                <button className="p-3 rounded-xl hover:bg-white dark:hover:bg-slate-900 border border-transparent hover:border-slate-100 dark:hover:border-slate-700 transition-all text-slate-400 hover:text-sky-500 shadow-sm">
                                                    <Download size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Billing;
