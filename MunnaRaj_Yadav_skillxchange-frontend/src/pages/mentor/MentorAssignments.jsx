import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Navbar from "../../components/Navbar";

const MentorAssignments = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/groups`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.msg || "Failed to load groups");
        const me = JSON.parse(localStorage.getItem("user") || "{}");
        setGroups(data.filter((g) => g.mentor?._id === me.id));
      } catch (err) {
        toast.error(err.message || "Failed to load mentor groups");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar pageTitle="Assignment Portal" />
      <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4 dark:text-white">Assignments by group</h1>
        {loading ? (
          <p className="dark:text-white">Loading groups...</p>
        ) : groups.length === 0 ? (
          <p className="text-gray-500">You do not mentor any group yet.</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {groups.map((group) => (
              <button
                key={group._id}
                onClick={() => navigate(`/groups/${group._id}/assignments`)}
                className="text-left bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700"
              >
                <p className="font-bold dark:text-white">{group.name}</p>
                <p className="text-sm text-gray-500 mt-1">{group.members?.length || 0} members</p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MentorAssignments;
