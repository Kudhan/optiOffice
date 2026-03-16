import React, { useState } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

function Login({ setToken }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post(`${API_URL}/token`, {
        username,
        password
      });
      setToken(response.data.access_token);
    } catch (err) {
      setError('Invalid username or password');
      console.error(err);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 items-center justify-center p-4">
      <div className="flex flex-col md:flex-row w-full max-w-4xl bg-white shadow-2xl rounded-3xl overflow-hidden border border-slate-100">
        
        {/* Left Side: Branding/Visual */}
        <div className="md:w-1/2 bg-slate-900 text-white p-12 flex flex-col justify-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-action to-transparent"></div>
          <div className="relative z-10">
            <h1 className="mb-4"><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 font-extrabold text-5xl tracking-tighter drop-shadow-lg">OptiOffice</span></h1>
            <p className="text-slate-400 text-lg">Streamline your workforce. Manage tasks, leaves, and assets from one perfectly stitched bento aesthetic.</p>
          </div>
        </div>

        {/* Right Side: Glassmorphism Form */}
        <div className="md:w-1/2 p-12 bg-white/60 backdrop-blur-xl flex flex-col justify-center">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">Welcome Back</h2>
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-2">Username</label>
              <input
                type="text"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-action focus:border-transparent transition-all"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="Enter your username"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-2">Password</label>
              <input
                type="password"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-action focus:border-transparent transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="bg-red-100 text-red-700 p-3 rounded-lg text-sm font-medium border border-red-200">
                {error}
              </div>
            )}

            <button 
              type="submit" 
              className="mt-4 w-full bg-action hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-all transform hover:scale-[1.02] animate-pulse"
            >
              Sign In
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}

export default Login;
