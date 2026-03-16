import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';

function Holidays({ token }) {
  const [holidays, setHolidays] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newHoliday, setNewHoliday] = useState({
    name: '', date: '', type: 'Public', description: ''
  });
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        const response = await apiClient.get('/holidays');
        setHolidays(response.data);

        const userRes = await apiClient.get('/users/me');
        setIsAdmin(userRes.data.role === 'admin');
      } catch (err) {
        console.error("Failed to fetch holidays", err);
      }
    };
    if (token) fetchHolidays();
  }, [token]);

  const handleInputChange = (e) => {
    setNewHoliday({ ...newHoliday, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await apiClient.post('/holidays', newHoliday);
      setHolidays([...holidays, response.data]);
      setShowForm(false);
      setNewHoliday({ name: '', date: '', type: 'Public', description: '' });
    } catch (err) {
      alert("Failed to add holiday: " + (err.response?.data?.detail || err.message));
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-[85vh] animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Holiday Calendar 2024</h2>
          <p className="text-slate-500 mt-1">Manage public and optional company holidays.</p>
        </div>
        {isAdmin && (
            <button 
              className="bg-action hover:bg-blue-600 text-white font-semibold py-2.5 px-5 rounded-xl transition-all shadow-md active:scale-95"
              onClick={() => setShowForm(!showForm)}
            >
                {showForm ? 'Cancel' : 'Add Holiday'}
            </button>
        )}
      </div>

      {showForm && (
        <form className="bg-white/70 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-slate-200 mb-8 animate-fade-in" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                <input className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white/50 focus:ring-2 focus:ring-action transition-all outline-none" name="name" placeholder="Holiday Name" value={newHoliday.name} onChange={handleInputChange} required />
                <input className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white/50 focus:ring-2 focus:ring-action transition-all outline-none" name="date" type="date" value={newHoliday.date} onChange={handleInputChange} required />
                <select className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white/50 focus:ring-2 focus:ring-action transition-all outline-none cursor-pointer" name="type" value={newHoliday.type} onChange={handleInputChange}>
                    <option value="Public">Public</option>
                    <option value="Optional">Optional</option>
                </select>
                <input className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white/50 focus:ring-2 focus:ring-action transition-all outline-none" name="description" placeholder="Description" value={newHoliday.description} onChange={handleInputChange} />
            </div>
            <div className="mt-5 flex justify-end">
              <button type="submit" className="bg-success hover:bg-emerald-600 text-white font-semibold py-2.5 px-6 rounded-xl transition-all shadow active:scale-95">Save Holiday</button>
            </div>
        </form>
      )}

      {holidays.length === 0 ? (
        <div className="bg-white/70 backdrop-blur-md rounded-2xl p-12 shadow-lg border border-slate-200 text-center">
          <p className="text-slate-500 text-lg">No holidays found for this tenant.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {holidays.map((holiday, index) => (
            <div key={index} className="bg-white/70 backdrop-blur-md rounded-2xl p-6 border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(59,130,246,0.1)] hover:scale-[1.02] transition-all duration-300 flex flex-col items-center text-center relative overflow-hidden group">
              <div className="absolute top-0 w-full h-2 bg-gradient-to-r from-action to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <div className="bg-slate-100 text-slate-800 rounded-xl p-3 px-6 mb-4 flex flex-col shadow-inner border border-slate-200/60">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{new Date(holiday.date).toLocaleString('default', { month: 'short' })}</span>
                <span className="text-3xl font-black">{new Date(holiday.date).getDate()}</span>
              </div>
              
              <div className="w-full flex-1">
                <h3 className="text-xl font-bold text-slate-800 mb-2 truncate" title={holiday.name}>{holiday.name}</h3>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase mb-3 ${holiday.type.toLowerCase() === 'public' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>
                  {holiday.type}
                </span>
                <p className="text-slate-500 text-sm line-clamp-2">{holiday.description || 'No description provided.'}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Holidays;
