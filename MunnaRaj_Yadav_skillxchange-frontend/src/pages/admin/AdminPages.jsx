import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import adminService from '../../services/adminService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

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
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100 min-w-0">
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
export const AdminReports = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const res = await adminService.getReportsData();
      setData(res);
    } catch (err) {
      console.error("Failed to fetch report data:", err);
      setError("Failed to load reports.");
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = () => {
    if (!data) return;

    const doc = new jsPDF();
    const date = new Date().toLocaleDateString();
    const safeDate = new Date().toISOString().slice(0, 10);

    // Title
    doc.setFontSize(22);
    doc.text("SkillXchange Platform Report", 14, 20);
    doc.setFontSize(12);
    doc.text(`Generated on: ${date}`, 14, 30);

    // Summary Section
    doc.setFontSize(16);
    doc.text("Platform Summary", 14, 45);
    
    const summaryData = [
      ["Metric", "Value"],
      ["Total Users", data.summary.totalUsers],
      ["Total Requests", data.summary.totalRequests],
      ["Accepted Requests", data.summary.acceptedRequests],
      ["Pending Requests", data.summary.pendingRequests],
      ["Rejected Requests", data.summary.rejectedRequests],
      ["Recent Signups (30 days)", data.summary.recentSignups],
    ];

    autoTable(doc, {
      startY: 50,
      head: [summaryData[0]],
      body: summaryData.slice(1),
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229] } // Indigo-600
    });

    // Popular Skills Section
    const finalY = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 15 : 80;
    doc.setFontSize(16);
    doc.text("Most Popular Skills (Teaching)", 14, finalY);

    const skillsData = data.popularSkills.length
      ? data.popularSkills.map(s => [s.name, s.count])
      : [["No skills data", 0]];
    
    autoTable(doc, {
      startY: finalY + 5,
      head: [["Skill Name", "Count"]],
      body: skillsData,
      theme: 'striped',
      headStyles: { fillColor: [16, 185, 129] } // Emerald-500
    });

    doc.save(`SkillXchange_Report_${safeDate}.pdf`);
  };

  if (loading) return <div className="p-6 text-center">Loading report data...</div>;
  if (error) return <div className="p-6 text-center text-red-500">{error}</div>;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Platform Analytics</h2>
            <p className="text-gray-500">Comprehensive overview of platform activity and growth.</p>
          </div>
          <button
            onClick={downloadPDF}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/30"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download PDF Report
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-sm font-medium text-gray-500 mb-1">Total Platform Users</p>
            <h3 className="text-3xl font-bold text-gray-900">{data.summary.totalUsers}</h3>
            <div className="mt-2 flex items-center text-xs text-green-600 font-medium">
              <span>+{data.summary.recentSignups} in last 30 days</span>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-sm font-medium text-gray-500 mb-1">Exchange Success Rate</p>
            <h3 className="text-3xl font-bold text-gray-900">
              {data.summary.totalRequests > 0 
                ? Math.round((data.summary.acceptedRequests / data.summary.totalRequests) * 100) 
                : 0}%
            </h3>
            <div className="mt-2 flex items-center text-xs text-gray-400">
              <span>{data.summary.acceptedRequests} of {data.summary.totalRequests} requests accepted</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-sm font-medium text-gray-500 mb-1">Active Exchanges</p>
            <h3 className="text-3xl font-bold text-indigo-600">{data.summary.pendingRequests}</h3>
            <div className="mt-2 flex items-center text-xs text-gray-400">
              <span>Currently awaiting response</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-6">Popular Skills to Teach</h3>
            <div className="space-y-4">
              {data.popularSkills.map((skill, idx) => (
                <div key={idx} className="flex flex-col gap-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-semibold text-gray-700">{skill.name}</span>
                    <span className="text-gray-500">{skill.count} users</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 rounded-full" 
                      style={{ width: `${(skill.count / data.summary.totalUsers) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Detailed Monthly Report</h3>
            <p className="text-gray-500 mb-6 max-w-xs">Download a comprehensive PDF containing all platform metrics, user growth, and skill trends.</p>
            <button
              onClick={downloadPDF}
              className="w-full py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-colors"
            >
              Export as PDF
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};
