// UpdateProjectModal.jsx
import React, { useState, useEffect, useRef } from "react";
import { X } from 'lucide-react';
import { useSelector } from "react-redux";
import { getAllUser } from "../../../services/operations/authAPI";
import { projectAPI } from "../../../services/apis";
import { apiConnector } from "../../../services/apiConnector";

const { UPDATE_PROJECT } = projectAPI;

export default function UpdateProjectModal({ isOpen, onClose, onUpdateProject, project, availableUsers = [] }) {
  const { token } = useSelector((state) => state.auth || {});
  
  const [form, setForm] = useState({
    projectName: "",
    projectDescription: "",
    projectStartDate: "",
    projectEndDate: "",
    file: null,
    teamMembers: []
  });

  const [errors, setErrors] = useState({});
  const [filePreview, setFilePreview] = useState(null);
  const [userInput, setUserInput] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const firstRenderRef = useRef(true);

  // Debug: Log form state changes
  useEffect(() => {
    console.log('Form state changed:', form);
  }, [form]);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      // Fetch all users first
      (async () => {
        try {
          const resp = await getAllUser({ token })();
          let raw = [];
          if (Array.isArray(resp)) {
            raw = resp;
          } else if (resp && Array.isArray(resp.data)) {
            raw = resp.data;
          } else if (resp && Array.isArray(resp.users)) {
            raw = resp.users;
          }

          const normalized = raw.map(u => {
            const userId = u.userId ?? u.id ?? u._id ?? u.userID ?? u.Id;
            const userName = u.userName ?? u.name ?? `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() ?? u.fullName;
            const userEmail = u.userEmail ?? u.email ?? u.userEmailAddress;
            return { userId, userName: userName || 'Unknown', userEmail: userEmail || '' };
          });
          console.log('Normalized users for update modal:', normalized);
          setAllUsers(normalized);

          // After fetching users, populate form with project data
          if (project) {
            const formatDate = (dateString) => {
              if (!dateString) return "";
              const date = new Date(dateString);
              return date.toISOString().split('T')[0];
            };

            // Normalize team members from project
            let normalizedTeamMembers = [];
            if (project.teamMembers && Array.isArray(project.teamMembers)) {
              normalizedTeamMembers = project.teamMembers.map(member => {
                // Try to match with fetched users for complete data
                const matchedUser = normalized.find(u => 
                  String(u.userId) === String(member.userId || member.id || member._id)
                );
                
                if (matchedUser) {
                  return matchedUser;
                }
                
                // Fallback to member data
                return {
                  userId: member.userId ?? member.id ?? member._id,
                  userName: member.userName ?? member.name ?? member.fullName ?? 'Unknown',
                  userEmail: member.userEmail ?? member.email ?? ''
                };
              });
            }

            console.log('Setting form with team members:', normalizedTeamMembers);
            console.log('Project data:', {
              projectName: project.projectName,
              projectDescription: project.projectDescription,
              projectStartDate: project.projectStartDate,
              projectEndDate: project.projectEndDate
            });

            const formattedStartDate = formatDate(project.projectStartDate);
            const formattedEndDate = formatDate(project.projectEndDate);

            console.log('Formatted dates:', {
              startDate: formattedStartDate,
              endDate: formattedEndDate
            });

            setForm({
              projectName: project.projectName || "",
              projectDescription: project.projectDescription || "",
              projectStartDate: formattedStartDate,
              projectEndDate: formattedEndDate,
              file: null,
              teamMembers: normalizedTeamMembers
            });

            // Small delay to ensure state is set
            setTimeout(() => {
              setIsLoading(false);
            }, 100);
          } else {
            setIsLoading(false);
          }
        } catch (err) {
          console.error('Failed to fetch all users for update modal', err);
          setIsLoading(false);
        }
      })();

      setErrors({});
      setFilePreview(null);
      setUserInput("");
      setFilteredUsers([]);
    }
  }, [isOpen, project, token]);

  const validate = () => {
    const e = {};
    if (!form.projectName.trim()) e.projectName = "Title is required";
    if (!form.projectDescription.trim()) e.projectDescription = "Description is required";
    if (!form.projectStartDate) e.projectStartDate = "Start date is required";
    if (!form.projectEndDate) e.projectEndDate = "End date is required";
    if (form.projectStartDate && form.projectEndDate) {
      if (new Date(form.projectEndDate) < new Date(form.projectStartDate))
        e.projectEndDate = "End date must be after start date";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    setForm(prev => ({ ...prev, file: f }));
    setErrors(prev => ({ ...prev, file: undefined }));
    if (f && f.type.startsWith("image/")) {
      const url = URL.createObjectURL(f);
      setFilePreview(url);
      if (!firstRenderRef.current) {
        return () => URL.revokeObjectURL(url);
      }
    } else {
      setFilePreview(null);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const handleUserInputChange = (e) => {
    const value = e.target.value;
    setUserInput(value);
    
    if (value.includes('@')) {
      const query = value.split('@').pop().trim().toLowerCase();
      if (query.length > 0) {
        const source = allUsers.length > 0 ? allUsers : (availableUsers || []).map(u => ({ 
          userId: u.userId, 
          userName: u.userName, 
          userEmail: u.userEmail 
        }));
        const filtered = source.filter(user => {
          const already = form.teamMembers.find(m => String(m.userId) === String(user.userId));
          const name = (user.userName || '').toLowerCase();
          const email = (user.userEmail || '').toLowerCase();
          return !already && (name.includes(query) || email.includes(query));
        });
        setFilteredUsers(filtered);
      } else {
        setFilteredUsers([]);
      }
    } else {
      setFilteredUsers([]);
    }
  };

  const addTeamMember = (user) => {
    setForm(prev => ({
      ...prev,
      teamMembers: [...prev.teamMembers, user]
    }));
    setUserInput("");
    setFilteredUsers([]);
  };

  const removeTeamMember = (userId) => {
    setForm(prev => ({
      ...prev,
      teamMembers: prev.teamMembers.filter(m => m.userId !== userId)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log("Submit clicked - Current form state:", form);
    
    if (isLoading) {
      alert("Please wait for the form to finish loading...");
      return;
    }
    
    if (!validate()) {
      console.log("Validation failed with errors:", errors);
      return;
    }

    try {
      // Log what we're about to send
      console.log("Project ID:", project.projectId);
      console.log("Form data before sending:", form);
      
      // Prepare the update data
      const updatePayload = {
        projectName: form.projectName,
        projectDescription: form.projectDescription,
        projectStartDate: form.projectStartDate,
        projectEndDate: form.projectEndDate
      };

      console.log("Update payload being sent:", JSON.stringify(updatePayload, null, 2));
      console.log("Field values:", {
        projectName: `"${form.projectName}" (length: ${form.projectName?.length})`,
        projectDescription: `"${form.projectDescription}" (length: ${form.projectDescription?.length})`,
        projectStartDate: form.projectStartDate,
        projectEndDate: form.projectEndDate
      });
      console.log("API URL:", `PUT /project/${project.projectId}`);

      // Call the update API
      const response = await apiConnector(
        "PUT",
        UPDATE_PROJECT(project.projectId),
        updatePayload,
        {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      );

      console.log("Update response:", response);

      if (response && (response.status >= 200 && response.status < 300)) {
        console.log("Project updated successfully");

        // If parent provided callback, call it
        if (onUpdateProject) {
          await onUpdateProject(response.data?.project || response.data);
        }

        alert("Project updated successfully!");
        if (onClose) onClose();
      } else {
        throw new Error("Unexpected response status: " + response?.status);
      }
    } catch (err) {
      console.error("Update project failed", err);
      console.error("Error response:", err.response);
      console.error("Error response data:", err.response?.data);
      console.error("Error response status:", err.response?.status);
      
      if (err.response?.status === 500) {
        const confirmRefresh = window.confirm(
          "There was a server error, but the project may have been updated. Would you like to refresh the page to check?"
        );
        if (confirmRefresh) {
          window.location.reload();
        }
      } else if (err.response?.status === 400) {
        // Show validation errors
        const validationErrors = err.response?.data?.errors;
        if (validationErrors) {
          console.error("Validation errors:", validationErrors);
          const errorMessages = Object.entries(validationErrors)
            .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
            .join('\n');
          alert(`Validation errors:\n${errorMessages}`);
        } else {
          alert(err.response?.data?.title || "Validation failed. Please check all required fields.");
        }
      }
      
      const errorMsg = err.response?.data?.message || err.response?.data?.title || err.message || "Failed to update project";
      setErrors(prev => ({ ...prev, server: errorMsg }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div
        className="relative bg-white rounded-lg border-2 border-black shadow-[8px_8px_0_rgba(0,0,0,0.9)] w-full max-w-xl max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between p-6 sticky top-0 bg-white border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold">Update Project</h2>
            <p className="text-sm text-gray-500">Edit project details</p>
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
          {/* Debug Info - Remove in production */}
          <div className="mb-4 p-3 bg-gray-100 rounded text-xs">
            <strong>Debug Info:</strong>
            <div>Form State: {JSON.stringify({
              projectName: form.projectName,
              projectDescription: form.projectDescription,
              startDate: form.projectStartDate,
              endDate: form.projectEndDate
            })}</div>
            <div>Loading: {isLoading ? 'Yes' : 'No'}</div>
          </div>

          <label className="block mb-3">
            <span className="text-sm font-medium">Title</span>
            <input
              name="projectName"
              value={form.projectName}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border px-3 py-2 focus:outline-none ${
                errors.projectName ? "border-red-500" : "border-gray-300"
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
              className={`mt-1 block w-full rounded-md border px-3 py-2 focus:outline-none ${
                errors.projectDescription ? "border-red-500" : "border-gray-300"
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
                className={`mt-1 block w-full rounded-md border px-3 py-2 focus:outline-none ${
                  errors.projectStartDate ? "border-red-500" : "border-gray-300"
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
                className={`mt-1 block w-full rounded-md border px-3 py-2 focus:outline-none ${
                  errors.projectEndDate ? "border-red-500" : "border-gray-300"
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

          {/* Team Members */}
          <label className="block mb-4">
            <span className="text-sm font-medium">Team Members</span>
            <div className="relative mt-1">
              <input
                type="text"
                value={userInput}
                onChange={handleUserInputChange}
                placeholder="Type @ to search and add team members..."
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
            
            {/* Selected Team Members */}
            {form.teamMembers && form.teamMembers.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {form.teamMembers.map((member, index) => {
                  console.log('Rendering team member:', member);
                  return (
                    <div
                      key={member.userId || index}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                    >
                      <span>{member.userName || member.name || 'Unknown User'}</span>
                      <button
                        type="button"
                        onClick={() => removeTeamMember(member.userId)}
                        className="hover:text-blue-900 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="mt-3 text-sm text-gray-500">
                No team members assigned yet. Type @ to search and add members.
              </div>
            )}
          </label>

          {errors.server && <p className="text-sm text-red-600 mb-3">{errors.server}</p>}

          <div className="flex items-center justify-between gap-3">
            <div>
              <button
                type="submit"
                disabled={isLoading}
                style={{ cursor: isLoading ? 'not-allowed' : 'pointer' }}
                className={`px-6 py-2 rounded-md font-medium shadow-sm ${
                  isLoading 
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                    : 'bg-black text-white hover:bg-gray-800'
                }`}
              >
                {isLoading ? 'Loading...' : 'Update'}
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