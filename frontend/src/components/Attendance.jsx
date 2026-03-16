import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';

function Attendance({ token }) {
  const [records, setRecords] = useState([]);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [currentRecordId, setCurrentRecordId] = useState(null);

  useEffect(() => {
    if (token) fetchAttendance();
  }, [token]);

  const fetchAttendance = async () => {
    try {
      const response = await apiClient.get('/attendance/me');
      setRecords(response.data);

      const today = new Date().toISOString().split('T')[0];
      const todayRecord = response.data.find(r => r.date === today && !r.check_out);
      if (todayRecord) {
        setIsCheckedIn(true);
        setCurrentRecordId(todayRecord.id);
      }
    } catch (err) {
      console.error("Failed to fetch attendance", err);
    }
  };

  const handleCheckIn = async () => {
    try {
      const response = await apiClient.post('/attendance/check-in', {});
      setIsCheckedIn(true);
      setCurrentRecordId(response.data.id);
      fetchAttendance();
    } catch (err) {
      alert("Check-in failed");
    }
  };

  const handleCheckOut = async () => {
    try {
      await apiClient.put(`/attendance/check-out/${currentRecordId}`, {});
      setIsCheckedIn(false);
      setCurrentRecordId(null);
      fetchAttendance();
    } catch (err) {
      alert("Check-out failed");
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-[85vh] animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">My Attendance</h2>
          <p className="text-slate-500 mt-1">Track your daily clock-ins and clock-outs.</p>
        </div>
        <div className="flex">
          {isCheckedIn ? (
            <button 
              className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg active:scale-95 animate-pulse" 
              onClick={handleCheckOut}
            >
              Clock Out
            </button>
          ) : (
            <button 
              className="bg-success hover:bg-emerald-600 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg active:scale-95" 
              onClick={handleCheckIn}
            >
              Clock In
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {records.length === 0 ? (
          <div className="col-span-full bg-white/70 backdrop-blur-md rounded-2xl p-12 shadow-lg border border-slate-200 text-center">
            <p className="text-slate-500 text-lg">No attendance records found.</p>
          </div>
        ) : (
          records.map(record => (
            <div key={record.id} className="bg-white/70 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-slate-200 hover:scale-[1.02] transition-transform duration-200 flex flex-col justify-between relative overflow-hidden">
              <div className="flex justify-between items-start mb-6">
                 <div className="bg-slate-100 text-slate-800 rounded-xl p-2 px-4 shadow-inner border border-slate-200/60 flex flex-col items-center">
                   <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{new Date(record.date).toLocaleString('default', { month: 'short' })}</span>
                   <span className="text-2xl font-black">{new Date(record.date).getDate()}</span>
                 </div>
                 <span className={`inline-block px-3 py-1 text-xs font-bold uppercase rounded-full ${record.status === 'Present' ? 'bg-emerald-100 text-emerald-700' : record.status === 'Late' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                   {record.status}
                 </span>
              </div>
              
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex flex-col gap-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-semibold text-slate-500">In:</span>
                  <span className="font-bold text-slate-800">{new Date(record.check_in).toLocaleTimeString()}</span>
                </div>
                {record.check_out && (
                  <div className="flex justify-between items-center text-sm pt-2 border-t border-slate-200/60">
                    <span className="font-semibold text-slate-500">Out:</span>
                    <span className="font-bold text-slate-800">{new Date(record.check_out).toLocaleTimeString()}</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Attendance;
