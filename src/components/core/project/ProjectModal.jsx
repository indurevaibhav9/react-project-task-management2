// ProjectModal.jsx
import React, { useState, useEffect, useRef } from "react";
import { X } from 'lucide-react';
import { registerUserAPI } from '../../../services/apis';
import { apiConnector } from '../../../services/apiConnector';
import { getAllUser } from "../../../services/operations/authAPI";
import { createProject } from "../../../services/operations/projectAPI";
import { useSelector } from "react-redux";

export default function ProjectModal({ isOpen, onClose, onCreateProject, availableUsers = [] })
{
  const [form, setForm] = useState({
    projectName: "",
    projectDescription: "",
    projectStartDate: "",
    projectEndDate: "",
    file: null,
    teamMembers: []
  });

  const { token } = useSelector((state) => state.auth || {})
  const [errors, setErrors] = useState({});
  const [filePreview, setFilePreview] = useState(null);
  const [userInput, setUserInput] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const firstRenderRef = useRef(true);

  useEffect(() =>
  {
    console.log("allUsers", allUsers);
  }, [allUsers])

  useEffect(() =>
  {
    if (isOpen)
    {
      setForm({
        projectName: "",
        projectDescription: "",
        projectStartDate: "",
        projectEndDate: "",
        file: null,
        teamMembers: []
      });
      setErrors({});
      setFilePreview(null);
      setUserInput("");
      setFilteredUsers([]);

      (async () =>
      {
        try
        {
          const resp = await getAllUser({ token })();
          let raw = [];
          if (Array.isArray(resp))
          {
            raw = resp;
          } else if (resp && Array.isArray(resp.data))
          {
            raw = resp.data;
          } else if (resp && Array.isArray(resp.users))
          {
            raw = resp.users;
          }

          const normalized = raw.map(u =>
          {
            const userId = u.userId ?? u.id ?? u._id ?? u.userID ?? u.Id;
            const userName = u.userName ?? u.userName ?? u.name ?? `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() ?? u.fullName;
            const userEmail = u.userEmail ?? u.email ?? u.userEmailAddress;
            return { userId, userName: userName || 'Unknown', userEmail: userEmail || '' };
          });
          console.log('Normalized users for project modal:', normalized);
          setAllUsers(normalized);
        } catch (err)
        {
          console.error('Failed to fetch all users for project modal', err);
        }
      })();
    }
  }, [isOpen, token]);

  const validate = () =>
  {
    const e = {};
    if (!form.projectName.trim()) e.projectName = "Title is required";
    if (!form.projectDescription.trim()) e.projectDescription = "Description is required";
    if (!form.projectStartDate) e.projectStartDate = "Start date is required";
    if (!form.projectEndDate) e.projectEndDate = "End date is required";
    if (form.projectStartDate && form.projectEndDate)
    {
      if (new Date(form.projectEndDate) < new Date(form.projectStartDate))
        e.projectEndDate = "End date must be after start date";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleFileChange = (e) =>
  {
    const f = e.target.files[0];
    setForm(prev => ({ ...prev, file: f }));
    setErrors(prev => ({ ...prev, file: undefined }));
    if (f && f.type.startsWith("image/"))
    {
      const url = URL.createObjectURL(f);
      setFilePreview(url);
      if (!firstRenderRef.current)
      {
        return () => URL.revokeObjectURL(url);
      }
    } else
    {
      setFilePreview(null);
    }
  };

  const handleChange = (e) =>
  {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const handleUserInputChange = (e) =>
  {
    const value = e.target.value;
    setUserInput(value);
    if (value.includes('@'))
    {
      const query = value.split('@').pop().trim().toLowerCase();
      if (query.length > 0)
      {
        const source = allUsers.length > 0 ? allUsers : (availableUsers || []).map(u => ({ userId: u.userId, userName: u.userName, userEmail: u.userEmail }));
        const filtered = source.filter(user =>
        {
          const already = form.teamMembers.find(m => String(m.userId) === String(user.userId));
          const name = (user.userName || '').toLowerCase();
          const email = (user.userEmail || '').toLowerCase();
          return !already && (name.includes(query) || email.includes(query));
        });
        setFilteredUsers(filtered);
      } else
      {
        setFilteredUsers([]);
      }
    } else
    {
      setFilteredUsers([]);
    }
  };

  const addTeamMember = (user) =>
  {
    setForm(prev => ({
      ...prev,
      teamMembers: [...prev.teamMembers, user]
    }));
    setUserInput("");
    setFilteredUsers([]);
  };

  const removeTeamMember = (userId) =>
  {
    setForm(prev => ({
      ...prev,
      teamMembers: prev.teamMembers.filter(m => m.userId !== userId)
    }));
  };

  const handleSubmit = async (e) =>
  {
    e.preventDefault();
    if (!validate()) return;

    try
    {
      // Create FormData object for multipart/form-data
      const projectFormData = new FormData();

      // Append all required fields matching backend DTO exactly
      projectFormData.append('projectName', form.projectName);
      projectFormData.append('projectDescription', form.projectDescription);
      projectFormData.append('projectStartDate', form.projectStartDate);
      projectFormData.append('projectEndDate', form.projectEndDate);

      // Append file if present (backend expects 'formFile')
      if (form.file)
      {
        projectFormData.append('formFile', form.file);
      }

      // Append team members as array (backend expects 'UserIds' array)
      form.teamMembers.forEach((member) =>
      {
        projectFormData.append('UserIds', member.userId);
      });

      console.log("Submitting project with FormData");
      console.log("Token:", token ? "Present" : "Missing");
      console.log("Form data contents:");
      for (let pair of projectFormData.entries())
      {
        console.log(pair[0] + ': ' + pair[1]);
      }

      // Call the API with the FormData
      const response = await createProject({
        formData: projectFormData,
        token: token
      })();

      console.log("Full response:", response);
      console.log("Response status:", response?.status);
      console.log("Response data:", response?.data);

      // Check for successful response (200-299 status codes)
      if (response && (response.status >= 200 && response.status < 300))
      {
        console.log("Project created successfully");

        // Handle different response structures
        const projectData = response.data?.project || response.data?.data || response.data;

        if (onCreateProject)
        {
          await onCreateProject();   // no data passed, no formData needed
        }


        // Show success message
        alert("Project created successfully!");

        if (onClose) onClose();
      } else
      {
        throw new Error("Unexpected response status: " + response?.status);
      }
    } catch (err)
    {
      console.error("Create project failed", err);
      console.error("Error response:", err.response);
      console.error("Error response data:", err.response?.data);
      console.error("Error response status:", err.response?.status);

      // If it's a 500 error, the project might still be created
      if (err.response?.status === 500)
      {
        const confirmRefresh = window.confirm(
          "There was a server error, but the project may have been created. Would you like to refresh the page to check?"
        );
        if (confirmRefresh)
        {
          window.location.reload();
        }
      }

      const errorMsg = err.response?.data?.message || err.message || "Failed to create project";
      setErrors(prev => ({ ...prev, server: errorMsg }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div
        className="relative bg-white rounded-lg border-2 border-black shadow-[8px_8px_0_rgba(0,0,0,0.9)] w-full max-w-xl"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between p-6">
          <div>
            <h2 className="text-2xl font-bold">Create Project</h2>
            <p className="text-sm text-gray-500">Add a new project to the workspace</p>
          </div>
          <button
            onClick={onClose}
            className="text-sm px-3 py-1 border border-gray-300 rounded hover:bg-gray-100"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 pb-6">
          <label className="block mb-3">
            <span className="text-sm font-medium">Title</span>
            <input
              name="projectName"
              value={form.projectName}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border px-3 py-2 focus:outline-none ${errors.projectName ? "border-red-500" : "border-gray-300"
                }`}
              placeholder="E-Commerce Website"
            />
            {errors.projectName && <p className="text-xs text-red-600 mt-1">{errors.projectName}</p>}
          </label>

          <label className="block mb-3">
            <span className="text-sm font-medium">Description</span>
            <textarea
              name="projectDescription"
              value={form.projectDescription}
              onChange={handleChange}
              rows={4}
              className={`mt-1 block w-full rounded-md border px-3 py-2 focus:outline-none ${errors.projectDescription ? "border-red-500" : "border-gray-300"
                }`}
              placeholder="Build a modern e-commerce platform with React and .NET"
            />
            {errors.projectDescription && <p className="text-xs text-red-600 mt-1">{errors.projectDescription}</p>}
          </label>

          <div className="grid grid-cols-2 gap-4 mb-3">
            <label className="block">
              <span className="text-sm font-medium">Start date</span>
              <input
                type="date"
                name="projectStartDate"
                value={form.projectStartDate}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border px-3 py-2 focus:outline-none ${errors.projectStartDate ? "border-red-500" : "border-gray-300"
                  }`}
              />
              {errors.projectStartDate && <p className="text-xs text-red-600 mt-1">{errors.projectStartDate}</p>}
            </label>

            <label className="block">
              <span className="text-sm font-medium">End date</span>
              <input
                type="date"
                name="projectEndDate"
                value={form.projectEndDate}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border px-3 py-2 focus:outline-none ${errors.projectEndDate ? "border-red-500" : "border-gray-300"
                  }`}
              />
              {errors.projectEndDate && <p className="text-xs text-red-600 mt-1">{errors.projectEndDate}</p>}
            </label>
          </div>

          <label className="block mb-4">
            <span className="text-sm font-medium">Attachment (optional)</span>
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={handleFileChange}
              className="mt-1 block w-full"
            />
            {errors.file && <p className="text-xs text-red-600 mt-1">{errors.file}</p>}

            {filePreview && (
              <div className="mt-3">
                <img src={filePreview} alt="preview" className="max-h-40 rounded border" />
              </div>
            )}
          </label>

          <label className="block mb-4">
            <span className="text-sm font-medium">Team Members</span>
            <div className="relative mt-1">
              <input
                type="text"
                value={userInput}
                onChange={handleUserInputChange}
                placeholder="Search and add team members..."
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none"
              />
              {filteredUsers.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-10 max-h-40 overflow-y-auto">
                  {filteredUsers.map(user => (
                    <div
                      key={user.userId}
                      onClick={() => addTeamMember(user)}
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                    >
                      <div className="font-medium text-gray-800">{user.userName}</div>
                      <div className="text-xs text-gray-500">{user.userEmail}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {form.teamMembers.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {form.teamMembers.map(member => (
                  <div
                    key={member.userId}
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                  >
                    <span>{member.userName}</span>
                    <button
                      type="button"
                      onClick={() => removeTeamMember(member.userId)}
                      className="hover:text-blue-900 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </label>

          {errors.server && <p className="text-sm text-red-600 mb-3">{errors.server}</p>}

          <div className="flex items-center justify-between gap-3">
            <div>
              <button
                type="submit"
                style={{ cursor: 'pointer' }}
                className="px-6 py-2 rounded-md bg-black text-white font-medium shadow-sm hover:bg-gray-800"
              >
                Create
              </button>
              <button
                type="button"
                onClick={onClose}
                className="ml-3 px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}