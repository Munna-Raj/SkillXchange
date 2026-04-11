import React, { useEffect, useState } from "react";
import adminService from "../../services/adminService";

const AdminAssignments = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await adminService.getAssignmentsOverview();
        setData(res);
      } catch (err) {
        setError(err?.response?.data?.msg || "Failed to load assignment overview");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="p-6 text-center">Loading assignment overview...</div>;
  if (error) return <div className="p-6 text-center text-red-600">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border">
          <p className="text-sm text-gray-500">Total Assignments</p>
          <p className="text-2xl font-bold">{data?.totalAssignments || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border">
          <p className="text-sm text-gray-500">Total Submissions</p>
          <p className="text-2xl font-bold">{data?.totalSubmissions || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border">
          <p className="text-sm text-gray-500">Reviewed</p>
          <p className="text-2xl font-bold">{data?.reviewedSubmissions || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border">
          <p className="text-sm text-gray-500">Late Submissions</p>
          <p className="text-2xl font-bold">{data?.lateSubmissions || 0}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="px-4 py-3 border-b">
          <h3 className="font-semibold">Recent Assignments</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">Title</th>
                <th className="px-4 py-2 text-left">Group</th>
                <th className="px-4 py-2 text-left">Mentor</th>
                <th className="px-4 py-2 text-left">Due Date</th>
                <th className="px-4 py-2 text-left">Submissions</th>
              </tr>
            </thead>
            <tbody>
              {(data?.recentAssignments || []).map((a) => (
                <tr key={a._id} className="border-t">
                  <td className="px-4 py-2">{a.title}</td>
                  <td className="px-4 py-2">{a.groupId?.name || "-"}</td>
                  <td className="px-4 py-2">{a.mentorId?.fullName || "-"}</td>
                  <td className="px-4 py-2">{new Date(a.dueDate).toLocaleString()}</td>
                  <td className="px-4 py-2">{a.submissionsCount || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminAssignments;
