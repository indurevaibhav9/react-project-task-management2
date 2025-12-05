import React, { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { useSelector } from "react-redux";
import { getAllUser } from "../../../services/operations/authAPI";
import { apiConnector } from "../../../services/apiConnector";
import { projectAPI } from "../../../services/apis";

const { UPDATE_PROJECT } = projectAPI;

export default function UpdateProjectModal({ isOpen, onClose, onUpdateProject, project })
{
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

  // Fetch all users & set project data
  useEffect(() =>
  {
    if (!isOpen) return;

    (async () =>
    {
      try
      {
        const usersResp = await getAllUser({ token })();
        const raw = usersResp?.data || usersResp || [];

        const normalized = raw.map(u => ({
          userId: u.userId ?? u.id ?? u._id,
          userName: u.userName ?? u.name ?? `${u.firstName || ""} ${u.lastName || ""}`,
          userEmail: u.userEmail ?? u.email ?? ""
        }));

        setAllUsers(normalized);

        if (project)
        {
          const formatDate = (d) => (d ? new Date(d).toISOString().split("T")[0] : "");

          const mappedTeam = (project.teamMembers || []).map(m =>
          {
            const found = normalized.find(u => String(u.userId) === String(m.userId));
            return found || {
              userId: m.userId,
              userName: m.userName,
              userEmail: m.userEmail
            };
          });

          setForm({
            projectName: project.projectName || "",
            projectDescription: project.projectDescription || "",
            projectStartDate: formatDate(project.projectStartDate),
            projectEndDate: formatDate(project.projectEndDate),
            file: null,
            teamMembers: mappedTeam
          });
        }
      } catch (e)
      {
        console.log("Error fetching users", e);
      }
    })();

    return () =>
    {
      setErrors({});
      setFilePreview(null);
      setUserInput("");
      setFilteredUsers([]);
    };
  }, [isOpen]);

  // Input handler
  const handleChange = (e) =>
  {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: null });
  };

  // File handler
  const handleFileChange = (e) =>
  {
    const file = e.target.files[0];
    setForm({ ...form, file });

    if (file && file.type.startsWith("image/"))
    {
      const url = URL.createObjectURL(file);
      setFilePreview(url);
    } else
    {
      setFilePreview(null);
    }
  };

  // Search team members
  const handleUserInputChange = (e) =>
  {
    const value = e.target.value;
    setUserInput(value);

    if (!value.includes("@")) return setFilteredUsers([]);

    const query = value.split("@").pop().toLowerCase();
    const matches = allUsers.filter(
      u =>
        !form.teamMembers.some(m => String(m.userId) === String(u.userId)) &&
        (u.userName.toLowerCase().includes(query) ||
          u.userEmail.toLowerCase().includes(query))
    );

    setFilteredUsers(matches);
  };

  const addTeamMember = (user) =>
  {
    setForm({ ...form, teamMembers: [...form.teamMembers, user] });
    setUserInput("");
    setFilteredUsers([]);
  };

  const removeTeamMember = (id) =>
  {
    setForm({
      ...form,
      teamMembers: form.teamMembers.filter(m => m.userId !== id)
    });
  };

  // Validation
  const validate = () =>
  {
    const e = {};
    if (!form.projectName.trim()) e.projectName = "Title required";
    if (!form.projectDescription.trim()) e.projectDescription = "Description required";
    if (!form.projectStartDate) e.projectStartDate = "Start date required";
    if (!form.projectEndDate) e.projectEndDate = "End date required";
    if (form.projectStartDate > form.projectEndDate) e.projectEndDate = "End date must be after start";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // Submit
  const handleSubmit = async (e) =>
  {
    e.preventDefault();
    if (!validate()) return;

    const fd = new FormData();
    fd.append("projectName", form.projectName);
    fd.append("projectDescription", form.projectDescription);
    fd.append("projectStartDate", form.projectStartDate);
    fd.append("projectEndDate", form.projectEndDate);

    // MUST match backend name: formfile
    if (form.file) fd.append("formfile", form.file);

    // MUST match backend name: UserIds
    form.teamMembers.forEach((m, idx) =>
    {
      fd.append(`UserIds[${idx}]`, m.userId);
    });

    try
    {
      const response = await apiConnector(
        "PUT",
        UPDATE_PROJECT(project.projectId),
        fd,
        {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      );

      if (onUpdateProject) onUpdateProject(response.data);
      onClose();
    } catch (err)
    {
      console.log("Update failed", err);
      alert(err.response?.data?.message || "Failed to update project");
    }
  };


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg w-full max-w-xl p-6 shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Update Project</h2>
          <button onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <label className="block mb-3">
            Title
            <input
              name="projectName"
              value={form.projectName}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
            {errors.projectName && <p className="text-red-500 text-sm">{errors.projectName}</p>}
          </label>

          <label className="block mb-3">
            Description
            <textarea
              name="projectDescription"
              value={form.projectDescription}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
            {errors.projectDescription && <p className="text-red-500 text-sm">{errors.projectDescription}</p>}
          </label>

          <div className="grid grid-cols-2 gap-4 mb-3">
            <label>
              Start Date
              <input
                type="date"
                name="projectStartDate"
                value={form.projectStartDate}
                onChange={handleChange}
                className="w-full border p-2 rounded"
              />
            </label>

            <label>
              End Date
              <input
                type="date"
                name="projectEndDate"
                value={form.projectEndDate}
                onChange={handleChange}
                className="w-full border p-2 rounded"
              />
            </label>
          </div>

          <label className="block mb-3">
            Attachment
            <input type="file" accept="image/*,application/pdf" onChange={handleFileChange} />
            {filePreview && <img src={filePreview} className="mt-2 max-h-40 rounded" />}
          </label>

          <label className="block mb-3">
            Team Members
            <input
              value={userInput}
              onChange={handleUserInputChange}
              placeholder="Type @ to search"
              className="w-full border p-2 rounded"
            /> 

           {filteredUsers.length > 0 && (
              <div className="border rounded mt-1 bg-white shadow">
                {filteredUsers.map(u => (
                  <div
                    key={u.userId}
                    className="p-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => addTeamMember(u)}
                  >
                    {u.userName} ({u.userEmail})
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-wrap gap-2 mt-3">
              {form.teamMembers.map(m => (
                <div key={m.userId} className="bg-blue-100 px-3 py-1 rounded-full flex items-center gap-2">
                  {m.userName}
                  <X onClick={() => removeTeamMember(m.userId)} className="cursor-pointer" />
                </div>
              ))}
            </div> 
          </label>

          <button type="submit" className="bg-black text-white px-6 py-2 rounded">
            Update
          </button>
        </form>
      </div>
    </div>
  );
}
