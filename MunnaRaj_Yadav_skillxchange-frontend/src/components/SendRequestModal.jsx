import React, { useState } from "react";
import { sendRequestApi } from "../services/requestService";

const SendRequestModal = ({ isOpen, onClose, receiver, currentUserSkills }) => {
  if (!isOpen) return null;

  const [teachSkill, setTeachSkill] = useState("");
  const [learnSkill, setLearnSkill] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await sendRequestApi({
        receiverId: receiver._id,
        teachSkill,
        learnSkill,
      });
      setSuccess("Request sent successfully!");
      setTimeout(() => {
        onClose();
        setSuccess("");
        setTeachSkill("");
        setLearnSkill("");
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to send request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-indigo-600 p-4 text-white flex justify-between items-center">
          <h3 className="text-lg font-bold">Exchange Request</h3>
          <button onClick={onClose} className="text-white/80 hover:text-white text-xl">
            &times;
          </button>
        </div>

        <div className="p-6">
          <div className="mb-4 flex items-center gap-3">
            <img
              src={receiver.profilePic ? `http://localhost:5000/uploads/${receiver.profilePic}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(receiver.fullName)}&background=random`}
              alt={receiver.fullName}
              className="w-12 h-12 rounded-full object-cover border border-gray-200"
            />
            <div>
              <p className="text-sm text-gray-500">Sending to</p>
              <p className="font-bold text-gray-900">{receiver.fullName}</p>
            </div>
          </div>

          {error && <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">{error}</div>}
          {success && <div className="mb-4 p-3 bg-green-50 text-green-700 text-sm rounded-lg border border-green-200">{success}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {(!currentUserSkills || currentUserSkills.length === 0) && (
               <div className="p-3 bg-yellow-50 text-yellow-800 text-sm rounded-lg border border-yellow-200 mb-4">
                 You haven't added any skills to teach yet. Please update your profile to send requests.
               </div>
            )}

            {/* I want to learn... (Receiver's teach skills) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                I want to learn from {receiver.fullName.split(" ")[0]}
              </label>
              <select
                value={learnSkill}
                onChange={(e) => setLearnSkill(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              >
                <option value="">Select a skill...</option>
                {receiver.skillsToTeach?.map((skill, idx) => (
                  <option key={idx} value={skill.name}>
                    {skill.name} ({skill.level})
                  </option>
                ))}
              </select>
            </div>

            {/* I can teach... (My teach skills) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                I can teach {receiver.fullName.split(" ")[0]}
              </label>
              <select
                value={teachSkill}
                onChange={(e) => setTeachSkill(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              >
                <option value="">Select a skill...</option>
                {currentUserSkills?.map((skill, idx) => (
                  <option key={idx} value={skill.name}>
                    {skill.name} ({skill.level})
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-4 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-70"
                disabled={loading}
              >
                {loading ? "Sending..." : "Send Request"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SendRequestModal;
