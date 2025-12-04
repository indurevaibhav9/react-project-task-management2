import { taskAPI } from "../apis";
import { apiConnector } from "../apiConnector";

const {
    CREATE_TASK,
    GET_TASK_BY_ID,
    UPDATE_TASK,
    DELETE_TASK,
    GET_ALL_TASKS_FOR_PROJECT,
    UPDATE_TASK_STATUS,
    ATTACH_USER_TO_TASK,
    DETACH_USER_FROM_TASK,
    ATTACH_FILE_TO_TASK,
    DETACH_FILE_FROM_TASK,
    GET_ALL_TASKS_ASSIGNED_TO_USER,
    UPDATE_TASKS_STATUS
} = taskAPI;

export function createTask({ payload, token })
{
    return async () =>
    {
        try
        {
            console.log("CREATE_TASK_API_CALL", CREATE_TASK);
            console.log("Payload type:", payload instanceof FormData ? "FormData" : typeof payload);
            console.log("data in api fun: " + JSON.stringify(payload));

            let response;

            // If payload is FormData, send it directly
            if (payload instanceof FormData)
            {
                console.log("Sending FormData to create task");

                // Log FormData contents
                console.log("FormData entries:");
                for (let pair of payload.entries())
                {
                    console.log(pair[0] + ':', pair[1]);
                }

                response = await apiConnector(
                    "POST",
                    CREATE_TASK,
                    payload,
                    {
                        Authorization: `Bearer ${token}`
                    }
                );
            } else
            {
                // Send as JSON
                console.log("Sending JSON to create task:", payload);

                const body = {
                    projectId: payload.projectId,
                    taskTitle: payload.taskTitle,
                    taskDescription: payload.taskDescription,
                    taskPriority: payload.taskPriority,
                    taskDueDate: payload.taskDueDate,
                    taskStatus: payload.taskStatus ?? 0, // Default: Todo
                    assignedUsers: payload.assignedUsers || []
                };

                response = await apiConnector(
                    "POST",
                    CREATE_TASK,
                    body,
                    {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                );
            }

            console.log("CREATE TASK API CALL RESPONSE", response);
            return response;
        } catch (error)
        {
            console.error("Error creating task:", error);
            console.error("Error details:", error.response?.data);
            throw error;
        }
    };
}

export function getTaskById({ taskId, token })
{
    return async () =>
    {
        try
        {
            console.log("GET_TASK_BY_ID", GET_TASK_BY_ID(taskId));
            const response = await apiConnector(
                "GET",
                GET_TASK_BY_ID(taskId),
                null,
                { Authorization: `Bearer ${token}` }
            );
            console.log("Task details response:", response);
            if (response.status !== 200)
            {
                throw new Error(response.data.message || "Failed to fetch task details");
            }
            return response;
        } catch (error)
        {
            console.error("Error fetching task by ID:", error);
            return false;
        }
    };
}

export function updateTask({ taskId, payload, token })
{
    return async () =>
    {
        try
        {
            console.log("UPDATE_TASK", UPDATE_TASK(taskId));
            const response = await apiConnector(
                "PUT",
                UPDATE_TASK(taskId),
                payload,
                { Authorization: `Bearer ${token}` }
            );
            console.log("Update task response:", response);
            return response;
        } catch (error)
        {
            console.error("Error updating task:", error);
            throw error;
        }
    };
}

export function deleteTask({ taskId, token })
{
    return async () =>
    {
        try
        {
            console.log("DELETE_TASK", DELETE_TASK(taskId));
            const response = await apiConnector(
                "DELETE",
                DELETE_TASK(taskId),
                null,
                { Authorization: `Bearer ${token}` }
            );
            console.log("Delete task response:", response);
            return response;
        } catch (error)
        {
            console.error("Error deleting task:", error);
            throw error;
        }
    };
}

export function getAllTasksForProject({ projectId, token })
{
    return async () =>
    {
        try
        {
            console.log("GET_ALL_TASKS_FOR_PROJECT", GET_ALL_TASKS_FOR_PROJECT);
            const response = await apiConnector(
                "GET",
                GET_ALL_TASKS_FOR_PROJECT,
                null,
                { Authorization: `Bearer ${token}` },
                { projectId } // Query params
            );
            console.log("All tasks for project response:", response);
            return response;
        } catch (error)
        {
            console.error("Error fetching tasks for project:", error);
            throw error;
        }
    };
}

export function updateTaskStatus({ taskId, status, token })
{
    return async () =>
    {
        try
        {
            console.log("UPDATE_TASK_STATUS", UPDATE_TASK_STATUS(taskId, status));
            const response = await apiConnector(
                "PUT",
                UPDATE_TASK_STATUS(taskId, status),
                null,
                { Authorization: `Bearer ${token}` }
            );
            console.log("Update task status response:", response);
            return response;
        } catch (error)
        {
            console.error("Error updating task status:", error);
            return false;
        }
    };
}

export function updateTasksStatus({ body, token })
{
    return async () =>
    {
        try
        {
            console.log("UPDATE_TASKS_STATUS", UPDATE_TASKS_STATUS);
            const response = await apiConnector(
                "POST",
                UPDATE_TASKS_STATUS,
                body,
                { Authorization: `Bearer ${token}` }
            );
            console.log("Update tasks status response:", response);
            if (response.status !== 200)
            {
                throw new Error(response.data.message || "Failed to update task status");
            }
            return response;
        } catch (error)
        {
            console.error("Error updating tasks status:", error);
            return false;
        }
    };
}

export function getAllTasksForUser({ userId, token })
{
    return async () =>
    {
        try
        {
            console.log("GET_ALL_TASKS_ASSIGNED_TO_USER", GET_ALL_TASKS_ASSIGNED_TO_USER(userId));
            const response = await apiConnector(
                "GET",
                GET_ALL_TASKS_ASSIGNED_TO_USER(userId),
                null,
                { Authorization: `Bearer ${token}` }
            );
            console.log("All tasks for user response:", response);
            if (response.status !== 200)
            {
                throw new Error(response.data.message || "Failed to fetch tasks for user");
            }
            return response;
        } catch (error)
        {
            console.error("Error fetching tasks for user:", error);
            return false;
        }
    };
}

export function attachUserToTask({ taskId, userId, token })
{
    return async () =>
    {
        try
        {
            console.log("ATTACH_USER_TO_TASK", ATTACH_USER_TO_TASK(taskId, userId));
            const response = await apiConnector(
                "POST",
                ATTACH_USER_TO_TASK(taskId, userId),
                null,
                { Authorization: `Bearer ${token}` }
            );
            return response;
        } catch (error)
        {
            console.error("Error attaching user to task:", error);
            throw error;
        }
    };
}

export function detachUserFromTask({ taskId, token })
{
    return async () =>
    {
        try
        {
            console.log("DETACH_USER_FROM_TASK", DETACH_USER_FROM_TASK(taskId));
            const response = await apiConnector(
                "DELETE",
                DETACH_USER_FROM_TASK(taskId),
                null,
                { Authorization: `Bearer ${token}` }
            );
            return response;
        } catch (error)
        {
            console.error("Error detaching user from task:", error);
            throw error;
        }
    };
}

export function attachFileToTask({ taskId, fileId, token })
{
    return async () =>
    {
        try
        {
            console.log("ATTACH_FILE_TO_TASK", ATTACH_FILE_TO_TASK(taskId, fileId));
            const response = await apiConnector(
                "POST",
                ATTACH_FILE_TO_TASK(taskId, fileId),
                null,
                { Authorization: `Bearer ${token}` }
            );
            return response;
        } catch (error)
        {
            console.error("Error attaching file to task:", error);
            throw error;
        }
    };
}

export function detachFileFromTask({ taskId, token })
{
    return async () =>
    {
        try
        {
            console.log("DETACH_FILE_FROM_TASK", DETACH_FILE_FROM_TASK(taskId));
            const response = await apiConnector(
                "DELETE",
                DETACH_FILE_FROM_TASK(taskId),
                null,
                { Authorization: `Bearer ${token}` }
            );
            return response;
        } catch (error)
        {
            console.error("Error detaching file from task:", error);
            throw error;
        }
    };
}