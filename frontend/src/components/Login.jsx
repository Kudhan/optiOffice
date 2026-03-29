import React, { useState } from 'react';
import apiClient from '../api/client';
import toast from 'react-hot-toast';

function Login({ setToken }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await apiClient.post('auth/token', {
        username,
        password
      });
      setToken(response.data.access_token);
      toast.success('Successfully logged in! Accessing Command Center...');
    } catch (err) {
      // apiClient response interceptor handles the toast error message
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-navy-950 items-center justify-center p-6 font-sans">
      <div className="flex flex-col md:flex-row w-full max-w-5xl bg-navy-950/20 backdrop-blur-3xl rounded-[3rem] border border-slate-800 shadow-2xl overflow-hidden">
        
        {/* Left Side: Premium Branding */}
        <div className="md:w-1/2 p-16 flex flex-col justify-between relative overflow-hidden bg-gradient-to-br from-navy-900 to-navy-950">
          <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-sky-500/10 rounded-full blur-3xl"></div>
          <div className="relative z-10">
             <div className="w-12 h-12 bg-sky-500 rounded-2xl mb-8 flex items-center justify-center text-white shadow-xl shadow-sky-500/20">
                <span className="font-black text-2xl">O</span>
             </div>
             <h1 className="text-6xl font-black text-white tracking-tighter leading-none mb-6">
                Opti<span className="text-sky-500">Office.</span>
             </h1>
             <p className="text-slate-400 text-lg font-medium max-w-sm leading-relaxed tracking-tight">
                The modern workplace command center. Streamline your velocity with premium bento aesthetics.
             </p>
          </div>
          
          <div className="relative z-10 pt-12 border-t border-slate-800/50 mt-12">
             <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-bold">2.4.1</div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center">Stable Release // Hub v1.0.4</div>
             </div>
          </div>
        </div>

        {/* Right Side: Stitched Form */}
        <div className="md:w-1/2 p-16 flex flex-col justify-center bg-white/5 dark:bg-transparent">
          <div className="max-w-md w-full mx-auto">
            <h2 className="text-3xl font-black text-white tracking-tighter mb-2">Welcome Back.</h2>
            <p className="text-slate-500 font-bold text-sm uppercase tracking-widest mb-10">Enter your credentials to continue</p>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Username / Email</label>
                <input
                  type="text"
                  className="w-full bg-navy-900/50 border border-slate-800 text-white rounded-2xl py-4 px-6 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all font-bold placeholder:text-slate-700"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  placeholder="admin@optiflow.com"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Secret Key</label>
                <input
                  type="password"
                  className="w-full bg-navy-900/50 border border-slate-800 text-white rounded-2xl py-4 px-6 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all font-bold placeholder:text-slate-700"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-sky-500 hover:bg-sky-400 active:scale-95 text-white font-black py-5 rounded-3xl transition-all shadow-2xl shadow-sky-500/30 flex items-center justify-center gap-3 mt-8 group"
              >
                {loading ? (
                    <span className="animate-spin border-4 border-white border-t-transparent rounded-full w-5 h-5"></span>
                ) : (
                    <>
                        <span className="text-xl">🔒</span>
                        <span>Unlock Workspace</span>
                    </>
                )}
              </button>
            </form>

            <div className="mt-12 text-center">
               <p className="text-[10px] font-bold text-slate-600 uppercase tracking-tighter">Protected by OptiShield™ 2048-bit encryption</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Login;
