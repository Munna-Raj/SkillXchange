import { useEffect, useState } from "react";
import { listWorkshopsApi, createWorkshopApi, updateWorkshopApi, deleteWorkshopApi } from "../../services/workshopService";
import { toast } from "react-toastify";

export default function MentorWorkshops() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    title: "", description: "", category: "",
    date: "", startTime: "10:00", endTime: "11:00",
    meetingLink: "", maxParticipants: 50, thumbnail: ""
  });
  const [editingId, setEditingId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      // Filter by mentor self via role on server not implemented, so filter client-side for now
      const me = JSON.parse(localStorage.getItem("user") || "{}");
      const { data } = await listWorkshopsApi({});
      setList((data || []).filter(w => w.mentor?._id === (me.id || me._id)));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const save = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateWorkshopApi(editingId, form);
        toast.success("Workshop updated");
      } else {
        await createWorkshopApi(form);
        toast.success("Workshop created");
      }
      setForm({ title: "", description: "", category: "", date: "", startTime: "10:00", endTime: "11:00", meetingLink: "", maxParticipants: 50, thumbnail: "" });
      setEditingId(null);
      await load();
    } catch (e) {
      toast.error(e?.response?.data?.msg || "Failed");
    }
  };

  const edit = (w) => {
    setEditingId(w._id);
    setForm({
      title: w.title, description: w.description, category: w.category,
      date: new Date(w.date).toISOString().slice(0,10),
      startTime: w.startTime, endTime: w.endTime,
      meetingLink: w.meetingLink, maxParticipants: w.maxParticipants,
      thumbnail: w.thumbnail || ""
    });
  };

  const remove = async (id) => {
    if (!confirm("Delete workshop?")) return;
    try {
      await deleteWorkshopApi(id);
      toast.success("Deleted");
      await load();
    } catch (e) {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-black mb-4">Mentor Workshops</h1>
      <form onSubmit={save} className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-white p-4 rounded-2xl border mb-6">
        <input value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="Title" className="px-3 py-2 border rounded-xl" required />
        <input value={form.category} onChange={e=>setForm({...form,category:e.target.value})} placeholder="Category" className="px-3 py-2 border rounded-xl" required />
        <input type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})} className="px-3 py-2 border rounded-xl" required />
        <div className="flex gap-2">
          <input type="time" value={form.startTime} onChange={e=>setForm({...form,startTime:e.target.value})} className="px-3 py-2 border rounded-xl flex-1" required />
          <input type="time" value={form.endTime} onChange={e=>setForm({...form,endTime:e.target.value})} className="px-3 py-2 border rounded-xl flex-1" required />
        </div>
        <input value={form.meetingLink} onChange={e=>setForm({...form,meetingLink:e.target.value})} placeholder="Google Meet Link" className="px-3 py-2 border rounded-xl md:col-span-2" required />
        <input value={form.thumbnail} onChange={e=>setForm({...form,thumbnail:e.target.value})} placeholder="Thumbnail URL or filename" className="px-3 py-2 border rounded-xl md:col-span-2" />
        <textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="Description" className="px-3 py-2 border rounded-xl md:col-span-2" required />
        <input type="number" min="1" value={form.maxParticipants} onChange={e=>setForm({...form,maxParticipants:Number(e.target.value)})} className="px-3 py-2 border rounded-xl" />
        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold">{editingId ? "Update" : "Create"}</button>
      </form>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="grid gap-3">
          {list.map(w => (
            <div key={w._id} className="border rounded-2xl p-4 flex items-center justify-between">
              <div>
                <div className="font-bold">{w.title} <span className="text-xs uppercase text-indigo-600 font-black">({w.status})</span></div>
                <div className="text-xs text-gray-500">{new Date(w.date).toLocaleDateString()} {w.startTime}-{w.endTime} • Seats {w.joinedCount}/{w.maxParticipants}</div>
              </div>
              <div className="flex gap-2">
                <button onClick={()=>edit(w)} className="px-3 py-1 border rounded-lg">Edit</button>
                <button onClick={()=>remove(w._id)} className="px-3 py-1 border rounded-lg text-red-600">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

