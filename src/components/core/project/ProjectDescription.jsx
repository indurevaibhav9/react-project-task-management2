// ProjectDescription.jsx
import KanbanBoard from "./Kanban";
import GanttChart from "../../core/project/Gantt";
import React, { useEffect } from "react";
import TaskModal from "./TaskModal";
import UpdateProjectModal from "./UpdateProjectModal";
import DeleteProjectConfirmation from "./DeleteProjectConfirmation";
import { useSelector } from "react-redux";
import { createTask } from "../../../services/operations/taskAPI";
import { updateProject, deleteProject } from "../../../services/operations/projectAPI";
import { FileOutput } from "lucide-react";
import FileViewer from "./FileViewer";

const ProjectDescription = ({ project, onClose }) =>
{
  const { userData, token, userRole } = useSelector((state) => state.auth || {});

  const [tasks, setTasks] = React.useState(project?.tasks || []);
  const [updatedProject, setUpdatedProject] = React.useState(project);

  const [isTaskModalOpen, setIsTaskModalOpen] = React.useState(false);
  const [isUpdateProjectModalOpen, setIsUpdateProjectModalOpen] = React.useState(false);
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = React.useState(false);
  const [isFileViewerOpen, setIsFileViewerOpen] = React.useState(false);

  const [teamMembers, setTeamMembers] = React.useState(project?.teamMembers || []);
  const [addUserId, setAddUserId] = React.useState("");

  const fileInputRef = React.useRef(null);

  React.useEffect(() =>
  {
    setTasks(project?.tasks || []);
    setUpdatedProject(project);
    setTeamMembers(project?.teamMembers || []);
  }, [project]);

  const fetchProjectDetails = async () =>
  {
    try
    {
      const res = await fetch(`https://localhost:7228/api/project/${project.projectId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) throw new Error("Failed to fetch project");
      console.log("fetchProjectDetails response:", JSON.stringify(res));
      const data = await res.json();
      setUpdatedProject(data);
      setTasks(data.tasks || []);

      if (Array.isArray(data.userProjects))
      {
        setTeamMembers(
          data.userProjects.map((up) => ({
            userId: up.userId ?? up.user?.userId ?? up.id,
            userName:
              up.user?.userName ??
              up.userName ??
              `${up.user?.firstName ?? ""} ${up.user?.lastName ?? ""}`.trim(),
            userEmail: up.user?.userEmail ?? up.userEmail ?? ""
          }))
        );
      } else if (Array.isArray(data.users))
      {
        setTeamMembers(
          data.users.map((u) => ({
            userId: u.userId ?? u.id,
            userName: u.userName ?? u.name ?? `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim(),
            userEmail: u.userEmail ?? u.email ?? ""
          }))
        );
      } else
      {
        setTeamMembers(data.teamMembers || teamMembers);
      }
    } catch (err)
    {
      console.error("fetchProjectDetails error", err);
    }
    console.log("teamMembers: " + JSON.stringify(teamMembers));
  };

  const handleCreateTask = async (taskData) =>
  {
    try
    {
      const response = await createTask({ payload: taskData, token })();
      setTasks((prev) => [...prev, response.data]);
    } catch (err)
    {
      console.error("Failed to create task", err);
      throw err;
    }
  };

  const handleUpdateProject = async (formDataDto) =>
  {
    try
    {
      const res = await fetch(`https://localhost:7228/api/project/${project.projectId}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formDataDto
      });

      if (!res.ok)
      {
        const txt = await res.text();
        throw new Error(`Update failed ${res.status}: ${txt}`);
      }

      const resp = await res.json();
      const updated = resp.project ?? resp.data ?? resp;

      setUpdatedProject(updated);
      await fetchProjectDetails();
      alert("Project updated successfully");
    } catch (err)
    {
      console.error("Failed to update project", err);
      throw err;
    }
  };

  const handleDeleteProject = async () =>
  {
    try
    {
      const res = await fetch(`https://localhost:7228/api/project/${project.projectId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error("Delete failed");
      onClose && onClose();
    } catch (err)
    {
      console.error("Failed to delete project", err);
    }
  };

  const handleAddUserToProject = async () =>
  {
    if (!addUserId)
    {
      alert("Enter user ID to add");
      return;
    }

    try
    {
      const res = await fetch(
        `https://localhost:7228/api/project/addUserToProject?userId=${addUserId}&projectId=${project.projectId}`,
        { method: "POST", headers: { Authorization: `Bearer ${token}` } }
      );

      if (!res.ok)
      {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to add user");
      }

      const data = await res.json();

      alert(data?.message || "User added successfully");
      setAddUserId("");

      await fetchProjectDetails();
    } catch (err)
    {
      console.error("Add user error", err);
      alert(err.message || "Something went wrong");
    }
  };


  const handleRemoveUserFromProject = async (userIdToRemove) =>
  {
    if (Number(userIdToRemove) === Number(userData?.userId))
    {
      alert("You cannot remove yourself.");
      return;
    }
    if (!window.confirm("Remove this user from project?")) return;

    try
    {
      const res = await fetch(
        `https://localhost:7228/api/project/removeUserFromProject?userId=${userIdToRemove}&projectId=${project.projectId}`,
        { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }
      );

      const data = await res.json();
      alert(data?.message || "Removed");
      await fetchProjectDetails();
    } catch (err)
    {
      console.error("Remove user error", err);
    }
  };

  const handleAttachFileClick = (e) =>
  {
    e.preventDefault();
    fileInputRef.current?.click();
  };

  const handleFileSelected = async (e) =>
  {
    const f = e.target.files?.[0];
    if (!f) return;

    try
    {
      // STEP 1: Upload file
      const fd = new FormData();
      fd.append("file", f);  // correct key

      const uploadRes = await fetch(`https://localhost:7228/api/File/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd
      });

      const uploadData = await uploadRes.json();
      const fileId = uploadData.fileId ?? uploadData.data?.fileId;
      if (!fileId) throw new Error("fileId missing");

      // STEP 2: Attach file
      const attachRes = await fetch(
        `https://localhost:7228/api/project/${project.projectId}/attach-file/${fileId}`,
        { method: "PUT", headers: { Authorization: `Bearer ${token}` } }
      );

      const attachData = await attachRes.json();
      alert(attachData?.message || "File attached");

      await fetchProjectDetails();
      console.log("project details after file attach:", JSON.stringify(updatedProject));
    } catch (err)
    {
      console.error(err);
      alert("File attach failed!");
    }

    fileInputRef.current.value = ""; // reset
  };



  //   const handleFileSelected = async (e) => {
  //   const file = e.target.files?.[0];
  //   if (!file) return;

  //   try {
  //     // 1. Upload file
  //     const fd = new FormData();
  //     fd.append("File", file);

  //     const uploadResponse = await fetch(
  //       `https://localhost:7228/api/File/upload`,
  //       {
  //         method: "POST",
  //         headers: { Authorization: `Bearer ${token}` },
  //         body: fd
  //       }
  //     );

  //     if (!uploadResponse.ok) {
  //       throw new Error("File upload failed");
  //     }

  //     const uploadData = await uploadResponse.json();
  //     const fileId = uploadData.fileId;

  //     if (!fileId) {
  //       alert("Upload succeeded but fileId missing");
  //       return;
  //     }

  //     // 2. Attach file to project
  //     const attachRes = await fetch(
  //       `https://localhost:7228/api/project/${project.projectId}/attach-file/${fileId}`,
  //       {
  //         method: "POST",
  //         headers: { Authorization: `Bearer ${token}` }
  //       }
  //     );

  //     if (!attachRes.ok) {
  //       throw new Error("File attach failed");
  //     }

  //     alert("File attached successfully");
  //     await fetchProjectDetails();
  //   } catch (err) {
  //     console.error("Attach error", err);
  //   }

  //   e.target.value = ""; // reset input
  // };


  const handleDetachFile = async () =>
  {
    if (!updatedProject.fileId) return alert("No file attached");
    if (!window.confirm("Detach file?")) return;

    try
    {
      const res = await fetch(
        `https://localhost:7228/api/project/${project.projectId}/detach-file/${updatedProject.fileId}`,
        { method: "PUT", headers: { Authorization: `Bearer ${token}` } }
      );

      if (!res.ok) throw new Error("Detach failed");
      alert("File detached");
      await fetchProjectDetails();
    } catch (err)
    {
      console.error("Detach error", err);
    }
  };
  useEffect(() =>
  {
    const fun = async () =>
    {
      await fetchProjectDetails();
    }
    fun();
  }, []);
  const openFileViewer = () => setIsFileViewerOpen(true);

  const renderTeamMembers = () =>
  {
    if (!teamMembers.length)
      return <div className="text-sm text-gray-500">No members added</div>;

    return (
      <div className="flex flex-wrap gap-2">
        {teamMembers.map((m) => (
          <div
            key={m.userId}
            className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center gap-2 text-sm"
          >
            <span>{m.userName ?? `User ${m.userId}`}</span>

            {userRole === 1 && Number(m.userId) !== Number(userData?.userId) && (
              <button
                onClick={() => handleRemoveUserFromProject(m.userId)}
                className="ml-2 text-red-600 hover:underline text-xs"
              >
                Remove
              </button>
            )}

            {Number(m.userId) === Number(userData?.userId) && (
              <span className="ml-2 text-xs text-gray-600">(you)</span>
            )}
          </div>
        ))}
      </div>
    );
  };

  if (!project) return null;

  return (
    <div className="flex items-center justify-center z-50 p-4">
      <div className="mx-16 bg-white rounded-lg shadow-xl w-full max-h-[90vh]">
        <div className="sticky top-0 bg-gray-900 text-white p-6 flex justify-between rounded-lg">
          <h2 className="text-3xl font-bold">
            {updatedProject.projectName} (ID: {updatedProject.projectId})
          </h2>

          <div className="flex gap-4">
            {userRole === 1 && (
              <>
                <button
                  onClick={() => setIsUpdateProjectModalOpen(true)}
                  className="px-4 py-1 border rounded hover:bg-gray-700"
                >
                  Edit
                </button>
                <button
                  onClick={() => setIsDeleteConfirmationOpen(true)}
                  className="px-4 py-1 border border-red-500 text-red-500 rounded hover:bg-red-100"
                >
                  Delete
                </button>
              </>
            )}

            <button onClick={onClose} className="text-white text-2xl">
              ×
            </button>
          </div>
        </div>


        <div className="p-8 space-y-6 overflow-y-auto max-h-[65vh]">
          <div className="flex justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Description</h3>
              <p className="text-gray-700">{updatedProject.projectDescription}</p>

              {/* all about team members  */}

              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-600 mb-2">Team Members</h4>
                {renderTeamMembers()}

                {userRole === 1 && (
                  <div className="mt-3 flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Enter userId"
                      value={addUserId}
                      onChange={(e) => setAddUserId(e.target.value)}
                      className="px-3 py-1 border rounded w-44"
                    />
                    <button
                      onClick={handleAddUserToProject}
                      className="px-3 py-1 bg-black text-white rounded"
                    >
                      Add
                    </button>
                  </div>
                )}
              </div>
            </div>
            {/* all about file  */}
            <div className="flex flex-col items-end">
              {updatedProject.fileId ? (
                <div className="flex flex-col items-end gap-2">
                  <button
                    onClick={openFileViewer}
                    className="flex items-center text-blue-600 underline"
                  >
                    <FileOutput className="w-5 h-5 mr-2" /> View Document
                  </button>

                  {userRole === 1 && (
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={handleAttachFileClick}
                        className="px-3 py-1 border rounded"
                      >
                        Replace
                      </button>
                      <button
                        onClick={handleDetachFile}
                        className="px-3 py-1 border rounded text-red-600"
                      >
                        Detach
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {userRole === 1 && (
                    <button
                      onClick={handleAttachFileClick}
                      className="px-3 py-1 border rounded"
                    >
                      Attach File
                    </button>
                  )}
                  <div className="text-xs text-gray-500 mt-2">No file attached</div>
                </>
              )}

              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileSelected}
              />
            </div>

          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Start Date</p>
              <p className="text-lg text-gray-800 font-semibold">
                {updatedProject.projectStartDate
                  ? new Date(updatedProject.projectStartDate).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">End Date</p>
              <p className="text-lg text-gray-800 font-semibold">
                {updatedProject.projectEndDate
                  ? new Date(updatedProject.projectEndDate).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>
          </div>

          <KanbanBoard tasksArray={tasks} setIsTaskModalOpen={setIsTaskModalOpen} />
          <GanttChart tasks={tasks} />

          <div className="flex gap-4 mt-4">
            <button
              onClick={() => setIsTaskModalOpen(true)}
              className="bg-black text-white px-6 py-2 rounded"
            >
              + Create Task
            </button>

            {userRole === 1 && (
              <button onClick={fetchProjectDetails} className="px-4 py-2 border rounded">
                Refresh
              </button>
            )}
          </div>
        </div>
      </div>

      {isTaskModalOpen && (
        <TaskModal
          isOpen={isTaskModalOpen}
          onClose={() => setIsTaskModalOpen(false)}
          onCreateTask={handleCreateTask}
          projectId={project.projectId}
          availableUsers={[
            {
              userId: userData?.userId,
              userName: `${userData?.firstName} ${userData?.lastName}`.trim(),
              userEmail: userData?.email
            }
          ]}
        />
      )}

      {isUpdateProjectModalOpen && (
        <UpdateProjectModal
          isOpen={isUpdateProjectModalOpen}
          onClose={() => setIsUpdateProjectModalOpen(false)}
          project={updatedProject}
          onUpdate={handleUpdateProject}
        />
      )}

      {isDeleteConfirmationOpen && (
        <DeleteProjectConfirmation
          isOpen={isDeleteConfirmationOpen}
          onClose={() => setIsDeleteConfirmationOpen(false)}
          onConfirm={handleDeleteProject}
        />
      )}

      {isFileViewerOpen && (
        <FileViewer
          isOpen={isFileViewerOpen}
          onClose={() => setIsFileViewerOpen(false)}
          fileId={updatedProject.file?.fileId}
          fileUrl={updatedProject.file?.fileURL}
          token={token}
        />
      )}
    </div>
  );
};

export default ProjectDescription;
