import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Navbar from "../components/Navbar";
import {
  createAssignmentApi,
  deleteAssignmentApi,
  getAssignmentsByGroupApi,
  getAssignmentSubmissionsApi,
  resubmitAssignmentApi,
  reviewSubmissionApi,
  submitAssignmentApi,
  updateAssignmentApi,
} from "../services/assignmentService";

const uploadRoot = (() => {
  let baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
  if (baseUrl.endsWith("/api")) baseUrl = baseUrl.replace("/api", "");
  return baseUrl;
})();

/** Styled box around file input: click to choose, shows selected or existing filename */
function FilePickBox({ label, value, onChange, existingFileName, inputId }) {
  const inputRef = useRef(null);
  const summary =
    value?.name ||
    (existingFileName ? `Current file: ${existingFileName}` : "No file selected — click the box or button");

  return (
    <div className="space-y-1">
      {label ? (
        <p className="text-xs font-medium text-gray-600 dark:text-gray-400">{label}</p>
      ) : null}
      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onClick={() => inputRef.current?.click()}
        className="flex min-h-[92px] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50/90 px-4 py-4 text-center transition hover:border-indigo-400 hover:bg-indigo-50/60 dark:border-gray-600 dark:bg-gray-900/50 dark:hover:border-indigo-500 dark:hover:bg-indigo-950/40"
      >
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          className="sr-only"
          onChange={(e) => onChange(e.target.files?.[0] || null)}
        />
        <span className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm">
          Choose file
        </span>
        <span className="max-w-full break-all px-2 text-xs text-gray-600 dark:text-gray-400">{summary}</span>
      </div>
    </div>
  );
}

const GroupAssignments = () => {
  const { id: groupId } = useParams();
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const role = localStorage.getItem("role");
  const isMentorOrAdmin = role === "mentor" || role === "admin";

  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState("");
  const [submissions, setSubmissions] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    instructions: "",
    dueDate: "",
    file: null,
  });
  const [submissionText, setSubmissionText] = useState("");
  const [submissionFile, setSubmissionFile] = useState(null);

  const selectedAssignment = useMemo(
    () => assignments.find((a) => a._id === selectedAssignmentId),
    [assignments, selectedAssignmentId]
  );

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const data = await getAssignmentsByGroupApi(groupId);
      setAssignments(data);
      if (data.length && !selectedAssignmentId) setSelectedAssignmentId(data[0]._id);
    } catch (err) {
      toast.error(err?.response?.data?.msg || "Failed to load assignments");
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmissions = async (assignmentId) => {
    if (!isMentorOrAdmin || !assignmentId) return;
    try {
      const data = await getAssignmentSubmissionsApi(assignmentId);
      setSubmissions(data);
    } catch (err) {
      toast.error(err?.response?.data?.msg || "Failed to load submissions");
      setSubmissions([]);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, [groupId]);

  useEffect(() => {
    fetchSubmissions(selectedAssignmentId);
  }, [selectedAssignmentId, isMentorOrAdmin]);

  const resetForm = () => {
    setForm({ title: "", description: "", instructions: "", dueDate: "", file: null });
    setEditing(null);
    setShowForm(false);
  };

  const openEdit = (a) => {
    setEditing(a);
    setForm({
      title: a.title || "",
      description: a.description || "",
      instructions: a.instructions || "",
      dueDate: a.dueDate ? new Date(a.dueDate).toISOString().slice(0, 16) : "",
      file: null,
    });
    setShowForm(true);
  };

  const onSaveAssignment = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, groupId };
      if (editing) {
        await updateAssignmentApi(editing._id, payload);
        toast.success("Assignment updated");
      } else {
        await createAssignmentApi(payload);
        toast.success("Assignment created");
      }
      resetForm();
      fetchAssignments();
    } catch (err) {
      toast.error(err?.response?.data?.msg || "Failed to save assignment");
    }
  };

  const onDeleteAssignment = async (id) => {
    if (!window.confirm("Delete this assignment?")) return;
    try {
      await deleteAssignmentApi(id);
      toast.success("Assignment deleted");
      if (selectedAssignmentId === id) setSelectedAssignmentId("");
      fetchAssignments();
    } catch (err) {
      toast.error(err?.response?.data?.msg || "Failed to delete assignment");
    }
  };

  const handleSubmit = async (resubmit = false) => {
    if (!selectedAssignment) return;
    if (!submissionFile && !submissionText.trim()) {
      toast.error("Add file or text before submitting");
      return;
    }
    try {
      const payload = { file: submissionFile, text: submissionText };
      if (resubmit) await resubmitAssignmentApi(selectedAssignment._id, payload);
      else await submitAssignmentApi(selectedAssignment._id, payload);
      toast.success(resubmit ? "Assignment resubmitted" : "Assignment submitted");
      setSubmissionFile(null);
      setSubmissionText("");
      fetchAssignments();
    } catch (err) {
      toast.error(err?.response?.data?.msg || "Submission failed");
    }
  };

  const onReview = async (submissionId, marks, feedback) => {
    try {
      await reviewSubmissionApi(submissionId, { marks: Number(marks), feedback });
      toast.success("Submission reviewed");
      fetchSubmissions(selectedAssignmentId);
      fetchAssignments();
    } catch (err) {
      toast.error(err?.response?.data?.msg || "Failed to review");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar userProfile={currentUser} pageTitle="Group Assignments" />
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold dark:text-white">Assignments</h1>
          <Link className="text-sm text-indigo-600 font-semibold" to={`/groups/${groupId}`}>
            Back to Group
          </Link>
        </div>

        {isMentorOrAdmin && (
          <div className="mb-4">
            <button
              onClick={() => setShowForm((s) => !s)}
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm"
            >
              {showForm ? "Close Form" : "Create Assignment"}
            </button>
          </div>
        )}

        {showForm && isMentorOrAdmin && (
          <form onSubmit={onSaveAssignment} className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-6 space-y-3">
            <input
              className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:text-white"
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
            <textarea
              className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:text-white"
              placeholder="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            <textarea
              className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:text-white"
              placeholder="Instructions"
              value={form.instructions}
              onChange={(e) => setForm({ ...form, instructions: e.target.value })}
            />
            <input
              type="datetime-local"
              className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:text-white"
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              required
            />
            <FilePickBox
              key={editing?._id || "new-assignment"}
              label="Optional attachment for students"
              inputId="assignment-attachment"
              value={form.file}
              existingFileName={editing?.file || null}
              onChange={(file) => setForm({ ...form, file })}
            />
            <div className="flex gap-2">
              <button type="submit" className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm">
                {editing ? "Update Assignment" : "Save Assignment"}
              </button>
              <button type="button" onClick={resetForm} className="px-4 py-2 rounded-lg border text-sm">
                Cancel
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <p className="text-center py-12 dark:text-white">Loading assignments...</p>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-xl p-4 h-fit">
              {assignments.length === 0 ? (
                <p className="text-sm text-gray-500">No assignments found.</p>
              ) : (
                <div className="space-y-2">
                  {assignments.map((a) => (
                    <button
                      key={a._id}
                      onClick={() => setSelectedAssignmentId(a._id)}
                      className={`w-full text-left p-3 rounded-lg border ${
                        selectedAssignmentId === a._id ? "border-indigo-500" : "border-gray-200"
                      }`}
                    >
                      <p className="font-semibold dark:text-white">{a.title}</p>
                      <p className="text-xs text-gray-500">Due {new Date(a.dueDate).toLocaleString()}</p>
                      <p className="text-xs mt-1 text-indigo-600 capitalize">{a.myStatus}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl p-4">
              {!selectedAssignment ? (
                <p className="text-sm text-gray-500">Select an assignment.</p>
              ) : (
                <>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h2 className="text-xl font-bold dark:text-white">{selectedAssignment.title}</h2>
                      <p className="text-sm text-gray-500 mt-1">
                        Due: {new Date(selectedAssignment.dueDate).toLocaleString()}
                      </p>
                    </div>
                    {isMentorOrAdmin && (
                      <div className="flex gap-2">
                        <button
                          className="px-3 py-1 text-xs rounded border"
                          onClick={() => openEdit(selectedAssignment)}
                        >
                          Edit
                        </button>
                        <button
                          className="px-3 py-1 text-xs rounded bg-red-600 text-white"
                          onClick={() => onDeleteAssignment(selectedAssignment._id)}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>

                  <p className="mt-4 text-sm dark:text-gray-200">{selectedAssignment.description || "No description"}</p>
                  <p className="mt-2 text-sm dark:text-gray-300">{selectedAssignment.instructions || "No instructions"}</p>
                  {selectedAssignment.file && (
                    <a
                      className="mt-3 inline-block text-indigo-600 text-sm"
                      href={`${uploadRoot}/uploads/${selectedAssignment.file}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Download assignment file
                    </a>
                  )}

                  {!isMentorOrAdmin && (
                    <div className="mt-6 border-t pt-4">
                      <h3 className="font-semibold dark:text-white mb-2">Your Submission</h3>
                      {selectedAssignment.mySubmission?.feedback && (
                        <p className="text-sm mb-2 text-emerald-700">
                          Feedback: {selectedAssignment.mySubmission.feedback}
                        </p>
                      )}
                      {selectedAssignment.mySubmission?.marks !== null &&
                        selectedAssignment.mySubmission?.marks !== undefined && (
                          <p className="text-sm mb-2 text-indigo-700">
                            Marks: {selectedAssignment.mySubmission.marks}
                          </p>
                        )}
                      <textarea
                        value={submissionText}
                        onChange={(e) => setSubmissionText(e.target.value)}
                        className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:text-white"
                        placeholder="Optional text answer"
                      />
                      <div className="mt-3">
                        <FilePickBox
                          key={selectedAssignment._id}
                          label="Upload your work (PDF, DOC, images, ZIP — max 10MB)"
                          inputId={`submission-file-${selectedAssignment._id}`}
                          value={submissionFile}
                          existingFileName={
                            selectedAssignment.mySubmission?.file || null
                          }
                          onChange={setSubmissionFile}
                        />
                      </div>
                      <div className="mt-2 flex gap-2">
                        {selectedAssignment.mySubmission ? (
                          <button
                            onClick={() => handleSubmit(true)}
                            className="px-4 py-2 rounded-lg bg-amber-600 text-white text-sm"
                          >
                            Resubmit
                          </button>
                        ) : (
                          <button
                            onClick={() => handleSubmit(false)}
                            className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm"
                          >
                            Submit
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {isMentorOrAdmin && (
                    <div className="mt-6 border-t pt-4">
                      <h3 className="font-semibold dark:text-white mb-3">Student Submissions</h3>
                      {submissions.length === 0 ? (
                        <p className="text-sm text-gray-500">No submissions yet.</p>
                      ) : (
                        <div className="space-y-3">
                          {submissions.map((s) => (
                            <SubmissionReviewCard key={s._id} submission={s} onReview={onReview} />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const SubmissionReviewCard = ({ submission, onReview }) => {
  const [marks, setMarks] = useState(submission.marks ?? "");
  const [feedback, setFeedback] = useState(submission.feedback || "");

  return (
    <div className="border rounded-lg p-3">
      <p className="text-sm font-semibold dark:text-white">
        {submission.userId?.fullName || "Student"} - <span className="capitalize">{submission.status}</span>
      </p>
      <p className="text-xs text-gray-500 mb-2">{new Date(submission.submittedAt).toLocaleString()}</p>
      {submission.text && <p className="text-sm mb-2 dark:text-gray-200">{submission.text}</p>}
      {submission.file && (
        <a
          className="text-sm text-indigo-600"
          href={`${uploadRoot}/uploads/${submission.file}`}
          target="_blank"
          rel="noreferrer"
        >
          Download submission file
        </a>
      )}
      <div className="grid sm:grid-cols-2 gap-2 mt-3">
        <input
          type="number"
          min="0"
          value={marks}
          onChange={(e) => setMarks(e.target.value)}
          className="border rounded px-2 py-1 dark:bg-gray-700 dark:text-white"
          placeholder="Marks"
        />
        <input
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          className="border rounded px-2 py-1 dark:bg-gray-700 dark:text-white"
          placeholder="Feedback"
        />
      </div>
      <button
        className="mt-2 px-3 py-1 bg-emerald-600 text-white rounded text-sm"
        onClick={() => onReview(submission._id, marks, feedback)}
      >
        Save Review
      </button>
    </div>
  );
};

export default GroupAssignments;
