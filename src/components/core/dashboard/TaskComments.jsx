// TaskComments.jsx
import React, { useEffect, useState } from "react";
import Comment from "./Comment";

/**
 * Props:
 * - isOpen: boolean
 * - onClose: fn
 * - taskId: number (required)
 * - currentUserId: number (optional; used when creating comment & highlighting)
 *
 * API endpoints (adapt URLs / auth):
 * GET  -> https://localhost:7228/api/projecttask/{id}           // returns task with .comments array
 * POST -> https://localhost:7228/api/comment                   // create comment (body: { taskId, userId, commentMessage })
 * POST -> https://localhost:7228/api/comment/{commentId}/file  // upload file for the comment (FormData: file)
 *
 * NOTE: the final upload endpoint name is guessed from your description ("cmdId, file").
 * If your backend expects a different route, replace the upload URL accordingly.
 */
export default function TaskComments({ isOpen, onClose, taskId, currentUserId = null }) {
  const [loading, setLoading] = useState(false);
  const [task, setTask] = useState(null);
  const [comments, setComments] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [newFile, setNewFile] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Fetch task + comments when modal opens or taskId changes
  useEffect(() => {
    if (!isOpen || !taskId) return;

    const fetchTask = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`https://localhost:7228/api/projecttask/${taskId}`);
        if (!res.ok) throw new Error(`Failed to fetch task (${res.status})`);
        const data = await res.json();
        setTask(data);
        // ensure comments is an array
        setComments(Array.isArray(data.comments) ? data.comments : []);
      } catch (err) {
        console.error(err);
        setError("Failed to load task. Check console for details.");
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [isOpen, taskId]);

  // file input change
  const handleFileChange = (e) => {
    const f = e.target.files[0];
    setNewFile(f || null);
  };

  // submit comment: 1) POST create comment 2) if file -> upload file for that comment
  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!newMessage?.trim() && !newFile) {
      setError("Please enter a message or attach a file.");
      return;
    }
    setSubmitting(true);
    setError("");

    try {
      // 1) Create comment DTO
      const createDto = {
        taskId: taskId,
        userId: currentUserId ?? null, // adapt: may require a real user id
        commentMessage: newMessage || ""
      };

      const res = await fetch(`https://localhost:7228/api/comment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // if you need auth: "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(createDto)
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Create comment failed: ${res.status} ${txt}`);
      }

      const created = await res.json();
      // created should contain commentId, commentCreatedAt, etc
      // Add optimistic comment to UI (add created object)
      const newCmt = {
        ...created,
        // sometimes backend returns minimal; ensure fields exist for UI
        user: created.user ?? { userId: currentUserId, userName: "You" },
        file: created.file ?? null
      };

      // If file attached -> upload file in second call
      if (newFile) {
        try {
          const form = new FormData();
          form.append("file", newFile);

          // guessed endpoint: change to your actual upload route
          const uploadRes = await fetch(`https://localhost:7228/api/comment/${created.commentId}/file`, {
            method: "POST",
            // DO NOT set Content-Type (browser sets multipart boundary automatically)
            body: form
          });

          if (!uploadRes.ok) {
            const t = await uploadRes.text();
            console.warn("File upload failed:", uploadRes.status, t);
            // optionally set a flag on comment that file upload failed
          } else {
            const uploaded = await uploadRes.json();
            // uploaded should contain file info; attach to comment
            newCmt.file = uploaded; // adapt based on your API response shape
          }
        } catch (uf) {
          console.error("Upload error", uf);
        }
      }

      // append to comments list and clear inputs
      setComments((prev) => [newCmt, ...prev]);
      setNewMessage("");
      setNewFile(null);

    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to create comment");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/30 p-6 overflow-auto">
      <div className="relative bg-white rounded-lg border-2 border-black shadow-[8px_8px_0_rgba(0,0,0,0.9)] w-full max-w-3xl mt-12">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold">Task Details</h2>
            <p className="text-sm text-gray-500">
              {task ? `${task.taskTitle ?? ""}` : "Loading..."}
            </p>
          </div>
          <div className="flex gap-2 items-start">
            <button
              onClick={() => onClose?.()}
              className="text-sm px-3 py-1 border border-gray-300 rounded hover:bg-gray-100"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* Basic task info */}
          {loading ? (
            <div className="text-sm text-gray-500">Loading task...</div>
          ) : error ? (
            <div className="text-sm text-red-600">{error}</div>
          ) : task ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="text-xs text-gray-500">Title</div>
                <div className="text-sm font-medium">{task.taskTitle}</div>

                <div className="text-xs text-gray-500 mt-2">Priority / Status</div>
                <div className="text-sm">{String(task.taskPriority)} / {String(task.taskStatus)}</div>
              </div>

              <div className="space-y-1">
                <div className="text-xs text-gray-500">Due</div>
                <div className="text-sm">{task.taskDueDate ? new Date(task.taskDueDate).toLocaleString() : "-"}</div>

                <div className="text-xs text-gray-500 mt-2">Project</div>
                <div className="text-sm">{task.project?.projectName ?? "-"}</div>
              </div>

              <div className="md:col-span-2">
                <div className="text-xs text-gray-500">Description</div>
                <div className="text-sm whitespace-pre-wrap">{task.taskDescription}</div>
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-500">No task data.</div>
          )}

          {/* Add comment form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <label className="block">
              <span className="text-sm font-medium">Add a comment</span>
              <input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                rows={3}
                placeholder="Write your comment..."
                className="mt-1 block w-full rounded-md border px-3 py-2 focus:outline-none border-gray-300"
              />
            </label>

            <div className="flex items-center gap-3">
              <input type="file" onChange={handleFileChange} />
              <div className="flex-1 text-sm text-gray-500">Attach a file (optional)</div>

              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 rounded bg-black text-white"
              >
                {submitting ? "Posting..." : "Post Comment"}
              </button>
            </div>
          </form>

          {/* Comments list */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Comments</h3>

            <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
              {comments.length === 0 ? (
                <div className="text-gray-600">No comments yet.</div>
              ) : (
                comments.map((c) => (
                  <Comment key={c.commentId ?? `${c.taskId}-${Math.random()}`} comment={c} currentUserId={currentUserId} />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}