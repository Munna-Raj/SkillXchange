import { useEffect, useState } from "react";
import { listWorkshopsApi } from "../services/workshopService";
import { Link } from "react-router-dom";

export default function Workshops() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await listWorkshopsApi({ q, category, status });
      setItems(data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []); // initial

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-gray-900">Workshops</h1>
        <Link to="/mentor/workshops" className="text-sm font-bold text-indigo-600 hover:underline">
          Manage (Mentor)
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search title..."
          className="px-3 py-2 border rounded-xl"
        />
        <input
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="Category"
          className="px-3 py-2 border rounded-xl"
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="px-3 py-2 border rounded-xl">
          <option value="">All Status</option>
          <option value="upcoming">Upcoming</option>
          <option value="ongoing">Ongoing</option>
          <option value="completed">Completed</option>
        </select>
        <button onClick={load} className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold">
          Apply
        </button>
      </div>

      {loading ? (
        <div className="text-gray-500">Loading...</div>
      ) : items.length === 0 ? (
        <div className="text-gray-500">No workshops found.</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((w) => (
            <Link key={w._id} to={`/workshops/${w._id}`} className="border rounded-2xl p-4 hover:shadow">
              {w.thumbnail && (
                <img
                  src={w.thumbnail.startsWith("http") ? w.thumbnail : `${import.meta.env.VITE_API_URL.replace(/\/api$/, "")}/uploads/${w.thumbnail}`}
                  alt={w.title}
                  className="w-full h-36 object-cover rounded-xl mb-3"
                />
              )}
              <h3 className="font-bold">{w.title}</h3>
              <p className="text-xs text-gray-500">{w.category} • {new Date(w.date).toLocaleDateString()} • {w.startTime}</p>
              <p className="text-xs mt-1">Seats: {w.joinedCount}/{w.maxParticipants} • <span className="uppercase text-indigo-600 font-black">{w.status}</span></p>
              <p className="text-xs text-gray-600 mt-2 line-clamp-2">{w.description}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

