import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchTours,
  createTour,
  updateTour,
  deleteTour,
} from "../../store/slices/tourSlice";
import Loader from "../../components/common/Loader";
import { formatPrice } from "../../utils/helpers";
import { toast } from "react-toastify";
import { FiPlus, FiEdit2, FiTrash2, FiX } from "react-icons/fi";

const emptyForm = {
  title: "",
  description: "",
  destination: "",
  price: "",
  duration_days: "",
  max_group_size: 10,
  difficulty: "easy",
  image: null,
};

const ManageTours = () => {
  const dispatch = useDispatch();
  const { tours, loading } = useSelector((s) => s.tours);

  const [showModal, setShowModal] = useState(false);
  const [editingTour, setEditingTour] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchTours({ limit: 100 }));
  }, [dispatch]);

  const openAdd = () => {
    setEditingTour(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (tour) => {
    setEditingTour(tour);
    setForm({
      title: tour.title,
      description: tour.description,
      destination: tour.destination,
      price: tour.price,
      duration_days: tour.duration_days,
      max_group_size: tour.max_group_size,
      difficulty: tour.difficulty,
      image: null,
    });
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      setForm({ ...form, image: files[0] });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (v !== null && v !== "") fd.append(k, v);
    });

    try {
      if (editingTour) {
        await dispatch(updateTour({ id: editingTour.id, formData: fd })).unwrap();
        toast.success("Tour updated");
      } else {
        await dispatch(createTour(fd)).unwrap();
        toast.success("Tour created successfully");
      }
      setShowModal(false);
      dispatch(fetchTours({ limit: 100 }));
    } catch (err) {
      toast.error(err || "Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to deactivate this tour?")) return;
    try {
      await dispatch(deleteTour(id)).unwrap();
      toast.success("Tour deactivated");
    } catch (err) {
      toast.error(err || "Failed to deactivate");
    }
  };

  const diffCls = {
    easy:     "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    moderate: "bg-amber-500/10 text-amber-500 border border-amber-500/20",
    hard:     "bg-rose-500/10 text-rose-500 border border-rose-500/20",
  };

  return (
    <div className="bg-[#09090b] min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 mb-10">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Manage Tours</h1>
            <p className="text-zinc-400 mt-2 text-sm">{tours.length} active packages</p>
          </div>
          <button
            onClick={openAdd}
            className="bg-white text-black text-sm px-5 py-2.5 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-zinc-200 transition-colors w-fit"
          >
            <FiPlus size={16} /> Add New Tour
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader /></div>
        ) : (
          <div className="bg-[#0a0a0a] rounded-2xl border border-white/5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead className="text-[11px] uppercase tracking-wider font-semibold text-zinc-500 bg-zinc-900/50 border-b border-white/5">
                  <tr>
                    <th className="px-6 py-4 text-left">Tour Details</th>
                    <th className="px-6 py-4 text-left">Destination</th>
                    <th className="px-6 py-4 text-left">Price</th>
                    <th className="px-6 py-4 text-left">Duration</th>
                    <th className="px-6 py-4 text-center">Difficulty</th>
                    <th className="px-6 py-4 text-center">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {tours.map((tour) => (
                    <tr key={tour.id} className="hover:bg-zinc-900/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-medium text-white max-w-[200px] truncate">{tour.title}</div>
                      </td>
                      <td className="px-6 py-4 text-zinc-400">{tour.destination}</td>
                      <td className="px-6 py-4 font-medium text-white">
                        {formatPrice(tour.price)}
                      </td>
                      <td className="px-6 py-4 text-zinc-400">{tour.duration_days} days</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded inline-block border ${diffCls[tour.difficulty]}`}>
                          {tour.difficulty}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded inline-block border ${tour.is_active ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-rose-500/10 text-rose-500 border-rose-500/20"}`}>
                          {tour.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEdit(tour)}
                            className="p-1.5 text-zinc-400 hover:text-white transition-colors"
                            title="Edit Tour"
                          >
                            <FiEdit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(tour.id)}
                            className="p-1.5 text-zinc-400 hover:text-rose-500 transition-colors"
                            title="Deactivate Tour"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Editor Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-[#09090b]/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0a0a0a] rounded-2xl border border-white/5 w-full max-w-2xl overflow-hidden flex flex-col shadow-2xl max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between shrink-0">
              <h2 className="text-xl font-bold text-white">
                {editingTour ? "Edit Tour Configuration" : "Create New Tour"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                <FiX size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto p-6 custom-scrollbar flex-1">
              <form id="tour-form" onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="sm:col-span-2 space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Tour Title *</label>
                    <input
                      name="title" value={form.title} onChange={handleChange} required
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-zinc-500 transition-colors text-sm"
                      placeholder="e.g. The Grand Alpine Expedition"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Destination *</label>
                    <input
                      name="destination" value={form.destination} onChange={handleChange} required
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-zinc-500 transition-colors text-sm"
                      placeholder="e.g. Zurich, Switzerland"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Price (₹) *</label>
                    <input
                      type="number" name="price" value={form.price} onChange={handleChange} required min="0"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-zinc-500 transition-colors text-sm"
                      placeholder="18000"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Duration (Days) *</label>
                    <input
                      type="number" name="duration_days" value={form.duration_days} onChange={handleChange} required min="1"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-zinc-500 transition-colors text-sm"
                      placeholder="7"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Max Group Size</label>
                    <input
                      type="number" name="max_group_size" value={form.max_group_size} onChange={handleChange} min="1"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-zinc-500 transition-colors text-sm"
                      placeholder="12"
                    />
                  </div>
                  <div className="sm:col-span-2 space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Difficulty Level</label>
                    <div className="inline-block relative w-full sm:w-1/2">
                       <select
                          name="difficulty" value={form.difficulty} onChange={handleChange}
                          className="appearance-none w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-zinc-500 transition-colors text-sm cursor-pointer"
                        >
                          <option value="easy">Easy Pace</option>
                          <option value="moderate">Moderate Activity</option>
                          <option value="hard">Challenging/Hard</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-zinc-500">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                        </div>
                    </div>
                  </div>
                  <div className="sm:col-span-2 space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Detailed Description *</label>
                    <textarea
                      name="description" value={form.description} onChange={handleChange} required rows={4}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-zinc-500 transition-colors text-sm resize-none"
                      placeholder="Craft an inspiring narrative about this journey..."
                    />
                  </div>
                  <div className="sm:col-span-2 space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                      Hero Image {editingTour && <span className="font-normal normal-case ml-1">(Leave empty to keep current)</span>}
                    </label>
                    <input
                      type="file" name="image" accept="image/*" onChange={handleChange}
                      className="w-full border border-zinc-800 bg-zinc-900 text-zinc-400 rounded-lg px-3 py-2 text-sm file:mr-4 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-white file:text-black hover:file:bg-zinc-200 transition-colors cursor-pointer"
                    />
                  </div>
                </div>
              </form>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-white/5 shrink-0 flex items-center justify-end gap-3 bg-[#0a0a0a]">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-5 py-2.5 rounded-lg font-medium text-sm text-zinc-300 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                form="tour-form"
                type="submit"
                disabled={submitting}
                className="bg-white text-black px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-zinc-200 transition-colors disabled:opacity-50"
              >
                {submitting ? "Processing..." : editingTour ? "Save Changes" : "Publish Tour"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageTours;