import KanbanBoard from './Kanban';
import GanttChart from '../../core/project/Gantt';
import React from 'react';
import TaskModal from './TaskModal';
import UpdateProjectModal from './UpdateProjectModal';
import DeleteProjectConfirmation from './DeleteProjectConfirmation';
import { useSelector } from 'react-redux';
import { createTask } from '../../../services/operations/taskAPI';
import { updateProject, deleteProject } from '../../../services/operations/projectAPI';
import { FileOutput } from 'lucide-react';
import FileViewer from './FileViewer';

const ProjectDescription = ({ project, onClose }) =>
{
  // getting data from store 
  console.log("selected project: " + JSON.stringify(project));
  const { userData, token, userRole } = useSelector((state) => state.auth || {});

  // getting tasks 
  const [tasks, setTasks] = React.useState(project?.tasks || []);
  const [updatedProject, setUpdatedProject] = React.useState(project);

  // modals
  const [isTaskModalOpen, setIsTaskModalOpen] = React.useState(false);
  const [isUpdateProjectModalOpen, setIsUpdateProjectModalOpen] = React.useState(false);
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = React.useState(false);
  const [isFileViewerOpen, setIsFileViewerOpen] = React.useState(false);

  const [availableUsers] = React.useState([
    {
      userId: userData?.userId,
      userName: `${userData?.firstName} ${userData?.lastName}`,
      userEmail: userData?.email
    }
  ]);

  if (!project) return null;

  const formatDate = (date) =>
    date ? new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "N/A";

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

  const handleUpdateProject = async (payload, dto) =>
  {
    try
    {
      await updateProject(project.projectId, dto)();
      setUpdatedProject((prev) => ({
        ...prev,
        ...dto
      }));
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
      await deleteProject(project.projectId)();
      onClose && onClose();
    } catch (err)
    {
      console.error("Failed to delete project", err);
    }
  };

  return (
    <div className="flex items-center justify-center z-50 p-4">
      <div className="mx-16 bg-white rounded-lg shadow-xl w-full max-h-[90vh]">

        {/* Header */}
        <div className="sticky top-0 bg-gray-900 text-white p-6 flex justify-between rounded-lg">
          <h2 className="text-3xl font-bold">{updatedProject.projectName}</h2>

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

            <button onClick={onClose} className="text-white text-2xl">×</button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6 overflow-y-auto max-h-[65vh]">

          {/* Description */}
          <div className="flex justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Description</h3>
              <p className="text-gray-700">{updatedProject.projectDescription}</p>
            </div>

            {updatedProject.fileId && (
              <button onClick={() => setIsFileViewerOpen(true)} className="flex items-center text-blue-600 underline">
                <FileOutput className="w-5 h-5" /> View Document
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Start Date</p>
              <p className="text-lg text-gray-800 font-semibold">{formatDate(updatedProject.projectStartDate)}</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">End Date</p>
              <p className="text-lg text-gray-800 font-semibold">{formatDate(updatedProject.projectEndDate)}</p>
            </div>
          </div>

          {/* Kanban & Gantt */}
          <KanbanBoard tasks={project.tasks} />
          <GanttChart tasks={project.tasks} />

          <button
            onClick={() => setIsTaskModalOpen(true)}
            className="bg-black text-white px-6 py-2 rounded"
          >
            + Create Task
          </button>

        </div>
      </div>

      {isTaskModalOpen && (
        <TaskModal
          isOpen={isTaskModalOpen}
          onClose={() => setIsTaskModalOpen(false)}
          onCreateTask={handleCreateTask}
          projectId={project.projectId}
          availableUsers={availableUsers}
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
          fileId={updatedProject.fileId}
        />
      )}
    </div>
  );
};

export default ProjectDescription;
