import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import apiClient from '../api/client';
import toast from 'react-hot-toast';
import useAuth from '../hooks/useAuth';
import EditProfileModal from './EditProfileModal';
import { 
    IconUsers, 
    IconMail, 
    IconBriefcase, 
    IconShield, 
    IconClock,
    IconActivity,
    IconZap,
    IconEdit,
    IconCalendar
} from './Icons';

const BentoCard = ({ children, className = "", glowColor = "transparent" }) => (
    <div 
        style={{ '--glow-color': glowColor }}
        className={`p-6 lg:p-8 bg-primary-surface border border-border rounded-[2rem] shadow-sm relative overflow-hidden group transition-all duration-500 hover:border-sky-500/30 ${className}`}
    >
        <div className="absolute -inset-24 bg-[radial-gradient(circle_at_center,var(--glow-color),transparent_70%)] opacity-0 group-hover:opacity-20 transition-opacity duration-1000 pointer-events-none"></div>
        <div className="relative z-10 h-full">{children}</div>
    </div>
);

const StatWidget = ({ icon: Icon, label, value, subValue, colorClass }) => (
    <BentoCard className="flex flex-col h-full">
        <div className={`p-2.5 rounded-xl w-fit ${colorClass}`}>
            <Icon className="w-5 h-5" />
        </div>
        <div className="mt-6">
            <h4 className="text-[10px] font-black text-content-muted uppercase tracking-[0.15em] mb-1 leading-none">{label}</h4>
            <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-content-main tracking-tighter leading-none">{value}</span>
                {subValue && <span className="text-[10px] font-bold text-content-muted uppercase tracking-tight">{subValue}</span>}
            </div>
        </div>
    </BentoCard>
);

function Profile() {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Determine whose profile we're looking at
  const targetId = id || currentUser?.id;
  const isOwnProfile = currentUser?.id === targetId;
  const isAdmin = currentUser?.role === 'admin';

  useEffect(() => {
    fetchProfileData();
  }, [targetId]);

  const fetchProfileData = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get(`users/profile/${targetId}`);
      setProfileData(response.data);
    } catch (err) {
      console.error("Failed to fetch profile data", err);
      toast.error("Data stitching failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (formData) => {
    try {
        await apiClient.put('users/profile', { ...formData, userId: targetId });
        toast.success("Identity Re-synchronized");
        fetchProfileData();
    } catch (err) {
        // Handled by interceptor
    }
  };

  if (isLoading) return <div className="p-10 animate-pulse text-content-muted font-bold tracking-widest text-center py-32">SYNCHRONIZING SECURE UPLINK...</div>;
  if (!profileData) return <div className="p-10 text-center py-32 font-bold text-rose-500 uppercase tracking-widest">Identity record not found.</div>;

  const { user, hierarchy, stats, task_overview, recent_activity } = profileData;
  const roleGlow = user.role === 'admin' ? 'rgba(99,102,241,0.15)' : 'rgba(14,165,233,0.15)';

  return (
    <>
    <div className="p-6 lg:p-12 max-w-[1600px] mx-auto animate-fade-in space-y-10 pb-24">
      
      {/* HEADER BENTO: Identity Core */}
      <BentoCard className="!p-0 overflow-hidden border-sky-500/10 hover:border-sky-500/20">
        <div className="bg-gradient-to-br from-primary-muted to-primary-surface p-8 lg:p-16 flex flex-col lg:flex-row items-center gap-12 relative">
            <div className="relative shrink-0">
                <div className={`absolute -inset-12 blur-[80px] opacity-30 rounded-full transition-all duration-1000`} style={{ backgroundColor: user.role === 'admin' ? '#6366f1' : '#0ea5e9' }}></div>
                <div className="w-40 h-40 lg:w-56 lg:h-56 bg-primary-surface rounded-[4rem] border-[6px] border-white dark:border-border shadow-2xl flex items-center justify-center text-8xl font-black text-sky-500 relative z-10 overflow-hidden">
                    {user.profile_photo ? (
                        <img src={user.profile_photo} alt="" className="w-full h-full object-cover" />
                    ) : (user.full_name?.charAt(0) || 'U')}
                </div>
                <div className="absolute -bottom-3 -right-3 w-12 h-12 bg-emerald-500 rounded-2xl border-4 border-primary-surface z-20 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                    <div className="w-3.5 h-3.5 bg-white rounded-full animate-pulse"></div>
                </div>
            </div>

            <div className="flex-1 text-center lg:text-left space-y-6">
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-5">
                    <h1 className="text-4xl lg:text-7xl font-black text-content-main tracking-tighter leading-none">{user.full_name}</h1>
                    <span className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.25em] border shadow-sm ${
                        user.role === 'admin' ? 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' : 'bg-sky-500/10 text-sky-500 border-sky-500/20'
                    }`}>
                        {user.role} PERSPECTIVE
                    </span>
                </div>
                <p className="max-w-3xl text-content-muted font-bold text-lg leading-relaxed opacity-80">
                    {user.bio || "This identity operating profile is awaiting professional initialization. No strategic overview has been uploaded."}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:flex lg:flex-wrap items-center justify-center lg:justify-start gap-x-10 gap-y-4 pt-4 border-t border-border mt-8">
                    <div className="flex items-center gap-3 text-content-muted font-black text-xs uppercase tracking-widest">
                        <IconMail className="w-4 h-4 text-sky-500" /> {user.email}
                    </div>
                    <div className="flex items-center gap-3 text-content-muted font-black text-xs uppercase tracking-widest">
                        <IconBriefcase className="w-4 h-4 text-sky-500" /> {user.designation || 'Operational Unit'}
                    </div>
                    <div className="flex items-center gap-3 text-content-muted font-black text-xs uppercase tracking-widest">
                        <span className="text-sky-500">TENURE:</span> {user.tenure || 'ACTIVE'}
                    </div>
                </div>
            </div>

            {(isOwnProfile || isAdmin) && (
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="lg:absolute top-10 right-10 p-5 bg-primary-surface border border-border rounded-[2rem] hover:border-sky-500 hover:shadow-lg hover:shadow-sky-500/10 transition-all shadow-sm group"
                >
                    <IconEdit className="w-6 h-6 text-content-muted group-hover:text-sky-500 transition-colors" />
                </button>
            )}
        </div>
      </BentoCard>

      {/* MID SECTION: Identity Grid & Stats */}
      <div className="grid grid-cols-12 gap-8 lg:gap-12">
        
        {/* Left Column: Context & Activity */}
        <div className="col-span-12 lg:col-span-4 space-y-8 h-fit">
            <BentoCard glowColor={roleGlow} className="h-fit">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-[11px] font-black text-content-muted uppercase tracking-[0.2em]">Structural Location</h3>
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/40"></div>
                </div>
                <div className="space-y-8">
                    <div className="flex items-center gap-5 group">
                        <div className="p-3.5 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl transition-transform group-hover:scale-110"><IconShield className="w-5 h-5" /></div>
                        <div>
                            <p className="text-[10px] font-black text-content-muted uppercase tracking-[0.2em]">Division</p>
                            <p className="text-base font-black text-content-main tracking-tight uppercase leading-none mt-1">{user.department}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-5 group">
                        <div className="p-3.5 bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-2xl transition-transform group-hover:scale-110"><IconUsers className="w-5 h-5" /></div>
                        <div>
                            <p className="text-[10px] font-black text-content-muted uppercase tracking-[0.2em]">Reporting Authority</p>
                            <p className="text-base font-black text-content-main tracking-tight uppercase leading-none mt-1">
                                {hierarchy.manager?.full_name || 'Central Command'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-5 group">
                        <div className="p-3.5 bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl transition-transform group-hover:scale-110"><IconClock className="w-5 h-5" /></div>
                        <div>
                            <p className="text-[10px] font-black text-content-muted uppercase tracking-[0.2em]">Protocol Status</p>
                            <span className="inline-flex items-center gap-2 text-base font-black text-content-main tracking-tight uppercase leading-none mt-1">
                                {user.status}
                            </span>
                        </div>
                    </div>
                </div>
            </BentoCard>

            <BentoCard glowColor={roleGlow}>
                <h3 className="text-[11px] font-black text-content-muted uppercase tracking-[0.2em] mb-8">Chronological Activity</h3>
                <div className="space-y-6">
                    {recent_activity.length > 0 ? recent_activity.map((act, i) => (
                        <div key={i} className="flex gap-5 group">
                            <div className="flex flex-col items-center">
                                <div className={`w-2 h-2 rounded-full mt-1.5 shadow-sm transition-transform group-hover:scale-150 ${act.type === 'attendance' ? 'bg-sky-500' : 'bg-emerald-500'}`}></div>
                                {i !== recent_activity.length - 1 && <div className="w-px flex-1 bg-border my-2 border-dashed"></div>}
                            </div>
                            <div className="pb-4">
                                <p className="text-sm font-black text-content-main uppercase tracking-tight group-hover:text-sky-500 transition-colors leading-none">{act.title}</p>
                                <p className="text-xs font-bold text-content-muted mt-2 opacity-80 leading-snug">{act.description}</p>
                                <p className="text-[9px] font-black text-content-muted/40 mt-2 uppercase tracking-widest">{new Date(act.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                            </div>
                        </div>
                    )) : (
                        <p className="text-xs font-bold text-content-muted italic py-10 text-center opacity-50 uppercase tracking-widest">Zero activity nodes detected</p>
                    )}
                </div>
            </BentoCard>
        </div>

        {/* Right Column: Performance Analytics */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-8 h-fit">
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <StatWidget 
                    icon={IconZap}
                    label="Work Velocity"
                    value={`${stats.task_velocity}%`}
                    subValue={`LIFETIME`}
                    colorClass="bg-amber-500/10 text-amber-500"
                />
                <StatWidget 
                    icon={IconActivity}
                    label="Punctuality"
                    value={`${stats.punctuality_score}%`}
                    subValue="CONSISTENCY"
                    colorClass="bg-emerald-500/10 text-emerald-500"
                />
                <StatWidget 
                    icon={IconCalendar}
                    label="Leave Nodes"
                    value={user.leave_balance}
                    subValue="UNLOCKED"
                    colorClass="bg-rose-500/10 text-rose-500"
                />
            </div>

            <BentoCard className="bg-gradient-to-br from-sky-500/[0.03] to-indigo-500/[0.03] flex flex-col md:flex-row items-center justify-between p-8 lg:p-12">
                <div className="space-y-4 mb-8 md:mb-0">
                   <div className="p-3 bg-sky-500 rounded-2xl w-fit shadow-lg shadow-sky-500/20 text-white">
                        <IconBriefcase className="w-6 h-6" />
                   </div>
                   <div>
                        <h3 className="text-3xl font-black text-content-main tracking-tighter">Strategic Objectives</h3>
                        <p className="text-[10px] font-black text-content-muted uppercase tracking-[0.25em] mt-1 italic">Real-time Task Pulse</p>
                   </div>
                </div>
                <div className="flex gap-12 lg:gap-20 md:pr-8">
                   <div className="text-center relative">
                       <p className="text-5xl lg:text-7xl font-black text-sky-500 tracking-tighter leading-none">{task_overview.pending}</p>
                       <p className="text-[10px] font-black text-content-muted uppercase tracking-widest mt-3">In Progress</p>
                       <div className="absolute -top-4 -right-4 w-3 h-3 bg-sky-500 rounded-full animate-ping"></div>
                   </div>
                   <div className="text-center">
                       <p className="text-5xl lg:text-7xl font-black text-emerald-500 tracking-tighter leading-none">{task_overview.completed}</p>
                       <p className="text-[10px] font-black text-content-muted uppercase tracking-widest mt-3">Finalized</p>
                   </div>
                </div>
            </BentoCard>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <BentoCard className="bg-primary-muted/20 border-dashed border-2 p-6">
                    <h4 className="text-[10px] font-black text-content-muted uppercase tracking-[0.2em] mb-3">Focus Core</h4>
                    <p className="text-content-muted font-bold text-xs leading-relaxed italic opacity-70">
                        "Operational efficiency is dictated by the precise execution of minor objectives."
                    </p>
                </BentoCard>
                <BentoCard className="bg-primary-muted/20 border-dashed border-2 p-6">
                    <h4 className="text-[10px] font-black text-content-muted uppercase tracking-[0.2em] mb-3">Security Protocol</h4>
                    <p className="text-content-muted font-bold text-xs leading-relaxed italic opacity-70">
                        Level {user.role === 'admin' ? 'Alpha' : 'Beta'} clearance active. All modifications are logged in the central ledger.
                    </p>
                </BentoCard>
            </div>
        </div>

      </div>

      </div>
      <EditProfileModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        user={user}
        onSave={handleUpdate}
        isAdminView={isAdmin && !isOwnProfile}
      />
    </>
  );
}

export default Profile;
