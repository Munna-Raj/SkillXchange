import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import adminService from '../../services/adminService';
import api from '../../services/api';

const SessionManagement = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedSession, setSelectedSession] = useState(null);
  const [sessionAttendance, setSessionAttendance] = useState([]);
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSessions();
  }, [statusFilter, dateFilter]);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const data = await adminService.getSessions({
        status: statusFilter,
        date: dateFilter,
        search: searchTerm
      });
      setSessions(data);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      toast.error('Failed to fetch sessions');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchSessions();
  };

  const fetchSessionDetails = async (session) => {
    setSelectedSession(session);
    setLoadingAttendance(true);
    try {
      const res = await api.get(`/attendance/session/${session._id}`);
      setSessionAttendance(res.data);
    } catch (error) {
      console.error('Error fetching attendance:', error);
      toast.error('Failed to fetch attendance details');
    } finally {
      setLoadingAttendance(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      upcoming: 'bg-blue-100 text-blue-800',
      active: 'bg-green-100 text-green-800',
      completed: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || styles.upcoming}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Session Management</h1>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-wrap gap-4 items-center justify-between">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-[300px]">
          <input
            type="text"
            placeholder="Search by creator or group name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
          />
          <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
            Search
          </button>
        </form>

        <div className="flex gap-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
          >
            <option value="">All Statuses</option>
            <option value="upcoming">Upcoming</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
          />
          
          {(statusFilter || dateFilter || searchTerm) && (
            <button 
              onClick={() => { setStatusFilter(''); setDateFilter(''); setSearchTerm(''); fetchSessions(); }}
              className="px-4 py-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Sessions Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500">
                <th className="p-4 font-medium">Session Title</th>
                <th className="p-4 font-medium">Type</th>
                <th className="p-4 font-medium">Created By</th>
                <th className="p-4 font-medium">Creator Role</th>
                <th className="p-4 font-medium">Schedule</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Attendance</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-gray-500">Loading sessions...</td>
                </tr>
              ) : sessions.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-gray-500">No sessions found matching your criteria.</td>
                </tr>
              ) : (
                sessions.map((session) => (
                  <tr key={session._id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <p className="font-semibold text-gray-800">
                        {session.title || (session.isGroupSession ? session.groupId?.name : "1-on-1 Session")}
                      </p>
                      <p className="text-xs text-gray-500 truncate max-w-[200px]">{session._id}</p>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${session.isGroupSession ? 'bg-purple-100 text-purple-800' : 'bg-teal-100 text-teal-800'}`}>
                        {session.isGroupSession ? 'Group' : '1-on-1'}
                      </span>
                    </td>
                    <td className="p-4">
                      <p className="text-sm font-medium text-gray-800">{session.createdBy?.fullName || 'Unknown'}</p>
                    </td>
                    <td className="p-4">
                      <p className="text-xs text-gray-500 capitalize">{session.createdBy?.role || 'User'}</p>
                    </td>
                    <td className="p-4">
                      <p className="text-sm text-gray-800">{new Date(session.startDate).toLocaleDateString()}</p>
                      <p className="text-xs text-gray-500">{session.timeSlot}</p>
                    </td>
                    <td className="p-4">
                      {getStatusBadge(session.status)}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-full bg-gray-200 rounded-full h-2 max-w-[60px]">
                          <div 
                            className="bg-indigo-600 h-2 rounded-full" 
                            style={{ width: `${Math.min(100, (session.attendanceCount / (session.users?.length || 1)) * 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-medium text-gray-600">
                          {session.attendanceCount} / {session.users?.length || 0}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => fetchSessionDetails(session)}
                        className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Session Details Modal */}
      {selectedSession && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-scaleIn">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-gray-50">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedSession.isGroupSession ? selectedSession.groupId?.name : "1-on-1 Session Details"}
                  </h2>
                  {getStatusBadge(selectedSession.status)}
                </div>
                <p className="text-sm text-gray-500">
                  Created on {new Date(selectedSession.createdAt).toLocaleDateString()} by <span className="font-medium text-gray-700">{selectedSession.createdBy?.fullName}</span>
                </p>
              </div>
              <button 
                onClick={() => setSelectedSession(null)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Info Cards */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Creator</p>
                  <p className="font-semibold text-gray-900">{selectedSession.createdBy?.fullName}</p>
                  <p className="text-sm text-gray-700">{selectedSession.createdBy?.email}</p>
                  <p className="text-xs text-gray-500 capitalize">{selectedSession.createdBy?.role}</p>
                </div>
                <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                  <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1">Schedule</p>
                  <p className="font-semibold text-indigo-900">{new Date(selectedSession.startDate).toLocaleDateString()}</p>
                  <p className="text-sm text-indigo-700">{selectedSession.timeSlot}</p>
                </div>
                <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                  <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">Meeting Link</p>
                  <a href={selectedSession.meetLink} target="_blank" rel="noreferrer" className="font-semibold text-emerald-700 hover:underline truncate block">
                    {selectedSession.meetLink}
                  </a>
                </div>
                <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
                  <p className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">Total Invited</p>
                  <p className="text-2xl font-black text-amber-700">{selectedSession.users?.length || 0}</p>
                </div>
              </div>

              {/* Attendance Section */}
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Attendance Log</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                    <p className="text-xs font-bold text-green-400 uppercase tracking-wider mb-1">Total Joined</p>
                    <p className="text-2xl font-black text-green-700">{sessionAttendance.length}</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                    <p className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">Attendance Rate</p>
                    <p className="text-2xl font-black text-blue-700">
                      {selectedSession.users?.length > 0
                        ? `${Math.round((sessionAttendance.length / selectedSession.users.length) * 100)}%`
                        : 'N/A'}
                    </p>
                  </div>
                </div>
                
                {loadingAttendance ? (
                  <div className="py-8 text-center text-gray-500">Loading attendance records...</div>
                ) : sessionAttendance.length === 0 ? (
                  <div className="py-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <p className="text-gray-500">No users have joined this session yet.</p>
                  </div>
                ) : (
                  <div className="border border-gray-100 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-gray-50 text-gray-500">
                        <tr>
                          <th className="p-3 font-medium">User</th>
                          <th className="p-3 font-medium">Join Time</th>
                          <th className="p-3 font-medium">Leave Time</th>
                          <th className="p-3 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {sessionAttendance.map(record => (
                          <tr key={record._id} className="hover:bg-gray-50">
                            <td className="p-3">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold overflow-hidden">
                                  {record.userId?.profilePic ? (
                                    <img src={`http://localhost:5000/uploads/${record.userId.profilePic}`} alt="" className="w-full h-full object-cover" />
                                  ) : (
                                    record.userId?.fullName?.charAt(0) || 'U'
                                  )}
                                </div>
                                <div>
                                  <p className="font-medium text-gray-800">{record.userId?.fullName}</p>
                                  <p className="text-xs text-gray-500">{record.userId?.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="p-3 text-gray-600">
                              {new Date(record.joinTime).toLocaleString()}
                            </td>
                            <td className="p-3 text-gray-600">
                              {record.leaveTime ? new Date(record.leaveTime).toLocaleString() : '-'}
                            </td>
                            <td className="p-3">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${record.status === 'joined' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                                {record.status === 'joined' ? 'Active' : 'Left'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionManagement;
