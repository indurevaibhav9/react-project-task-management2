import React, { useState } from "react";

export default function TaskUpdateModal({ task, token, onClose, onUpdated })
{

    const [title, setTitle] = useState(task.taskTitle || "");
    const [desc, setDesc] = useState(task.taskDescription || "");
    const [priority, setPriority] = useState(task.taskPriority);
    const [status, setStatus] = useState(task.taskStatus);
    const [dueDate, setDueDate] = useState(
        task.taskDueDate ? task.taskDueDate.slice(0, 16) : ""
    );
    const [file, setFile] = useState(null);
    const [userId, setUserId] = useState(task.userId || "");
    const [loading, setLoading] = useState(false);

    const handleUpdate = async () =>
    {
        try
        {
            setLoading(true);

            const fd = new FormData();
            fd.append("projectId", task.projectId);
            fd.append("taskTitle", title);
            fd.append("taskDescription", desc);
            fd.append("taskPriority", priority);
            fd.append("taskStatus", status);
            fd.append("taskDueDate", dueDate);
            fd.append("userId", userId);

            if (file) fd.append("formFile", file);

            const res = await fetch(
                `https://localhost:7228/api/ProjectTask/${task.taskId}`,
                {
                    method: "PUT",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    body: fd,
                }
            );

            if (!res.ok)
                throw new Error("Update failed");

            await res.json();

            onUpdated(); // refresh parent
        } catch (err)
        {
            console.error(err);
            alert("Failed to update task");
        } finally
        {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[999]">
            <div className="bg-white rounded-lg w-full max-w-lg p-6 shadow-lg border-2 border-black">
                <h2 className="text-xl font-bold mb-4">Update Task</h2>

                {/* Title */}
                <label className="block mb-3">
                    <span className="text-sm font-medium">Title</span>
                    <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="mt-1 w-full border rounded px-3 py-2"
                    />
                </label>

                {/* Description */}
                <label className="block mb-3">
                    <span className="text-sm font-medium">Description</span>
                    <textarea
                        value={desc}
                        onChange={(e) => setDesc(e.target.value)}
                        rows={3}
                        className="mt-1 w-full border rounded px-3 py-2"
                    />
                </label>

                {/* Priority */}
                <label className="block mb-3">
                    <span className="text-sm font-medium">Priority</span>
                    <select
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                        className="mt-1 w-full border rounded px-3 py-2"
                    >
                        <option value="0">Low</option>
                        <option value="1">Medium</option>
                        <option value="2">High</option>
                    </select>
                </label>

                {/* Status */}
                <label className="block mb-3">
                    <span className="text-sm font-medium">Status</span>
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="mt-1 w-full border rounded px-3 py-2"
                    >
                        <option value="0">Open</option>
                        <option value="1">In Progress</option>
                        <option value="2">Closed</option>
                    </select>
                </label>

                {/* Due Date */}
                <label className="block mb-3">
                    <span className="text-sm font-medium">Due Date</span>
                    <input
                        type="datetime-local"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="mt-1 w-full border rounded px-3 py-2"
                    />
                </label>

                {/* User */}
                <label className="block mb-3">
                    <span className="text-sm font-medium">User ID</span>
                    <input
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                        className="mt-1 w-full border rounded px-3 py-2"
                    />
                </label>

                {/* File */}
                <label className="block mb-3">
                    <span className="text-sm font-medium">Upload File (optional)</span>
                    <input
                        type="file"
                        onChange={(e) => setFile(e.target.files[0])}
                        className="mt-1"
                    />
                </label>

                {/* Buttons */}
                <div className="flex justify-end gap-3 mt-4">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-300 rounded"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleUpdate}
                        disabled={loading}
                        className="px-4 py-2 bg-blue-600 text-white rounded"
                    >
                        {loading ? "Updating..." : "Update Task"}
                    </button>
                </div>
            </div>
        </div>
    );
}
