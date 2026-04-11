import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getWorkshopApi, joinWorkshopApi } from "../services/workshopService";
import { toast } from "react-toastify";

export default function WorkshopDetails() {
  const { id } = useParams();
  const [w, setW] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await getWorkshopApi(id);
      setW(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const join = async () => {
    try {
      setJoining(true);
      await joinWorkshopApi(id);
      toast.success("Joined workshop");
      await load();
    } catch (e) {
      toast.error(e?.response?.data?.msg || "Failed to join");
    } finally {
      setJoining(false);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (!w) return null;

  const imgUrl = w.thumbnail
    ? (w.thumbnail.startsWith("http") ? w.thumbnail : `${import.meta.env.VITE_API_URL.replace(/\/api$/, "")}/uploads/${w.thumbnail}`)
    : null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {imgUrl && <img src={imgUrl} className="w-full h-56 object-cover rounded-2xl mb-6" alt="" />}
      <h1 className="text-3xl font-black">{w.title}</h1>
      <p className="text-gray-600 mt-2">{w.description}</p>
      <div className="mt-3 text-sm">
        <p>Category: <strong>{w.category}</strong></p>
        <p>Date: <strong>{new Date(w.date).toLocaleDateString()} {w.startTime}-{w.endTime}</strong></p>
        <p>Mentor: <strong>{w.mentor?.fullName}</strong></p>
        <p>Status: <span className="uppercase font-black text-indigo-600">{w.status}</span></p>
        <p>Seats: <strong>{w.joinedCount}/{w.maxParticipants}</strong></p>
      </div>
      <div className="mt-4 flex gap-2">
        <a href={w.meetingLink} target="_blank" rel="noreferrer" className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold">Join Link</a>
        <button onClick={join} disabled={joining} className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold disabled:opacity-50">
          {joining ? "Joining..." : "Register"}
        </button>
      </div>
    </div>
  );
}

