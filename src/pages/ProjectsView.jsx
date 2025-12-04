import React, { useEffect, useState } from 'react';
import { getAllProjectsForUser, getProjectById, createProject } from '../services/operations/projectAPI';
import { useSelector } from 'react-redux';
import ProjectRow from '../components/core/project/ProjectRow';
import ProjectDescription from '../components/core/project/ProjectDescription';
import Loading from '../components/Loading';
import ProjectModal from '../components/core/project/ProjectModal';
import { getAllUser } from '../services/operations/authAPI';

const ProjectsView = () =>
{
  const { userData, userRole, token } = useSelector((state) => state.auth || {});
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [selectedProjectDetails, setSelectedProjectDetails] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [availableUsers, setAvailableUsers] = useState([]);

  const onClickProject = async (projectId) =>
  {
    setSelectedProjectId(projectId);
    const projectDetails = await getProjectById({ projectId, token })();
    setSelectedProjectDetails(projectDetails.data);
  };

  const closeProjectDetails = () =>
  {
    setSelectedProjectId(null);
    setSelectedProjectDetails(null);
  };

  useEffect(() =>
  {
    const fetchProjects = async () =>
    {
      if (!userData?.userId) return;

      setLoading(true);
      setError(null);
      try
      {
        const response = await getAllProjectsForUser({ userId: userData.userId, token })();
        const projectsList = response.data || [];
        setProjects(Array.isArray(projectsList) ? projectsList : []);
        const allUsers = await getAllUser({token});
        // Add logged-in user as available user
        setAvailableUsers(allUsers);
      } catch (err)
      {
        console.error("Failed to fetch projects", err);
        setError(err.message || "Failed to fetch projects");
      } finally
      {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [userData]);

  const handleCreateNewProject = (e) =>
  {
    e.preventDefault();
    setIsOpen(true);
  };

  const handleCreateProjectSubmit = async () =>
  {
    try
    {
      const response = await getAllProjectsForUser({ userId: userData.userId, token })();
      setProjects(Array.isArray(response.data) ? response.data : []);
      setIsOpen(false);
    } catch (err)
    {
      console.error("Failed to refresh project list:", err);
    }
  };


  return (
    <div className="w-full min-h-[calc(100vh-80px)] bg-linear-to-br from-slate-50 to-slate-100 p-6">
      <div className="px-20 mx-auto max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Projects</h1>

          <button
            onClick={handleCreateNewProject}
            className="px-2 py-3 border border-[#111111] bg-gray-900 text-white rounded-md hover:bg-white hover:text-gray-900 transition font-semibold cursor-pointer"
          >
            {userRole === 1 ? "Create New Project" : "Request New Project"}
          </button>
        </div>

        {isOpen && (
          <ProjectModal
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            onCreateProject={handleCreateProjectSubmit}
            availableUsers={availableUsers}
          />
        )}

        {loading && <div className="text-gray-600">Loading projects...</div>}
        {error && <div className="text-red-600">Error: {error}</div>}

        {!loading && projects.length === 0 && (
          <div className="text-gray-600">No projects found.</div>
        )}

        {!selectedProjectId &&
          projects.map((project) => (
            <ProjectRow
              key={project.projectId}
              project={project}
              onClickProject={onClickProject}
            />
          ))}
      </div>

      {selectedProjectId && !selectedProjectDetails && <Loading />}

      {selectedProjectId && selectedProjectDetails && (
        <ProjectDescription
          project={selectedProjectDetails}
          onClose={closeProjectDetails}
        />
      )}
    </div>
  );
};

export default ProjectsView;