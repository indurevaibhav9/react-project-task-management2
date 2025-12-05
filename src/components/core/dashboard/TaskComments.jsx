// TaskComments.jsx
import React, { useEffect, useRef, useState } from "react";
import Comment from "./Comment";
import { useSelector } from "react-redux";
import TaskUpdateModal from "./TaskUpdateModel";

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
export default function TaskComments({ isOpen, onClose, taskId, currentUserId = null })
{
  const [loading, setLoading] = useState(false);
  const [task, setTask] = useState(null);
  const [comments, setComments] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [newFile, setNewFile] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { token } = useSelector((state) => state.auth)
  const fileInputRef = useRef(null);
  const [deletedComment, setDeletedComment] = useState(true);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUserForAttach, setSelectedUserForAttach] = useState("");
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  // Fetch task + comments when modal opens or taskId changes
  useEffect(() =>
  {
    // Fetch all users for attach user
    const fetchUsers = async () =>
    {
      try
      {
        const res = await fetch("https://localhost:7228/api/Auth/GetAllUsers", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        if (!res.ok) throw new Error("Failed to fetch users");

        const data = await res.json();
        setAllUsers(data);
      } catch (err)
      {
        console.error(err);
      }
    };

    fetchUsers();

    if (!isOpen || !taskId) return;

    const fetchTask = async () =>
    {
      setLoading(true);
      setError("");
      try
      {
        const res = await fetch(`https://localhost:7228/api/ProjectTask/${taskId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        });

        if (!res.ok) throw new Error(`Failed to fetch task (${res.status})`);
        const data = await res.json();
        setTask(data);
        // ensure comments is an array
        setComments(Array.isArray(data.comments) ? data.comments : []);
      } catch (err)
      {
        console.error(err);
        setError("Failed to load task. Check console for details.");
      } finally
      {
        setLoading(false);
      }
    };

    fetchTask();
  }, [isOpen, taskId, deletedComment]);

  // file input change
  const handleFileChange = (e) =>
  {
    const f = e.target.files[0];
    setNewFile(f || null);
  };

  // submit comment: 1) POST create comment 2) if file -> upload file for that comment
  const handleDeleteComment = async (commentId) =>
  {
    if (!commentId) return;

    try
    {
      const res = await fetch(`https://localhost:7228/api/Comment/${commentId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (!res.ok) throw new Error("Delete failed");

      // Remove comment locally (fast UI)
      setComments(prev => prev.filter(c => c.commentId !== commentId));

    } catch (err)
    {
      console.error(err);
    }
  };

  const handleSubmit = async (e) =>
  {
    e?.preventDefault();
    if (!newMessage?.trim() && !newFile)
    {
      setError("Please enter a message or attach a file.");
      return;
    }
    setSubmitting(true);
    setError("");

    try
    {
      // 1) Create comment DTO
      const createDto = {
        taskId: taskId,
        userId: currentUserId ?? null, // adapt: may require a real user id
        commentMessage: newMessage || ""
      };
      const createCommentData = new FormData();
      createCommentData.append("taskId", taskId);
      createCommentData.append("userId", currentUserId || null);
      createCommentData.append("commentMessage", newMessage || "");
      createCommentData.append("commentFileForm", newFile);
      if (newFile)
      {
        console.log("file present : " + newFile);
      }
      const res = await fetch(`https://localhost:7228/api/Comment`, {
        method: "POST",
        headers: {
          // "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: createCommentData
      });

      if (!res.ok)
      {
        const txt = await res.text();
        throw new Error(`Create comment failed: ${res.status} ${txt}`);
      }

      const created = await res.json();
      console.log(created);
      // created should contain commentId, commentCreatedAt, etc
      // Add optimistic comment to UI (add created object)
      const newCmt = {
        ...created,
        // sometimes backend returns minimal; ensure fields exist for UI
        user: created.user ?? { userId: currentUserId, userName: "You" },
        file: created.file ?? null
      };



      // append to comments list and clear inputs
      setComments((prev) => [newCmt, ...prev]);
      setNewMessage("");
      setNewFile(null);
      if (fileInputRef.current)
      {
        fileInputRef.current.value = "";
      }

    } catch (err)
    {
      console.error(err);
      setError(err.message || "Failed to create comment");
    } finally
    {
      setSubmitting(false);
    }
  };
  const handleAttachUser = async () =>
  {
    if (!selectedUserForAttach) return;

    try
    {
      const res = await fetch(
        `https://localhost:7228/api/projecttask/${taskId}/attach-user/${selectedUserForAttach}`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        }
      );

      if (!res.ok) throw new Error("Attach user failed");

      await res.json();

      // Refresh task
      setDeletedComment(prev => !prev);
      setSelectedUserForAttach("");
    } catch (err)
    {
      console.error(err);
    }
  };
  const handleDetachUser = async () =>
  {
    try
    {
      const res = await fetch(
        `https://localhost:7228/api/projecttask/${taskId}/detach-user`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        }
      );

      if (!res.ok) throw new Error("Detach user failed");

      await res.json();

      // Refresh task
      setDeletedComment(prev => !prev);
    } catch (err)
    {
      console.error(err);
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
          <button
            onClick={() => setShowUpdateModal(true)}
            className="text-sm px-3 py-1 border border-blue-500 text-blue-600 rounded hover:bg-blue-100"
          >
            Update Task
          </button>

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
                <div className="text-sm font-medium">{task.taskTitle} (ID: {task.taskId})</div>

                <div className="text-xs text-gray-500 mt-2">Priority </div>
                <div className="text-sm">{task.taskPriority == 0 ? "Low" : task.taskPriority == 1 ? "Medium" : "High"}</div>

                <div className="text-xs text-gray-500">Assigned User</div>
                <div className="text-sm font-medium">Id: {task.userId}, {task.user?.userName}, {task.user?.userEmail}</div>

                <div className="text-xs text-gray-500">Task Status</div>
                <div className="text-sm font-medium">{task.taskStatus == 0 ? "Open" : task.taskStatus == 1 ? "In Progress" : "Closed"}</div>
              </div>

              <div className="space-y-1">
                <div className="text-xs text-gray-500">Due</div>
                <div className="text-sm">{task.taskDueDate ? new Date(task.taskDueDate).toLocaleString() : "-"}</div>

                <div className="text-xs text-gray-500 mt-2">Project</div>
                <div className="text-sm">{task.project?.projectName ?? "-"}</div>

                <div className="text-xs text-gray-500">Description</div>
                <div className="text-sm whitespace-pre-wrap">{task.taskDescription}</div>


              </div>
              <div>
                {/* Attach / Detach User */}
                <div className="mt-4 p-4 border rounded-md bg-gray-50">
                  <h3 className="text-md font-semibold mb-2">Task User</h3>

                  {/* Current assigned user */}
                  {task?.user ? (
                    <div className="mb-3 text-sm">
                      <p className="font-medium">Assigned User:</p>
                      <p>{task.user.userName} ({task.user.userEmail})</p>

                      <button
                        onClick={handleDetachUser}
                        className="mt-2 px-3 py-1 bg-red-600 text-white rounded"
                      >
                        Detach User
                      </button>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 mb-3">No user assigned</p>
                  )}

                  {/* User dropdown */}
                  <select
                    className="border px-3 py-2 rounded w-full"
                    value={selectedUserForAttach}
                    onChange={(e) => setSelectedUserForAttach(e.target.value)}
                  >
                    <option value="">Select User to Attach</option>
                    {allUsers.map((u) => (
                      <option key={u.userId} value={u.userId}>
                        {u.userName} ({u.userEmail})
                      </option>
                    ))}
                  </select>

                  {/* Attach Button */}
                  <button
                    onClick={handleAttachUser}
                    className="mt-3 px-4 py-2 bg-blue-600 text-white rounded"
                    disabled={!selectedUserForAttach}
                  >
                    Attach User
                  </button>
                </div>

              </div>
              <div className="md:col-span-2 space-y-4">

                {/* ATTACHED TASK FILE */}
                <div>
                  <div className="text-xs text-gray-500">Attached File</div>

                  {task?.file ? (
                    <div className="flex items-center gap-3 mt-1">
                      <a
                        href={task.file.fileURL}
                        target="_blank"
                        className="text-blue-600 underline"
                      >
                        {task.file.fileName}
                      </a>

                      {/* Detach File Button */}
                      <button
                        onClick={async () =>
                        {
                          try
                          {
                            const res = await fetch(
                              `https://localhost:7228/api/projecttask/${taskId}/detach-file`,
                              {
                                method: "POST",
                                headers: {
                                  Authorization: `Bearer ${token}`,
                                },
                              }
                            );

                            if (!res.ok) throw new Error("Failed to detach file");

                            // remove file from UI
                            setTask(prev => ({ ...prev, file: null }));
                          } catch (err)
                          {
                            console.error(err);
                            alert("Error detaching file");
                          }
                        }}
                        className="px-3 py-1 text-sm bg-red-600 text-white rounded"
                      >
                        Detach File
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 mt-1">

                      {/* Choose File Input */}
                      <input
                        type="file"
                        onChange={(e) => setNewFile(e.target.files[0] || null)}
                      />

                      {/* Attach File Button */}
                      <button
                        onClick={async () =>
                        {
                          if (!newFile)
                          {
                            alert("Please select a file first.");
                            return;
                          }

                          try
                          {
                            // Step 1: Upload file
                            const fd = new FormData();
                            fd.append("file", newFile);

                            const uploadRes = await fetch(
                              "https://localhost:7228/api/file/upload",
                              {
                                method: "POST",
                                headers: {
                                  Authorization: `Bearer ${token}`,
                                },
                                body: fd,
                              }
                            );

                            if (!uploadRes.ok) throw new Error("File upload failed");
                            const fileData = await uploadRes.json(); // { fileId, fileName, fileURL }

                            // Step 2: Attach uploaded file to task
                            const attachRes = await fetch(
                              `https://localhost:7228/api/projecttask/${taskId}/attach-file/${fileData.fileId}`,
                              {
                                method: "POST",
                                headers: {
                                  Authorization: `Bearer ${token}`,
                                },
                              }
                            );

                            if (!attachRes.ok) throw new Error("Attach file failed");

                            // Update UI
                            setTask(prev => ({
                              ...prev,
                              file: fileData
                            }));

                            setNewFile(null);
                          } catch (err)
                          {
                            console.error(err);
                            alert("Error attaching file");
                          }
                        }}
                        className="px-3 py-1 text-sm bg-green-600 text-white rounded"
                      >
                        Attach File
                      </button>
                    </div>
                  )}
                </div>

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
              <input type="file" ref={fileInputRef} onChange={handleFileChange} />
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
                  <Comment onDelete={handleDeleteComment} key={c.commentId ?? `${c.taskId}-${Math.random()}`} comment={c} currentUserId={currentUserId} />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
      {showUpdateModal && (
        <TaskUpdateModal
          task={task}
          token={token}
          onClose={() => setShowUpdateModal(false)}
          onUpdated={() =>
          {
            setDeletedComment(p => !p); // refresh task
            setShowUpdateModal(false);
          }}
        />
      )}

    </div>
  );
}