import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import adminService from '../../services/adminService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const AdminPlaceholder = ({ title }) => {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
        <div className="bg-white p-10 rounded-xl shadow-sm border border-gray-100 text-center">
          <h2 className="text-xl font-medium text-gray-600">This page is under construction</h2>
          <p className="text-gray-400 mt-2">Check back soon for {title} management features.</p>
        </div>
      </main>
    </div>
  );
};

export const AdminSkills = () => {
  const navigate = useNavigate();
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      setLoading(true);
      const data = await adminService.getSkills();
      setSkills(data);
    } catch (err) {
      console.error("Failed to fetch skills:", err);
      setError("Failed to load skills.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (skillId, ownerId, type) => {
    if (!window.confirm("Are you sure you want to delete this skill?")) return;

    try {
      await adminService.deleteSkill(skillId, ownerId, type);
      setSkills(skills.filter(s => !(s.id === skillId && s.ownerId === ownerId && s.type === type)));
    } catch (err) {
      console.error("Failed to delete skill:", err);
      alert("Failed to delete skill.");
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <main className="flex-1 overflow-x-hidden overflow-y-auto">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Skill Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-10 text-center text-gray-500">Loading skills...</td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-10 text-center text-red-500">{error}</td>
                  </tr>
                ) : skills.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-10 text-center text-gray-500">No skills found.</td>
                  </tr>
                ) : (
                  skills.map((skill, index) => (
                    <tr key={`${skill.id}-${index}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{skill.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{skill.category}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          skill.type === 'teach' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {skill.type === 'teach' ? 'Teaching' : 'Learning'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button
                          onClick={() => navigate(`/user/${skill.ownerId}`)}
                          className="text-indigo-600 hover:text-indigo-900 font-medium hover:underline"
                        >
                          {skill.ownerName}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {skill.level}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                        <button 
                          onClick={() => navigate(`/user/${skill.ownerId}`)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          View Profile
                        </button>
                        <button 
                          onClick={() => handleDelete(skill.id, skill.ownerId, skill.type)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};
export const AdminRequests = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await adminService.getRequests();
      setRequests(data);
    } catch (err) {
      console.error("Failed to fetch requests:", err);
      setError("Failed to load requests.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (requestId) => {
    if (!window.confirm("Are you sure you want to delete this request?")) return;

    try {
      await adminService.deleteRequest(requestId);
      setRequests(requests.filter(r => r._id !== requestId));
    } catch (err) {
      console.error("Failed to delete request:", err);
      alert("Failed to delete request.");
    }
  };

  // Process data for bar graph
  const getStatusData = () => {
    const statusCounts = {
      pending: 0,
      accepted: 0,
      rejected: 0
    };
    
    requests.forEach(r => {
      if (statusCounts[r.status] !== undefined) {
        statusCounts[r.status]++;
      }
    });

    return [
      { name: 'Pending', count: statusCounts.pending, color: '#FBBF24' }, // Amber-400
      { name: 'Accepted', count: statusCounts.accepted, color: '#10B981' }, // Emerald-500
      { name: 'Rejected', count: statusCounts.rejected, color: '#EF4444' } // Red-500
    ];
  };

  const chartData = getStatusData();

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <main className="flex-1 overflow-x-hidden overflow-y-auto">
        {/* Stats Section with Bar Graph */}
        <div className="mb-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Request Status Distribution</h2>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip 
                    cursor={{ fill: '#f3f4f6' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={60}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center">
            <h2 className="text-lg font-semibold text-gray-700 mb-6 text-center">Summary</h2>
            <div className="space-y-4">
              {chartData.map((status) => (
                <div key={status.name} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: status.color }}></div>
                    <span className="text-sm font-medium text-gray-600">{status.name}</span>
                  </div>
                  <span className="text-lg font-bold text-gray-800">{status.count}</span>
                </div>
              ))}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-sm font-bold text-gray-700">Total Requests</span>
                <span className="text-xl font-extrabold text-indigo-600">{requests.length}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sender</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Receiver</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teach Skill</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Learn Skill</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-10 text-center text-gray-500">Loading requests...</td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-10 text-center text-red-500">{error}</td>
                  </tr>
                ) : requests.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-10 text-center text-gray-500">No requests found.</td>
                  </tr>
                ) : (
                  requests.map((request) => (
                    <tr key={request._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{request.senderId?.fullName || "Unknown User"}</div>
                        <div className="text-xs text-gray-500">{request.senderId?.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{request.receiverId?.fullName || "Unknown User"}</div>
                        <div className="text-xs text-gray-500">{request.receiverId?.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {request.teachSkill}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {request.learnSkill}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          request.status === 'accepted' ? 'bg-green-100 text-green-800' : 
                          request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'
                        }`}>
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                        <button 
                          onClick={() => handleDelete(request._id)}
                          className="text-red-600 hover:text-red-900 transition-colors"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};
export const AdminReports = () => <AdminPlaceholder title="Reports" />;
