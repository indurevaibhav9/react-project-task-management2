import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { apiConnector } from "../../../services/apiConnector";
import { projectAPI } from "../../../services/apis";

const GET_PROJECTS_BY_USER = projectAPI.GET_ALL_PROJECTS_FOR_USER;

export default function ActivityLogs()
{
  const { userData, token } = useSelector((state) => state.auth || {});

  const [activities, setActivities] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");

  const [loading, setLoading] = useState(false);

  // GET activities by user
  const fetchUserActivities = async () =>
  {
    setLoading(true);
    try
    {
      const res = await apiConnector(
        "GET",
        `https://localhost:7228/api/Activity/user/${userData.userId}`,
        null,
        { Authorization: `Bearer ${token}` }
      );

      setActivities(res.data || []);
    } catch (err)
    {
      console.log("Error fetching user logs", err);
    }
    setLoading(false);
  };

  // GET all projects for dropdown
  const fetchProjects = async () =>
  {
    try
    {
      const res = await apiConnector(
        "GET",
        GET_PROJECTS_BY_USER(userData.userId),
        null,
        { Authorization: `Bearer ${token}` }
      );
      setProjects(res.data || []);
    } catch (err)
    {
      console.log("Project load error", err);
    }
  };

  // GET logs by selected project
  const fetchProjectActivities = async (projectId) =>
  {
    setLoading(true);
    try
    {
      const res = await apiConnector(
        "GET",
        `https://localhost:7228/api/Activity/project/${projectId}/activities`,
        null,
        { Authorization: `Bearer ${token}` }
      );

      setActivities(res.data || []);
    } catch (err)
    {
      console.log("Error fetching project logs", err);
    }
    setLoading(false);
  };

  useEffect(() =>
  {
    if (!userData?.userId) return;
    fetchProjects();
    fetchUserActivities(); // default show ALL user activity
  }, [userData?.userId]);

  const handleProjectChange = (e) =>
  {
    const projectId = e.target.value;
    setSelectedProjectId(projectId);

    if (projectId === "")
    {
      fetchUserActivities();
    } else
    {
      fetchProjectActivities(projectId);
    }
  };

  const entityTypeNormalizer = (type) =>
  {
    switch (type)
    {
      case 0:
        return "Project";
      case 1:
        return "Task";
      case 3: 
        return "Comment";
      default:
        return type;
    }
  }
  return (
    <div className="p-6 bg-white m-4 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Activity Logs</h2>

      {/* PROJECT FILTER */}
      <div className="mb-6">
        <label className="block text-gray-700 font-medium mb-2">
          Filter by Project
        </label>
        <select
          value={selectedProjectId}
          onChange={handleProjectChange}
          className="border p-2 rounded w-full"
        >
          <option value="">All Activities</option>
          {projects.map((p) => (
            <option key={p.projectId} value={p.projectId}>
              {p.projectName}
            </option>
          ))}
        </select>
      </div>

      {/* Logs Loader */}
      {loading ? (
        <p className="text-gray-600 italic">Loading activity logs...</p>
      ) : activities.length === 0 ? (
        <p className="text-gray-600 italic">No activity logs found</p>
      ) : (
        <div className="space-y-4">
          {activities.map((act) => (
            <div
              key={act.activityId}
              className="p-4 border rounded-lg bg-gray-50 shadow-sm"
            >
              <p className="font-semibold text-gray-800">
                {act.activityDescription}
              </p>

              <p className="text-gray-600 text-sm mt-1">
                <strong>Project ID:</strong> {act.projectId}
              </p>

              <p className="text-gray-600 text-sm">
                <strong>Entity Type:</strong> {entityTypeNormalizer(act.activityEntityType)}
              </p>

              <p className="text-gray-600 text-sm">
                <strong>Entity ID:</strong> {act.activityEntityId}
              </p>

              <p className="text-gray-400 text-xs mt-2">
                {new Date(act.activityCreatedAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
