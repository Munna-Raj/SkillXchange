import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import adminService from '../../services/adminService';

const AdminPlaceholder = ({ title }) => {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <header className="flex justify-between items-center py-4 px-6 bg-white shadow-sm">
        <h1 className="text-2xl font-semibold text-gray-800">{title}</h1>
      </header>
      <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
      
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
      <header className="flex justify-between items-center py-4 px-6 bg-white shadow-sm">
        <h1 className="text-2xl font-semibold text-gray-800">Skills Management</h1>
      </header>
      
      <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
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
export const AdminRequests = () => <AdminPlaceholder title="Requests" />;
export const AdminReports = () => <AdminPlaceholder title="Reports" />;
