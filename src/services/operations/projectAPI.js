import { projectAPI } from "../apis";
import { apiConnector } from "../apiConnector";

const {
    CREATE_PROJECT,
    GET_ALL_PROJECTS,
    GET_PROJECT_BY_ID,
    UPDATE_PROJECT,
    DELETE_PROJECT,
    ATTACH_FILE_TO_PROJECT,
    DETACH_FILE_FROM_PROJECT,
    ADD_USER_TO_PROJECT,
    REMOVE_USER_FROM_PROJECT,
    GET_ALL_USERS_IN_PROJECT,
    GET_ALL_PROJECTS_FOR_USER
} = projectAPI;

export function createProject({formData, token}) {
    return async () => {
        try {
            console.log("CREATE_PROJECT_API_CALL", CREATE_PROJECT);
            console.log("FormData check:", formData instanceof FormData);
            console.log("Token present:", !!token);
            
            // Log FormData contents
            if (formData instanceof FormData) {
                console.log("FormData entries:");
                for (let pair of formData.entries()) {
                    console.log(pair[0] + ':', pair[1]);
                }
            }
            
            // Make the API call
            const response = await apiConnector(
                "POST", 
                CREATE_PROJECT, 
                formData, 
                { 
                    Authorization: `Bearer ${token}`
                }
            );
            
            console.log("CREATE PROJECT API CALL RESPONSE", response);
            return response;
        } catch (error) {
            console.error("Error creating project:", error);
            console.error("Error details:", error.response?.data);
            throw error;
        }
    };
}

export function getProjects({token}) {
    return async () => {
        try {
            const response = await apiConnector(
                "GET", 
                GET_ALL_PROJECTS,
                null,
                { Authorization: `Bearer ${token}` }
            );
            return response;
        } catch (error) {
            console.error("Error fetching projects:", error);
            throw error;
        }
    };
}

export function getProjectById({projectId, token}) {
    return async () => {
        try {
            console.log("GET_PROJECT_BY_ID", GET_PROJECT_BY_ID(projectId));
            const response = await apiConnector(
                "GET", 
                GET_PROJECT_BY_ID(projectId),
                null,
                { Authorization: `Bearer ${token}` }
            );
            console.log("Project details response:", response);
            if(response.status !== 200){
                throw new Error(response.data.message || "Failed to fetch project details");
            }
            return response;
        } catch (error) {
            console.error("Error fetching project by ID:", error);
            return false;
        }
    };
}

export function updateProject({id, projectName, projectDescription, projectStartDate, projectEndDate, token}) {
    return async () => {
        try {
            console.log("UPDATE_PROJECT_API_CALL", UPDATE_PROJECT(id));
            console.log("Update data:", { projectName, projectDescription, projectStartDate, projectEndDate });
            
            const response = await apiConnector(
                "PUT", 
                UPDATE_PROJECT(id), 
                {    
                    projectName,
                    projectDescription,
                    projectStartDate,
                    projectEndDate
                },
                { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            );
            
            console.log("UPDATE PROJECT API CALL RESPONSE", response);
            return response;
        }
        catch (error) {
            console.error("Error updating project:", error);
            console.error("Error details:", error.response?.data);
            throw error;
        }
    };
}

export function deleteProject({id, token}) {
    return async () => {
        try {
            const response = await apiConnector(
                "DELETE", 
                DELETE_PROJECT(id),
                null,
                { Authorization: `Bearer ${token}` }
            );
            return response;
        } catch (error) {
            console.error("Error deleting project:", error);
            throw error;
        }
    };
}

export function attachFileToProject({projectId, fileId, token}) {
    return async () => {
        try {
            const response = await apiConnector(
                "POST", 
                ATTACH_FILE_TO_PROJECT(projectId, fileId),
                null,
                { Authorization: `Bearer ${token}` }
            );
            return response;
        }
        catch (error) {
            console.error("Error attaching file to project:", error);
            throw error;
        }
    }
}

export function detachFileFromProject({projectId, fileId, token}) {
    return async () => {
        try {
            const response = await apiConnector(
                "DELETE", 
                DETACH_FILE_FROM_PROJECT(projectId, fileId),
                null,
                { Authorization: `Bearer ${token}` }
            );
            return response;
        }
        catch (error) {
            console.error("Error detaching file from project:", error);
            throw error;
        }
    }
}

export function addUserToProject({userId, projectId, token}) {
    return async () => {
        try {
            const response = await apiConnector(
                "POST", 
                ADD_USER_TO_PROJECT(userId, projectId),
                null,
                { Authorization: `Bearer ${token}` }
            );
            return response;
        }
        catch (error) {
            console.error("Error adding user to project:", error);
            throw error;
        }
    }
}

export function removeUserFromProject({userId, projectId, token}) {
    return async () => {
        try {
            const response = await apiConnector(
                "DELETE", 
                REMOVE_USER_FROM_PROJECT(userId, projectId),
                null,
                { Authorization: `Bearer ${token}` }
            );
            return response;
        }
        catch (error) {
            console.error("Error removing user from project:", error);
            throw error;
        }
    }
}

export function getAllUsersInProject({projectId, token}) {
    return async () => {
        try {
            const response = await apiConnector(
                "GET", 
                GET_ALL_USERS_IN_PROJECT(projectId),
                null,
                { Authorization: `Bearer ${token}` }
            );
            return response;
        }
        catch (error) {
            console.error("Error fetching all users in project:", error);
            throw error;
        }
    }
}   

export function getAllProjectsForUser({userId, token}) {
    return async () => {
        try {
            console.log("GET_ALL_PROJECTS_FOR_USER", GET_ALL_PROJECTS_FOR_USER(userId));
            const response = await apiConnector(
                "GET", 
                GET_ALL_PROJECTS_FOR_USER(userId),
                null,
                { Authorization: `Bearer ${token}` }
            );
            console.log("All projects for user response:", response);
            return response;
        }
        catch (error) {
            console.error("Error fetching all projects for user:", error);
            throw error;
        }
    }
}