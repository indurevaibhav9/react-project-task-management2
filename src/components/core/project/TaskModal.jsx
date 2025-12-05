// TaskModal.jsx
import React, { useState, useEffect, useRef } from "react";
import { useSelector } from 'react-redux';
import { getAllUser } from '../../../services/operations/authAPI';
import { X } from 'lucide-react';

export default function TaskModal({ isOpen, onClose, onCreateTask, projectId, availableUsers = [] }) {
  const [form, setForm] = useState({
    projectId: projectId,
    taskTitle: "",
    taskDescription: "",
    taskPriority: 1,
    taskStatus: 0, // REQUIRED by backend DTO
    taskDueDate: "",
    assignedUser: null,
    file: null
  });

  const [errors, setErrors] = useState({});
  const [userInput, setUserInput] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const searchTimeout = useRef(null);
  const { token } = useSelector((state) => state.auth || {});

  useEffect(() => {
    if (isOpen) {
      setForm({
        projectId,
        taskTitle: "",
        taskDescription: "",
        taskPriority: 1,
        taskStatus: 0,
        taskDueDate: "",
        assignedUser: null,
        file: null
      });
      setErrors({});
      setUserInput("");
      setFilteredUsers([]);
    }
  }, [isOpen]);

  const validate = () => {
    const e = {};
    if (!form.taskTitle.trim()) e.taskTitle = "Task title is required";
    if (!form.taskDescription.trim()) e.taskDescription = "Task description is required";
    if (!form.taskDueDate) e.taskDueDate = "Due date is required";
    if (!form.assignedUser) e.assignedUser = "A user must be assigned";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const handleUserInputChange = (e) => {
    const value = e.target.value;
    setUserInput(value);

    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    searchTimeout.current = setTimeout(async () => {
      if (!value.trim()) {
        setFilteredUsers([]);
        return;
      }

      const q = value.toLowerCase();

      const localMatches = (availableUsers || []).filter(user =>
        (!form.assignedUser || form.assignedUser.userId !== user.userId) &&
        (user.userName?.toLowerCase().includes(q) ||
          user.userEmail?.toLowerCase().includes(q))
      );

      try {
        const resp = await getAllUser({ token })();
        const all = Array.isArray(resp) ? resp : [];

        const normalized = all.map(u => ({
          userId: u.userId ?? u.id,
          userName: u.userName ?? `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim(),
          userEmail: u.userEmail ?? u.email
        }))
          .filter(u =>
            (u.userName && u.userName.toLowerCase().includes(q)) ||
            (u.userEmail && u.userEmail.toLowerCase().includes(q))
          );

        const merged = Array.from(
          new Map([...localMatches, ...normalized].map(u => [u.userId, u])).values()
        );

        setFilteredUsers(merged.slice(0, 50));
      } catch (err) {
        console.error('Failed to fetch users', err);
        setFilteredUsers(localMatches.slice(0, 50));
      }
    }, 300);
  };

  const addAssignedUser = (user) => {
    setForm(prev => ({ ...prev, assignedUser: user }));
    setUserInput("");
    setFilteredUsers([]);
  };

  const removeAssignedUser = () => {
    setForm(prev => ({ ...prev, assignedUser: null }));
  };

  const handleFileChange = (e) => {
    setForm(prev => ({ ...prev, file: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = new FormData();

    payload.append("projectId", projectId);
    payload.append("taskTitle", form.taskTitle);
    payload.append("taskDescription", form.taskDescription);
    payload.append("taskPriority", Number(form.taskPriority));
    payload.append("taskStatus", Number(form.taskStatus)); // REQUIRED
    payload.append("taskDueDate", form.taskDueDate);

    if (form.assignedUser) {
      payload.append("userId", form.assignedUser.userId);
    }

    if (form.file) {
      payload.append("fileForm", form.file); // must match backend DTO
    }

    try {
      await onCreateTask(payload);
      onClose();
    } catch (err) {
      console.error("Create task failed", err);
      setErrors(prev => ({ ...prev, server: err.message || "Create failed" }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="relative bg-white rounded-lg border-2 border-black shadow-lg w-full max-w-xl max-height-[90vh] overflow-y-auto">

        <div className="flex justify-between items-center p-6 border-b bg-white sticky top-0">
          <h2 className="text-2xl font-bold">Create Task</h2>
          <button onClick={onClose} className="text-xl px-3 py-1 hover:bg-gray-200 rounded">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 pb-6">

          <label className="block mb-3">
            <span className="font-medium">Task Title</span>
            <input
              name="taskTitle"
              value={form.taskTitle}
              onChange={handleChange}
              className={`mt-1 w-full px-3 py-2 border rounded ${errors.taskTitle ? "border-red-500" : "border-gray-300"}`}
              placeholder="Enter task title..."
            />
            {errors.taskTitle && <p className="text-red-500 text-xs">{errors.taskTitle}</p>}
          </label>

          <label className="block mb-3">
            <span className="font-medium">Description</span>
            <textarea
              name="taskDescription"
              rows={4}
              value={form.taskDescription}
              onChange={handleChange}
              className={`mt-1 w-full px-3 py-2 border rounded ${errors.taskDescription ? "border-red-500" : "border-gray-300"}`}
              placeholder="Describe the task..."
            />
            {errors.taskDescription && <p className="text-red-500 text-xs">{errors.taskDescription}</p>}
          </label>

          <div className="grid grid-cols-2 gap-4">

            <label>
              <span className="font-medium">Priority</span>
              <select
                name="taskPriority"
                value={form.taskPriority}
                onChange={handleChange}
                className="mt-1 w-full px-3 py-2 border rounded border-gray-300"
              >
                <option value={0}>Low</option>
                <option value={1}>Medium</option>
                <option value={2}>High</option>
              </select>
            </label>

            <label>
              <span className="font-medium">Due Date</span>
              <input
                type="date"
                name="taskDueDate"
                value={form.taskDueDate}
                onChange={handleChange}
                className={`mt-1 w-full px-3 py-2 border rounded ${errors.taskDueDate ? "border-red-500" : "border-gray-300"}`}
              />
              {errors.taskDueDate && <p className="text-red-500 text-xs">{errors.taskDueDate}</p>}
            </label>

          </div>

          <label className="block mb-3">
            <span className="font-medium">Assign User</span>
            <input
              value={userInput}
              onChange={handleUserInputChange}
              disabled={!!form.assignedUser}
              className="mt-1 w-full px-3 py-2 border rounded border-gray-300"
              placeholder="Search user..."
            />

            {filteredUsers.length > 0 && (
              <div className="border bg-white mt-1 rounded shadow max-h-40 overflow-y-auto">
                {filteredUsers.map(u => (
                  <div
                    key={u.userId}
                    onClick={() => addAssignedUser(u)}
                    className="px-3 py-2 hover:bg-gray-200 cursor-pointer"
                  >
                    <span className="font-medium">{u.userName}</span>
                    <br />
                    <span className="text-xs text-gray-600">{u.userEmail}</span>
                  </div>
                ))}
              </div>
            )}

            {form.assignedUser && (
              <div className="mt-2 inline-flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                {form.assignedUser.userName}
                <button type="button" onClick={removeAssignedUser} className="ml-2">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {errors.assignedUser && <p className="text-red-500 text-xs">{errors.assignedUser}</p>}
          </label>

          <label className="block mb-3">
            <span className="font-medium">Attach File</span>
            <input
              type="file"
              name="fileForm"
              onChange={handleFileChange}
              className="mt-1 w-full px-3 py-2 border rounded"
            />
            {form.file && <p className="text-xs text-gray-600">Selected: {form.file.name}</p>}
          </label>

          <div className="flex justify-between">
            <button className="bg-black text-white px-6 py-2 rounded">Create Task</button>
            <button type="button" onClick={onClose} className="border px-4 py-2 rounded">Cancel</button>
          </div>

        </form>
      </div>
    </div>
  );
}
